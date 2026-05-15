// components/Ticker.tsx
"use client";
import { useEffect, useState } from "react";

const STATIC_TICKERS = [
  { name: "BTC", price: "$—", change: "..." },
  { name: "ETH", price: "$—", change: "..." },
  { name: "BNB", price: "$—", change: "..." },
  { name: "SOL", price: "$—", change: "..." },
  { name: "DOGE", price: "$—", change: "..." },
  { name: "XRP", price: "$—", change: "..." },
  { name: "ADA", price: "$—", change: "..." },
  { name: "AVAX", price: "$—", change: "..." },
];

interface TickerItem {
  name: string;
  price: string;
  change: string;
  up?: boolean;
}

export default function Ticker() {
  const [tickers, setTickers] = useState<TickerItem[]>(STATIC_TICKERS);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,dogecoin,ripple,cardano,avalanche-2&order=market_cap_desc&per_page=8&sparkline=false",
          { next: { revalidate: 60 } }
        );
        if (!res.ok) return;
        const data = await res.json();
        setTickers(
          data.map((c: { symbol: string; current_price: number; price_change_percentage_24h: number }) => ({
            name: c.symbol.toUpperCase(),
            price: "$" + c.current_price.toLocaleString(),
            change: (c.price_change_percentage_24h >= 0 ? "+" : "") + c.price_change_percentage_24h.toFixed(2) + "%",
            up: c.price_change_percentage_24h >= 0,
          }))
        );
      } catch {
        // silently use static fallback
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const doubled = [...tickers, ...tickers];

  return (
    <div className="bg-surface border-b border-border ticker-wrapper py-1.5">
      <div className="ticker-track">
        {doubled.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-6 text-xs font-mono whitespace-nowrap">
            <span className="text-muted font-500">{t.name}</span>
            <span className="text-text">{t.price}</span>
            <span className={t.up === undefined ? "text-muted" : t.up ? "text-green-400" : "text-red-400"}>
              {t.change}
            </span>
            <span className="text-border ml-2">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
