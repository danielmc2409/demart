// app/carrinho/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { brl } from "@/lib/format";
import { getCartDetails } from "@/app/actions/get-cart-details";
import { createOrder } from "@/app/actions/create-order";

type Detalhe = Awaited<ReturnType<typeof getCartDetails>>[number];

// mesmo limite por item aplicado no servidor (create-order.ts)
const MAX_POR_ITEM = 20;

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

    getCartDetails(ids)
      .then((d) => {
        if (cancelado) return;
        setDetalhes(d);

        // remove do carrinho o que o servidor não devolveu
        // (produto oculto/excluído), senão o pedido inteiro é recusado
        const validos = new Set(d.map((x) => x.id));
        if (ids.some((id) => !validos.has(id))) {
          useCart.setState((s) => ({
            items: s.items.filter((i) => validos.has(i.variantId)),
          }));
        }
      })
      .catch(() => {
        if (!cancelado) setErro("Não foi possível carregar o carrinho.");
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
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

  const excedeu = linhas.some((l) => l.item.qtd > l.d.estoque);

  async function finalizar() {
    if (excedeu || enviando) return;
    setErro("");
    setEnviando(true);

    try {
      // envia só o que está visível na tela
      const res = await createOrder({
        nome,
        itens: linhas.map((l) => ({
          variantId: l.item.variantId,
          qtd: l.item.qtd,
        })),
      });

      if (!res.ok) {
        setErro(res.erro);
        setEnviando(false);
        return;
      }

      useCart.getState().clear();
      window.location.href = res.url;
    } catch {
      setErro("Erro ao enviar o pedido. Tente novamente.");
      setEnviando(false);
    }
  }

  if (carregando) return <p className="carrinho-msg">Carregando...</p>;

  if (linhas.length === 0) {
    return (
      <main className="carrinho">
        <h1 className="carrinho-titulo">Carrinho</h1>
        {erro && <p className="carrinho-erro">{erro}</p>}
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
              {item.qtd > d.estoque ? (
                <p className="carrinho-erro">
                  {d.estoque === 0
                    ? "Item esgotado. Remova-o do carrinho."
                    : `Só temos ${d.estoque} em estoque. Diminua a quantidade.`}
                </p>
              ) : item.qtd === d.estoque ? (
                <p className="aviso-max">Quantidade máxima disponível</p>
              ) : null}
            </div>

            <div className="carrinho-qtd">
              <button
                type="button"
                onClick={() => setQtd(d.id, item.qtd - 1)}
                className="qtd-btn"
                aria-label={`Diminuir quantidade de ${d.nome}`}
              >
                −
              </button>
              <span className="qtd-num">{item.qtd}</span>
              <button
                type="button"
                onClick={() =>
                  setQtd(d.id, Math.min(d.estoque, MAX_POR_ITEM, item.qtd + 1))
                }
                disabled={item.qtd >= Math.min(d.estoque, MAX_POR_ITEM)}
                className="qtd-btn"
                aria-label={`Aumentar quantidade de ${d.nome}`}
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
        disabled={enviando || excedeu || nome.trim().length < 2}
        className="carrinho-finalizar"
      >
        {enviando ? "Enviando..." : "Finalizar pelo WhatsApp"}
      </button>
    </main>
  );
}