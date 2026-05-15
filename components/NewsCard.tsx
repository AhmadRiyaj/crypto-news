// components/NewsCard.tsx
import Link from "next/link";
import Image from "next/image";

interface Article {
  slug: string;
  title: string;
  content: string;
  image?: string | null;
  category: string;
  source?: string | null;
  publishedAt: Date;
}

const CATEGORY_COLORS: Record<string, string> = {
  Bitcoin: "bg-orange-400/10 border-orange-400/20 text-orange-400",
  Ethereum: "bg-purple-400/10 border-purple-400/20 text-purple-400",
  DeFi: "bg-blue-400/10 border-blue-400/20 text-blue-400",
  NFTs: "bg-pink-400/10 border-pink-400/20 text-pink-400",
  Altcoins: "bg-green-400/10 border-green-400/20 text-green-400",
  Regulation: "bg-red-400/10 border-red-400/20 text-red-400",
  Trading: "bg-yellow-400/10 border-yellow-400/20 text-yellow-400",
  General: "bg-accent/10 border-accent/20 text-accent",
};

export default function NewsCard({ article, index = 0 }: { article: Article; index?: number }) {
  const colorClass = CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS.General;

  return (
    <Link
      href={`/news/${article.slug}`}
      className="group block bg-surface border border-border rounded-xl overflow-hidden card-hover animate-fade-up"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      {/* Image */}
      {article.image && (
        <div className="relative h-40 overflow-hidden">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            unoptimized
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`category-pill border text-[10px] ${colorClass}`}>
            {article.category}
          </span>
          <span className="text-[11px] text-muted font-mono">
            {timeAgo(new Date(article.publishedAt))}
          </span>
        </div>
        <h3 className="font-display text-sm font-600 text-text leading-snug line-clamp-3 group-hover:text-accent transition-colors">
          {article.title}
        </h3>
        {article.source && (
          <p className="text-[11px] text-muted mt-2 font-mono">{article.source}</p>
        )}
      </div>
    </Link>
  );
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
