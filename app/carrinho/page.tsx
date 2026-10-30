// app/carrinho/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { brl } from "@/lib/format";
import { getCartDetails } from "@/app/actions/get-cart-details";
import { createOrder } from "@/app/actions/create-order";
import CupomInput, { CupomAplicado } from "./cupom-input";

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
  const [cupomEstado, setCupomEstado] = useState<
    (CupomAplicado & { base: number }) | null
  >(null);

  const [entrega, setEntrega] = useState<"RETIRADA" | "ENTREGA">("RETIRADA");
  const [endereco, setEndereco] = useState("");
  const [pagamento, setPagamento] = useState<"PIX" | "CARTAO" | "DINHEIRO">(
    "PIX"
  );

  const faltaEndereco = entrega === "ENTREGA" && endereco.trim().length < 8;

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

  const subtotal = linhas.reduce(
    (s, l) => s + l.d.precoCentavos * l.item.qtd,
    0
  );

  // se o carrinho mudou depois de aplicar, o cupom deixa de valer e o cliente aplica de novo
  const cupom =
    cupomEstado && cupomEstado.base === subtotal ? cupomEstado : null;
  const desconto = cupom?.descontoCentavos ?? 0;
  const total = subtotal - desconto;

  const excedeu = linhas.some((l) => l.item.qtd > l.d.estoque);

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
        pagamento,
        cupom: cupom?.codigo,
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

      <CupomInput
        subtotalCentavos={subtotal}
        aplicado={cupom}
        aoAplicar={(c) => setCupomEstado(c ? { ...c, base: subtotal } : null)}
      />

      {cupom && (
        <>
          <p className="carrinho-linha">Subtotal: {brl(subtotal)}</p>
          <p className="carrinho-linha carrinho-desconto">
            Desconto ({cupom.codigo}): − {brl(desconto)}
          </p>
        </>
      )}
      <p className="carrinho-total">Total: {brl(total)}</p>

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

        {entrega === "ENTREGA" && (
          <label className="carrinho-label">
            Endereço de entrega
            <textarea
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="carrinho-input"
              rows={3}
              maxLength={200}
              placeholder="Rua, número, bairro, complemento ou ponto de referência"
            />
          </label>
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
        disabled={enviando || excedeu || nome.trim().length < 2 || faltaEndereco}
        className="carrinho-finalizar"
      >
        {enviando ? "Enviando..." : "Finalizar pelo WhatsApp"}
      </button>
    </main>
  );
}