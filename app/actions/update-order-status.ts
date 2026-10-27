// app/actions/update-order-status.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  id: z.string(),
  status: z.enum(["PENDENTE", "CONFIRMADO", "PAGO", "ENVIADO", "CANCELADO"]),
});

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const { id, status } = parsed.data;

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { items: true },
    });

    // pedido cancelado é final (o estoque já foi devolvido)
    if (!order || order.status === status || order.status === "CANCELADO") return;

    if (status === "CANCELADO") {
      for (const i of order.items) {
        await tx.variant.update({
          where: { id: i.variantId },
          data: { estoque: { increment: i.qtd } },
        });
      }
    }

    await tx.order.update({ where: { id }, data: { status } });
  });

  revalidatePath("/admin");
}