// app/actions/product-admin.ts
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify, parsePreco } from "@/lib/slug";

const LINHAS = /\r?\n/;

const baseSchema = z.object({
  nome: z.string().trim().min(2, "Nome muito curto").max(120),
  descricao: z.string().trim().max(2000).optional(),
  preco: z.string().min(1, "Informe o preço"),
  categoria: z.string().trim().min(2, "Informe a categoria").max(50),
  imagens: z.string().optional(),
});

function lerBase(fd: FormData) {
  const p = baseSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { erro: p.error.issues[0].message as string };

  const precoCentavos = parsePreco(p.data.preco);
  if (!Number.isFinite(precoCentavos) || precoCentavos <= 0)
    return { erro: "Preço inválido" };

  const imagens = (p.data.imagens ?? "")
    .split(LINHAS)
    .map((s) => s.trim())
    .filter(Boolean);
  if (imagens.some((u) => !/^https?:\/\//.test(u)))
    return { erro: "Cada imagem deve ser uma URL começando com http(s)://" };

  return {
    dados: {
      nome: p.data.nome,
      descricao: p.data.descricao || null,
      categoria: p.data.categoria,
      precoCentavos,
      imagens,
    },
  };
}

// linhas no formato: tamanho,cor,estoque  (ex.: M,Preto,5)
function lerVariantes(texto: string) {
  const out: { tamanho: string; cor: string; estoque: number }[] = [];
  for (const linha of texto.split(LINHAS).map((l) => l.trim()).filter(Boolean)) {
    const [tamanho, cor, est] = linha.split(",").map((s) => s.trim());
    const estoque = Number(est);
    if (!tamanho || !cor || !Number.isInteger(estoque) || estoque < 0) return null;
    out.push({ tamanho, cor, estoque });
  }
  return out;
}

export async function createProduct(fd: FormData) {
  await requireAdmin();

  const base = lerBase(fd);
  const variantes = lerVariantes(String(fd.get("variantes") ?? ""));
  const erro =
    base.erro ??
    (!variantes || variantes.length === 0
      ? "Variantes inválidas. Use uma por linha: tamanho,cor,estoque"
      : null);
  if (erro) redirect(`/admin/produtos/novo?erro=${encodeURIComponent(erro)}`);

  let slug = slugify(base.dados!.nome);
  if (await prisma.product.findUnique({ where: { slug } })) {
    slug += "-" + Date.now().toString(36).slice(-4);
  }

  const criado = await prisma.product.create({
    data: {
      ...base.dados!,
      slug,
      variantes: { create: variantes! },
    },
  });

  revalidatePath("/");
  redirect(`/admin/produtos/${criado.id}`);
}
export async function updateProduct(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));

  const base = lerBase(fd);
  if (base.erro)
    redirect(`/admin/produtos/${id}?erro=${encodeURIComponent(base.erro)}`);

  const p = await prisma.product.update({ where: { id }, data: base.dados! });

  revalidatePath("/");
  revalidatePath(`/produtos/${p.slug}`);
  redirect(`/admin/produtos/${id}?ok=1`);
}

export async function toggleAtivo(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id"));
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return;
  await prisma.product.update({ where: { id }, data: { ativo: !p.ativo } });
  revalidatePath("/");
  revalidatePath("/admin/produtos");
}

export async function setEstoque(fd: FormData) {
  await requireAdmin();
  const estoque = Number(fd.get("estoque"));
  if (!Number.isInteger(estoque) || estoque < 0) return;
  await prisma.variant.update({
    where: { id: String(fd.get("variantId")) },
    data: { estoque },
  });
  revalidatePath("/admin/produtos");
}

export async function addVariant(fd: FormData) {
  await requireAdmin();
  const productId = String(fd.get("productId"));
  const tamanho = String(fd.get("tamanho") ?? "").trim();
  const cor = String(fd.get("cor") ?? "").trim();
  const estoque = Number(fd.get("estoque"));
  if (!tamanho || !cor || !Number.isInteger(estoque) || estoque < 0) return;

  await prisma.variant.upsert({
    where: { productId_tamanho_cor: { productId, tamanho, cor } },
    update: { estoque },
    create: { productId, tamanho, cor, estoque },
  });
  revalidatePath(`/admin/produtos/${productId}`);
}
// updateProduct, toggleAtivo, setEstoque e addVariant: sem alterações