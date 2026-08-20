"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, ExternalLink } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { EmptyState, Spinner } from "@/components/ui";
import type { MemberCertificate } from "@/components/member/types";

export function MemberCertificates() {
  const { toast } = useToast();
  const [items, setItems] = useState<MemberCertificate[] | null>(null);
  const [viewing, setViewing] = useState<MemberCertificate | null>(null);

  const load = useCallback(async () => {
    setItems(null);
    try {
      setItems(await apiFetch<MemberCertificate[]>("/api/certificates"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load certificates.");
      setItems([]);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
          Certificates
        </h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">
          Official certificates issued to you by the club.
        </p>
      </div>

      {items === null ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<BadgeCheck className="h-10 w-10 text-gray-300" aria-hidden />}
          message="No certificates yet"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((cert) => (
            <button
              type="button"
              key={cert.id}
              onClick={() => setViewing(cert)}
              className="flex items-center gap-5 rounded-3xl bg-white p-6 text-left shadow-sm transition-all hover:shadow-md"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-yellow text-brand-black">
                <BadgeCheck className="h-7 w-7" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-base font-black uppercase text-brand-black">
                  {cert.title}
                </p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Issued {new Date(cert.issueDate).toLocaleDateString("en-GB")}
                </p>
                <p className="mt-1 truncate font-mono text-[10px] font-bold text-brand-yellow-dark">
                  {cert.certificateNumber}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-gray-300" aria-hidden />
            </button>
          ))}
        </div>
      )}

      {viewing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="bg-brand-black p-8 text-center text-white">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-yellow">
                Enactus ISIMG · Gabès
              </p>
              <h2 className="mt-4 font-heading text-3xl font-black uppercase leading-tight">
                {viewing.title}
              </h2>
            </div>
            <div className="space-y-4 p-8">
              <p className="text-center text-sm font-medium leading-relaxed text-gray-500">
                This is to certify that{" "}
                <span className="font-black text-brand-black">you</span>{" "}
                {viewing.description ?? "have completed the requirements."}
              </p>
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <span>
                  Issued{" "}
                  {new Date(viewing.issueDate).toLocaleDateString("en-GB")}
                </span>
                <span className="font-mono text-brand-yellow-dark">
                  {viewing.certificateNumber}
                </span>
              </div>
              {viewing.event ? (
                <p className="text-center text-xs font-bold text-gray-400">
                  Related event: {viewing.event.title}
                </p>
              ) : null}
              {viewing.achievement ? (
                <p className="text-center text-xs font-bold text-gray-400">
                  Related achievement: {viewing.achievement.name}
                </p>
              ) : null}
              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-full bg-brand-yellow px-6 py-3 text-[10px] font-black uppercase tracking-widest text-brand-black transition-colors hover:bg-brand-yellow-dark"
                >
                  Print / Save PDF
                </button>
                <a
                  href={`/verify/certificate/${viewing.certificateNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border-2 border-brand-black/10 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600 transition-colors hover:border-brand-black hover:text-brand-black"
                >
                  Verify online
                </a>
                <button
                  type="button"
                  onClick={() => setViewing(null)}
                  className="rounded-full bg-gray-100 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600 transition-colors hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}