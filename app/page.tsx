// app/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { brl } from "@/lib/format";

export const dynamic = "force-dynamic";
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
   <div className="avisos">
  <div className="simbolo">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  </div>
  <div className="text-aviso">
    <h2>AVISO</h2>
    <p>O texto do aviso aqui</p>
  </div>
</div>
  </section>


      <section className="container">




 <h2 className="titulo-novidades">NOVIDADES:</h2>

<div className="produtos-grid">
  {destaques.map((p) => (
    <div key={p.id} className="produto-card">
      {p.imagens[0] && (
        <img src={p.imagens[0]} alt={p.nome} className="produto-img" />
      )}

      <div className="produto-info">
        <h3 className="produto-nome">{p.nome}</h3>
        <p className="produto-preco">{brl(p.precoCentavos)}</p>
        <Link href={`/produtos/${p.slug}`} className="botao-comprar">
          Comprar
        </Link>
      </div>
    </div>
  ))}
</div>

      </section>
    </main>
  );
}