"use client";

import { useState } from "react";

export type CupomAplicado = { codigo: string; descontoCentavos: number };

export default function CupomInput({
  subtotalCentavos,
  aplicado,
  aoAplicar,
}: {
  subtotalCentavos: number;
  aplicado: CupomAplicado | null;
  aoAplicar: (c: CupomAplicado | null) => void;
}) {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function aplicar() {
    setErro("");
    setCarregando(true);
    try {
      const res = await fetch("/api/cupom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo, subtotalCentavos }),
      });
      const dados = await res.json();
      if (dados.ok) {
        aoAplicar({ codigo: dados.codigo, descontoCentavos: dados.descontoCentavos });
        setCodigo("");
      } else {
        setErro(dados.erro);
      }
    } catch {
      setErro("Não foi possível validar o cupom.");
    } finally {
      setCarregando(false);
    }
  }

  if (aplicado) {
    return (
      <div className="cupom-aplicado">
        <span>Cupom <strong>{aplicado.codigo}</strong> aplicado</span>
        <button type="button" onClick={() => aoAplicar(null)}>Remover</button>
      </div>
    );
  }

  return (
    <div className="cupom">
      <div className="cupom-linha">
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="Cupom de desconto"
          autoCapitalize="characters"
        />
        <button type="button" onClick={aplicar} disabled={carregando || !codigo.trim()}>
          {carregando ? "..." : "Aplicar"}
        </button>
      </div>
      {erro && <p className="cupom-erro" role="alert">{erro}</p>}
    </div>
  );
}