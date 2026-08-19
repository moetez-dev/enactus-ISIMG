import { PublicShell } from "@/components/site/PublicShell";
import { PageHero, PageSection } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/ui";
import { ProjectCard } from "@/components/site/cards";
import { getProjects } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <PublicShell>
      <PageHero
        label="Our work"
        title="Projects"
        description="Real problems, real solutions, real impact — built by our enactors."
      />

      <PageSection>
        {projects.length === 0 ? (
          <SectionHeading
            align="center"
            label="Coming soon"
            title="Projects are being built"
            description="Check back soon to see what our teams are creating."
          />
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                description={project.tag}
              />
            ))}
          </div>
        )}
      </PageSection>
    </PublicShell>
  );
}