// app/actions/admin-auth.ts
"use server";

import { redirect } from "next/navigation";
import { login, logout } from "@/lib/auth";
import { chaveDoCliente, excedeu, registrar } from "@/lib/limite";

// no máximo 5 senhas erradas por visitante a cada 15 minutos
const MAX_ERROS = 5;
const JANELA_SEG = 15 * 60;

export async function loginAction(formData: FormData) {
  const chave = await chaveDoCliente("login");

  if (chave && (await excedeu(chave, MAX_ERROS, JANELA_SEG))) {
    redirect("/admin/login?erro=limite");
  }

  const ok = await login(String(formData.get("senha") ?? ""));
  if (!ok) {
    if (chave) await registrar(chave); // só conta as senhas erradas
    redirect("/admin/login?erro=1");
  }
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}