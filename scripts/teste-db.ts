// scripts/teste-db.ts
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 20000,
  }),
});

prisma.order
  .count()
  .then((n) => console.log("OK, pedidos:", n))
  .catch((e) => {
    console.error(e);
    if (e.cause) console.error("CAUSA:", e.cause);
  })
  .finally(() => prisma.$disconnect());