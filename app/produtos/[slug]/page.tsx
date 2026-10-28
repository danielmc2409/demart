// app/produtos/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { brl } from "@/lib/format";
import AddToCart from "./add-to-cart";
import Link from "next/link";


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
  
const whats = `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${encodeURIComponent(
  `Olá! Tenho uma dúvida sobre: ${produto.nome}`
)}`;
return (
  <main className="produto-pagina">
    <div className="produto-pagina-img">
      {produto.imagens[0] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={produto.imagens[0]} alt={produto.nome} />
      )}
    </div>

    <div className="produto-pagina-info">
  <h1 className="produto-pagina-nome">{produto.nome}</h1>
  <p className="produto-pagina-preco">{brl(produto.precoCentavos)}</p>
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

  <div className="duvida">
    <p>Ficou com alguma dúvida?</p>
    <a href={whats} target="_blank" rel="noopener noreferrer" className="botao-vendedor">
      Falar com o vendedor
    </a>
  </div>
</div>
</div>
  </main>
);
}