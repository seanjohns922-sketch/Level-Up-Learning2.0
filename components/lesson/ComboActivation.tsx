"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { Hourglass, Cog, Timer, Scale, Ruler, Star, Sparkles, Orbit } from "lucide-react";

type GlyphIcon = ComponentType<{ className?: string; style?: React.CSSProperties }>;

/**
 * Full-screen activation burst for the mid-streak tiers (5 and 8).
 * Realm-aware:
 *   - Number Nexus: SURGE (5, gold) / OVERDRIVE (8, orange) — sci-fi energy.
 *   - Measurelands: BREAKTHROUGH (5, brass) / MASTER EXPLORER (8, purple+brass)
 *     — magical measurement bursts with floating hourglass/ruler glyphs.
 * NexusActivation handles 10-combo (Nexus State / Legendary) separately.
 * Same DNA — rings, particles, corner bursts, scanline — scaled per tier.
 */

function seeded(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

type TierConfig = {
  threshold: number;
  title: string;
  engaged: string;
  subtitle: string;
  hues: [number, number];
  flashColor: string;
  ringColor: string;
  ringCount: number;
  particleCount: number;
  duration: number;
  cornerSize: number;
  titleGradient: string;
  titleFilter: string;
  accentColor: string;
  dividerGradient: string;
  /** Measurement symbols that float upward (Measurelands only). */
  glyphs?: GlyphIcon[];
};

const NEXUS_TIERS: TierConfig[] = [
  {
    threshold: 5,
    title: "SURGE",
    engaged: "ACTIVATED",
    subtitle: "5 correct in a row — you're on a roll!",
    hues: [48, 45],
    flashColor: "rgba(253,224,71,0.5)",
    ringColor: "rgba(253,224,71,0.85)",
    ringCount: 3,
    particleCount: 28,
    duration: 1.7,
    cornerSize: 120,
    titleGradient: "linear-gradient(180deg, #fefce8 0%, #fde047 48%, #ca8a04 100%)",
    titleFilter: "drop-shadow(0 0 20px rgba(253,224,71,0.95)) drop-shadow(0 0 42px rgba(202,138,4,0.7))",
    accentColor: "rgba(253,224,71,0.92)",
    dividerGradient: "linear-gradient(90deg, transparent, rgba(253,224,71,0.9), rgba(202,138,4,0.7), transparent)",
  },
  {
    threshold: 8,
    title: "OVERDRIVE",
    engaged: "ENGAGED",
    subtitle: "8 correct in a row — almost at Nexus!",
    hues: [25, 35],
    flashColor: "rgba(251,146,60,0.55)",
    ringColor: "rgba(251,146,60,0.88)",
    ringCount: 4,
    particleCount: 38,
    duration: 2.1,
    cornerSize: 140,
    titleGradient: "linear-gradient(180deg, #fff7ed 0%, #fb923c 48%, #c2410c 100%)",
    titleFilter: "drop-shadow(0 0 22px rgba(251,146,60,0.95)) drop-shadow(0 0 46px rgba(194,65,12,0.72))",
    accentColor: "rgba(253,186,116,0.95)",
    dividerGradient: "linear-gradient(90deg, transparent, rgba(251,146,60,0.9), rgba(194,65,12,0.7), transparent)",
  },
];

const MEASURE_TIERS: TierConfig[] = [
  {
    threshold: 5,
    title: "BREAKTHROUGH",
    engaged: "DISCOVERED",
    subtitle: "5 in a row — you're measuring like a master!",
    hues: [42, 38], // brass / deep gold
    flashColor: "rgba(200,160,48,0.5)",
    ringColor: "rgba(200,160,48,0.85)",
    ringCount: 3,
    particleCount: 26,
    duration: 1.8,
    cornerSize: 120,
    titleGradient: "linear-gradient(180deg, #fff8e8 0%, #e8c878 48%, #8b6520 100%)",
    titleFilter: "drop-shadow(0 0 20px rgba(200,160,48,0.9)) drop-shadow(0 0 42px rgba(139,101,32,0.7))",
    accentColor: "rgba(232,200,120,0.95)",
    dividerGradient: "linear-gradient(90deg, transparent, rgba(200,160,48,0.9), rgba(139,101,32,0.7), transparent)",
    glyphs: [Hourglass, Timer, Scale, Ruler],
  },
  {
    threshold: 8,
    title: "MASTER EXPLORER",
    engaged: "ASCENDING",
    subtitle: "8 in a row — the magic is surging!",
    hues: [265, 42], // wizard purple + brass
    flashColor: "rgba(167,139,250,0.52)",
    ringColor: "rgba(167,139,250,0.85)",
    ringCount: 4,
    particleCount: 38,
    duration: 2.2,
    cornerSize: 140,
    titleGradient: "linear-gradient(180deg, #f5f0ff 0%, #c4b5fd 45%, #6d28d9 100%)",
    titleFilter: "drop-shadow(0 0 22px rgba(167,139,250,0.95)) drop-shadow(0 0 46px rgba(109,40,217,0.72))",
    accentColor: "rgba(196,181,253,0.95)",
    dividerGradient: "linear-gradient(90deg, transparent, rgba(167,139,250,0.9), rgba(200,160,48,0.6), transparent)",
    glyphs: [Hourglass, Cog, Timer, Scale, Ruler],
  },
];

// Starpath — cosmic "supernova" ladder: STARDUST (3) / SUPERNOVA (5) / PULSAR (8).
// (The 10-combo SINGULARITY finale lives in NexusActivation.)
const STARPATH_TIERS: TierConfig[] = [
  {
    threshold: 3,
    title: "STARDUST",
    engaged: "IGNITED",
    subtitle: "3 in a row — your star begins to glow!",
    hues: [190, 205], // cyan
    flashColor: "rgba(103,232,249,0.5)",
    ringColor: "rgba(103,232,249,0.85)",
    ringCount: 2,
    particleCount: 22,
    duration: 1.5,
    cornerSize: 100,
    titleGradient: "linear-gradient(180deg, #ecfeff 0%, #67e8f9 48%, #0891b2 100%)",
    titleFilter: "drop-shadow(0 0 18px rgba(103,232,249,0.95)) drop-shadow(0 0 40px rgba(8,145,178,0.7))",
    accentColor: "rgba(165,243,252,0.95)",
    dividerGradient: "linear-gradient(90deg, transparent, rgba(103,232,249,0.9), rgba(8,145,178,0.7), transparent)",
    glyphs: [Star, Sparkles],
  },
  {
    threshold: 5,
    title: "SUPERNOVA",
    engaged: "ERUPTED",
    subtitle: "5 in a row — your star goes supernova!",
    hues: [255, 190], // violet + cyan
    flashColor: "rgba(167,139,250,0.55)",
    ringColor: "rgba(196,181,253,0.9)",
    ringCount: 3,
    particleCount: 32,
    duration: 1.9,
    cornerSize: 130,
    titleGradient: "linear-gradient(180deg, #ffffff 0%, #c4b5fd 45%, #7c3aed 100%)",
    titleFilter: "drop-shadow(0 0 22px rgba(196,181,253,0.98)) drop-shadow(0 0 46px rgba(124,58,237,0.75))",
    accentColor: "rgba(221,214,254,0.97)",
    dividerGradient: "linear-gradient(90deg, transparent, rgba(196,181,253,0.9), rgba(103,232,249,0.6), transparent)",
    glyphs: [Star, Sparkles],
  },
  {
    threshold: 8,
    title: "PULSAR",
    engaged: "SURGING",
    subtitle: "8 in a row — cosmic energy is surging!",
    hues: [290, 260], // magenta + violet
    flashColor: "rgba(232,121,249,0.55)",
    ringColor: "rgba(240,171,252,0.9)",
    ringCount: 4,
    particleCount: 40,
    duration: 2.2,
    cornerSize: 150,
    titleGradient: "linear-gradient(180deg, #fdf4ff 0%, #e879f9 46%, #a21caf 100%)",
    titleFilter: "drop-shadow(0 0 24px rgba(232,121,249,0.98)) drop-shadow(0 0 48px rgba(162,28,175,0.75))",
    accentColor: "rgba(245,208,254,0.97)",
    dividerGradient: "linear-gradient(90deg, transparent, rgba(240,171,252,0.9), rgba(167,139,250,0.6), transparent)",
    glyphs: [Star, Sparkles, Orbit],
  },
];

type ActivationKey = { id: number; tier: TierConfig };

export default function ComboActivation({ comboCount, realmId }: { comboCount: number; realmId?: string }) {
  const isMeasurement = realmId === "measurement";
  const isStarpath = realmId === "space";
  const tiers = isMeasurement ? MEASURE_TIERS : isStarpath ? STARPATH_TIERS : NEXUS_TIERS;
  const prevRef = useRef(comboCount);
  const idRef = useRef(0);
  const [active, setActive] = useState<ActivationKey | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = comboCount;

    // Highest threshold down — only fire below 10 (Nexus/Legendary handled separately)
    for (const tier of [...tiers].reverse()) {
      if (prev < tier.threshold && comboCount >= tier.threshold && comboCount < 10) {
        idRef.current += 1;
        setActive({ id: idRef.current, tier });
        const t = setTimeout(() => setActive(null), Math.round(tier.duration * 1000) + 300);
        try {
          window.dispatchEvent(new CustomEvent(`lul:${tier.title.toLowerCase().replace(/\s+/g, "-")}-activated`));
        } catch {}
        return () => clearTimeout(t);
      }
    }
  }, [comboCount, tiers]);

  const particles = useMemo(() => {
    if (!active) return [];
    const { tier } = active;
    return Array.from({ length: tier.particleCount }, (_, i) => {
      const angle = (i / tier.particleCount) * Math.PI * 2 + seeded(active.id * 13 + i) * 0.5;
      const distance = 130 + seeded(active.id * 17 + i) * 240;
      const size = 3 + seeded(active.id * 23 + i) * 7;
      const delay = seeded(active.id * 29 + i) * 0.24;
      const duration = 0.85 + seeded(active.id * 31 + i) * 0.6;
      const hue = tier.hues[seeded(active.id * 37 + i) < 0.5 ? 0 : 1];
      return { id: i, x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, size, delay, duration, hue };
    });
  }, [active]);

  const glyphs = useMemo(() => {
    if (!active || !active.tier.glyphs) return [];
    const set = active.tier.glyphs;
    return Array.from({ length: 11 }, (_, i) => {
      const left = 6 + seeded(active.id * 41 + i) * 88;
      const delay = seeded(active.id * 43 + i) * 0.5;
      const size = 22 + seeded(active.id * 47 + i) * 26;
      const drift = (seeded(active.id * 53 + i) - 0.5) * 80;
      const rot = (seeded(active.id * 59 + i) - 0.5) * 40;
      return { id: i, Icon: set[i % set.length], left, delay, size, drift, rot };
    });
  }, [active]);

  if (!active) return null;
  const { tier } = active;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <style jsx>{`
        @keyframes comboFlash {
          0% { opacity: 0; }
          8% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes comboRing {
          0% { transform: translate(-50%, -50%) scale(0.06); opacity: 0; border-width: 16px; }
          12% { opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(3.8); opacity: 0; border-width: 1px; }
        }
        @keyframes comboBurst {
          0% { transform: translate(-50%, -50%) translate(0, 0) scale(0.5); opacity: 0; }
          12% { opacity: 1; }
          100% { transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.1); opacity: 0; }
        }
        @keyframes comboTitleIn {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.52) translateY(14px); filter: blur(10px); }
          16% { opacity: 1; transform: translate(-50%, -50%) scale(1.07) translateY(-3px); filter: blur(0); }
          30% { transform: translate(-50%, -50%) scale(1); }
          74% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.03); filter: blur(3px); }
        }
        @keyframes comboSubIn {
          0% { opacity: 0; transform: translate(-50%, 0) translateY(12px); }
          22% { opacity: 1; transform: translate(-50%, 0) translateY(0); }
          74% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes comboScan {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 0.85; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes comboCorner {
          0% { opacity: 0; transform: scale(0.2); }
          15% { opacity: 1; transform: scale(1.08); }
          30% { transform: scale(1); }
          72% { opacity: 0.6; }
          100% { opacity: 0; }
        }
        @keyframes comboGlyph {
          0% { opacity: 0; transform: translate(-50%, 0) translateY(60px) scale(0.5) rotate(var(--rot)); }
          18% { opacity: 0.95; }
          75% { opacity: 0.7; }
          100% { opacity: 0; transform: translate(-50%, 0) translateY(-240px) scale(1.15) rotate(calc(var(--rot) * -1)); }
        }
      `}</style>

      {/* Colour flash */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${tier.flashColor} 0%, transparent 70%)`,
          animation: "comboFlash 0.85s ease-out forwards",
        }}
      />

      {/* Scanline */}
      <div
        className="absolute inset-x-0 h-36"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, ${tier.ringColor.replace("0.85", "0.42").replace("0.88", "0.46")} 50%, transparent 100%)`,
          mixBlendMode: "screen",
          animation: `comboScan ${(tier.duration * 0.44).toFixed(2)}s ease-in forwards`,
        }}
      />

      {/* Floating measurement glyphs (Measurelands only) */}
      {glyphs.map((g) => {
        const G = g.Icon;
        return (
          <span
            key={g.id}
            className="absolute bottom-[18%]"
            style={
              {
                left: `${g.left}%`,
                lineHeight: 1,
                filter: `drop-shadow(0 0 10px ${tier.flashColor})`,
                "--rot": `${g.rot}deg`,
                "--dx": `${g.drift}px`,
                animation: `comboGlyph ${(tier.duration * 0.95).toFixed(2)}s ease-out ${g.delay.toFixed(2)}s forwards`,
                opacity: 0,
              } as React.CSSProperties
            }
          >
            <G style={{ width: g.size, height: g.size, color: tier.accentColor }} />
          </span>
        );
      })}

      {/* Shockwave rings */}
      {Array.from({ length: tier.ringCount }, (_, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: 200,
            height: 200,
            borderStyle: "solid",
            borderColor: tier.ringColor,
            boxShadow: `0 0 40px ${tier.flashColor}, inset 0 0 20px ${tier.flashColor}`,
            animation: `comboRing ${(tier.duration * 0.66).toFixed(2)}s cubic-bezier(0.16,1,0.3,1) ${(i * 0.13).toFixed(2)}s forwards`,
          }}
        />
      ))}

      {/* Particle burst */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={
            {
              width: p.size,
              height: p.size,
              background: `hsl(${p.hue} 94% 63%)`,
              boxShadow: `0 0 ${p.size * 3}px hsl(${p.hue} 95% 60% / 0.95), 0 0 ${p.size * 6}px hsl(${p.hue} 95% 55% / 0.5)`,
              "--dx": `${p.x}px`,
              "--dy": `${p.y}px`,
              animation: `comboBurst ${p.duration}s cubic-bezier(0.16,1,0.3,1) ${p.delay}s forwards`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Corner energy bursts */}
      {([
        { top: "0%", left: "0%", origin: "top left" },
        { top: "0%", right: "0%", origin: "top right" },
        { bottom: "0%", left: "0%", origin: "bottom left" },
        { bottom: "0%", right: "0%", origin: "bottom right" },
      ] as const).map((pos, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            ...pos,
            width: tier.cornerSize,
            height: tier.cornerSize,
            background: `conic-gradient(from 45deg, rgba(0,0,0,0), ${tier.ringColor} 15%, ${tier.flashColor} 35%, rgba(0,0,0,0) 55%)`,
            transformOrigin: pos.origin,
            animation: `comboCorner ${(tier.duration * 0.88).toFixed(2)}s cubic-bezier(0.22,1,0.36,1) ${(0.06 * i).toFixed(2)}s forwards`,
            mixBlendMode: "screen",
          }}
        />
      ))}

      {/* Main title lockup */}
      <div
        className="absolute left-1/2 top-1/2 text-center"
        style={{ animation: `comboTitleIn ${(tier.duration + 0.18).toFixed(2)}s cubic-bezier(0.22,1,0.36,1) forwards` }}
      >
        <div
          className="font-mono font-black uppercase leading-none"
          style={{
            fontSize: "clamp(2.2rem, 6.5vw, 4.4rem)",
            letterSpacing: "0.12em",
            background: tier.titleGradient,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: tier.titleFilter,
          }}
        >
          {tier.title}
        </div>

        <div
          className="font-mono font-black uppercase"
          style={{
            fontSize: "clamp(0.9rem, 2.2vw, 1.5rem)",
            letterSpacing: "0.5em",
            marginTop: "0.14em",
            color: tier.accentColor,
            textShadow: `0 0 16px ${tier.flashColor}`,
          }}
        >
          {tier.engaged}
        </div>

        <div
          className="mx-auto mt-3 h-[2px] rounded-full"
          style={{
            width: "clamp(110px, 20vw, 250px)",
            background: tier.dividerGradient,
            boxShadow: `0 0 10px ${tier.flashColor}`,
          }}
        />

        <div
          className="mt-2 font-sans font-extrabold"
          style={{
            fontSize: "clamp(0.72rem, 1.3vw, 0.92rem)",
            letterSpacing: "0.06em",
            color: tier.accentColor,
            opacity: 0.88,
          }}
        >
          {tier.subtitle}
        </div>
      </div>

      {/* Bottom badge */}
      <div
        className="absolute left-1/2 text-center font-mono font-bold uppercase"
        style={{
          bottom: "22%",
          fontSize: "clamp(0.68rem, 1.1vw, 0.88rem)",
          letterSpacing: "0.28em",
          color: tier.accentColor,
          animation: `comboSubIn ${(tier.duration + 0.18).toFixed(2)}s ease-out 0.1s forwards`,
          opacity: 0,
        }}
      >
        Keep it going!
      </div>
    </div>
  );
}
