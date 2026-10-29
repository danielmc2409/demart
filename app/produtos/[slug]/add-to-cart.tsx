"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { brl } from "@/lib/format";

type V = { id: string; tamanho: string; cor: string; estoque: number };

const ORDEM = ["PP", "P", "M", "G", "GG", "XG"];

const CORES: Record<string, string> = {
  marrom: "#8b4500",
  caramelo: "#e0b890",
  preto: "#111111",
  branco: "#ffffff",
  azul: "#1d4ed8",
  cinza: "#9ca3af",
  verde: "#15803d",
  vermelho: "#dc2626",
};

export default function AddToCart({
  variantes,
  precoCentavos,
}: {
  variantes: V[];
  precoCentavos: number;
}) {
  const add = useCart((s) => s.add);
  const router = useRouter();

  // só variantes com estoque, com texto normalizado
  const disponiveis = variantes
    .map((v) => ({
      ...v,
      cor: v.cor.trim(),
      tamanho: v.tamanho.trim().toUpperCase(),
    }))
    .filter((v) => v.estoque > 0);

  const cores = Array.from(new Set(disponiveis.map((v) => v.cor)));

  const [cor, setCor] = useState(() => cores[0] ?? "");
  const [tamanho, setTamanho] = useState("");
  const [qtd, setQtd] = useState(1);
  const [ok, setOk] = useState(false);

  // tamanhos disponíveis só na cor escolhida
  const tamanhos = Array.from(
    new Set(disponiveis.filter((v) => v.cor === cor).map((v) => v.tamanho))
  ).sort((a, b) => ORDEM.indexOf(a) - ORDEM.indexOf(b));

  const variante = disponiveis.find(
    (v) => v.cor === cor && v.tamanho === tamanho
  );

  function escolherCor(c: string) {
    setCor(c);
    setQtd(1);
    const existe = disponiveis.some((v) => v.cor === c && v.tamanho === tamanho);
    if (!existe) setTamanho("");
  }

  function escolherTamanho(t: string) {
    setTamanho(t);
    setQtd(1);
  }

  function colocarNoCarrinho() {
    if (!variante) return false;
    for (let i = 0; i < qtd; i++) add(variante.id);
    return true;
  }

  function adicionar() {
    if (!colocarNoCarrinho()) return;
    setQtd(1);
    setOk(true);
    setTimeout(() => setOk(false), 1500);
  }

  function comprarAgora() {
    if (!colocarNoCarrinho()) return;
    router.push("/carrinho");
  }

  if (disponiveis.length === 0) {
    return (
      <div className="comprar">
        <button type="button" disabled className="botao-carrinho botao-esgotado">
          Esgotado
        </button>
      </div>
    );
  }

  return (
    <div className="comprar">
      {cores.length > 0 && (
        <div className="opcao">
          <p className="opcao-titulo">
            Cor: <strong>{cor}</strong>
          </p>
          <div className="opcao-lista">
            {cores.map((c) => {
              const hex = CORES[c.toLowerCase()];
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => escolherCor(c)}
                  className={`opcao-btn ${c === cor ? "ativo" : ""}`}
                >
                  {hex && (
                    <span className="grade-amostra" style={{ background: hex }} />
                  )}
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="opcao">
        <p className="opcao-titulo">
          Tamanho: <strong>{tamanho || "escolha"}</strong>
        </p>
        <div className="opcao-lista">
          {tamanhos.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => escolherTamanho(t)}
              className={`opcao-btn ${t === tamanho ? "ativo" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="opcao">
        <p className="opcao-titulo">Quantidade</p>
        <div className="stepper">
          <button
            type="button"
            onClick={() => setQtd((q) => Math.max(1, q - 1))}
            disabled={qtd <= 1}
          >
            −
          </button>
          <span>{qtd}</span>
          <button
            type="button"
            onClick={() =>
              setQtd((q) => Math.min(variante?.estoque ?? 1, q + 1))
            }
            disabled={!variante || qtd >= variante.estoque}
          >
            +
          </button>
        </div>
        {variante && qtd >= variante.estoque && (
          <p className="aviso-max" role="status">
            Quantidade máxima disponível ({variante.estoque}{" "}
            {variante.estoque === 1 ? "unidade" : "unidades"})
          </p>
        )}
      </div>

      <p className="resumo-total">{brl(qtd * precoCentavos)}</p>

      <button
        type="button"
        onClick={comprarAgora}
        disabled={!variante}
        className="botao-comprar-agora"
      >
        {variante ? "Comprar agora" : "Escolha o tamanho"}
      </button>

      <button
        type="button"
        onClick={adicionar}
        disabled={!variante}
        className="botao-carrinho"
      >
        {ok ? "Adicionado ✓" : "Adicionar ao carrinho"}
      </button>
    </div>
  );
}