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
];

export function levelForPoints(points: number): string {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (points >= l.min) level = l;
  }
  return level.name;
}