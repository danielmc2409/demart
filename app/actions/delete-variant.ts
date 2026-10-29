"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteVariant(formData: FormData) {
  await requireAdmin();

  const variantId = String(formData.get("variantId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  if (!variantId) return;

  const usada =
    (await prisma.orderItem.count({ where: { variantId } })) > 0;

  if (usada) {
    // preserva o histórico: só tira da venda
    await prisma.variant.update({
      where: { id: variantId },
      data: { estoque: 0 },
    });
  } else {
    await prisma.variant.delete({ where: { id: variantId } });
  }

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/");
}