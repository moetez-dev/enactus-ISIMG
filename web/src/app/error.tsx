"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-black px-6 text-white">
      <div className="max-w-md text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-yellow text-brand-black">
          <TriangleAlert className="h-8 w-8" aria-hidden />
        </span>
        <h1 className="mt-6 font-heading text-3xl font-black uppercase tracking-tighter">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm font-medium text-gray-400">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset} className="mt-8">
          Try again
        </Button>
      </div>
    </main>
  );
}