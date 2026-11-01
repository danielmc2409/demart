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

  await prisma.$transaction(
    async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      // pedido cancelado é final (o estoque já foi devolvido)
      if (!order || order.status === status || order.status === "CANCELADO")
        return;

      if (status !== "CANCELADO") {
        await tx.order.update({ where: { id }, data: { status } });
        return;
      }

      // trava contra duplo cancelamento (dois cliques / dois admins):
      // só quem conseguir mudar o status devolve o estoque
      const { count } = await tx.order.updateMany({
        where: { id, status: { not: "CANCELADO" } },
        data: { status: "CANCELADO" },
      });
      if (count === 0) return;

      // devolve o estoque
      for (const i of order.items) {
        await tx.variant.update({
          where: { id: i.variantId },
          data: { estoque: { increment: i.qtd } },
        });
      }
    },
    { maxWait: 10_000, timeout: 20_000 }
  );

  revalidatePath("/admin");
}