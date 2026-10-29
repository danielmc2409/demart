// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "DM", template: "%s | DM" },
  description: "Roupas com atendimento pelo WhatsApp",
  openGraph: { type: "website", locale: "pt_BR", siteName: "DM" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >



      <body className="min-h-full flex flex-col">
          <header className="head">
            <Link href="/"> <img src="/img/demart.png" alt="Demart" className="logo" /></Link>
           
            <Link href="/carrinho">
  <img src="/img/carrinho.png" alt="Carrinho" className="icone-carrinho" />
</Link>
            
          </header>

        {children}



       <footer className="pe">
  © {new Date().getFullYear()} Demart

  <a
  href={`https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Tenho uma dúvida.")}`}
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-4 right-4 rounded-full bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
>
  WhatsApp
</a>
</footer>



      </body>
    </html>
  );
}