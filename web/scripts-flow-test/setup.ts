import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const ADMIN_EMAIL = "flow-admin@test.local";
const MEMBER_EMAIL = "flow-member@test.local";
const PASSWORD = "TestPass123!";

async function main() {
  // Dependency-safe cleanup of any leftover state from previous runs.
  const flowUsers = await prisma.user.findMany({
    where: { email: { in: [ADMIN_EMAIL, MEMBER_EMAIL] } },
    select: { id: true },
  });
  const flowIds = flowUsers.map((u) => u.id);
  const flowAchievements = await prisma.achievement.findMany({
    where: { name: { startsWith: "Flow " } },
    select: { id: true },
  });
  await prisma.certificate.deleteMany({
    where: {
      OR: [{ userId: { in: flowIds } }, { issuedById: { in: flowIds } }],
    },
  });
  if (flowIds.length) {
    await prisma.user.deleteMany({ where: { id: { in: flowIds } } });
  }
  if (flowAchievements.length) {
    await prisma.achievement.deleteMany({ where: { id: { in: flowAchievements.map((a) => a.id) } } });
  }
  await prisma.event.deleteMany({ where: { title: "Flow Test Event" } });
  // Zero out auth rate-limit counters so repeated test runs are not blocked.
  await prisma.rateLimit.deleteMany({
    where: { key: { startsWith: "register" } },
  });
  await prisma.rateLimit.deleteMany({
    where: { key: { startsWith: "login" } },
  });

  // Create (or reset) only the test ADMIN; the member registers via the API.
  const hash = await bcrypt.hash(PASSWORD, 12);
  await prisma.user.create({
    data: { email: ADMIN_EMAIL, fullName: "Flow Admin", passwordHash: hash, role: "ADMIN", status: "APPROVED" },
  });

  // Reference achievements used by the flow tests
  await prisma.achievement.deleteMany({
    where: { name: { in: ["Flow First Mission", "Flow XP Milestone", "Flow Event Goer", "Flow Project Builder", "Flow Manual Badge"] } },
  });
  await prisma.achievement.createMany({
    data: [
      { name: "Flow First Mission", description: "Complete your first mission", icon: "target", criteria: "MISSIONS_COMPLETED", threshold: 1, xpReward: 0 },
      { name: "Flow XP Milestone", description: "Reach 100 total XP", icon: "trophy", criteria: "XP_TOTAL", threshold: 100, xpReward: 100 },
      { name: "Flow Event Goer", description: "Attend your first event", icon: "calendar", criteria: "EVENTS_ATTENDED", threshold: 1, xpReward: 25 },
      { name: "Flow Project Builder", description: "Join your first project", icon: "rocket", criteria: "PROJECTS_JOINED", threshold: 1, xpReward: 10 },
      { name: "Flow Manual Badge", description: "Awarded by an admin", icon: "medal", criteria: "MANUAL", threshold: 0, xpReward: 0 },
    ],
  });

  console.log(JSON.stringify({ adminEmail: ADMIN_EMAIL, memberEmail: MEMBER_EMAIL, password: PASSWORD }));
  console.log("SETUP_OK");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());