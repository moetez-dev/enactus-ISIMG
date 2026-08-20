"use client";

import { useCallback, useEffect, useState } from "react";
import { UserPlus, Check, X, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { EmptyState, Spinner } from "@/components/ui";

type ProjectOption = { id: string; name: string };

type Member = {
  id: string;
  role: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  respondedAt: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
    department: { name: string } | null;
  };
};

export function ProjectMembersManager() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selected, setSelected] = useState("");
  const [members, setMembers] = useState<Member[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ProjectOption[]>("/api/projects?all=1")
      .then(setProjects)
      .catch(() => {});
  }, []);

  const load = useCallback(async (projectId: string) => {
    setMembers(null);
    try {
      setMembers(await apiFetch<Member[]>(`/api/projects/${projectId}/members`));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load project members.");
      setMembers([]);
    }
  }, [toast]);

  function selectProject(projectId: string) {
    setSelected(projectId);
    if (projectId) load(projectId);
    else setMembers(null);
  }

  async function updateStatus(memberId: string, status: "APPROVED" | "REJECTED", name: string) {
    setBusy(memberId);
    try {
      await apiFetch(`/api/projects/${selected}/members/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(status === "APPROVED" ? `${name} approved.` : `Request from ${name} declined.`);
      await load(selected);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(member: Member) {
    if (!window.confirm(`Remove ${member.user.fullName} from this project?`)) return;
    setBusy(member.id);
    try {
      await apiFetch(`/api/projects/${selected}/members/${member.id}`, {
        method: "DELETE",
      });
      toast.success(`${member.user.fullName} removed.`);
      await load(selected);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Remove failed.");
    } finally {
      setBusy(null);
    }
  }

  const pending = (members ?? []).filter((m) => m.status === "PENDING");
  const accepted = (members ?? []).filter((m) => m.status === "APPROVED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
          Project members
        </h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">
          Approve join requests and manage who is part of each project.
        </p>
      </div>

      <div>
        <label htmlFor="pm-project" className="label">
          Project
        </label>
        <select
          id="pm-project"
          className="input max-w-md"
          value={selected}
          onChange={(e) => selectProject(e.target.value)}
        >
          <option value="">Select a project…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {selected ? (
        members === null ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={<UserPlus className="h-10 w-10 text-gray-300" aria-hidden />}
            message="No members in this project yet"
          />
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 font-heading text-lg font-black uppercase">
                Join requests
              </h2>
              {pending.length === 0 ? (
                <EmptyState message="No pending requests" />
              ) : (
                <ul className="space-y-2">
                  {pending.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-brand-black">{m.user.fullName}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          {m.user.department?.name ?? "No department"} · {new Date(m.requestedAt).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateStatus(m.id, "APPROVED", m.user.fullName)}
                          disabled={busy === m.id}
                          className="flex h-9 items-center gap-1 rounded-xl bg-green-50 px-3 text-[9px] font-black uppercase tracking-widest text-green-700 transition-colors hover:bg-green-600 hover:text-white disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" aria-hidden />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(m.id, "REJECTED", m.user.fullName)}
                          disabled={busy === m.id}
                          className="flex h-9 items-center gap-1 rounded-xl bg-red-50 px-3 text-[9px] font-black uppercase tracking-widest text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
                        >
                          <X className="h-4 w-4" aria-hidden />
                          Decline
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="mb-3 font-heading text-lg font-black uppercase">
                Members
              </h2>
              {accepted.length === 0 ? (
                <EmptyState message="Nobody on the project yet" />
              ) : (
                <ul className="space-y-2">
                  {accepted.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-brand-black">{m.user.fullName}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          {m.user.department?.name ?? "No department"} ·{" "}
                          {m.respondedAt ? `member since ${new Date(m.respondedAt).toLocaleDateString("en-GB")}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-green-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-green-700">
                          {m.role}
                        </span>
                        <button
                          type="button"
                          onClick={() => remove(m)}
                          disabled={busy === m.id}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
                          aria-label={`Remove ${m.user.fullName}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )
      ) : null}
    </div>
  );
}