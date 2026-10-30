// lib/auth.ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, createHmac, timingSafeEqual } from "crypto";

const COOKIE = "admin";
const DURACAO = 60 * 60 * 24 * 7; // 7 dias

const assinar = (v: string, segredo: string) =>
  createHmac("sha256", segredo).update(v).digest("hex");

const hash = (v: string) => createHash("sha256").update(v).digest();

export async function login(senha: string) {
  const esperada = process.env.ADMIN_PASSWORD;
  const segredo = process.env.ADMIN_SECRET;

  // sem configuração ou sem senha digitada: ninguém entra
  if (!esperada || !segredo || !senha) return false;

  if (!timingSafeEqual(hash(senha), hash(esperada))) return false;

  const exp = String(Math.floor(Date.now() / 1000) + DURACAO);
  (await cookies()).set(COOKIE, `${exp}.${assinar(exp, segredo)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO,
  });
  return true;
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const segredo = process.env.ADMIN_SECRET;
  if (!segredo) return false; // antes: estourava erro em todas as páginas admin

  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split(".");
  if (!exp || !sig) return false;

  const esperado = assinar(exp, segredo);
  if (sig.length !== esperado.length) return false;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(esperado))) return false;

  return Number(exp) > Date.now() / 1000;
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}