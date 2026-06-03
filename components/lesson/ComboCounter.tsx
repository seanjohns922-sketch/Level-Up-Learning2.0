"use client";

import { useEffect, useRef, useState } from "react";
import { Compass, Zap } from "lucide-react";

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

export function ComboCounter({ count, chainLabel, realmId }: { count: number; chainLabel?: string; realmId?: string }) {
  const isMeasurement = realmId === "measurement";
  const TIER_CONFIG = isMeasurement ? MEASUREMENT_TIER_CONFIG : NEXUS_TIER_CONFIG;
  const IconCmp = isMeasurement ? Compass : Zap;
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
  }, [count]);

  const activeTier = broken ? "cold" : getTier(count);
  const config = TIER_CONFIG[activeTier];

  return (
    <div className="relative">
      {/* Animated bezel */}
      <div
        aria-hidden
        className="absolute -inset-[2px] pointer-events-none"
        style={isMeasurement ? {
          borderRadius: 12,
          background: config.borderGradient,
          transition: "background 0.5s ease",
        } : {
          clipPath:
            "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
          background: config.borderGradient,
          transition: "background 0.5s ease",
        }}
      />

      {/* Inner plate */}
      <div
        className="relative overflow-hidden px-3 py-2.5"
        style={isMeasurement ? {
          borderRadius: 10,
          background: config.bgGradient,
          boxShadow:
            activeTier !== "cold"
              ? `inset 0 1px 0 ${config.glowColor}, inset 0 -8px 16px rgba(0,0,0,0.5), 0 0 16px ${config.glowColor}`
              : "inset 0 1px 0 rgba(200,160,48,0.12), inset 0 -8px 16px rgba(0,0,0,0.4)",
          transition: "background 0.5s ease, box-shadow 0.5s ease",
        } : {
          clipPath:
            "polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)",
          background: config.bgGradient,
          boxShadow:
            activeTier !== "cold"
              ? `inset 0 1px 0 ${config.glowColor}, inset 0 -8px 16px rgba(0,0,0,0.5), 0 0 16px ${config.glowColor}`
              : "inset 0 1px 0 rgba(94,234,212,0.08), inset 0 -8px 16px rgba(0,0,0,0.4)",
          transition: "background 0.5s ease, box-shadow 0.5s ease",
        }}
      >
        {/* Pulsing ambient glow for overdrive/nexus */}
        {(activeTier === "overdrive" || activeTier === "nexus") && !broken && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 animate-pulse"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${config.glowColor} 0%, transparent 70%)`,
              opacity: 0.4,
            }}
          />
        )}

        {/* Header row: icon + label + count badge */}
        <div className="relative flex items-center gap-1.5">
          <IconCmp
            className="h-3.5 w-3.5 flex-shrink-0"
            style={{
              color: config.iconColor,
              filter:
                activeTier !== "cold"
                  ? `drop-shadow(0 0 5px ${config.glowColor})`
                  : undefined,
              transition: "color 0.5s ease",
            }}
          />
          <span
            className="text-[10px] font-mono font-bold uppercase tracking-[0.18em]"
            style={{
              color: broken ? "rgba(248,113,113,0.9)" : config.labelColor,
              transition: "color 0.4s ease",
            }}
          >
            {broken
              ? (isMeasurement ? "STREAK LOST" : "CHAIN BROKEN")
              : milestone ?? (activeTier === "cold" && chainLabel ? chainLabel : config.label)}
          </span>
          {activeTier !== "cold" && !broken && (
            <span
              className="ml-auto text-[10px] font-mono font-bold"
              style={{
                color: config.counterColor,
                textShadow: `0 0 8px ${config.glowColor}`,
              }}
            >
              ×{count}
            </span>
          )}
        </div>

        {/* Big counter number */}
        <div
          className="relative mt-0.5 text-2xl font-black tabular-nums md:text-[1.7rem]"
          style={{
            color: broken ? "rgba(248,113,113,0.85)" : config.counterColor,
            textShadow:
              activeTier !== "cold" && !broken
                ? `0 0 18px ${config.glowColor}, 0 0 36px ${config.glowColor}`
                : broken
                ? "0 0 14px rgba(248,113,113,0.4)"
                : undefined,
            transform: bump ? "scale(1.2)" : "scale(1)",
            transition:
              "color 0.4s ease, text-shadow 0.4s ease, transform 0.15s ease-out",
          }}
        >
          {broken ? brokenFromCount : count}
        </div>
      </div>
    </div>
  );
}
