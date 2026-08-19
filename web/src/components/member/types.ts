export type MemberUser = {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "MEMBER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  department: { id: string; name: string; slug: string } | null;
  motivation: string | null;
  points: number;
  level: string;
  profilePic: string | null;
  phone: string | null;
  bio: string | null;
  createdAt: string;
};

export type MemberLevel = {
  name: string;
  index: number;
  points: number;
  next: { name: string; min: number } | null;
  remaining: number;
  progress: number;
};

export type MemberStats = {
  points: number;
  level: MemberLevel;
  missionsCompleted: number;
  missionsPendingReview: number;
  missionsActive: number;
  eventsAttended: number;
  projectsCount: number;
  achievementsCount: number;
  certificatesCount: number;
};

export type MemberActivity = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  points: number;
  createdAt: string;
};

export type MemberDashboardData = {
  user: MemberUser;
  stats: MemberStats;
  activity: MemberActivity[];
};

export type MemberMission = {
  id: string;
  text: string;
  points: number;
  status: "LIVE" | "PENDING_REVIEW" | "APPROVED";
  workLink: string | null;
  submitted: boolean;
  createdAt: string;
};