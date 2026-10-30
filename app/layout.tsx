// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LOJA } from "@/lib/loja";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Demart", template: "%s | Demart" },
  description: "Roupas com atendimento pelo WhatsApp",
  openGraph: { type: "website", locale: "pt_BR", siteName: "Demart" },
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
       <div className="top-bar">
  <div className="top-bar-track">
    {[0, 1].map((n) => (
      <div className="top-bar-grupo" key={n} aria-hidden={n === 1}>
        <span>CUPOM PRIMEIRA COMPRA - BEMVINDO10</span>
        <span>FRETE GRÁTIS NAS COMPRAS A PARTIR DE R$ 29,99</span>
        <span>ATENDIMENTO PELO WHATSAPP</span>
      </div>
    ))}
  </div>
</div>
        <header className="head">
          <Link href="/">
            <img src="/img/logo.png" alt="Demart" className="logo" />
          </Link>
          <Link href="/carrinho">
            <img src="/img/carrinho.png" alt="Carrinho" className="icone-carrinho" />
          </Link>
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
        </footer>

        <a
          href={whats}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 rounded-full bg-green-600 px-1 cpy-0.2 text-sm font-medium text-white shadow-lg"
        >
          Whats
        </a>
      </body>
    </html>
  );
}