// app/category/[name]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import NewsCard from "@/components/NewsCard";
import type { Metadata } from "next";

export const revalidate = 300;

const CATEGORY_MAP: Record<string, string> = {
  bitcoin: "Bitcoin",
  ethereum: "Ethereum",
  defi: "DeFi",
  nfts: "NFTs",
  altcoins: "Altcoins",
  regulation: "Regulation",
  trading: "Trading",
  general: "General",
};

interface Props { params: { name: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = CATEGORY_MAP[params.name.toLowerCase()];
  if (!cat) return { title: "Category Not Found" };
  return {
    title: `${cat} News`,
    description: `Latest ${cat} cryptocurrency news and updates.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const cat = CATEGORY_MAP[params.name.toLowerCase()];
  if (!cat) notFound();

  const articles = await prisma.news.findMany({
    where: { approved: true, category: cat },
    orderBy: { publishedAt: "desc" },
    take: 24,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-700 text-text">
          <span className="text-accent">{cat}</span> News
        </h1>
        <p className="text-muted mt-1">{articles.length} articles</p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted text-lg">No articles found in this category yet.</p>
          <p className="text-muted/60 text-sm mt-2">Check back soon — news updates every 10 minutes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((a, i) => (
            <NewsCard key={a.id} article={a} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
