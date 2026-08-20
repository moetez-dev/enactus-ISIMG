import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getProjects } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/departments`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/projects`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/team`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/events`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/news`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/register`, changeFrequency: "yearly", priority: 0.5 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/projects/${project.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}