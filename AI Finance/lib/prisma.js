import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton to prevent multiple instances
 * in development (hot-reload creates new connections otherwise).
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

/** @type {ReturnType<typeof prismaClientSingleton>} */
const globalForPrisma = globalThis;

const db = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export { db };
