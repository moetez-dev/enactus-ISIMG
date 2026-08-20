export type MemberUser = {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "MEMBER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  department: { id: string; name: string; slug: string } | null;
  motivation: string | null;
  memberId: string | null;
  memberSince: string | null;
  institution: string | null;
  studyLevel: string | null;
  fieldOfStudy: string | null;
  skills: string[];
  interests: string[];
  availability: string | null;
  linkedin: string | null;
  github: string | null;
  portfolioUrl: string | null;
  publicProfile: boolean;
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
  unreadNotifications: number;
  totalHours: number;
  engagement: {
    score: number;
    earned: number;
    target: number;
    breakdown: Record<string, number>;
  };
};

export type MemberActivity = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  points: number;
  hours: number;
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

export type MemberAchievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  threshold: number;
  xpReward: number;
  earned: boolean;
  earnedAt: string | null;
  progress: number;
};

export type MemberCertificate = {
  id: string;
  certificateNumber: string;
  title: string;
  description: string | null;
  issueDate: string;
  event: { id: string; title: string } | null;
  achievement: { id: string; name: string; icon: string } | null;
};

export type MemberEvent = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
};

export type MemberEventRegistration = {
  id: string;
  status: "REGISTERED" | "ATTENDED";
  registeredAt: string;
  attendedAt: string | null;
  event: MemberEvent;
};

export type MemberProject = {
  id: string;
  name: string;
  slug: string;
  tag: string;
  image: string | null;
  department: { id: string; name: string } | null;
};

export type MemberProjectMembership = {
  id: string;
  role: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  respondedAt: string | null;
};

export type MemberNotification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};