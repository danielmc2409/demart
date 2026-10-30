-- CreateEnum
CREATE TYPE "TipoEntrega" AS ENUM ('RETIRADA', 'ENTREGA');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('PIX', 'CARTAO', 'DINHEIRO');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "endereco" TEXT,
ADD COLUMN     "entrega" "TipoEntrega" NOT NULL DEFAULT 'RETIRADA',
ADD COLUMN     "pagamento" "FormaPagamento" NOT NULL DEFAULT 'PIX';
