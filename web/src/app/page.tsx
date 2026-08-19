import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/site/PublicShell";
import { PageSection } from "@/components/site/PageHero";
import { Button } from "@/components/ui";
import { SectionHeading } from "@/components/ui";
import { ProjectCard } from "@/components/site/cards";
import { STATS } from "@/lib/constants";
import {
  getProjects,
  getEvents,
  getDepartments,
  getLeadershipTeam,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [projects, events, departments, leadership] = await Promise.all([
    getProjects(),
    getEvents(),
    getDepartments(),
    getLeadershipTeam(),
  ]);

  const featured = projects.slice(0, 3);
  const nextEvent = events[0];

  return (
    <PublicShell>
      {/* Hero */}
      <section className="bg-brand-black text-white">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pb-24 pt-16 md:grid-cols-2 md:pb-32 md:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-yellow">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Entrepreneurial Action
            </span>
            <h1 className="mt-8 font-heading text-5xl font-black uppercase leading-[0.92] tracking-tighter md:text-7xl">
              We turn ideas into{" "}
              <span className="text-brand-yellow">impact</span>
            </h1>
            <p className="mt-6 max-w-md text-lg font-medium leading-relaxed text-gray-400">
              Enactus ISIMG is a student team at the Higher Institute of
              Computer Science & Multimedia of Gabès, building projects that
              change lives.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button href="/register" size="lg">
                Join Our Team <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button href="/projects" variant="outline-white" size="lg">
                Explore Projects
              </Button>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] shadow-lift">
            <Image
              src="/images/hero/hero-team.jpg"
              alt="Enactus ISIMG team in action"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
                <p className="font-heading text-lg font-extrabold uppercase">
                  Impact through action
                </p>
                <p className="mt-1 text-sm font-medium text-gray-300">
                  Gabès, Tunisia
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-b border-gray-100 bg-white py-14">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-10 px-6 md:grid-cols-4">
          {[
            { value: STATS.projects, label: "Projects launched" },
            { value: STATS.enactors, label: "Active enactors" },
            { value: STATS.livesImpacted, label: "Lives impacted" },
            { value: STATS.activeEnactors, label: "Active enactors" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-heading text-5xl font-black text-brand-black">
                {stat.value}
              </p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured projects */}
      <PageSection>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            label="What we do"
            title={
              <>
                Projects that <span className="text-brand-yellow">matter</span>
              </>
            }
            description="Every project starts with a real problem in our community."
          />
          <Button href="/projects" variant="ghost" className="mb-16 shrink-0">
            All Projects <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </PageSection>

      {/* About preview */}
      <PageSection className="bg-gray-50">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-square overflow-hidden rounded-[2rem]">
                  <Image
                    src="/images/hero/hero-team.jpg"
                    alt="Team workshop"
                    width={400}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-[2rem] bg-brand-yellow" />
              </div>
              <div className="mt-12 space-y-4">
                <div className="aspect-square overflow-hidden rounded-[2rem] bg-brand-black" />
                <div className="aspect-square overflow-hidden rounded-[2rem]">
                  <Image
                    src="/images/hero/hero-team.jpg"
                    alt="Community impact"
                    width={400}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <SectionHeading
              label="About us"
              title={
                <>
                  Students. Builders.{" "}
                  <span className="text-brand-yellow">Changemakers.</span>
                </>
              }
            />
            <p className="max-w-lg text-base font-medium leading-relaxed text-gray-500">
              We are a passionate team of students from the Higher Institute of
              Computer Science & Multimedia of Gabès (ISIMG). Guided by the
              Enactus philosophy, we design and run social enterprises that
              create sustainable impact for communities across our region.
            </p>
            <Button href="/about" className="mt-8">
              Our Story <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      </PageSection>

      {/* Departments */}
      <PageSection>
        <SectionHeading
          label="Our structure"
          title="How we organise"
          description="Four departments, one mission: build projects that empower."
        />
        <div className="grid gap-5 md:grid-cols-4">
          {departments.map((dept) => (
            <Link
              key={dept.id}
              href="/departments"
              className="group rounded-[2rem] border-2 border-gray-100 p-8 transition-all hover:border-brand-yellow hover:shadow-lg"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-yellow font-heading text-lg font-black text-brand-black">
                {dept.icon ?? dept.name[0]}
              </div>
              <h3 className="font-heading text-xl font-extrabold uppercase">
                {dept.name}
              </h3>
              {dept.description ? (
                <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
                  {dept.description.length > 90
                    ? `${dept.description.slice(0, 90)}…`
                    : dept.description}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      </PageSection>

      {/* Next event */}
      {nextEvent ? (
        <PageSection className="bg-brand-black text-white">
          <div className="grid items-center gap-10 md:grid-cols-[1.5fr_1fr]">
            <div>
              <span className="section-label block text-brand-yellow">
                Next event
              </span>
              <h2 className="mt-4 font-heading text-4xl font-black uppercase leading-none tracking-tighter md:text-6xl">
                {nextEvent.title}
              </h2>
              {nextEvent.description ? (
                <p className="mt-6 max-w-xl text-base font-medium text-gray-400">
                  {nextEvent.description.length > 200
                    ? `${nextEvent.description.slice(0, 200)}…`
                    : nextEvent.description}
                </p>
              ) : null}
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-yellow text-brand-black">
                <CalendarDays className="h-6 w-6" aria-hidden />
              </div>
              <p className="font-heading text-3xl font-black uppercase">
                {new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "long",
                }).format(nextEvent.date)}
              </p>
              {nextEvent.location ? (
                <p className="mt-1 text-sm font-semibold text-gray-400">
                  {nextEvent.location}
                </p>
              ) : null}
              <Button href="/events" variant="outline-white" className="mt-6 w-full">
                See All Events
              </Button>
            </div>
          </div>
        </PageSection>
      ) : null}

      {/* Leadership */}
      {leadership.length > 0 ? (
        <PageSection>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              label="Leadership"
              title="Meet the board"
              description="The team behind the team."
            />
            <Button href="/team" variant="ghost" className="mb-16 shrink-0">
              Full Team <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {leadership.slice(0, 4).map((member) => (
              <div key={member.id} className="text-center">
                <div className="mb-3 aspect-square overflow-hidden rounded-[2rem]">
                  <Image
                    src={
                      member.image?.startsWith("http")
                        ? member.image
                        : member.image || "/images/logo.jpg"
                    }
                    alt={member.name}
                    width={240}
                    height={240}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="font-heading text-sm font-black uppercase tracking-wide">
                  {member.name}
                </p>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </PageSection>
      ) : null}

      {/* CTA */}
      <section className="bg-brand-yellow py-20 text-center md:py-28">
        <div className="mx-auto w-full max-w-3xl px-6">
          <h2 className="font-heading text-4xl font-black uppercase leading-none tracking-tighter text-brand-black md:text-6xl">
            Ready to make a difference?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base font-bold text-brand-black/70">
            Apply to join Enactus ISIMG and become part of a team that turns
            bold ideas into real impact.
          </p>
          <Button href="/register" variant="dark" size="lg" className="mt-10">
            Apply to Join <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </section>
    </PublicShell>
  );
}