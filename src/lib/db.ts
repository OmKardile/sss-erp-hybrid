import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createClient() {
  return new PrismaClient({ log: ['query'] })
}

let db = globalForPrisma.prisma ?? createClient()

// Staleness check: if 'sale' model is missing, the cached client predates the Sale schema.
// Recreate the client so newly-added models are available without a full server restart.
if (process.env.NODE_ENV !== 'production') {
  if (!(db as any).sale) {
    try {
      db.$disconnect?.()
    } catch {}
    db = createClient()
    globalForPrisma.prisma = db
  } else {
    globalForPrisma.prisma = db
  }
}

export { db }
