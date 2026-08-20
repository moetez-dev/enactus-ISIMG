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
  const [skillsText, setSkillsText] = useState("");
  const [interestsText, setInterestsText] = useState("");

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
      const payload = {
        ...values,
        skills: skillsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        interests: interestsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      await apiFetch<{ id: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
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

      <div>
        <span className="label" id="about-label">
          About You
        </span>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="institution" className="label">
              Institution / University
            </label>
            <input
              id="institution"
              type="text"
              autoComplete="organization"
              className="input"
              placeholder="e.g. Higher Institute of Management, ISIMG"
              {...register("institution")}
            />
            {errors.institution ? (
              <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
                {errors.institution.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="fieldOfStudy" className="label">
              Field of Study
            </label>
            <input
              id="fieldOfStudy"
              type="text"
              autoComplete="off"
              className="input"
              placeholder="e.g. Management, IT, Marketing"
              {...register("fieldOfStudy")}
            />
            {errors.fieldOfStudy ? (
              <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
                {errors.fieldOfStudy.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="studyLevel" className="label">
              Study Level
            </label>
            <select id="studyLevel" className="input" {...register("studyLevel")}>
              <option value="">Select…</option>
              <option value="Licence 1">Licence 1</option>
              <option value="Licence 2">Licence 2</option>
              <option value="Licence 3">Licence 3</option>
              <option value="Master 1">Master 1</option>
              <option value="Master 2">Master 2</option>
              <option value="Doctorate">Doctorate</option>
            </select>
            {errors.studyLevel ? (
              <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
                {errors.studyLevel.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="availability" className="label">
              Weekly Availability
            </label>
            <select
              id="availability"
              className="input"
              {...register("availability")}
            >
              <option value="">Select…</option>
              <option value="1-3 hours">1-3 hours</option>
              <option value="4-6 hours">4-6 hours</option>
              <option value="7-10 hours">7-10 hours</option>
              <option value="10+ hours">10+ hours</option>
            </select>
            {errors.availability ? (
              <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
                {errors.availability.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="skills" className="label">
              Skills (comma separated)
            </label>
            <input
              id="skills"
              type="text"
              autoComplete="off"
              className="input"
              placeholder="e.g. Design, Public Speaking, Coding"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="interests" className="label">
              Interests (comma separated)
            </label>
            <input
              id="interests"
              type="text"
              autoComplete="off"
              className="input"
              placeholder="e.g. Sustainability, Entrepreneurship"
              value={interestsText}
              onChange={(e) => setInterestsText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="phone" className="label">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              className="input"
              placeholder="+213 6…"
              {...register("phone")}
            />
            {errors.phone ? (
              <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
                {errors.phone.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="linkedin" className="label">
              LinkedIn Profile
            </label>
            <input
              id="linkedin"
              type="url"
              autoComplete="off"
              className="input"
              placeholder="https://linkedin.com/in/…"
              {...register("linkedin")}
            />
            {errors.linkedin ? (
              <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
                {errors.linkedin.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="github" className="label">
              GitHub Profile
            </label>
            <input
              id="github"
              type="url"
              autoComplete="off"
              className="input"
              placeholder="https://github.com/…"
              {...register("github")}
            />
            {errors.github ? (
              <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
                {errors.github.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="portfolioUrl" className="label">
              Portfolio URL
            </label>
            <input
              id="portfolioUrl"
              type="url"
              autoComplete="off"
              className="input"
              placeholder="https://…"
              {...register("portfolioUrl")}
            />
            {errors.portfolioUrl ? (
              <p className="mt-1 text-xs font-semibold text-red-600" role="alert">
                {errors.portfolioUrl.message}
              </p>
            ) : null}
          </div>
        </div>
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