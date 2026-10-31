"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// bipe duplo gerado pelo navegador (não precisa de arquivo de áudio)
function tocar(ctx: AudioContext) {
  const agora = ctx.currentTime;
  [880, 1175].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const ganho = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(ganho);
    ganho.connect(ctx.destination);

    const t = agora + i * 0.18;
    ganho.gain.setValueAtTime(0.0001, t);
    ganho.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
    ganho.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.start(t);
    osc.stop(t + 0.18);
  });
}

// Atualiza a lista de pedidos sozinha, avisa no título da aba e toca um som
// quando chega um pedido novo.
// `ultimo` = data (em ms) do pedido mais recente que a página mostrou.
export default function AutoRefresh({
  ultimo,
  segundos = 15,
}: {
  ultimo: number;
  segundos?: number;
}) {
  const router = useRouter();
  const visto = useRef(ultimo);
  const tituloOriginal = useRef("");
  const ctxRef = useRef<AudioContext | null>(null);
  const [som, setSom] = useState(false);

  // busca de novo no servidor a cada X segundos (também em segundo plano)
  useEffect(() => {
    const atualizar = () => router.refresh();
    const timer = setInterval(atualizar, segundos * 1000);
    const aoVoltar = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [router, segundos]);

  // pedido novo: som + título da aba até você voltar para ela
  useEffect(() => {
    if (ultimo <= visto.current) return;
    visto.current = ultimo;

    if (som && ctxRef.current) tocar(ctxRef.current);

    if (!tituloOriginal.current) tituloOriginal.current = document.title;
    document.title = "🔔 Novo pedido! | " + tituloOriginal.current;

    const restaurar = () => {
      if (document.visibilityState !== "visible") return;
      document.title = tituloOriginal.current;
      document.removeEventListener("visibilitychange", restaurar);
      window.removeEventListener("focus", restaurar);
    };
    document.addEventListener("visibilitychange", restaurar);
    window.addEventListener("focus", restaurar);
  }, [ultimo, som]);

  function alternarSom() {
    if (som) {
      setSom(false);
      return;
    }
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;

    // criado dentro do clique: é isso que libera o áudio no navegador
    ctxRef.current ??= new Ctx();
    void ctxRef.current.resume();
    tocar(ctxRef.current); // bipe de teste
    setSom(true);
  }

  return (
    <button
      type="button"
      onClick={alternarSom}
      className="mb-4 rounded border px-3 py-1 text-sm"
    >
      {som ? "🔔 Som ligado (clique para desligar)" : "🔕 Ativar som de pedido novo"}
    </button>
  );
}