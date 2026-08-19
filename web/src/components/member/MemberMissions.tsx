"use client";

import { useState } from "react";
import { Target } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { Button, EmptyState } from "@/components/ui";
import { StatusPill } from "@/components/status";
import type { MemberMission } from "@/components/member/types";

export function MemberMissions({
  missions,
  onChanged,
}: {
  missions: MemberMission[];
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
          Complete missions to earn XP and level up.
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
                    +{mission.points} XP
                  </p>
                </div>
                <StatusPill status={mission.status} />
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Paste your work link (https://...)"
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
                    +{mission.points} XP
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