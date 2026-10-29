"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteOrder(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const pedido = await prisma.order.findUnique({ where: { id } });

  // só exclui cancelados, a checagem fica no servidor
  if (!pedido || pedido.status !== "CANCELADO") return;

  await prisma.$transaction([
    // apaga os itens pela relação, sem depender do nome do model
    prisma.order.update({
      where: { id },
      data: { items: { deleteMany: {} } },
    }),
    prisma.order.delete({ where: { id } }),
  ]);

  revalidatePath("/admin");
}