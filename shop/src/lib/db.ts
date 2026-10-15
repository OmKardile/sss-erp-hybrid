import { PrismaClient } from "@prisma/client";

// Singleton Prisma client using SHOP_DATABASE_URL (configured in schema.prisma).
// Avoids exhausting DB connections during Next.js hot reloads.
const globalForPrisma = globalThis as unknown as {
  prismaShop: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prismaShop ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaShop = db;
}
