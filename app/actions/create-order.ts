// app/actions/create-order.ts
"use server";

import { z } from "zod";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { brl } from "@/lib/format";
import { validarCupom, normalizarTelefone } from "@/lib/cupom";

const gerarCodigo = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

const ROTULO_PAGAMENTO = {
  PIX: "Pix",
  CARTAO: "Cartão",
  DINHEIRO: "Dinheiro",
} as const;

// só mensagens desta classe chegam ao cliente; o resto vira erro genérico
class ErroNegocio extends Error {}

const schema = z
  .object({
    nome: z.string().trim().min(2, "Informe seu nome").max(80),
    telefone: z
      .string()
      .trim()
      .refine(
        (v) => v.replace(/\D/g, "").length >= 10,
        "Informe um telefone válido com DDD"
      ),
    entrega: z.enum(["RETIRADA", "ENTREGA"]),
    endereco: z.string().trim().max(200).optional(),
    pagamento: z.enum(["PIX", "CARTAO", "DINHEIRO"]),
    cupom: z.string().trim().max(40).optional(),
    itens: z
      .array(
        z.object({
          variantId: z.string(),
          qtd: z.number().int().min(1).max(20),
        })
      )
      .min(1, "Carrinho vazio")
      .max(30),
  })
  .superRefine((v, ctx) => {
    if (v.entrega === "ENTREGA" && (v.endereco ?? "").length < 8) {
      ctx.addIssue({
        code: "custom",
        path: ["endereco"],
        message: "Informe o endereço de entrega",
      });
    }
  });

type Result =
  | { ok: true; codigo: string; url: string }
  | { ok: false; erro: string };

export async function createOrder(input: unknown): Promise<Result> {
  // confere a configuração ANTES de mexer em estoque ou cupom
  const numero = process.env.WHATSAPP_NUMBER;
  if (!numero) return { ok: false, erro: "WhatsApp da loja não configurado" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0].message };
  }
  const { nome, telefone, entrega, endereco, pagamento, itens, cupom } =
    parsed.data;
  const tel = normalizarTelefone(telefone);

  try {
    const order = await prisma.$transaction(
      async (tx) => {
        const variantes = await tx.variant.findMany({
          where: { id: { in: itens.map((i) => i.variantId) } },
          include: { product: true },
        });

        let total = 0;
        const orderItems = [];

        for (const item of itens) {
          const v = variantes.find((x) => x.id === item.variantId);
          if (!v || !v.product.ativo)
            throw new ErroNegocio("Produto indisponível");

          const { count } = await tx.variant.updateMany({
            where: { id: v.id, estoque: { gte: item.qtd } },
            data: { estoque: { decrement: item.qtd } },
          });
          if (count === 0) {
            throw new ErroNegocio(
              `Sem estoque suficiente: ${v.product.nome} (${v.tamanho}, ${v.cor})`
            );
          }

          total += v.product.precoCentavos * item.qtd;
          orderItems.push({
            variantId: v.id,
            nome: v.product.nome,
            tamanho: v.tamanho,
            cor: v.cor,
            precoCentavos: v.product.precoCentavos,
            qtd: item.qtd,
          });
        }

        let desconto = 0;
        let cupomCodigo: string | null = null;

        if (cupom) {
          // usa a mesma transação (não pede outra conexão ao pool)
          const r = await validarCupom(cupom, total, tel, tx);
          if (!r.ok) throw new ErroNegocio(r.erro);

          const c = await tx.cupom.findUniqueOrThrow({
            where: { id: r.cupomId },
          });

          // o banco recusa se este telefone já usou o cupom (P2002)
          await tx.cupomUso.create({
            data: { cupomId: r.cupomId, telefone: tel },
          });

          const { count } = await tx.cupom.updateMany({
            where: {
              id: c.id,
              ativo: true,
              ...(c.usosMaximos !== null
                ? { usos: { lt: c.usosMaximos } }
                : {}),
            },
            data: { usos: { increment: 1 } },
          });
          if (count === 0) throw new ErroNegocio("Cupom esgotado.");

          desconto = r.descontoCentavos;
          cupomCodigo = r.codigo;
        }

        return tx.order.create({
          data: {
            codigo: gerarCodigo(),
            clienteNome: nome,
            clienteTelefone: tel,
            entrega,
            endereco: entrega === "ENTREGA" ? endereco : null,
            pagamento,
            totalCentavos: total - desconto,
            cupomCodigo,
            descontoCentavos: desconto,
            items: { create: orderItems },
          },
          include: { items: true },
        });
      },
      // padrão é 5 s; com o Neon "acordando" pode estourar
      { maxWait: 10_000, timeout: 20_000 }
    );

    const linhas = order.items.map(
      (i) =>
        `${i.qtd}x ${i.nome} (${i.tamanho}, ${i.cor}) - ${brl(i.precoCentavos * i.qtd)}`
    );

    const texto = [
      `Olá! Sou ${order.clienteNome} e fiz o pedido #${order.codigo}:`,
      "",
      ...linhas,
      "",
      ...(order.cupomCodigo
        ? [
            `Subtotal: ${brl(order.totalCentavos + order.descontoCentavos)}`,
            `Cupom ${order.cupomCodigo}: - ${brl(order.descontoCentavos)}`,
          ]
        : []),
      `Total: ${brl(order.totalCentavos)}`,
      "",
      order.entrega === "ENTREGA"
        ? `Entrega no endereço: ${order.endereco}`
        : "Retirada na loja",
      `Pagamento: ${ROTULO_PAGAMENTO[order.pagamento]}`,
      `Telefone: ${order.clienteTelefone}`,
    ].join("\n");

    return {
      ok: true,
      codigo: order.codigo,
      url: `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`,
    };
  } catch (e) {
    if (e instanceof ErroNegocio) return { ok: false, erro: e.message };

    // corrida: duas requisições tentando usar o mesmo cupom com o mesmo telefone
    if (
      cupom &&
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return { ok: false, erro: "Você já usou este cupom." };
    }

    // erro inesperado: registra no servidor, não mostra detalhes ao cliente
    console.error("Erro em createOrder:", e);
    return {
      ok: false,
      erro: "Não foi possível finalizar o pedido. Tente novamente.",
    };
  }
}