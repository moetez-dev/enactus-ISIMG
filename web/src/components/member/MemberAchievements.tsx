"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Trophy,
  Lock,
  CheckCircle2,
  Medal,
  Rocket,
  CalendarDays,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { EmptyState, Spinner } from "@/components/ui";
import type { MemberAchievement } from "@/components/member/types";

const ICONS: Record<string, LucideIcon> = {
  trophy: Trophy,
  medal: Medal,
  rocket: Rocket,
  calendar: CalendarDays,
  target: Target,
};

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={`${value} of ${max} progress`}
    >
      <div
        className="h-full rounded-full bg-brand-yellow transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function MemberAchievements() {
  const { toast } = useToast();
  const [items, setItems] = useState<MemberAchievement[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setItems(null);
    try {
      setItems(await apiFetch<MemberAchievement[]>("/api/achievements"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load achievements.");
      setItems([]);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const earned = (items ?? []).filter((a) => a.earned);
  const locked = (items ?? []).filter((a) => !a.earned);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
          Achievements
        </h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">
          {earned.length} of {items?.length ?? 0} unlocked
          {earned.length > 0
            ? ` · ${earned.reduce((sum, a) => sum + a.xpReward, 0)} XP from badges`
            : ""}
        </p>
      </div>

      {items === null ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-10 w-10 text-gray-300" aria-hidden />}
          message="No achievements defined yet — check back soon"
        />
      ) : (
        <>
          {earned.length > 0 ? (
            <section>
              <h2 className="mb-4 font-heading text-lg font-black uppercase">
                Earned
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {earned.map((a) => {
                  const Icon = ICONS[a.icon] ?? Trophy;
                  return (
                    <button
                      type="button"
                      key={a.id}
                      onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                      className="rounded-3xl border-2 border-brand-yellow/60 bg-white p-6 text-left shadow-sm transition-all hover:shadow-md"
                      aria-expanded={expanded === a.id}
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-yellow text-brand-black">
                          <Icon className="h-6 w-6" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-heading text-base font-black uppercase">
                            {a.name}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-green-600">
                            <CheckCircle2 className="h-3 w-3" aria-hidden />
                            Earned{" "}
                            {a.earnedAt
                              ? new Date(a.earnedAt).toLocaleDateString("en-GB")
                              : ""}
                          </p>
                        </div>
                        {a.xpReward > 0 ? (
                          <span className="shrink-0 rounded-full bg-brand-yellow/15 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-brand-yellow-dark">
                            +{a.xpReward} XP
                          </span>
                        ) : null}
                      </div>
                      {expanded === a.id ? (
                        <p className="mt-4 text-sm font-medium leading-relaxed text-gray-500">
                          {a.description}
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="mb-4 font-heading text-lg font-black uppercase">
              Locked
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {locked.map((a) => {
                const Icon = ICONS[a.icon] ?? Trophy;
                return (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                    className="rounded-3xl border-2 border-gray-100 bg-gray-50/60 p-6 text-left opacity-80 transition-all hover:border-gray-200"
                    aria-expanded={expanded === a.id}
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-200 text-gray-400">
                        <Icon className="h-6 w-6" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-heading text-base font-black uppercase text-gray-500">
                          {a.name}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gray-400">
                          <Lock className="h-3 w-3" aria-hidden />
                          Locked
                        </p>
                      </div>
                      {a.xpReward > 0 ? (
                        <span className="shrink-0 rounded-full bg-gray-200 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-gray-500">
                          +{a.xpReward} XP
                        </span>
                      ) : null}
                    </div>
                    {a.criteria !== "MANUAL" ? (
                      <div className="mt-4">
                        <ProgressBar value={a.progress} max={a.threshold} />
                        <p className="mt-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                          {Math.min(a.progress, a.threshold)} / {a.threshold} ·{" "}
                          {criteriaLabel(a.criteria)}
                        </p>
                      </div>
                    ) : null}
                    {expanded === a.id ? (
                      <p className="mt-3 text-sm font-medium leading-relaxed text-gray-500">
                        {a.description}
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function criteriaLabel(criteria: string): string {
  switch (criteria) {
    case "MISSIONS_COMPLETED":
      return "missions completed";
    case "XP_TOTAL":
      return "total XP";
    case "EVENTS_ATTENDED":
      return "events attended";
    case "PROJECTS_JOINED":
      return "projects joined";
    default:
      return "special";
  }
}