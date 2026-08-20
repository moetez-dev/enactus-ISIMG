"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Rocket, UserPlus, CheckCircle2, Clock, X, LogOut } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { Button, EmptyState, Spinner } from "@/components/ui";
import type {
  MemberProject,
  MemberProjectMembership,
} from "@/components/member/types";

type Row = MemberProject & {
  membership: MemberProjectMembership | null;
};

export function MemberProjects() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<MemberProject[] | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setProjects(null);
    setRows(null);
    try {
      const all = await apiFetch<MemberProject[]>("/api/projects");
      const withMembership = await Promise.all(
        all.map(async (project) => ({
          ...project,
          membership: await apiFetch<MemberProjectMembership | null>(
            `/api/projects/${project.id}/members`,
          ),
        })),
      );
      setProjects(all);
      setRows(withMembership);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load projects.");
      setProjects([]);
      setRows([]);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function requestJoin(projectId: string) {
    setBusy(projectId);
    try {
      await apiFetch(`/api/projects/${projectId}/join`, { method: "POST" });
      toast.success("Join request sent for approval.");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not send request.");
    } finally {
      setBusy(null);
    }
  }

  async function cancelOrLeave(project: Row) {
    const action =
      project.membership?.status === "PENDING"
        ? `Cancel your request to join "${project.name}"?`
        : `Leave "${project.name}"?`;
    if (!window.confirm(action)) return;
    setBusy(project.id);
    try {
      await apiFetch(`/api/projects/${project.id}/join`, { method: "DELETE" });
      toast.success(project.membership?.status === "PENDING" ? "Request cancelled." : "You left the project.");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  if (projects === null || rows === null) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const mine = rows.filter((r) => r.membership?.status === "APPROVED");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
          Projects
        </h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">
          You are part of {mine.length} project{mine.length === 1 ? "" : "s"}.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<Rocket className="h-10 w-10 text-gray-300" aria-hidden />}
          message="No projects available right now"
        />
      ) : (
        <div className="space-y-4">
          {rows.map((project) => {
            const m = project.membership;
            return (
              <div key={project.id} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="relative hidden h-16 w-16 shrink-0 overflow-hidden rounded-2xl sm:block">
                      <Image
                        src={project.image || "/images/logo.jpg"}
                        alt={project.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-heading text-lg font-black uppercase text-brand-black">
                        {project.name}
                      </p>
                      <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {project.tag}
                        {project.department ? ` · ${project.department.name}` : ""}
                      </p>
                      <div className="mt-2">
                        <MembershipBadge membership={m} />
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {m?.status === "PENDING" ? (
                      <>
                        <span className="rounded-full bg-yellow-50 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-yellow-800">
                          Awaiting approval
                        </span>
                        <Button
                          variant="ghost"
                          onClick={() => cancelOrLeave(project)}
                          loading={busy === project.id}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" aria-hidden />
                          Cancel
                        </Button>
                      </>
                    ) : m?.status === "APPROVED" ? (
                      <Button
                        variant="ghost"
                        onClick={() => cancelOrLeave(project)}
                        loading={busy === project.id}
                        className="shrink-0"
                      >
                        <LogOut className="h-4 w-4" aria-hidden />
                        Leave
                      </Button>
                    ) : m?.status === "REJECTED" ? (
                      <Button
                        onClick={() => requestJoin(project.id)}
                        loading={busy === project.id}
                      >
                        <UserPlus className="h-4 w-4" aria-hidden />
                        Request again
                      </Button>
                    ) : (
                      <Button
                        onClick={() => requestJoin(project.id)}
                        loading={busy === project.id}
                      >
                        <UserPlus className="h-4 w-4" aria-hidden />
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MembershipBadge({
  membership,
}: {
  membership: MemberProjectMembership | null;
}) {
  if (!membership) {
    return (
      <span className="rounded-full bg-gray-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-gray-500">
        Not a member
      </span>
    );
  }
  if (membership.status === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-yellow-800">
        <Clock className="h-3 w-3" aria-hidden />
        Pending
      </span>
    );
  }
  if (membership.status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-red-600">
        <X className="h-3 w-3" aria-hidden />
        Declined
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-green-700">
      <CheckCircle2 className="h-3 w-3" aria-hidden />
      {membership.role}
    </span>
  );
}