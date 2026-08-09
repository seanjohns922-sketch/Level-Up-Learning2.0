"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Shield, Sparkles, Lightbulb, SkipForward } from "lucide-react";
import type { Villain } from "@/lib/brain-break";
import { awardBrainBreakXp, BRAIN_BREAK_XP_CAP } from "@/lib/brain-break-xp";

/** Every completed break rewards at least this much (participation), capped above. */
const BRAIN_BREAK_XP_FLOOR = 5;

/**
 * Full-screen mid-lesson brain break. A villain swoops in, the student plays a
 * quick 1-touch game to defeat it, then returns to the lesson. The lesson clock
 * is paused by the host engine while this is open.
 *
 * Phases: intro (villain + taunt) → play (mini-game) → victory (defeat + tip).
 * Always winnable — if the timer runs out the villain is defeated anyway.
 *
 * Shared arcade mechanics, chosen per break by `villain.game` (a band-appropriate
 * game dressed with a villain — see pickBreak): whack, slash (true swipe),
 * keepuppy, duel, dodge, copyme, trace, popwall and
 * trickshot. Count games award "+1 XP" per hit; completing any
 * break credits a small capped reward to the Explorer wallet.
 */

type Phase = "intro" | "play" | "victory";

export default function BrainBreak({
  villain,
  onComplete,
  sourceKey,
}: {
  villain: Villain;
  onComplete: () => void;
  /** Stable per-lesson-break key so the capped XP reward is idempotent (no farming). */
  sourceKey?: string;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const doneRef = useRef(false);
  // "+1 XP" reward pops at each hit — motivational, separate from the graded score.
  const [xpFloats, setXpFloats] = useState<{ id: number; xPct: number; yPct: number }[]>([]);
  const xpIdRef = useRef(0);
  const [earnedXp, setEarnedXp] = useState(0);

  const isCountGame = villain.game === "whack" || villain.game === "slash" || villain.game === "keepuppy" || villain.game === "popwall" || villain.game === "trickshot" || villain.game === "brickbuster" || villain.game === "glowsnake" || villain.game === "gobbleglow" || villain.game === "bumperblast";

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    // Capped, farm-safe reward: your hits this break, floored so every break pays
    // out and capped so it can't be farmed. Credited to the Explorer wallet only.
    const earned = Math.min(BRAIN_BREAK_XP_CAP, Math.max(BRAIN_BREAK_XP_FLOOR, scoreRef.current));
    setEarnedXp(earned);
    if (sourceKey) void awardBrainBreakXp({ xp: earned, sourceKey });
    setPhase("victory");
    try {
      window.dispatchEvent(new CustomEvent("lul:villain-defeated", { detail: { id: villain.id, xp: earned } }));
    } catch {}
    window.setTimeout(onComplete, 2600);
  }, [onComplete, villain.id, sourceKey]);

  // Skip: bail straight back to the lesson. No XP is awarded (you didn't play),
  // which also keeps the reward farm-safe.
  const skip = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  }, [onComplete]);

  const onHit = useCallback((pos?: { xPct: number; yPct: number }) => {
    scoreRef.current += 1;
    setScore(scoreRef.current);
    xpIdRef.current += 1;
    const id = xpIdRef.current;
    const p = pos ?? { xPct: 50, yPct: 32 };
    setXpFloats((f) => [...f, { id, xPct: p.xPct, yPct: p.yPct }]);
    window.setTimeout(() => setXpFloats((f) => f.filter((x) => x.id !== id)), 850);
    if (scoreRef.current >= villain.winCount) finish();
  }, [finish, villain.winCount]);

  // intro → play
  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent("lul:villain-appeared", { detail: { id: villain.id } }));
    } catch {}
    const t = window.setTimeout(() => setPhase("play"), 2200);
    return () => window.clearTimeout(t);
  }, [villain.id]);

  // safety auto-victory
  useEffect(() => {
    if (phase !== "play") return;
    const t = window.setTimeout(finish, villain.durationSec * 1000);
    return () => window.clearTimeout(t);
  }, [phase, villain.durationSec, finish]);

  const progress = Math.min(100, Math.round((score / villain.winCount) * 100));

  return (
    <div
      className="fixed inset-0 z-[70] overflow-hidden select-none"
      style={{
        background: "radial-gradient(ellipse 90% 90% at 50% 45%, rgba(8,6,20,0.86) 0%, rgba(4,2,12,0.96) 100%)",
        backdropFilter: "blur(3px)",
        touchAction: "none",
      }}
    >
      <style jsx global>{`
        @keyframes bbVillainIn {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.3) rotate(-12deg); filter: blur(8px); }
          40% { opacity: 1; transform: translate(-50%, -50%) scale(1.12) rotate(4deg); filter: blur(0); }
          60% { transform: translate(-50%, -50%) scale(1) rotate(-2deg); }
          100% { transform: translate(-50%, -50%) scale(1.04) rotate(0deg); }
        }
        @keyframes bbVillainFloat {
          0%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(-2deg); }
          50% { transform: translate(-50%, -50%) translateY(-10px) rotate(2deg); }
        }
        @keyframes bbTextIn {
          0% { opacity: 0; transform: translate(-50%, 0) translateY(14px); }
          100% { opacity: 1; transform: translate(-50%, 0) translateY(0); }
        }
        @keyframes bbXpFloat {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
          25% { opacity: 1; transform: translate(-50%, -90%) scale(1.15); }
          100% { opacity: 0; transform: translate(-50%, -220%) scale(1); }
        }
        @keyframes bbWhackIn {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
          30% { opacity: 1; transform: translate(-50%, -50%) scale(1.18); }
          50% { transform: translate(-50%, -50%) scale(1); }
          82% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
        }
        @keyframes bbSlashArc {
          0% { opacity: 0; transform: translate(-50%, 0) translate(0, 120%) scale(0.7); }
          12% { opacity: 1; }
          50% { transform: translate(-50%, 0) translate(var(--drift), -55vh) scale(1.1); }
          88% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, 0) translate(calc(var(--drift) * 1.6), 10%) scale(0.8); }
        }
        @keyframes bbSlashFx {
          0% { opacity: 0.9; transform: translate(-50%, -50%) scale(0.4) rotate(0deg); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.6) rotate(35deg); }
        }
        @keyframes bbVictoryBurst {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(3); }
        }
        @keyframes bbTapPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes bbPulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.35); opacity: 1; }
        }
      `}</style>

      {/* Skip — bail back to the lesson (no XP). Hidden once you've won. */}
      {phase !== "victory" && (
        <button
          type="button"
          onClick={skip}
          className="absolute right-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 font-sans text-xs font-bold text-white/80 backdrop-blur transition hover:border-white/40 hover:bg-white/20 hover:text-white sm:right-4 sm:top-4"
          style={{ touchAction: "manipulation" }}
        >
          Skip <SkipForward className="h-3.5 w-3.5" />
        </button>
      )}

      {/* ── INTRO ── */}
      {phase === "intro" && (
        <>
          {/* Frame the stakes: a villain is stealing your XP — fight it off.
              (Also makes clear it's a quick break, not a maths test.) */}
          <div
            className="absolute left-1/2 top-[12%] -translate-x-1/2 text-center"
            style={{ animation: "bbTextIn 0.4s ease-out forwards", width: "min(92vw, 620px)" }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 font-mono font-black uppercase tracking-[0.2em] text-white/90"
              style={{ fontSize: "clamp(0.8rem, 2.2vw, 1.1rem)" }}
            >
              <Shield className="h-4 w-4" /> Brain Break — Defend Your XP!
            </div>
            <div className="mt-1.5 font-sans font-bold text-white/60" style={{ fontSize: "clamp(0.75rem, 1.7vw, 0.95rem)" }}>
              {villain.name} wants to steal your XP. Tap fast to fight it off!
            </div>
          </div>
          <div
            className="absolute left-1/2 top-[38%]"
            style={{
              fontSize: "clamp(5rem, 18vw, 11rem)",
              lineHeight: 1,
              filter: `drop-shadow(0 0 30px ${villain.glow}) drop-shadow(0 8px 18px rgba(0,0,0,0.7))`,
              animation: "bbVillainIn 0.9s cubic-bezier(0.22,1,0.36,1) forwards, bbVillainFloat 3s ease-in-out 0.9s infinite",
            }}
          >
            {villain.face}
          </div>
          <div
            className="absolute left-1/2 top-[60%] text-center"
            style={{ animation: "bbTextIn 0.5s ease-out 0.5s forwards", opacity: 0, width: "min(90vw, 620px)" }}
          >
            <div
              className="font-mono font-black uppercase"
              style={{ fontSize: "clamp(1.4rem, 5vw, 2.6rem)", letterSpacing: "0.1em", color: villain.color, textShadow: `0 0 22px ${villain.glow}` }}
            >
              {villain.name}
            </div>
            <div className="mt-2 font-sans font-bold text-white/90" style={{ fontSize: "clamp(0.95rem, 2.4vw, 1.3rem)" }}>
              “{villain.taunt}”
            </div>
            <div className="mt-4 font-mono font-bold uppercase tracking-[0.24em] text-white/60" style={{ fontSize: "clamp(0.65rem, 1.4vw, 0.85rem)" }}>
              Tap to defend your XP!
            </div>
          </div>
        </>
      )}

      {/* ── PLAY ── */}
      {phase === "play" && (
        <>
          {/* Top HUD */}
          <div className="absolute inset-x-0 top-0 px-5 pt-5 z-10">
            <div className="mx-auto flex max-w-2xl items-center gap-3">
              <span style={{ fontSize: "2rem", filter: `drop-shadow(0 0 10px ${villain.glow})` }}>{villain.face}</span>
              <div className="flex-1">
                <div className="font-mono font-black uppercase tracking-[0.16em]" style={{ fontSize: "clamp(0.7rem, 1.6vw, 0.95rem)", color: villain.color }}>
                  {villain.name}
                </div>
                {isCountGame && (
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${villain.color}, #fff8e8)`, boxShadow: `0 0 10px ${villain.glow}` }}
                    />
                  </div>
                )}
              </div>
              {isCountGame && (
                <div className="font-mono font-black tabular-nums text-white" style={{ fontSize: "clamp(1rem, 3vw, 1.6rem)", textShadow: `0 0 10px ${villain.glow}` }}>
                  {score}/{villain.winCount}
                </div>
              )}
            </div>
            <div className="mt-2 inline-flex items-center justify-center gap-1.5 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
              <Shield className="h-3 w-3" /> Defend your XP · {playHint(villain.game)}
            </div>
          </div>

          {villain.game === "whack" && <WhackGame villain={villain} onHit={onHit} />}
          {villain.game === "slash" && <SlashGame villain={villain} onHit={onHit} />}
          {villain.game === "keepuppy" && <KeepUppyGame villain={villain} onHit={onHit} />}
          {villain.game === "duel" && <DuelGame villain={villain} onWin={finish} />}
          {villain.game === "dodge" && <DodgeGame villain={villain} onWin={finish} />}
          {villain.game === "copyme" && <CopyMeGame villain={villain} onWin={finish} />}
          {villain.game === "trace" && <TraceGame villain={villain} onWin={finish} />}
          {villain.game === "popwall" && <PopWallGame villain={villain} onHit={onHit} />}
          {villain.game === "trickshot" && <TrickShotGame villain={villain} onHit={onHit} />}
          {villain.game === "brickbuster" && <BrickBusterGame villain={villain} onHit={onHit} />}
          {villain.game === "glowsnake" && <GlowSnakeGame villain={villain} onHit={onHit} />}
          {villain.game === "gobbleglow" && <GobbleGlowGame villain={villain} onHit={onHit} />}
          {villain.game === "bumperblast" && <BumperBlastGame villain={villain} onHit={onHit} />}

          {/* "+1 XP" reward pops at each hit */}
          {xpFloats.map((f) => (
            <div
              key={f.id}
              className="pointer-events-none absolute z-10 font-mono font-black"
              style={{ left: `${f.xPct}%`, top: `${f.yPct}%`, transform: "translate(-50%, -50%)", fontSize: "clamp(0.9rem, 2.6vw, 1.25rem)", color: "#fde047", textShadow: "0 0 12px rgba(250,204,21,0.8), 0 1px 3px rgba(0,0,0,0.6)", animation: "bbXpFloat 0.85s ease-out forwards" }}
            >
              +1 XP
            </div>
          ))}
        </>
      )}

      {/* ── VICTORY ── */}
      {phase === "victory" && (
        <>
          <div
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{ width: 300, height: 300, background: `radial-gradient(circle, ${villain.glow} 0%, transparent 70%)`, animation: "bbVictoryBurst 1s ease-out forwards" }}
          />
          <div className="absolute left-1/2 top-[40%] text-center" style={{ animation: "bbTextIn 0.5s ease-out forwards", width: "min(90vw, 640px)" }}>
            <Sparkles className="mx-auto" style={{ width: "clamp(3.5rem, 12vw, 6rem)", height: "clamp(3.5rem, 12vw, 6rem)" }} />
            <div
              className="mt-3 font-mono font-black uppercase"
              style={{
                fontSize: "clamp(1.4rem, 5vw, 2.6rem)",
                letterSpacing: "0.08em",
                background: "linear-gradient(180deg, #fff8e8 0%, #e8c878 60%, #8b6520 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 20px rgba(200,160,48,0.7))",
              }}
            >
              Defeated!
            </div>
            <div className="mt-2 font-sans font-bold text-white/95" style={{ fontSize: "clamp(1rem, 2.6vw, 1.4rem)" }}>
              {villain.victory}
            </div>
            <div
              className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/15 px-4 py-1.5 font-mono font-black uppercase tracking-[0.16em] text-emerald-100"
              style={{ fontSize: "clamp(0.75rem, 1.8vw, 1rem)" }}
            >
              <span className="inline-flex items-center justify-center gap-1.5"><Shield className="h-4 w-4" /> +{earnedXp} XP earned!</span>
            </div>
            <div
              className="mx-auto mt-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 font-sans font-semibold text-white/80"
              style={{ fontSize: "clamp(0.8rem, 1.8vw, 1rem)", maxWidth: 460 }}
            >
              <span className="inline-flex items-center gap-1.5"><Lightbulb className="h-4 w-4 shrink-0" /> {villain.tip}</span>
            </div>
            <div className="mt-4 font-mono font-bold uppercase tracking-[0.28em] text-white/55" style={{ fontSize: "clamp(0.65rem, 1.4vw, 0.85rem)" }}>
              Back to the adventure…
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function playHint(game: Villain["game"]): string {
  switch (game) {
    case "slash": return "Swipe your blade through them!";
    case "keepuppy": return "Tap to keep it up!";
    case "popwall": return "Tap a matching orb to pop the cluster!";
    case "trickshot": return "Flick the ball into the hoop!";
    case "brickbuster": return "Slide the paddle — smash the wall!";
    case "glowsnake": return "Steer to the orbs — don't cross your trail!";
    case "gobbleglow": return "Munch every dot — dodge the villain!";
    case "bumperblast": return "Tap the flippers — hit the bumpers!";
    case "duel": return "Tap to win the tug-of-war!";
    case "dodge": return "Drag to dodge!";
    case "copyme": return "Watch, then copy!";
    case "trace": return "Trace the glowing path!";
    default: return "Tap them all!";
  }
}

// ── WHACK ───────────────────────────────────────────────────────────────────
function WhackGame({ villain, onHit }: { villain: Villain; onHit: (pos?: { xPct: number; yPct: number }) => void }) {
  const [targets, setTargets] = useState<{ id: number; xPct: number; yPct: number }[]>([]);
  const idRef = useRef(0);
  useEffect(() => {
    const spawn = window.setInterval(() => {
      setTargets((prev) => {
        if (prev.length >= 5) return prev;
        idRef.current += 1;
        const id = idRef.current;
        window.setTimeout(() => setTargets((c) => c.filter((x) => x.id !== id)), 1500);
        return [...prev, { id, xPct: 12 + Math.random() * 76, yPct: 28 + Math.random() * 48 }];
      });
    }, 640);
    return () => window.clearInterval(spawn);
  }, []);
  return (
    <>
      {targets.map((t) => (
        <button
          key={t.id}
          type="button"
          onPointerDown={() => { setTargets((p) => p.filter((x) => x.id !== t.id)); onHit({ xPct: t.xPct, yPct: t.yPct }); }}
          className="absolute"
          style={{
            left: `${t.xPct}%`, top: `${t.yPct}%`, transform: "translate(-50%, -50%)",
            fontSize: "clamp(2.6rem, 8vw, 4rem)", lineHeight: 1,
            filter: `drop-shadow(0 0 16px ${villain.glow})`,
            animation: "bbWhackIn 1500ms ease-in-out forwards", cursor: "pointer",
          }}
        >
          {villain.targetEmoji}
        </button>
      ))}
    </>
  );
}

// ── SLASH (true swipe — drag a blade THROUGH the targets) ───────────────────
function SlashGame({ villain, onHit }: { villain: Villain; onHit: (pos?: { xPct: number; yPct: number }) => void }) {
  const [targets, setTargets] = useState<{ id: number; xPct: number; drift: number; dur: number }[]>([]);
  const [fx, setFx] = useState<{ id: number; xPct: number; yPct: number }[]>([]);
  const [trail, setTrail] = useState<{ id: number; xPct: number; yPct: number }[]>([]);
  const idRef = useRef(0);
  const downRef = useRef(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const elRefs = useRef<Map<number, HTMLElement>>(new Map());
  useEffect(() => {
    const spawn = window.setInterval(() => {
      setTargets((prev) => {
        if (prev.length >= 3) return prev;
        idRef.current += 1;
        const id = idRef.current;
        const dur = 3000 + Math.random() * 800;
        window.setTimeout(() => { setTargets((c) => c.filter((x) => x.id !== id)); elRefs.current.delete(id); }, dur);
        return [...prev, { id, xPct: 12 + Math.random() * 76, drift: (Math.random() - 0.5) * 140, dur }];
      });
    }, 900);
    return () => window.clearInterval(spawn);
  }, []);

  // The blade follows the finger; any target it passes through is sliced.
  function slashAt(clientX: number, clientY: number) {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wr = wrap.getBoundingClientRect();
    const tid = idRef.current * 1000 + Math.round(clientX) + Math.round(clientY);
    setTrail((p) => [...p.slice(-6), { id: tid, xPct: ((clientX - wr.left) / wr.width) * 100, yPct: ((clientY - wr.top) / wr.height) * 100 }]);
    window.setTimeout(() => setTrail((c) => c.filter((t) => t.id !== tid)), 200);
    elRefs.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      if (dx * dx + dy * dy < 46 * 46) {
        elRefs.current.delete(id);
        setTargets((p) => p.filter((x) => x.id !== id));
        const hx = ((cx - wr.left) / wr.width) * 100;
        const hy = ((cy - wr.top) / wr.height) * 100;
        const fxId = 90000 + id;
        setFx((p) => [...p, { id: fxId, xPct: hx, yPct: hy }]);
        window.setTimeout(() => setFx((c) => c.filter((f) => f.id !== fxId)), 400);
        onHit({ xPct: hx, yPct: hy });
      }
    });
  }

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0"
      style={{ touchAction: "none", cursor: "crosshair" }}
      onPointerDown={(e) => { downRef.current = true; slashAt(e.clientX, e.clientY); }}
      onPointerMove={(e) => { if (downRef.current) slashAt(e.clientX, e.clientY); }}
      onPointerUp={() => { downRef.current = false; }}
      onPointerLeave={() => { downRef.current = false; }}
    >
      {targets.map((t) => (
        <button
          key={t.id}
          type="button"
          ref={(el) => { if (el) elRefs.current.set(t.id, el); else elRefs.current.delete(t.id); }}
          className="pointer-events-none absolute bottom-0"
          style={{ left: `${t.xPct}%`, fontSize: "clamp(2.6rem, 8vw, 4rem)", lineHeight: 1, filter: `drop-shadow(0 0 16px ${villain.glow})`, "--drift": `${t.drift}px`, animation: `bbSlashArc ${t.dur}ms linear forwards` } as React.CSSProperties}
        >
          {villain.targetEmoji}
        </button>
      ))}
      {trail.map((p) => (
        <div key={p.id} className="pointer-events-none absolute" style={{ left: `${p.xPct}%`, top: `${p.yPct}%`, width: 18, height: 18, transform: "translate(-50%,-50%)", borderRadius: 999, background: "#fff", opacity: 0.75, filter: `blur(2px) drop-shadow(0 0 8px ${villain.glow})` }} />
      ))}
      {fx.map((f) => (
        <div key={f.id} className="pointer-events-none absolute" style={{ left: `${f.xPct}%`, top: `${f.yPct}%`, width: 96, height: 6, transform: "translate(-50%,-50%)", borderRadius: 999, background: "linear-gradient(90deg, transparent, #fff, transparent)", boxShadow: `0 0 16px ${villain.glow}`, animation: "bbSlashFx 0.4s ease-out forwards" }} />
      ))}
    </div>
  );
}

// ── KEEP-UPPY ───────────────────────────────────────────────────────────────
function KeepUppyGame({ villain, onHit }: { villain: Villain; onHit: (pos?: { xPct: number; yPct: number }) => void }) {
  const [pos, setPos] = useState({ x: 50, y: 30 });
  const phys = useRef({ x: 50, y: 30, vx: 0.4, vy: 0 });
  const raf = useRef<number>(0);

  useEffect(() => {
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(2, (now - last) / 16.67);
      last = now;
      const p = phys.current;
      p.vy += 0.10 * dt;
      p.y += p.vy * dt;
      p.x += p.vx * dt;
      if (p.x < 10) { p.x = 10; p.vx = Math.abs(p.vx); }
      if (p.x > 90) { p.x = 90; p.vx = -Math.abs(p.vx); }
      if (p.y > 86) { p.y = 86; p.vy = -2.2; } // gentle auto-bounce (no penalty)
      if (p.y < 14) { p.y = 14; p.vy = Math.abs(p.vy) * 0.4; }
      setPos({ x: p.x, y: p.y });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  function bop() {
    const p = phys.current;
    p.vy = -3.0;
    p.vx += (Math.random() - 0.5) * 0.8;
    onHit({ xPct: p.x, yPct: p.y });
  }

  return (
    <button
      type="button"
      onPointerDown={bop}
      className="absolute"
      style={{
        left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)",
        fontSize: "clamp(3rem, 10vw, 5rem)", lineHeight: 1,
        filter: `drop-shadow(0 0 18px ${villain.glow})`, cursor: "pointer",
      }}
    >
      {villain.targetEmoji}
    </button>
  );
}

// ── DUEL (tug-of-war clicker race) ──────────────────────────────────────────
function DuelGame({ villain, onWin }: { villain: Villain; onWin: () => void }) {
  const [bar, setBar] = useState(32);
  const barRef = useRef(32);
  const wonRef = useRef(false);

  useEffect(() => {
    const drain = window.setInterval(() => {
      barRef.current = Math.max(2, barRef.current - 1);
      setBar(barRef.current);
    }, 120);
    return () => window.clearInterval(drain);
  }, []);

  function tap() {
    barRef.current = Math.min(100, barRef.current + 2.6);
    setBar(barRef.current);
    if (barRef.current >= 100 && !wonRef.current) {
      wonRef.current = true;
      onWin();
    }
  }

  return (
    <button type="button" onPointerDown={tap} className="absolute inset-0 flex flex-col items-center justify-center px-6" style={{ cursor: "pointer" }}>
      <div className="flex w-[min(86vw,560px)] items-center justify-between">
        <span style={{ fontSize: "clamp(2.4rem, 9vw, 4rem)", filter: `drop-shadow(0 0 12px ${villain.glow})` }}>{villain.face}</span>
        <span style={{ fontSize: "clamp(2.4rem, 9vw, 4rem)", filter: "drop-shadow(0 0 12px rgba(200,160,48,0.6))" }}>🦸</span>
      </div>
      {/* tug bar */}
      <div className="relative mt-4 h-6 w-[min(86vw,560px)] overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
        <div
          className="h-full transition-all duration-100"
          style={{ width: `${bar}%`, background: `linear-gradient(90deg, ${villain.color}, #fff8e8)`, boxShadow: `0 0 14px ${villain.glow}` }}
        />
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/40" />
      </div>
      <div
        className="mt-6 rounded-full px-8 py-4 font-mono font-black uppercase tracking-[0.2em] text-[#1a0e00]"
        style={{ fontSize: "clamp(1.1rem, 4vw, 1.8rem)", background: "linear-gradient(135deg, #fff8e8, #e8c878 60%, #c8a030)", boxShadow: "0 0 22px rgba(200,160,48,0.5)", animation: "bbTapPulse 0.7s ease-in-out infinite", transformOrigin: "center" }}
      >
        TAP!
      </div>
    </button>
  );
}

// ── DODGE (drag your hero to avoid the villain's projectiles) ───────────────
function DodgeGame({ villain, onWin }: { villain: Villain; onWin: () => void }) {
  const [hero, setHero] = useState({ x: 50, y: 80 });
  const heroRef = useRef({ x: 50, y: 80 });
  const [projectiles, setProjectiles] = useState<{ id: number; x: number; y: number }[]>([]);
  const projRef = useRef<{ id: number; x: number; y: number; vx: number; vy: number }[]>([]);
  const idRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [hitFlash, setHitFlash] = useState(false);
  const wonRef = useRef(false);
  const startRef = useRef(0);
  const lastHitRef = useRef(0);
  const durMs = villain.durationSec * 1000;

  function move(e: React.PointerEvent) {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    heroRef.current = { x: Math.max(6, Math.min(94, x)), y: Math.max(22, Math.min(94, y)) };
    setHero(heroRef.current);
  }

  useEffect(() => {
    const spawn = window.setInterval(() => {
      if (projRef.current.length >= 7) return;
      idRef.current += 1;
      const edge = Math.floor(Math.random() * 3); // 0 top, 1 left, 2 right
      const speed = 0.7 + Math.random() * 0.5;
      let x: number, y: number, vx: number, vy: number;
      if (edge === 0) { x = 10 + Math.random() * 80; y = -6; vx = (Math.random() - 0.5) * 0.6; vy = speed; }
      else if (edge === 1) { x = -6; y = 24 + Math.random() * 46; vx = speed; vy = (Math.random() - 0.5) * 0.6; }
      else { x = 106; y = 24 + Math.random() * 46; vx = -speed; vy = (Math.random() - 0.5) * 0.6; }
      projRef.current.push({ id: idRef.current, x, y, vx, vy });
    }, 520);
    return () => window.clearInterval(spawn);
  }, []);

  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      if (startRef.current === 0) startRef.current = now;
      for (const p of projRef.current) { p.x += p.vx; p.y += p.vy; }
      projRef.current = projRef.current.filter((p) => p.x > -14 && p.x < 114 && p.y > -14 && p.y < 114);
      const h = heroRef.current;
      for (const p of projRef.current) {
        const dx = p.x - h.x, dy = p.y - h.y;
        if (dx * dx + dy * dy < 34 && now - lastHitRef.current > 600) {
          lastHitRef.current = now;
          setHitFlash(true);
          window.setTimeout(() => setHitFlash(false), 220);
        }
      }
      setProjectiles(projRef.current.map((p) => ({ id: p.id, x: p.x, y: p.y })));
      const frac = Math.min(1, (now - startRef.current) / durMs);
      setProgress(frac);
      if (frac >= 1 && !wonRef.current) { wonRef.current = true; onWin(); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [durMs, onWin]);

  return (
    <div className="absolute inset-0" style={{ touchAction: "none" }} onPointerMove={move} onPointerDown={move}>
      <div className="absolute inset-x-0 top-[84px] mx-auto h-2.5 w-[min(70vw,360px)] overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
        <div className="h-full rounded-full" style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, ${villain.color}, #fff8e8)`, boxShadow: `0 0 10px ${villain.glow}` }} />
      </div>
      {projectiles.map((p) => (
        <div key={p.id} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)", fontSize: "clamp(2rem,7vw,3.2rem)", filter: `drop-shadow(0 0 10px ${villain.glow})`, pointerEvents: "none" }}>{villain.targetEmoji}</div>
      ))}
      <div className="absolute" style={{ left: `${hero.x}%`, top: `${hero.y}%`, transform: "translate(-50%,-50%)", fontSize: "clamp(2.6rem,9vw,4rem)", filter: hitFlash ? "drop-shadow(0 0 16px #f87171)" : "drop-shadow(0 0 14px rgba(200,160,48,0.6))", opacity: hitFlash ? 0.6 : 1, pointerEvents: "none" }}>🦸</div>
      <div className="absolute inset-x-0 bottom-6 text-center font-sans font-bold text-white/70" style={{ fontSize: "clamp(0.85rem,2vw,1.1rem)" }}>Drag your hero to dodge!</div>
    </div>
  );
}

// ── COPY ME (watch a flashing pattern, then tap it back — memory) ───────────
function CopyMeGame({ villain, onWin }: { villain: Villain; onWin: () => void }) {
  const PADS = 4;
  const TARGET_ROUNDS = 3;
  const padColors = ["#f87171", "#60a5fa", "#fbbf24", "#4ade80"];
  const [round, setRound] = useState(0);
  const [seq, setSeq] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [showing, setShowing] = useState(true);
  const inputRef = useRef(0);
  const wonRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  const playSequence = useCallback((s: number[]) => {
    setShowing(true);
    inputRef.current = 0;
    clearTimers();
    s.forEach((pad, i) => {
      timersRef.current.push(window.setTimeout(() => setActive(pad), 500 + i * 720));
      timersRef.current.push(window.setTimeout(() => setActive(null), 500 + i * 720 + 420));
    });
    timersRef.current.push(window.setTimeout(() => setShowing(false), 500 + s.length * 720 + 120));
  }, [clearTimers]);

  useEffect(() => {
    const len = round + 2; // 2, 3, 4
    const s = Array.from({ length: len }, () => Math.floor(Math.random() * PADS));
    setSeq(s);
    playSequence(s);
    return clearTimers;
  }, [round, playSequence, clearTimers]);

  function tapPad(pad: number) {
    if (showing || wonRef.current) return;
    setActive(pad);
    window.setTimeout(() => setActive(null), 160);
    if (pad === seq[inputRef.current]) {
      inputRef.current += 1;
      if (inputRef.current >= seq.length) {
        if (round + 1 >= TARGET_ROUNDS) { wonRef.current = true; onWin(); }
        else setRound((r) => r + 1);
      }
    } else {
      playSequence(seq); // wrong — forgiving: replay the same pattern
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6">
      <div className="font-sans font-extrabold text-white/90" style={{ fontSize: "clamp(1rem,3vw,1.4rem)" }}>
        {showing ? "Watch the pattern…" : "Now copy it!"}
      </div>
      <div className="grid grid-cols-2 gap-4" style={{ width: "min(74vw, 320px)" }}>
        {Array.from({ length: PADS }).map((_, i) => (
          <button
            key={i}
            type="button"
            onPointerDown={() => tapPad(i)}
            className="aspect-square rounded-3xl border-2"
            style={{
              background: padColors[i],
              opacity: active === i ? 1 : 0.4,
              transform: active === i ? "scale(1.06)" : "scale(1)",
              borderColor: "rgba(255,255,255,0.5)",
              boxShadow: active === i ? `0 0 28px ${villain.glow}` : "none",
              transition: "transform 0.1s, opacity 0.1s",
            }}
          />
        ))}
      </div>
      <div className="font-mono font-bold uppercase tracking-[0.2em] text-white/55" style={{ fontSize: "clamp(0.7rem,1.6vw,0.9rem)" }}>
        Round {Math.min(round + 1, TARGET_ROUNDS)} / {TARGET_ROUNDS}
      </div>
    </div>
  );
}

// ── TRACE THE SEAL (drag along the glowing path without leaving it) ──────────
function TraceGame({ villain, onWin }: { villain: Villain; onWin: () => void }) {
  const pts = [
    { x: 14, y: 70 }, { x: 28, y: 42 }, { x: 42, y: 64 },
    { x: 56, y: 36 }, { x: 70, y: 60 }, { x: 86, y: 34 },
  ];
  const last = pts.length - 1;
  const [idx, setIdx] = useState(0);
  const wonRef = useRef(false);
  const TOL = 11;

  function move(e: React.PointerEvent) {
    if (wonRef.current) return;
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    let i = idx;
    while (i < last) {
      const n = pts[i + 1]!;
      const dx = n.x - x, dy = n.y - y;
      if (dx * dx + dy * dy <= TOL * TOL) i += 1;
      else break;
    }
    if (i !== idx) setIdx(i);
    if (i >= last && !wonRef.current) { wonRef.current = true; window.setTimeout(onWin, 250); }
  }

  const progress = idx / last;
  const polyAll = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const polyDone = pts.slice(0, idx + 1).map((p) => `${p.x},${p.y}`).join(" ");
  const marker = pts[Math.min(idx, last)]!;
  const start = pts[0]!;

  return (
    <div className="absolute inset-0" style={{ touchAction: "none" }} onPointerMove={move} onPointerDown={move}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <polyline points={polyAll} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={polyDone} fill="none" stroke={villain.color} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${villain.glow})` }} />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === last ? 2.8 : 1.8} fill={i <= idx ? villain.color : "rgba(255,255,255,0.3)"} />
        ))}
      </svg>
      {idx === 0 && (
        <div className="absolute font-mono font-bold uppercase tracking-[0.2em] text-white/70" style={{ left: `${start.x}%`, top: `${start.y + 7}%`, transform: "translate(-50%,0)", fontSize: "clamp(0.6rem,1.4vw,0.8rem)" }}>Start</div>
      )}
      <div className="absolute" style={{ left: `${marker.x}%`, top: `${marker.y}%`, transform: "translate(-50%,-50%)", fontSize: "clamp(2rem,6vw,3rem)", filter: `drop-shadow(0 0 14px ${villain.glow})`, pointerEvents: "none" }}>{villain.targetEmoji}</div>
      <div className="absolute inset-x-0 top-[84px] mx-auto h-2.5 w-[min(70vw,360px)] overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
        <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, ${villain.color}, #fff8e8)`, boxShadow: `0 0 10px ${villain.glow}` }} />
      </div>
      <div className="absolute inset-x-0 bottom-6 text-center font-sans font-bold text-white/70" style={{ fontSize: "clamp(0.85rem,2vw,1.1rem)" }}>Trace the glowing path with your finger</div>
    </div>
  );
}

