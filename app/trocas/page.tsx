// app/trocas-e-devolucoes/page.tsx
import type { Metadata } from "next";
import { LOJA } from "@/lib/loja";

export const metadata: Metadata = {
  title: "Trocas e Devoluções",
  description:
    "Como funcionam as trocas, devoluções e o direito de arrependimento nas compras da Demart.",
};

// ---- AJUSTE AQUI conforme a política real da loja ----
const PRAZO_TROCA_DIAS = 7; // troca por tamanho/modelo
const EMAIL = "de.mart2422@gmail.com";
// ------------------------------------------------------

export default function TrocasEDevolucoes() {
  const numero = process.env.WHATSAPP_NUMBER;
  const whats = numero
    ? `https://wa.me/${numero}?text=${encodeURIComponent(
        "Olá! Quero falar sobre uma troca ou devolução.",
      )}`
    : null;

  return (
    <main className="lgpd">
      <h1>Trocas e Devoluções</h1>
      <p className="lgpd-data">Última atualização: 3 de novembro de 2026</p>

      <p>
        Queremos que você fique satisfeito com a sua compra. Veja abaixo como
        funcionam o arrependimento, a troca e o que fazer se o produto chegar
        com problema.
      </p>

      <h2>1. Direito de arrependimento (7 dias)</h2>
      <p>
        Como a compra é feita pelo site e finalizada pelo WhatsApp, você pode
        desistir dela em até <strong>7 dias corridos</strong> a partir do
        recebimento do produto (ou da retirada na loja), sem precisar dar
        explicações, conforme o art. 49 do Código de Defesa do Consumidor.
      </p>
      <ul>
        <li>O produto deve estar sem uso, sem lavagem e com as etiquetas.</li>
        <li>
          Devolvemos o valor pago integralmente, pela mesma forma de
          pagamento (Pix, cartão ou dinheiro).
        </li>
        <li>
          Se o frete foi pago por você, ele também é devolvido nesse caso.
        </li>
      </ul>

      <h2>2. Troca por tamanho ou modelo</h2>
      <p>
        Se o tamanho não serviu, você pode pedir a troca em até{" "}
        <strong>{PRAZO_TROCA_DIAS} dias</strong> após o recebimento, sujeita à
        disponibilidade em estoque.
      </p>
      <ul>
        <li>
          O produto deve estar sem uso, sem lavagem, sem odores e com as
          etiquetas.
        </li>
        <li>
          Se o item desejado estiver esgotado, devolvemos o valor pago ou você
          escolhe outro produto.
        </li>
        <li>
          A troca pode ser feita na loja ou combinada pelo WhatsApp, no caso
          de entrega.
        </li>
      </ul>

      <h2>3. Produto com defeito</h2>
      <p>
        Se o produto chegar com defeito de fabricação ou diferente do que foi
        pedido, avise-nos o quanto antes, dentro dos prazos previstos no
        Código de Defesa do Consumidor. Envie fotos pelo WhatsApp para agilizar
        o atendimento. Conforme o caso, faremos a troca, o reparo ou a
        devolução do valor pago.
      </p>

      <h2>4. Como solicitar</h2>
      <ol>
        <li>
          Entre em contato
          {whats ? (
            <>
              {" "}
              pelo{" "}
              <a href={whats} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>{" "}
              ou
            </>
          ) : null}{" "}
          pelo e-mail <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
        </li>
        <li>
          Informe seu nome, o código do pedido (ex.: #A1B2C3) e o motivo.
        </li>
        <li>
          Combine a devolução ou troca: na loja ({LOJA.nome}) ou por envio, de
          acordo com a forma como você recebeu o pedido.
        </li>
        <li>
          Após conferirmos o produto, concluímos a troca ou o reembolso.
        </li>
      </ol>

      <h2>5. Reembolso</h2>
      <p>
        O reembolso é feito pela mesma forma de pagamento usada na compra. Em
        pagamentos por Pix ou dinheiro, combinamos com você a devolução do
        valor assim que o produto for conferido.
      </p>

      <h2>6. Contato</h2>
      <p>
        Dúvidas sobre trocas e devoluções:{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </p>
    </main>
  );
}