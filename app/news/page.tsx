// app/news/page.tsx
import { prisma } from "@/lib/db";
import NewsCard from "@/components/NewsCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latest Crypto News",
  description: "Browse the latest cryptocurrency news, market updates and blockchain insights.",
};

export const revalidate = 180;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const pageSize = 18;

  const [articles, total] = await Promise.all([
    prisma.news.findMany({
      where: { approved: true },
      orderBy: { publishedAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.news.count({ where: { approved: true } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-700 text-text">
          Latest <span className="text-accent">News</span>
        </h1>
        <p className="text-muted mt-1">{total} articles and counting</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article, i) => (
          <NewsCard key={article.id} article={article} index={i} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && (
            <a
              href={`/news?page=${page - 1}`}
              className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-muted hover:text-accent hover:border-accent/30 transition-all font-mono"
            >
              ← Prev
            </a>
          )}
          <span className="px-4 py-2 font-mono text-sm text-muted">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/news?page=${page + 1}`}
              className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-muted hover:text-accent hover:border-accent/30 transition-all font-mono"
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
