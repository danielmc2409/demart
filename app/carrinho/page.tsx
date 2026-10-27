// app/carrinho/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { brl } from "@/lib/format";
import { getCartDetails } from "@/app/actions/get-cart-details";
import { createOrder } from "@/app/actions/create-order";

type Detalhe = Awaited<ReturnType<typeof getCartDetails>>[number];

export default function Carrinho() {
  const { items, setQtd } = useCart();
  const [detalhes, setDetalhes] = useState<Detalhe[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const chave = items.map((i) => i.variantId).join(",");

  useEffect(() => {
    let cancelado = false;
    const ids = chave ? chave.split(",") : [];
    if (ids.length === 0) {
      setDetalhes([]);
      setCarregando(false);
      return;
    }
    getCartDetails(ids).then((d) => {
      if (!cancelado) {
        setDetalhes(d);
        setCarregando(false);
      }
    });
    return () => {
      cancelado = true;
    };
  }, [chave]);

  const linhas = items
    .map((i) => ({ item: i, d: detalhes.find((x) => x.id === i.variantId) }))
    .filter((l): l is { item: typeof l.item; d: Detalhe } => !!l.d);

  const total = linhas.reduce(
    (s, l) => s + l.d.precoCentavos * l.item.qtd,
    0
  );

  async function finalizar() {
    setErro("");
    setEnviando(true);
    const res = await createOrder({ nome, itens: items });
    if (!res.ok) {
      setErro(res.erro);
      setEnviando(false);
      return;
    }
    useCart.getState().clear();
    window.location.href = res.url;
  }

  if (carregando) return <p className="p-10">Carregando...</p>;

  if (linhas.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-4 text-2xl font-semibold">Carrinho</h1>
        <p>Seu carrinho está vazio.</p>
        <Link href="/produtos" className="mt-4 inline-block underline">
          Ver produtos
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Carrinho</h1>

      <ul className="divide-y">
        {linhas.map(({ item, d }) => (
          <li key={d.id} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">{d.nome}</p>
              <p className="text-sm text-neutral-600">
                {d.tamanho} · {d.cor} · {brl(d.precoCentavos)}
              </p>
              {d.estoque < item.qtd && (
                <p className="text-sm text-red-600">
                  Só temos {d.estoque} em estoque
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setQtd(d.id, item.qtd - 1)}
                className="h-8 w-8 rounded border"
              >
                −
              </button>
              <span className="w-6 text-center">{item.qtd}</span>
              <button
                onClick={() => setQtd(d.id, item.qtd + 1)}
                className="h-8 w-8 rounded border"
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-right text-xl font-semibold">
        Total: {brl(total)}
      </p>

      <label className="mt-6 block text-sm font-medium">
        Seu nome
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
          placeholder="Maria Silva"
        />
      </label>

      {erro && <p className="mt-3 text-sm text-red-600">{erro}</p>}

      <button
        onClick={finalizar}
        disabled={enviando || nome.trim().length < 2}
        className="mt-6 w-full rounded bg-green-600 py-3 text-white disabled:opacity-40"
      >
        {enviando ? "Enviando..." : "Finalizar pelo WhatsApp"}
      </button>
    </main>
  );
}