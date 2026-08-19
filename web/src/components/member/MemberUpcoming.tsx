import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui";

export function MemberUpcoming({
  icon,
  title,
  message,
}: {
  icon: ReactNode;
  title: string;
  message: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black uppercase text-brand-black">
          {title}
        </h1>
        <p className="mt-1 text-sm font-semibold text-gray-500">{message}</p>
      </div>
      <EmptyState icon={icon} message="Coming soon" />
    </div>
  );
}