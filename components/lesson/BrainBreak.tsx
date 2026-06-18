"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Villain } from "@/lib/brain-break";

/**
 * Full-screen mid-lesson brain break. A villain swoops in, the student plays a
 * quick 1-touch game to defeat it, then returns to the lesson. The lesson clock
 * is paused by the host engine while this is open.
 *
 * Phases: intro (villain + taunt) → play (mini-game) → victory (defeat + tip).
 * Always winnable — if the timer runs out the villain is defeated anyway.
 *
 * Five shared mechanics, picked per villain via `villain.game`:
 *   whack    — tap pop-up targets
 *   slash    — tap arcing targets
 *   keepuppy — bop a falling orb, count the bops
 *   charge   — tap fast to fill a confidence meter (SEL, always wins)
 *   duel     — tug-of-war clicker race vs the villain
 */

type Phase = "intro" | "play" | "victory";

export default function BrainBreak({
  villain,
  onComplete,
}: {
  villain: Villain;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const doneRef = useRef(false);

  const isCountGame = villain.game === "whack" || villain.game === "slash" || villain.game === "keepuppy";

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setPhase("victory");
    try {
      window.dispatchEvent(new CustomEvent("lul:villain-defeated", { detail: { id: villain.id } }));
    } catch {}
    window.setTimeout(onComplete, 2600);
  }, [onComplete, villain.id]);

  const onHit = useCallback(() => {
    scoreRef.current += 1;
    setScore(scoreRef.current);
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
      `}</style>

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
              🛡️ Brain Break — Defend Your XP!
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
            <div className="mt-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
              🛡️ Defend your XP · {playHint(villain.game)}
            </div>
          </div>

          {villain.game === "whack" && <WhackGame villain={villain} onHit={onHit} />}
          {villain.game === "slash" && <SlashGame villain={villain} onHit={onHit} />}
          {villain.game === "keepuppy" && <KeepUppyGame villain={villain} onHit={onHit} />}
          {villain.game === "charge" && <ChargeGame villain={villain} onWin={finish} />}
          {villain.game === "duel" && <DuelGame villain={villain} onWin={finish} />}
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
            <div style={{ fontSize: "clamp(3.5rem, 12vw, 6rem)", lineHeight: 1 }}>✨</div>
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
              🛡️ XP defended!
            </div>
            <div
              className="mx-auto mt-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 font-sans font-semibold text-white/80"
              style={{ fontSize: "clamp(0.8rem, 1.8vw, 1rem)", maxWidth: 460 }}
            >
              💡 {villain.tip}
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
    case "slash": return "Slash them away!";
    case "keepuppy": return "Tap to keep it up!";
    case "charge": return "Tap fast to shine!";
    case "duel": return "Tap to win the tug-of-war!";
    default: return "Tap them all!";
  }
}

// ── WHACK ───────────────────────────────────────────────────────────────────
function WhackGame({ villain, onHit }: { villain: Villain; onHit: () => void }) {
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
          onPointerDown={() => { setTargets((p) => p.filter((x) => x.id !== t.id)); onHit(); }}
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

// ── SLASH ───────────────────────────────────────────────────────────────────
function SlashGame({ villain, onHit }: { villain: Villain; onHit: () => void }) {
  const [targets, setTargets] = useState<{ id: number; xPct: number; drift: number; dur: number }[]>([]);
  const [fx, setFx] = useState<{ id: number; xPct: number }[]>([]);
  const idRef = useRef(0);
  useEffect(() => {
    const spawn = window.setInterval(() => {
      setTargets((prev) => {
        if (prev.length >= 3) return prev;
        idRef.current += 1;
        const id = idRef.current;
        // Gentler pacing: targets float for longer so they're catchable, not a blur.
        const dur = 3000 + Math.random() * 800;
        window.setTimeout(() => setTargets((c) => c.filter((x) => x.id !== id)), dur);
        return [...prev, { id, xPct: 12 + Math.random() * 76, drift: (Math.random() - 0.5) * 140, dur }];
      });
    }, 900);
    return () => window.clearInterval(spawn);
  }, []);
  function hit(t: { id: number; xPct: number }) {
    setTargets((p) => p.filter((x) => x.id !== t.id));
    const fxId = idRef.current + 10000;
    setFx((p) => [...p, { id: fxId, xPct: t.xPct }]);
    window.setTimeout(() => setFx((c) => c.filter((f) => f.id !== fxId)), 400);
    onHit();
  }
  return (
    <>
      {targets.map((t) => (
        <button
          key={t.id}
          type="button"
          onPointerDown={() => hit(t)}
          className="absolute bottom-0"
          style={
            {
              left: `${t.xPct}%`, fontSize: "clamp(2.6rem, 8vw, 4rem)", lineHeight: 1,
              filter: `drop-shadow(0 0 16px ${villain.glow})`,
              "--drift": `${t.drift}px`,
              animation: `bbSlashArc ${t.dur}ms linear forwards`, cursor: "pointer",
            } as React.CSSProperties
          }
        >
          {villain.targetEmoji}
        </button>
      ))}
      {fx.map((f) => (
        <div
          key={f.id}
          className="absolute"
          style={{
            left: `${f.xPct}%`, top: "50%", width: 90, height: 6, borderRadius: 999,
            background: "linear-gradient(90deg, transparent, #fff, transparent)",
            boxShadow: `0 0 16px ${villain.glow}`, animation: "bbSlashFx 0.4s ease-out forwards",
          }}
        />
      ))}
    </>
  );
}

// ── KEEP-UPPY ───────────────────────────────────────────────────────────────
function KeepUppyGame({ villain, onHit }: { villain: Villain; onHit: () => void }) {
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
    onHit();
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

// ── CHARGE-THE-LIGHT (SEL — always wins) ────────────────────────────────────
function ChargeGame({ villain, onWin }: { villain: Villain; onWin: () => void }) {
  const [meter, setMeter] = useState(0);
  const meterRef = useRef(0);
  const wonRef = useRef(false);
  const max = villain.winCount;

  useEffect(() => {
    const decay = window.setInterval(() => {
      meterRef.current = Math.max(0, meterRef.current - 0.3);
      setMeter(meterRef.current);
    }, 100);
    return () => window.clearInterval(decay);
  }, []);

  function tap() {
    meterRef.current = Math.min(max, meterRef.current + 1.5);
    setMeter(meterRef.current);
    if (meterRef.current >= max && !wonRef.current) {
      wonRef.current = true;
      onWin();
    }
  }

  const frac = Math.min(1, meter / max);

  return (
    <button type="button" onPointerDown={tap} className="absolute inset-0 flex flex-col items-center justify-center" style={{ cursor: "pointer" }}>
      {/* brightening hero */}
      <div
        style={{
          fontSize: "clamp(5rem, 16vw, 9rem)", lineHeight: 1,
          opacity: 0.25 + frac * 0.75,
          transform: `scale(${0.8 + frac * 0.4})`,
          filter: `drop-shadow(0 0 ${10 + frac * 50}px ${villain.glow}) brightness(${0.7 + frac * 0.8})`,
          transition: "transform 0.12s ease-out",
        }}
      >
        {frac >= 1 ? "🌟" : villain.targetEmoji}
      </div>
      {/* confidence meter */}
      <div className="mt-8 h-4 w-[min(70vw,360px)] overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{ width: `${frac * 100}%`, background: `linear-gradient(90deg, ${villain.color}, #fff8e8)`, boxShadow: `0 0 14px ${villain.glow}` }}
        />
      </div>
      <div className="mt-4 font-sans font-extrabold text-white/90" style={{ fontSize: "clamp(1rem, 3vw, 1.5rem)" }}>
        {frac < 0.4 ? "You can do this…" : frac < 0.8 ? "Keep going — you're doing it!" : "Almost there — shine bright!"}
      </div>
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
