"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import { apiFetch, ApiError } from "@/lib/client-api";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/use-toast";

type DepartmentOption = { id: string; name: string };

export function RegistrationForm({
  departments,
}: {
  departments: DepartmentOption[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterInput) {
    setServerMessage(null);
    try {
      await apiFetch<{ id: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(values),
      });
      toast.success(
        "Application submitted! Check your email — you will be reviewed by our HR team.",
      );
      router.push("/login");
      router.refresh();
    } catch (err) {
      setServerMessage(
        err instanceof ApiError
          ? err.message
          : "Registration failed. Please try again.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="label">
            Full Name *
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            className="input"
            placeholder="Your full name"
            {...register("fullName")}
          />
          {errors.fullName ? (
            <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
              {errors.fullName.message}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="email" className="label">
            Email *
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email ? (
            <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="label">
          Password * (min 8 chars)
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className="input pr-14"
            placeholder="Create a password"
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

      <div>
        <span className="label" id="department-label">
          Choose Your Department *
        </span>
        <div
          role="radiogroup"
          aria-labelledby="department-label"
          className="grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          {departments.map((dept, i) => (
            <label key={dept.id} className="cursor-pointer">
              <input
                type="radio"
                value={dept.id}
                defaultChecked={i === 0}
                className="peer sr-only"
                {...register("departmentId")}
              />
              <span className="block rounded-2xl border-2 border-transparent bg-gray-50 py-3.5 text-center text-[9px] font-black uppercase tracking-widest transition-all peer-checked:border-brand-black peer-checked:bg-brand-black peer-checked:text-white hover:border-gray-200">
                {dept.name}
              </span>
            </label>
          ))}
        </div>
        {errors.departmentId ? (
          <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
            {errors.departmentId.message}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="motivation" className="label">
          Why Enactus ISIMG? *
        </label>
        <textarea
          id="motivation"
          placeholder="Tell us your motivation…"
          className="input h-32 resize-none"
          {...register("motivation")}
        />
        {errors.motivation ? (
          <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
            {errors.motivation.message}
          </p>
        ) : null}
      </div>

      {serverMessage ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {serverMessage}
        </div>
      ) : null}

      <Button type="submit" className="w-full py-5 text-xs" loading={isSubmitting}>
        {isSubmitting ? "Submitting" : "Submit Application →"}
      </Button>
      <p className="text-center text-[10px] font-semibold text-gray-400">
        Your application will be reviewed by our HR team. You&apos;ll receive a
        confirmation by email.
      </p>
    </form>
  );
}