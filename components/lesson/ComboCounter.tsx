"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Gem, BarChart3, Compass, Dices, Orbit, Sigma, Volume2, VolumeX, Zap } from "lucide-react";
import { setStreakSoundsEnabled, streakSoundsEnabled, subscribeStreakSounds } from "@/lib/audio/streak-sfx";
import { LESSON_CHIP, LESSON_CHIP_LABEL, LESSON_CHIP_NUMBER } from "@/lib/lesson-bar-theme";

type ComboTier = "cold" | "spark" | "surge" | "overdrive" | "nexus";

function getTier(count: number): ComboTier {
  if (count >= 10) return "nexus";
  if (count >= 8) return "overdrive";
  if (count >= 5) return "surge";
  if (count >= 3) return "spark";
  return "cold";
}

const NEXUS_TIER_CONFIG: Record<
  ComboTier,
  {
    label: string;
    counterColor: string;
    labelColor: string;
    glowColor: string;
    borderGradient: string;
    bgGradient: string;
    iconColor: string;
  }
> = {
  cold: {
    label: "NEXUS CHAIN",
    counterColor: "rgba(94,234,212,0.5)",
    labelColor: "rgba(94,234,212,0.5)",
    glowColor: "rgba(94,234,212,0.15)",
    borderGradient:
      "linear-gradient(135deg, rgba(94,234,212,0.15) 0%, rgba(15,118,110,0.1) 50%, rgba(94,234,212,0.12) 100%)",
    bgGradient: "linear-gradient(135deg, #021a18 0%, #052e2b 100%)",
    iconColor: "rgba(94,234,212,0.35)",
  },
  spark: {
    label: "SPARK",
    counterColor: "rgba(94,234,212,1)",
    labelColor: "rgba(167,243,208,1)",
    glowColor: "rgba(94,234,212,0.55)",
    borderGradient:
      "linear-gradient(135deg, rgba(94,234,212,0.6) 0%, rgba(52,211,153,0.3) 50%, rgba(94,234,212,0.5) 100%)",
    bgGradient: "linear-gradient(135deg, #021a18 0%, #064e47 60%, #042e2b 100%)",
    iconColor: "rgba(94,234,212,0.9)",
  },
  surge: {
    label: "SURGE",
    counterColor: "rgba(253,224,71,1)",
    labelColor: "rgba(253,224,71,0.9)",
    glowColor: "rgba(253,224,71,0.6)",
    borderGradient:
      "linear-gradient(135deg, rgba(253,224,71,0.65) 0%, rgba(202,138,4,0.35) 50%, rgba(253,224,71,0.55) 100%)",
    bgGradient: "linear-gradient(135deg, #1a1200 0%, #3d2e00 60%, #261d00 100%)",
    iconColor: "rgba(253,224,71,0.9)",
  },
  overdrive: {
    label: "OVERDRIVE",
    counterColor: "rgba(251,146,60,1)",
    labelColor: "rgba(251,146,60,0.95)",
    glowColor: "rgba(251,146,60,0.7)",
    borderGradient:
      "linear-gradient(135deg, rgba(251,146,60,0.7) 0%, rgba(234,88,12,0.4) 50%, rgba(251,146,60,0.6) 100%)",
    bgGradient: "linear-gradient(135deg, #1a0800 0%, #3d1800 60%, #261000 100%)",
    iconColor: "rgba(251,146,60,0.95)",
  },
  nexus: {
    label: "NEXUS STATE",
    counterColor: "rgba(236,254,255,1)",
    labelColor: "rgba(167,243,208,0.98)",
    glowColor: "rgba(45,212,191,0.9)",
    borderGradient:
      "linear-gradient(135deg, rgba(94,234,212,0.85) 0%, rgba(16,185,129,0.5) 50%, rgba(45,212,191,0.8) 100%)",
    bgGradient: "linear-gradient(135deg, #022c28 0%, #064e3b 60%, #032420 100%)",
    iconColor: "rgba(167,243,208,1)",
  },
};

