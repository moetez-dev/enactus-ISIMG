import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { getDepartments } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Apply to Join",
  description: "Apply to become part of Enactus ISIMG.",
};

export default async function RegisterPage() {
  const departments = await getDepartments();
  const options = departments.map((d) => ({ id: d.id, name: d.name }));

  return (
    <AuthShell>
      <h1 className="font-heading text-3xl font-black uppercase tracking-tighter">
        Join Enactus ISIMG
      </h1>
      <p className="mb-8 mt-2 text-sm font-semibold text-gray-400">
        Fill in the form below. Our HR team will review your application.
      </p>
      <RegistrationForm departments={options} />
    </AuthShell>
  );
}