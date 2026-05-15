// app/page.tsx
import { prisma } from "@/lib/db";
import NewsCard from "@/components/NewsCard";
import HeroCard from "@/components/HeroCard";
import CategoryBar from "@/components/CategoryBar";
import Link from "next/link";

export const revalidate = 300; // Revalidate every 5 minutes

const CATEGORIES = ["Bitcoin", "Ethereum", "DeFi", "NFTs", "Altcoins", "Regulation", "Trading"];

export default async function HomePage() {
  const [featured, latest, trending] = await Promise.all([
    prisma.news.findFirst({
      where: { approved: true, featured: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.news.findMany({
      where: { approved: true },
      orderBy: { publishedAt: "desc" },
      take: 12,
    }),
    prisma.news.findMany({
      where: { approved: true },
      orderBy: { publishedAt: "desc" },
      take: 4,
      skip: 1,
    }),
  ]);

  const hero = featured ?? latest[0];
  const mainNews = latest.slice(featured ? 0 : 1, 7);
  const sideNews = latest.slice(7, 12);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      {hero && (
        <section className="mb-10">
          <HeroCard article={hero} />
        </section>
      )}

      {/* Category Bar */}
      <CategoryBar categories={CATEGORIES} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Latest News */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-700 text-text">
              <span className="text-accent">▍</span> Latest News
            </h2>
            <Link href="/news" className="text-sm text-muted hover:text-accent transition-colors font-mono">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mainNews.map((article, i) => (
              <NewsCard key={article.id} article={article} index={i} />
            ))}
          </div>
        </div>

        {/* Sidebar — Trending */}
        <div>
          <div className="mb-5">
            <h2 className="font-display text-xl font-700 text-text">
              <span className="text-accent">▍</span> Trending
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {sideNews.map((article, i) => (
              <TrendingItem key={article.id} article={article} rank={i + 1} />
            ))}
          </div>

          {/* Categories Box */}
          <div className="mt-8 p-5 bg-surface border border-border rounded-xl">
            <h3 className="font-display text-sm font-600 text-muted uppercase tracking-widest mb-4">
              Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={`/category/${cat.toLowerCase()}`}
                  className="category-pill bg-border/50 border-border text-muted hover:bg-accent/10 hover:border-accent/40 hover:text-accent transition-all"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendingItem({ article, rank }: { article: { slug: string; title: string; category: string; publishedAt: Date }; rank: number }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="flex gap-3 items-start p-3 rounded-lg bg-surface border border-border card-hover group"
    >
      <span className="font-mono text-2xl font-800 text-border group-hover:text-accent/30 transition-colors leading-none mt-0.5">
        {String(rank).padStart(2, "0")}
      </span>
      <div>
        <span className="category-pill bg-accent/10 border-accent/20 text-accent text-[10px] mb-1">
          {article.category}
        </span>
        <p className="text-sm text-text font-500 leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {article.title}
        </p>
        <p className="text-xs text-muted mt-1 font-mono">
          {new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      </div>
    </Link>
  );
}
