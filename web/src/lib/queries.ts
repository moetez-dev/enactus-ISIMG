import "server-only";

import { prisma } from "@/lib/prisma";
import { cache } from "react";

export const getDepartments = cache(async () => {
  return prisma.department.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
    },
  });
});

export const getProjects = cache(async () => {
  return prisma.project.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      tag: true,
      problem: true,
      solution: true,
      impact: true,
      image: true,
      progress: true,
      department: { select: { id: true, name: true, slug: true } },
    },
  });
});

export const getProjectBySlug = cache(async (slug: string) => {
  return prisma.project.findFirst({
    where: { slug, published: true },
    include: { department: true },
  });
});

export const getLeadershipTeam = cache(async () => {
  return prisma.teamMember.findMany({
    where: { published: true, isLeadership: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
});

export const getEnactors = cache(async () => {
  return prisma.teamMember.findMany({
    where: { published: true, isLeadership: false },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
});

export const getEvents = cache(async () => {
  return prisma.event.findMany({
    where: { published: true, date: { gte: new Date() } },
    orderBy: { date: "asc" },
  });
});

export const getSetting = cache(async (key: string) => {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting ? (setting.value as Record<string, unknown>) : null;
});

export const getEom = cache(async () => {
  return getSetting("eom");
});

export const getSiteStats = cache(async () => {
  return getSetting("siteStats");
});

export const getAnnouncement = cache(async () => {
  return getSetting("announcement");
});