import type { Mission } from "@prisma/client";

export type MemberStatusValue = "PENDING" | "APPROVED" | "REJECTED";

const memberStyles: Record<MemberStatusValue, string> = {
  PENDING: "bg-yellow-50 text-yellow-800",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-600",
};

const memberLabels: Record<MemberStatusValue, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const missionStyles: Record<Mission["status"], string> = {
  LIVE: "bg-yellow-50 text-yellow-800",
  PENDING_REVIEW: "bg-blue-50 text-blue-700",
  APPROVED: "bg-green-50 text-green-700",
};

const missionLabels: Record<Mission["status"], string> = {
  LIVE: "To do",
  PENDING_REVIEW: "Under review",
  APPROVED: "Approved",
};

/** Member application status pill (admin areas). */
export function StatusBadge({
  status,
  className = "",
}: {
  status: MemberStatusValue;
  className?: string;
}) {
  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${memberStyles[status]} ${className}`}
    >
      {memberLabels[status]}
    </span>
  );
}

/** Mission status pill (member + admin areas). */
export function StatusPill({
  status,
  className = "",
}: {
  status: Mission["status"];
  className?: string;
}) {
  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${missionStyles[status]} ${className}`}
    >
      {missionLabels[status]}
    </span>
  );
}