import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Award,
  CalendarDays,
  User,
} from "lucide-react";
import { PublicShell } from "@/components/site/PublicShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: "Certificate Verification – Enactus ISIMG",
    description:
      "Verify the authenticity of an Enactus ISIMG certificate.",
  };
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: { certificateId: string };
}) {
  const certificate = await prisma.certificate.findUnique({
    where: { certificateNumber: params.certificateId },
    include: {
      user: { include: { department: true } },
      issuedBy: { select: { fullName: true } },
      event: { select: { title: true, date: true } },
      achievement: { select: { name: true } },
    },
  });
  if (!certificate) notFound();

  const valid = certificate.status === "ACTIVE";
  const issued = new Date(certificate.issueDate).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const link = certificate.user.memberId
    ? `/members/${certificate.user.memberId}`
    : null;

  return (
    <PublicShell>
      <section className="bg-brand-black pb-16 pt-20 text-white md:pt-28">
        <div className="mx-auto w-full max-w-4xl px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-brand-yellow"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Home
          </Link>
          <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-heading text-4xl font-black uppercase tracking-tighter md:text-5xl">
                Certificate verification
              </h1>
              <p className="mt-2 font-mono text-sm font-bold text-brand-yellow">
                #{certificate.certificateNumber}
              </p>
            </div>
            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-widest ${
                valid
                  ? "bg-brand-green text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {valid ? (
                <ShieldCheck className="h-4 w-4" aria-hidden />
              ) : (
                <ShieldAlert className="h-4 w-4" aria-hidden />
              )}
              {valid ? "Authentic certificate" : "Certificate revoked"}
            </span>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto w-full max-w-4xl px-6">
          <div
            className={`rounded-[2.5rem] border-2 p-10 ${
              valid ? "border-brand-green/30" : "border-red-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                  valid ? "bg-brand-green/10 text-brand-green-dark" : "bg-red-50 text-red-500"
                }`}
              >
                {valid ? (
                  <CheckCircle2 className="h-7 w-7" aria-hidden />
                ) : (
                  <XCircle className="h-7 w-7" aria-hidden />
                )}
              </span>
              <div>
                <h2 className="font-heading text-2xl font-black uppercase text-brand-black">
                  {valid
                    ? "This certificate is authentic"
                    : "This certificate has been revoked"}
                </h2>
                <p className="mt-2 text-sm font-semibold text-gray-500">
                  {valid
                    ? "Issued by Enactus ISIMG and stored in our official records."
                    : "This certificate was previously issued by Enactus ISIMG but has been withdrawn and is no longer valid."}
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-[1.5rem] bg-gray-50 p-8">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Recipient
                </span>
                <p className="mt-2 flex items-center gap-2 font-heading text-xl font-black uppercase text-brand-black">
                  <User className="h-5 w-5" aria-hidden />
                  {certificate.user.fullName}
                </p>
                <p className="mt-1 text-sm font-bold text-gray-500">
                  {certificate.user.department?.name ?? "Enactus ISIMG"}
                  {link ? (
                    <>
                      {" · "}
                      <Link
                        href={link}
                        className="font-mono text-brand-yellow-dark underline-offset-2 hover:underline"
                      >
                        {certificate.user.memberId}
                      </Link>
                    </>
                  ) : null}
                </p>
              </div>

              <div className="rounded-[1.5rem] bg-gray-50 p-8">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Certificate
                </span>
                <p className="mt-2 flex items-center gap-2 font-heading text-xl font-black uppercase text-brand-black">
                  <Award className="h-5 w-5" aria-hidden />
                  {certificate.title}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-bold text-gray-500">
                  <CalendarDays className="h-4 w-4" aria-hidden />
                  Issued on {issued}
                </p>
              </div>
            </div>

            <dl className="mt-8 space-y-3 rounded-[1.5rem] bg-brand-black p-8 text-white">
              {certificate.description ? (
                <div className="flex gap-4">
                  <dt className="w-40 shrink-0 text-[9px] font-black uppercase tracking-widest text-gray-400">
                    Details
                  </dt>
                  <dd className="text-sm font-semibold text-gray-200">
                    {certificate.description}
                  </dd>
                </div>
              ) : null}
              {certificate.event ? (
                <div className="flex gap-4">
                  <dt className="w-40 shrink-0 text-[9px] font-black uppercase tracking-widest text-gray-400">
                    Event
                  </dt>
                  <dd className="text-sm font-semibold text-gray-200">
                    {certificate.event.title}
                  </dd>
                </div>
              ) : null}
              {certificate.achievement ? (
                <div className="flex gap-4">
                  <dt className="w-40 shrink-0 text-[9px] font-black uppercase tracking-widest text-gray-400">
                    Achievement
                  </dt>
                  <dd className="text-sm font-semibold text-gray-200">
                    {certificate.achievement.name}
                  </dd>
                </div>
              ) : null}
              <div className="flex gap-4">
                <dt className="w-40 shrink-0 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Issued by
                </dt>
                <dd className="text-sm font-semibold text-gray-200">
                  {certificate.issuedBy.fullName}, Enactus ISIMG
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-40 shrink-0 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Reference
                </dt>
                <dd className="break-all font-mono text-xs font-semibold text-brand-yellow">
                  {certificate.certificateNumber}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 text-center">
            <span className="h-14 w-14 overflow-hidden rounded-2xl ring-2 ring-brand-yellow/30">
              <Image
                src="/images/logo.jpg"
                alt="Enactus ISIMG"
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </span>
            <p className="max-w-md text-xs font-semibold text-gray-400">
              This page confirms the certificate reference above exists in the
              official Enactus ISIMG records.
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}