// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LOJA } from "@/lib/loja";
import CartLink from "./cart-link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Demart | Moda Masculina", template: "%s | Demart" },
  description: "Moda masculina com atendimento pelo WhatsApp. Retirada ou entrega em Remígio-PB.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Demart",
    title: "Demart | Moda Masculina",
    description: "Moda masculina com atendimento pelo WhatsApp.",
  },
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  const whats = `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Olá! Tenho uma dúvida."
  )}`;

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="head">
          <Link href="/">
            <img src="/img/logo.webp" alt="Demart" className="logo" />
          </Link>
          <CartLink />
        </header>

        {children}

        <footer className="pe">
          <div className="pe-grid">
            <div>
              <p className="pe-titulo">Siga a {LOJA.nome}</p>
              <a
                href={LOJA.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pe-insta"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
                </svg>
                {LOJA.instagramUser}
              </a>
            </div>

            <div>
              <p className="pe-titulo">Atendimento</p>
              <a href={whats} target="_blank" rel="noopener noreferrer" className="pe-link">
                Falar pelo WhatsApp
              </a>
              <p>{LOJA.horario}</p>
            </div>
          </div>

          <div className="pe-legal">
            <p>
              © {new Date().getFullYear()} {LOJA.nome}. Todos os direitos reservados.
            </p>
            <p>
              {LOJA.razaoSocial} · {LOJA.documento}
            </p>
            <p>{LOJA.endereco}</p>
            {LOJA.desenvolvidoPor && <p>Desenvolvido por {LOJA.desenvolvidoPor}</p>}
          </div>
          <div className="troca"> <a href="/trocas">Trocas e Devoluções</a>
          <a href="/lgpd">Política de Privacidade</a></div>
         
          
        </footer>
        <a
          href={whats}
          target="_blank"
          rel="noopener noreferrer"
          className="whats-flutuante"
          aria-label="Falar no WhatsApp"
        >
          <img src="/whats.svg" alt="" />
        </a>
      </body>
    </html>
  );
}