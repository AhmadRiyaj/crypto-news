// components/HeroCard.tsx
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

export default function HeroCard({ article }: { article: Article }) {
  const excerpt = article.content.slice(0, 180) + (article.content.length > 180 ? "…" : "");

  return (
    <Link href={`/news/${article.slug}`} className="group block">
      <div className="relative rounded-2xl overflow-hidden bg-surface border border-border card-hover h-[380px] sm:h-[440px]">
        {/* Background image or gradient */}
        {article.image ? (
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover opacity-30 group-hover:opacity-40 transition-opacity"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-bg to-bg" />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="category-pill bg-accent text-bg border-accent text-xs">
              {article.category}
            </span>
            <span className="text-xs text-muted font-mono">
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </span>
            {article.source && (
              <span className="text-xs text-muted font-mono">· {article.source}</span>
            )}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-700 text-text leading-tight group-hover:text-accent transition-colors mb-3 max-w-3xl">
            {article.title}
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-2xl hidden sm:block">
            {excerpt}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-accent text-sm font-mono font-500">
            Read Article <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
