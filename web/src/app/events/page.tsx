import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/site/PublicShell";
import { PageHero, PageSection } from "@/components/site/PageHero";
import { SectionHeading, Button, EmptyState } from "@/components/ui";
import { getEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <PublicShell>
      <PageHero
        label="Calendar"
        title="Events"
        description="Workshops, competitions, recruitment days and community actions."
      />

      <PageSection>
        {events.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-10 w-10 text-gray-300" aria-hidden />}
            message="No upcoming events. Check back soon!"
          />
        ) : (
          <div className="mx-auto max-w-4xl space-y-5">
            {events.map((event) => (
              <article
                key={event.id}
                className="flex flex-col gap-6 rounded-[2rem] border-2 border-gray-100 p-8 transition-all hover:border-brand-yellow hover:shadow-lg md:flex-row md:items-center"
              >
                <div className="flex h-24 w-24 flex-shrink-0 flex-col items-center justify-center rounded-3xl bg-brand-yellow">
                  <span className="font-heading text-4xl font-black leading-none text-brand-black">
                    {new Intl.DateTimeFormat("en-GB", { day: "numeric" }).format(
                      event.date,
                    )}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-black/70">
                    {new Intl.DateTimeFormat("en-GB", { month: "short" }).format(
                      event.date,
                    )}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="font-heading text-2xl font-black uppercase text-brand-black">
                    {event.title}
                  </h2>
                  {event.description ? (
                    <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
                      {event.description.length > 240
                        ? `${event.description.slice(0, 240)}…`
                        : event.description}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-brand-yellow" aria-hidden />
                      {new Intl.DateTimeFormat("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(event.date)}
                    </span>
                    {event.location ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-brand-yellow" aria-hidden />
                        {event.location}
                      </span>
                    ) : null}
                  </div>
                </div>
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
            label="Missed something?"
            title="Join the team"
            description="Enactors get first access to every workshop, event and opportunity."
          />
          <Button href="/register" className="mt-8">
            Apply to Join <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </PageSection>
    </PublicShell>
  );
}