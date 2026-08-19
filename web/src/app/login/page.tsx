import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Member Portal",
  description: "Log in to your Enactus ISIMG member account.",
};

export default function LoginPage() {
  return (
    <AuthShell
      footer={
        <>
          Forgot your password?{" "}
          <Link
            href="/forgot-password"
            className="font-bold text-brand-yellow-dark underline underline-offset-4 hover:text-brand-yellow"
          >
            Request a reset
          </Link>
        </>
      }
    >
      <h1 className="font-heading text-3xl font-black uppercase tracking-tighter">
        Welcome back
      </h1>
      <p className="mb-8 mt-2 text-sm font-semibold text-gray-400">
        Sign in to access your member dashboard.
      </p>
      <LoginForm />
    </AuthShell>
  );
}