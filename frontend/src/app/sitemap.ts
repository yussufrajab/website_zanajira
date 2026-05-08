import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zanajira.go.tz";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["sw", "en"];

  const staticPages = [
    "",
    "/about-us/introduction",
    "/about-us/mission-vision",
    "/about-us/core-functions",
    "/organization-structure/board",
    "/organization-structure/department",
    "/organization-structure/unit-division",
    "/organization-structure/organization-chart",
    "/our-service",
    "/contact-us",
    "/news",
    "/vacancies",
    "/interviews",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${SITE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1.0 : page.includes("/introduction") ? 0.8 : 0.6,
      });
    }
  }

  return entries;
}