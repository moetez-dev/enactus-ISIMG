"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, Building2, FolderKanban, CalendarDays, UserRound, MessageSquare, Award } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui";
import { StatusBadge } from "@/components/status";

type Stats = {
  members: number;
  pendingMembers: number;
  departments: number;
  projects: number;
  events: number;
  team: number;
  messages: number;
  leaderboard: {
    id: string;
    fullName: string;
    email: string;
    points: number;
    profilePic: string | null;
    department: { name: string } | null;
  }[];
  recentMembers: {
    id: string;
    fullName: string;
    email: string;
    createdAt: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
  }[];
};

export function Overview() {
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiFetch<Stats>("/api/stats")
      .then(setStats)
      .catch((err) =>
        toast.error(err instanceof ApiError ? err.message : "Failed to load stats."),
      );
  }, [toast]);

  if (!stats) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  const cards = [
    { label: "Members", value: stats.members, Icon: Users },
    { label: "Pending approvals", value: stats.pendingMembers, Icon: UserCheck },
    { label: "Departments", value: stats.departments, Icon: Building2 },
    { label: "Projects", value: stats.projects, Icon: FolderKanban },
    { label: "Upcoming events", value: stats.events, Icon: CalendarDays },
    { label: "Team members", value: stats.team, Icon: UserRound },
    { label: "Messages", value: stats.messages, Icon: MessageSquare },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
          Overview
        </h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">
          A quick look at how Enactus ISIMG is doing.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {cards.map(({ label, value, Icon }) => (
          <div key={label} className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-yellow text-brand-black">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <p className="font-heading text-3xl font-black text-brand-black">
              {value}
            </p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-gray-400">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leaderboard */}
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-5 flex items-center gap-2 font-heading text-lg font-black uppercase">
            <Award className="h-5 w-5 text-brand-yellow" aria-hidden />
            Leaderboard
          </h2>
          {stats.leaderboard.length === 0 ? (
            <p className="text-sm font-semibold text-gray-400">
              No approved members yet.
            </p>
          ) : (
            <ol className="space-y-3">
              {stats.leaderboard.map((member, index) => (
                <li
                  key={member.id}
                  className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3"
                >
                  <span className="font-heading text-lg font-black text-gray-400">
                    #{index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{member.fullName}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {member.department?.name ?? "No department"}
                    </p>
                  </div>
                  <span className="font-heading text-lg font-black text-brand-yellow-dark">
                    {member.points} pts
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Recent members */}
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-5 font-heading text-lg font-black uppercase">
            Recent applications
          </h2>
          {stats.recentMembers.length === 0 ? (
            <p className="text-sm font-semibold text-gray-400">
              No applications yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {stats.recentMembers.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{member.fullName}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {new Date(member.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <StatusBadge status={member.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}