// ── POP WALL (tap a matching cluster to pop it — collapse & refill) ──────────
const PW_PAL = ["#a78bfa", "#22d3ee", "#fcd34d", "#fb7185"];
function PopWallGame({ onHit }: { villain: Villain; onHit: (pos?: { xPct: number; yPct: number }) => void }) {
  const COLS = 6, ROWS = 6;
  const rand = () => Math.floor(Math.random() * PW_PAL.length);
  const [grid, setGrid] = useState<number[][]>(() => Array.from({ length: ROWS }, () => Array.from({ length: COLS }, rand)));

  function flood(g: number[][], r: number, c: number, colour: number, seen: Set<string>): Array<{ r: number; c: number }> {
    if (r < 0 || c < 0 || r >= ROWS || c >= COLS || seen.has(`${r}:${c}`) || g[r]![c] !== colour) return [];
    seen.add(`${r}:${c}`);
    return [{ r, c }, ...flood(g, r - 1, c, colour, seen), ...flood(g, r + 1, c, colour, seen), ...flood(g, r, c - 1, colour, seen), ...flood(g, r, c + 1, colour, seen)];
  }
  function tap(r: number, c: number, e: React.PointerEvent) {
    const colour = grid[r]![c]!;
    const group = flood(grid, r, c, colour, new Set());
    if (group.length < 2) return;
    const ng = grid.map((row) => [...row]);
    group.forEach(({ r, c }) => { ng[r]![c] = -1; });
    for (let col = 0; col < COLS; col += 1) {
      const kept: number[] = [];
      for (let row = ROWS - 1; row >= 0; row -= 1) if (ng[row]![col] !== -1) kept.push(ng[row]![col]!);
      for (let row = ROWS - 1, k = 0; row >= 0; row -= 1, k += 1) ng[row]![col] = k < kept.length ? kept[k]! : rand();
    }
    setGrid(ng);
    const baseX = (e.clientX / window.innerWidth) * 100;
    const baseY = (e.clientY / window.innerHeight) * 100;
    group.forEach((_, i) => window.setTimeout(() => onHit({ xPct: baseX + (Math.random() - 0.5) * 8, yPct: baseY + (Math.random() - 0.5) * 8 }), i * 45));
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center px-5">
      <div className="grid w-full max-w-sm gap-1.5" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}>
        {grid.flatMap((row, r) => row.map((colour, c) => (
          <button
            key={`${r}:${c}`}
            type="button"
            onPointerDown={(e) => tap(r, c, e)}
            className="aspect-square rounded-full transition active:scale-90"
            style={{ background: `radial-gradient(circle at 35% 30%, #ffffffcc, ${PW_PAL[colour]} 55%, ${PW_PAL[colour]})`, boxShadow: `0 0 10px ${PW_PAL[colour]}66`, cursor: "pointer" }}
          />
        )))}
      </div>
    </div>
  );
}

