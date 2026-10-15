"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import GemIcon, { cutForGem, emblemForGem, GEM_RARITY } from "@/components/gems/GemIcon";
import { stoneForGem, stoneRgb } from "@/lib/gem-stones";
import { RARITY_LABEL, setFavouriteGem, type GemDefinition, type GemRarity } from "@/lib/gems";
import { clearReveal, getRevealQueue, subscribeReveal } from "@/lib/gem-reveal";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import styles from "./GemReveal.module.css";

/**
 * Mounts anywhere; watches the reveal queue and shows a full-screen "new gem"
 * reveal, one gem at a time. The gem is already persisted before it appears.
 * The moment is scaled by rarity: a common gem pops straight in, rare and above
 * charge up as an orb first, and epic/legendary gems rise in a loot beam of
 * their rarity colour. The gem itself is drawn as its real stone.
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
const PARTICLES = [10, 18, 28, 40, 56];
const SPIN_SECS = [0, 18, 15, 12, 9];
/** Charge-up before the gem appears, in ms; common and uncommon skip it. */
const CHARGE_MS = [0, 0, 700, 1000, 1400];

type Phase = "charge" | "burst" | "shown";

const EARNED_VERBS: Record<string, string> = {
  complete: "completing", earn: "earning", pass: "passing", reach: "reaching", unlock: "unlocking", collect: "collecting",
};

/** "Complete 100 lessons" → "completing 100 lessons", for "Earned for …". */
function earnedFor(description: string) {
  return description.replace(/^(\w+) /, (match, verb: string) => {
    const ing = EARNED_VERBS[verb.toLowerCase()];
    return ing ? `${ing} ` : match;
  });
}

const EMPTY_QUEUE: GemDefinition[] = [];
const getEmptyQueue = () => EMPTY_QUEUE;

function hexToRgbTriple(hex: string) {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

function makeConverge(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 110 + Math.random() * 160;
    return {
      i,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 0.4,
      dur: 0.5 + Math.random() * 0.5,
    };
  });
}

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
  // Reading the queue as an external store also catches gems queued before this mounted.
  const queue = useSyncExternalStore(subscribeReveal, getRevealQueue, getEmptyQueue);
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (queue.length === 0 && idx !== 0) setIdx(0);
  }, [queue.length, idx]);

  const gem = queue[idx];
  if (!gem) return null;
  const isDemo = !student?.studentId || student.studentId === "demo-preview";

  function advance() {
    if (idx < queue.length - 1) setIdx(idx + 1);
    else {
      clearReveal();
      setIdx(0);
    }
  }
  async function display() {
    if (!student?.studentId || isDemo || busy || !gem) return;
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
    <GemReveal
      key={`${gem.id}-${idx}`}
      gem={gem}
      position={idx}
      total={queue.length}
      canDisplay={!isDemo}
      busy={busy}
      onDisplay={display}
      onVault={() => { clearReveal(); setIdx(0); router.push("/gem-vault"); }}
      onNext={advance}
    />
  );
}

