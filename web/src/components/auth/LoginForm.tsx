"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { apiFetch, ApiError } from "@/lib/client-api";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/use-toast";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [serverMessage, setServerMessage] = useState<{
    type: "pending" | "rejected" | "error";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginInput) {
    setServerMessage(null);
    try {
      const result = await apiFetch<{
        redirect: string;
        status: "PENDING" | "APPROVED" | "REJECTED";
        fullName: string;
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });

      toast.success(`Welcome back, ${result.fullName.split(" ")[0]}!`);
      router.push(result.redirect);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Login failed. Try again.";
      setServerMessage({
        type: message.toLowerCase().includes("awaiting approval")
          ? "pending"
          : message.toLowerCase().includes("not approved")
            ? "rejected"
            : "error",
        message,
      });
    }
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

      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="input pr-14"
            placeholder="••••••••"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-brand-black"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden />
            ) : (
              <Eye className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
        {errors.password ? (
          <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      {serverMessage ? (
        <div
          role="alert"
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            serverMessage.type === "pending"
              ? "border-yellow-300 bg-yellow-50 text-yellow-800"
              : serverMessage.type === "rejected"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {serverMessage.message}
        </div>
      ) : null}

      <Button type="submit" variant="dark" className="w-full py-4" loading={isSubmitting}>
        {isSubmitting ? "Authenticating" : "Sign In"}
      </Button>

      <p className="text-center text-sm font-semibold text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-black text-brand-black underline decoration-brand-yellow underline-offset-4 hover:text-brand-yellow-dark">
          Apply Now →
        </Link>
      </p>
    </form>
  );
}