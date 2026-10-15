import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error'],
  })
}

let db = globalForPrisma.prisma ?? createClient()

// Staleness check: if any recent model is missing, the cached client predates the latest schema.
if (process.env.NODE_ENV !== 'production') {
  if (!(db as any).target || !(db as any).adjustment || !(db as any).sale) {
    try {
      db.$disconnect?.()
    } catch {}
    db = createClient()
    globalForPrisma.prisma = db
  } else {
    globalForPrisma.prisma = db
  }
}

// Ensure only one client exists in production too
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = db
}

export { db }
