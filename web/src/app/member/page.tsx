import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { MemberArea } from "@/components/member/MemberArea";

export const dynamic = "force-dynamic";

export default async function MemberPage() {
  const user = await requireUser().catch(() => null);
  if (!user) redirect("/login?from=/member");

  return <MemberArea />;
}