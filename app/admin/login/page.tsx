// app/admin/login/page.tsx
import { loginAction } from "@/app/actions/admin-auth";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Admin</h1>
      <form action={loginAction} className="space-y-4">
        <input
          type="password"
          name="senha"
          placeholder="Senha"
          required
          className="w-full rounded border px-3 py-2"
        />
        {erro && <p className="text-sm text-red-600">Senha incorreta</p>}
        <button className="w-full rounded bg-black py-2 text-white">
          Entrar
        </button>
      </form>
    </main>
  );
}