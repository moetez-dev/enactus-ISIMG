"use client";

import { useCallback, useEffect, useState } from "react";
import { UserCheck, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { EmptyState, Spinner } from "@/components/ui";

type EventOption = { id: string; title: string; date: string; location: string | null };

type Participant = {
  id: string;
  status: "REGISTERED" | "ATTENDED";
  hours: number;
  registeredAt: string;
  attendedAt: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
    profilePic: string | null;
    department: { name: string } | null;
  };
};

export function AttendanceManager() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selected, setSelected] = useState("");
  const [participants, setParticipants] = useState<Participant[] | null>(null);
  const [eventTitle, setEventTitle] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [hoursDraft, setHoursDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch<EventOption[]>("/api/events?all=1")
      .then(setEvents)
      .catch(() => {});
  }, []);

  const loadRoster = useCallback(async (eventId: string) => {
    setParticipants(null);
    try {
      const data = await apiFetch<{ event: EventOption; registrations: Participant[] }>(
        `/api/events/${eventId}/attendance`,
      );
      setEventTitle(data.event.title);
      setParticipants(data.registrations);
      setHoursDraft(
        Object.fromEntries(
          data.registrations.map((p) => [p.id, String(p.hours ?? 0)]),
        ),
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load attendance.");
      setParticipants([]);
    }
  }, [toast]);

  function selectEvent(eventId: string) {
    setSelected(eventId);
    if (eventId) loadRoster(eventId);
    else {
      setParticipants(null);
      setEventTitle(null);
    }
  }

  async function setStatus(userId: string, status: "ATTENDED" | "REGISTERED", name: string, hours?: number) {
    setBusy(userId);
    try {
      await apiFetch(`/api/events/${selected}/attendance`, {
        method: "POST",
        body: JSON.stringify(hours === undefined ? { userId, status } : { userId, status, hours }),
      });
      toast.success(status === "ATTENDED" ? `${name} marked as attended.` : `${name} moved back to registered.`);
      await loadRoster(selected);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed.");
    } finally {
      setBusy(null);
    }
  }

  async function saveHours(userId: string, name: string) {
    const hours = Number(hoursDraft[userId]);
    if (!Number.isFinite(hours) || hours < 0 || hours > 500) {
      toast.warning("Hours must be between 0 and 500.");
      return;
    }
    await setStatus(userId, "ATTENDED", name, hours);
  }

  async function removeParticipant(userId: string, name: string) {
    if (!window.confirm(`Remove ${name} from this event's roster?`)) return;
    setBusy(userId);
    try {
      await apiFetch(`/api/events/${selected}/attendance`, {
        method: "DELETE",
        body: JSON.stringify({ userId }),
      });
      toast.success(`${name} removed from the roster.`);
      await loadRoster(selected);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Remove failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
          Event attendance
        </h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">
          Pick an event, then check in members who attended.
        </p>
      </div>

      <div>
        <label htmlFor="attendance-event" className="label">
          Event
        </label>
        <select
          id="attendance-event"
          className="input max-w-md"
          value={selected}
          onChange={(e) => selectEvent(e.target.value)}
        >
          <option value="">Select an event…</option>
          {events.map((evt) => (
            <option key={evt.id} value={evt.id}>
              {evt.title} · {new Date(evt.date).toLocaleDateString("en-GB")}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs font-semibold text-gray-400">
          Members register themselves from the member area; marking attendance
          here unlocks event achievements automatically.
        </p>
      </div>

      {selected ? (
        participants === null ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : participants.length === 0 ? (
          <EmptyState
            icon={<UserCheck className="h-10 w-10 text-gray-300" aria-hidden />}
            message="No registrations for this event yet"
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-500">
                {eventTitle} ·{" "}
                {participants.filter((p) => p.status === "ATTENDED").length} attended of{" "}
                {participants.length}
              </p>
            </div>
            <ul className="space-y-2">
              {participants.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-brand-black">{p.user.fullName}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {p.user.department?.name ?? "No department"} ·{" "}
                      {p.status === "ATTENDED"
                        ? `attended ${p.attendedAt ? new Date(p.attendedAt).toLocaleDateString("en-GB") : ""}${p.hours > 0 ? ` · ${p.hours}h` : ""}`
                        : `registered ${new Date(p.registeredAt).toLocaleDateString("en-GB")}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {p.status === "REGISTERED" ? (
                      <>
                        <input
                          type="number"
                          min={0}
                          max={500}
                          placeholder="h"
                          className="w-16 rounded-xl border-2 border-transparent bg-gray-100 px-3 py-2 text-xs font-bold outline-none transition focus:border-brand-yellow"
                          aria-label={`Hours for ${p.user.fullName}`}
                          value={hoursDraft[p.id] ?? "0"}
                          onChange={(e) =>
                            setHoursDraft((prev) => ({ ...prev, [p.id]: e.target.value }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const hours = Number(hoursDraft[p.id]);
                            setStatus(
                              p.user.id,
                              "ATTENDED",
                              p.user.fullName,
                              Number.isFinite(hours) && hours >= 0 ? hours : 0,
                            );
                          }}
                          disabled={busy === p.user.id}
                          className="flex h-9 items-center gap-1 rounded-xl bg-green-50 px-3 text-[9px] font-black uppercase tracking-widest text-green-700 transition-colors hover:bg-green-600 hover:text-white disabled:opacity-50"
                        >
                          <UserCheck className="h-4 w-4" aria-hidden />
                          Mark attended
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="number"
                          min={0}
                          max={500}
                          placeholder="h"
                          className="w-16 rounded-xl border-2 border-brand-yellow bg-white px-3 py-2 text-xs font-bold outline-none focus:border-brand-black"
                          aria-label={`Hours attended by ${p.user.fullName}`}
                          value={hoursDraft[p.id] ?? String(p.hours ?? 0)}
                          onChange={(e) =>
                            setHoursDraft((prev) => ({ ...prev, [p.id]: e.target.value }))
                          }
                          onBlur={() => saveHours(p.user.id, p.user.fullName)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.currentTarget.blur();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setStatus(p.user.id, "REGISTERED", p.user.fullName)}
                          disabled={busy === p.user.id}
                          className="flex h-9 items-center gap-1 rounded-xl bg-gray-100 px-3 text-[9px] font-black uppercase tracking-widest text-gray-600 transition-colors hover:bg-brand-black hover:text-white disabled:opacity-50"
                        >
                          Undo
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => removeParticipant(p.user.id, p.user.fullName)}
                      disabled={busy === p.user.id}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
                      aria-label={`Remove ${p.user.fullName}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      ) : null}
    </div>
  );
}