const MEASUREMENT_TIER_CONFIG: typeof NEXUS_TIER_CONFIG = {
  cold: {
    label: "EXPLORER STREAK",
    counterColor: "rgba(200,160,48,0.55)",
    labelColor: "rgba(240,210,150,0.6)",
    glowColor: "rgba(200,160,48,0.15)",
    borderGradient:
      "linear-gradient(135deg, rgba(200,160,48,0.2) 0%, rgba(120,90,15,0.1) 50%, rgba(200,160,48,0.16) 100%)",
    bgGradient: "linear-gradient(135deg, #140e04 0%, #2a1a06 100%)",
    iconColor: "rgba(200,160,48,0.4)",
  },
  spark: {
    label: "DISCOVERY",
    counterColor: "rgba(232,200,120,1)",
    labelColor: "rgba(240,220,175,1)",
    glowColor: "rgba(200,160,48,0.55)",
    borderGradient:
      "linear-gradient(135deg, rgba(200,160,48,0.6) 0%, rgba(139,101,32,0.3) 50%, rgba(200,160,48,0.5) 100%)",
    bgGradient: "linear-gradient(135deg, #1a1004 0%, #3d2808 60%, #2a1a06 100%)",
    iconColor: "rgba(232,200,120,0.95)",
  },
  surge: {
    label: "BREAKTHROUGH",
    counterColor: "rgba(253,224,71,1)",
    labelColor: "rgba(253,224,71,0.95)",
    glowColor: "rgba(253,224,71,0.6)",
    borderGradient:
      "linear-gradient(135deg, rgba(253,224,71,0.65) 0%, rgba(202,138,4,0.35) 50%, rgba(253,224,71,0.55) 100%)",
    bgGradient: "linear-gradient(135deg, #1a1200 0%, #3d2e00 60%, #261d00 100%)",
    iconColor: "rgba(253,224,71,0.95)",
  },
  overdrive: {
    label: "MASTER EXPLORER",
    counterColor: "rgba(167,139,250,1)",
    labelColor: "rgba(196,181,253,0.98)",
    glowColor: "rgba(167,139,250,0.7)",
    borderGradient:
      "linear-gradient(135deg, rgba(167,139,250,0.7) 0%, rgba(109,40,217,0.4) 50%, rgba(200,160,48,0.55) 100%)",
    bgGradient: "linear-gradient(135deg, #1a0e1f 0%, #2e1f5c 60%, #1a1004 100%)",
    iconColor: "rgba(196,181,253,0.98)",
  },
  nexus: {
    label: "LEGENDARY",
    counterColor: "rgba(254,243,199,1)",
    labelColor: "rgba(232,200,120,1)",
    glowColor: "rgba(200,160,48,0.9)",
    borderGradient:
      "linear-gradient(135deg, rgba(232,200,120,0.85) 0%, rgba(167,139,250,0.5) 50%, rgba(232,200,120,0.8) 100%)",
    bgGradient: "linear-gradient(135deg, #2a1a04 0%, #5c3d0e 60%, #2a1a06 100%)",
    iconColor: "rgba(254,243,199,1)",
  },
};

