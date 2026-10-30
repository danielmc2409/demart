import { prisma } from "../lib/prisma";

async function main() {
  await prisma.cupom.upsert({
    where: { codigo: "BEMVINDO10" },
    update: {},
    create: { codigo: "BEMVINDO10", tipo: "PERCENTUAL", valor: 10, minimoCentavos: 5000 },
  });

  await prisma.cupom.upsert({
    where: { codigo: "FRETE15" },
    update: {},
    create: { codigo: "FRETE15", tipo: "FIXO", valor: 1500, usosMaximos: 100 },
  });
}

main().finally(() => prisma.$disconnect());