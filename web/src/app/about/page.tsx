import Image from "next/image";
import { PublicShell } from "@/components/site/PublicShell";
import { PageHero, PageSection } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/ui";
import { STATS } from "@/lib/constants";
import { getLeadershipTeam, getEnactors, getDepartments } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [leadership, enactors, departments] = await Promise.all([
    getLeadershipTeam(),
    getEnactors(),
    getDepartments(),
  ]);

  return (
    <PublicShell>
      <PageHero
        label="About us"
        title="Our story"
        description="Who we are, what drives us, and the impact we are building together in Gabès, Tunisia."
      />

      {/* Mission */}
      <PageSection>
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <SectionHeading
              label="Our mission"
              title={
                <>
                  Entrepreneurial <span className="text-brand-yellow">action</span>
                  , real impact
                </>
              }
            />
            <div className="space-y-5 text-base font-medium leading-relaxed text-gray-500">
              <p>
                Enactus ISIMG is the student chapter of the international Enactus
                network at the Higher Institute of Computer Science & Multimedia
                of Gabès. We believe students have the power to change the world.
              </p>
              <p>
                Our teams design and run projects that address real needs in our
                community — from entrepreneurship and technology to education and
                the environment — applying business principles to create social
                progress.
              </p>
              <p>
                Every member is an &quot;enactor&quot;: someone who acts, builds,
                and delivers measurable outcomes for the people around them.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] shadow-lift">
            <Image
              src="/images/hero/hero-team.jpg"
              alt="Enactus ISIMG members"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </PageSection>

      {/* Stats */}
      <PageSection className="bg-brand-black text-white">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {[
            { value: STATS.projects, label: "Projects launched" },
            { value: STATS.enactors, label: "Active enactors" },
            { value: STATS.livesImpacted, label: "Lives impacted" },
            { value: "4", label: "Departments" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-heading text-5xl font-black text-brand-yellow">
                {stat.value}
              </p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </PageSection>

      {/* Values */}
      <PageSection>
        <SectionHeading
          label="What we value"
          title="Our core values"
          align="center"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Passion",
              text: "We bring energy and commitment to everything we build. Passion is what turns an idea into a movement.",
            },
            {
              title: "Collaboration",
              text: "No project is built alone. We combine the talents of designers, engineers, marketers and dreamers.",
            },
            {
              title: "Impact",
              text: "Success is measured by the difference we make in people's lives — not just by what we create.",
            },
          ].map((value) => (
            <div
              key={value.title}
              className="rounded-[2rem] border-2 border-gray-100 p-10 transition-all hover:border-brand-yellow hover:shadow-lg"
            >
              <h3 className="font-heading text-2xl font-black uppercase text-brand-black">
                {value.title}
              </h3>
              <p className="mt-4 text-sm font-medium leading-relaxed text-gray-500">
                {value.text}
              </p>
            </div>
          ))}
        </div>
      </PageSection>

      {/* Departments */}
      <PageSection className="bg-gray-50">
        <SectionHeading
          label="Structure"
          title="Meet the departments"
          description="Four teams, one mission."
        />
        <div className="grid gap-5 md:grid-cols-2">
          {departments.map((dept, i) => (
            <div
              key={dept.id}
              className="rounded-[2rem] bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-yellow font-heading text-lg font-black text-brand-black">
                {dept.icon ?? String(i + 1)}
              </div>
              <h3 className="font-heading text-xl font-extrabold uppercase">
                {dept.name}
              </h3>
              {dept.description ? (
                <p className="mt-3 text-sm font-medium leading-relaxed text-gray-500">
                  {dept.description}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </PageSection>

      {/* Team counts */}
      <PageSection>
        <div className="rounded-[3rem] bg-brand-yellow p-10 text-center md:p-16">
          <SectionHeading
            align="center"
            title="Our people"
            description="From our leadership board to every enactor, we are one team."
          />
          <div className="grid gap-4 text-brand-black md:grid-cols-2">
            <div className="rounded-3xl bg-black/5 p-8">
              <p className="font-heading text-5xl font-black">{leadership.length}</p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest">
                Leadership board
              </p>
            </div>
            <div className="rounded-3xl bg-black/5 p-8">
              <p className="font-heading text-5xl font-black">{enactors.length}</p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-widest">
                Enactors
              </p>
            </div>
          </div>
        </div>
      </PageSection>
    </PublicShell>
  );
}