"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Rocket,
  CalendarDays,
  Award,
  BadgeCheck,
  Bell,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { MemberDashboard } from "@/components/member/MemberDashboard";
import { MemberMissions } from "@/components/member/MemberMissions";
import { MemberProfile } from "@/components/member/MemberProfile";
import { MemberAchievements } from "@/components/member/MemberAchievements";
import { MemberCertificates } from "@/components/member/MemberCertificates";
import { MemberEvents } from "@/components/member/MemberEvents";
import { MemberProjects } from "@/components/member/MemberProjects";
import { MemberNotifications } from "@/components/member/MemberNotifications";
import type {
  MemberDashboardData,
  MemberMission,
} from "@/components/member/types";

const NAV = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "missions", label: "Missions", Icon: Target },
  { id: "projects", label: "Projects", Icon: Rocket },
  { id: "events", label: "Events", Icon: CalendarDays },
  { id: "achievements", label: "Achievements", Icon: Award },
  { id: "certificates", label: "Certificates", Icon: BadgeCheck },
  { id: "notifications", label: "Notifications", Icon: Bell },
  { id: "profile", label: "Profile", Icon: Settings },
] as const;

type TabId = (typeof NAV)[number]["id"];

export function MemberArea() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabId>("dashboard");
  const [data, setData] = useState<MemberDashboardData | null>(null);
  const [missions, setMissions] = useState<MemberMission[] | null>(null);
  const [loading, setLoading] = useState(true);

  const selectTab = useCallback(
    (id: TabId) => {
      setTab(id);
      const url = new URL(window.location.href);
      url.searchParams.set("tab", id);
      window.history.replaceState({}, "", url.toString());
    },
    [],
  );

  const loadAll = useCallback(async () => {
    try {
      const [dashboard, myMissions] = await Promise.all([
        apiFetch<MemberDashboardData>("/api/member/dashboard"),
        apiFetch<MemberMission[]>("/api/missions"),
      ]);
      setData(dashboard);
      setMissions(myMissions);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load your dashboard.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    const requested = searchParams.get("tab");
    if (requested && NAV.some((n) => n.id === requested)) {
      setTab(requested as TabId);
    }
    loadAll();
  }, [searchParams, loadAll]);

  async function handleLogout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // still redirect — cookie cleared best-effort
    }
    router.push("/login");
    router.refresh();
  }

  if (loading || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-black">
        <Loader2 className="h-8 w-8 animate-spin text-brand-yellow" aria-label="Loading" />
      </main>
    );
  }

  const { user, stats } = data;
  const level = stats.level;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-brand-black text-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Home">
            <span className="h-9 w-9 overflow-hidden rounded-xl ring-2 ring-brand-yellow/30">
              <Image
                src="/images/logo.jpg"
                alt="Enactus ISIMG"
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="hidden font-heading text-base font-extrabold md:block">
              MEMBER <span className="text-brand-yellow">SPACE</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {data.stats.unreadNotifications > 0 ? (
              <button
                type="button"
                onClick={() => selectTab("notifications")}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-brand-yellow hover:text-brand-yellow"
                aria-label={`${data.stats.unreadNotifications} unread notifications`}
              >
                <Bell className="h-4 w-4" aria-hidden />
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-yellow px-1 text-[8px] font-black text-brand-black">
                  {data.stats.unreadNotifications}
                </span>
              </button>
            ) : null}
            <span className="hidden items-center gap-2 rounded-full border border-brand-yellow/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand-yellow lg:flex">
              <Award className="h-3.5 w-3.5" aria-hidden />
              {stats.points} XP
            </span>
            {user.profilePic ? (
              <Image
                src={user.profilePic}
                alt={user.fullName}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-yellow"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-yellow font-heading text-sm font-black text-brand-black">
                {user.fullName[0]?.toUpperCase() ?? "?"}
              </span>
            )}
            <span className="hidden text-sm font-bold sm:block">
              {user.fullName}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border-2 border-white/20 px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-colors hover:border-brand-yellow hover:text-brand-yellow"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 md:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 md:w-56">
          <div className="mb-6 rounded-3xl bg-brand-black p-6 text-white">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Level
                </p>
                <p className="mt-1 font-heading text-2xl font-black uppercase text-brand-yellow">
                  {level.name}
                </p>
              </div>
              <p className="font-heading text-base font-black text-white">
                {stats.points}
                <span className="ml-1 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  XP
                </span>
              </p>
            </div>
            <div
              className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={level.progress}
              aria-label="Level progress"
            >
              <div
                className="h-full rounded-full bg-brand-yellow transition-all duration-500"
                style={{ width: `${level.progress}%` }}
              />
            </div>
            <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-gray-400">
              {level.next
                ? `${level.remaining} XP to ${level.next.name}`
                : "Max level reached"}
            </p>
          </div>
          <nav
            className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:flex md:flex-col"
            aria-label="Member navigation"
          >
            {NAV.map(({ id, label, Icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => selectTab(id)}
                className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors md:justify-start ${
                  tab === id
                    ? "bg-brand-black text-white"
                    : "bg-white text-gray-500 hover:bg-gray-100"
                }`}
                aria-current={tab === id ? "page" : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <section className="min-w-0 flex-1">
          {tab === "dashboard" ? (
            <MemberDashboard
              user={user}
              stats={stats}
              activity={data.activity}
              onNavigate={selectTab}
            />
          ) : tab === "missions" ? (
            <MemberMissions
              missions={missions ?? []}
              onChanged={loadAll}
            />
          ) : tab === "projects" ? (
            <MemberProjects />
          ) : tab === "events" ? (
            <MemberEvents />
          ) : tab === "achievements" ? (
            <MemberAchievements />
          ) : tab === "certificates" ? (
            <MemberCertificates />
          ) : tab === "notifications" ? (
            <MemberNotifications />
          ) : (
            <MemberProfile
              user={user}
              onSaved={(updated) => setData((prev) => (prev ? { ...prev, user: updated } : prev))}
            />
          )}
        </section>
      </div>
    </main>
  );
}