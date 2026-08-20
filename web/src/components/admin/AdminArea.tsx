"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Building2,
  CalendarDays,
  UserRound,
  Megaphone,
  Target,
  MessageSquare,
  Settings,
  LogOut,
  Medal,
  BadgeCheck,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { apiFetch } from "@/lib/client-api";
import { Overview } from "@/components/admin/Overview";
import { UsersManager } from "@/components/admin/UsersManager";
import { ResourceManager, type ResourceField } from "@/components/admin/ResourceManager";
import { MissionsManager } from "@/components/admin/MissionsManager";
import { MessagesManager } from "@/components/admin/MessagesManager";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { AchievementsManager } from "@/components/admin/AchievementsManager";
import { CertificatesManager } from "@/components/admin/CertificatesManager";
import { AttendanceManager } from "@/components/admin/AttendanceManager";
import { ProjectMembersManager } from "@/components/admin/ProjectMembersManager";

const TABS = [
  { id: "overview", label: "Overview", Icon: LayoutDashboard },
  { id: "users", label: "Members", Icon: Users },
  { id: "projects", label: "Projects", Icon: FolderKanban },
  { id: "project-members", label: "Project members", Icon: UserPlus },
  { id: "departments", label: "Departments", Icon: Building2 },
  { id: "events", label: "Events", Icon: CalendarDays },
  { id: "attendance", label: "Attendance", Icon: UserCheck },
  { id: "team", label: "Team", Icon: UserRound },
  { id: "news", label: "Announcements", Icon: Megaphone },
  { id: "missions", label: "Missions", Icon: Target },
  { id: "achievements", label: "Achievements", Icon: Medal },
  { id: "certificates", label: "Certificates", Icon: BadgeCheck },
  { id: "messages", label: "Messages", Icon: MessageSquare },
  { id: "settings", label: "Settings", Icon: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminArea({ adminName }: { adminName: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("overview");

  async function handleLogout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // best-effort; navigation still happens
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-50">
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
              ADMIN <span className="text-brand-yellow">DASHBOARD</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-bold sm:block">{adminName}</span>
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

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-60">
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Admin navigation">
            {TABS.map(({ id, label, Icon }) => (
              <button type="button"
                key={id}
                onClick={() => setTab(id)}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors lg:w-full ${
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

        <section className="min-w-0 flex-1">
          {tab === "overview" ? <Overview /> : null}
          {tab === "users" ? <UsersManager /> : null}
          {tab === "projects" ? (
            <ResourceManager resource="projects" title="Projects" fields={projectFields} />
          ) : null}
          {tab === "departments" ? (
            <ResourceManager resource="departments" title="Departments" fields={departmentFields} />
          ) : null}
          {tab === "events" ? (
            <ResourceManager resource="events" title="Events" fields={eventFields} />
          ) : null}
          {tab === "team" ? (
            <ResourceManager resource="team" title="Team members" fields={teamFields} />
          ) : null}
          {tab === "news" ? (
            <ResourceManager resource="news" title="Announcements" fields={newsFields} />
          ) : null}
          {tab === "missions" ? <MissionsManager /> : null}
          {tab === "achievements" ? <AchievementsManager /> : null}
          {tab === "certificates" ? <CertificatesManager /> : null}
          {tab === "project-members" ? <ProjectMembersManager /> : null}
          {tab === "attendance" ? <AttendanceManager /> : null}
          {tab === "messages" ? <MessagesManager /> : null}
          {tab === "settings" ? <SettingsManager /> : null}
        </section>
      </div>
    </main>
  );
}

const projectFields: ResourceField[] = [
  { type: "text", key: "name", label: "Project name" },
  { type: "slug", key: "slug", label: "Slug" },
  { type: "text", key: "tag", label: "Tag" },
  { type: "textarea", key: "problem", label: "The problem" },
  { type: "textarea", key: "solution", label: "Our solution" },
  { type: "textarea", key: "impact", label: "Impact" },
  { type: "url", key: "image", label: "Image URL" },
  { type: "number", key: "progress", label: "Progress (%)" },
  { type: "number", key: "order", label: "Display order" },
  { type: "checkbox", key: "published", label: "Published" },
];

const departmentFields: ResourceField[] = [
  { type: "text", key: "name", label: "Name" },
  { type: "slug", key: "slug", label: "Slug" },
  { type: "textarea", key: "description", label: "Description" },
  { type: "text", key: "icon", label: "Icon (emoji or letter)" },
];

const eventFields: ResourceField[] = [
  { type: "text", key: "title", label: "Title" },
  { type: "textarea", key: "description", label: "Description" },
  { type: "datetime-local", key: "date", label: "Date & time" },
  { type: "text", key: "location", label: "Location" },
  { type: "checkbox", key: "published", label: "Published" },
];

const teamFields: ResourceField[] = [
  { type: "text", key: "name", label: "Full name" },
  { type: "text", key: "role", label: "Role" },
  { type: "url", key: "image", label: "Photo URL" },
  { type: "url", key: "facebook", label: "Facebook URL" },
  { type: "url", key: "instagram", label: "Instagram URL" },
  { type: "email", key: "email", label: "Email" },
  { type: "checkbox", key: "isLeadership", label: "Leadership board" },
  { type: "number", key: "order", label: "Display order" },
  { type: "checkbox", key: "published", label: "Published" },
];

const newsFields: ResourceField[] = [
  { type: "text", key: "title", label: "Title" },
  { type: "textarea", key: "description", label: "Content" },
  { type: "checkbox", key: "published", label: "Published" },
];