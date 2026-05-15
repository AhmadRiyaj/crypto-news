// components/Footer.tsx
import Link from "next/link";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "CryptoPulse";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
                <span className="text-bg font-display font-800 text-xs">₿</span>
              </div>
              <span className="font-display font-700 text-text">{siteName}</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Real-time crypto news, market insights, and blockchain updates. Stay ahead of the curve.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs text-muted uppercase tracking-widest mb-3">News</h4>
            <ul className="space-y-2">
              {["Bitcoin", "Ethereum", "DeFi", "NFTs", "Altcoins"].map((c) => (
                <li key={c}>
                  <Link href={`/category/${c.toLowerCase()}`} className="text-sm text-muted hover:text-accent transition-colors">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs text-muted uppercase tracking-widest mb-3">Explore</h4>
            <ul className="space-y-2">
              {[
                { href: "/news", label: "Latest" },
                { href: "/search", label: "Search" },
                { href: "/category/regulation", label: "Regulation" },
                { href: "/category/trading", label: "Trading" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted hover:text-accent transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs text-muted uppercase tracking-widest mb-3">Legal</h4>
            <p className="text-xs text-muted leading-relaxed">
              News aggregated from public sources. Not financial advice. Always DYOR.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted font-mono">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <p className="text-xs text-muted font-mono">
            Powered by CryptoPanic API + Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
