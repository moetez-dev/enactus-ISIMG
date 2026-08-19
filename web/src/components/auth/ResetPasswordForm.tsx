"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resetPasswordSchema } from "@/lib/validators";
import { apiFetch, ApiError } from "@/lib/client-api";
import { Button } from "@/components/ui";

const formSchema = z
  .object({
    password: resetPasswordSchema.shape.password,
    confirm: z.string().min(1, "Please confirm your password."),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof formSchema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const result = await apiFetch<{ message: string }>("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password: values.password }),
      });
      setDone(result.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          This reset link is missing its token. Request a new one.
        </div>
        <Link
          href="/forgot-password"
          className="flex w-full items-center justify-center rounded-2xl bg-brand-black py-4 font-heading text-sm font-black uppercase tracking-widest text-white transition-opacity hover:opacity-85"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-4">
        <div role="status" className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          {done}
        </div>
        <Link
          href="/login"
          className="flex w-full items-center justify-center rounded-2xl bg-brand-black py-4 font-heading text-sm font-black uppercase tracking-widest text-white transition-opacity hover:opacity-85"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="password" className="label">
          New Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className="input"
          placeholder="At least 8 characters"
          {...register("password")}
        />
        {errors.password ? (
          <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="confirm" className="label">
          Confirm Password
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          className="input"
          placeholder="Repeat your password"
          {...register("confirm")}
        />
        {errors.confirm ? (
          <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
            {errors.confirm.message}
          </p>
        ) : null}
      </div>

      {error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <Button type="submit" variant="dark" className="w-full py-4" loading={isSubmitting}>
        {isSubmitting ? "Resetting" : "Reset Password"}
      </Button>
    </form>
  );
}