// app/admin/produtos/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  updateProduct,
  setEstoque,
  addVariant,
} from "@/app/actions/product-admin";

export default async function EditarProduto({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string; ok?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { erro, ok } = await searchParams;

  const p = await prisma.product.findUnique({
    where: { id },
    include: { variantes: { orderBy: [{ cor: "asc" }, { tamanho: "asc" }] } },
  });
  if (!p) notFound();

  const campo = "mt-1 w-full rounded border px-3 py-2";

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <Link href="/admin/produtos" className="text-sm underline">← Produtos</Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold">{p.nome}</h1>

      <form action={updateProduct} className="space-y-4">
        <input type="hidden" name="id" value={p.id} />
        <label className="block text-sm font-medium">
          Nome
          <input name="nome" defaultValue={p.nome} required className={campo} />
        </label>
        <label className="block text-sm font-medium">
          Descrição
          <textarea name="descricao" rows={3} defaultValue={p.descricao ?? ""} className={campo} />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            Preço (R$)
            <input
              name="preco"
              defaultValue={(p.precoCentavos / 100).toFixed(2).replace(".", ",")}
              required
              className={campo}
            />
          </label>
          <label className="block text-sm font-medium">
            Categoria
            <input name="categoria" defaultValue={p.categoria} required className={campo} />
          </label>
        </div>
        <label className="block text-sm font-medium">
          Imagens (uma URL por linha)
          <textarea name="imagens" rows={3} defaultValue={p.imagens.join("\n")} className={campo} />
        </label>

        {erro && <p className="text-sm text-red-600">{erro}</p>}
        {ok && <p className="text-sm text-green-700">Salvo ✓</p>}

        <button className="w-full rounded bg-black py-3 text-white">Salvar</button>
      </form>

      <h2 className="mb-3 mt-10 text-lg font-semibold">Estoque</h2>
      <ul className="space-y-2">
        {p.variantes.map((v) => (
          <li key={v.id}>
            <form action={setEstoque} className="flex items-center gap-3">
              <input type="hidden" name="variantId" value={v.id} />
              <span className="w-32 text-sm">{v.tamanho} · {v.cor}</span>
              <input
                type="number"
                name="estoque"
                min={0}
                defaultValue={v.estoque}
                className="w-20 rounded border px-2 py-1"
              />
              <button className="rounded border px-3 py-1 text-sm">Atualizar</button>
            </form>
          </li>
        ))}
      </ul>

      <h3 className="mb-2 mt-6 text-sm font-medium">Adicionar variante</h3>
      <form action={addVariant} className="flex flex-wrap gap-2">
        <input type="hidden" name="productId" value={p.id} />
        <input name="tamanho" placeholder="Tamanho" required className="w-24 rounded border px-2 py-1" />
        <input name="cor" placeholder="Cor" required className="w-28 rounded border px-2 py-1" />
        <input name="estoque" type="number" min={0} defaultValue={0} className="w-20 rounded border px-2 py-1" />
        <button className="rounded border px-3 py-1 text-sm">Adicionar</button>
      </form>
    </main>
  );
}