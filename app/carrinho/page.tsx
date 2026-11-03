// app/carrinho/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { brl } from "@/lib/format";
import { MAX_POR_ITEM } from "@/lib/limites";
import { getCartDetails } from "@/app/actions/get-cart-details";
import { createOrder } from "@/app/actions/create-order";
import { normalizarTelefone } from "@/lib/telefone";
import { PONTOS_RETIRADA } from "@/lib/loja";

type Detalhe = Awaited<ReturnType<typeof getCartDetails>>[number];

export default function Carrinho() {
  const { items, setQtd } = useCart();
  const [detalhes, setDetalhes] = useState<Detalhe[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [entrega, setEntrega] = useState<"RETIRADA" | "ENTREGA">("RETIRADA");
   const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [complemento, setComplemento] = useState("");
  const [pagamento, setPagamento] = useState<"PIX" | "CARTAO" | "DINHEIRO">(
    "PIX"
  );
    const [retirada, setRetirada] = useState<string | null>(PONTOS_RETIRADA.length === 1 ? PONTOS_RETIRADA[0].id : null)

    // junta os campos num único texto: "Rua X, 123 - Bairro Y (complemento)"
  const endereco =
    `${rua.trim()}, ${numero.trim()} - ${bairro.trim()}` +
    (complemento.trim() ? ` (${complemento.trim()})` : "");
  const faltaEndereco =
    entrega === "ENTREGA" &&
    (rua.trim().length < 3 || numero.trim().length < 1 || bairro.trim().length < 2);
  const chave = items.map((i) => i.variantId).join(",");

useEffect(() => {
  let cancelado = false;
  const ids = chave ? chave.split(",") : [];

  // carrinho vazio também passa por uma Promise, então o setState
  // acontece no .then (assíncrono) e não direto no corpo do efeito
  const busca: Promise<Detalhe[]> =
    ids.length === 0 ? Promise.resolve([]) : getCartDetails(ids);

  busca
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

  const subtotal = linhas.reduce(
    (s, l) => s + l.d.precoCentavos * l.item.qtd,
    0
  );

  const excedeu = linhas.some(
    (l) => l.item.qtd > Math.min(l.d.estoque, MAX_POR_ITEM)
  );

  async function finalizar() {
    if (excedeu || enviando) return;
    setErro("");
    setEnviando(true);

    try {
      // envia só o que está visível na tela
      const res = await createOrder({
        nome,
        entrega,
        endereco: entrega === "ENTREGA" ? endereco : undefined,
                retirada: entrega === "RETIRADA" ? (retirada ?? undefined) : undefined,
        pagamento,
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
window.location.assign(res.url);
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
              ) : item.qtd > MAX_POR_ITEM ? (
                <p className="carrinho-erro">
                  {`Máximo de ${MAX_POR_ITEM} unidades por item. Diminua a quantidade.`}
                </p>
              ) : item.qtd === Math.min(d.estoque, MAX_POR_ITEM) ? (
                <p className="aviso-max">
                  {d.estoque > MAX_POR_ITEM
                    ? `Máximo de ${MAX_POR_ITEM} unidades por pedido`
                    : "Quantidade máxima disponível"}
                </p>
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

      <p className="carrinho-total">Total: {brl(subtotal)}</p>

      <section className="checkout">
        <h2 className="checkout-titulo">Seus dados</h2>

        <label className="carrinho-label">
          Seu nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="carrinho-input"
            placeholder="Maria Silva"
          />
        </label>

        <fieldset className="checkout-grupo">
          <legend>Como quer receber?</legend>
          <div className="checkout-opcoes">
            {(
              [
                ["RETIRADA", "Retirada"],
                ["ENTREGA", "Entrega"],
              ] as const
            ).map(([valor, rotulo]) => (
              <label
                key={valor}
                className={`checkout-opcao ${entrega === valor ? "ativa" : ""}`}
              >
                <input
                  type="radio"
                  name="entrega"
                  value={valor}
                  checked={entrega === valor}
                  onChange={() => setEntrega(valor)}
                />
                {rotulo}
              </label>
            ))}
          </div>
        </fieldset>
        {entrega === "RETIRADA" && (
          <div className="retirada-lista">
            {PONTOS_RETIRADA.map((p) => (
              <label
                key={p.id}
                className={`retirada-opcao ${retirada === p.id ? "ativa" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={retirada === p.id}
                  onChange={() => setRetirada(retirada === p.id ? null : p.id)}
                />
                <span>
                  Retirar em: <strong>{p.endereco}</strong>
                </span>
              </label>
            ))}
          </div>
        )}
              {entrega === "ENTREGA" && (
          <div className="endereco-grid">
            <label className="carrinho-label endereco-todas">
              Rua
              <input
                value={rua}
                onChange={(e) => setRua(e.target.value)}
                className="carrinho-input"
                maxLength={70}
                autoComplete="address-line1"
                placeholder="Nome da rua"
              />
            </label>

            <label className="carrinho-label">
              Número
              <input
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="carrinho-input"
                maxLength={10}
                placeholder="123"
              />
            </label>

            <label className="carrinho-label">
              Bairro
              <input
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="carrinho-input"
                maxLength={40}
                autoComplete="address-level3"
                placeholder="Bairro"
              />
            </label>

            <label className="carrinho-label endereco-todas">
              Complemento ou ponto de referência (opcional)
              <input
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                className="carrinho-input"
                maxLength={50}
                placeholder="Ex.: casa azul, perto da padaria"
              />
            </label>
          </div>
        )}
        <fieldset className="checkout-grupo">
          <legend>Forma de pagamento</legend>
          <div className="checkout-opcoes">
            {(
              [
                ["PIX", "Pix"],
                ["CARTAO", "Cartão"],
                ["DINHEIRO", "Dinheiro"],
              ] as const
            ).map(([valor, rotulo]) => (
              <label
                key={valor}
                className={`checkout-opcao ${pagamento === valor ? "ativa" : ""}`}
              >
                <input
                  type="radio"
                  name="pagamento"
                  value={valor}
                  checked={pagamento === valor}
                  onChange={() => setPagamento(valor)}
                />
                {rotulo}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {erro && <p className="carrinho-erro">{erro}</p>}

      <button
        type="button"
        onClick={finalizar}
        disabled={
          enviando ||
          excedeu ||
          nome.trim().length < 2 ||
          faltaEndereco
        }
        className="carrinho-finalizar"
      >
        {enviando ? "Enviando..." : "Finalizar pelo WhatsApp"}
      </button>
    </main>
  );
}