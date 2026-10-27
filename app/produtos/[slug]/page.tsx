// app/produtos/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { brl } from "@/lib/format";
import AddToCart from "./add-to-cart";

export const dynamic = "force-dynamic";

export default async function Produto({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const produto = await prisma.product.findUnique({
    where: { slug },
    include: { variantes: { orderBy: { tamanho: "asc" } } },
  });

  if (!produto || !produto.ativo) notFound();

  return (
    <main className="mx-auto grid max-w-4xl gap-8 px-4 py-10 md:grid-cols-2">
      <div className="aspect-[3/4] rounded bg-neutral-200">
        {produto.imagens[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={produto.imagens[0]}
            alt={produto.nome}
            className="h-full w-full rounded object-cover"
          />
        )}
      </div>

      <div>
        <h1 className="text-2xl font-semibold">{produto.nome}</h1>
        <p className="mt-2 text-xl">{brl(produto.precoCentavos)}</p>
        {produto.descricao && <p className="mt-4">{produto.descricao}</p>}

        <AddToCart
          variantes={produto.variantes.map((v) => ({
            id: v.id,
            tamanho: v.tamanho,
            cor: v.cor,
            estoque: v.estoque,
          }))}
        />
      </div>
    </main>
  );
}