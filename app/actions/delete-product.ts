"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteProduct(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const produto = await prisma.product.findUnique({
    where: { id },
    include: { variantes: { select: { id: true } } },
  });
  if (!produto) return;

  const variantIds = produto.variantes.map((v) => v.id);

  // algum pedido já usou uma variante deste produto?
  const temPedido =
    variantIds.length > 0 &&
    (await prisma.order.count({
      where: { items: { some: { variantId: { in: variantIds } } } },
    })) > 0;

  if (temPedido) {
    // preserva o histórico: só tira da loja
    await prisma.product.update({ where: { id }, data: { ativo: false } });
  } else {
    await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: { variantes: { deleteMany: {} } },
      }),
      prisma.product.delete({ where: { id } }),
    ]);
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/");
}