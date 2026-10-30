-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cupomCodigo" TEXT,
ADD COLUMN     "descontoCentavos" INTEGER NOT NULL DEFAULT 0;
