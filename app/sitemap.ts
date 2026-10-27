// app/sitemap.ts
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const produtos = await prisma.product.findMany({
    where: { ativo: true },
    select: { slug: true },
  });

  return [
    { url: base },
    { url: `${base}/produtos` },
    { url: `${base}/quem-somos` },
    { url: `${base}/trocas-e-devolucoes` },
    ...produtos.map((p) => ({ url: `${base}/produtos/${p.slug}` })),
  ];
}
export const dynamic = "force-dynamic";