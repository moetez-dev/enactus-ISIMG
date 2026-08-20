import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, role: true, status: true, points: true, createdAt: true },
  });
  for (const u of users) console.log(`USER ${u.id} | ${u.email} | ${u.role} | ${u.status} | pts=${u.points} | ${u.createdAt.toISOString()}`);
  console.log("users total:", users.length);
  console.log("achievements:", await prisma.achievement.count());
  for (const a of await prisma.achievement.findMany({ orderBy: { createdAt: "asc" } }))
    console.log(`  ACH ${a.id} | ${a.name} | ${a.criteria} | thr=${a.threshold} | xp=${a.xpReward} | active=${a.active}`);
  console.log("userAchievements:", await prisma.userAchievement.count());
  for (const ua of await prisma.userAchievement.findMany({ include: { user: { select: { email: true } }, achievement: { select: { name: true } } } }))
    console.log(`  UA ${ua.user.email} -> ${ua.achievement.name}`);
  console.log("certificates:", await prisma.certificate.count());
  for (const c of await prisma.certificate.findMany({ include: { user: { select: { email: true } } } }))
    console.log(`  CERT ${c.id} | ${c.certificateNumber} | ${c.status} | ${c.user.email}`);
  console.log("events:", await prisma.event.count());
  for (const e of await prisma.event.findMany()) console.log(`  EV ${e.id} | ${e.title} | ${e.published}`);
}

main().finally(() => prisma.$disconnect());