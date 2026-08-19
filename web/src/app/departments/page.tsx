
import { PublicShell } from "@/components/site/PublicShell";
import { PageHero, PageSection } from "@/components/site/PageHero";
import { SectionHeading, Button } from "@/components/ui";
import { getDepartments, getProjects } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const [departments, projects] = await Promise.all([getDepartments(), getProjects()]);

  return (
    <PublicShell>
      <PageHero
        label="Structure"
        title="Departments"
        description="Four specialised teams keep Enactus ISIMG running and growing."
      />

      <PageSection>
        <div className="grid gap-6 md:grid-cols-2">
          {departments.map((dept) => {
            const count = projects.filter(
              (p) => p.department?.id === dept.id,
            ).length;
            return (
              <div
                key={dept.id}
                className="rounded-[2.5rem] border-2 border-gray-100 p-10 transition-all hover:border-brand-yellow hover:shadow-lg"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-yellow font-heading text-xl font-black text-brand-black">
                    {dept.icon ?? dept.name[0]}
                  </div>
                  <span className="rounded-full bg-gray-100 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                    {count} project{count === 1 ? "" : "s"}
                  </span>
                </div>
                <h2 className="font-heading text-2xl font-black uppercase text-brand-black">
                  {dept.name}
                </h2>
                {dept.description ? (
                  <p className="mt-3 text-sm font-medium leading-relaxed text-gray-500">
                    {dept.description}
                  </p>
                ) : null}
                <div className="mt-6">
                  <Button href="/projects" variant="ghost">
                    View projects
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </PageSection>

      <PageSection className="bg-brand-black text-white">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            dark
            label="Not sure where you fit?"
            title="Start somewhere, grow everywhere"
            description="Most enactors move between departments as they grow. Pick what excites you today."
          />
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/register">Apply to Join</Button>
            <Button href="/contact" variant="outline-white">
              Talk to us
            </Button>
          </div>
        </div>
      </PageSection>
    </PublicShell>
  );
}