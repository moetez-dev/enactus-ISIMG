"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validators";
import { apiFetch, ApiError } from "@/lib/client-api";
import { Button } from "@/components/ui";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState<{ message: string; devResetUrl?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setError(null);
    try {
      const result = await apiFetch<{ message: string; devResetUrl?: string }>(
        "/api/auth/forgot-password",
        { method: "POST", body: JSON.stringify(values) },
      );
      setSent(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <div
          role="status"
          className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800"
        >
          {sent.message}
        </div>
        {sent.devResetUrl && process.env.NODE_ENV !== "production" ? (
          <p className="break-all rounded-xl bg-gray-100 px-3 py-2 text-xs text-gray-600">
            Dev reset link:{" "}
            <a href={sent.devResetUrl} className="font-bold underline">
              {sent.devResetUrl}
            </a>
          </p>
        ) : null}
        <Link
          href="/login"
          className="flex w-full items-center justify-center rounded-2xl bg-brand-black py-4 font-heading text-sm font-black uppercase tracking-widest text-white transition-opacity hover:opacity-85"
        >
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="label">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="input"
          placeholder="name@example.com"
          {...register("email")}
        />
        {errors.email ? (
          <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      {error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <Button type="submit" variant="dark" className="w-full py-4" loading={isSubmitting}>
        {isSubmitting ? "Sending link" : "Send Reset Link"}
      </Button>

      <p className="text-center text-sm font-semibold text-gray-500">
        Remembered your password?{" "}
        <Link href="/login" className="font-black text-brand-black underline decoration-brand-yellow underline-offset-4 hover:text-brand-yellow-dark">
          Sign In →
        </Link>
      </p>
    </form>
  );
}