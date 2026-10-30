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

   <section className="banner-secao">
    <picture>
      <source media="(max-width: 768px)" srcSet="/img/banner-mobile.png" />
      <img src="/img/banner.png" alt="Demart - Moda Masculina" className="banner" />
    </picture>
  </section>


      <section className="container">




        <h2 className="mb-6 text-xl font-semibold">Produtos</h2>


<div className="produtos-grid">
  {destaques.map((p) => (
   <div key={p.id} className="produto-card">
  <div className="produto-img">
    {p.imagens[0] && <img src={p.imagens[0]} alt={p.nome} />}
  </div>
  <h3 className="produto-nome">{p.nome}</h3>
  <p className="produto-preco">{brl(p.precoCentavos)}</p>

  <Link href={`/produtos/${p.slug}`} className="botao">
    Comprar
  </Link>
</div>
  ))}
</div>


      </section>
    </main>
  );
}