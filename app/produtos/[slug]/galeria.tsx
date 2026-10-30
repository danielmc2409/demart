"use client";

import { useRef, useState } from "react";

export default function Galeria({
  imagens,
  nome,
}: {
  imagens: string[];
  nome: string;
}) {
  const [atual, setAtual] = useState(0);
  const faixa = useRef<HTMLDivElement>(null);

  if (imagens.length === 0) return null;

  function aoRolar() {
    const el = faixa.current;
    if (!el) return;
    setAtual(Math.round(el.scrollLeft / el.clientWidth));
  }

  function irPara(i: number) {
    const el = faixa.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="galeria">
      <div className="galeria-faixa" ref={faixa} onScroll={aoRolar}>
        {imagens.map((src, i) => (
          <div key={src + i} className="galeria-slide">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${nome} - foto ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              draggable={false}
            />
          </div>
        ))}
      </div>
      {imagens.length > 1 && (
        <div className="galeria-contador" aria-live="polite">
          {atual + 1} de {imagens.length}
        </div>
      )}
      {imagens.length > 1 && (
        <div className="galeria-bolinhas">
          {imagens.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => irPara(i)}
              className={`galeria-bolinha ${i === atual ? "ativa" : ""}`}
              aria-label={`Ir para a foto ${i + 1}`}
              aria-current={i === atual}
            />
          ))}
        </div>
      )}

      {imagens.length > 1 && (
        <div className="galeria-miniaturas">
          {imagens.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => irPara(i)}
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