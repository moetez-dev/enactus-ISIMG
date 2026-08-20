"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Clock, Plus, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { Button, EmptyState, Spinner } from "@/components/ui";
import type {
  MemberEvent,
  MemberEventRegistration,
} from "@/components/member/types";

type RegistrationRow = {
  id: string;
  status: "REGISTERED" | "ATTENDED";
  registeredAt: string;
  attendedAt: string | null;
  event: MemberEvent;
};

export function MemberEvents() {
  const { toast } = useToast();
  const [upcoming, setUpcoming] = useState<MemberEvent[] | null>(null);
  const [rows, setRows] = useState<RegistrationRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setUpcoming(null);
    setRows(null);
    try {
      const [events, registrations] = await Promise.all([
        apiFetch<MemberEvent[]>("/api/events"),
        apiFetch<MemberEventRegistration[]>("/api/events/mine"),
      ]);
      setUpcoming(events);
      setRows(registrations);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load events.");
      setUpcoming([]);
      setRows([]);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function register(eventId: string) {
    setBusy(eventId);
    try {
      await apiFetch(`/api/events/${eventId}/register`, { method: "POST" });
      toast.success("Registered for the event.");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not register.");
    } finally {
      setBusy(null);
    }
  }

  async function cancel(event: MemberEvent, _registrationId: string) {
    if (!window.confirm(`Cancel your registration for "${event.title}"?`)) return;
    setBusy(event.id);
    try {
      await apiFetch(`/api/events/${event.id}/register`, { method: "DELETE" });
      toast.success("Registration cancelled.");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not cancel.");
    } finally {
      setBusy(null);
    }
  }

  if (upcoming === null || rows === null) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const attended = rows.filter((r) => r.status === "ATTENDED");
  const registered = rows.filter((r) => r.status === "REGISTERED");
  const _registeredIds = new Set(rows.map((r) => r.event.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
          Events
        </h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">
          Register for upcoming events, track attendance and revisit history.
        </p>
      </div>

      <section>
        <h2 className="mb-4 font-heading text-lg font-black uppercase">
          Upcoming events
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-10 w-10 text-gray-300" aria-hidden />}
            message="No upcoming events right now"
          />
        ) : (
          <div className="space-y-4">
            {upcoming.map((event) => {
              const mine = rows.find((r) => r.event.id === event.id);
              const isRegistered = mine?.status === "REGISTERED";
              return (
                <div key={event.id} className="rounded-3xl bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-heading text-lg font-black uppercase text-brand-black">
                        {event.title}
                      </p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-brand-yellow-dark">
                        {new Date(event.date).toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}{" "}
                        · {event.location ?? "TBA"}
                      </p>
                      {event.description ? (
                        <p className="mt-2 max-w-xl text-sm font-medium text-gray-500">
                          {event.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {isRegistered ? (
                        <>
                          <span className="rounded-full bg-green-50 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-green-700">
                            Registered
                          </span>
                          <Button
                            variant="ghost"
                            onClick={() => mine && cancel(event, mine.id)}
                            loading={busy === event.id}
                          >
                            <X className="h-4 w-4" aria-hidden />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => register(event.id)}
                          loading={busy === event.id}
                        >
                          <Plus className="h-4 w-4" aria-hidden />
                          Register
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-heading text-lg font-black uppercase">
          Registered
        </h2>
        {registered.length === 0 ? (
          <EmptyState
            icon={<Clock className="h-10 w-10 text-gray-300" aria-hidden />}
            message="You have not registered for any events yet"
          />
        ) : (
          <ul className="space-y-3">
            {registered.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm"
              >
                <div>
                  <p className="truncate font-bold text-brand-black">
                    {r.event.title}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {new Date(r.event.date).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-blue-700">
                  Registered
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-heading text-lg font-black uppercase">
          Attended history
        </h2>
        {attended.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="h-10 w-10 text-gray-300" aria-hidden />}
            message="No attended events yet"
          />
        ) : (
          <ul className="space-y-3">
            {attended.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm"
              >
                <div>
                  <p className="truncate font-bold text-brand-black">
                    {r.event.title}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {r.attendedAt
                      ? `Attended ${new Date(r.attendedAt).toLocaleDateString("en-GB")}`
                      : new Date(r.event.date).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-green-700">
                  Attended
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}