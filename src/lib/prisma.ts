import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://jiangyuming@localhost:5432/couple_agent_dev?schema=public";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString })
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
