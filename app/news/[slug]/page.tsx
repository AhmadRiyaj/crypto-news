// app/news/[slug]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import NewsCard from "@/components/NewsCard";

export const revalidate = 600;

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await prisma.news.findUnique({ where: { slug: params.slug } });
  if (!article) return { title: "Not Found" };
  return {
    title: article.title,
    description: article.content.slice(0, 160),
    openGraph: {
      title: article.title,
      description: article.content.slice(0, 160),
      images: article.image ? [{ url: article.image }] : [],
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const [article, related] = await Promise.all([
    prisma.news.findUnique({ where: { slug: params.slug, approved: true } }),
    prisma.news.findMany({
      where: { approved: true },
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
  ]);

  if (!article) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Article */}
        <article className="lg:col-span-2">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-muted font-mono mb-6">
            <Link href="/" className="hover:text-accent">Home</Link>
            <span>/</span>
            <Link href="/news" className="hover:text-accent">News</Link>
            <span>/</span>
            <Link href={`/category/${article.category.toLowerCase()}`} className="hover:text-accent">
              {article.category}
            </Link>
          </nav>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
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

          {/* Title */}
          <h1 className="font-display text-2xl sm:text-3xl font-700 text-text leading-tight mb-6">
            {article.title}
          </h1>

          {/* Image */}
          {article.image && (
            <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden mb-6">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <p className="text-base text-text/90 leading-relaxed">{article.content}</p>
          </div>

          {/* Source Link */}
          {article.sourceUrl && (
            <div className="mt-8 p-4 bg-surface border border-border rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-muted font-mono mb-0.5">Source</p>
                <p className="text-sm text-text">{article.source}</p>
              </div>
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent border border-accent/30 px-4 py-2 rounded-lg hover:bg-accent/10 transition-all font-mono"
              >
                Read Original →
              </a>
            </div>
          )}

          {/* Disclaimer */}
          <p className="mt-6 text-xs text-muted/60 italic">
            ⚠️ This is not financial advice. Always do your own research before making investment decisions.
          </p>
        </article>

        {/* Sidebar */}
        <aside>
          <h2 className="font-display text-lg font-700 mb-4 text-text">
            <span className="text-accent">▍</span> More News
          </h2>
          <div className="flex flex-col gap-4">
            {related
              .filter((a) => a.slug !== article.slug)
              .slice(0, 3)
              .map((a, i) => (
                <NewsCard key={a.id} article={a} index={i} />
              ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
