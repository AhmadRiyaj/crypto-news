// components/CategoryBar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CategoryBar({ categories }: { categories: string[] }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <Link
        href="/news"
        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all font-mono ${
          pathname === "/news"
            ? "bg-accent text-bg"
            : "bg-surface border border-border text-muted hover:text-text hover:border-accent/30"
        }`}
      >
        All
      </Link>
      {categories.map((cat) => {
        const href = `/category/${cat.toLowerCase()}`;
        const active = pathname === href;
        return (
          <Link
            key={cat}
            href={href}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all font-mono ${
              active
                ? "bg-accent text-bg"
                : "bg-surface border border-border text-muted hover:text-text hover:border-accent/30"
            }`}
          >
            {cat}
          </Link>
        );
      })}
    </div>
  );
}
