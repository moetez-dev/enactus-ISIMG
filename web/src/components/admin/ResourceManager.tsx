"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { Button, EmptyState, Spinner } from "@/components/ui";

export type ResourceField =
  | { type: "text"; key: string; label: string }
  | { type: "slug"; key: string; label: string }
  | { type: "textarea"; key: string; label: string }
  | { type: "number"; key: string; label: string }
  | { type: "checkbox"; key: string; label: string }
  | { type: "url"; key: string; label: string }
  | { type: "email"; key: string; label: string }
  | { type: "datetime-local"; key: string; label: string }
  | { type: "select"; key: string; label: string; options: { value: string; label: string }[] };

type ResourceRecord = {
  id: string;
  [key: string]: unknown;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

function toFormValue(field: ResourceField, record?: ResourceRecord): string {
  const raw = record?.[field.key];
  if (field.type === "checkbox") return raw ? "true" : "false";
  if (field.type === "datetime-local" && typeof raw === "string") {
    // "2026-08-18T14:00:00.000Z" -> "2026-08-18T14:00"
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  }
  return raw == null ? "" : String(raw);
}

export function ResourceManager({
  resource,
  title,
  fields,
}: {
  resource: "projects" | "departments" | "events" | "team" | "news";
  title: string;
  fields: ResourceField[];
}) {
  const { toast } = useToast();
  const [records, setRecords] = useState<ResourceRecord[] | null>(null);
  const [editing, setEditing] = useState<ResourceRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<ResourceRecord[]>(`/api/${resource}?all=1`);
      setRecords(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load data.");
      setRecords([]);
    }
  }, [resource, toast]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setCreating(true);
    setForm(Object.fromEntries(fields.map((f) => [f.key, ""])));
  }

  function openEdit(record: ResourceRecord) {
    setEditing(record);
    setCreating(false);
    setForm(Object.fromEntries(fields.map((f) => [f.key, toFormValue(f, record)])));
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  async function submit() {
    const working = { ...form };
    // Auto-slug for projects/departments if slug is empty
    if (
      (resource === "projects" || resource === "departments") &&
      !working.slug?.trim() &&
      working.name?.trim()
    ) {
      working.slug = slugify(working.name);
    }
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const value = working[field.key];
      if (field.type === "checkbox") {
        payload[field.key] = value === "true";
      } else if (field.type === "number") {
        payload[field.key] = value ? Number(value) : 0;
      } else if (field.type === "datetime-local") {
        payload[field.key] = value || new Date().toISOString();
      } else {
        payload[field.key] = value;
      }
    }
    try {
      if (editing) {
        await apiFetch(`/api/${resource}/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Updated.");
      } else {
        await apiFetch(`/api/${resource}`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Created.");
      }
      closeForm();
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Save failed.");
    }
  }

  async function remove(record: ResourceRecord) {
    if (!window.confirm(`Delete "${String(record.name ?? record.title ?? record.key ?? record.id)}"?`)) return;
    try {
      await apiFetch(`/api/${resource}/${record.id}`, { method: "DELETE" });
      toast.success("Deleted.");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed.");
    }
  }

  const displayKey =
    resource === "team" ? "name" : resource === "news" ? "title" : "name";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
            {title}
          </h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            {records ? `${records.length} total` : "Loadingâ€¦"}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden />
          Add
        </Button>
      </div>

      {records === null ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : records.length === 0 ? (
        <EmptyState message={`No ${title.toLowerCase()} yet`} />
      ) : (
        <ul className="space-y-2">
          {records.map((record) => (
            <li
              key={record.id}
              className="flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-bold text-brand-black">
                  {String(record[displayKey] ?? record.id)}
                </p>
                {typeof record.tag === "string" ? (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {record.tag}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button type="button"
                  onClick={() => openEdit(record)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-brand-black hover:text-white"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </button>
                <button type="button"
                  onClick={() => remove(record)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {creating || editing ? (
        <FormOverlay
          title={editing ? "Edit" : "Add"}
          fields={fields}
          form={form}
          setForm={setForm}
          onClose={closeForm}
          onSubmit={submit}
        />
      ) : null}
    </div>
  );
}

function FormOverlay({
  title,
  fields,
  form,
  setForm,
  onClose,
  onSubmit,
}: {
  title: string;
  fields: ResourceField[];
  form: Record<string, string>;
  setForm: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    try {
      await onSubmit();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-white p-6 sm:rounded-[2rem] md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-xl font-black uppercase text-brand-black">
            {title}
          </h2>
          <button type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-brand-black hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field) => (
            <FieldInput
              key={field.key}
              field={field}
              value={form[field.key] ?? ""}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, [field.key]: value }))
              }
            />
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <Button onClick={handleSubmit} loading={saving} className="flex-1">
            {saving ? "Saving" : "Save"}
          </Button>
          <Button onClick={onClose} variant="ghost" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: ResourceField;
  value: string;
  onChange: (value: string) => void;
}) {
  const label = (
    <label htmlFor={`field-${field.key}`} className="label">
      {field.label}
    </label>
  );

  if (field.type === "checkbox") {
    return (
      <div>
        {label}
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            id={`field-${field.key}`}
            checked={value === "true"}
            onChange={(e) => onChange(e.target.checked ? "true" : "false")}
            className="h-5 w-5 accent-brand-yellow"
          />
          <span className="text-sm font-bold text-gray-600">
            {field.label}
          </span>
        </label>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        {label}
        <textarea
          id={`field-${field.key}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input h-32 resize-none"
        />
      </div>
    );
  }

  return (
    <div>
      {label}
      <input
        id={`field-${field.key}`}
        type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "datetime-local" ? "datetime-local" : field.type === "url" ? "url" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </div>
  );
}
