"use client";

import { useMemo } from "react";

function seededValue(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Full-screen ambient overlay that grows as the learner's streak increases.
 *  3+  : faint warm vignette
 *  5+  : drifting sparkles + edge glow
 *  8+  : pulse + light rays + more sparkles
 * 10+  : full aurora + intense sparkle field
 *
 * Realm-aware:
 *   - Number Nexus: gold → orange → teal/emerald (sci-fi energy).
 *   - Measurelands: brass → gold → purple+brass (magical measurement).
 */
export default function SurgeAmbience({
  comboCount,
  realmId,
  dimmed = false,
}: {
  comboCount: number;
  realmId?: string;
  /** Calm the persistent ambient glow while the student is answering; it flares
   *  back to full on reward moments (correct answer) and settles again. */
  dimmed?: boolean;
}) {
  const isMeasurement = realmId === "measurement";
  const tier =
    comboCount >= 10 ? 4 : comboCount >= 8 ? 3 : comboCount >= 5 ? 2 : comboCount >= 3 ? 1 : 0;

  const sparkles = useMemo(
    () => {
      if (tier === 0) return [];
      const count = tier === 1 ? 8 : tier === 2 ? 18 : tier === 3 ? 28 : 42;
      return Array.from({ length: count }, (_, i) => {
        const leftSeed = seededValue(tier * 100 + i * 7 + 1);
        const delaySeed = seededValue(tier * 100 + i * 7 + 2);
        const durationSeed = seededValue(tier * 100 + i * 7 + 3);
        const sizeSeed = seededValue(tier * 100 + i * 7 + 4);
        const hueSeed = seededValue(tier * 100 + i * 7 + 5);
        let hue: number;
        if (isMeasurement) {
          // brass at low/mid tiers, purple+brass mix at top tiers
          hue = tier >= 4
            ? (hueSeed < 0.5 ? 265 : 42)
            : tier >= 3
            ? (hueSeed < 0.4 ? 265 : 42)
            : 42;
        } else {
          hue = tier >= 4
            ? (hueSeed < 0.5 ? 168 : 152)
            : tier >= 3
            ? (hueSeed < 0.3 ? 25 : 45)
            : 48;
        }
        return {
          id: tier * 1000 + i,
          left: leftSeed * 100,
          delay: delaySeed * 4,
          duration: 4 + durationSeed * 4,
          size: 2 + sizeSeed * (tier >= 3 ? 5 : 3),
          hue,
        };
      });
    },
    [tier, isMeasurement]
  );

  if (tier === 0) return null;

  // Vignette gradient by tier
  const nexusVignette =
    tier === 1
      ? "radial-gradient(ellipse at 50% 100%, rgba(253,224,71,0.10) 0%, transparent 55%), radial-gradient(ellipse at 50% 0%, rgba(253,224,71,0.06) 0%, transparent 50%)"
      : tier === 2
      ? "radial-gradient(ellipse at 50% 100%, rgba(253,200,40,0.22) 0%, transparent 60%), radial-gradient(ellipse at 50% 0%, rgba(253,224,71,0.14) 0%, transparent 55%), radial-gradient(ellipse at 0% 50%, rgba(251,191,36,0.10) 0%, transparent 45%), radial-gradient(ellipse at 100% 50%, rgba(251,191,36,0.10) 0%, transparent 45%)"
      : tier === 3
      ? "radial-gradient(ellipse at 50% 100%, rgba(251,146,60,0.30) 0%, transparent 65%), radial-gradient(ellipse at 50% 0%, rgba(253,224,71,0.22) 0%, transparent 60%), radial-gradient(ellipse at 0% 50%, rgba(251,146,60,0.16) 0%, transparent 50%), radial-gradient(ellipse at 100% 50%, rgba(251,146,60,0.16) 0%, transparent 50%)"
      : "radial-gradient(ellipse at 50% 100%, rgba(45,212,191,0.42) 0%, transparent 70%), radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.32) 0%, transparent 65%), radial-gradient(ellipse at 0% 50%, rgba(94,234,212,0.26) 0%, transparent 55%), radial-gradient(ellipse at 100% 50%, rgba(45,212,191,0.26) 0%, transparent 55%)";

  const measureVignette =
    tier === 1
      ? "radial-gradient(ellipse at 50% 100%, rgba(200,160,48,0.10) 0%, transparent 55%), radial-gradient(ellipse at 50% 0%, rgba(200,160,48,0.06) 0%, transparent 50%)"
      : tier === 2
      ? "radial-gradient(ellipse at 50% 100%, rgba(200,160,48,0.24) 0%, transparent 60%), radial-gradient(ellipse at 50% 0%, rgba(232,200,120,0.14) 0%, transparent 55%), radial-gradient(ellipse at 0% 50%, rgba(200,160,48,0.10) 0%, transparent 45%), radial-gradient(ellipse at 100% 50%, rgba(200,160,48,0.10) 0%, transparent 45%)"
      : tier === 3
      ? "radial-gradient(ellipse at 50% 100%, rgba(167,139,250,0.28) 0%, transparent 65%), radial-gradient(ellipse at 50% 0%, rgba(200,160,48,0.22) 0%, transparent 60%), radial-gradient(ellipse at 0% 50%, rgba(167,139,250,0.16) 0%, transparent 50%), radial-gradient(ellipse at 100% 50%, rgba(200,160,48,0.16) 0%, transparent 50%)"
      : "radial-gradient(ellipse at 50% 100%, rgba(200,160,48,0.40) 0%, transparent 70%), radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.32) 0%, transparent 65%), radial-gradient(ellipse at 0% 50%, rgba(232,200,120,0.24) 0%, transparent 55%), radial-gradient(ellipse at 100% 50%, rgba(167,139,250,0.24) 0%, transparent 55%)";

  const vignette = isMeasurement ? measureVignette : nexusVignette;
  const pulseSpeed = tier === 1 ? "5s" : tier === 2 ? "3.5s" : tier === 3 ? "2.4s" : "1.6s";

  const topBar = isMeasurement
    ? "linear-gradient(to bottom, rgba(200,160,48,0.32), transparent)"
    : "linear-gradient(to bottom, rgba(253,224,71,0.35), transparent)";

  const bottomBar = isMeasurement
    ? tier >= 4
      ? "linear-gradient(to top, rgba(200,160,48,0.45), rgba(167,139,250,0.22), transparent)"
      : tier >= 3
      ? "linear-gradient(to top, rgba(167,139,250,0.38), transparent)"
      : "linear-gradient(to top, rgba(200,160,48,0.3), transparent)"
    : tier >= 4
    ? "linear-gradient(to top, rgba(45,212,191,0.5), rgba(16,185,129,0.22), transparent)"
    : tier >= 3
    ? "linear-gradient(to top, rgba(251,146,60,0.42), transparent)"
    : "linear-gradient(to top, rgba(253,200,40,0.32), transparent)";

  const rays = isMeasurement
    ? tier >= 4
      ? "repeating-conic-gradient(from 0deg at 50% 110%, rgba(200,160,48,0.14) 0deg, transparent 6deg, transparent 12deg, rgba(167,139,250,0.14) 18deg)"
      : "repeating-conic-gradient(from 0deg at 50% 110%, rgba(200,160,48,0.10) 0deg, transparent 6deg, transparent 12deg, rgba(200,160,48,0.10) 18deg)"
    : tier >= 4
    ? "repeating-conic-gradient(from 0deg at 50% 110%, rgba(94,234,212,0.14) 0deg, transparent 6deg, transparent 12deg, rgba(45,212,191,0.14) 18deg)"
    : "repeating-conic-gradient(from 0deg at 50% 110%, rgba(253,224,71,0.10) 0deg, transparent 6deg, transparent 12deg, rgba(253,224,71,0.10) 18deg)";

  const shimmerA = isMeasurement
    ? "linear-gradient(115deg, transparent 0%, rgba(232,200,120,0.26) 50%, transparent 100%)"
    : "linear-gradient(115deg, transparent 0%, rgba(167,243,208,0.28) 50%, transparent 100%)";
  const shimmerB = isMeasurement
    ? "linear-gradient(115deg, transparent 0%, rgba(196,181,253,0.2) 50%, transparent 100%)"
    : "linear-gradient(115deg, transparent 0%, rgba(94,234,212,0.18) 50%, transparent 100%)";
  const dataColumn = isMeasurement
    ? "linear-gradient(to bottom, transparent, rgba(200,160,48,0.7), rgba(167,139,250,0.4), transparent)"
    : "linear-gradient(to bottom, transparent, rgba(94,234,212,0.7), rgba(45,212,191,0.4), transparent)";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      style={{
        // Calm during answering, full on reward moments — settles smoothly.
        opacity: dimmed ? 0.22 : 1,
        transition: "opacity 600ms ease",
      }}
    >
      <style jsx>{`
        @keyframes surgePulse { 0%, 100% { opacity: 0.75; } 50% { opacity: 1; } }
        @keyframes surgeFloat {
          0% { transform: translateY(105vh) scale(0.6); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) scale(1.1); opacity: 0; }
        }
        @keyframes surgeRays {
          0%, 100% { opacity: 0.35; transform: rotate(0deg) scale(1); }
          50% { opacity: 0.7; transform: rotate(2deg) scale(1.04); }
        }
        @keyframes surgeShimmer {
          0% { transform: translateX(-30%); }
          100% { transform: translateX(130%); }
        }
        @keyframes dataColumn {
          0% { transform: translateY(-100%); opacity: 0; }
          8% { opacity: 1; }
          90% { opacity: 0.6; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: vignette,
          animation: `surgePulse ${pulseSpeed} ease-in-out infinite`,
          transition: "background 0.6s ease",
        }}
      />

      {/* Top + bottom edge glow bars (tier 2+) */}
      {tier >= 2 && (
        <>
          <div
            className="absolute inset-x-0 top-0 h-32"
            style={{ background: topBar, animation: `surgePulse ${pulseSpeed} ease-in-out infinite` }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-40"
            style={{ background: bottomBar, animation: `surgePulse ${pulseSpeed} ease-in-out infinite` }}
          />
        </>
      )}

      {/* Light rays (tier 3+) */}
      {tier >= 3 && (
        <div
          className="absolute inset-0"
          style={{ background: rays, mixBlendMode: "screen", animation: "surgeRays 3.2s ease-in-out infinite" }}
        />
      )}

      {/* Diagonal shimmer bands (tier 4) */}
      {tier >= 4 && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-0 bottom-0 w-1/3"
            style={{ background: shimmerA, animation: "surgeShimmer 2.8s linear infinite", filter: "blur(8px)" }}
          />
          <div
            className="absolute top-0 bottom-0 w-1/4"
            style={{ background: shimmerB, animation: "surgeShimmer 4.2s linear 1.1s infinite", filter: "blur(6px)" }}
          />
        </div>
      )}

      {/* Vertical data columns (tier 4) */}
      {tier >= 4 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[8, 22, 38, 55, 71, 86].map((left, i) => (
            <div
              key={i}
              className="absolute top-0 w-px"
              style={{
                left: `${left}%`,
                height: "35%",
                background: dataColumn,
                animation: `dataColumn ${5 + i * 0.7}s linear ${i * 0.9}s infinite`,
                mixBlendMode: "screen",
              }}
            />
          ))}
        </div>
      )}

      {/* Floating sparkles */}
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            bottom: 0,
            width: s.size,
            height: s.size,
            background: `hsl(${s.hue} 95% 65%)`,
            boxShadow: `0 0 ${s.size * 3}px hsl(${s.hue} 95% 60% / 0.9), 0 0 ${s.size * 6}px hsl(${s.hue} 95% 55% / 0.5)`,
            animation: `surgeFloat ${s.duration}s linear ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
