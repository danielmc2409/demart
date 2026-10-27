// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  await prisma.product.upsert({
    where: { slug: "camiseta-basica-preta" },
    update: {},
    create: {
      slug: "camiseta-basica-preta",
      nome: "Camiseta Básica Preta",
      descricao: "100% algodão",
      precoCentavos: 5990,
      categoria: "camisetas",
      imagens: [],
      variantes: {
        create: [
          { tamanho: "P", cor: "Preto", estoque: 5 },
          { tamanho: "M", cor: "Preto", estoque: 3 },
          { tamanho: "G", cor: "Preto", estoque: 0 },
        ],
      },
    },
  });
}

main()
  .then(() => console.log("Seed ok"))
  .finally(() => prisma.$disconnect());