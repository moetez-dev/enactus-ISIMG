import type { ReactNode } from "react";

export function PageHero({
  label,
  title,
  description,
}: {
  label?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="bg-brand-black pb-16 pt-20 text-white md:pb-24 md:pt-28">
      <div className="mx-auto w-full max-w-7xl px-6">
        <span className="section-label block text-brand-yellow">
          {label ?? "Enactus ISIMG"}
        </span>
        <h1 className="mt-4 font-heading text-5xl font-black uppercase leading-[0.95] tracking-tighter md:text-7xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 max-w-xl text-lg font-medium text-gray-400">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function PageSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`py-20 md:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-7xl px-6">{children}</div>
    </section>
  );
}