import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminArea } from "@/components/admin/AdminArea";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) redirect("/login?from=/admin");

  return <AdminArea adminName={admin.fullName} />;
}