function GemReveal({ gem, position, total, canDisplay, busy, onDisplay, onVault, onNext }: {
  gem: GemDefinition;
  position: number;
  total: number;
  canDisplay: boolean;
  busy: boolean;
  onDisplay: () => void;
  onVault: () => void;
  onNext: () => void;
}) {
  const tier = TIER[gem.rarity];
  const rarity = GEM_RARITY[gem.rarity];
  const stone = stoneForGem(gem);
  const stoneTriple = stone ? stoneRgb(stone) : hexToRgbTriple(rarity.mid);
  const [phase, setPhase] = useState<Phase>(CHARGE_MS[tier] ? "charge" : "burst");
  const converge = useMemo(() => makeConverge(PARTICLES[tier]), [tier]);

  useEffect(() => {
    if (phase === "shown") return;
    const reduced = prefersReducedMotion();
    const timeout = setTimeout(
      () => setPhase(reduced ? "shown" : phase === "charge" ? "burst" : "shown"),
      reduced ? 0 : phase === "charge" ? CHARGE_MS[tier] : 650,
    );
    return () => clearTimeout(timeout);
  }, [phase, tier]);

  const vars = {
    ["--stone-rgb" as string]: stoneTriple,
    ["--rarity" as string]: rarity.mid,
    ["--spin" as string]: `${SPIN_SECS[tier] || 20}s`,
    ["--charge" as string]: `${CHARGE_MS[tier]}ms`,
  } as CSSProperties;
  const gemVisible = phase !== "charge";
  const shown = phase === "shown";
  // Stable so the one-shot sparkle burst does not replay when the text appears.
  const sparkColors = useMemo(() => [`rgb(${stoneTriple})`, rarity.light, "#ffffff"], [stoneTriple, rarity.light]);

  return (
    <div className={styles.root} style={vars} role="dialog" aria-modal="true" aria-label={`New gem: ${gem.name}`}>
      <div className={styles.backdrop} onClick={() => (shown ? onNext() : setPhase("shown"))} />
      {phase === "burst" && tier >= 2 ? <div className={styles.flash} aria-hidden="true" /> : null}

      <div className={`${styles.layout} pointer-events-none`}>
        <div className={styles.stage}>
          {gemVisible && tier >= 1 ? <div className={styles.rays} aria-hidden="true" /> : null}
          {gemVisible && tier >= 3 ? <div className={styles.beam} aria-hidden="true" /> : null}
          {gemVisible ? <div className={styles.pedestal} aria-hidden="true" /> : null}

          {phase === "charge" ? (
            <>
              <div className={styles.orb} aria-hidden="true" />
              <div className={styles.particles} aria-hidden="true">
                {converge.map((p) => (
                  <span
                    key={p.i}
                    className={styles.particle}
                    style={{
                      width: p.size,
                      height: p.size,
                      ["--p-x" as string]: `${p.x}px`,
                      ["--p-y" as string]: `${p.y}px`,
                      ["--p-delay" as string]: `${p.delay}s`,
                      ["--p-dur" as string]: `${p.dur}s`,
                      ["--p-color" as string]: p.i % 3 ? `rgb(${stoneTriple})` : "#ffffff",
                    }}
                  />
                ))}
              </div>
            </>
          ) : null}

          {gemVisible ? (
            <>
              {phase === "burst" && tier >= 1 ? <div className={styles.shockwave} aria-hidden="true" /> : null}
              <SparkleBurst colors={sparkColors} count={PARTICLES[tier]} />
              <div className={styles.gemIn}>
                <div className={styles.gemFloat} style={{ filter: `drop-shadow(0 10px 34px rgb(${stoneTriple} / 0.7))` }}>
                  <GemIcon rarity={gem.rarity} cut={cutForGem(gem.id, gem.rarity)} emblem={emblemForGem(gem.realm_id, gem.milestone_type)} stone={stone} size={168} />
                  {tier >= 1 ? <div className={styles.glint} aria-hidden="true" /> : null}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {shown ? (
          <div className="pointer-events-auto relative z-10 mt-4 flex w-full max-w-sm flex-col items-center text-center">
            <p className={`${styles.tag} ${styles.rise1}`}>{RARITY_LABEL[gem.rarity].toUpperCase()} GEM</p>
            <h2 className={`${styles.rise1} mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl`}>{gem.name}</h2>
            {stone ? <p className={`${styles.rise2} mt-1 text-sm font-semibold text-white/55`}>{stone.label}</p> : null}
            <p className={`${styles.rise2} mt-3 text-sm font-semibold text-white/70`}>
              Earned for {earnedFor(gem.description)}
            </p>

            <div className={`${styles.rise3} mt-6 flex w-full flex-col gap-2`}>
              {canDisplay ? (
                <button type="button" onClick={onDisplay} disabled={busy} className="min-h-11 rounded-xl px-4 py-2.5 text-sm font-black text-slate-950 transition hover:brightness-110 disabled:opacity-60" style={{ background: `linear-gradient(135deg, rgb(${stoneTriple}), rgb(${stoneTriple} / 0.8))`, boxShadow: `0 6px 24px rgb(${stoneTriple} / 0.45)` }}>
                  Display in My Home
                </button>
              ) : null}
              <div className="flex gap-2">
                <button type="button" onClick={onVault} className="min-h-11 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-black text-white/85 transition hover:bg-white/10">View Gem Vault</button>
                <button type="button" onClick={onNext} className="min-h-11 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-black text-white/85 transition hover:bg-white/10">
                  {position < total - 1 ? `Next (${total - position - 1})` : "Continue"}
                </button>
              </div>
            </div>

            {total > 1 ? (
              <div className={`${styles.rise3} mt-4 flex gap-1.5`} aria-label={`Gem ${position + 1} of ${total}`}>
                {Array.from({ length: total }, (_, i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: i === position ? rarity.mid : "rgba(255,255,255,0.25)" }} />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {!shown ? (
        <button type="button" className={styles.skipHint} onClick={() => setPhase("shown")}>
          Tap to skip
        </button>
      ) : null}
    </div>
  );
}
