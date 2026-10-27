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
  title: { default: "Nome da Loja", template: "%s | Nome da Loja" },
  description: "Roupas com atendimento pelo WhatsApp",
  openGraph: { type: "website", locale: "pt_BR", siteName: "Nome da Loja" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >



      <body className="min-h-full flex flex-col">



<a
  href={`https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Tenho uma dúvida.")}`}
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-4 right-4 rounded-full bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
>
  WhatsApp
</a>

        <header className="flex items-center justify-between border-b px-4 py-3">
          <Link href="/produtos" className="font-semibold">
            Minha Loja
          </Link>
          <Link href="/carrinho">Carrinho</Link>
        </header>

        {children}



       <footer className="mt-auto border-t px-4 py-6 text-center text-sm text-neutral-600">
  © {new Date().getFullYear()} Nome da Loja
</footer>



      </body>
    </html>
  );
}