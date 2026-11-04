// app/lgpd/page.tsx
import type { Metadata } from "next";
import { LOJA } from "@/lib/loja";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como a Demart coleta, usa e protege os seus dados pessoais.",
};

const EMAIL = "de.mart2422@gmail.com";

export default function PoliticaPrivacidade() {
  return (
    <main className="lgpd">
      <h1>Política de Privacidade</h1>
      <p className="lgpd-data">Última atualização: 3 de novembro de 2026</p>

      <p>
        Esta Política explica como a <strong>Demart</strong> coleta, usa,
        armazena e protege os dados pessoais de quem visita o site e faz
        pedidos, em conformidade com a Lei Geral de Proteção de Dados (Lei nº
        13.709/2018 – LGPD).
      </p>

      <h2>1. Quem somos</h2>
      <p>A Demart é a controladora dos dados tratados neste site.</p>
      <ul>
        <li>
          <strong>Razão social / nome:</strong> {LOJA.razaoSocial}
        </li>
        <li>
          <strong>CNPJ / CPF:</strong>{" "}
          {LOJA.documento || "[preencha em lib/loja.ts]"}
        </li>
        <li>
          <strong>Endereço:</strong> Rua Severino Bronzeado, 84, Centro,
          Remígio – PB
        </li>
        <li>
          <strong>Contato para assuntos de privacidade:</strong>{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </li>
      </ul>

      <h2>2. Quais dados coletamos</h2>
      <p>
        O site não exige cadastro nem login de clientes. Coletamos apenas o
        necessário para registrar e atender o seu pedido:
      </p>
      <ul>
        <li>
          <strong>Nome</strong>, informado ao finalizar o pedido.
        </li>
        <li>
          <strong>Endereço de entrega</strong> (rua, número, bairro e
          complemento), somente se você escolher receber em casa.
        </li>
        <li>
          <strong>Dados do pedido:</strong> produtos, tamanhos, cores,
          quantidades, valor total, forma de entrega (retirada ou entrega),
          local de retirada e forma de pagamento escolhida (Pix, cartão ou
          dinheiro).
        </li>
        <li>
          <strong>Número de telefone e conteúdo das mensagens</strong>, que
          chegam até nós quando você envia o pedido pelo WhatsApp ou nos chama
          para tirar dúvidas.
        </li>
      </ul>
      <p>
        Não coletamos dados de cartão de crédito, senhas bancárias nem
        documentos pelo site. O pagamento é combinado diretamente com a loja.
      </p>

      <h2>3. Para que usamos seus dados</h2>
      <ul>
        <li>Registrar o pedido e reservar o estoque.</li>
        <li>
          Atender você pelo WhatsApp, confirmar o pedido e combinar pagamento,
          retirada ou entrega.
        </li>
        <li>Entregar o produto no endereço informado.</li>
        <li>
          Cumprir obrigações legais, fiscais e de defesa do consumidor.
        </li>
        <li>Exercer direitos em eventual disputa, caso necessário.</li>
      </ul>
      <p>
        Não usamos seus dados para criar perfis, vender listas ou enviar
        propaganda sem o seu consentimento.
      </p>

      <h2>4. Base legal</h2>
      <p>Tratamos seus dados com base na LGPD, art. 7º:</p>
      <ul>
        <li>
          <strong>Execução de contrato ou de procedimentos preliminares</strong>
          , a pedido do titular (inciso V), para processar e entregar o seu
          pedido.
        </li>
        <li>
          <strong>Cumprimento de obrigação legal ou regulatória</strong>{" "}
          (inciso II), para registros fiscais e de consumo.
        </li>
        <li>
          <strong>Exercício regular de direitos</strong> (inciso VI), em caso
          de disputa.
        </li>
      </ul>

      <h2>5. Com quem compartilhamos</h2>
      <p>
        Compartilhamos dados somente com quem é necessário para o site e o
        atendimento funcionarem:
      </p>
      <ul>
        <li>
          <strong>WhatsApp (Meta Platforms):</strong> o pedido é enviado por
          essa plataforma, que tem sua própria política de privacidade.
        </li>
        <li>
          <strong>Vercel:</strong> hospedagem do site e armazenamento das
          fotos dos produtos.
        </li>
        <li>
          <strong>Neon:</strong> banco de dados onde os pedidos ficam
          registrados.
        </li>
        <li>
          <strong>Entregador ou transportadora</strong>, quando houver
          entrega, apenas com nome e endereço necessários.
        </li>
        <li>
          <strong>Autoridades públicas</strong>, quando houver obrigação legal
          ou ordem judicial.
        </li>
      </ul>
      <p>Não vendemos nem alugamos seus dados.</p>

      <h2>6. Transferência internacional</h2>
      <p>
        Alguns dos provedores acima podem armazenar dados em servidores fora do
        Brasil. Nesses casos, o tratamento segue os requisitos da LGPD para
        transferência internacional.
      </p>

      <h2>7. Cookies e armazenamento no navegador</h2>
      <p>
        O site não usa cookies de publicidade nem de rastreamento. Utilizamos
        apenas:
      </p>
      <ul>
        <li>
          <strong>Armazenamento local do navegador (localStorage):</strong>{" "}
          guarda os itens do seu carrinho neste aparelho, para que você não os
          perca ao fechar a página. Você pode apagá-lo a qualquer momento nas
          configurações do navegador.
        </li>
        <li>
          <strong>Cookie de sessão administrativa:</strong> usado apenas pela
          equipe da loja para acessar o painel interno. Visitantes não recebem
          esse cookie.
        </li>
      </ul>

      <h2>8. Por quanto tempo guardamos</h2>
      <p>
        Mantemos os dados do pedido pelo tempo necessário para concluir a
        compra, prestar suporte, tratar trocas e devoluções e cumprir
        obrigações legais e fiscais. Depois disso, os dados são excluídos ou
        anonimizados, salvo se a lei exigir a guarda por mais tempo.
      </p>

      <h2>9. Seus direitos</h2>
      <p>Nos termos do art. 18 da LGPD, você pode solicitar, a qualquer momento:</p>
      <ul>
        <li>confirmação de que tratamos seus dados;</li>
        <li>acesso aos dados;</li>
        <li>correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>
          anonimização, bloqueio ou eliminação de dados desnecessários ou
          tratados em desconformidade;
        </li>
        <li>
          eliminação dos dados, observadas as hipóteses em que a lei exige a
          guarda;
        </li>
        <li>informação sobre com quem compartilhamos seus dados;</li>
        <li>revogação de consentimento, quando o tratamento se basear nele.</li>
      </ul>
      <p>
        Para exercer qualquer direito, escreva para{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>, informando seu nome e o código
        do pedido (se houver). Responderemos em prazo razoável.
      </p>
      <p>
        Se entender que seus direitos não foram atendidos, você também pode
        recorrer à Autoridade Nacional de Proteção de Dados (ANPD).
      </p>

      <h2>10. Segurança</h2>
      <p>
        Adotamos medidas técnicas e organizacionais para proteger seus dados,
        como conexão segura (HTTPS), acesso restrito ao painel administrativo
        mediante senha e limitação de quem pode ver os pedidos. Nenhum sistema
        é totalmente imune a falhas, mas nos comprometemos a agir com rapidez e
        a comunicar os titulares e a ANPD em caso de incidente relevante,
        conforme a lei.
      </p>

      <h2>11. Menores de idade</h2>
      <p>
        O site não é direcionado a menores de 18 anos. Pedidos de menores devem
        ser feitos com o acompanhamento de um responsável.
      </p>

      <h2>12. Alterações nesta Política</h2>
      <p>
        Podemos atualizar esta Política sempre que o site ou a lei mudarem. A
        data da última atualização aparece no topo desta página.
      </p>

      <h2>13. Contato</h2>
      <p>
        Dúvidas sobre esta Política ou sobre seus dados:{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </p>
    </main>
  );
}