const STARPATH_TIER_CONFIG: typeof NEXUS_TIER_CONFIG = {
  cold: {
    label: "STAR CHAIN",
    counterColor: "rgba(165,243,252,0.56)",
    labelColor: "rgba(196,181,253,0.72)",
    glowColor: "rgba(103,232,249,0.18)",
    borderGradient: "linear-gradient(135deg, rgba(103,232,249,0.32) 0%, rgba(124,58,237,0.30) 52%, rgba(240,171,252,0.24) 100%)",
    bgGradient: "linear-gradient(135deg, #13072d 0%, #201a55 58%, #082f42 100%)",
    iconColor: "rgba(165,243,252,0.55)",
  },
  spark: {
    label: "IN ORBIT",
    counterColor: "rgba(103,232,249,1)",
    labelColor: "rgba(207,250,254,1)",
    glowColor: "rgba(103,232,249,0.58)",
    borderGradient: "linear-gradient(135deg, rgba(103,232,249,0.72) 0%, rgba(124,58,237,0.48) 55%, rgba(103,232,249,0.58) 100%)",
    bgGradient: "linear-gradient(135deg, #11113d 0%, #312e81 58%, #083344 100%)",
    iconColor: "rgba(165,243,252,1)",
  },
  surge: {
    label: "SUPERNOVA",
    counterColor: "rgba(240,171,252,1)",
    labelColor: "rgba(250,232,255,0.96)",
    glowColor: "rgba(217,70,239,0.62)",
    borderGradient: "linear-gradient(135deg, rgba(240,171,252,0.75) 0%, rgba(124,58,237,0.55) 50%, rgba(34,211,238,0.58) 100%)",
    bgGradient: "linear-gradient(135deg, #2e1065 0%, #4c1d95 58%, #164e63 100%)",
    iconColor: "rgba(240,171,252,1)",
  },
  overdrive: {
    label: "HYPERDRIVE",
    counterColor: "rgba(253,230,138,1)",
    labelColor: "rgba(254,243,199,0.98)",
    glowColor: "rgba(250,204,21,0.66)",
    borderGradient: "linear-gradient(135deg, rgba(253,230,138,0.78) 0%, rgba(217,70,239,0.58) 50%, rgba(34,211,238,0.62) 100%)",
    bgGradient: "linear-gradient(135deg, #312e0b 0%, #581c87 56%, #155e75 100%)",
    iconColor: "rgba(253,230,138,1)",
  },
  nexus: {
    label: "STARPATH STATE",
    counterColor: "rgba(255,255,255,1)",
    labelColor: "rgba(207,250,254,1)",
    glowColor: "rgba(103,232,249,0.88)",
    borderGradient: "linear-gradient(135deg, rgba(165,243,252,0.92) 0%, rgba(168,85,247,0.72) 50%, rgba(240,171,252,0.82) 100%)",
    bgGradient: "linear-gradient(135deg, #164e63 0%, #4c1d95 55%, #701a75 100%)",
    iconColor: "rgba(207,250,254,1)",
  },
};

const STATISTICS_TIER_CONFIG: typeof NEXUS_TIER_CONFIG = {
  cold: {
    label: "DATA STREAK",
    counterColor: "rgba(242,188,69,0.58)",
    labelColor: "rgba(255,240,199,0.72)",
    glowColor: "rgba(242,188,69,0.16)",
    borderGradient: "linear-gradient(135deg, rgba(242,188,69,0.3), rgba(240,107,100,0.22), rgba(143,191,127,0.24))",
    bgGradient: "linear-gradient(135deg, #17281f 0%, #2d4932 58%, #493821 100%)",
    iconColor: "rgba(242,188,69,0.55)",
  },
  spark: {
    label: "PATTERN FOUND",
    counterColor: "rgba(143,191,127,1)",
    labelColor: "rgba(218,241,202,1)",
    glowColor: "rgba(143,191,127,0.55)",
    borderGradient: "linear-gradient(135deg, rgba(143,191,127,0.72), rgba(242,188,69,0.4), rgba(143,191,127,0.55))",
    bgGradient: "linear-gradient(135deg, #173021 0%, #31563a 60%, #3c3420 100%)",
    iconColor: "rgba(183,221,166,1)",
  },
  surge: {
    label: "INSIGHT",
    counterColor: "rgba(242,188,69,1)",
    labelColor: "rgba(255,224,150,1)",
    glowColor: "rgba(242,188,69,0.62)",
    borderGradient: "linear-gradient(135deg, rgba(242,188,69,0.78), rgba(240,107,100,0.46), rgba(242,188,69,0.62))",
    bgGradient: "linear-gradient(135deg, #342716 0%, #59421d 58%, #3a2b1b 100%)",
    iconColor: "rgba(255,212,126,1)",
  },
  overdrive: {
    label: "DATA TRAIL",
    counterColor: "rgba(240,107,100,1)",
    labelColor: "rgba(255,189,182,1)",
    glowColor: "rgba(240,107,100,0.68)",
    borderGradient: "linear-gradient(135deg, rgba(240,107,100,0.78), rgba(242,188,69,0.52), rgba(143,191,127,0.5))",
    bgGradient: "linear-gradient(135deg, #4a2424 0%, #65352a 58%, #31432c 100%)",
    iconColor: "rgba(255,174,166,1)",
  },
  nexus: {
    label: "MASTER ANALYST",
    counterColor: "rgba(255,250,232,1)",
    labelColor: "rgba(255,224,150,1)",
    glowColor: "rgba(242,188,69,0.9)",
    borderGradient: "linear-gradient(135deg, rgba(242,188,69,0.9), rgba(240,107,100,0.72), rgba(143,191,127,0.72))",
    bgGradient: "linear-gradient(135deg, #364320 0%, #684328 55%, #55302c 100%)",
    iconColor: "rgba(255,240,199,1)",
  },
};

