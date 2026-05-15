// lib/fetchNews.ts
// Uses ONLY free APIs — no API key required.
// Sources: cryptocurrency.cv + CoinGecko + RSS feeds

import axios from "axios";
import { prisma } from "./db";

const CATEGORIES: Record<string, string> = {
  bitcoin: "Bitcoin", btc: "Bitcoin",
  ethereum: "Ethereum", eth: "Ethereum",
  altcoin: "Altcoins", solana: "Altcoins", sol: "Altcoins",
  nft: "NFTs",
  regulation: "Regulation", sec: "Regulation", law: "Regulation",
  defi: "DeFi",
  trading: "Trading", market: "Trading",
};

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim().slice(0, 100);
}

export function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(CATEGORIES)) {
    if (lower.includes(key)) return val;
  }
  return "General";
}

interface NewsItem {
  title: string; content: string; image: string | null;
  source: string; sourceUrl: string | null; category: string; publishedAt: Date;
}

// SOURCE 1: cryptocurrency.cv — No API key
async function fetchFromCryptocurrencyCV(): Promise<NewsItem[]> {
  try {
    const res = await axios.get("https://cryptocurrency.cv/api/v1/news", {
      timeout: 10000, headers: { "User-Agent": "CryptoPulse/1.0" },
    });
    const items = res.data?.data ?? res.data?.news ?? res.data ?? [];
    if (!Array.isArray(items)) return [];
    return items.slice(0, 30).map((item: Record<string, string>) => ({
      title: item.title ?? "",
      content: item.description ?? item.content ?? item.title ?? "",
      image: item.image_url ?? item.thumbnail ?? null,
      source: item.source ?? item.source_name ?? "cryptocurrency.cv",
      sourceUrl: item.url ?? item.link ?? null,
      category: detectCategory(item.title ?? ""),
      publishedAt: new Date(item.published_at ?? item.created_at ?? Date.now()),
    }));
  } catch (err) {
    console.warn("[fetchNews] cryptocurrency.cv failed:", (err as Error).message);
    return [];
  }
}

// SOURCE 2: CoinGecko News — No API key
async function fetchFromCoinGecko(): Promise<NewsItem[]> {
  try {
    const res = await axios.get("https://api.coingecko.com/api/v3/news", {
      timeout: 10000, headers: { "User-Agent": "CryptoPulse/1.0", Accept: "application/json" },
    });
    const items = res.data?.data ?? [];
    if (!Array.isArray(items)) return [];
    return items.slice(0, 20).map((item: Record<string, string | number>) => ({
      title: String(item.title ?? ""),
      content: String(item.description ?? item.title ?? ""),
      image: String(item.thumb_2x ?? "") || null,
      source: String(item.author ?? "CoinGecko"),
      sourceUrl: String(item.url ?? "") || null,
      category: detectCategory(String(item.title ?? "")),
      publishedAt: item.updated_at ? new Date(Number(item.updated_at) * 1000) : new Date(),
    }));
  } catch (err) {
    console.warn("[fetchNews] CoinGecko failed:", (err as Error).message);
    return [];
  }
}

// SOURCE 3: RSS Feeds — Completely free, no key
const RSS_FEEDS = [
  { url: "https://decrypt.co/feed", source: "Decrypt" },
  { url: "https://coinjournal.net/feed/", source: "CoinJournal" },
  { url: "https://cryptoslate.com/feed/", source: "CryptoSlate" },
  { url: "https://bitcoinmagazine.com/.rss/full/", source: "Bitcoin Magazine" },
];

function extractTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i"))
    ?? xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m?.[1]?.trim() ?? "";
}
function decodeXML(str: string): string {
  return str.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'");
}

function parseRSS(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  for (const match of xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/g)) {
    const block = match[1];
    const title = decodeXML(extractTag(block, "title"));
    const description = decodeXML(extractTag(block, "description")).replace(/<[^>]+>/g, "").slice(0, 500);
    const link = extractTag(block, "link") || extractTag(block, "guid");
    const pubDate = extractTag(block, "pubDate");
    const image = block.match(/url="([^"]+\.(jpg|jpeg|png|webp))"/i)?.[1]
      ?? block.match(/<media:content[^>]+url="([^"]+)"/i)?.[1] ?? null;
    if (!title) continue;
    items.push({
      title, content: description || title, image, source,
      sourceUrl: link || null, category: detectCategory(title),
      publishedAt: pubDate ? new Date(pubDate) : new Date(),
    });
  }
  return items;
}

async function fetchFromRSS(): Promise<NewsItem[]> {
  const all: NewsItem[] = [];
  for (const feed of RSS_FEEDS) {
    try {
      const res = await axios.get(feed.url, {
        timeout: 8000,
        headers: { "User-Agent": "CryptoPulse/1.0", Accept: "application/rss+xml,text/xml" },
      });
      all.push(...parseRSS(res.data, feed.source).slice(0, 10));
    } catch (err) {
      console.warn(`[fetchNews] RSS ${feed.source} failed:`, (err as Error).message);
    }
  }
  return all;
}

// MAIN
export async function fetchAndStoreNews(): Promise<number> {
  console.log("[fetchNews] Fetching from all free sources...");
  const [cv, gecko, rss] = await Promise.all([
    fetchFromCryptocurrencyCV(), fetchFromCoinGecko(), fetchFromRSS(),
  ]);

  const allItems = [...cv, ...gecko, ...rss].filter((i) => i.title.length > 10);
  console.log(`[fetchNews] Got ${allItems.length} articles (cv:${cv.length} gecko:${gecko.length} rss:${rss.length})`);

  let saved = 0;
  for (const item of allItems) {
    const slug = slugify(item.title);
    if (!slug) continue;
    try {
      await prisma.news.upsert({
        where: { slug },
        update: {},
        create: {
          title: item.title, slug, content: item.content, image: item.image,
          source: item.source, sourceUrl: item.sourceUrl, category: item.category,
          publishedAt: item.publishedAt, approved: true,
        },
      });
      saved++;
    } catch { /* duplicate slug */ }
  }

  const total = await prisma.news.count();
  if (total > 5000) {
    const oldest = await prisma.news.findMany({ orderBy: { publishedAt: "asc" }, take: total - 5000, select: { id: true } });
    await prisma.news.deleteMany({ where: { id: { in: oldest.map((n) => n.id) } } });
  }

  console.log(`[fetchNews] Saved ${saved} new articles.`);
  return saved;
}
