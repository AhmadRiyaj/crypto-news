// app/api/news/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function checkAdmin(req: NextRequest): boolean {
  const key = req.nextUrl.searchParams.get("adminKey") ?? req.headers.get("x-admin-key");
  return key === process.env.ADMIN_PASSWORD;
}

// GET: list articles (admin) or single article
export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const articles = await prisma.news.findMany({
    orderBy: { publishedAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      category: true,
      approved: true,
      featured: true,
      source: true,
      publishedAt: true,
      slug: true,
    },
  });

  return NextResponse.json({ articles });
}

// PATCH: toggle approved / featured
export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, field, value } = body;

  if (!["approved", "featured"].includes(field)) {
    return NextResponse.json({ error: "Invalid field" }, { status: 400 });
  }

  await prisma.news.update({
    where: { id: Number(id) },
    data: { [field]: Boolean(value) },
  });

  return NextResponse.json({ ok: true });
}

// DELETE: remove article
export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.news.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
