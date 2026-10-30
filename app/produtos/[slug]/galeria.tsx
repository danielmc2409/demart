"use client";

import { useEffect, useRef, useState } from "react";

export default function Galeria({
  imagens,
  nome,
}: {
  imagens: string[];
  nome: string;
}) {
  const [atual, setAtual] = useState(0);
  const [aberta, setAberta] = useState(false);
  const [ampliada, setAmpliada] = useState(false);
  const faixa = useRef<HTMLDivElement>(null);
  const faixaLb = useRef<HTMLDivElement>(null);

  // trava a rolagem da página, Esc fecha e setas trocam de foto
  useEffect(() => {
    if (!aberta) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const aoTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberta(false);
        setAmpliada(false);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const el = faixaLb.current;
        if (!el) return;
        const i =
          Math.round(el.scrollLeft / el.clientWidth) +
          (e.key === "ArrowRight" ? 1 : -1);
        if (i < 0 || i >= imagens.length) return;
        el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", aoTecla);
    return () => {
      document.body.style.overflow = antes;
      window.removeEventListener("keydown", aoTecla);
    };
  }, [aberta, imagens.length]);

  // ao abrir, posiciona o lightbox na foto atual
  useEffect(() => {
    if (!aberta) return;
    const el = faixaLb.current;
    if (el) el.scrollLeft = atual * el.clientWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberta]);

  // ao fechar, a galeria volta para a foto em que o lightbox parou
  useEffect(() => {
    if (aberta) return;
    const el = faixa.current;
    if (el) el.scrollLeft = atual * el.clientWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberta]);

  if (imagens.length === 0) return null;

  function fechar() {
    setAberta(false);
    setAmpliada(false);
  }

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

  function aoRolarLb() {
    const el = faixaLb.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== atual) {
      setAtual(i);
      setAmpliada(false);
    }
  }

  function mudarLb(dir: number) {
    const el = faixaLb.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth) + dir;
    if (i < 0 || i >= imagens.length) return;
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
              onClick={() => setAberta(true)}
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

      {aberta && (
        <div
          className="lightbox"
          onClick={fechar}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="lightbox-fechar"
            onClick={fechar}
            aria-label="Fechar"
          >
            ×
          </button>

          {imagens.length > 1 && (
            <div className="lightbox-contador">
              {atual + 1} de {imagens.length}
            </div>
          )}

          {imagens.length > 1 && atual > 0 && (
            <button
              type="button"
              className="lightbox-seta esq"
              onClick={(e) => {
                e.stopPropagation();
                mudarLb(-1);
              }}
              aria-label="Foto anterior"
            >
              ‹
            </button>
          )}

          {imagens.length > 1 && atual < imagens.length - 1 && (
            <button
              type="button"
              className="lightbox-seta dir"
              onClick={(e) => {
                e.stopPropagation();
                mudarLb(1);
              }}
              aria-label="Próxima foto"
            >
              ›
            </button>
          )}

          <div className="lightbox-faixa" ref={faixaLb} onScroll={aoRolarLb}>
            {imagens.map((src, i) => (
              <div key={src + i} className="lightbox-slide">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${nome} - foto ${i + 1}`}
                  className={ampliada && i === atual ? "ampliada" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    const slide = e.currentTarget.parentElement;
                    const zoom = !ampliada;
                    setAmpliada(zoom);
                    if (zoom && slide) {
                      requestAnimationFrame(() => {
                        slide.scrollLeft =
                          (slide.scrollWidth - slide.clientWidth) / 2;
                        slide.scrollTop =
                          (slide.scrollHeight - slide.clientHeight) / 2;
                      });
                    }
                  }}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}