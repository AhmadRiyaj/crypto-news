// app/search/page.tsx
import { prisma } from "@/lib/db";
import NewsCard from "@/components/NewsCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search Crypto News" };

interface Props { searchParams: { q?: string } }

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams.q?.trim() ?? "";

  const articles = q
    ? await prisma.news.findMany({
        where: {
          approved: true,
          OR: [
            { title: { contains: q } },
            { content: { contains: q } },
            { category: { contains: q } },
          ],
        },
        orderBy: { publishedAt: "desc" },
        take: 24,
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-700 text-text mb-4">
          Search <span className="text-accent">News</span>
        </h1>
        <form method="GET" action="/search" className="flex gap-3 max-w-xl">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search bitcoin, ethereum, defi..."
            className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-text placeholder:text-muted focus:outline-none focus:border-accent/50 font-body"
          />
          <button
            type="submit"
            className="bg-accent text-bg px-6 py-3 rounded-xl font-mono font-600 hover:bg-accent-dim transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {q && (
        <p className="text-muted text-sm mb-6 font-mono">
          {articles.length} result{articles.length !== 1 ? "s" : ""} for &quot;{q}&quot;
        </p>
      )}

      {q && articles.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted text-lg">No results found for &quot;{q}&quot;</p>
          <p className="text-muted/60 text-sm mt-2">Try different keywords</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((a, i) => (
          <NewsCard key={a.id} article={a} index={i} />
        ))}
      </div>
    </div>
  );
}
