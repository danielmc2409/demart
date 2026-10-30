-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "clienteTelefone" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "CupomUso" (
    "id" TEXT NOT NULL,
    "cupomId" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CupomUso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CupomUso_cupomId_telefone_key" ON "CupomUso"("cupomId", "telefone");

-- AddForeignKey
ALTER TABLE "CupomUso" ADD CONSTRAINT "CupomUso_cupomId_fkey" FOREIGN KEY ("cupomId") REFERENCES "Cupom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
