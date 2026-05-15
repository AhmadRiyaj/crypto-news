// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Ticker from "@/components/Ticker";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "CryptoPulse";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cryptopulse.onrender.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Live Crypto News`,
    template: `%s | ${siteName}`,
  },
  description: "Real-time cryptocurrency news, market updates, and blockchain insights. Bitcoin, Ethereum, DeFi, NFTs and more.",
  keywords: ["crypto news", "bitcoin", "ethereum", "blockchain", "defi", "nft", "cryptocurrency"],
  openGraph: {
    siteName,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-bg text-text font-body">
        <Navbar />
        <Ticker />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
