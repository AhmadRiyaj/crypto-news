// scripts/cron.js — Fetches crypto news every 10 minutes. No API key needed.
require("dotenv").config();
let cron, axios;
try {
  cron = require("node-cron");
  axios = require("axios");
} catch { console.error("Run: npm install"); process.exit(1); }

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function slugify(t) {
  return t.toLowerCase().replace(/[^\w\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim().slice(0,100);
}
const CAT_MAP = { bitcoin:"Bitcoin",btc:"Bitcoin",ethereum:"Ethereum",eth:"Ethereum",
  nft:"NFTs",defi:"DeFi",regulation:"Regulation",sec:"Regulation",solana:"Altcoins",trading:"Trading",market:"Trading" };
function detectCat(t) {
  const l=t.toLowerCase();
  for(const[k,v] of Object.entries(CAT_MAP)) if(l.includes(k)) return v;
  return "General";
}

const RSS_FEEDS = [
  { url:"https://decrypt.co/feed", source:"Decrypt" },
  { url:"https://coinjournal.net/feed/", source:"CoinJournal" },
  { url:"https://cryptoslate.com/feed/", source:"CryptoSlate" },
  { url:"https://bitcoinmagazine.com/.rss/full/", source:"Bitcoin Magazine" },
];

function extractTag(xml,tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`,"i"))
    ?? xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`,"i"));
  return m?.[1]?.trim() ?? "";
}
function decodeXML(s){return s.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"');}

async function fetchAll() {
  const all = [];

  // cryptocurrency.cv — no key
  try {
    const r = await axios.get("https://cryptocurrency.cv/api/v1/news",{timeout:10000,headers:{"User-Agent":"CryptoPulse/1.0"}});
    const items = r.data?.data ?? r.data?.news ?? r.data ?? [];
    if(Array.isArray(items)) {
      for(const i of items.slice(0,30)) {
        all.push({ title:i.title??"", content:i.description??i.title??"",
          image:i.image_url??null, source:i.source_name??"cryptocurrency.cv",
          sourceUrl:i.url??null, publishedAt:new Date(i.published_at??Date.now()) });
      }
    }
  } catch(e){ console.warn("cv failed:",e.message); }

  // CoinGecko — no key
  try {
    const r = await axios.get("https://api.coingecko.com/api/v3/news",{timeout:10000,headers:{"User-Agent":"CryptoPulse/1.0"}});
    const items = r.data?.data ?? [];
    if(Array.isArray(items)) {
      for(const i of items.slice(0,20)) {
        all.push({ title:String(i.title??""), content:String(i.description??i.title??""),
          image:i.thumb_2x??null, source:String(i.author??"CoinGecko"),
          sourceUrl:String(i.url??"")||null, publishedAt:i.updated_at?new Date(i.updated_at*1000):new Date() });
      }
    }
  } catch(e){ console.warn("gecko failed:",e.message); }

  // RSS feeds
  for(const feed of RSS_FEEDS) {
    try {
      const r = await axios.get(feed.url,{timeout:8000,headers:{"User-Agent":"CryptoPulse/1.0"}});
      const xml = r.data;
      for(const m of xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/g)) {
        const b=m[1];
        const title=decodeXML(extractTag(b,"title"));
        const desc=decodeXML(extractTag(b,"description")).replace(/<[^>]+>/g,"").slice(0,500);
        const link=extractTag(b,"link")||extractTag(b,"guid");
        const pub=extractTag(b,"pubDate");
        const img=b.match(/url="([^"]+\.(jpg|jpeg|png))"/i)?.[1]??null;
        if(!title) continue;
        all.push({title,content:desc||title,image:img,source:feed.source,sourceUrl:link||null,publishedAt:pub?new Date(pub):new Date()});
      }
    } catch(e){ console.warn(`RSS ${feed.source} failed:`,e.message); }
  }

  return all.filter(i=>i.title.length>10);
}

async function run() {
  try {
    const items = await fetchAll();
    let saved = 0;
    for(const item of items) {
      const slug = slugify(item.title);
      if(!slug) continue;
      try {
        await prisma.news.upsert({
          where:{slug}, update:{},
          create:{title:item.title,slug,content:item.content,image:item.image,
            source:item.source,sourceUrl:item.sourceUrl,category:detectCat(item.title),
            publishedAt:item.publishedAt,approved:true},
        });
        saved++;
      } catch{}
    }
    const total = await prisma.news.count();
    if(total>5000) {
      const old = await prisma.news.findMany({orderBy:{publishedAt:"asc"},take:total-5000,select:{id:true}});
      await prisma.news.deleteMany({where:{id:{in:old.map(n=>n.id)}}});
    }
    console.log(`[cron] ${new Date().toISOString()} — Saved ${saved}/${items.length} articles. DB: ${total}`);
  } catch(err){ console.error("[cron] Error:",err.message); }
}

run();
cron.schedule("*/10 * * * *", run);
console.log("[cron] Started — fetches every 10 min from free APIs (no key needed).");
