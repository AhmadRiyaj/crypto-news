// app/sitemap.ts

import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://cryptopulse.onrender.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },

    {
      url: `${siteUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },

    ...[
      "bitcoin",
      "ethereum",
      "defi",
      "nfts",
      "altcoins",
      "regulation",
      "trading",
    ].map((cat) => ({
      url: `${siteUrl}/category/${cat}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
  ];

  return staticRoutes;
} 