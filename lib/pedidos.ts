// lib/pedidos.ts
import { prisma } from "@/lib/prisma";

// Pedido PENDENTE há mais horas do que isto é cancelado e o estoque volta.
// ATENÇÃO: pedidos reais também ficam PENDENTE até você clicar em "Confirmar"
// no admin. Confirme os pedidos de verdade dentro desse prazo.
export const PENDENTE_HORAS = 24;

// Não chama revalidatePath de propósito: esta função também roda durante a
// renderização de páginas (home e admin), onde o Next não permite revalidar.
// Nunca lança erro: se algo falhar, só registra e segue.
export async function cancelarPendentesAntigos(): Promise<number> {
  try {
    const limite = new Date(Date.now() - PENDENTE_HORAS * 3600 * 1000);

    const antigos = await prisma.order.findMany({
      where: { status: "PENDENTE", criadoEm: { lt: limite } },
      select: { id: true },
      take: 50,
    });

    let cancelados = 0;

    for (const { id } of antigos) {
      await prisma.$transaction(
        async (tx) => {
          // mesma trava do cancelamento manual: só quem mudar o status
          // devolve o estoque (evita devolver duas vezes)
          const { count } = await tx.order.updateMany({
            where: { id, status: "PENDENTE" },
            data: { status: "CANCELADO" },
          });
          if (count === 0) return;

          const itens = await tx.orderItem.findMany({
            where: { orderId: id },
          });
          for (const i of itens) {
            await tx.variant.update({
              where: { id: i.variantId },
              data: { estoque: { increment: i.qtd } },
            });
          }
          cancelados++;
        },
        { maxWait: 10_000, timeout: 20_000 },
      );
    }

    // aproveita para apagar registros antigos do limite de tentativas
    await prisma.tentativa.deleteMany({
      where: { criadoEm: { lt: new Date(Date.now() - 24 * 3600 * 1000) } },
    });

    return cancelados;
  } catch (e) {
    console.error("Erro ao cancelar pendentes antigos:", e);
    return 0;
  }
}