const CHANCE_TIER_CONFIG: typeof NEXUS_TIER_CONFIG = {
  cold: {
    label: "CHANCE STREAK",
    counterColor: "rgba(251,113,133,0.56)",
    labelColor: "rgba(255,228,230,0.68)",
    glowColor: "rgba(251,113,133,0.16)",
    borderGradient: "linear-gradient(135deg, rgba(251,113,133,0.3), rgba(251,191,36,0.2), rgba(34,211,238,0.18))",
    bgGradient: "linear-gradient(135deg, #1f1220 0%, #351d2b 58%, #4b2a14 100%)",
    iconColor: "rgba(251,113,133,0.55)",
  },
  spark: {
    label: "LUCKY ROLL",
    counterColor: "rgba(251,113,133,1)",
    labelColor: "rgba(255,228,230,1)",
    glowColor: "rgba(251,113,133,0.58)",
    borderGradient: "linear-gradient(135deg, rgba(251,113,133,0.72), rgba(251,191,36,0.42), rgba(251,113,133,0.55))",
    bgGradient: "linear-gradient(135deg, #3a1428 0%, #6b1d3c 60%, #4b2a14 100%)",
    iconColor: "rgba(255,228,230,1)",
  },
  surge: {
    label: "SPINNER SURGE",
    counterColor: "rgba(251,191,36,1)",
    labelColor: "rgba(253,230,138,1)",
    glowColor: "rgba(251,191,36,0.62)",
    borderGradient: "linear-gradient(135deg, rgba(251,191,36,0.78), rgba(251,113,133,0.5), rgba(34,211,238,0.38))",
    bgGradient: "linear-gradient(135deg, #3a2413 0%, #7c2d12 58%, #581c35 100%)",
    iconColor: "rgba(253,230,138,1)",
  },
  overdrive: {
    label: "FORTUNE STREAK",
    counterColor: "rgba(34,211,238,1)",
    labelColor: "rgba(207,250,254,0.98)",
    glowColor: "rgba(34,211,238,0.66)",
    borderGradient: "linear-gradient(135deg, rgba(34,211,238,0.75), rgba(251,113,133,0.62), rgba(251,191,36,0.55))",
    bgGradient: "linear-gradient(135deg, #083344 0%, #5b2145 58%, #7c2d12 100%)",
    iconColor: "rgba(207,250,254,1)",
  },
  nexus: {
    label: "FORTUNE FLOW",
    counterColor: "rgba(255,255,255,1)",
    labelColor: "rgba(255,228,230,1)",
    glowColor: "rgba(251,113,133,0.86)",
    borderGradient: "linear-gradient(135deg, rgba(251,113,133,0.9), rgba(251,191,36,0.76), rgba(34,211,238,0.7))",
    bgGradient: "linear-gradient(135deg, #6b1d3c 0%, #b45309 55%, #0e7490 100%)",
    iconColor: "rgba(255,241,242,1)",
  },
};

