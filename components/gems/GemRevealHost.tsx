"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import GemIcon, { GEM_RARITY } from "@/components/gems/GemIcon";
import { RARITY_LABEL, setFavouriteGem, type GemRarity } from "@/lib/gems";
import { clearReveal, getRevealQueue, subscribeReveal } from "@/lib/gem-reveal";
import { getActiveStudentProfile } from "@/lib/studentIdentity";

/**
 * Mounts anywhere; watches the reveal queue and shows a premium "new gem"
 * reveal, one gem at a time. The gem is already persisted before it appears.
 * The reveal moment is scaled by rarity — a common gem lands quietly, a
 * legendary gets a full light-burst, radiating rays and a sparkle shower.
 * Everything is CSS/Canvas, sound-free, and respects reduced-motion.
 */

// 0 = quiet, 4 = legendary spectacle. Drives every rarity-scaled effect below.
const TIER: Record<GemRarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};
const PARTICLES = [7, 14, 22, 32, 46];
const SPIN_SECS = [0, 16, 13, 11, 9];

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** One-shot Canvas sparkle burst from the gem's centre. Fades out and stops. */
function SparkleBurst({ colors, count }: { colors: string[]; count: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || prefersReducedMotion()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    const cx = W / 2;
    const cy = H / 2;
    const parts = Array.from({ length: count }, () => {
      const a = Math.random() * Math.PI * 2;
      const sp = 1.6 + Math.random() * 4.4;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 1.2,
        life: 1,
        decay: 0.007 + Math.random() * 0.013,
        r: 1.2 + Math.random() * 2.8,
        col: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.24,
      };
    });
    let raf = 0;
    const start = performance.now();
    const spark = (r: number) => {
      // four-point sparkle
      ctx.beginPath();
      ctx.moveTo(0, -r * 2);
      ctx.lineTo(r * 0.4, -r * 0.4);
      ctx.lineTo(r * 2, 0);
      ctx.lineTo(r * 0.4, r * 0.4);
      ctx.lineTo(0, r * 2);
      ctx.lineTo(-r * 0.4, r * 0.4);
      ctx.lineTo(-r * 2, 0);
      ctx.lineTo(-r * 0.4, -r * 0.4);
      ctx.closePath();
      ctx.fill();
    };
    const tick = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of parts) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.045;
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.life -= p.decay;
        p.rot += p.vrot;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.col;
        ctx.shadowColor = p.col;
        ctx.shadowBlur = 6;
        spark(p.r);
        ctx.restore();
      }
      if (alive && t - start < 2400) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [colors, count]);
  return <canvas ref={ref} className="pointer-events-none absolute -inset-10 h-[calc(100%+80px)] w-[calc(100%+80px)]" aria-hidden="true" />;
}

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
  const tier = TIER[gem.rarity];
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
      <div
        key={gem.id}
        className="lul-reveal-card relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/12 bg-[linear-gradient(#12151d,#0b0d13)] p-7 text-center shadow-2xl"
        style={{ boxShadow: tier >= 3 ? `0 0 60px -20px ${c.mid}, 0 25px 50px -12px rgba(0,0,0,0.6)` : undefined }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40" style={{ background: `radial-gradient(circle at 50% 0%, ${c.mid}${tier >= 3 ? "55" : "44"}, transparent 70%)` }} aria-hidden="true" />
        <p className="relative flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-amber-300">
          <Sparkles className="h-4 w-4" /> New Gem Discovered
        </p>

        {/* Gem stage: rays + flash + sparkle burst + the gem */}
        <div className="relative mx-auto mt-5 flex h-40 w-40 items-center justify-center">
          {tier >= 1 ? (
            <div
              className="lul-reveal-rays pointer-events-none absolute inset-[-24px]"
              style={{
                background: `repeating-conic-gradient(from 0deg, ${c.light}00 0deg, ${c.mid}55 3deg, ${c.light}00 7deg, ${c.light}00 15deg)`,
                WebkitMaskImage: "radial-gradient(circle, #000 12%, transparent 62%)",
                maskImage: "radial-gradient(circle, #000 12%, transparent 62%)",
                opacity: 0.25 + tier * 0.12,
                animationDuration: `${SPIN_SECS[tier]}s`,
              }}
              aria-hidden="true"
            />
          ) : null}
          {tier >= 1 ? (
            <div
              className="lul-reveal-flash pointer-events-none absolute h-24 w-24 rounded-full"
              style={{ background: `radial-gradient(circle, #ffffff 0%, ${c.light} 30%, transparent 70%)` }}
              aria-hidden="true"
            />
          ) : null}
          <SparkleBurst colors={[c.light, c.mid, "#ffffff"]} count={PARTICLES[tier]} />
          <div className="lul-reveal-gem relative" style={{ filter: `drop-shadow(0 8px 30px ${c.mid})` }}>
            <GemIcon rarity={gem.rarity} size={132} />
            {tier >= 2 ? <div className="lul-reveal-shimmer pointer-events-none absolute inset-0" aria-hidden="true" /> : null}
          </div>
        </div>

        <h2 className="lul-reveal-t1 mt-5 text-2xl font-black text-white">{gem.name}</h2>
        <span className="lul-reveal-t2 mt-2 inline-block rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide" style={{ color: c.light, background: `${c.mid}22` }}>{RARITY_LABEL[gem.rarity]}</span>
        <p className="lul-reveal-t3 mt-3 text-sm font-semibold text-white/65">Earned for {gem.description.replace(/^Complete |^Earn |^Pass |^Reach |^Unlock |^Collect /i, (m) => m.toLowerCase())}</p>

        <div className="lul-reveal-t3 mt-6 flex flex-col gap-2">
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
          0% { opacity: 0; transform: scale(0.35) rotate(-20deg) }
          65% { opacity: 1; transform: scale(1.12) rotate(4deg) }
          100% { transform: scale(1) rotate(0) }
        }
        @keyframes lul-reveal-rays-spin { to { transform: rotate(360deg) } }
        @keyframes lul-reveal-flash-out {
          0% { opacity: 0; transform: scale(0.2) }
          25% { opacity: 0.95 }
          100% { opacity: 0; transform: scale(2.6) }
        }
        @keyframes lul-reveal-shimmer-sweep {
          0%, 55% { opacity: 0; transform: translateX(-140%) skewX(-18deg) }
          70% { opacity: 0.9 }
          100% { opacity: 0; transform: translateX(140%) skewX(-18deg) }
        }
        @keyframes lul-reveal-rise {
          from { opacity: 0; transform: translateY(8px) }
          to { opacity: 1; transform: translateY(0) }
        }
        .lul-reveal-dim { animation: lul-reveal-fade .25s ease both }
        .lul-reveal-card { animation: lul-reveal-pop .4s cubic-bezier(.34,1.56,.64,1) both }
        .lul-reveal-gem { animation: lul-reveal-gem-in .6s cubic-bezier(.34,1.56,.64,1) both }
        .lul-reveal-rays { animation: lul-reveal-rays-spin linear infinite }
        .lul-reveal-flash { animation: lul-reveal-flash-out .7s ease-out both }
        .lul-reveal-shimmer {
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.85) 50%, transparent 60%);
          animation: lul-reveal-shimmer-sweep 1.6s ease-in-out .5s both;
        }
        .lul-reveal-t1 { animation: lul-reveal-rise .4s ease both .35s }
        .lul-reveal-t2 { animation: lul-reveal-rise .4s ease both .48s }
        .lul-reveal-t3 { animation: lul-reveal-rise .4s ease both .6s }
        @media (prefers-reduced-motion: reduce) {
          .lul-reveal-dim, .lul-reveal-card, .lul-reveal-gem, .lul-reveal-rays,
          .lul-reveal-flash, .lul-reveal-shimmer, .lul-reveal-t1, .lul-reveal-t2, .lul-reveal-t3 {
            animation: none !important
          }
          .lul-reveal-flash, .lul-reveal-shimmer { display: none }
          .lul-reveal-rays { opacity: 0.18 !important }
        }
      `}</style>
    </div>
  );
}
