"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import GemIcon, { GEM_RARITY } from "@/components/gems/GemIcon";
import { RARITY_LABEL, setFavouriteGem } from "@/lib/gems";
import { clearReveal, getRevealQueue, subscribeReveal } from "@/lib/gem-reveal";
import { getActiveStudentProfile } from "@/lib/studentIdentity";

/**
 * Mounts anywhere; watches the reveal queue and shows a premium "new gem"
 * reveal, one gem at a time. The gem is already persisted before it appears.
 * Respects reduced-motion.
 */
export default function GemRevealHost() {
  const router = useRouter();
  const student = useMemo(() => getActiveStudentProfile(), []);
  const [queue, setQueue] = useState(getRevealQueue());
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeReveal(() => setQueue(getRevealQueue())), []);
  useEffect(() => {
    if (queue.length === 0 && idx !== 0) setIdx(0);
  }, [queue.length, idx]);

  const gem = queue[idx];
  if (!gem) return null;
  const c = GEM_RARITY[gem.rarity];
  const isDemo = !student?.studentId || student.studentId === "demo-preview";

  function advance() {
    if (idx < queue.length - 1) setIdx(idx + 1);
    else {
      clearReveal();
      setIdx(0);
    }
  }
  async function display() {
    if (!student?.studentId || isDemo || busy) return;
    setBusy(true);
    try {
      await setFavouriteGem(student.studentId, gem.id);
    } catch {
      /* non-blocking */
    } finally {
      setBusy(false);
      advance();
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`New gem: ${gem.name}`}>
      <div className="lul-reveal-dim absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={advance} />
      <div className="lul-reveal-card relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/12 bg-[linear-gradient(#12151d,#0b0d13)] p-7 text-center shadow-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40" style={{ background: `radial-gradient(circle at 50% 0%, ${c.mid}44, transparent 70%)` }} aria-hidden="true" />
        <p className="relative flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-amber-300">
          <Sparkles className="h-4 w-4" /> New Gem Discovered
        </p>
        <div className="lul-reveal-gem relative mx-auto mt-5 flex items-center justify-center" style={{ filter: `drop-shadow(0 8px 30px ${c.mid})` }}>
          <GemIcon rarity={gem.rarity} size={132} />
        </div>
        <h2 className="mt-5 text-2xl font-black text-white">{gem.name}</h2>
        <span className="mt-2 inline-block rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide" style={{ color: c.light, background: `${c.mid}22` }}>{RARITY_LABEL[gem.rarity]}</span>
        <p className="mt-3 text-sm font-semibold text-white/65">Earned for {gem.description.replace(/^Complete |^Earn |^Pass |^Reach |^Unlock |^Collect /i, (m) => m.toLowerCase())}</p>

        <div className="mt-6 flex flex-col gap-2">
          {!isDemo ? (
            <button type="button" onClick={display} disabled={busy} className="rounded-lg bg-white px-4 py-2.5 text-sm font-black text-slate-900 transition hover:bg-white/90 disabled:opacity-60">Display in My Home</button>
          ) : null}
          <div className="flex gap-2">
            <button type="button" onClick={() => { clearReveal(); setIdx(0); router.push("/gem-vault"); }} className="flex-1 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-black text-white/85 transition hover:bg-white/10">View Gem Vault</button>
            <button type="button" onClick={advance} className="flex-1 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-black text-white/85 transition hover:bg-white/10">
              {idx < queue.length - 1 ? `Next (${queue.length - idx - 1})` : "Continue"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes lul-reveal-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes lul-reveal-pop {
          0% { opacity: 0; transform: translateY(10px) scale(0.9) }
          100% { opacity: 1; transform: translateY(0) scale(1) }
        }
        @keyframes lul-reveal-gem-in {
          0% { opacity: 0; transform: scale(0.4) rotate(-18deg) }
          70% { opacity: 1; transform: scale(1.08) rotate(3deg) }
          100% { transform: scale(1) rotate(0) }
        }
        .lul-reveal-dim { animation: lul-reveal-fade .25s ease both }
        .lul-reveal-card { animation: lul-reveal-pop .4s cubic-bezier(.34,1.56,.64,1) both }
        .lul-reveal-gem { animation: lul-reveal-gem-in .6s cubic-bezier(.34,1.56,.64,1) both }
        @media (prefers-reduced-motion: reduce) {
          .lul-reveal-dim, .lul-reveal-card, .lul-reveal-gem { animation: none !important }
        }
      `}</style>
    </div>
  );
}
