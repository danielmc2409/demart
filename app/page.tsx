// app/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { brl } from "@/lib/format";

export const dynamic = "force-dynamic";

const icone = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const ORDEM = ["PP", "P", "M", "G", "GG", "XG", "XGG"];
const porTamanho = (a: string, b: string) => {
  const ia = ORDEM.indexOf(a.toUpperCase());
  const ib = ORDEM.indexOf(b.toUpperCase());
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  return a.localeCompare(b, "pt-BR", { numeric: true });
};

export default async function Home() {
  const destaques = await prisma.product.findMany({
    where: { ativo: true },
    orderBy: { id: "desc" },
    take: 8,
    include: { variantes: { select: { tamanho: true, estoque: true } } },
  });

  return (
    <main>
      <section className="banner-secao">
        <picture>
          <source media="(max-width: 768px)" srcSet="/img/banner-mobile.png" />
          <img src="/img/banner.png" alt="Demart - Moda Masculina" className="banner" />
        </picture>

        <div className="beneficios">
          <div className="beneficio">
            <svg {...icone}>
              <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l1.9-5.4A8.4 8.4 0 1 1 21 11.5Z" />
            </svg>
            <span>Compre pelo WhatsApp</span>
          </div>
          <div className="beneficio">
            <svg {...icone}>
              <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
              <circle cx="7" cy="18" r="1.6" />
              <circle cx="17" cy="18" r="1.6" />
            </svg>
            <span>Retirada ou entrega</span>
          </div>
          <div className="beneficio">
            <svg {...icone}>
              <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
              <path d="M2.5 10h19" />
            </svg>
            <span>Pix, cartão ou dinheiro</span>
          </div>
        </div>
      </section>

      <section className="container">
        <h2 className="titulo-novidades">Novidades</h2>

        <div className="produtos-grid">
          {destaques.map((p) => {
            const promo =
              p.precoAntigoCentavos != null &&
              p.precoAntigoCentavos > p.precoCentavos;
            const desconto = promo
              ? Math.round((1 - p.precoCentavos / p.precoAntigoCentavos!) * 100)
              : 0;
            const disponiveis = p.variantes.filter((v) => v.estoque > 0);
            const esgotado = p.variantes.length > 0 && disponiveis.length === 0;
            const tamanhos = [...new Set(disponiveis.map((v) => v.tamanho))].sort(
              porTamanho,
            );

            return (
              <Link
                key={p.id}
                href={`/produtos/${p.slug}`}
                className={`produto-card${esgotado ? " esgotado" : ""}`}
              >
                <div className="produto-midia">
                  {p.imagens[0] && (
                    <img src={p.imagens[0]} alt={p.nome} className="produto-img" />
                  )}
                  {promo && desconto > 0 && (
                    <span className="selo selo-desconto">-{desconto}%</span>
                  )}
                  {esgotado && <span className="selo selo-esgotado">Esgotado</span>}
                </div>

                <div className="produto-info">
                  <h3 className="produto-nome">{p.nome}</h3>
                  <p className="produto-preco">
                    <span className="preco-atual">{brl(p.precoCentavos)}</span>
                    {promo && (
                      <s className="preco-antigo">{brl(p.precoAntigoCentavos!)}</s>
                    )}
                  </p>
                  {tamanhos.length > 0 && (
                    <p className="produto-tamanhos">{tamanhos.join(" · ")}</p>
                  )}
                  <span className="botao-comprar">
                    {esgotado ? "Ver produto" : "Comprar"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}