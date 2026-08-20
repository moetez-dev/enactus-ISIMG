import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Linkedin,
  Github,
  Globe,
  BadgeCheck,
  Trophy,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { PublicShell } from "@/components/site/PublicShell";
import { Button } from "@/components/ui";
import { isValidMemberId } from "@/lib/membership";
import { getLevelInfo } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { memberId: string };
}) {
  const member = await findMember(params.memberId);
  return {
    title: member ? `${member.fullName} – Enactus ISIMG Member` : "Member",
    description: member
      ? `Official Enactus ISIMG member profile: ${member.fullName}, ${member.department?.name ?? "Enactus ISIMG"}.`
      : "Enactus ISIMG member profile.",
  };
}

async function findMember(memberId: string) {
  if (!isValidMemberId(memberId)) return null;
  const member = await prisma.user.findUnique({
    where: { memberId },
    include: { department: true },
  });
  if (!member) return null;
  if (member.status !== "APPROVED" || !member.publicProfile) {
    return null;
  }
  return member;
}

export default async function PublicMemberPage({
  params,
}: {
  params: { memberId: string };
}) {
  const member = await findMember(params.memberId);
  if (!member) notFound();

  const [badges, certificates, hours] = await Promise.all([
    prisma.userAchievement.count({ where: { userId: member.id } }),
    prisma.certificate.count({
      where: { userId: member.id, status: "ACTIVE" },
    }),
    prisma.eventRegistration.aggregate({
      where: { userId: member.id, status: "ATTENDED" },
      _sum: { hours: true },
    }),
  ]);

  const joined = new Date(member.createdAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const level = getLevelInfo(member.points);
  const links = [
    { href: member.linkedin, label: "LinkedIn", Icon: Linkedin },
    { href: member.github, label: "GitHub", Icon: Github },
    { href: member.portfolioUrl, label: "Portfolio", Icon: Globe },
  ].filter((l) => l.href) as { href: string; label: string; Icon: typeof Linkedin }[];

  return (
    <PublicShell>
      <section className="bg-brand-black pb-16 pt-20 text-white md:pt-28">
        <div className="mx-auto w-full max-w-7xl px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-brand-yellow"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Home
          </Link>
          <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-6">
              <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[2rem] bg-brand-yellow font-heading text-4xl font-black text-brand-black ring-4 ring-brand-yellow/20">
                {member.profilePic ? (
                  <Image
                    src={member.profilePic}
                    alt={member.fullName}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  member.fullName[0]?.toUpperCase() ?? "?"
                )}
              </span>
              <div>
                <span className="inline-block rounded-full bg-brand-yellow px-4 py-1.5 font-mono text-[10px] font-bold tracking-widest text-brand-black">
                  {member.memberId}
                </span>
                <h1 className="mt-4 font-heading text-4xl font-black uppercase leading-none tracking-tighter md:text-6xl">
                  {member.fullName}
                </h1>
                <p className="mt-2 text-sm font-bold text-gray-400">
                  {member.department?.name ?? "Enactus ISIMG"}
                  {member.fieldOfStudy ? ` · ${member.fieldOfStudy}` : ""}
                  {member.studyLevel ? ` · ${member.studyLevel}` : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-2xl bg-white/10 px-5 py-3 text-center">
                <span className="block font-heading text-2xl font-black text-brand-yellow">
                  {member.points}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  XP · {level.name}
                </span>
              </span>
              <span className="rounded-2xl bg-white/10 px-5 py-3 text-center">
                <span className="block font-heading text-2xl font-black text-brand-yellow">
                  {badges}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Badges
                </span>
              </span>
              <span className="rounded-2xl bg-white/10 px-5 py-3 text-center">
                <span className="block font-heading text-2xl font-black text-brand-yellow">
                  {hours._sum.hours ?? 0}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Hours
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-[2rem] bg-gray-50 p-10">
                <h2 className="font-heading text-2xl font-black uppercase text-brand-black">
                  About
                </h2>
                <p className="mt-4 text-sm font-medium leading-relaxed text-gray-600">
                  {member.bio ||
                    `${member.fullName} is an active member of the Enactus ISIMG team, committed to driving positive social impact through entrepreneurship.`}
                </p>
                <p className="mt-4 text-xs font-bold text-gray-400">
                  Member since {joined}
                </p>
              </div>

              {member.skills.length > 0 ? (
                <div className="rounded-[2rem] bg-gray-50 p-10">
                  <h2 className="font-heading text-2xl font-black uppercase text-brand-black">
                    Skills
                  </h2>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-brand-yellow px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-brand-black"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {member.interests.length > 0 ? (
                <div className="rounded-[2rem] bg-gray-50 p-10">
                  <h2 className="font-heading text-2xl font-black uppercase text-brand-black">
                    Interests
                  </h2>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {member.interests.map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full border-2 border-brand-black/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-600"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] bg-brand-black p-10 text-white">
                <h2 className="font-heading text-xl font-black uppercase">
                  Details
                </h2>
                <dl className="mt-6 space-y-4 text-sm">
                  {member.institution ? (
                    <div>
                      <dt className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Institution
                      </dt>
                      <dd className="mt-1 font-bold">{member.institution}</dd>
                    </div>
                  ) : null}
                  {member.fieldOfStudy ? (
                    <div>
                      <dt className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Field of study
                      </dt>
                      <dd className="mt-1 font-bold">{member.fieldOfStudy}</dd>
                    </div>
                  ) : null}
                  {member.studyLevel ? (
                    <div>
                      <dt className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Study level
                      </dt>
                      <dd className="mt-1 font-bold">{member.studyLevel}</dd>
                    </div>
                  ) : null}
                  {member.department ? (
                    <div>
                      <dt className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Department
                      </dt>
                      <dd className="mt-1 font-bold">{member.department.name}</dd>
                    </div>
                  ) : null}
                  {member.availability ? (
                    <div>
                      <dt className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Availability
                      </dt>
                      <dd className="mt-1 font-bold">{member.availability}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              <div className="rounded-[2rem] bg-gray-50 p-10">
                <h2 className="font-heading text-xl font-black uppercase text-brand-black">
                  Recognition
                </h2>
                <ul className="mt-5 space-y-3">
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    <BadgeCheck className="h-5 w-5 text-brand-black" aria-hidden />
                    {certificates} active certificate
                    {certificates === 1 ? "" : "s"}
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    <Trophy className="h-5 w-5 text-brand-black" aria-hidden />
                    {badges} badge{badges === 1 ? "" : "s"} earned
                  </li>
                  <li className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    <Clock className="h-5 w-5 text-brand-black" aria-hidden />
                    {hours._sum.hours ?? 0} volunteer hour
                    {(hours._sum.hours ?? 0) === 1 ? "" : "s"} logged
                  </li>
                </ul>
              </div>

              {links.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {links.map(({ href, label, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border-2 border-brand-black/10 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600 transition-colors hover:border-brand-black hover:text-brand-black"
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-[2.5rem] bg-brand-yellow p-10">
            <div>
              <h2 className="font-heading text-3xl font-black uppercase text-brand-black">
                Want to be part of this team?
              </h2>
              <p className="mt-2 text-sm font-bold text-brand-black/70">
                Join Enactus ISIMG and start building impact today.
              </p>
            </div>
            <Button href="/register" variant="dark" size="lg">
              Apply to Join
            </Button>
          </div>

          <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs font-bold text-gray-400">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Verified Enactus ISIMG member · {member.memberId}
          </p>
        </div>
      </section>
    </PublicShell>
  );
}