import { Newspaper, ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/site/PublicShell";
import { PageHero, PageSection } from "@/components/site/PageHero";
import { SectionHeading, Button, EmptyState } from "@/components/ui";
import { getNews } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await getNews();

  return (
    <PublicShell>
      <PageHero
        label="Updates"
        title="News"
        description="Announcements, milestones and stories from the Enactus ISIMG community."
      />

      <PageSection>
        {news.length === 0 ? (
          <EmptyState
            icon={<Newspaper className="h-10 w-10 text-gray-300" aria-hidden />}
            message="No news yet. Check back soon!"
          />
        ) : (
          <div className="mx-auto max-w-4xl space-y-5">
            {news.map((item) => (
              <article
                key={item.id}
                className="rounded-[2rem] border-2 border-gray-100 p-8 transition-all hover:border-brand-yellow hover:shadow-lg"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {new Intl.DateTimeFormat("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(item.createdAt)}
                </p>
                <h2 className="mt-2 font-heading text-2xl font-black uppercase text-brand-black">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm font-medium leading-relaxed text-gray-500">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        )}
      </PageSection>

      <PageSection className="bg-brand-black text-white">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            dark
            label="Get involved"
            title="Be part of the story"
            description="Join Enactus ISIMG and help write the next chapter."
          />
          <Button href="/register" className="mt-8">
            Apply to Join <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </PageSection>
    </PublicShell>
  );
}