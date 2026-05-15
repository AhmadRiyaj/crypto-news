// app/api/fetch-news/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchAndStoreNews } from "@/lib/fetchNews";

export async function POST(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("adminKey");
  if (key !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await fetchAndStoreNews();
  return NextResponse.json({ ok: true, message: `Fetched and saved ${saved} new articles.` });
}

// Also allow GET for cron ping from Render's cron job (free tier)
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await fetchAndStoreNews();
  return NextResponse.json({ ok: true, saved });
}
