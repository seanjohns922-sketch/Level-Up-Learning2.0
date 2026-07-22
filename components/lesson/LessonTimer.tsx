"use client";

import { Hourglass, Orbit, Timer } from "lucide-react";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function LessonTimer({
  seconds,
  total,
  realmId,
}: {
  seconds: number;
  total: number;
  realmId?: string;
}) {
  const isMeasurement = realmId === "measurement";
  const isStarpath = realmId === "space";
  const clamped = Math.max(0, seconds);
  const minutes = Math.floor(clamped / 60);
  const remaining = clamped % 60;
  const pct = total > 0 ? (clamped / total) * 100 : 0;

  // Color state
  const state =
    pct > 50 ? "ok" : pct > 12 ? "warn" : "danger";

  const nexusPalette = {
    ok: {
      bezel:
        "linear-gradient(135deg, rgba(94,234,212,0.45) 0%, rgba(15,118,110,0.25) 50%, rgba(94,234,212,0.35) 100%)",
      bg: "linear-gradient(135deg, #021a18 0%, #052e2b 50%, #064e47 100%)",
      text: "text-teal-100",
      icon: "text-teal-200",
      glow: "rgba(94,234,212,0.45)",
    },
    warn: {
      bezel:
        "linear-gradient(135deg, rgba(251,191,36,0.5) 0%, rgba(120,53,15,0.25) 50%, rgba(251,191,36,0.4) 100%)",
      bg: "linear-gradient(135deg, #1a1305 0%, #2e1f05 50%, #4a3a0a 100%)",
      text: "text-amber-100",
      icon: "text-amber-200",
      glow: "rgba(251,191,36,0.5)",
    },
    danger: {
      bezel:
        "linear-gradient(135deg, rgba(248,113,113,0.55) 0%, rgba(127,29,29,0.3) 50%, rgba(248,113,113,0.45) 100%)",
      bg: "linear-gradient(135deg, #1a0505 0%, #2e0a0a 50%, #4a1010 100%)",
      text: "text-red-100",
      icon: "text-red-300",
      glow: "rgba(248,113,113,0.55)",
    },
  } as const;

  const measurementPalette = {
    ok: {
      bezel:
        "linear-gradient(135deg, rgba(200,160,48,0.5) 0%, rgba(120,90,15,0.25) 50%, rgba(200,160,48,0.42) 100%)",
      bg: "linear-gradient(135deg, #1a1004 0%, #2e1d06 50%, #3d2808 100%)",
      text: "text-amber-50",
      icon: "text-amber-200",
      glow: "rgba(200,160,48,0.5)",
    },
    warn: {
      bezel:
        "linear-gradient(135deg, rgba(167,139,250,0.55) 0%, rgba(76,29,149,0.3) 50%, rgba(200,160,48,0.45) 100%)",
      bg: "linear-gradient(135deg, #1a0e1f 0%, #2a1640 50%, #3d2808 100%)",
      text: "text-amber-50",
      icon: "text-violet-200",
      glow: "rgba(167,139,250,0.55)",
    },
    danger: {
      bezel:
        "linear-gradient(135deg, rgba(248,113,113,0.55) 0%, rgba(120,30,15,0.3) 50%, rgba(248,113,113,0.45) 100%)",
      bg: "linear-gradient(135deg, #1a0505 0%, #2e0a0a 50%, #4a1010 100%)",
      text: "text-red-100",
      icon: "text-red-300",
      glow: "rgba(248,113,113,0.55)",
    },
  } as const;

  const starpathPalette = {
    ok: {
      bezel: "linear-gradient(135deg, rgba(103,232,249,0.60) 0%, rgba(124,58,237,0.55) 52%, rgba(240,171,252,0.42) 100%)",
      bg: "linear-gradient(135deg, #170a35 0%, #25205f 52%, #08364a 100%)",
      text: "text-cyan-50",
      icon: "text-cyan-200",
      glow: "rgba(103,232,249,0.55)",
    },
    warn: {
      bezel: "linear-gradient(135deg, rgba(253,224,71,0.58) 0%, rgba(124,58,237,0.46) 52%, rgba(240,171,252,0.45) 100%)",
      bg: "linear-gradient(135deg, #24102f 0%, #3b1e58 52%, #49320b 100%)",
      text: "text-amber-100",
      icon: "text-violet-200",
      glow: "rgba(240,171,252,0.52)",
    },
    danger: nexusPalette.danger,
  } as const;

  const palette = (isMeasurement ? measurementPalette : isStarpath ? starpathPalette : nexusPalette)[state];
  const IconCmp = isMeasurement ? Hourglass : isStarpath ? Orbit : Timer;

  return (
    <div className="relative inline-block min-w-[100px]">
      <div
        aria-hidden
        className="absolute -inset-[2px] pointer-events-none"
        style={isMeasurement || isStarpath ? {
          borderRadius: 12,
          background: palette.bezel,
        } : {
          clipPath:
            "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
          background: palette.bezel,
        }}
      />
      <div
        className="relative inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 overflow-hidden transition-colors duration-500"
        style={isMeasurement || isStarpath ? {
          borderRadius: 10,
          background: palette.bg,
          boxShadow:
            isMeasurement
              ? "inset 0 1px 0 rgba(200,160,48,0.2), inset 0 -8px 16px rgba(0,0,0,0.45)"
              : "inset 0 1px 0 rgba(165,243,252,0.18), inset 0 -8px 16px rgba(2,6,23,0.48)",
        } : {
          clipPath:
            "polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)",
          background: palette.bg,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -8px 16px rgba(0,0,0,0.4)",
        }}
      >
        {!isMeasurement && !isStarpath && (
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.15] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1px, transparent 1px, transparent 3px)",
            }}
          />
        )}
        <IconCmp
          className={`relative h-3.5 w-3.5 ${palette.icon}`}
          style={{ filter: `drop-shadow(0 0 3px ${palette.glow})` }}
        />
        <span
          className={`relative text-sm font-mono font-extrabold tabular-nums tracking-wider md:text-[15px] ${palette.text}`}
          style={{ textShadow: `0 0 8px ${palette.glow}` }}
        >
          {minutes}:{pad2(remaining)}
        </span>
      </div>
    </div>
  );
}
