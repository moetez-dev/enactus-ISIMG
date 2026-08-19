import Link from "next/link";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "yellow" | "dark" | "ghost" | "danger" | "outline-white";

const variantClasses: Record<ButtonVariant, string> = {
  yellow: "btn-yellow",
  dark: "btn-dark",
  ghost: "btn-ghost",
  danger:
    "btn bg-red-500/10 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white",
  "outline-white":
    "btn border-2 border-white text-white hover:bg-white hover:text-brand-black",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  href?: string;
}

export function Button({
  variant = "yellow",
  size = "md",
  loading = false,
  href,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const classes = [
    variantClasses[variant],
    size === "sm" ? "px-4 py-2 text-[11px]" : size === "lg" ? "px-8 py-4 text-sm" : "px-5 py-2.5 text-xs",
    className,
  ].join(" ");

  const content = loading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      <span>{children}</span>
    </>
  ) : (
    children
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <Loader2
      className={`h-5 w-5 animate-spin text-brand-yellow ${className}`}
      aria-label="Loading"
    />
  );
}

export function EmptyState({
  icon,
  message,
}: {
  icon?: ReactNode;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-gray-200 px-6 py-16 text-center">
      {icon}
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
        {message}
      </p>
    </div>
  );
}

export function SectionHeading({
  label,
  title,
  description,
  align = "left",
  dark = false,
}: {
  label?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  dark?: boolean;
}) {
  return (
    <div
      className={`mb-16 space-y-4 ${
        align === "center" ? "text-center" : ""
      }`}
    >
      {label ? (
        <span className="section-label block">{label}</span>
      ) : null}
      <h2
        className={`font-heading text-4xl font-black uppercase leading-none tracking-tighter md:text-5xl ${
          dark ? "text-white" : "text-brand-black"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`max-w-md text-lg font-medium ${
            align === "center" ? "mx-auto" : ""
          } ${dark ? "text-gray-400" : "text-gray-500"}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}