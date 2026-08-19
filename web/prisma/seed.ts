// ─────────────────────────────────────────────────────────────
// Seed script — migrates all content from the legacy Enactus
// ISIMG static site into the new PostgreSQL database.
//
// Run:  npm run db:seed
// ─────────────────────────────────────────────────────────────

import { PrismaClient, Role, MemberStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── Departments ────────────────────────────────────────────
  const departments = [
    { name: "Projects", slug: "projects", icon: "lightbulb", description: "Design and drive entrepreneurial projects that solve real problems." },
    { name: "Media", slug: "media", icon: "camera", description: "Produce visual content, photography and videography for the club." },
    { name: "HR", slug: "hr", icon: "users", description: "Manage applications, onboarding and internal member culture." },
    { name: "Marketing", slug: "marketing", icon: "megaphone", description: "Promote the club brand, events and achievements." },
  ];

  for (const d of departments) {
    await prisma.department.upsert({
      where: { slug: d.slug },
      update: {},
      create: d,
    });
  }

  const deptProjects = await prisma.department.findUnique({ where: { slug: "projects" } });
  const deptMedia = await prisma.department.findUnique({ where: { slug: "media" } });

  // ── Projects (content migrated from legacy index.js) ───────
  const projects = [
    {
      name: "Fytrlance",
      slug: "fytrlance",
      tag: "Tech & Work",
      problem:
        "High unemployment rates among tech students in Gabès who lack access to professional freelance markets.",
      solution:
        "A specialised platform bridging ISIMG students and businesses, offering mentorship and real-world projects.",
      impact:
        "Reducing youth unemployment and building professional portfolios for 50+ students in the Gabès region.",
      image: "/images/projects/fytrlance.jpg",
      progress: 70,
      order: 1,
      departmentId: deptProjects?.id,
    },
    {
      name: "Bioverto",
      slug: "bioverto",
      tag: "Eco-Wellness",
      problem:
        "Chemical waste in household products and a lack of organic alternatives in the local market.",
      solution:
        "Producing sustainable, 100% organic household solutions using local resources from the Gabès region.",
      impact:
        "Promoting a healthy lifestyle and reducing toxic waste in 200+ households across Gabès.",
      image: "/images/projects/bioverto.jpg",
      progress: 55,
      order: 2,
      departmentId: deptProjects?.id,
    },
    {
      name: "Aeroflora",
      slug: "aeroflora",
      tag: "Tech & Work",
      problem: "Limited access to modern agricultural techniques in urban areas.",
      solution:
        "Providing innovative greenhouse solutions for urban agriculture, enabling year-round cultivation.",
      impact:
        "Transforming urban spaces into productive green zones and supporting food security in the region.",
      image:
        "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1200&q=80",
      progress: 40,
      order: 3,
      departmentId: deptProjects?.id,
    },
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  // ── Team (leadership + enactors, migrated from legacy JS) ──
  const team = [
    // Leadership 2025
    { name: "Ghofran Chergui", role: "President", img: "/images/team/ghofran-chergui.jpg", fb: "https://www.facebook.com/ghofrane.ch.482052", ig: "https://www.instagram.com/ghofranechergui/", leadership: true, order: 1 },
    { name: "Azmi Ben Hassine", role: "Vice President", img: "/images/team/azmi-ben-hassine.jpg", fb: "https://www.facebook.com/share/18oC3pmxQx/", ig: "https://www.instagram.com/azmi_ben_hassine/", leadership: true, order: 2 },
    { name: "Naceur Zidi", role: "Media Coord", img: "/images/team/naceur-zidi.jpg", fb: "https://www.facebook.com/naser.zidi.351", ig: "https://www.instagram.com/si_naceur02/", leadership: true, order: 3 },
    { name: "Moetez Maraach", role: "Media Board", img: "/images/team/moetez-maraach.jpg", fb: "https://www.facebook.com/moetez.maraach", ig: "https://www.instagram.com/moet_________ez/", leadership: true, order: 4 },
    { name: "Jihen Hamdi", role: "HR Manager", img: "/images/team/jihen-hamdi.jpg", fb: "https://www.facebook.com/hamdi.jihen.35", ig: "https://www.instagram.com/jihenhamdi_/", leadership: true, order: 5 },
    { name: "Hela Lakhdhar", role: "Project Manager", img: "/images/team/hela-lakhdhar.jpg", fb: "https://www.facebook.com/hela.lakhdhar.2025", ig: "https://www.instagram.com/hela.lakhdhar/", leadership: true, order: 6 },
    { name: "Mohamed Amin", role: "Graphic Design", img: "/images/team/mohamed-amin.jpg", fb: "https://www.facebook.com/amin.alouane.73", ig: "https://www.instagram.com/mohamed_al_amin71/", leadership: true, order: 7 },
    { name: "Dhia Ben Salha", role: "Marketing", img: "/images/team/dhia-ben-salha.jpg", fb: "https://www.facebook.com/dhia.ben.salha.2025", ig: null, leadership: true, order: 8 },
    { name: "Nahla Ben Yahya", role: "Event Manager", img: "/images/team/nahla-ben-yahya.jpg", fb: "https://www.facebook.com/nhlt.bnyhy", ig: "https://www.instagram.com/nahla_benyahia/", leadership: true, order: 9 },
    { name: "Oumayma Ben Salem", role: "Finance", img: "/images/team/oumayma-ben-salem.jpg", fb: "https://www.facebook.com/oumayma.salem.31", ig: "https://www.instagram.com/oumayma.sl.31/", leadership: true, order: 10 },
    // Active members
    { name: "Hamza Miled", role: "Active Member", img: "/images/team/hamza-miled.jpg", fb: "https://www.facebook.com/hamza.miled.3994", ig: "https://www.instagram.com/hamza.miled_/", leadership: false, order: 1 },
    { name: "Ahlem Ben Moussa", role: "Active Member", img: "/images/team/ahlem-ben-moussa.jpg", fb: "https://www.facebook.com/ahlam.benmoussa.904", ig: "https://www.instagram.com/ahlaam.benm/", leadership: false, order: 2 },
    { name: "Khadija Samir", role: "Active Member", img: "/images/team/khadija-samir.png", fb: "https://www.facebook.com/khadija.samir.9085", ig: "https://www.instagram.com/khadija_samiir/", leadership: false, order: 3 },
  ];

  for (const t of team) {
    const exists = await prisma.teamMember.findFirst({ where: { name: t.name } });
    if (exists) continue;
    await prisma.teamMember.create({
      data: {
        name: t.name,
        role: t.role,
        image: t.img,
        facebook: t.fb,
        instagram: t.ig,
        isLeadership: t.leadership,
        order: t.order,
      },
    });
  }

  // ── Site stats & Enactor of the Month (settings) ───────────
  await prisma.setting.upsert({
    where: { key: "eom" },
    update: {
      value: {
        name: "Moetez Maraach",
        desc: 'Outstanding leadership in the "Green Tech" event.',
        img: "/images/team/moetez-maraach.jpg",
      },
    },
    create: {
      key: "eom",
      value: {
        name: "Moetez Maraach",
        desc: 'Outstanding leadership in the "Green Tech" event.',
        img: "/images/team/moetez-maraach.jpg",
      },
    },
  });

  await prisma.setting.upsert({
    where: { key: "siteStats" },
    update: {
      value: { projects: 12, enactors: 50, livesImpacted: "1.2k", activeEnactors: 22 },
    },
    create: {
      key: "siteStats",
      value: { projects: 12, enactors: 50, livesImpacted: "1.2k", activeEnactors: 22 },
    },
  });

  await prisma.setting.upsert({
    where: { key: "announcement" },
    update: {
      value: {
        text: "🏆 Limitl'ESS Champions 2025 · Social & Solidarity Economy Excellence, Tunisia",
        enabled: true,
      },
    },
    create: {
      key: "announcement",
      value: {
        text: "🏆 Limitl'ESS Champions 2025 · Social & Solidarity Economy Excellence, Tunisia",
        enabled: true,
      },
    },
  });

  // ── Demo events (dates relative to today) ──────────────────
  const inDays = (n: number, hour = 9) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  if ((await prisma.event.count()) === 0) {
    await prisma.event.createMany({
      data: [
        { title: "Green Tech Day", description: "A full day dedicated to green innovation and sustainability workshops.", date: inDays(30), location: "ISIMG, Gabès" },
        { title: "Entrepreneurship Bootcamp", description: "Hands-on training on business models and pitching.", date: inDays(75), location: "ISIMG, Gabès" },
      ],
    });
  }

  // ── Demo news ───────────────────────────────────────────────
  if ((await prisma.news.count()) === 0) {
    await prisma.news.createMany({
      data: [
        { title: "Welcome to the new season", description: "Enactus ISIMG is back with a fresh season of projects, events and impact." },
        { title: "Limitl'ESS Champions", description: "The club was recognised for excellence in Social and Solidarity Economy in Tunisia." },
      ],
    });
  }

  // ── Bootstrap admin + demo member ───────────────────────────
  const adminEmail = (process.env.SEED_ADMIN_EMAILS || "admin@enactus-isimg.tn")
    .split(",")[0]
    .trim();

  const randomPassword = (process.env.SEED_ADMIN_PASSWORD || "").trim() ||
    (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2));

  const adminHash = await bcrypt.hash(randomPassword, 12);
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: adminHash,
        fullName: "Enactus Admin",
        role: Role.ADMIN,
        status: MemberStatus.APPROVED,
        departmentId: deptMedia?.id,
      },
    });

    if (!process.env.SEED_ADMIN_PASSWORD) {
      console.log("");
      console.log("┌──────────────────────────────────────────────────────┐");
      console.log("│  SEEDED ADMIN ACCOUNT (dev only)                    │");
      console.log(`│  email:    ${adminEmail.padEnd(35)}│`);
      console.log(`│  password: ${randomPassword}            │`);
      console.log("│  Change it after first login.                      │");
      console.log("└──────────────────────────────────────────────────────┘");
      console.log("");
    }
  } else {
    console.log(`Admin ${adminEmail} already exists — skipped.`);
  }

  console.log("✔ Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });