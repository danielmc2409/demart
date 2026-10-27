// app/actions/get-cart-details.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function getCartDetails(ids: string[]) {
  const variantes = await prisma.variant.findMany({
    where: { id: { in: ids.slice(0, 30) } },
    include: { product: true },
  });

  return variantes.map((v) => ({
    id: v.id,
    nome: v.product.nome,
    tamanho: v.tamanho,
    cor: v.cor,
    precoCentavos: v.product.precoCentavos,
    estoque: v.estoque,
    ativo: v.product.ativo,
  }));
}