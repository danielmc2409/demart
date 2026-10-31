"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Atualiza a lista de pedidos sozinha e avisa na aba quando chega um pedido novo.
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

  // busca de novo no servidor a cada X segundos (só com a aba aberta e visível)
  useEffect(() => {
    const atualizar = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = setInterval(atualizar, segundos * 1000);
    document.addEventListener("visibilitychange", atualizar);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", atualizar);
    };
  }, [router, segundos]);

  // pedido novo: troca o título da aba até você voltar para ela
  useEffect(() => {
    if (ultimo <= visto.current) return;
    visto.current = ultimo;

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
  }, [ultimo]);

  return null;
}