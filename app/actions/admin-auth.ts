// app/actions/admin-auth.ts
"use server";

import { redirect } from "next/navigation";
import { login, logout } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const ok = await login(String(formData.get("senha") ?? ""));
  if (!ok) redirect("/admin/login?erro=1");
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}