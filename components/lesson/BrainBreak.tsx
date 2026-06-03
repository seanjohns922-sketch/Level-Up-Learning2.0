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
 */

type Phase = "intro" | "play" | "victory";

type Target = {
  id: number;
  xPct: number; // horizontal position (%)
  yPct: number; // vertical position (% — whack only)
  driftPx: number; // horizontal drift (slash only)
  durMs: number; // lifetime
};

export default function BrainBreak({
  villain,
  onComplete,
}: {
  villain: Villain;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);
  const [slashFx, setSlashFx] = useState<{ id: number; xPct: number; yPct: number }[]>([]);
  const idRef = useRef(0);
  const scoreRef = useRef(0);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setPhase("victory");
    try {
      window.dispatchEvent(new CustomEvent("lul:villain-defeated", { detail: { id: villain.id } }));
    } catch {}
    window.setTimeout(onComplete, 2600);
  }, [onComplete, villain.id]);

  // Phase: intro → play
  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent("lul:villain-appeared", { detail: { id: villain.id } }));
    } catch {}
    const t = window.setTimeout(() => setPhase("play"), 2200);
    return () => window.clearTimeout(t);
  }, [villain.id]);

  // Play: spawn targets + safety timer
  useEffect(() => {
    if (phase !== "play") return;

    const isSlash = villain.game === "slash";
    const spawnEvery = isSlash ? 720 : 640;

    const spawn = window.setInterval(() => {
      setTargets((prev) => {
        if (prev.length >= (isSlash ? 4 : 5)) return prev;
        idRef.current += 1;
        const id = idRef.current;
        const durMs = isSlash ? 2400 + Math.random() * 700 : 1500;
        const target: Target = {
          id,
          xPct: 12 + Math.random() * 76,
          yPct: 26 + Math.random() * 48,
          driftPx: (Math.random() - 0.5) * 160,
          durMs,
        };
        // auto-despawn (a miss — no penalty)
        window.setTimeout(() => {
          setTargets((cur) => cur.filter((x) => x.id !== id));
        }, durMs);
        return [...prev, target];
      });
    }, spawnEvery);

    const safety = window.setTimeout(finish, villain.durationSec * 1000);

    return () => {
      window.clearInterval(spawn);
      window.clearTimeout(safety);
    };
  }, [phase, villain.game, villain.durationSec, finish]);

  function hitTarget(target: Target) {
    setTargets((prev) => prev.filter((x) => x.id !== target.id));
    if (villain.game === "slash") {
      const fxId = idRef.current + 10000;
      setSlashFx((prev) => [...prev, { id: fxId, xPct: target.xPct, yPct: 50 }]);
      window.setTimeout(() => setSlashFx((cur) => cur.filter((f) => f.id !== fxId)), 400);
    }
    scoreRef.current += 1;
    setScore(scoreRef.current);
    if (scoreRef.current >= villain.winCount) finish();
  }

  const progress = Math.min(100, Math.round((score / villain.winCount) * 100));

  return (
    <div
      className="fixed inset-0 z-[70] overflow-hidden select-none"
      style={{
        background:
          "radial-gradient(ellipse 90% 90% at 50% 45%, rgba(8,6,20,0.86) 0%, rgba(4,2,12,0.96) 100%)",
        backdropFilter: "blur(3px)",
        touchAction: "none",
      }}
    >
      <style jsx>{`
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
        @keyframes bbPop {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
          40% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2.4); }
        }
        @keyframes bbVictoryBurst {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(3); }
        }
      `}</style>

      {/* ── INTRO ── */}
      {phase === "intro" && (
        <>
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
              style={{
                fontSize: "clamp(1.4rem, 5vw, 2.6rem)",
                letterSpacing: "0.1em",
                color: villain.color,
                textShadow: `0 0 22px ${villain.glow}`,
              }}
            >
              {villain.name}
            </div>
            <div
              className="mt-2 font-sans font-bold text-white/90"
              style={{ fontSize: "clamp(0.95rem, 2.4vw, 1.3rem)" }}
            >
              “{villain.taunt}”
            </div>
            <div
              className="mt-4 font-mono font-bold uppercase tracking-[0.24em] text-white/60"
              style={{ fontSize: "clamp(0.65rem, 1.4vw, 0.85rem)" }}
            >
              Tap to fight back!
            </div>
          </div>
        </>
      )}

      {/* ── PLAY ── */}
      {phase === "play" && (
        <>
          {/* Top HUD */}
          <div className="absolute inset-x-0 top-0 px-5 pt-5">
            <div className="mx-auto flex max-w-2xl items-center gap-3">
              <span style={{ fontSize: "2rem", filter: `drop-shadow(0 0 10px ${villain.glow})` }}>
                {villain.face}
              </span>
              <div className="flex-1">
                <div
                  className="font-mono font-black uppercase tracking-[0.16em]"
                  style={{ fontSize: "clamp(0.7rem, 1.6vw, 0.95rem)", color: villain.color }}
                >
                  {villain.name}
                </div>
                <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${villain.color}, #fff8e8)`,
                      boxShadow: `0 0 10px ${villain.glow}`,
                    }}
                  />
                </div>
              </div>
              <div
                className="font-mono font-black tabular-nums text-white"
                style={{ fontSize: "clamp(1rem, 3vw, 1.6rem)", textShadow: `0 0 10px ${villain.glow}` }}
              >
                {score}/{villain.winCount}
              </div>
            </div>
            <div className="mt-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
              {villain.game === "slash" ? "Slash to reclaim your time!" : "Tap to clear the confusion!"}
            </div>
          </div>

          {/* Targets */}
          {targets.map((t) =>
            villain.game === "whack" ? (
              <button
                key={t.id}
                type="button"
                onPointerDown={() => hitTarget(t)}
                className="absolute"
                style={{
                  left: `${t.xPct}%`,
                  top: `${t.yPct}%`,
                  transform: "translate(-50%, -50%)",
                  fontSize: "clamp(2.6rem, 8vw, 4rem)",
                  lineHeight: 1,
                  filter: `drop-shadow(0 0 16px ${villain.glow})`,
                  animation: `bbWhackIn ${t.durMs}ms ease-in-out forwards`,
                  cursor: "pointer",
                }}
              >
                {villain.targetEmoji}
              </button>
            ) : (
              <button
                key={t.id}
                type="button"
                onPointerDown={() => hitTarget(t)}
                className="absolute bottom-0"
                style={
                  {
                    left: `${t.xPct}%`,
                    fontSize: "clamp(2.6rem, 8vw, 4rem)",
                    lineHeight: 1,
                    filter: `drop-shadow(0 0 16px ${villain.glow})`,
                    "--drift": `${t.driftPx}px`,
                    animation: `bbSlashArc ${t.durMs}ms linear forwards`,
                    cursor: "pointer",
                  } as React.CSSProperties
                }
              >
                {villain.targetEmoji}
              </button>
            )
          )}

          {/* Slash flashes */}
          {slashFx.map((f) => (
            <div
              key={f.id}
              className="absolute"
              style={{
                left: `${f.xPct}%`,
                top: `${f.yPct}%`,
                width: 90,
                height: 6,
                borderRadius: 999,
                background: "linear-gradient(90deg, transparent, #fff, transparent)",
                boxShadow: `0 0 16px ${villain.glow}`,
                animation: "bbSlashFx 0.4s ease-out forwards",
              }}
            />
          ))}
        </>
      )}

      {/* ── VICTORY ── */}
      {phase === "victory" && (
        <>
          <div
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: 300,
              height: 300,
              background: `radial-gradient(circle, ${villain.glow} 0%, transparent 70%)`,
              animation: "bbVictoryBurst 1s ease-out forwards",
            }}
          />
          <div
            className="absolute left-1/2 top-[40%] text-center"
            style={{ animation: "bbTextIn 0.5s ease-out forwards", width: "min(90vw, 640px)" }}
          >
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
            <div
              className="mt-2 font-sans font-bold text-white/95"
              style={{ fontSize: "clamp(1rem, 2.6vw, 1.4rem)" }}
            >
              {villain.victory}
            </div>
            <div
              className="mx-auto mt-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 font-sans font-semibold text-white/80"
              style={{ fontSize: "clamp(0.8rem, 1.8vw, 1rem)", maxWidth: 460 }}
            >
              💡 {villain.tip}
            </div>
            <div
              className="mt-4 font-mono font-bold uppercase tracking-[0.28em] text-white/55"
              style={{ fontSize: "clamp(0.65rem, 1.4vw, 0.85rem)" }}
            >
              Back to the adventure…
            </div>
          </div>
        </>
      )}
    </div>
  );
}