// ── TRICK SHOT (flick the ball into the moving hoop — with an aim preview) ──
const TS_GRAV = 0.00085;
function tsSimulate(vx: number, vy: number): Array<{ x: number; y: number }> {
  const pts: Array<{ x: number; y: number }> = [];
  const sx = vx;
  let x = 0.5, y = 0.84, sy = vy;
  for (let i = 0; i < 80; i += 1) {
    x += sx; y += sy; sy += TS_GRAV;
    if (i % 7 === 0) pts.push({ x, y });
    if (y > 1.02 || x < -0.05 || x > 1.05) break;
  }
  return pts;
}
function TrickShotGame({ villain, onHit }: { villain: Villain; onHit: (pos?: { xPct: number; yPct: number }) => void }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const ball = useRef({ x: 0.5, y: 0.84, vx: 0, vy: 0, flying: false });
  const hoop = useRef({ x: 0.5, dir: 1 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const raf = useRef(0);
  const [disp, setDisp] = useState({ bx: 0.5, by: 0.84, hx: 0.5 });
  const [aim, setAim] = useState<Array<{ x: number; y: number }>>([]);

  useEffect(() => {
    const loop = () => {
      const h = hoop.current;
      h.x += h.dir * 0.003; // slower — easier to time
      if (h.x > 0.8) h.dir = -1;
      if (h.x < 0.2) h.dir = 1;
      const b = ball.current;
      if (b.flying) {
        b.x += b.vx; b.y += b.vy; b.vy += TS_GRAV;
        // forgiving catch: descending through a generous band around the rim
        if (b.vy > 0 && b.y >= 0.19 && b.y <= 0.34 && Math.abs(b.x - h.x) < 0.12) {
          onHit({ xPct: h.x * 100, yPct: 24 });
          ball.current = { x: 0.5, y: 0.84, vx: 0, vy: 0, flying: false };
        } else if (b.y > 1.05 || b.x < -0.1 || b.x > 1.1) {
          ball.current = { x: 0.5, y: 0.84, vx: 0, vy: 0, flying: false };
        }
      }
      setDisp({ bx: ball.current.x, by: ball.current.y, hx: hoop.current.x });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [onHit]);

  function velFrom(e: React.PointerEvent) {
    const rect = wrapRef.current!.getBoundingClientRect();
    const dx = (e.clientX - drag.current!.x) / rect.width;
    const dy = (e.clientY - drag.current!.y) / rect.height;
    return { vx: dx * 0.058, vy: dy * 0.06, dy };
  }
  function down(e: React.PointerEvent) { if (!ball.current.flying) drag.current = { x: e.clientX, y: e.clientY }; }
  function move(e: React.PointerEvent) {
    if (!drag.current || ball.current.flying || !wrapRef.current) return;
    const { vx, vy, dy } = velFrom(e);
    setAim(dy < -0.03 ? tsSimulate(vx, vy) : []);
  }
  function up(e: React.PointerEvent) {
    if (!drag.current || ball.current.flying || !wrapRef.current) { drag.current = null; setAim([]); return; }
    const { vx, vy, dy } = velFrom(e);
    if (dy < -0.05) { ball.current.vx = vx; ball.current.vy = vy; ball.current.flying = true; }
    drag.current = null; setAim([]);
  }

  return (
    <div ref={wrapRef} className="absolute inset-0" style={{ touchAction: "none", cursor: "grab" }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
      {/* aim preview */}
      {aim.map((p, i) => (
        <div key={i} className="absolute rounded-full" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, width: 8, height: 8, transform: "translate(-50%,-50%)", background: "#fff", opacity: 0.5 - i * 0.03 }} />
      ))}
      {/* hoop */}
      <div className="absolute" style={{ left: `${disp.hx * 100}%`, top: "24%", transform: "translate(-50%, -50%)" }}>
        <div style={{ width: 88, height: 18, borderRadius: 999, border: `5px solid ${villain.color}`, boxShadow: `0 0 18px ${villain.glow}` }} />
        <div style={{ width: 88, height: 22, marginTop: -2, background: `linear-gradient(${villain.color}66, transparent)`, clipPath: "polygon(8% 0, 92% 0, 78% 100%, 22% 100%)" }} />
      </div>
      {/* ball */}
      <div className="absolute" style={{ left: `${disp.bx * 100}%`, top: `${disp.by * 100}%`, width: 44, height: 44, transform: "translate(-50%, -50%)", borderRadius: 999, background: "radial-gradient(circle at 35% 30%, #ffd7a0, #f59e0b 60%, #b45309)", boxShadow: "0 0 14px rgba(245,158,11,0.6)" }} />
      <div className="absolute inset-x-0 bottom-6 text-center font-sans font-bold text-white/70" style={{ fontSize: "clamp(0.85rem,2vw,1.1rem)" }}>Flick the ball up — the dots show your aim</div>
    </div>
  );
}

// ── BRICK BUSTER (Breakout — slide the paddle, smash the wall) ──────────────
const BB_COLS = 7, BB_ROWS = 4, BB_BW = 0.84 / BB_COLS, BB_BH = 0.05, BB_BGAP = 0.014;
function bbBrickRect(col: number, row: number) {
  const x0 = 0.08 + col * BB_BW;
  const y0 = 0.13 + row * (BB_BH + BB_BGAP);
  return { x0, y0, x1: x0 + BB_BW - 0.012, y1: y0 + BB_BH };
}
function BrickBusterGame({ villain, onHit }: { villain: Villain; onHit: (pos?: { xPct: number; yPct: number }) => void }) {
  const bricks = useRef(Array.from({ length: BB_ROWS * BB_COLS }, (_, i) => ({ col: i % BB_COLS, row: Math.floor(i / BB_COLS), alive: true })));
  const paddle = useRef(0.5);
  const ball = useRef({ x: 0.5, y: 0.82, vx: 0.005, vy: -0.0065, live: false });
  const raf = useRef(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState({ bx: 0.5, by: 0.82, px: 0.5, alive: Array.from({ length: BB_ROWS * BB_COLS }, () => true) });

  useEffect(() => {
    const launch = window.setTimeout(() => { ball.current.live = true; }, 750);
    const R = 0.017;
    const loop = () => {
      const b = ball.current;
      if (b.live) {
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0.03) { b.x = 0.03; b.vx = Math.abs(b.vx); }
        if (b.x > 0.97) { b.x = 0.97; b.vx = -Math.abs(b.vx); }
        if (b.y < 0.05) { b.y = 0.05; b.vy = Math.abs(b.vy); }
        if (b.vy > 0 && b.y > 0.85 && b.y < 0.92 && Math.abs(b.x - paddle.current) < 0.14) {
          b.vy = -Math.abs(b.vy);
          b.vx += (b.x - paddle.current) * 0.025;
        }
        if (b.y > 0.99) { b.x = paddle.current; b.y = 0.82; b.vx = (Math.random() < 0.5 ? -1 : 1) * 0.005; b.vy = -0.0065; }
        for (const brick of bricks.current) {
          if (!brick.alive) continue;
          const r = bbBrickRect(brick.col, brick.row);
          if (b.x > r.x0 - R && b.x < r.x1 + R && b.y > r.y0 - R && b.y < r.y1 + R) {
            brick.alive = false;
            b.vy = -b.vy; b.vx *= 1.02; b.vy *= 1.02;
            onHit({ xPct: ((r.x0 + r.x1) / 2) * 100, yPct: ((r.y0 + r.y1) / 2) * 100 });
            break;
          }
        }
      } else {
        b.x = paddle.current; b.y = 0.82;
      }
      setView({ bx: b.x, by: b.y, px: paddle.current, alive: bricks.current.map((br) => br.alive) });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf.current); window.clearTimeout(launch); };
  }, [onHit]);

  function movePaddle(e: React.PointerEvent) {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    paddle.current = Math.max(0.12, Math.min(0.88, (e.clientX - r.left) / r.width));
  }
  return (
    <div ref={wrapRef} className="absolute inset-0" style={{ touchAction: "none", cursor: "ew-resize" }} onPointerDown={movePaddle} onPointerMove={(e) => { if (e.buttons > 0 || e.pointerType !== "mouse") movePaddle(e); }}>
      {view.alive.map((alive, i) => {
        if (!alive) return null;
        const r = bbBrickRect(i % BB_COLS, Math.floor(i / BB_COLS));
        return <div key={i} className="absolute rounded-sm" style={{ left: `${r.x0 * 100}%`, top: `${r.y0 * 100}%`, width: `${(BB_BW - 0.012) * 100}%`, height: `${BB_BH * 100}%`, background: `linear-gradient(${villain.color}, ${villain.color}bb)`, boxShadow: `0 0 8px ${villain.glow}` }} />;
      })}
      <div className="absolute" style={{ left: `${view.bx * 100}%`, top: `${view.by * 100}%`, width: 20, height: 20, transform: "translate(-50%,-50%)", borderRadius: 999, background: "radial-gradient(circle at 35% 30%, #fff, #dbe4ee 60%, #9fb0c3)", boxShadow: "0 0 12px #ffffffcc" }} />
      <div className="absolute" style={{ left: `${view.px * 100}%`, top: "89%", width: "27%", maxWidth: 190, height: 15, transform: "translate(-50%,-50%)", borderRadius: 999, background: `linear-gradient(${villain.color}, ${villain.color}aa)`, boxShadow: `0 0 16px ${villain.glow}` }} />
      <div className="absolute inset-x-0 bottom-4 text-center font-sans font-bold text-white/70" style={{ fontSize: "clamp(0.85rem,2vw,1.1rem)" }}>Slide to move the paddle</div>
    </div>
  );
}

// ── GLOW SNAKE (Snake — steer a growing trail to eat orbs) ──────────────────
const SNAKE_N = 13;
function GlowSnakeGame({ villain, onHit }: { villain: Villain; onHit: (pos?: { xPct: number; yPct: number }) => void }) {
  const dir = useRef({ x: 1, y: 0 });
  const nextDir = useRef({ x: 1, y: 0 });
  const snake = useRef<Array<{ x: number; y: number }>>([{ x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }]);
  const orb = useRef({ x: 9, y: 6 });
  const traps = useRef<Array<{ x: number; y: number }>>([]);
  const speed = useRef(190);
  const raf = useRef(0);
  const ptr = useRef<{ x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState<{ snake: Array<{ x: number; y: number }>; orb: { x: number; y: number }; traps: Array<{ x: number; y: number }> }>(() => ({ snake: [{ x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }], orb: { x: 9, y: 6 }, traps: [] }));

  useEffect(() => {
    const occupied = (x: number, y: number) => snake.current.some((s) => s.x === x && s.y === y) || traps.current.some((t) => t.x === x && t.y === y) || (orb.current.x === x && orb.current.y === y);
    const freeCell = () => { let x = 0, y = 0, tries = 0; do { x = Math.floor(Math.random() * SNAKE_N); y = Math.floor(Math.random() * SNAKE_N); tries += 1; } while (occupied(x, y) && tries < 80); return { x, y }; };
    let last = 0, acc = 0;
    const step = () => {
      const nd = nextDir.current;
      if (nd.x !== -dir.current.x || nd.y !== -dir.current.y) dir.current = nd;
      const head = snake.current[0]!;
      const nx = (head.x + dir.current.x + SNAKE_N) % SNAKE_N;
      const ny = (head.y + dir.current.y + SNAKE_N) % SNAKE_N;
      const trapIdx = traps.current.findIndex((t) => t.x === nx && t.y === ny);
      const hitsSelf = snake.current.some((s) => s.x === nx && s.y === ny);
      const ate = orb.current.x === nx && orb.current.y === ny;
      let body = [{ x: nx, y: ny }, ...snake.current];
      if (ate) {
        const el = wrapRef.current;
        if (el) {
          const r = el.getBoundingClientRect();
          const px = r.left + ((nx + 0.5) / SNAKE_N) * r.width;
          const py = r.top + ((ny + 0.5) / SNAKE_N) * r.height;
          onHit({ xPct: (px / window.innerWidth) * 100, yPct: (py / window.innerHeight) * 100 });
        } else { onHit(); }
        orb.current = freeCell();
        speed.current = Math.max(110, speed.current - 7);
      } else {
        body.pop();
      }
      if (trapIdx >= 0) { traps.current = traps.current.filter((_, i) => i !== trapIdx); body = body.slice(0, Math.max(3, body.length - 2)); }
      if (hitsSelf) body = body.slice(0, 3);
      snake.current = body;
      setView({ snake: body, orb: orb.current, traps: traps.current });
    };
    const loop = (t: number) => {
      if (!last) last = t;
      acc += Math.min(60, t - last); last = t;
      while (acc >= speed.current) { acc -= speed.current; step(); }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    const trapTimer = window.setInterval(() => { if (traps.current.length < 4) traps.current = [...traps.current, freeCell()]; }, 3800);
    return () => { cancelAnimationFrame(raf.current); window.clearInterval(trapTimer); };
  }, [onHit]);

  function steer(e: React.PointerEvent) {
    const p = { x: e.clientX, y: e.clientY };
    if (ptr.current) {
      const dx = p.x - ptr.current.x, dy = p.y - ptr.current.y;
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        if (Math.abs(dx) > Math.abs(dy)) nextDir.current = { x: dx > 0 ? 1 : -1, y: 0 };
        else nextDir.current = { x: 0, y: dy > 0 ? 1 : -1 };
        ptr.current = p;
      }
    } else { ptr.current = p; }
  }
  const cell = 100 / SNAKE_N;
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ touchAction: "none", cursor: "grab" }} onPointerDown={(e) => { ptr.current = { x: e.clientX, y: e.clientY }; }} onPointerMove={steer} onPointerUp={() => { ptr.current = null; }}>
      <div ref={wrapRef} className="relative" style={{ width: "min(80vw, 380px)", height: "min(80vw, 380px)", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
        {view.traps.map((t, i) => (<div key={`t${i}`} className="absolute" style={{ left: `${t.x * cell}%`, top: `${t.y * cell}%`, width: `${cell}%`, height: `${cell}%`, padding: 2 }}><div className="h-full w-full rounded" style={{ background: "rgba(239,68,68,0.22)", border: "1px solid rgba(239,68,68,0.6)" }} /></div>))}
        <div className="absolute" style={{ left: `${view.orb.x * cell}%`, top: `${view.orb.y * cell}%`, width: `${cell}%`, height: `${cell}%`, padding: 3 }}><div className="h-full w-full rounded-full" style={{ background: "#fde047", boxShadow: "0 0 10px #fde047" }} /></div>
        {view.snake.map((s, i) => (<div key={`s${i}`} className="absolute" style={{ left: `${s.x * cell}%`, top: `${s.y * cell}%`, width: `${cell}%`, height: `${cell}%`, padding: 1.5 }}><div className="h-full w-full rounded" style={{ background: i === 0 ? villain.color : `${villain.color}cc`, boxShadow: i === 0 ? `0 0 10px ${villain.glow}` : "none" }} /></div>))}
      </div>
    </div>
  );
}

// ── GOBBLE GLOW (Pac-Man — munch the maze, dodge the villain) ───────────────
const GG_MAZE = [
  "###########",
  "#.........#",
  "#.#.#.#.#.#",
  "#.........#",
  "#.#.#.#.#.#",
  "#.........#",
  "#.#.#.#.#.#",
  "#.........#",
  "#.#.#.#.#.#",
  "#.........#",
  "###########",
];
const GG_N = 11;
const GG_START = { x: 1, y: 9 };
const GG_HOME = { x: 5, y: 5 };
const GG_POWER = { x: 9, y: 1 };
function ggWall(x: number, y: number) { return x < 0 || y < 0 || x >= GG_N || y >= GG_N || GG_MAZE[y]![x] === "#"; }
function ggInitialDots(): string[] {
  const keys: string[] = [];
  for (let y = 0; y < GG_N; y += 1) for (let x = 0; x < GG_N; x += 1) if (!ggWall(x, y)) keys.push(`${x},${y}`);
  return keys.filter((k) => k !== `${GG_START.x},${GG_START.y}` && k !== `${GG_POWER.x},${GG_POWER.y}`);
}
function GobbleGlowGame({ villain, onHit }: { villain: Villain; onHit: (pos?: { xPct: number; yPct: number }) => void }) {
  const player = useRef({ ...GG_START });
  const pdir = useRef({ x: 0, y: 0 });
  const pnext = useRef({ x: 0, y: 0 });
  const ghost = useRef({ ...GG_HOME });
  const fright = useRef(0);
  const dots = useRef<Set<string>>(new Set(ggInitialDots()));
  const power = useRef<{ x: number; y: number } | null>({ ...GG_POWER });
  const raf = useRef(0);
  const ptr = useRef<{ x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState(() => ({ px: GG_START.x, py: GG_START.y, gx: GG_HOME.x, gy: GG_HOME.y, dots: ggInitialDots(), power: true, fright: false }));

  useEffect(() => {
    let last = 0, pAcc = 0, gAcc = 0;
    const hitAt = (x: number, y: number) => {
      const el = wrapRef.current;
      if (!el) { onHit(); return; }
      const r = el.getBoundingClientRect();
      const px = r.left + ((x + 0.5) / GG_N) * r.width;
      const py = r.top + ((y + 0.5) / GG_N) * r.height;
      onHit({ xPct: (px / window.innerWidth) * 100, yPct: (py / window.innerHeight) * 100 });
    };
    const checkCatch = () => {
      if (ghost.current.x === player.current.x && ghost.current.y === player.current.y) {
        if (fright.current > 0) { ghost.current = { ...GG_HOME }; fright.current = Math.max(0, fright.current - 1500); }
        else { player.current = { ...GG_START }; pdir.current = { x: 0, y: 0 }; pnext.current = { x: 0, y: 0 }; ghost.current = { ...GG_HOME }; }
      }
    };
    const moveGhost = () => {
      const g = ghost.current;
      const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
      const scored = dirs.filter((d) => !ggWall(g.x + d.x, g.y + d.y)).map((d) => ({ d, dist: Math.abs(g.x + d.x - player.current.x) + Math.abs(g.y + d.y - player.current.y) }));
      if (scored.length === 0) return;
      scored.sort((a, b) => (fright.current > 0 ? b.dist - a.dist : a.dist - b.dist));
      const best = scored[0]!.dist;
      const pool = scored.filter((s) => s.dist === best);
      const choice = pool[Math.floor(Math.random() * pool.length)]!.d;
      ghost.current = { x: g.x + choice.x, y: g.y + choice.y };
    };
    const stepPlayer = () => {
      const tx = player.current.x + pnext.current.x, ty = player.current.y + pnext.current.y;
      if ((pnext.current.x || pnext.current.y) && !ggWall(tx, ty)) pdir.current = { ...pnext.current };
      const nx = player.current.x + pdir.current.x, ny = player.current.y + pdir.current.y;
      if (!ggWall(nx, ny)) { player.current = { x: nx, y: ny }; }
      const key = `${player.current.x},${player.current.y}`;
      if (dots.current.has(key)) { dots.current.delete(key); hitAt(player.current.x, player.current.y); }
      if (power.current && power.current.x === player.current.x && power.current.y === player.current.y) { power.current = null; fright.current = 5000; }
      checkCatch();
    };
    const loop = (t: number) => {
      if (!last) last = t;
      const dt = Math.min(60, t - last); last = t;
      if (fright.current > 0) fright.current = Math.max(0, fright.current - dt);
      pAcc += dt; gAcc += dt;
      while (pAcc >= 150) { pAcc -= 150; stepPlayer(); }
      const gStep = fright.current > 0 ? 240 : 170;
      while (gAcc >= gStep) { gAcc -= gStep; moveGhost(); checkCatch(); }
      setView({ px: player.current.x, py: player.current.y, gx: ghost.current.x, gy: ghost.current.y, dots: [...dots.current], power: power.current !== null, fright: fright.current > 0 });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [onHit]);

  function steer(e: React.PointerEvent) {
    const p = { x: e.clientX, y: e.clientY };
    if (ptr.current) {
      const dx = p.x - ptr.current.x, dy = p.y - ptr.current.y;
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        if (Math.abs(dx) > Math.abs(dy)) pnext.current = { x: dx > 0 ? 1 : -1, y: 0 };
        else pnext.current = { x: 0, y: dy > 0 ? 1 : -1 };
        ptr.current = p;
      }
    } else { ptr.current = p; }
  }
  const cell = 100 / GG_N;
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ touchAction: "none", cursor: "grab" }} onPointerDown={(e) => { ptr.current = { x: e.clientX, y: e.clientY }; }} onPointerMove={steer} onPointerUp={() => { ptr.current = null; }}>
      <div ref={wrapRef} className="relative" style={{ width: "min(82vw, 400px)", height: "min(82vw, 400px)" }}>
        {GG_MAZE.flatMap((row, y) => row.split("").map((ch, x) => ch === "#" ? (
          <div key={`w${x},${y}`} className="absolute rounded-sm" style={{ left: `${x * cell}%`, top: `${y * cell}%`, width: `${cell}%`, height: `${cell}%`, padding: 1 }}><div className="h-full w-full rounded-sm" style={{ background: "rgba(99,102,241,0.16)", border: "1px solid rgba(129,140,248,0.28)" }} /></div>
        ) : null))}
        {view.dots.map((k) => { const [x, y] = k.split(",").map(Number); return (<div key={`d${k}`} className="absolute grid place-items-center" style={{ left: `${x * cell}%`, top: `${y * cell}%`, width: `${cell}%`, height: `${cell}%` }}><span className="rounded-full" style={{ width: 6, height: 6, background: "#fde047", boxShadow: "0 0 5px #fde04799" }} /></div>); })}
        {view.power ? (<div className="absolute grid place-items-center" style={{ left: `${GG_POWER.x * cell}%`, top: `${GG_POWER.y * cell}%`, width: `${cell}%`, height: `${cell}%` }}><span className="rounded-full" style={{ width: 14, height: 14, background: "#fef08a", boxShadow: "0 0 12px #fde047", animation: "bbPulse 0.8s ease-in-out infinite" }} /></div>) : null}
        <div className="absolute grid place-items-center" style={{ left: `${view.px * cell}%`, top: `${view.py * cell}%`, width: `${cell}%`, height: `${cell}%` }}><span className="rounded-full" style={{ width: "78%", height: "78%", background: "radial-gradient(circle at 35% 30%, #fff6b0, #facc15 65%, #ca8a04)", boxShadow: "0 0 10px #facc1599" }} /></div>
        <div className="absolute grid place-items-center transition-transform" style={{ left: `${view.gx * cell}%`, top: `${view.gy * cell}%`, width: `${cell}%`, height: `${cell}%`, fontSize: `${cell * 0.16}vw` }}><span style={{ fontSize: "min(6vw, 26px)", filter: view.fright ? "grayscale(1) brightness(1.6)" : "none", opacity: view.fright ? 0.8 : 1 }}>{villain.face}</span></div>
      </div>
    </div>
  );
}

// ── BUMPER BLAST (Pinball — flip to keep the ball alive off the bumpers) ────
const BB_BUMPERS = [
  { x: 0.3, y: 0.3 },
  { x: 0.7, y: 0.3 },
  { x: 0.5, y: 0.46 },
  { x: 0.28, y: 0.6 },
  { x: 0.72, y: 0.6 },
];
function BumperBlastGame({ villain, onHit }: { villain: Villain; onHit: (pos?: { xPct: number; yPct: number }) => void }) {
  const ball = useRef({ x: 0.5, y: 0.25, vx: 0.004, vy: 0 });
  const lit = useRef(BB_BUMPERS.map(() => 0));
  const flip = useRef({ l: 0, r: 0 });
  const raf = useRef(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState({ bx: 0.5, by: 0.25, lit: BB_BUMPERS.map(() => 0), fl: 0, fr: 0 });

  useEffect(() => {
    const G = 0.00035, R = 0.085, BR = 0.028;
    let last = 0;
    const loop = (t: number) => {
      if (!last) last = t;
      const dt = Math.min(40, t - last); last = t;
      const b = ball.current;
      b.vy += G;
      b.x += b.vx; b.y += b.vy;
      if (b.x < 0.05) { b.x = 0.05; b.vx = Math.abs(b.vx); }
      if (b.x > 0.95) { b.x = 0.95; b.vx = -Math.abs(b.vx); }
      if (b.y < 0.06) { b.y = 0.06; b.vy = Math.abs(b.vy) * 0.9; }
      BB_BUMPERS.forEach((bp, i) => {
        const dx = b.x - bp.x, dy = b.y - bp.y, d = Math.hypot(dx, dy);
        if (d < R + BR && d > 0.0001) {
          const nx = dx / d, ny = dy / d;
          const speed = Math.hypot(b.vx, b.vy);
          b.vx = nx * (speed + 0.004); b.vy = ny * (speed + 0.004);
          b.x = bp.x + nx * (R + BR); b.y = bp.y + ny * (R + BR);
          lit.current[i] = 280;
          onHit({ xPct: bp.x * 100, yPct: bp.y * 100 });
        }
        if (lit.current[i]! > 0) lit.current[i] = Math.max(0, lit.current[i]! - dt);
      });
      if (flip.current.l > 0) flip.current.l = Math.max(0, flip.current.l - dt);
      if (flip.current.r > 0) flip.current.r = Math.max(0, flip.current.r - dt);
      if (b.y > 0.9) {
        const leftSide = b.x < 0.5;
        const active = leftSide ? flip.current.l > 0 : flip.current.r > 0;
        b.y = 0.9;
        b.vy = -Math.abs(b.vy) - (active ? 0.009 : 0.0045);
        b.vx += (0.5 - b.x) * (active ? 0.02 : 0.006) + (leftSide ? 0.0015 : -0.0015);
      }
      const sp = Math.hypot(b.vx, b.vy);
      if (sp > 0.02) { b.vx *= 0.02 / sp; b.vy *= 0.02 / sp; }
      setView({ bx: b.x, by: b.y, lit: [...lit.current], fl: flip.current.l, fr: flip.current.r });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [onHit]);

  function tapSide(e: React.PointerEvent) {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if ((e.clientX - r.left) / r.width < 0.5) flip.current.l = 170; else flip.current.r = 170;
  }
  return (
    <div ref={wrapRef} className="absolute inset-0" style={{ touchAction: "none", cursor: "pointer" }} onPointerDown={tapSide}>
      {BB_BUMPERS.map((bp, i) => (
        <div key={i} className="absolute grid place-items-center rounded-full" style={{ left: `${bp.x * 100}%`, top: `${bp.y * 100}%`, width: 92, height: 92, transform: "translate(-50%,-50%)", background: `radial-gradient(circle, ${villain.color}${view.lit[i]! > 0 ? "" : "44"} 0%, transparent 70%)`, border: `3px solid ${villain.color}`, boxShadow: view.lit[i]! > 0 ? `0 0 28px ${villain.glow}` : `0 0 10px ${villain.glow}` }}>
          <span style={{ fontSize: "1.7rem" }}>{villain.targetEmoji}</span>
        </div>
      ))}
      <div className="absolute" style={{ left: `${view.bx * 100}%`, top: `${view.by * 100}%`, width: 26, height: 26, transform: "translate(-50%,-50%)", borderRadius: 999, background: "radial-gradient(circle at 35% 30%, #fff, #cbd5e1 60%, #94a3b8)", boxShadow: "0 0 14px #ffffffe6" }} />
      <div className="absolute" style={{ left: "34%", bottom: "8%", width: 72, height: 14, transformOrigin: "left center", transform: `translate(-50%,0) rotate(${view.fl > 0 ? -30 : 10}deg)`, borderRadius: 999, background: villain.color, boxShadow: `0 0 12px ${villain.glow}` }} />
      <div className="absolute" style={{ right: "34%", bottom: "8%", width: 72, height: 14, transformOrigin: "right center", transform: `translate(50%,0) rotate(${view.fr > 0 ? 30 : -10}deg)`, borderRadius: 999, background: villain.color, boxShadow: `0 0 12px ${villain.glow}` }} />
      <div className="absolute inset-x-0 bottom-1.5 text-center font-sans font-bold text-white/70" style={{ fontSize: "clamp(0.8rem,1.8vw,1rem)" }}>Tap left / right to flip</div>
    </div>
  );
}
