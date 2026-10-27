// app/actions/create-order.ts
"use server";

import { z } from "zod";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";
import { brl } from "@/lib/format";

const gerarCodigo = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(80),
  itens: z
    .array(
      z.object({
        variantId: z.string(),
        qtd: z.number().int().min(1).max(20),
      })
    )
    .min(1, "Carrinho vazio")
    .max(30),
});

type Result =
  | { ok: true; codigo: string; url: string }
  | { ok: false; erro: string };

export async function createOrder(input: unknown): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0].message };
  }
  const { nome, itens } = parsed.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const variantes = await tx.variant.findMany({
        where: { id: { in: itens.map((i) => i.variantId) } },
        include: { product: true },
      });

      let total = 0;
      const orderItems = [];

      for (const item of itens) {
        const v = variantes.find((x) => x.id === item.variantId);
        if (!v || !v.product.ativo) throw new Error("Produto indisponível");

        // decremento atômico: só passa se ainda houver estoque
        const { count } = await tx.variant.updateMany({
          where: { id: v.id, estoque: { gte: item.qtd } },
          data: { estoque: { decrement: item.qtd } },
        });
        if (count === 0) {
          throw new Error(
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

      return tx.order.create({
        data: {
          codigo: gerarCodigo(),
          clienteNome: nome,
          totalCentavos: total,
          items: { create: orderItems },
        },
        include: { items: true },
      });
    });

    const linhas = order.items.map(
      (i) =>
        `${i.qtd}x ${i.nome} (${i.tamanho}, ${i.cor}) - ${brl(i.precoCentavos * i.qtd)}`
    );

    const texto = [
      `Olá! Sou ${order.clienteNome} e fiz o pedido #${order.codigo}:`,
      "",
      ...linhas,
      "",
      `Total: ${brl(order.totalCentavos)}`,
    ].join("\n");

    const numero = process.env.WHATSAPP_NUMBER;
    if (!numero) return { ok: false, erro: "WhatsApp da loja não configurado" };

    return {
      ok: true,
      codigo: order.codigo,
      url: `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`,
    };
  } catch (e) {
    return {
      ok: false,
      erro: e instanceof Error ? e.message : "Erro ao criar pedido",
    };
  }
}