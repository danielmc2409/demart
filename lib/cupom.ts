// lib/cupom.ts
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type ResultadoCupom =
  | { ok: true; cupomId: string; codigo: string; descontoCentavos: number }
  | { ok: false; erro: string };

// 10-11 dígitos = sem código do país (inclui DDD 55); 12+ já vem com 55
export function normalizarTelefone(t: string) {
  const n = t.replace(/\D/g, "");
  return n.length <= 11 ? "55" + n : n;
}

export async function validarCupom(
  codigoBruto: string,
  subtotalCentavos: number,
  telefoneBruto?: string,
  // dentro de uma $transaction, passe o `tx`; fora dela usa o prisma normal
  db: Prisma.TransactionClient = prisma
): Promise<ResultadoCupom> {
  const codigo = codigoBruto.trim().toUpperCase();
  if (!codigo) return { ok: false, erro: "Digite o código do cupom." };

  const cupom = await db.cupom.findUnique({ where: { codigo } });

  if (!cupom || !cupom.ativo) return { ok: false, erro: "Cupom inválido." };
  if (cupom.validoAte && cupom.validoAte < new Date())
    return { ok: false, erro: "Cupom expirado." };
  if (cupom.usosMaximos !== null && cupom.usos >= cupom.usosMaximos)
    return { ok: false, erro: "Cupom esgotado." };
  if (subtotalCentavos < cupom.minimoCentavos)
    return {
      ok: false,
      erro: `Pedido mínimo de R$ ${(cupom.minimoCentavos / 100)
        .toFixed(2)
        .replace(".", ",")} para este cupom.`,
    };

  // este telefone já usou?
  if (telefoneBruto) {
    const jaUsou = await db.cupomUso.findUnique({
      where: {
        cupomId_telefone: {
          cupomId: cupom.id,
          telefone: normalizarTelefone(telefoneBruto),
        },
      },
    });
    if (jaUsou) return { ok: false, erro: "Você já usou este cupom." };
  }

  const bruto =
    cupom.tipo === "PERCENTUAL"
      ? Math.round((subtotalCentavos * cupom.valor) / 100)
      : cupom.valor;

  const descontoCentavos = Math.min(bruto, subtotalCentavos);

  return { ok: true, cupomId: cupom.id, codigo: cupom.codigo, descontoCentavos };
}