import { PublicShell } from "@/components/site/PublicShell";
import { PageHero, PageSection } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/ui";
import { getLeadershipTeam, getEnactors } from "@/lib/queries";
import { TeamCard } from "@/components/site/TeamCard";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const [leadership, enactors] = await Promise.all([
    getLeadershipTeam(),
    getEnactors(),
  ]);

  return (
    <PublicShell>
      <PageHero
        label="Our people"
        title="The team"
        description="The leaders and enactors who make Enactus ISIMG what it is."
      />

      {leadership.length > 0 ? (
        <PageSection className="pb-0">
          <SectionHeading
            label="Leadership"
            title="The board"
            description="Guiding our vision, culture and growth."
          />
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            {leadership.map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        </PageSection>
      ) : null}

      <PageSection>
        <SectionHeading
          label="Enactors"
          title="The team in action"
          description="The passionate students behind every project."
        />
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {enactors.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>
      </PageSection>
    </PublicShell>
  );
}