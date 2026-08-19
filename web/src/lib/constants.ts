export const SITE_NAME = "Enactus ISIMG";
export const SITE_TAGLINE = "Impact through action in Gabès, Tunisia";
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "enactus.isimg@gmail.com";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const SOCIALS = {
  facebook: "https://www.facebook.com/enactusisimg",
  instagram: "https://www.instagram.com/enactus_isimg",
  linkedin: "https://www.linkedin.com/company/enactus-isimg",
} as const;

export const STATS = {
  projects: "12+",
  enactors: "50+",
  livesImpacted: "1.2k",
  activeEnactors: "22+",
} as const;

/** Level thresholds shared with the member area / apps. */
export const LEVELS: { name: string; min: number }[] = [
  { name: "Junior", min: 0 },
  { name: "Active", min: 100 },
  { name: "Expert", min: 300 },
  { name: "Legend", min: 600 },
  { name: "Elite", min: 1000 },
  { name: "Grandmaster", min: 1500 },
];

export function levelForPoints(points: number): string {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (points >= l.min) level = l;
  }
  return level.name;
}

export type LevelInfo = {
  name: string;
  index: number;
  points: number;
  next: { name: string; min: number } | null;
  remaining: number;
  progress: number;
};

export function getLevelInfo(points: number): LevelInfo {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (points >= LEVELS[i].min) index = i;
  }
  const current = LEVELS[index];
  const next = index + 1 < LEVELS.length ? LEVELS[index + 1] : null;
  const remaining = next ? Math.max(0, next.min - points) : 0;
  const span = next ? next.min - current.min : 1;
  const progress = next
    ? Math.min(100, Math.round(((points - current.min) / span) * 100))
    : 100;
  return { name: current.name, index, points, next, remaining, progress };
}