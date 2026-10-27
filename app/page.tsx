// app/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { brl } from "@/lib/format";

export default async function Home() {
  const destaques = await prisma.product.findMany({
    where: { ativo: true },
    orderBy: { id: "desc" },
    take: 8,
  });

  return (
    <main>
      <section className="bg-neutral-100 px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold md:text-4xl">Nome da Loja</h1>
        <p className="mx-auto mt-3 max-w-md text-neutral-600">
          Escolha suas peças aqui e finalize pelo WhatsApp, com atendimento
          pessoal do começo ao fim.
        </p>
        <Link
          href="/produtos"
          className="mt-6 inline-block rounded bg-black px-6 py-3 text-white"
        >
          Ver produtos
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="mb-6 text-xl font-semibold">Novidades</h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {destaques.map((p) => (
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
                <h3 className="mt-2 text-sm">{p.nome}</h3>
                <p className="font-medium">{brl(p.precoCentavos)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}