// components/Navbar.tsx
"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "CryptoPulse";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      setQ("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
              <span className="text-bg font-display font-800 text-sm">₿</span>
            </div>
            <span className="font-display font-700 text-lg text-text group-hover:text-accent transition-colors">
              {siteName}
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { href: "/", label: "Home" },
              { href: "/news", label: "News" },
              { href: "/category/bitcoin", label: "Bitcoin" },
              { href: "/category/ethereum", label: "Ethereum" },
              { href: "/category/defi", label: "DeFi" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-muted hover:text-text transition-colors font-medium"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search news..."
                className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent/50 w-44 transition-all focus:w-56 font-body"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 16.65A7 7 0 1 0 4.05 4.05a7 7 0 0 0 12.6 12.6z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-muted hover:text-text transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-border flex flex-col gap-3">
            {[
              { href: "/", label: "Home" },
              { href: "/news", label: "Latest News" },
              { href: "/category/bitcoin", label: "Bitcoin" },
              { href: "/category/ethereum", label: "Ethereum" },
              { href: "/category/defi", label: "DeFi" },
              { href: "/search", label: "Search" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-muted hover:text-accent transition-colors px-2 py-1"
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
