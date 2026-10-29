"use client";

import { useState } from "react";

export default function Galeria({
  imagens,
  nome,
}: {
  imagens: string[];
  nome: string;
}) {
  const [atual, setAtual] = useState(0);

  if (imagens.length === 0) return null;

  return (
    <div className="galeria">
      <div className="galeria-principal">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagens[atual]} alt={`${nome} - foto ${atual + 1}`} />
      </div>

      {imagens.length > 1 && (
        <div className="galeria-miniaturas">
          {imagens.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setAtual(i)}
              className={`galeria-mini ${i === atual ? "ativa" : ""}`}
              aria-label={`Ver foto ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" />
            </button>
          ))}
        </div>
    
      )}
    </div>
  );
}
