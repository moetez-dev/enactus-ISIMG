import "server-only";

import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "APPLICATION"
  | "MISSION"
  | "XP"
  | "ACHIEVEMENT"
  | "CERTIFICATE"
  | "EVENT"
  | "PROJECT"
  | "ANNOUNCEMENT";

/**
 * Creates a single in-app notification. Call inside the same transaction as
 * the event that caused it when the event is multi-step so the notification
 * cannot be orphaned if the parent write fails.
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
    },
  });
}

/**
 * Broadcasts an announcement to every approved member (and optionally admins).
 * Used by admins to push important messages to the whole club.
 */
export async function broadcastAnnouncement({
  title,
  message,
  link,
}: {
  title: string;
  message?: string;
  link?: string;
}) {
  const targetUsers = await prisma.user.findMany({
    where: { status: "APPROVED" },
    select: { id: true },
  });
  if (targetUsers.length === 0) return 0;
  const data = targetUsers.map((u) => ({
    userId: u.id,
    type: "ANNOUNCEMENT" as const,
    title,
    message,
    link,
  }));
  const result = await prisma.notification.createMany({ data });
  return result.count;
}