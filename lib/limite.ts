// lib/limite.ts
// Limite de tentativas por visitante, guardado no banco (funciona na Vercel,
// onde a memória não é compartilhada entre as execuções).
// O IP nunca é salvo em texto: só um código embaralhado (HMAC).
import { headers } from "next/headers";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

// devolve algo como "pedido:3f9a..." ou null se não der para identificar o IP
export async function chaveDoCliente(prefixo: string): Promise<string | null> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  if (!ip) return null;

  const codigo = createHmac("sha256", process.env.ADMIN_SECRET ?? "demart")
    .update(ip)
    .digest("hex")
    .slice(0, 32);
  return `${prefixo}:${codigo}`;
}

// true = já passou do limite dentro da janela
// Se o banco falhar (ex.: migração ainda não rodou), NÃO bloqueia ninguém.
export async function excedeu(
  chave: string,
  max: number,
  janelaSeg: number,
): Promise<boolean> {
  try {
    const desde = new Date(Date.now() - janelaSeg * 1000);
    const n = await prisma.tentativa.count({
      where: { chave, criadoEm: { gte: desde } },
    });
    return n >= max;
  } catch (e) {
    console.error("Limite (excedeu):", e);
    return false;
  }
}

export async function registrar(chave: string): Promise<void> {
  try {
    await prisma.tentativa.create({ data: { chave } });
  } catch (e) {
    console.error("Limite (registrar):", e);
  }
}