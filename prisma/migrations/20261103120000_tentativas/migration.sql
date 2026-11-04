-- CreateTable
CREATE TABLE "Tentativa" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tentativa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Tentativa_chave_criadoEm_idx" ON "Tentativa"("chave", "criadoEm");