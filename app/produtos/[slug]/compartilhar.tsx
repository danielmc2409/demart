"use client";

import { useState } from "react";

export default function Compartilhar({
  nome,
  preco,
}: {
  nome: string;
  preco: string;
}) {
  const [copiado, setCopiado] = useState(false);

  async function compartilhar() {
    const url = window.location.href;
    const dados = { title: nome, text: `${nome} - ${preco}`, url };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(dados);
      } catch {
        // usuário cancelou, não precisa fazer nada
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copie o link:", url);
    }
  }

  return (
    <div className="compartilhar">
      <button
        type="button"
        className="botao-compartilhar"
        onClick={compartilhar}
        aria-label="Compartilhar produto"
        title="Compartilhar"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>

      {copiado && (
        <span className="compartilhar-aviso" role="status">
          Link copiado!
        </span>
      )}
    </div>
  );
}