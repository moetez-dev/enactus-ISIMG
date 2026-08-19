import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your Enactus ISIMG account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell footer={<>Your reset link can only be used once and expires after an hour.</>}>
      <h1 className="font-heading text-3xl font-black uppercase tracking-tighter">
        Set a new password
      </h1>
      <p className="mb-8 mt-2 text-sm font-semibold text-gray-400">
        Choose a strong password you haven&apos;t used before.
      </p>
      <Suspense fallback={<div className="py-8 text-center text-sm font-semibold text-gray-400">Loading…</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}