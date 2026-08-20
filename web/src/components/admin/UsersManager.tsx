"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  X,
  Shield,
  ShieldOff,
  Trash2,
  Award,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { EmptyState, Spinner } from "@/components/ui";
import { StatusBadge } from "@/components/status";

type Member = {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  points: number;
  level: string;
  motivation: string | null;
  memberId: string | null;
  memberSince: string | null;
  institution: string | null;
  studyLevel: string | null;
  fieldOfStudy: string | null;
  createdAt: string;
  departmentId: string | null;
  department: { id: string; name: string } | null;
  _count: { missions: number };
};

type UsersPage = {
  users: Member[];
  total: number;
  page: number;
  pageSize: number;
};

const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;
const PAGE_SIZE = 10;

export function UsersManager() {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [search, setSearch] = useState("");
  const [awardId, setAwardId] = useState<string | null>(null);
  const [awardAmount, setAwardAmount] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<UsersPage>(
        `/api/users?status=${filter}&q=${encodeURIComponent(search.trim())}&page=${page}&pageSize=${PAGE_SIZE}`,
      );
      setMembers(data.users);
      setTotal(data.total);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load members.");
      setMembers([]);
    }
  }, [filter, search, page, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function update(userId: string, payload: Record<string, unknown>) {
    try {
      await apiFetch("/api/users", { method: "PATCH", body: JSON.stringify({ userId, ...payload }) });
      toast.success("Member updated.");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed.");
    }
  }

  async function remove(member: Member) {
    if (!window.confirm(`Delete ${member.fullName}? This cannot be undone.`)) return;
    try {
      await apiFetch("/api/users", { method: "DELETE", body: JSON.stringify({ userId: member.id }) });
      toast.success("Member deleted.");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed.");
    }
  }

  async function resetPassword(member: Member) {
    const newPassword = window.prompt(
      `Set a new password for ${member.fullName}. Their existing sessions will be signed out.`,
    );
    if (newPassword == null || newPassword.trim() === "") return;
    try {
      await apiFetch(`/api/users/${member.id}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      });
      toast.success("Password updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update password.");
    }
  }

  async function awardPoints(member: Member) {
    const points = Number(awardAmount);
    if (!points || points <= 0) {
      toast.warning("Enter a positive number of points.");
      return;
    }
    setAwardId(member.id);
    try {
      await update(member.id, { points });
      setAwardAmount("");
    } finally {
      setAwardId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
            Members
          </h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Approve, promote, award points and manage your team.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, email or member ID"
              className="w-full rounded-full border-2 border-transparent bg-white py-2.5 pl-10 pr-4 text-sm font-semibold outline-none transition focus:border-brand-yellow sm:w-72"
              aria-label="Search members"
            />
          </div>
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button type="button"
                key={f}
                onClick={() => {
                  setFilter(f);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-colors ${
                  filter === f
                    ? "bg-brand-black text-white"
                    : "bg-white text-gray-500 hover:bg-gray-100"
                }`}
              >
                {f === "ALL" ? "All" : f[0] + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {members === null ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : members.length === 0 ? (
        <EmptyState message="No members in this view" />
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
          <table className="w-full min-w-[780px] text-left">
            <thead>
              <tr className="border-b border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-400">
                <th className="px-6 py-4">Member</th>
                <th className="px-4 py-4">Member ID</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Role</th>
                <th className="px-4 py-4">Points</th>
                <th className="px-4 py-4">Missions</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map((member) => (
                <tr key={member.id} className="text-sm">
                  <td className="px-6 py-4">
                    <p className="font-bold">{member.fullName}</p>
                    <p className="text-xs font-semibold text-gray-400">
                      {member.email}
                    </p>
                    <p className="mt-1 max-w-xs truncate text-xs text-gray-400">
                      {[member.institution, member.studyLevel, member.fieldOfStudy]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                    {member.motivation ? (
                      <p className="mt-1 max-w-xs truncate text-xs text-gray-400">
                        {member.motivation}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    {member.memberId ? (
                      <span className="rounded-full bg-brand-yellow/15 px-3 py-1 font-mono text-[10px] font-bold text-brand-yellow-dark">
                        {member.memberId}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-heading font-black">
                    {member.points}
                  </td>
                  <td className="px-4 py-4 text-gray-500">
                    {member._count.missions}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {member.status === "PENDING" ? (
                        <>
                          <button type="button"
                            onClick={() => update(member.id, { status: "APPROVED" })}
                            className="flex h-9 items-center gap-1 rounded-xl bg-green-50 px-3 text-xs font-black uppercase tracking-widest text-green-700 transition-colors hover:bg-green-600 hover:text-white"
                            aria-label={`Approve ${member.fullName}`}
                          >
                            <Check className="h-4 w-4" aria-hidden />
                            Approve
                          </button>
                          <button type="button"
                            onClick={() => update(member.id, { status: "REJECTED" })}
                            className="flex h-9 items-center gap-1 rounded-xl bg-red-50 px-3 text-xs font-black uppercase tracking-widest text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                            aria-label={`Reject ${member.fullName}`}
                          >
                            <X className="h-4 w-4" aria-hidden />
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button"
                            onClick={() =>
                              update(member.id, {
                                status: member.status === "APPROVED" ? "REJECTED" : "APPROVED",
                              })
                            }
                            className="flex h-9 items-center gap-1 rounded-xl bg-gray-100 px-3 text-xs font-black uppercase tracking-widest text-gray-600 transition-colors hover:bg-brand-black hover:text-white"
                            aria-label="Toggle approval"
                          >
                            {member.status === "APPROVED" ? "Disable" : "Enable"}
                          </button>
                          <button type="button"
                            onClick={() => update(member.id, { role: member.role === "ADMIN" ? "MEMBER" : "ADMIN" })}
                            className="flex h-9 items-center gap-1 rounded-xl bg-gray-100 px-3 text-xs font-black uppercase tracking-widest text-gray-600 transition-colors hover:bg-brand-black hover:text-white"
                            aria-label="Toggle admin role"
                            title={member.role === "ADMIN" ? "Remove admin" : "Make admin"}
                          >
                            {member.role === "ADMIN" ? <ShieldOff className="h-4 w-4" aria-hidden /> : <Shield className="h-4 w-4" aria-hidden />}
                          </button>
                          {member.status === "APPROVED" ? (
                            <span className="flex items-center gap-1">
                              <input
                                type="number"
                                min={1}
                                placeholder="+pts"
                                className="w-20 rounded-xl border-2 border-transparent bg-gray-100 px-3 py-2 text-xs font-bold outline-none transition focus:border-brand-yellow"
                                aria-label={`Award points to ${member.fullName}`}
                                value={awardId === member.id ? awardAmount : ""}
                                onChange={(e) => setAwardAmount(e.target.value)}
                              />
                              <button type="button"
                                onClick={() => awardPoints(member)}
                                disabled={awardId === member.id}
                                className="flex h-9 items-center justify-center rounded-xl bg-brand-yellow px-2.5 text-brand-black transition-colors hover:bg-brand-black hover:text-white disabled:opacity-50"
                                aria-label={`Submit points for ${member.fullName}`}
                              >
                                <Award className="h-4 w-4" aria-hidden />
                              </button>
                            </span>
                          ) : null}
                        </>
                      )}
                      <button type="button"
                        onClick={() => resetPassword(member)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-brand-black hover:text-white"
                        aria-label={`Reset password for ${member.fullName}`}
                        title="Reset password"
                      >
                        <KeyRound className="h-4 w-4" aria-hidden />
                      </button>
                      <button type="button"
                        onClick={() => remove(member)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                        aria-label={`Delete ${member.fullName}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {members !== null && members.length > 0 ? (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs font-semibold text-gray-400">
            {total} member{total === 1 ? "" : "s"} · page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm transition-colors hover:bg-brand-black hover:text-white disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm transition-colors hover:bg-brand-black hover:text-white disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}