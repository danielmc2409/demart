-- CreateEnum
CREATE TYPE "TipoCupom" AS ENUM ('PERCENTUAL', 'FIXO');

-- CreateTable
CREATE TABLE "Cupom" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoCupom" NOT NULL,
    "valor" INTEGER NOT NULL,
    "minimoCentavos" INTEGER NOT NULL DEFAULT 0,
    "usosMaximos" INTEGER,
    "usos" INTEGER NOT NULL DEFAULT 0,
    "validoAte" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cupom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cupom_codigo_key" ON "Cupom"("codigo");
