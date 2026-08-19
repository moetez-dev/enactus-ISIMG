import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

export function AuthShell({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-black px-6 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-[2.5rem] bg-white p-8 shadow-2xl md:p-10">
          <Link
            href="/"
            className="mb-8 flex items-center gap-2.5"
            aria-label="Enactus ISIMG home"
          >
            <span className="h-10 w-10 overflow-hidden rounded-xl ring-2 ring-brand-yellow/40">
              <Image
                src="/images/logo.jpg"
                alt="Enactus ISIMG logo"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="font-heading text-xl font-extrabold tracking-tight">
              ENACTUS <span className="text-brand-yellow-dark">ISIMG</span>
            </span>
          </Link>
          {children}
        </div>
        {footer ? (
          <p className="mt-6 text-center text-sm font-semibold text-gray-400">
            {footer}
          </p>
        ) : null}
      </div>
    </main>
  );
}