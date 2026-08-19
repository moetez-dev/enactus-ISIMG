"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Check, RotateCcw, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { Button, EmptyState, Spinner } from "@/components/ui";
import { StatusPill } from "@/components/status";

type Mission = {
  id: string;
  text: string;
  points: number;
  status: "LIVE" | "PENDING_REVIEW" | "APPROVED";
  workLink: string | null;
  submitted: boolean;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
};

export function MissionsManager() {
  const { toast } = useToast();
  const [missions, setMissions] = useState<Mission[] | null>(null);
  const [members, setMembers] = useState<{ id: string; fullName: string }[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ userId: "", text: "", points: "50" });
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [data, users] = await Promise.all([
        apiFetch<Mission[]>("/api/missions"),
        apiFetch<{ id: string; fullName: string }[]>("/api/users?status=ALL"),
      ]);
      setMissions(data);
      setMembers(users.filter((u) => u.id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load missions.");
      setMissions([]);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function createMission() {
    if (!form.userId || !form.text.trim()) {
      toast.warning("Pick a member and write the mission.");
      return;
    }
    setBusy("create");
    try {
      await apiFetch("/api/missions", {
        method: "POST",
        body: JSON.stringify({
          userId: form.userId,
          text: form.text.trim(),
          points: Number(form.points) || 50,
        }),
      });
      toast.success("Mission assigned.");
      setForm({ userId: "", text: "", points: "50" });
      setCreating(false);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not create mission.");
    } finally {
      setBusy(null);
    }
  }

  async function review(mission: Mission, status: "APPROVED" | "LIVE") {
    setBusy(mission.id);
    try {
      await apiFetch(`/api/missions/${mission.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(status === "APPROVED" ? "Mission approved â€” points awarded." : "Mission reopened.");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Review failed.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(mission: Mission) {
    if (!window.confirm("Delete this mission?")) return;
    setBusy(mission.id);
    try {
      await apiFetch(`/api/missions/${mission.id}`, { method: "DELETE" });
      toast.success("Mission deleted.");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setBusy(null);
    }
  }

  const pending = (missions ?? []).filter((m) => m.status === "PENDING_REVIEW");
  const rest = (missions ?? []).filter((m) => m.status !== "PENDING_REVIEW");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
            Missions
          </h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Assign missions and review submitted work.
          </p>
        </div>
        <Button onClick={() => setCreating((v) => !v)}>
          <Plus className="h-4 w-4" aria-hidden />
          Assign
        </Button>
      </div>

      {creating ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="mission-member" className="label">
                Member
              </label>
              <select
                id="mission-member"
                className="input"
                value={form.userId}
                onChange={(e) => setForm((prev) => ({ ...prev, userId: e.target.value }))}
              >
                <option value="">Select a memberâ€¦</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="mission-text" className="label">
                Mission description
              </label>
              <textarea
                id="mission-text"
                className="input h-28 resize-none"
                placeholder="e.g. Design the poster for the upcoming recruitment day"
                value={form.text}
                onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="mission-points" className="label">
                Points (1â€“500)
              </label>
              <input
                id="mission-points"
                type="number"
                min={1}
                max={500}
                className="input"
                value={form.points}
                onChange={(e) => setForm((prev) => ({ ...prev, points: e.target.value }))}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={createMission} loading={busy === "create"} className="flex-1">
                {busy === "create" ? "Assigning" : "Assign mission"}
              </Button>
              <Button onClick={() => setCreating(false)} variant="ghost" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Pending review */}
      <div>
        <h2 className="mb-4 font-heading text-lg font-black uppercase">
          Under review
        </h2>
        {pending.length === 0 ? (
          <EmptyState message="Nothing awaiting review" />
        ) : (
          <div className="space-y-4">
            {pending.map((mission) => (
              <div key={mission.id} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <p className="font-bold text-brand-black">{mission.text}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                      {mission.user.fullName} Â· +{mission.points} points
                    </p>
                    {mission.workLink ? (
                      <a
                        href={mission.workLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block break-all rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-gray-200"
                      >
                        View submission â†—
                      </a>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button"
                      onClick={() => review(mission, "APPROVED")}
                      disabled={busy === mission.id}
                      className="flex items-center gap-1 rounded-xl bg-green-50 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-green-700 transition-colors hover:bg-green-600 hover:text-white disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" aria-hidden />
                      Approve
                    </button>
                    <button type="button"
                      onClick={() => review(mission, "LIVE")}
                      disabled={busy === mission.id}
                      className="flex items-center gap-1 rounded-xl bg-yellow-50 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-yellow-700 transition-colors hover:bg-yellow-500 hover:text-white disabled:opacity-50"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden />
                      Reopen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All missions */}
      <div>
        <h2 className="mb-4 font-heading text-lg font-black uppercase">
          All missions
        </h2>
        {missions === null ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : rest.length === 0 ? (
          <EmptyState message="No missions assigned yet" />
        ) : (
          <ul className="divide-y divide-gray-100 rounded-3xl bg-white px-6 shadow-sm">
            {rest.map((mission) => (
              <li key={mission.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{mission.text}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {mission.user.fullName} Â· +{mission.points} pts
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusPill status={mission.status} />
                  <button type="button"
                    onClick={() => remove(mission)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                    aria-label="Delete mission"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}