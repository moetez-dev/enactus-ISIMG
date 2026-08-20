"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Trophy, Award } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { Button, EmptyState, Spinner } from "@/components/ui";

type AchievementRow = {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria:
    | "MANUAL"
    | "MISSIONS_COMPLETED"
    | "XP_TOTAL"
    | "EVENTS_ATTENDED"
    | "PROJECTS_JOINED";
  threshold: number;
  xpReward: number;
  active: boolean;
  _count: { earnedBy: number };
};

type MemberOption = { id: string; fullName: string };

const CRITERIA_OPTIONS = [
  { value: "MANUAL", label: "Manual (admin awards only)" },
  { value: "MISSIONS_COMPLETED", label: "Missions completed" },
  { value: "XP_TOTAL", label: "Total XP" },
  { value: "EVENTS_ATTENDED", label: "Events attended" },
  { value: "PROJECTS_JOINED", label: "Projects joined" },
];

const ICON_OPTIONS = ["trophy", "medal", "rocket", "calendar", "target"];

export function AchievementsManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<AchievementRow[] | null>(null);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AchievementRow | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "trophy",
    criteria: "MANUAL",
    threshold: "0",
    xpReward: "0",
  });
  const [saving, setSaving] = useState(false);

  // Award/revoke state
  const [awardFor, setAwardFor] = useState<AchievementRow | null>(null);
  const [awardMember, setAwardMember] = useState("");
  const [revokeFor, setRevokeFor] = useState<AchievementRow | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [achievements, users] = await Promise.all([
        apiFetch<AchievementRow[]>("/api/achievements"),
        apiFetch<MemberOption[]>("/api/users?status=ALL"),
      ]);
      setItems(achievements);
      setMembers(users.filter((u) => u.id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load achievements.");
      setItems([]);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      icon: "trophy",
      criteria: "MANUAL",
      threshold: "0",
      xpReward: "0",
    });
    setFormOpen(true);
  }

  function openEdit(item: AchievementRow) {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description,
      icon: item.icon,
      criteria: item.criteria,
      threshold: String(item.threshold),
      xpReward: String(item.xpReward),
    });
    setFormOpen(true);
  }

  async function submit() {
    if (!form.name.trim() || !form.description.trim()) {
      toast.warning("Fill in the name and description.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon,
      criteria: form.criteria,
      threshold: Number(form.threshold) || 0,
      xpReward: Number(form.xpReward) || 0,
    };
    try {
      if (editing) {
        await apiFetch(`/api/achievements/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Achievement updated.");
      } else {
        await apiFetch("/api/achievements", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Achievement created.");
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function archive(item: AchievementRow) {
    const safe =
      item._count.earnedBy === 0
        ? `Delete "${item.name}"?`
        : `Archive "${item.name}"? Members keep already-earned badges, but it will no longer be visible or auto-awarded.`;
    if (!window.confirm(safe)) return;
    try {
      await apiFetch(`/api/achievements/${item.id}`, { method: "DELETE" });
      toast.success(item._count.earnedBy === 0 ? "Achievement deleted." : "Achievement archived.");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed.");
    }
  }

  async function award() {
    if (!awardFor || !awardMember) {
      toast.warning("Pick a member first.");
      return;
    }
    setBusy("award");
    try {
      await apiFetch(`/api/achievements/${awardFor.id}/award`, {
        method: "POST",
        body: JSON.stringify({ userId: awardMember }),
      });
      toast.success("Achievement awarded.");
      setAwardFor(null);
      setAwardMember("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Award failed.");
    } finally {
      setBusy(null);
    }
  }

  async function revoke() {
    if (!revokeFor || !awardMember) return;
    setBusy("revoke");
    try {
      await apiFetch(`/api/achievements/${revokeFor.id}/revoke`, {
        method: "POST",
        body: JSON.stringify({ userId: awardMember }),
      });
      toast.success("Achievement revoked.");
      setRevokeFor(null);
      setAwardMember("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Revoke failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
            Achievements
          </h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Badges members unlock automatically or receive from you.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden />
          Create
        </Button>
      </div>

      <div className="flex items-center gap-2 rounded-2xl bg-white px-5 py-4 shadow-sm">
        <Award className="h-5 w-5 text-brand-yellow" aria-hidden />
        <p className="text-xs font-bold text-gray-500">
          Auto-awards are driven by real activity: missions completed, XP, events
          attended and project participation. No fake progress is ever shown.
        </p>
      </div>

      {items === null ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState message="No achievements yet" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm ${
                item.active ? "" : "opacity-60"
              }`}
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-yellow text-brand-black">
                  <Trophy className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-brand-black">{item.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {criteriaLabel(item.criteria)}{" "}
                    {item.criteria !== "MANUAL" ? `· ${item.threshold}+` : ""} ·{" "}
                    {item._count.earnedBy} earned{!item.active ? " · archived" : ""}
                    {item.xpReward > 0 ? ` · ${item.xpReward} XP reward` : ""}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {item.active ? (
                  <button
                    type="button"
                    onClick={() => { setAwardFor(item); setAwardMember(""); }}
                    className="flex h-9 items-center gap-1 rounded-xl bg-green-50 px-3 text-[9px] font-black uppercase tracking-widest text-green-700 transition-colors hover:bg-green-600 hover:text-white"
                    aria-label={`Award ${item.name}`}
                  >
                    Award
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-brand-black hover:text-white"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </button>
                {item._count.earnedBy > 0 ? (
                  <button
                    type="button"
                    onClick={() => { setRevokeFor(item); setAwardMember(""); }}
                    className="flex h-9 items-center gap-1 rounded-xl bg-red-50 px-3 text-[9px] font-black uppercase tracking-widest text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                    aria-label={`Revoke ${item.name}`}
                    title="Revoke from a specific member"
                  >
                    Revoke
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => archive(item)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-white p-6 sm:rounded-[2rem] md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-xl font-black uppercase text-brand-black">
                {editing ? "Edit achievement" : "New achievement"}
              </h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-brand-black hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="ach-name" className="label">Name</label>
                <input id="ach-name" className="input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="ach-desc" className="label">Description</label>
                <textarea id="ach-desc" rows={3} className="input resize-none" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ach-icon" className="label">Icon</label>
                  <select id="ach-icon" className="input" value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}>
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="ach-xp" className="label">XP reward</label>
                  <input id="ach-xp" type="number" min={0} max={5000} className="input" value={form.xpReward} onChange={(e) => setForm((p) => ({ ...p, xpReward: e.target.value }))} />
                </div>
              </div>
              <div>
                <label htmlFor="ach-criteria" className="label">Unlock criteria</label>
                <select id="ach-criteria" className="input" value={form.criteria} onChange={(e) => setForm((p) => ({ ...p, criteria: e.target.value }))}>
                  {CRITERIA_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              {form.criteria !== "MANUAL" ? (
                <div>
                  <label htmlFor="ach-threshold" className="label">Threshold</label>
                  <input id="ach-threshold" type="number" min={1} className="input" value={form.threshold} onChange={(e) => setForm((p) => ({ ...p, threshold: e.target.value }))} />
                </div>
              ) : null}
            </div>
            <div className="mt-8 flex gap-3">
              <Button onClick={submit} loading={saving} className="flex-1">
                {saving ? "Saving" : "Save"}
              </Button>
              <Button onClick={() => setFormOpen(false)} variant="ghost" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {awardFor ? (
        <AwardOverlay
          title={`Award: ${awardFor.name}`}
          members={members}
          selected={awardMember}
          setSelected={setAwardMember}
          busy={busy === "award"}
          onConfirm={award}
          onClose={() => setAwardFor(null)}
        />
      ) : null}

      {revokeFor ? (
        <AwardOverlay
          title={`Revoke: ${revokeFor.name}`}
          members={members}
          selected={awardMember}
          setSelected={setAwardMember}
          busy={busy === "revoke"}
          onConfirm={revoke}
          onClose={() => setRevokeFor(null)}
          confirmLabel="Revoke"
        />
      ) : null}
    </div>
  );
}

function AwardOverlay({
  title,
  members,
  selected,
  setSelected,
  busy,
  onConfirm,
  onClose,
  confirmLabel = "Award",
}: {
  title: string;
  members: MemberOption[];
  selected: string;
  setSelected: (v: string) => void;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
  confirmLabel?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-6 md:p-8">
        <h2 className="font-heading text-xl font-black uppercase text-brand-black">{title}</h2>
        <div className="mt-5">
          <label htmlFor="award-member" className="label">Member</label>
          <select
            id="award-member"
            className="input"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Select a member…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.fullName}</option>
            ))}
          </select>
        </div>
        <div className="mt-8 flex gap-3">
          <Button onClick={onConfirm} loading={busy} variant={confirmLabel === "Revoke" ? "danger" : "yellow"} className="flex-1">
            {busy ? "Working" : confirmLabel}
          </Button>
          <Button onClick={onClose} variant="ghost" className="flex-1">Cancel</Button>
        </div>
      </div>
    </div>
  );
}

function criteriaLabel(criteria: string): string {
  switch (criteria) {
    case "MISSIONS_COMPLETED":
      return "Missions completed";
    case "XP_TOTAL":
      return "Total XP";
    case "EVENTS_ATTENDED":
      return "Events attended";
    case "PROJECTS_JOINED":
      return "Projects joined";
    default:
      return "Manual";
  }
}