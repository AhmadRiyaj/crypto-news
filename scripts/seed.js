// scripts/seed.js
// Inserts demo articles if DB is empty, so site isn't blank on first deploy.

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 100);
}

const DEMO = [
  {
    title: "Bitcoin Surpasses $100,000 as Institutional Demand Surges",
    category: "Bitcoin",
    content: "Bitcoin has crossed the $100,000 milestone as institutional investors continue to pour capital into the leading cryptocurrency. Major asset managers report record inflows into Bitcoin ETFs, signaling mainstream adoption.",
    source: "Demo",
    featured: true,
  },
  {
    title: "Ethereum Layer 2 Networks See Record Transaction Volume",
    category: "Ethereum",
    content: "Ethereum's Layer 2 ecosystem is experiencing unprecedented growth, with networks like Arbitrum and Optimism processing millions of daily transactions at a fraction of mainnet costs.",
    source: "Demo",
    featured: false,
  },
  {
    title: "DeFi Total Value Locked Reaches New All-Time High",
    category: "DeFi",
    content: "Decentralized finance protocols have collectively surpassed $200 billion in total value locked, driven by innovative yield strategies and improved user experience.",
    source: "Demo",
    featured: false,
  },
  {
    title: "SEC Approves Major Cryptocurrency ETF Framework",
    category: "Regulation",
    content: "The Securities and Exchange Commission has approved a comprehensive framework for cryptocurrency exchange-traded funds, paving the way for broader institutional participation in digital asset markets.",
    source: "Demo",
    featured: false,
  },
  {
    title: "Solana NFT Marketplace Records $500M in Monthly Sales",
    category: "NFTs",
    content: "The Solana blockchain's NFT ecosystem is booming, with marketplaces recording half a billion dollars in monthly trading volume as artists and collectors flock to the high-speed, low-cost chain.",
    source: "Demo",
    featured: false,
  },
  {
    title: "Altcoin Season: Top Performers and What to Watch",
    category: "Altcoins",
    content: "As Bitcoin dominance begins to decline, analysts are predicting the start of an altcoin season. Several tokens have already gained 50-100% in recent weeks, with more momentum expected.",
    source: "Demo",
    featured: false,
  },
  {
    title: "Crypto Trading Volume Hits Six-Month High Across Major Exchanges",
    category: "Trading",
    content: "Global cryptocurrency trading volume has surged to its highest level in six months, with spot and derivatives markets both seeing increased activity amid volatile price action.",
    source: "Demo",
    featured: false,
  },
  {
    title: "AI + Blockchain: The Next Frontier in Decentralized Computing",
    category: "General",
    content: "A new wave of projects is combining artificial intelligence with blockchain technology, creating decentralized AI networks that promise to democratize access to computational resources.",
    source: "Demo",
    featured: false,
  },
];

async function seed() {
  const count = await prisma.news.count();
  if (count > 0) {
    console.log("[seed] Database already has data, skipping.");
    return;
  }

  for (const item of DEMO) {
    await prisma.news.create({
      data: {
        title: item.title,
        slug: slugify(item.title),
        content: item.content,
        category: item.category,
        source: item.source,
        featured: item.featured,
        approved: true,
        publishedAt: new Date(Date.now() - Math.random() * 86400000),
      },
    });
  }

  console.log(`[seed] Inserted ${DEMO.length} demo articles.`);
}

seed().finally(() => prisma.$disconnect());
