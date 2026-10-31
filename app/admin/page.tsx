// app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { brl } from "@/lib/format";
import { updateOrderStatus } from "@/app/actions/update-order-status";
import { deleteOrder } from "@/app/actions/delete-order";
import { logoutAction } from "@/app/actions/admin-auth";
import { ConfirmButton } from "./confirm-button";
import Link from "next/link";
import AutoRefresh from "./auto-refresh";


const ACOES = [
  { status: "CONFIRMADO", label: "Confirmar" },
  { status: "PAGO", label: "Pago" },
  { status: "ENVIADO", label: "Enviado" },
  { status: "CANCELADO", label: "Cancelar" },
] as const;

const ROTULO_PAGAMENTO = {
  PIX: "Pix",
  CARTAO: "Cartão",
  DINHEIRO: "Dinheiro",
} as const;

export default async function Admin() {
  await requireAdmin();

  const pedidos = await prisma.order.findMany({
    orderBy: { criadoEm: "desc" },
    take: 100,
    include: { items: true },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <AutoRefresh ultimo={pedidos[0]?.criadoEm.getTime() ?? 0} />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/produtos" className="text-sm underline">
            Produtos
          </Link>
          <form action={logoutAction}>
            <button className="text-sm underline">Sair</button>
          </form>
        </div>
      </div>

      {pedidos.length === 0 && <p>Nenhum pedido ainda.</p>}

      <ul className="space-y-4">
        {pedidos.map((p) => (
          <li key={p.id} className="rounded border p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">
                  #{p.codigo} · {p.clienteNome}
                </p>
                <p className="text-sm text-neutral-500">
                  {p.criadoEm.toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{brl(p.totalCentavos)}</p>
                {p.cupomCodigo && (
                  <p className="text-sm text-green-700">
                    {p.cupomCodigo} (− {brl(p.descontoCentavos)})
                  </p>
                )}
                <p className="text-sm">{p.status}</p>
              </div>
            </div>

            <ul className="mt-3 text-sm text-neutral-700">
              {p.items.map((i) => (
                <li key={i.id}>
                  {i.qtd}x {i.nome} ({i.tamanho}, {i.cor})
                </li>
              ))}
            </ul>

            <p className="mt-2 text-sm">
              {p.entrega === "ENTREGA"
                ? `Entrega: ${p.endereco}`
                : "Retirada na loja"}
              {" · "}
              {ROTULO_PAGAMENTO[p.pagamento]}
            </p>

            {p.status !== "CANCELADO" ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {ACOES.filter((a) => a.status !== p.status).map((a) => (
                  <form key={a.status} action={updateOrderStatus}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="status" value={a.status} />
                    <button
                      className={`rounded border px-3 py-1 text-sm ${
                        a.status === "CANCELADO" ? "text-red-600" : ""
                      }`}
                    >
                      {a.label}
                    </button>
                  </form>
                ))}
              </div>
            ) : (
              <form action={deleteOrder} className="mt-3">
                <input type="hidden" name="id" value={p.id} />
                <ConfirmButton
                  message="Excluir este pedido de vez? Não dá para desfazer."
                  className="rounded border px-3 py-1 text-sm text-red-600"
                >
                  Excluir
                </ConfirmButton>
              </form>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}