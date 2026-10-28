"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";

/** Shared frame for the Chronorok games: back button, score card, start and
 *  game-over cards, and per-device best scores. No XP: these are just for fun. */

export function useBest(game: string) {
  const key = `lul:chronorok:${game}:best`;
  const [best, setBest] = useState(0);
  useEffect(() => {
    try { queueMicrotask(() => setBest(Number(localStorage.getItem(key) ?? 0) || 0)); } catch { /* per device only */ }
  }, [key]);
  /** Records a score; returns true when it beats the best. lowerIsBetter for times and move counts. */
  function record(score: number, lowerIsBetter = false) {
    const better = best === 0 || (lowerIsBetter ? score < best : score > best);
    if (better) {
      setBest(score);
      try { localStorage.setItem(key, String(score)); } catch { /* per device only */ }
    }
    return better;
  }
  return { best, record };
}

export function GameHeader({ backHref, title, accent, value, sub }: { backHref: string; title: string; accent: string; value: string; sub?: string }) {
  const router = useRouter();
  return (
    <header className="pointer-events-none absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-3">
      <button type="button" onClick={() => router.push(backHref)} className="chronoGlass pointer-events-auto flex h-12 items-center gap-2 rounded-full px-5 font-display text-[13px] font-black tracking-[0.05em]"><ArrowLeft className="h-4 w-4" />CHRONOROK</button>
      <div className="chronoGlass rounded-2xl px-6 pb-2 pt-1.5 text-center">
        <p className="font-display text-[11px] font-black tracking-[0.16em]" style={{ color: accent }}>{title}</p>
        <p className="font-display text-4xl font-black leading-tight">{value}</p>
        {sub ? <p className="text-[13px] font-bold text-[#e8dcc8]">{sub}</p> : null}
      </div>
      <span className="w-[120px]" />
    </header>
  );
}

export function GameCard({ kicker, kickerColour, title, body, action, onAction, extra }: { kicker: string; kickerColour: string; title: string; body: React.ReactNode; action: string; onAction: () => void; extra?: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-black/45 p-6">
      <div className="chronoGlass w-[min(480px,92vw)] rounded-3xl p-7 text-center">
        <p className="font-display text-xs font-black tracking-[0.2em]" style={{ color: kickerColour }}>{kicker}</p>
        <h1 className="chronoTitle mt-1 text-4xl">{title}</h1>
        <div className="mt-2 font-bold text-[#f3ead9]">{body}</div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onAction} className="inline-flex h-14 items-center gap-2 rounded-full bg-white px-8 font-display text-[15px] font-black text-[#16121f]">
            {action.startsWith("↻") ? <RotateCcw className="h-4 w-4" /> : null}{action.replace("↻ ", "")}<kbd className="ml-1">Space</kbd>
          </button>
          {extra}
        </div>
      </div>
    </div>
  );
}

export const GAME_STYLES = `
  .chronoGame .chronoGlass{background:rgba(22,14,8,.55);border:1px solid rgba(255,230,180,.28);box-shadow:0 10px 30px rgba(0,0,0,.35);backdrop-filter:blur(12px)}
  .chronoGame .chronoTitle{font-family:var(--font-display);font-weight:900;letter-spacing:.08em;color:#ffe2a0;text-shadow:0 2px 14px rgba(245,180,50,.6)}
  .chronoGame kbd{padding:1px 7px;border-radius:6px;background:rgba(255,255,255,.18);font:800 12px var(--font-sans)}
  @media (hover:hover) and (pointer:fine){.chronoGame .chronoTouch{display:none}}
`;
