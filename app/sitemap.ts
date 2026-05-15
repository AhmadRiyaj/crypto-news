// app/sitemap.ts
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cryptopulse.onrender.com";

  const articles = await prisma.news.findMany({
    where: { approved: true },
    select: { slug: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
    take: 1000,
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${siteUrl}/news`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    ...["bitcoin", "ethereum", "defi", "nfts", "altcoins", "regulation", "trading"].map((cat) => ({
      url: `${siteUrl}/category/${cat}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${siteUrl}/news/${a.slug}`,
    lastModified: a.publishedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes];
}
