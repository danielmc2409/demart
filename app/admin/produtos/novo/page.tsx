// app/admin/produtos/novo/page.tsx
import { requireAdmin } from "@/lib/auth";
import { createProduct } from "@/app/actions/product-admin";

export default async function Novo({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  await requireAdmin();
  const { erro } = await searchParams;

  const campo = "mt-1 w-full rounded border px-3 py-2";

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Novo produto</h1>

      <form action={createProduct} className="space-y-4">
        <label className="block text-sm font-medium">
          Nome
          <input name="nome" required className={campo} />
        </label>
        <label className="block text-sm font-medium">
          Descrição
          <textarea name="descricao" rows={3} className={campo} />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            Preço (R$)
            <input name="preco" required placeholder="59,90" className={campo} />
          </label>
          <label className="block text-sm font-medium">
            Categoria
            <input name="categoria" required placeholder="camisetas" className={campo} />
          </label>
        </div>
        <label className="block text-sm font-medium">
          Imagens (uma URL por linha)
          <textarea name="imagens" rows={3} className={campo} placeholder="https://..." />
        </label>
        <label className="block text-sm font-medium">
          Variantes (uma por linha: tamanho,cor,estoque)
          <textarea
            name="variantes"
            rows={5}
            required
            className={campo}
            placeholder={"P,Preto,5\nM,Preto,3\nG,Preto,0"}
          />
        </label>

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        <button className="w-full rounded bg-black py-3 text-white">Cadastrar</button>
      </form>
    </main>
  );
}