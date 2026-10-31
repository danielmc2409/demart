// app/produtos/[slug]/page.tsx
import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { brl } from "@/lib/format";
import AddToCart from "./add-to-cart";
import Galeria from "./galeria";
import Compartilhar from "./compartilhar";

export const dynamic = "force-dynamic";

// cache: a página e o generateMetadata usam a mesma consulta (1 ida ao banco)
const buscarProduto = cache((slug: string) =>
  prisma.product.findUnique({
    where: { slug },
    include: { variantes: { orderBy: { tamanho: "asc" } } },
  })
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await buscarProduto(slug);
  if (!p || !p.ativo) return {};

  const preco = brl(p.precoCentavos);
  const titulo = `${p.nome} - ${preco}`;
  const resumo = (p.descricao ?? "").trim().slice(0, 160);
  const descricao = resumo ? `${preco} · ${resumo}` : `${preco} na Demart`;
  const imagem = p.imagens[0];

  return {
    title: p.nome, // o layout acrescenta " | Demart"
    description: descricao,
    alternates: { canonical: `/produtos/${p.slug}` },
    openGraph: {
      type: "website",
      title: titulo,
      description: descricao,
      url: `/produtos/${p.slug}`,
      images: imagem ? [{ url: imagem, alt: p.nome }] : undefined,
    },
    twitter: {
      card: imagem ? "summary_large_image" : "summary",
      title: titulo,
      description: descricao,
      images: imagem ? [imagem] : undefined,
    },
  };
}

export default async function Produto({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const produto = await buscarProduto(slug);

  if (!produto || !produto.ativo) notFound();

  const numero = process.env.WHATSAPP_NUMBER;
  const whats = numero
    ? `https://wa.me/${numero}?text=${encodeURIComponent(
        `Olá! Tenho uma dúvida sobre: ${produto.nome}`
      )}`
    : null;

  return (
    <main className="produto-pagina">
      <div className="produto-pagina-img">
        <Galeria imagens={produto.imagens} nome={produto.nome} />
      </div>

      <div className="produto-pagina-info">
        <div className="produto-pagina-topo">
          <h1 className="produto-pagina-nome">{produto.nome}</h1>
          <Compartilhar nome={produto.nome} preco={brl(produto.precoCentavos)} />
        </div>

        <p className="produto-pagina-preco">
          {produto.precoAntigoCentavos != null &&
            produto.precoAntigoCentavos > produto.precoCentavos && (
              <s className="preco-antigo">{brl(produto.precoAntigoCentavos)}</s>
            )}
          <span>{brl(produto.precoCentavos)}</span>
        </p>

        {produto.descricao && (
          <p className="produto-pagina-desc">{produto.descricao}</p>
        )}

        <div className="produto-pagina-acoes">
          <AddToCart
            precoCentavos={produto.precoCentavos}
            variantes={produto.variantes.map((v) => ({
              id: v.id,
              tamanho: v.tamanho,
              cor: v.cor,
              estoque: v.estoque,
            }))}
          />

          <Link href="/" className="botao-voltar">
            Voltar para a loja
          </Link>

          {whats && (
            <div className="duvida">
              <p>Ficou com alguma dúvida?</p>
              <a
                href={whats}
                target="_blank"
                rel="noopener noreferrer"
                className="botao-vendedor"
              >
                Falar com o vendedor
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}