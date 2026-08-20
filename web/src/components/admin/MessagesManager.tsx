"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, Megaphone, Trash2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { Button, EmptyState, Spinner } from "@/components/ui";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  createdAt: string;
};

export function MessagesManager() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [announcement, setAnnouncement] = useState({ title: "", message: "", link: "" });
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<Message[]>("/api/contact?all=1");
      setMessages(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load messages.");
      setMessages([]);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(message: Message) {
    if (!window.confirm("Delete this message?")) return;
    try {
      await apiFetch(`/api/contact/${message.id}`, { method: "DELETE" });
      toast.success("Message deleted.");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed.");
    }
  }

  async function sendAnnouncement() {
    if (!announcement.title.trim()) {
      toast.warning("Write a title for the announcement.");
      return;
    }
    setSending(true);
    try {
      const result = await apiFetch<{ sent: number }>("/api/notifications/announce", {
        method: "POST",
        body: JSON.stringify({
          title: announcement.title.trim(),
          message: announcement.message.trim() || undefined,
          link: announcement.link.trim() || null,
        }),
      });
      toast.success(`Announcement sent to ${result.sent} member${result.sent === 1 ? "" : "s"}.`);
      setAnnouncement({ title: "", message: "", link: "" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not send announcement.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
          Messages
        </h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">
          Contact form inbox and club-wide announcements.
        </p>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-black uppercase">
          <Megaphone className="h-5 w-5 text-brand-yellow" aria-hidden />
          Send announcement
        </h2>
        <p className="mb-5 text-xs font-semibold text-gray-400">
          Delivered as a notification to every approved member.
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="ann-title" className="label">Title</label>
            <input
              id="ann-title"
              className="input"
              placeholder="e.g. New season kickoff event"
              value={announcement.title}
              onChange={(e) => setAnnouncement((p) => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="ann-message" className="label">Message</label>
            <textarea
              id="ann-message"
              rows={3}
              className="input resize-none"
              placeholder="What do members need to know?"
              value={announcement.message}
              onChange={(e) => setAnnouncement((p) => ({ ...p, message: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="ann-link" className="label">Link (optional)</label>
            <input
              id="ann-link"
              type="url"
              className="input"
              placeholder="https://…"
              value={announcement.link}
              onChange={(e) => setAnnouncement((p) => ({ ...p, link: e.target.value }))}
            />
          </div>
          <Button onClick={sendAnnouncement} loading={sending}>
            {sending ? "Sending" : "Send announcement"}
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-heading text-lg font-black uppercase">
          Contact inbox
        </h2>
        {messages === null ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState message="No messages yet" />
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <article key={message.id} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-yellow font-heading text-base font-black text-brand-black">
                      {message.name[0]?.toUpperCase() ?? "?"}
                    </span>
                    <div>
                      <p className="font-bold text-brand-black">{message.name}</p>
                      <a
                        href={`mailto:${message.email}`}
                        className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-brand-yellow-dark"
                      >
                        <Mail className="h-3.5 w-3.5" aria-hidden />
                        {message.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {new Date(message.createdAt).toLocaleDateString("en-GB")}
                    </span>
                    <button type="button"
                      onClick={() => remove(message)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                      aria-label="Delete message"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
                {message.subject ? (
                  <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {message.subject}
                  </p>
                ) : null}
                <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-relaxed text-gray-600">
                  {message.message}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}