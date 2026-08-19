import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Mail, MapPin } from "lucide-react";
import { CONTACT_EMAIL, SOCIALS } from "@/lib/constants";

const QUICK_LINKS = [
  { href: "/about", label: "About" },
  { href: "/departments", label: "Departments" },
  { href: "/projects", label: "Projects" },
  { href: "/team", label: "Team" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Join Us" },
  { href: "/login", label: "Member Portal" },
];

const SOCIAL_LINKS = [
  { href: SOCIALS.facebook, label: "Facebook", Icon: Facebook },
  { href: SOCIALS.instagram, label: "Instagram", Icon: Instagram },
  { href: SOCIALS.linkedin, label: "LinkedIn", Icon: Linkedin },
];

export function Footer() {
  return (
    <footer className="bg-brand-black py-20 text-white">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="grid gap-12 border-b border-white/10 pb-16 md:grid-cols-3">
          <div>
            <div className="mb-5 flex items-center gap-2.5">
              <span className="h-9 w-9 overflow-hidden rounded-xl ring-2 ring-brand-yellow/30">
                <Image
                  src="/images/logo.jpg"
                  alt="Enactus ISIMG"
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="font-heading text-base font-extrabold">
                ENACTUS <span className="text-brand-yellow">ISIMG</span>
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-gray-500">
              A student-powered entrepreneurship organisation driving
              innovation and social impact in Gabès, Tunisia.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="mb-6 text-[9px] font-black uppercase tracking-[0.4em] text-gray-600">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-gray-400 transition-colors hover:text-brand-yellow"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-6 text-[9px] font-black uppercase tracking-[0.4em] text-gray-600">
              Connect
            </h3>
            <div className="mb-6 space-y-3">
              <p className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 flex-shrink-0 text-brand-yellow" aria-hidden />
                ISIMG, Gabès, Tunisia
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4 flex-shrink-0 text-brand-yellow" aria-hidden />
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="transition-colors hover:text-brand-yellow"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 transition-all hover:bg-brand-yellow hover:text-brand-black"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-[10px] font-black uppercase tracking-widest text-gray-600 md:flex-row">
          <p>
            © {new Date().getFullYear()} Enactus ISIMG. All Rights Reserved.
          </p>
          <p>
            Made with <span className="text-brand-yellow">♥</span> in Gabès,
            Tunisia
          </p>
        </div>
      </div>
    </footer>
  );
}