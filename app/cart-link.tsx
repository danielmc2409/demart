"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";

// total de unidades no carrinho (soma das quantidades)
const total = () =>
  useCart.getState().items.reduce((soma, i) => soma + i.qtd, 0);

export default function CartLink() {
  // no servidor o valor é 0; no navegador lê o carrinho salvo, sem erro de hidratação
  const qtd = useSyncExternalStore(useCart.subscribe, total, () => 0);

  return (
    <Link
      href="/carrinho"
      aria-label={qtd > 0 ? `Carrinho, ${qtd} ${qtd === 1 ? "item" : "itens"}` : "Carrinho"}
    >
      <img src="/img/carrinho.png" alt="" className="icone-carrinho" />
      {qtd > 0 && (
        <span className="carrinho-contador" aria-hidden="true">
          {qtd > 99 ? "99+" : qtd}
        </span>
      )}
    </Link>
  );
}