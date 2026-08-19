"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/departments", label: "Departments" },
  { href: "/projects", label: "Projects" },
  { href: "/team", label: "Team" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header>
      <nav
        aria-label="Main navigation"
        className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md transition-shadow ${
          scrolled ? "shadow-[0_1px_0_rgba(0,0,0,0.06)]" : ""
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            aria-label="Enactus ISIMG home"
          >
            <span className="h-10 w-10 overflow-hidden rounded-xl ring-2 ring-brand-yellow/30 transition group-hover:ring-brand-yellow">
              <Image
                src="/images/logo.jpg"
                alt="Enactus ISIMG logo"
                width={40}
                height={40}
                className="h-full w-full object-cover"
                priority
              />
            </span>
            <span className="font-heading text-xl font-extrabold tracking-tight">
              ENACTUS <span className="text-brand-yellow">ISIMG</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 text-sm font-semibold uppercase tracking-widest md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-brand-yellow"
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-3 flex items-center gap-3">
              <Link
                href="/login"
                className="btn-dark px-5 py-2 text-xs"
              >
                Log in
              </Link>
              <Link href="/register" className="btn-yellow px-5 py-2 text-xs">
                Join Us
              </Link>
            </div>
          </div>

          <button type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 transition-colors hover:border-brand-yellow md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle navigation menu"
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>

        {open ? (
          <div id="mobile-nav" className="border-t border-gray-100 bg-white px-6 pb-6 pt-2 md:hidden">
            <div className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-50"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="btn-dark w-full py-3 text-xs"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="btn-yellow w-full py-3 text-xs"
                >
                  Join Us
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}