"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Trash2,
  Target,
  Award,
  BadgeCheck,
  CalendarDays,
  Rocket,
  Megaphone,
  Sparkles,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { Button, EmptyState, Spinner } from "@/components/ui";
import type { MemberNotification } from "@/components/member/types";

const ICONS: Record<string, LucideIcon> = {
  APPLICATION: UserCheck,
  MISSION: Target,
  XP: Sparkles,
  ACHIEVEMENT: Award,
  CERTIFICATE: BadgeCheck,
  EVENT: CalendarDays,
  PROJECT: Rocket,
  ANNOUNCEMENT: Megaphone,
};

function timeAgo(iso: string): string {
  const minutes = Math.max(
    1,
    Math.round((Date.now() - new Date(iso).getTime()) / 60000),
  );
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB");
}

export function MemberNotifications() {
  const { toast } = useToast();
  const [items, setItems] = useState<MemberNotification[] | null>(null);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    setItems(null);
    try {
      const data = await apiFetch<{ notifications: MemberNotification[]; unreadCount: number }>(
        "/api/notifications",
      );
      setItems(data.notifications);
      setUnread(data.unreadCount);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load notifications.");
      setItems([]);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(id: string) {
    try {
      await apiFetch(`/api/notifications/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ read: true }),
      });
      setItems((prev) =>
        (prev ?? []).map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnread((u) => Math.max(0, u - 1));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update notification.");
    }
  }

  async function markAllRead() {
    try {
      await apiFetch("/api/notifications", { method: "POST" });
      setItems((prev) => (prev ?? []).map((n) => ({ ...n, read: true })));
      setUnread(0);
      toast.success("All notifications marked as read.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update notifications.");
    }
  }

  async function remove(id: string) {
    try {
      await apiFetch(`/api/notifications/${id}`, { method: "DELETE" });
      setItems((prev) => (prev ?? []).filter((n) => n.id !== id));
      toast.success("Notification removed.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not remove notification.");
    }
  }

  if (items === null) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
            Notifications
          </h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            {unread > 0 ? `${unread} unread` : "You are all caught up"}
          </p>
        </div>
        {items.length > 0 && unread > 0 ? (
          <Button variant="ghost" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" aria-hidden />
            Mark all as read
          </Button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-10 w-10 text-gray-300" aria-hidden />}
          message="No notifications yet"
        />
      ) : (
        <ul className="space-y-3">
          {items.map((notification) => {
            const Icon = ICONS[notification.type] ?? Bell;
            const content = (
              <>
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    notification.read
                      ? "bg-gray-100 text-gray-400"
                      : "bg-brand-yellow text-brand-black"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${notification.read ? "font-semibold text-gray-500" : "font-bold text-brand-black"}`}
                  >
                    {notification.title}
                  </p>
                  {notification.message ? (
                    <p className="mt-0.5 text-xs font-medium text-gray-400">
                      {notification.message}
                    </p>
                  ) : null}
                </div>
                <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-widest text-gray-300 sm:block">
                  {timeAgo(notification.createdAt)}
                </span>
                {!notification.read ? (
                  <span
                    role="img"
                    aria-label="Unread"
                    className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-yellow"
                  />
                ) : null}
              </>
            );
            return (
              <li
                key={notification.id}
                className={`flex items-center gap-3 rounded-2xl px-5 py-4 shadow-sm ${
                  notification.read ? "bg-white" : "bg-white ring-1 ring-brand-yellow/50"
                }`}
              >
                {notification.link ? (
                  <Link
                    href={notification.link}
                    onClick={() => !notification.read && markRead(notification.id)}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => !notification.read && markRead(notification.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    {content}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(notification.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-gray-300 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}