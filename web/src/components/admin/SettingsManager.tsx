"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui";
import { Spinner } from "@/components/ui";

type SettingRow = { key: string; value: string };

const FIELDS: { key: string; label: string; type?: string }[] = [
  { key: "siteName", label: "Site name" },
  { key: "description", label: "Tagline / description" },
  { key: "email", label: "Contact email", type: "email" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "facebook", label: "Facebook URL", type: "url" },
  { key: "instagram", label: "Instagram URL", type: "url" },
  { key: "tiktok", label: "TikTok URL", type: "url" },
  { key: "youtube", label: "YouTube URL", type: "url" },
];

export function SettingsManager() {
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<SettingRow[]>("/api/settings")
      .then((rows) => {
        setForm(Object.fromEntries(rows.map((r) => [r.key, String(r.value)])));
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to load settings.");
      })
      .finally(() => setLoading(false));
  }, [toast]);

  async function save() {
    setSaving(true);
    try {
      await apiFetch("/api/settings", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      toast.success("Settings saved.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
          Site settings
        </h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">
          Contact details and social links shown across the site.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
        <div className="space-y-5">
          {FIELDS.map(({ key, label, type }) => (
            <div key={key}>
              <label htmlFor={`setting-${key}`} className="label">
                {label}
              </label>
              <input
                id={`setting-${key}`}
                type={type ?? "text"}
                className="input"
                value={form[key] ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <Button onClick={save} loading={saving} className="mt-8 w-full">
          {saving ? "Saving" : "Save settings"}
        </Button>
      </div>
    </div>
  );
}