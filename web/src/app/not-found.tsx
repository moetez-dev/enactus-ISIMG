import { ArrowRight, Compass } from "lucide-react";
import { PublicShell } from "@/components/site/PublicShell";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <PublicShell>
      <section className="bg-brand-black text-white">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-28 text-center md:py-40">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-yellow">
            <Compass className="h-3.5 w-3.5" aria-hidden />
            Page not found
          </span>
          <p className="mt-8 font-heading text-8xl font-black uppercase leading-none tracking-tighter text-brand-yellow md:text-9xl">
            404
          </p>
          <h1 className="mt-6 font-heading text-3xl font-black uppercase tracking-tighter md:text-5xl">
            This page lost its way
          </h1>
          <p className="mt-4 max-w-md text-base font-medium text-gray-400">
            The page you are looking for does not exist or has been moved.
          </p>
          <Button href="/" size="lg" className="mt-10">
            Back to home <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}