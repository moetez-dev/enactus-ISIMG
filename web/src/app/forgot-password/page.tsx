import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset link for your Enactus ISIMG account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      footer={<>Enter your account email and we&apos;ll send you a reset link.</>}
    >
      <h1 className="font-heading text-3xl font-black uppercase tracking-tighter">
        Forgot password
      </h1>
      <p className="mb-8 mt-2 text-sm font-semibold text-gray-400">
        We&apos;ll email you a one-time link to set a new password.
      </p>
      <ForgotPasswordForm />
    </AuthShell>
  );
}