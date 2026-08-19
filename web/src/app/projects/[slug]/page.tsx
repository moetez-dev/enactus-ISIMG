import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { PublicShell } from "@/components/site/PublicShell";
import { PageSection } from "@/components/site/PageHero";
import { Button } from "@/components/ui";
import { getProjectBySlug, getProjects } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const project = await getProjectBySlug(params.slug);
  return {
    title: project?.name ?? "Project",
    description:
      project?.problem?.slice(0, 155) ??
      "A project by Enactus ISIMG in Gabès, Tunisia.",
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  const others = (await getProjects())
    .filter((p) => p.slug !== project.slug)
    .slice(0, 2);

  const sections = [
    { label: "The problem", body: project.problem },
    { label: "Our solution", body: project.solution },
    { label: "Impact", body: project.impact },
  ];

  return (
    <PublicShell>
      <section className="bg-brand-black pb-16 pt-20 text-white md:pt-28">
        <div className="mx-auto w-full max-w-7xl px-6">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-brand-yellow"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All projects
          </Link>
          <span className="mt-8 inline-block rounded-full bg-brand-yellow px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-brand-black">
            {project.tag}
          </span>
          <h1 className="mt-5 max-w-3xl font-heading text-5xl font-black uppercase leading-none tracking-tighter md:text-7xl">
            {project.name}
          </h1>
        </div>
      </section>

      <PageSection>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[3rem] shadow-lift">
          <Image
            src={project.image || "/images/logo.jpg"}
            alt={project.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-[1fr_1fr]">
          {sections.map((section) => (
            <div key={section.label} className="rounded-[2rem] bg-gray-50 p-10">
              <h2 className="font-heading text-2xl font-black uppercase text-brand-black">
                {section.label}
              </h2>
              <p className="mt-4 text-sm font-medium leading-relaxed text-gray-600">
                {section.body}
              </p>
            </div>
          ))}

          <div className="rounded-[2rem] bg-brand-black p-10 text-white">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-2xl font-black uppercase">
                Progress
              </h2>
              <span className="font-heading text-4xl font-black text-brand-yellow">
                {project.progress}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-brand-yellow transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm font-bold text-brand-yellow">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              {project.progress >= 100
                ? "Fully delivered"
                : "Actively being built"}
            </div>
          </div>
        </div>

        {others.length > 0 ? (
          <div className="mt-20">
            <h2 className="font-heading text-3xl font-black uppercase text-brand-black">
              More projects
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              {others.map((other) => (
                <Link
                  key={other.id}
                  href={`/projects/${other.slug}`}
                  className="group relative flex h-64 items-end overflow-hidden rounded-[2rem] bg-gray-100 p-8"
                >
                  <Image
                    src={other.image || "/images/logo.jpg"}
                    alt={other.name}
                    fill
                    sizes="50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="relative">
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-yellow">
                      {other.tag}
                    </span>
                    <h3 className="mt-1 font-heading text-2xl font-black uppercase text-white">
                      {other.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-20 flex flex-wrap items-center justify-between gap-6 rounded-[2.5rem] bg-brand-yellow p-10">
          <div>
            <h2 className="font-heading text-3xl font-black uppercase text-brand-black">
              Want to build the next one?
            </h2>
            <p className="mt-2 text-sm font-bold text-brand-black/70">
              Join us and bring your ideas to life.
            </p>
          </div>
          <Button href="/register" variant="dark" size="lg">
            Apply to Join <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </PageSection>
    </PublicShell>
  );
}