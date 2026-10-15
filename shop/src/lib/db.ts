import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaShop: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prismaShop ??
  new PrismaClient({
    log: ["error"],
  });

// Always cache the client to prevent pool exhaustion
globalForPrisma.prismaShop = db;
