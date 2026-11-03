"use client";

import { useEffect, useRef, useState } from "react";

// reduz a foto antes de enviar: máx. 1600 px, JPEG
async function reduzir(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const escala = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * escala);
  const h = Math.round(bmp.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; // PNG com fundo transparente fica com fundo branco
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Não foi possível ler a foto"))),
      "image/jpeg",
      0.85,
    ),
  );
}

export default function FotosInput({
  name = "imagens",
  inicial = [],
}: {
  name?: string;
  inicial?: string[];
}) {
  const [fotos, setFotos] = useState<string[]>(inicial);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const campo = useRef<HTMLTextAreaElement>(null);

  // impede salvar o produto enquanto as fotos ainda estão subindo
  useEffect(() => {
    campo.current?.setCustomValidity(
      enviando ? "Aguarde o envio das fotos terminar." : "",
    );
  }, [enviando]);

  async function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (arquivos.length === 0) return;

    setErro("");
    setEnviando(true);
    for (const arq of arquivos) {
      try {
        const blob = await reduzir(arq);
        const fd = new FormData();
        fd.append("arquivo", blob, "foto.jpg");

        const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.erro ?? "Falha no envio");

        setFotos((f) => [...f, j.url]);
      } catch (err) {
        setErro(`${arq.name}: ${err instanceof Error ? err.message : "erro"}`);
      }
    }
    setEnviando(false);
  }

  function mover(i: number, dir: -1 | 1) {
    setFotos((f) => {
      const j = i + dir;
      if (j < 0 || j >= f.length) return f;
      const novo = [...f];
      [novo[i], novo[j]] = [novo[j], novo[i]];
      return novo;
    });
  }

  function remover(i: number) {
    setFotos((f) => f.filter((_, k) => k !== i));
  }

  return (
    <div>
      <p className="text-sm font-medium">Fotos (a primeira é a capa)</p>

      <div className="mt-2 flex flex-wrap gap-3">
        {fotos.map((url, i) => (
          <div key={url} className="w-24">
            <img
              src={url}
              alt={`Foto ${i + 1}`}
              className="h-32 w-24 rounded border object-cover"
            />
            {i === 0 && <p className="mt-1 text-center text-xs font-medium">Capa</p>}
            <div className="mt-1 flex justify-between text-sm">
              <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Mover para trás">
                ◀
              </button>
              <button type="button" onClick={() => remover(i)} aria-label="Remover foto" className="text-red-600">
                ✕
              </button>
              <button type="button" onClick={() => mover(i, 1)} disabled={i === fotos.length - 1} aria-label="Mover para frente">
                ▶
              </button>
            </div>
          </div>
        ))}
      </div>

      <label className="mt-3 inline-block cursor-pointer rounded border px-3 py-2 text-sm">
        {enviando ? "Enviando..." : "+ Adicionar fotos"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={escolher}
          disabled={enviando}
        />
      </label>

      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}

      {/* campo que vai no formulário: um endereço por linha */}
      <textarea
        ref={campo}
        name={name}
        value={fotos.join("\n")}
        onChange={() => {}}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}