export function ComboCounter({ count, chainLabel, realmId, cave=false }: { count: number; chainLabel?: string; realmId?: string; cave?:boolean }) {
  const isMeasurement = realmId === "measurement";
  const isStarpath = realmId === "space";
  const isStatistics = realmId === "statistics";
  const isPattern = realmId === "pattern";
  const isChance = realmId === "chance";
  // Pattern Peaks reuses the green-family combo tiers (closest to its emerald
  // theme) with its own Sigma glyph.
  const TIER_CONFIG = isMeasurement ? MEASUREMENT_TIER_CONFIG : isStarpath ? STARPATH_TIER_CONFIG : isStatistics || isPattern ? STATISTICS_TIER_CONFIG : isChance ? CHANCE_TIER_CONFIG : NEXUS_TIER_CONFIG;
  const IconCmp = cave ? Gem : isMeasurement ? Compass : isStarpath ? Orbit : isStatistics ? BarChart3 : isPattern ? Sigma : isChance ? Dices : Zap;
  const prevCountRef = useRef(count);
  const [broken, setBroken] = useState(false);
  const [bump, setBump] = useState(false);
  const [milestone, setMilestone] = useState<string | null>(null);
  const [brokenFromCount, setBrokenFromCount] = useState(0);

  useEffect(() => {
    const prev = prevCountRef.current;
    prevCountRef.current = count;

    if (count === 0 && prev >= 3) {
      setBrokenFromCount(prev);
      setBroken(true);
      const t = setTimeout(() => setBroken(false), 800);
      return () => clearTimeout(t);
    }

    if (count > prev) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 180);

      // Show milestone label briefly when crossing a threshold
      const prevTier = getTier(prev);
      const newTier = getTier(count);
      if (newTier !== prevTier && newTier !== "cold") {
        const label = TIER_CONFIG[newTier].label;
        setMilestone(label);
        const m = setTimeout(() => setMilestone(null), 1200);
        return () => {
          clearTimeout(t);
          clearTimeout(m);
        };
      }
      return () => clearTimeout(t);
    }
  }, [count, TIER_CONFIG]);

  const activeTier = broken ? "cold" : getTier(count);
  const config = TIER_CONFIG[activeTier];
  const lit = activeTier !== "cold" && !broken;
  const label = broken
    ? (isMeasurement ? "STREAK LOST" : isStarpath ? "SIGNAL LOST" : isStatistics ? "TRAIL RESET" : isChance ? "STREAK RESET" : "CHAIN BROKEN")
    : cave ? "CRYSTAL STREAK" : milestone ?? (activeTier === "cold" && chainLabel ? chainLabel : config.label);

  return (
    <div
      data-combo-counter
      className={LESSON_CHIP}
      style={{
        background: config.bgGradient,
        boxShadow: lit ? `inset 0 1px 0 ${config.glowColor}, 0 0 16px ${config.glowColor}` : undefined,
        transition: "background 0.5s ease, box-shadow 0.5s ease",
      }}
    >
      <IconCmp
        aria-hidden
        className="h-[22px] w-[22px] shrink-0"
        style={{
          color: config.iconColor,
          filter: lit ? `drop-shadow(0 0 5px ${config.glowColor})` : undefined,
          transition: "color 0.5s ease",
        }}
      />
      <span
        className={LESSON_CHIP_NUMBER}
        style={{
          color: broken ? "rgba(248,113,113,0.9)" : lit ? config.counterColor : "#ffffff",
          textShadow: lit ? `0 0 14px ${config.glowColor}` : undefined,
          transform: bump ? "scale(1.2)" : "scale(1)",
          transition: "color 0.4s ease, text-shadow 0.4s ease, transform 0.15s ease-out",
        }}
      >
        {broken ? brokenFromCount : count}
      </span>
      <span
        className={LESSON_CHIP_LABEL}
        style={{ color: broken ? "rgba(248,113,113,0.9)" : lit ? config.labelColor : "rgba(255,255,255,0.8)", transition: "color 0.4s ease" }}
      >
        {label.toLowerCase()}
      </span>
    </div>
  );
}

/** Streak sounds on/off: off by default, remembered on this device. */
export function StreakSoundToggle({ className = "" }: { className?: string }) {
  const soundsOn = useSyncExternalStore(subscribeStreakSounds, streakSoundsEnabled, () => false);
  return (
    <button
      type="button"
      onClick={() => setStreakSoundsEnabled(!soundsOn)}
      aria-pressed={soundsOn}
      aria-label={soundsOn ? "Turn streak sounds off" : "Turn streak sounds on"}
      title={soundsOn ? "Streak sounds on" : "Streak sounds off"}
      className={`grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[14px] border border-white/20 bg-white/[0.06] text-white transition hover:bg-white/15 ${className}`}
    >
      {soundsOn ? <Volume2 className="h-[22px] w-[22px]" aria-hidden /> : <VolumeX className="h-[22px] w-[22px]" aria-hidden />}
    </button>
  );
}
