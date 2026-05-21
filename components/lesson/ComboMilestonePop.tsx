"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

const MILESTONES = [
  {
    at: 10,
    label: "NEXUS STATE",
    color: "rgba(196,181,253,1)",
    glow: "rgba(139,92,246,0.8)",
    bg: "rgba(109,40,217,0.18)",
    border: "rgba(167,139,250,0.65)",
    icon: "⚡",
  },
  {
    at: 8,
    label: "OVERDRIVE",
    color: "rgba(253,186,116,1)",
    glow: "rgba(234,88,12,0.8)",
    bg: "rgba(194,65,12,0.18)",
    border: "rgba(251,146,60,0.65)",
    icon: "⚡",
  },
  {
    at: 5,
    label: "SURGE",
    color: "rgba(253,224,71,1)",
    glow: "rgba(202,138,4,0.8)",
    bg: "rgba(161,98,7,0.18)",
    border: "rgba(253,224,71,0.65)",
    icon: "⚡",
  },
  {
    at: 3,
    label: "SPARK",
    color: "rgba(94,234,212,1)",
    glow: "rgba(20,184,166,0.8)",
    bg: "rgba(15,118,110,0.18)",
    border: "rgba(94,234,212,0.65)",
    icon: "⚡",
  },
] as const;

type Milestone = (typeof MILESTONES)[number];

function getMilestoneCrossed(prev: number, next: number): Milestone | null {
  for (const m of MILESTONES) {
    if (prev < m.at && next >= m.at) return m;
  }
  return null;
}

type Phase = "entering" | "visible" | "leaving";

function MilestoneBadge({
  milestone,
  count,
}: {
  milestone: Milestone;
  count: number;
}) {
  const [phase, setPhase] = useState<Phase>("entering");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("visible"), 40);
    const t2 = setTimeout(() => setPhase("leaving"), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const scale =
    phase === "entering" ? "scale(0.55)" : phase === "leaving" ? "scale(0.88)" : "scale(1)";
  const opacity = phase === "leaving" ? 0 : phase === "entering" ? 0 : 1;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
      style={{
        opacity,
        transform: scale,
        transition:
          phase === "leaving"
            ? "opacity 0.28s ease-in, transform 0.28s ease-in"
            : "opacity 0.18s ease-out, transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <div
        style={{
          background: milestone.bg,
          border: `2px solid ${milestone.border}`,
          borderRadius: "1.1rem",
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: `0 0 40px ${milestone.glow}, 0 0 80px ${milestone.glow}50, 0 6px 24px rgba(0,0,0,0.35)`,
        }}
      >
        <span style={{ fontSize: "1.75rem", lineHeight: 1 }}>{milestone.icon}</span>
        <div>
          <div
            style={{
              color: milestone.color,
              fontFamily: "monospace",
              fontWeight: 900,
              fontSize: "1.4rem",
              letterSpacing: "0.12em",
              lineHeight: 1.1,
              textShadow: `0 0 20px ${milestone.glow}, 0 0 40px ${milestone.glow}`,
            }}
          >
            {milestone.label}
          </div>
          <div
            style={{
              color: milestone.color,
              fontFamily: "monospace",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              opacity: 0.85,
              marginTop: "2px",
            }}
          >
            ×{count} CHAIN
          </div>
        </div>
      </div>
    </div>
  );
}

export function ComboMilestonePop({
  comboCount,
  children,
}: {
  comboCount: number;
  children: ReactNode;
}) {
  const prevRef = useRef(comboCount);
  const [activePop, setActivePop] = useState<{ milestone: Milestone; count: number; key: number } | null>(null);
  const popKeyRef = useRef(0);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = comboCount;

    const milestone = getMilestoneCrossed(prev, comboCount);
    if (milestone) {
      popKeyRef.current += 1;
      setActivePop({ milestone, count: comboCount, key: popKeyRef.current });
      const t = setTimeout(() => setActivePop(null), 1300);
      return () => clearTimeout(t);
    }
  }, [comboCount]);

  return (
    <div className="relative">
      {children}
      {activePop && (
        <MilestoneBadge
          key={activePop.key}
          milestone={activePop.milestone}
          count={activePop.count}
        />
      )}
    </div>
  );
}
