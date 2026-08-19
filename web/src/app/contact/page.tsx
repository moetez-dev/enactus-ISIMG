import Link from "next/link";
import { Mail, MapPin, Phone, Facebook, Instagram, Linkedin } from "lucide-react";
import { PublicShell } from "@/components/site/PublicShell";
import { PageHero, PageSection } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/ui";
import { ContactForm } from "@/components/site/ContactForm";
import { CONTACT_EMAIL, SOCIALS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const CHANNELS = [
  {
    label: "Email us",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    Icon: Mail,
  },
  {
    label: "Find us",
    value: "ISIMG, Gabès, Tunisia",
    href: undefined,
    Icon: MapPin,
  },
  {
    label: "Call us",
    value: "+216 00 000 000",
    href: "tel:+21600000000",
    Icon: Phone,
  },
];

const SOCIALS_LIST = [
  { href: SOCIALS.facebook, label: "Facebook", Icon: Facebook },
  { href: SOCIALS.instagram, label: "Instagram", Icon: Instagram },
  { href: SOCIALS.linkedin, label: "LinkedIn", Icon: Linkedin },
];

export default function ContactPage() {
  return (
    <PublicShell>
      <PageHero
        label="Get in touch"
        title="Contact us"
        description="Questions, partnerships, or just want to say hi? We'd love to hear from you."
      />

      <PageSection>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading
              label="Contact details"
              title="Reach out"
              description="We usually reply within 48 hours."
            />
            <div className="space-y-4">
              {CHANNELS.map(({ label, value, href, Icon }) => {
                const inner = (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-yellow text-brand-black">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {label}
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-brand-black">
                        {value}
                      </p>
                    </div>
                  </>
                );
                const classes =
                  "flex items-center gap-4 rounded-3xl border-2 border-gray-100 p-5 transition-all hover:border-brand-yellow hover:shadow-md";
                return href ? (
                  <a
                    key={label}
                    href={href}
                    className={classes}
                    aria-label={`${label}: ${value}`}
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={label} className={classes}>
                    {inner}
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Follow us
              </p>
              <div className="flex gap-3">
                {SOCIALS_LIST.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-brand-yellow hover:text-brand-black"
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-brand-black p-8 text-white">
              <h3 className="font-heading text-lg font-black uppercase">
                Prefer to apply?
              </h3>
              <p className="mt-2 text-sm font-medium text-gray-400">
                If you want to join Enactus ISIMG, skip the form and apply
                directly.
              </p>
              <Link
                href="/register"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-yellow px-6 py-3 text-[10px] font-black uppercase tracking-widest text-brand-black transition-colors hover:bg-white"
              >
                Apply to Join
              </Link>
            </div>
          </div>

          <div className="rounded-[2.5rem] border-2 border-gray-100 p-8 md:p-12">
            <h2 className="font-heading text-2xl font-black uppercase text-brand-black">
              Send us a message
            </h2>
            <p className="mb-8 mt-2 text-sm font-medium text-gray-500">
              Fields marked with * are required.
            </p>
            <ContactForm />
          </div>
        </div>
      </PageSection>
    </PublicShell>
  );
}