"use client";

import { useEffect, useState, useMemo } from "react";
import type { Legend } from "@/data/legends";

/* ── animation stages ── */
type Stage = "dark" | "burst" | "card" | "info" | "ready";
const TIMINGS: Record<Stage, number> = {
  dark: 600,
  burst: 900,
  card: 1200,
  info: 800,
  ready: 0,
};

/* ── particles ── */
function makeParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    i,
    x: 50 + (Math.random() - 0.5) * 80,
    y: 50 + (Math.random() - 0.5) * 80,
    size: 3 + Math.random() * 5,
    delay: Math.random() * 0.6,
    dur: 1.4 + Math.random() * 1,
    hue: Math.floor(Math.random() * 360),
  }));
}

function makeConfetti(count: number) {
  const colors = [
    "hsl(145 65% 42%)",
    "hsl(42 95% 55%)",
    "hsl(215 65% 52%)",
    "hsl(270 60% 60%)",
    "hsl(0 72% 60%)",
    "hsl(180 60% 50%)",
  ];
  return Array.from({ length: count }, (_, i) => ({
    i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    dur: 2 + Math.random() * 1.2,
    rot: Math.random() * 360,
    w: 6 + Math.random() * 8,
    h: 10 + Math.random() * 14,
    color: colors[Math.floor(Math.random() * colors.length)],
    drift: (Math.random() - 0.5) * 120,
  }));
}

export default function LegendUnlockReveal({
  legend,
  onContinue,
  onViewLegends,
}: {
  legend: Legend;
  onContinue: () => void;
  onViewLegends: () => void;
}) {
  const [stage, setStage] = useState<Stage>("dark");

  const particles = useMemo(() => makeParticles(40), []);
  const confetti = useMemo(() => makeConfetti(80), []);

  useEffect(() => {
    const stages: Stage[] = ["dark", "burst", "card", "info", "ready"];
    let idx = 0;
    function next() {
      if (idx >= stages.length - 1) return;
      const current = stages[idx];
      setTimeout(() => {
        idx++;
        setStage(stages[idx]);
        next();
      }, TIMINGS[current]);
    }
    next();
  }, []);

  const showBurst = stage !== "dark";
  const showCard = stage === "card" || stage === "info" || stage === "ready";
  const showInfo = stage === "info" || stage === "ready";
  const showButtons = stage === "ready";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background:
            stage === "dark"
              ? "radial-gradient(circle at 50% 50%, hsl(260 30% 8%), hsl(240 20% 4%))"
              : "radial-gradient(circle at 50% 50%, hsl(260 30% 12%), hsl(240 20% 6%))",
        }}
      />

      {/* Radial glow burst */}
      {showBurst && (
        <div
          className="absolute"
          style={{
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, hsla(42, 95%, 55%, 0.4) 0%, hsla(145, 65%, 42%, 0.15) 40%, transparent 70%)",
            animation: "legendGlow 2s ease-out forwards",
          }}
        />
      )}

      {/* Sparkle particles */}
      {showBurst && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p) => (
            <span
              key={p.i}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: `hsla(${p.hue}, 80%, 70%, 0.9)`,
                boxShadow: `0 0 ${p.size * 2}px hsla(${p.hue}, 80%, 70%, 0.6)`,
                animation: `sparkleFloat ${p.dur}s ease-out ${p.delay}s both`,
              }}
            />
          ))}
        </div>
      )}

      {/* Confetti rain */}
      {showCard && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confetti.map((c) => (
            <span
              key={c.i}
              className="absolute rounded-sm"
              style={{
                left: `${c.left}%`,
                top: "-20px",
                width: `${c.w}px`,
                height: `${c.h}px`,
                background: c.color,
                transform: `rotate(${c.rot}deg)`,
                animation: `confettiFall ${c.dur}s ease-in ${c.delay}s forwards`,
                ["--drift" as string]: `${c.drift}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative flex flex-col items-center z-10 px-4" style={{ maxWidth: "400px" }}>
        {/* "LEGEND UNLOCKED" text */}
        <div
          className="transition-all duration-500"
          style={{
            opacity: showBurst ? 1 : 0,
            transform: showBurst ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
          }}
        >
          <div
            className="text-sm font-black tracking-[0.3em] mb-6"
            style={{
              color: "hsl(42, 95%, 55%)",
              textShadow: "0 0 30px hsla(42, 95%, 55%, 0.5)",
              animation: showBurst ? "shimmerText 2s ease-in-out infinite" : "none",
            }}
          >
            ★ LEGEND UNLOCKED ★
          </div>
        </div>

        {/* Card reveal */}
        <div
          className="relative transition-all"
          style={{
            opacity: showCard ? 1 : 0,
            transform: showCard
              ? "scale(1) rotateY(0deg)"
              : "scale(0.3) rotateY(90deg)",
            transition: "all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            perspective: "1000px",
          }}
        >
          {/* Glow ring behind card */}
          <div
            className="absolute -inset-4 rounded-3xl"
            style={{
              background:
                "linear-gradient(135deg, hsla(42, 95%, 55%, 0.3), hsla(145, 65%, 42%, 0.3), hsla(270, 60%, 60%, 0.3))",
              filter: "blur(20px)",
              animation: "pulseGlow 2s ease-in-out infinite",
            }}
          />

          {/* Card image */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ width: "240px", height: "340px" }}>
            <img
              src={legend.images.cardFront}
              alt={legend.name}
              className="w-full h-full object-cover"
              style={{
                filter: showCard ? "brightness(1)" : "brightness(2)",
                transition: "filter 0.6s ease-out",
              }}
            />
            {/* Shine sweep */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, hsla(0,0%,100%,0.4) 45%, hsla(0,0%,100%,0.1) 50%, transparent 55%)",
                animation: showCard ? "shineSweep 1.5s ease-out 0.3s both" : "none",
              }}
            />
          </div>
        </div>

        {/* Legend name + description */}
        <div
          className="text-center mt-6 transition-all duration-600"
          style={{
            opacity: showInfo ? 1 : 0,
            transform: showInfo ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s ease-out",
          }}
        >
          <h2
            className="text-3xl font-black mb-1"
            style={{ color: "hsl(0 0% 100%)" }}
          >
            {legend.name}
          </h2>
          <p
            className="text-sm font-semibold mb-3"
            style={{ color: "hsla(0, 0%, 100%, 0.6)" }}
          >
            {legend.strand} · {legend.yearLabel}
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "hsla(0, 0%, 100%, 0.75)" }}
          >
            {legend.description}
          </p>
        </div>

        {/* Action buttons */}
        <div
          className="w-full grid gap-3 mt-8 transition-all duration-500"
          style={{
            opacity: showButtons ? 1 : 0,
            transform: showButtons ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <button
            onClick={onViewLegends}
            className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, hsl(42, 95%, 55%), hsl(35, 95%, 50%))",
              color: "hsl(30, 50%, 12%)",
              boxShadow: "0 4px 20px hsla(42, 95%, 55%, 0.4)",
            }}
          >
            View My Legends
          </button>
          <button
            onClick={onContinue}
            className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "hsla(0, 0%, 100%, 0.1)",
              color: "hsla(0, 0%, 100%, 0.9)",
              border: "1px solid hsla(0, 0%, 100%, 0.15)",
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
