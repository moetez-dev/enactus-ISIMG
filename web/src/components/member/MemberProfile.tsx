"use client";

import { useState } from "react";
import Image from "next/image";
import { CircleAlert } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/client-api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui";
import type { MemberUser } from "@/components/member/types";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <span className="text-right text-sm font-bold text-brand-black">{value}</span>
    </div>
  );
}

export function MemberProfile({
  user,
  onSaved,
}: {
  user: MemberUser;
  onSaved: (user: MemberUser) => void;
}) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user.fullName);
  const [profilePic, setProfilePic] = useState(user.profilePic ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const updated = await apiFetch<MemberUser>("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          fullName: fullName.trim(),
          profilePic: profilePic.trim() || null,
          phone: phone.trim() || null,
          bio: bio.trim() || null,
        }),
      });
      onSaved(updated);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  const joined = new Date(user.createdAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
          Your profile
        </h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">
          Keep your details up to date.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8 lg:col-span-2">
          <div className="space-y-5">
            <div>
              <label htmlFor="member-name" className="label">
                Full Name
              </label>
              <input
                id="member-name"
                type="text"
                className="input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="member-phone" className="label">
                Phone
              </label>
              <input
                id="member-phone"
                type="tel"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+216 ..."
              />
            </div>
            <div>
              <label htmlFor="member-bio" className="label">
                Short bio
              </label>
              <textarea
                id="member-bio"
                rows={4}
                className="input resize-none"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell your team a little about yourself"
              />
            </div>
            <div>
              <label htmlFor="member-pic" className="label">
                Profile picture URL
              </label>
              <input
                id="member-pic"
                type="url"
                className="input"
                value={profilePic}
                onChange={(e) => setProfilePic(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <Button onClick={save} loading={saving} className="mt-8 w-full">
            {saving ? "Saving" : "Save changes"}
          </Button>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
            {profilePic ? (
              <Image
                src={profilePic}
                alt={fullName}
                width={96}
                height={96}
                className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-brand-yellow/30"
              />
            ) : (
              <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-yellow font-heading text-3xl font-black text-brand-black">
                {fullName[0]?.toUpperCase() ?? "?"}
              </span>
            )}
            <p className="mt-4 font-heading text-lg font-black uppercase">
              {fullName}
            </p>
            <p className="mt-1 break-all text-xs font-semibold text-gray-400">
              {user.email}
            </p>
          </div>

          <div className="divide-y divide-gray-100 rounded-3xl bg-white px-6 py-2 shadow-sm">
            <InfoRow label="Role" value={user.role === "ADMIN" ? "Admin" : "Member"} />
            <InfoRow
              label="Department"
              value={user.department?.name ?? "Not assigned"}
            />
            <InfoRow label="Member since" value={joined} />
            <InfoRow label="XP" value={`${user.points} XP`} />
            <InfoRow label="Level" value={user.level} />
            {user.motivation ? (
              <div className="py-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Motivation
                </span>
                <p className="mt-1 text-sm font-semibold text-gray-600">
                  {user.motivation}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-3xl border-2 border-dashed border-gray-200 p-5 text-sm font-semibold text-gray-500">
        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-brand-yellow" aria-hidden />
        Contact an admin to change your department, role, or email address.
      </div>
    </div>
  );
}