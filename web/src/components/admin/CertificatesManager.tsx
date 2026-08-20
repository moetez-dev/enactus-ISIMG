"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Ban, Plus, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { Button, EmptyState, Spinner } from "@/components/ui";

type CertificateRow = {
  id: string;
  certificateNumber: string;
  title: string;
  description: string | null;
  status: "ACTIVE" | "REVOKED";
  issueDate: string;
  user: { id: string; fullName: string; email: string };
  event: { id: string; title: string } | null;
  achievement: { id: string; name: string; icon: string } | null;
};

type MemberOption = { id: string; fullName: string };
type EventOption = { id: string; title: string };
type AchievementOption = { id: string; name: string };

export function CertificatesManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<CertificateRow[] | null>(null);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [achievements, setAchievements] = useState<AchievementOption[]>([]);
  const [issuing, setIssuing] = useState(false);
  const [form, setForm] = useState({
    userId: "",
    title: "",
    description: "",
    eventId: "",
    achievementId: "",
  });
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const certs = await apiFetch<CertificateRow[]>("/api/certificates?all=1");
      setItems(certs);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load certificates.");
      setItems([]);
    }
  }, [toast]);

  useEffect(() => {
    load();
    Promise.all([
      apiFetch<MemberOption[]>("/api/users?status=ALL"),
      apiFetch<EventOption[]>("/api/events?all=1"),
      apiFetch<AchievementOption[]>("/api/achievements"),
    ])
      .then(([users, evts, achievementsData]) => {
        setMembers(users.filter((u) => u.id));
        setEvents(evts);
        setAchievements(achievementsData);
      })
      .catch(() => {
        // options are non-critical; the list still loads
      });
  }, [load]);

  function openIssue() {
    setIssuing(true);
    setForm({ userId: "", title: "", description: "", eventId: "", achievementId: "" });
  }

  async function issue() {
    if (!form.userId || !form.title.trim()) {
      toast.warning("Pick a member and give the certificate a title.");
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/api/certificates", {
        method: "POST",
        body: JSON.stringify({
          userId: form.userId,
          title: form.title.trim(),
          description: form.description.trim() || null,
          eventId: form.eventId || null,
          achievementId: form.achievementId || null,
        }),
      });
      toast.success("Certificate issued.");
      setIssuing(false);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not issue certificate.");
    } finally {
      setSaving(false);
    }
  }

  async function revoke(cert: CertificateRow) {
    if (!window.confirm(`Revoke certificate "${cert.title}" for ${cert.user.fullName}?`)) return;
    setBusy(cert.id);
    try {
      await apiFetch(`/api/certificates/${cert.id}`, { method: "DELETE" });
      toast.success("Certificate revoked.");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Revoke failed.");
    } finally {
      setBusy(null);
    }
  }

  const active = (items ?? []).filter((c) => c.status === "ACTIVE");
  const revoked = (items ?? []).filter((c) => c.status === "REVOKED");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
            Certificates
          </h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Issue official certificates to members with a unique tracking number.
          </p>
        </div>
        <Button onClick={openIssue}>
          <Plus className="h-4 w-4" aria-hidden />
          Issue
        </Button>
      </div>

      {items === null ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState message="No certificates issued yet" />
      ) : (
        <>
          <div className="space-y-3">
            {active.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-yellow text-brand-black">
                    <BadgeCheck className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-brand-black">{cert.title}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {cert.user.fullName} · issued {new Date(cert.issueDate).toLocaleDateString("en-GB")}
                    </p>
                    {cert.event ? (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Event: {cert.event.title}
                      </p>
                    ) : null}
                    <p className="mt-1 font-mono text-[10px] font-bold text-brand-yellow-dark">
                      {cert.certificateNumber}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => revoke(cert)}
                  disabled={busy === cert.id}
                  className="flex h-9 shrink-0 items-center gap-1 rounded-xl bg-red-50 px-3 text-[9px] font-black uppercase tracking-widest text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
                >
                  <Ban className="h-4 w-4" aria-hidden />
                  Revoke
                </button>
              </div>
            ))}
          </div>
          {revoked.length > 0 ? (
            <div>
              <h2 className="mb-3 font-heading text-lg font-black uppercase">Revoked</h2>
              <div className="space-y-2">
                {revoked.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-3 opacity-60">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-500">{cert.title}</p>
                      <p className="font-mono text-[10px] font-bold text-gray-400">{cert.certificateNumber}</p>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Revoked</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}

      {issuing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-white p-6 sm:rounded-[2rem] md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-xl font-black uppercase text-brand-black">
                Issue certificate
              </h2>
              <button
                type="button"
                onClick={() => setIssuing(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-brand-black hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="cert-member" className="label">Member</label>
                <select id="cert-member" className="input" value={form.userId} onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}>
                  <option value="">Select a member…</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cert-title" className="label">Certificate title</label>
                <input id="cert-title" className="input" placeholder="e.g. Green Tech Day Participant" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="cert-desc" className="label">Description (optional)</label>
                <textarea id="cert-desc" rows={3} className="input resize-none" placeholder="What this certificate recognises…" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="cert-event" className="label">Related event (optional)</label>
                <select id="cert-event" className="input" value={form.eventId} onChange={(e) => setForm((p) => ({ ...p, eventId: e.target.value }))}>
                  <option value="">None</option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>{evt.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cert-ach" className="label">Related achievement (optional)</label>
                <select id="cert-ach" className="input" value={form.achievementId} onChange={(e) => setForm((p) => ({ ...p, achievementId: e.target.value }))}>
                  <option value="">None</option>
                  {achievements.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <Button onClick={issue} loading={saving} className="flex-1">
                {saving ? "Issuing" : "Issue certificate"}
              </Button>
              <Button onClick={() => setIssuing(false)} variant="ghost" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}