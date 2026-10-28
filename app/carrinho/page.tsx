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
if (carregando) return <p className="carrinho-msg">Carregando...</p>;

if (linhas.length === 0) {
  return (
    <main className="carrinho">
      <h1 className="carrinho-titulo">Carrinho</h1>
      <p>Seu carrinho está vazio.</p>
      <Link href="/" className="botao-voltar carrinho-voltar">
        Voltar para a loja
      </Link>
    </main>
  );
}

return (
  <main className="carrinho">
    <h1 className="carrinho-titulo">Carrinho</h1>

    <ul className="carrinho-lista">
      {linhas.map(({ item, d }) => (
        <li key={d.id} className="carrinho-item">
          <div className="carrinho-info">
            <p className="carrinho-nome">{d.nome}</p>
            <p className="carrinho-detalhe">
              {d.tamanho} · {d.cor} · {brl(d.precoCentavos)}
            </p>
            {d.estoque < item.qtd && (
              <p className="carrinho-erro">Só temos {d.estoque} em estoque</p>
            )}
          </div>

          <div className="carrinho-qtd">
            <button
              type="button"
              onClick={() => setQtd(d.id, item.qtd - 1)}
              className="qtd-btn"
            >
              −
            </button>
            <span className="qtd-num">{item.qtd}</span>
            <button
              type="button"
              onClick={() => setQtd(d.id, item.qtd + 1)}
              className="qtd-btn"
            >
              +
            </button>
          </div>
       </li>
        ))}
      </ul>

      <p className="carrinho-total">Total: {brl(total)}</p>

      <label className="carrinho-label">
        Seu nome
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="carrinho-input"
          placeholder="Maria Silva"
        />
      </label>

      {erro && <p className="carrinho-erro">{erro}</p>}

      <button
        type="button"
        onClick={finalizar}
        disabled={enviando || nome.trim().length < 2}
        className="carrinho-finalizar"
      >
        {enviando ? "Enviando..." : "Finalizar pelo WhatsApp"}
      </button>
    </main>
  );
}