// app/admin/produtos/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { brl } from "@/lib/format";
import { toggleAtivo } from "@/app/actions/product-admin";

export default async function AdminProdutos() {
  await requireAdmin();

  const produtos = await prisma.product.findMany({
    orderBy: { nome: "asc" },
    include: { variantes: true },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <div className="flex gap-4 text-sm">
          <Link href="/admin" className="underline">Pedidos</Link>
          <Link href="/admin/produtos/novo" className="rounded bg-black px-3 py-1 text-white">
            Novo produto
          </Link>
        </div>
      </div>

      {produtos.length === 0 && <p>Nenhum produto cadastrado.</p>}

      <ul className="space-y-3">
        {produtos.map((p) => {
          const estoque = p.variantes.reduce((s, v) => s + v.estoque, 0);
          return (
            <li key={p.id} className="flex items-center justify-between rounded border p-4">
              <div>
                <Link href={`/admin/produtos/${p.id}`} className="font-medium underline">
                  {p.nome}
                </Link>
                <p className="text-sm text-neutral-600">
                  {brl(p.precoCentavos)} · {estoque} em estoque ·{" "}
                  {p.ativo ? "Ativo" : "Oculto"}
                </p>
              </div>
              <form action={toggleAtivo}>
                <input type="hidden" name="id" value={p.id} />
                <button className="rounded border px-3 py-1 text-sm">
                  {p.ativo ? "Ocultar" : "Ativar"}
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </main>
  );
}