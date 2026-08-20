import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getLevelInfo } from "@/lib/constants";
import { MemberCardPrintButton } from "@/components/member/MemberCardPrintButton";

export const dynamic = "force-dynamic";

async function memberCardQr(payload: string): Promise<string | null> {
  try {
    return await QRCode.toDataURL(payload, {
      width: 190,
      margin: 1,
    });
  } catch {
    return null;
  }
}

export default async function MemberCardPage() {
  const session = await requireUser().catch(() => null);
  if (!session) redirect("/login?from=/member/card");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    include: { department: true },
  });
  if (!dbUser) redirect("/login");

  const level = getLevelInfo(dbUser.points);
  const joined = new Date(dbUser.createdAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const profileUrl = dbUser.memberId
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/members/${dbUser.memberId}`
    : null;
  const qrDataUrl = profileUrl ? await memberCardQr(profileUrl) : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-brand-black px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-yellow">
            Enactus ISIMG
          </p>
          <h1 className="font-heading text-3xl font-black uppercase">
            Membership card
          </h1>
          <p className="mt-1 text-sm font-semibold text-gray-400">
            Official member identification
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-yellow to-brand-yellow-dark p-1.5 shadow-2xl">
          <div className="relative overflow-hidden rounded-[1.4rem] bg-brand-black px-7 py-8 text-white">
            <div
              className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-yellow/15"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-brand-yellow/10"
              aria-hidden
            />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-yellow">
              Enactus ISIMG
            </p>
            <p className="mt-7 font-heading text-2xl font-black uppercase leading-tight">
              {dbUser.fullName}
            </p>
            <p className="mt-2 text-sm font-bold text-gray-300">
              {dbUser.department?.name ?? "No department"}
            </p>

            <div className="mt-9 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Member ID
                </p>
                <p className="mt-1 font-mono text-lg font-bold tracking-wider">
                  {dbUser.memberId ?? "—"}
                </p>
                <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Member since {joined}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-brand-yellow px-3 py-1 text-[9px] font-black uppercase tracking-widest text-brand-black">
                    {level.name}
                  </span>
                  <span className="rounded-full border border-white/20 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-gray-300">
                    {dbUser.points} XP
                  </span>
                </div>
              </div>
              {qrDataUrl ? (
                <div className="shrink-0 rounded-2xl bg-white p-1.5">
                  <img
                    src={qrDataUrl}
                    alt={`QR code verifying member ${dbUser.memberId ?? ""}`}
                    width={120}
                    height={120}
                    className="h-[120px] w-[120px]"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          <MemberCardPrintButton />
          <p className="text-center text-xs font-semibold text-gray-400">
            {dbUser.memberId ? (
              <>
                Scan the QR code to verify this member online:
                <span className="ml-1 font-mono font-bold text-gray-200">
                  /members/{dbUser.memberId}
                </span>
              </>
            ) : (
              "Contact an admin to receive your member ID."
            )}
          </p>
        </div>
      </div>
    </main>
  );
}