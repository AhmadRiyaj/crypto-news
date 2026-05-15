// app/admin/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";

interface Article {
  id: number;
  title: string;
  category: string;
  approved: boolean;
  featured: boolean;
  source: string | null;
  publishedAt: string;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [msg, setMsg] = useState("");

  const loadArticles = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/news?adminKey=${password}`);
    if (res.ok) {
      const data = await res.json();
      setArticles(data.articles);
    }
    setLoading(false);
  }, [password]);

  useEffect(() => {
    if (authed) loadArticles();
  }, [authed, loadArticles]);

  const login = async () => {
    const res = await fetch(`/api/news?adminKey=${password}`);
    if (res.ok) {
      setAuthed(true);
    } else {
      setMsg("Wrong password");
    }
  };

  const fetchNow = async () => {
    setFetching(true);
    setMsg("");
    const res = await fetch(`/api/fetch-news?adminKey=${password}`, { method: "POST" });
    const data = await res.json();
    setMsg(data.message ?? "Done");
    await loadArticles();
    setFetching(false);
  };

  const toggle = async (id: number, field: "approved" | "featured", value: boolean) => {
    await fetch(`/api/news`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, field, value, adminKey: password }),
    });
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const deleteArticle = async (id: number) => {
    if (!confirm("Delete this article?")) return;
    await fetch(`/api/news?id=${id}&adminKey=${password}`, { method: "DELETE" });
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  if (!authed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-surface border border-border rounded-2xl p-8 w-full max-w-sm">
          <h1 className="font-display text-2xl font-700 text-text mb-6">
            Admin <span className="text-accent">Login</span>
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Admin password"
            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text placeholder:text-muted focus:outline-none focus:border-accent/50 mb-4 font-body"
          />
          {msg && <p className="text-red-400 text-sm mb-3 font-mono">{msg}</p>}
          <button
            onClick={login}
            className="w-full bg-accent text-bg py-3 rounded-xl font-mono font-600 hover:bg-accent-dim transition-colors"
          >
            Login →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-700 text-text">
          Admin <span className="text-accent">Panel</span>
        </h1>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm text-green-400 font-mono">{msg}</span>}
          <button
            onClick={fetchNow}
            disabled={fetching}
            className="bg-accent text-bg px-4 py-2 rounded-lg font-mono text-sm font-600 hover:bg-accent-dim transition-colors disabled:opacity-50"
          >
            {fetching ? "Fetching..." : "⟳ Fetch News Now"}
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border text-xs text-muted font-mono uppercase tracking-wide">
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-1">Featured</div>
          <div className="col-span-1">Approved</div>
          <div className="col-span-3">Actions</div>
        </div>

        {loading && (
          <div className="text-center py-10 text-muted font-mono">Loading...</div>
        )}

        {articles.map((a) => (
          <div
            key={a.id}
            className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border/50 items-center hover:bg-border/20 transition-colors"
          >
            <div className="col-span-5 text-sm text-text line-clamp-1">{a.title}</div>
            <div className="col-span-2">
              <span className="category-pill bg-accent/10 border-accent/20 text-accent text-[10px]">
                {a.category}
              </span>
            </div>
            <div className="col-span-1">
              <button
                onClick={() => toggle(a.id, "featured", !a.featured)}
                className={`w-6 h-6 rounded font-mono text-xs ${
                  a.featured ? "bg-accent text-bg" : "bg-border text-muted"
                }`}
              >
                ★
              </button>
            </div>
            <div className="col-span-1">
              <button
                onClick={() => toggle(a.id, "approved", !a.approved)}
                className={`w-6 h-6 rounded font-mono text-xs ${
                  a.approved ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                {a.approved ? "✓" : "✗"}
              </button>
            </div>
            <div className="col-span-3 flex items-center gap-2">
              <a
                href={`/news/${a.id}`}
                target="_blank"
                className="text-xs text-muted hover:text-accent font-mono transition-colors"
              >
                View
              </a>
              <button
                onClick={() => deleteArticle(a.id)}
                className="text-xs text-red-400/60 hover:text-red-400 font-mono transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
