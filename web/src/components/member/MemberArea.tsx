"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Settings,
  LogOut,
  Award,
  Loader2,
  CircleAlert,
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { Button, EmptyState } from "@/components/ui";
import { levelForPoints } from "@/lib/constants";
import { StatusPill } from "@/components/status";

type User = {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  points: number;
  level: string;
  profilePic: string | null;
  department: { id: string; name: string } | null;
};

type Mission = {
  id: string;
  text: string;
  points: number;
  status: "LIVE" | "PENDING_REVIEW" | "APPROVED";
  workLink: string | null;
  submitted: boolean;
  createdAt: string;
};

const TABS = [
  { id: "overview", label: "Overview", Icon: LayoutDashboard },
  { id: "missions", label: "Missions", Icon: Target },
  { id: "settings", label: "Profile", Icon: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function MemberArea() {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabId>("overview");
  const [user, setUser] = useState<User | null>(null);
  const [missions, setMissions] = useState<Mission[] | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const [me, myMissions] = await Promise.all([
        apiFetch<User>("/api/auth/me"),
        apiFetch<Mission[]>("/api/missions"),
      ]);
      setUser(me);
      setMissions(myMissions);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load your dashboard.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleLogout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // still redirect â€” cookie cleared best-effort
    }
    router.push("/login");
    router.refresh();
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-black">
        <Loader2 className="h-8 w-8 animate-spin text-brand-yellow" aria-label="Loading" />
      </main>
    );
  }

  const live = (missions ?? []).filter((m) => m.status === "LIVE" && !m.submitted);
  const completed = (missions ?? []).filter((m) => m.status === "APPROVED");

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
            <button type="button"
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
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
              Level
            </p>
            <p className="mt-1 font-heading text-xl font-black uppercase text-brand-yellow">
              {levelForPoints(user.points)}
            </p>
            <p className="mt-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400">
              <Award className="h-4 w-4 text-brand-yellow" aria-hidden />
              {user.points} points
            </p>
          </div>
          <nav className="flex gap-2 md:flex-col" aria-label="Member navigation">
            {TABS.map(({ id, label, Icon }) => (
              <button type="button"
                key={id}
                onClick={() => setTab(id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors md:justify-start ${
                  tab === id
                    ? "bg-brand-black text-white"
                    : "bg-white text-gray-500 hover:bg-gray-100"
                }`}
                aria-current={tab === id ? "page" : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <section className="min-w-0 flex-1">
          {tab === "overview" ? (
            <Overview user={user} live={live.length} completed={completed.length} missions={missions ?? []} />
          ) : tab === "missions" ? (
            <MissionsPanel missions={missions ?? []} onChanged={loadAll} />
          ) : (
            <ProfilePanel user={user} onSaved={(u) => setUser(u)} />
          )}
        </section>
      </div>
    </main>
  );
}

function Overview({
  user,
  live,
  completed,
  missions,
}: {
  user: User;
  live: number;
  completed: number;
  missions: Mission[];
}) {
  const stats = [
    { label: "Active missions", value: live },
    { label: "Completed", value: completed },
    { label: "Points earned", value: user.points },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
          Welcome, {user.fullName.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">
          {user.department
            ? `${user.department.name} department`
            : "No department assigned yet"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl bg-white p-6 text-center shadow-sm">
            <p className="font-heading text-3xl font-black text-brand-black">
              {stat.value}
            </p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-gray-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
        <h2 className="mb-4 font-heading text-lg font-black uppercase">
          Recent missions
        </h2>
        {missions.length === 0 ? (
          <EmptyState
            icon={<Target className="h-8 w-8 text-gray-300" aria-hidden />}
            message="No missions yet"
          />
        ) : (
          <ul className="divide-y divide-gray-100">
            {missions.slice(0, 5).map((mission) => (
              <li key={mission.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{mission.text}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {mission.points} points
                  </p>
                </div>
                <StatusPill status={mission.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MissionsPanel({
  missions,
  onChanged,
}: {
  missions: Mission[];
  onChanged: () => void;
}) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [link, setLink] = useState<string>("");

  async function submitWork(missionId: string) {
    if (!link.trim()) {
      toast.warning("Paste a link to your work first.");
      return;
    }
    setSubmitting(missionId);
    try {
      await apiFetch(`/api/missions/${missionId}`, {
        method: "PATCH",
        body: JSON.stringify({ workLink: link.trim() }),
      });
      toast.success("Work submitted for review!");
      setLink("");
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not submit work.");
    } finally {
      setSubmitting(null);
    }
  }

  const live = missions.filter((m) => m.status === "LIVE" && !m.submitted);
  const others = missions.filter((m) => !(m.status === "LIVE" && !m.submitted));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
          Your missions
        </h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">
          Complete missions to earn points and level up.
        </p>
      </div>

      {live.length === 0 ? (
        <EmptyState
          icon={<Target className="h-8 w-8 text-gray-300" aria-hidden />}
          message="No active missions right now"
        />
      ) : (
        <div className="space-y-4">
          {live.map((mission) => (
            <div key={mission.id} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-brand-black">{mission.text}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-brand-yellow-dark">
                    +{mission.points} points
                  </p>
                </div>
                <StatusPill status={mission.status} />
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Paste your work link (https://â€¦)"
                  className="input"
                  aria-label="Work link"
                />
                <Button
                  onClick={() => submitWork(mission.id)}
                  loading={submitting === mission.id}
                  className="shrink-0"
                >
                  Submit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {others.length > 0 ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-4 font-heading text-lg font-black uppercase">
            History
          </h2>
          <ul className="divide-y divide-gray-100">
            {others.map((mission) => (
              <li key={mission.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{mission.text}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    +{mission.points} points
                  </p>
                </div>
                <StatusPill status={mission.status} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ProfilePanel({
  user,
  onSaved,
}: {
  user: User;
  onSaved: (user: User) => void;
}) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user.fullName);
  const [profilePic, setProfilePic] = useState(user.profilePic ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const updated = await apiFetch<User>("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          fullName: fullName.trim(),
          profilePic: profilePic.trim() || null,
        }),
      });
      onSaved(updated);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
          Your profile
        </h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">
          Keep your details up to date.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center gap-4">
          {profilePic ? (
            <Image
              src={profilePic}
              alt={fullName}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow font-heading text-2xl font-black text-brand-black">
              {fullName[0]?.toUpperCase() ?? "?"}
            </span>
          )}
          <div>
            <p className="font-heading text-lg font-black uppercase">{fullName}</p>
            <p className="text-sm font-semibold text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="member-name" className="label">
              Full Name
            </label>
            <input
              id="member-name"
              type="text"
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="member-pic" className="label">
              Profile picture URL
            </label>
            <input
              id="member-pic"
              type="url"
              className="input"
              value={profilePic}
              onChange={(e) => setProfilePic(e.target.value)}
              placeholder="https://â€¦"
            />
          </div>
        </div>

        <Button onClick={save} loading={saving} className="mt-8 w-full">
          {saving ? "Saving" : "Save changes"}
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-3xl border-2 border-dashed border-gray-200 p-5 text-sm font-semibold text-gray-500">
        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-brand-yellow" aria-hidden />
        Contact an admin to change your department, role, or email address.
      </div>
    </div>
  );
}