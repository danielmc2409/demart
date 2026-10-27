// app/produtos/[slug]/add-to-cart.tsx
"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";

type V = { id: string; tamanho: string; cor: string; estoque: number };

export default function AddToCart({ variantes }: { variantes: V[] }) {
  const [sel, setSel] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const add = useCart((s) => s.add);

  function adicionar() {
    if (!sel) return;
    add(sel);
    setOk(true);
    setTimeout(() => setOk(false), 1500);
  }

  return (
    <div className="mt-6">
      <p className="mb-2 text-sm font-medium">Tamanho</p>
      <div className="flex flex-wrap gap-2">
        {variantes.map((v) => {
          const esgotado = v.estoque <= 0;
          return (
            <button
              key={v.id}
              disabled={esgotado}
              onClick={() => setSel(v.id)}
              className={`rounded border px-4 py-2 text-sm ${
                sel === v.id ? "border-black bg-black text-white" : ""
              } ${esgotado ? "cursor-not-allowed line-through opacity-40" : ""}`}
            >
              {v.tamanho} · {v.cor}
            </button>
          );
        })}
      </div>

      <button
        onClick={adicionar}
        disabled={!sel}
        className="mt-6 w-full rounded bg-black py-3 text-white disabled:opacity-40"
      >
        {ok ? "Adicionado ✓" : "Adicionar ao carrinho"}
      </button>
    </div>
  );
}