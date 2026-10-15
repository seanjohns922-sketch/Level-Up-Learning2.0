"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import { Braces, CircleDot, Dices, Equal, Hourglass, Cog, Timer, Scale, Ruler, Sigma, Star, Sparkles, Orbit } from "lucide-react";
import StreakBurst, { type StreakStyle } from "@/components/lesson/StreakBurst";

type GlyphIcon = ComponentType<{ className?: string; style?: React.CSSProperties }>;

/**
 * Full-screen activation burst for the mid-streak tiers (5 and 8).
 * Realm-aware:
 *   - Number Nexus: SURGE (5, gold) / OVERDRIVE (8, orange) — sci-fi energy.
 *   - Measurelands: BREAKTHROUGH (5, brass) / MASTER EXPLORER (8, purple+brass)
 *     — magical measurement bursts with floating hourglass/ruler glyphs.
 * NexusActivation handles 10-combo (Nexus State / Legendary) separately.
 * The celebration itself is StreakBurst, which draws each realm's own scene
 * and plays its sound; these configs supply the titles and colours.
 */

/** Which realm scene and sound a lesson's realm uses. */
export function streakStyleFor(realmId?: string): StreakStyle {
  switch (realmId) {
    case "measurement": return "measure";
    case "space": return "star";
    case "pattern": return "pattern";
    case "statistics": return "data";
    case "chance": return "chance";
    default: return "nexus";
  }
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

const STATISTICS_TIERS: TierConfig[] = [
  {
    threshold: 5,
    title: "INSIGHT",
    engaged: "DISCOVERED",
    subtitle: "5 in a row — the data pattern is becoming clear!",
    hues: [42, 105],
    flashColor: "rgba(242,188,69,0.5)",
    ringColor: "rgba(242,188,69,0.85)",
    ringCount: 3,
    particleCount: 26,
    duration: 1.8,
    cornerSize: 120,
    titleGradient: "linear-gradient(180deg, #fff8e8 0%, #f2bc45 48%, #9a6524 100%)",
    titleFilter: "drop-shadow(0 0 20px rgba(242,188,69,0.9)) drop-shadow(0 0 42px rgba(143,191,127,0.65))",
    accentColor: "rgba(255,224,150,0.95)",
    dividerGradient: "linear-gradient(90deg, transparent, rgba(242,188,69,0.9), rgba(143,191,127,0.7), transparent)",
  },
  {
    threshold: 8,
    title: "DATA TRAIL",
    engaged: "BLAZING",
    subtitle: "8 in a row — you are reading the evidence brilliantly!",
    hues: [4, 42],
    flashColor: "rgba(240,107,100,0.52)",
    ringColor: "rgba(240,107,100,0.86)",
    ringCount: 4,
    particleCount: 38,
    duration: 2.2,
    cornerSize: 140,
    titleGradient: "linear-gradient(180deg, #fff7ed 0%, #f06b64 46%, #a93f3c 100%)",
    titleFilter: "drop-shadow(0 0 22px rgba(240,107,100,0.92)) drop-shadow(0 0 46px rgba(242,188,69,0.68))",
    accentColor: "rgba(255,189,182,0.96)",
    dividerGradient: "linear-gradient(90deg, transparent, rgba(240,107,100,0.9), rgba(242,188,69,0.7), transparent)",
  },
];

const PATTERN_TIERS: TierConfig[] = [
  {
    threshold: 5,
    title: "RULE FOUND",
    engaged: "CONNECTED",
    subtitle: "5 in a row - the pattern is taking shape!",
    hues: [152, 265],
    flashColor: "rgba(52,211,153,0.52)",
    ringColor: "rgba(110,231,183,0.88)",
    ringCount: 3,
    particleCount: 28,
    duration: 1.8,
    cornerSize: 120,
    titleGradient: "linear-gradient(180deg, #ecfdf5 0%, #34d399 48%, #047857 100%)",
    titleFilter: "drop-shadow(0 0 20px rgba(52,211,153,0.92)) drop-shadow(0 0 42px rgba(91,33,182,0.62))",
    accentColor: "rgba(167,243,208,0.96)",
    dividerGradient: "linear-gradient(90deg, transparent, rgba(52,211,153,0.9), rgba(139,92,246,0.68), transparent)",
    glyphs: [Sigma, Equal, Braces],
  },
  {
    threshold: 8,
    title: "PATTERN CHAIN",
    engaged: "ASCENDING",
    subtitle: "8 in a row - every rule is connecting!",
    hues: [265, 152],
    flashColor: "rgba(139,92,246,0.54)",
    ringColor: "rgba(196,181,253,0.9)",
    ringCount: 4,
    particleCount: 40,
    duration: 2.2,
    cornerSize: 145,
    titleGradient: "linear-gradient(180deg, #f5f3ff 0%, #a78bfa 46%, #5b21b6 100%)",
    titleFilter: "drop-shadow(0 0 22px rgba(167,139,250,0.96)) drop-shadow(0 0 46px rgba(16,185,129,0.68))",
    accentColor: "rgba(221,214,254,0.98)",
    dividerGradient: "linear-gradient(90deg, transparent, rgba(167,139,250,0.92), rgba(52,211,153,0.7), transparent)",
    glyphs: [Sigma, Braces, Equal],
  },
];

const CHANCE_TIERS: TierConfig[] = [
  {
    threshold: 5,
    title: "SPINNER SURGE",
    engaged: "ROLLING",
    subtitle: "5 in a row - chance is on your side!",
    hues: [345, 42],
    flashColor: "rgba(251,113,133,0.54)",
    ringColor: "rgba(251,113,133,0.88)",
    ringCount: 3,
    particleCount: 30,
    duration: 1.9,
    cornerSize: 125,
    titleGradient: "linear-gradient(180deg, #fff1f2 0%, #fb7185 48%, #be123c 100%)",
    titleFilter: "drop-shadow(0 0 20px rgba(251,113,133,0.96)) drop-shadow(0 0 42px rgba(251,191,36,0.58))",
    accentColor: "rgba(255,228,230,0.96)",
    dividerGradient: "linear-gradient(90deg, transparent, rgba(251,113,133,0.9), rgba(251,191,36,0.72), transparent)",
    glyphs: [Dices, CircleDot, Sparkles],
  },
  {
    threshold: 8,
    title: "FORTUNE STREAK",
    engaged: "SPINNING",
    subtitle: "8 in a row - the wheel is heating up!",
    hues: [42, 188],
    flashColor: "rgba(251,191,36,0.56)",
    ringColor: "rgba(251,191,36,0.9)",
    ringCount: 4,
    particleCount: 42,
    duration: 2.3,
    cornerSize: 150,
    titleGradient: "linear-gradient(180deg, #fffbeb 0%, #fbbf24 46%, #fb7185 100%)",
    titleFilter: "drop-shadow(0 0 22px rgba(251,191,36,0.96)) drop-shadow(0 0 46px rgba(251,113,133,0.72))",
    accentColor: "rgba(253,230,138,0.98)",
    dividerGradient: "linear-gradient(90deg, transparent, rgba(251,191,36,0.92), rgba(251,113,133,0.74), transparent)",
    glyphs: [CircleDot, Dices, Sparkles],
  },
];

type ActivationKey = { id: number; tier: TierConfig; count: number };

/** Celebration strength and length by threshold: 3 is a quick spark, 8 is nearly the finale. */
const powerFor = (threshold: number) => (threshold >= 8 ? 3 : threshold >= 5 ? 2 : 1) as 1 | 2 | 3;
const durationFor = (threshold: number) => (threshold >= 8 ? 2.4 : threshold >= 5 ? 2.0 : 1.6);

const CAVE_TIERS=NEXUS_TIERS.map((tier,index)=>({...tier,title:index===0?'CRYSTAL SURGE':'CAVERN GLOW'}));

export default function ComboActivation({ comboCount, realmId, cave=false }: { comboCount: number; realmId?: string; cave?:boolean }) {
  const isMeasurement = realmId === "measurement";
  const isStarpath = realmId === "space";
  const isStatistics = realmId === "statistics";
  const isPattern = realmId === "pattern";
  const isChance = realmId === "chance";
  const tiers = cave && isStarpath ? STARPATH_TIERS.map((tier,index)=>({...tier,title:index===0?"STAR CRYSTAL SURGE":"CAVERN GLOW"})) : cave && isMeasurement ? MEASURE_TIERS.map((tier,index)=>({...tier,title:index===0?'AMBER SURGE':'CAVERN GLOW'})) : cave && (!realmId || realmId === "number") ? CAVE_TIERS : isMeasurement ? MEASURE_TIERS : isStarpath ? STARPATH_TIERS : isStatistics ? STATISTICS_TIERS : isPattern ? PATTERN_TIERS : isChance ? CHANCE_TIERS : NEXUS_TIERS;
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
        setActive({ id: idRef.current, tier, count: comboCount });
        const t = setTimeout(() => setActive(null), Math.round(durationFor(tier.threshold) * 1000) + 100);
        try {
          window.dispatchEvent(new CustomEvent(`lul:${tier.title.toLowerCase().replace(/\s+/g, "-")}-activated`));
        } catch {}
        return () => clearTimeout(t);
      }
    }
  }, [comboCount, tiers]);

  if (!active) return null;
  const { tier } = active;

  return (
    <StreakBurst
      key={active.id}
      count={active.count}
      power={powerFor(tier.threshold)}
      title={tier.title}
      engaged={tier.engaged}
      realm={streakStyleFor(realmId)}
      hues={tier.hues}
      face={tier.titleGradient}
      duration={durationFor(tier.threshold)}
    />
  );
}
