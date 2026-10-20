import { PrismaClient } from "@prisma/client";

/**
 * Единый клиент Prisma.
 * В dev — логируем запросы; в prod — только ошибки.
 */
export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}
