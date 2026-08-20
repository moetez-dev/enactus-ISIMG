import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.rateLimit.findMany({
    select: { key: true, windowStart: true, count: true },
    orderBy: { updatedAt: "desc" },
  });
  for (const r of rows) console.log(`${r.key} | w=${r.windowStart} | n=${r.count}`);
  console.log("total:", rows.length);
}

main().finally(() => prisma.$disconnect());