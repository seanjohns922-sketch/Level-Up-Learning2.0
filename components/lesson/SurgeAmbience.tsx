"use client";

import { useMemo } from "react";

function seededValue(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Full-screen ambient overlay that grows more gold + animated
 * as the learner's combo (surge) increases.
 *
 *  3+  : faint warm vignette
 *  5+  : SURGE — gold vignette + drifting sparkles + edge glow
 *  8+  : OVERDRIVE — orange/gold pulse + light rays + more sparkles
 * 10+  : NEXUS — full gold-violet aurora + intense sparkle field
 */
export default function SurgeAmbience({ comboCount }: { comboCount: number }) {
  // Tier
  const tier =
    comboCount >= 10 ? 4 : comboCount >= 8 ? 3 : comboCount >= 5 ? 2 : comboCount >= 3 ? 1 : 0;

  // Sparkle field — regenerate on tier change
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
        return {
          id: tier * 1000 + i,
          left: leftSeed * 100,
          delay: delaySeed * 4,
          duration: 4 + durationSeed * 4,
          size: 2 + sizeSeed * (tier >= 3 ? 5 : 3),
          // Tier 4 (Nexus) → teal/emerald. Tier 3 → orange/gold. Lower tiers → gold.
          hue:
            tier >= 4
              ? hueSeed < 0.5
                ? 168 // teal
                : 152 // emerald
              : tier >= 3
              ? hueSeed < 0.3
                ? 25
                : 45
              : 48,
        };
      });
    },
    [tier]
  );

  if (tier === 0) return null;

  // Vignette gradient by tier
  const vignette =
    tier === 1
      ? "radial-gradient(ellipse at 50% 100%, rgba(253,224,71,0.10) 0%, transparent 55%), radial-gradient(ellipse at 50% 0%, rgba(253,224,71,0.06) 0%, transparent 50%)"
      : tier === 2
      ? "radial-gradient(ellipse at 50% 100%, rgba(253,200,40,0.22) 0%, transparent 60%), radial-gradient(ellipse at 50% 0%, rgba(253,224,71,0.14) 0%, transparent 55%), radial-gradient(ellipse at 0% 50%, rgba(251,191,36,0.10) 0%, transparent 45%), radial-gradient(ellipse at 100% 50%, rgba(251,191,36,0.10) 0%, transparent 45%)"
      : tier === 3
      ? "radial-gradient(ellipse at 50% 100%, rgba(251,146,60,0.30) 0%, transparent 65%), radial-gradient(ellipse at 50% 0%, rgba(253,224,71,0.22) 0%, transparent 60%), radial-gradient(ellipse at 0% 50%, rgba(251,146,60,0.16) 0%, transparent 50%), radial-gradient(ellipse at 100% 50%, rgba(251,146,60,0.16) 0%, transparent 50%)"
      : "radial-gradient(ellipse at 50% 100%, rgba(45,212,191,0.42) 0%, transparent 70%), radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.32) 0%, transparent 65%), radial-gradient(ellipse at 0% 50%, rgba(94,234,212,0.26) 0%, transparent 55%), radial-gradient(ellipse at 100% 50%, rgba(45,212,191,0.26) 0%, transparent 55%)";

  const pulseSpeed = tier === 1 ? "5s" : tier === 2 ? "3.5s" : tier === 3 ? "2.4s" : "1.6s";

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      <style jsx>{`
        @keyframes surgePulse {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 1; }
        }
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

      {/* Top + bottom gold edge glow bars (tier 2+) */}
      {tier >= 2 && (
        <>
          <div
            className="absolute inset-x-0 top-0 h-32"
            style={{
              background:
                "linear-gradient(to bottom, rgba(253,224,71,0.35), transparent)",
              animation: `surgePulse ${pulseSpeed} ease-in-out infinite`,
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-40"
            style={{
              background:
                tier >= 4
                  ? "linear-gradient(to top, rgba(45,212,191,0.5), rgba(16,185,129,0.22), transparent)"
                  : tier >= 3
                  ? "linear-gradient(to top, rgba(251,146,60,0.42), transparent)"
                  : "linear-gradient(to top, rgba(253,200,40,0.32), transparent)",
              animation: `surgePulse ${pulseSpeed} ease-in-out infinite`,
            }}
          />
        </>
      )}

      {/* Light rays (tier 3+) */}
      {tier >= 3 && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-conic-gradient(from 0deg at 50% 110%, rgba(253,224,71,0.10) 0deg, transparent 6deg, transparent 12deg, rgba(253,224,71,0.10) 18deg)",
            mixBlendMode: "screen",
            animation: "surgeRays 3.2s ease-in-out infinite",
          }}
        />
      )}

      {/* Diagonal shimmer band (tier 4) */}
      {tier >= 4 && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-0 bottom-0 w-1/3"
            style={{
              background:
                "linear-gradient(115deg, transparent 0%, rgba(255,240,180,0.22) 50%, transparent 100%)",
              animation: "surgeShimmer 2.8s linear infinite",
              filter: "blur(8px)",
            }}
          />
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
            background: `hsl(${s.hue} 95% ${s.hue === 280 ? 75 : 65}%)`,
            boxShadow: `0 0 ${s.size * 3}px hsl(${s.hue} 95% 60% / 0.9), 0 0 ${
              s.size * 6
            }px hsl(${s.hue} 95% 55% / 0.5)`,
            animation: `surgeFloat ${s.duration}s linear ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
