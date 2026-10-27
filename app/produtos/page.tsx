// app/produtos/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { brl } from "@/lib/format";

export const dynamic = "force-dynamic"; // sempre busca estoque atualizado

export default async function Produtos() {
  const produtos = await prisma.product.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Produtos</h1>

      {produtos.length === 0 && <p>Nenhum produto disponível.</p>}

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {produtos.map((p) => (
          <li key={p.id}>
            <Link href={`/produtos/${p.slug}`} className="block">
              <div className="aspect-[3/4] rounded bg-neutral-200">
                {p.imagens[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imagens[0]}
                    alt={p.nome}
                    className="h-full w-full rounded object-cover"
                  />
                )}
              </div>
              <h2 className="mt-2 text-sm">{p.nome}</h2>
              <p className="font-medium">{brl(p.precoCentavos)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}