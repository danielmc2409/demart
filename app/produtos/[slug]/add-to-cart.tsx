"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { brl } from "@/lib/format";

















type V = { id: string; tamanho: string; cor: string; estoque: number };

const ORDEM = ["PP", "P", "M", "G", "GG", "XG"];

// cores conhecidas para o quadradinho (ajuste ao seu catálogo)
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


  const [qtds, setQtds] = useState<Record<string, number>>({});
  const [ok, setOk] = useState(false);
  const add = useCart((s) => s.add);

  const cores = Array.from(new Set(variantes.map((v) => v.cor)));
  const tamanhos = Array.from(new Set(variantes.map((v) => v.tamanho))).sort(
    (a, b) => ORDEM.indexOf(a) - ORDEM.indexOf(b)
  );

  const total = Object.values(qtds).reduce((s, n) => s + n, 0);

  function mudar(v: V, delta: number) {
    setQtds((prev) => {
      const atual = prev[v.id] ?? 0;
      const novo = Math.min(v.estoque, Math.max(0, atual + delta));
      return { ...prev, [v.id]: novo };
    });
  }

  function adicionar() {
    if (total === 0) return;
    for (const v of variantes) {
      const n = qtds[v.id] ?? 0;
      for (let i = 0; i < n; i++) add(v.id);
    }
    setQtds({});
    setOk(true);
    setTimeout(() => setOk(false), 1500);
  }

  return (
    
    <div className="tamanhos">
      <div className="resumo">
  <div className="resumo-qtd">
    <strong>{total}</strong> un
  </div>
  <p className="resumo-total">{brl(total * precoCentavos)}</p>
</div>
      <div className="grade-wrap">
        <table className="grade">
          <thead>
            <tr>
              <th></th>
              {tamanhos.map((t) => (
                <th key={t}>{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cores.map((cor) => {
              const hex = CORES[cor.toLowerCase()];
              return (
                <tr key={cor}>
                  <th scope="row" className="grade-cor">
                    {cor}
                    {hex && (
                      <span className="grade-amostra" style={{ background: hex }} />
                    )}
                  </th>

                  {tamanhos.map((t) => {
                    const v = variantes.find(
                      (x) => x.cor === cor && x.tamanho === t
                    );
                    if (!v || v.estoque <= 0) {
                      return (
                        <td key={t} className="grade-esgotado">
                          Esgotado
                        </td>
                      );
                    }
                    const q = qtds[v.id] ?? 0;
                    return (
                      <td key={t}>
                        <span className="grade-preco"><span className="grade-preco">{brl(precoCentavos)}</span></span>
                        <div className="stepper">
                          <button
                            type="button"
                            onClick={() => mudar(v, -1)}
                            disabled={q === 0}
                          >
                            −
                          </button>
                          <span>{q}</span>
                          <button
                            type="button"
                            onClick={() => mudar(v, 1)}
                            disabled={q >= v.estoque}
                          >
                            +
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={adicionar}
        disabled={total === 0}
        className="botao-carrinho"
      >
        {ok ? "Adicionado ✓" : "Adicionar ao carrinho"}
      </button>
    </div>
  );
}