"use client";

import {
  Target,
  Flag,
  Clock,
  CalendarDays,
  Rocket,
  BadgeCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";
import type {
  MemberActivity,
  MemberStats,
  MemberUser,
} from "@/components/member/types";

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  MISSION_COMPLETED: Target,
  EVENT_ATTENDED: CalendarDays,
  PROJECT_JOINED: Rocket,
  BADGE_EARNED: Sparkles,
  CERTIFICATE_ISSUED: BadgeCheck,
  POINTS_AWARDED: Sparkles,
};

const DEFAULT_ACTIVITY_ICON: LucideIcon = Sparkles;

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
  return new Date(iso).toLocaleDateString();
}

function StatCard({
  label,
  value,
  Icon,
}: {
  label: string;
  value: number;
  Icon: LucideIcon;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-yellow/15 text-brand-black">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <p className="font-heading text-3xl font-black text-brand-black">
          {value}
        </p>
        <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-gray-400">
          {label}
        </p>
      </div>
    </div>
  );
}

export function MemberDashboard({
  user,
  stats,
  activity,
  onNavigate,
}: {
  user: MemberUser;
  stats: MemberStats;
  activity: MemberActivity[];
  onNavigate: (tab: "missions" | "profile") => void;
}) {
  const level = stats.level;
  const first = user.fullName.split(" ")[0];
  const joined = new Date(user.createdAt).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const cards: { label: string; value: number; Icon: LucideIcon }[] = [
    { label: "Missions completed", value: stats.missionsCompleted, Icon: Target },
    { label: "Active missions", value: stats.missionsActive, Icon: Flag },
    { label: "Under review", value: stats.missionsPendingReview, Icon: Clock },
    { label: "Events attended", value: stats.eventsAttended, Icon: CalendarDays },
    { label: "Projects", value: stats.projectsCount, Icon: Rocket },
    { label: "Certificates", value: stats.certificatesCount, Icon: BadgeCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
            Welcome back, {first}
          </h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            {user.department
              ? `${user.department.name} department`
              : "No department assigned yet"}
            {user.role === "ADMIN" ? " | Admin" : " | Member"} | Member since {joined}
          </p>
        </div>
        <Button variant="dark" onClick={() => onNavigate("missions")}>
          Browse missions
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <div className="rounded-3xl bg-brand-black p-6 text-white shadow-sm md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
              Level
            </p>
            <p className="mt-1 font-heading text-4xl font-black uppercase text-brand-yellow">
              {level.name}
            </p>
          </div>
          <p className="font-heading text-3xl font-black">
            {stats.points}
            <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              XP
            </span>
          </p>
        </div>
        <div
          className="mt-6 h-3 w-full overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={level.progress}
          aria-label="Progress to next level"
        >
          <div
            className="h-full rounded-full bg-brand-yellow transition-all duration-500"
            style={{ width: `${level.progress}%` }}
          />
        </div>
        <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
          {level.next
            ? `${level.remaining} XP to reach ${level.next.name}`
            : "Maximum level reached - outstanding work!"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8 lg:col-span-2">
          <h2 className="mb-4 font-heading text-lg font-black uppercase">
            Recent activity
          </h2>
          {activity.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="h-8 w-8 text-gray-300" aria-hidden />}
              message="No activity yet - complete missions to start earning XP"
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {activity.map((item) => {
                const Icon = ACTIVITY_ICONS[item.type] ?? DEFAULT_ACTIVITY_ICON;
                return (
                  <li key={item.id} className="flex items-center gap-4 py-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-yellow/15 text-brand-black">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.title}</p>
                      {item.description ? (
                        <p className="truncate text-xs font-semibold text-gray-400">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                    {item.points > 0 ? (
                      <span className="shrink-0 rounded-full bg-brand-yellow/15 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-brand-yellow-dark">
                        +{item.points} XP
                      </span>
                    ) : null}
                    <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-widest text-gray-300 sm:block">
                      {timeAgo(item.createdAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="h-fit space-y-3 rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-4 font-heading text-lg font-black uppercase">
            Quick actions
          </h2>
          <Button variant="ghost" className="w-full" onClick={() => onNavigate("missions")}>
            <Target className="h-4 w-4" aria-hidden />
            Go to missions
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => onNavigate("profile")}>
            <BadgeCheck className="h-4 w-4" aria-hidden />
            Edit profile
          </Button>
        </div>
      </div>
    </div>
  );
}