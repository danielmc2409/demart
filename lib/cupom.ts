import { prisma } from "@/lib/prisma";

export type ResultadoCupom =
  | { ok: true; cupomId: string; codigo: string; descontoCentavos: number }
  | { ok: false; erro: string };

export async function validarCupom(
  codigoBruto: string,
  subtotalCentavos: number
): Promise<ResultadoCupom> {
  const codigo = codigoBruto.trim().toUpperCase();
  if (!codigo) return { ok: false, erro: "Digite o código do cupom." };

  const cupom = await prisma.cupom.findUnique({ where: { codigo } });

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

  const bruto =
    cupom.tipo === "PERCENTUAL"
      ? Math.round((subtotalCentavos * cupom.valor) / 100)
      : cupom.valor;

  // o desconto nunca passa do subtotal
  const descontoCentavos = Math.min(bruto, subtotalCentavos);

  return { ok: true, cupomId: cupom.id, codigo: cupom.codigo, descontoCentavos };
}