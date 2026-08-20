import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const member = await prisma.user.findUnique({
    where: { email: "flow-member@test.local" },
    include: {
      achievements: { include: { achievement: true } },
      certificates: true,
      missions: true,
      activities: { orderBy: { createdAt: "asc" } },
      eventRegistrations: true,
    },
  });
  if (!member) {
    console.log("NO_TEST_MEMBER");
    return;
  }
  console.log("=== POINTS:", member.points);
  console.log("=== USER_ACHIEVEMENTS:");
  for (const ua of member.achievements) console.log(`  ${ua.achievement.name} xp=${ua.achievement.xpReward} at=${ua.earnedAt.toISOString()}`);
  console.log("=== ACTIVITIES:");
  for (const a of member.activities) console.log(`  ${a.type} | ${a.points} | ref=${a.refId} | ${a.createdAt.toISOString()}`);
  console.log("=== CERTIFICATES:");
  for (const c of member.certificates) console.log(`  ${c.id} | ${c.certificateNumber} | ${c.status}`);
  console.log("=== MISSIONS:");
  for (const m of member.missions) console.log(`  ${m.text} | ${m.status} | points=${m.points} | pointsAwarded=${m.pointsAwarded}`);
}

main().finally(() => prisma.$disconnect());