"use client";

import { useEffect, useRef, useState } from "react";
import StreakBurst from "@/components/lesson/StreakBurst";
import { streakStyleFor } from "@/components/lesson/ComboActivation";

/**
 * The top-tier 10-combo celebration.
 * Realm-aware:
 *   - Number Nexus: "NEXUS STATE — ACTIVATED" (teal energy grid + data scanline).
 *   - Measurelands: "LEGENDARY — EXPLORER" (golden clock-face bloom, sweeping
 *     clock hand, purple+brass particle storm, floating measurement glyphs).
 * Rendered by StreakBurst at full power, in the realm's own scene: the finale
 * adds realm-shaped confetti, an edge glow, the biggest slam and a fanfare.
 */

type ActivationKey = { id: number; count: number };

type RealmTheme = {
  flashBg: string;
  gridColor: string;
  scanColor: string;
  ringInner: string;
  ringOuter: string;
  ringShadow: string;
  cornerConic: string;
  titleGradient: string;
  titleFilter: string;
  title: string;
  engaged: string;
  engagedColor: string;
  engagedShadow: string;
  dividerGradient: string;
  dividerShadow: string;
  copy: string;
  copyColor: string;
  copyShadow: string;
  bottomText: string;
  bottomColor: string;
  bottomShadow: string;
  particleHues: [number, number];
  particleSplit: number;
};

const NEXUS_THEME: RealmTheme = {
  flashBg: "radial-gradient(circle at 50% 50%, rgba(45,212,191,0.65) 0%, rgba(16,185,129,0.3) 40%, rgba(2,6,23,0) 75%)",
  gridColor: "rgba(94,234,212,0.18)",
  scanColor: "rgba(94,234,212,0.45)",
  ringInner: "rgba(94,234,212,0.9)",
  ringOuter: "rgba(45,212,191,0.6)",
  ringShadow: "0 0 50px rgba(45,212,191,0.7), inset 0 0 24px rgba(94,234,212,0.45)",
  cornerConic:
    "conic-gradient(from 45deg, rgba(94,234,212,0.0), rgba(94,234,212,0.7) 15%, rgba(45,212,191,0.5) 30%, rgba(16,185,129,0.3) 45%, rgba(94,234,212,0.0) 60%)",
  titleGradient: "linear-gradient(180deg, #ecfeff 0%, #5eead4 45%, #10b981 100%)",
  titleFilter: "drop-shadow(0 0 24px rgba(45,212,191,0.95)) drop-shadow(0 0 48px rgba(16,185,129,0.7))",
  title: "NEXUS STATE",
  engaged: "ACTIVATED",
  engagedColor: "rgba(167,243,208,0.98)",
  engagedShadow: "0 0 18px rgba(45,212,191,0.9), 0 0 36px rgba(20,184,166,0.7)",
  dividerGradient: "linear-gradient(90deg, transparent, rgba(94,234,212,0.9), rgba(16,185,129,0.7), transparent)",
  dividerShadow: "0 0 12px rgba(45,212,191,0.7)",
  copy: "Your number power is surging!",
  copyColor: "rgba(167,243,208,0.9)",
  copyShadow: "0 0 10px rgba(20,184,166,0.8)",
  bottomText: "10 correct in a row",
  bottomColor: "rgba(94,234,212,0.9)",
  bottomShadow: "0 0 12px rgba(20,184,166,0.8)",
  particleHues: [168, 152],
  particleSplit: 0.55,
};

const MEASURE_THEME: RealmTheme = {
  flashBg: "radial-gradient(circle at 50% 50%, rgba(200,160,48,0.6) 0%, rgba(109,40,217,0.32) 42%, rgba(20,8,0,0) 75%)",
  gridColor: "rgba(200,160,48,0.16)",
  scanColor: "rgba(200,160,48,0.4)",
  ringInner: "rgba(232,200,120,0.9)",
  ringOuter: "rgba(167,139,250,0.6)",
  ringShadow: "0 0 50px rgba(200,160,48,0.6), inset 0 0 24px rgba(167,139,250,0.4)",
  cornerConic:
    "conic-gradient(from 45deg, rgba(200,160,48,0.0), rgba(200,160,48,0.7) 15%, rgba(167,139,250,0.5) 30%, rgba(109,40,217,0.3) 45%, rgba(200,160,48,0.0) 60%)",
  titleGradient: "linear-gradient(180deg, #fff8e8 0%, #e8c878 45%, #8b6520 100%)",
  titleFilter: "drop-shadow(0 0 24px rgba(200,160,48,0.95)) drop-shadow(0 0 48px rgba(109,40,217,0.6))",
  title: "LEGENDARY",
  engaged: "EXPLORER",
  engagedColor: "rgba(232,200,120,0.98)",
  engagedShadow: "0 0 18px rgba(200,160,48,0.9), 0 0 36px rgba(109,40,217,0.6)",
  dividerGradient: "linear-gradient(90deg, transparent, rgba(200,160,48,0.9), rgba(167,139,250,0.7), transparent)",
  dividerShadow: "0 0 12px rgba(200,160,48,0.7)",
  copy: "Your measuring magic is legendary!",
  copyColor: "rgba(232,200,120,0.92)",
  copyShadow: "0 0 10px rgba(139,101,32,0.8)",
  bottomText: "10 in a row — Meazurex is impressed",
  bottomColor: "rgba(200,160,48,0.9)",
  bottomShadow: "0 0 12px rgba(139,101,32,0.8)",
  particleHues: [42, 265],
  particleSplit: 0.5,
};

const STARPATH_THEME: RealmTheme = {
  flashBg: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.6) 0%, rgba(167,139,250,0.35) 38%, rgba(5,8,28,0) 74%)",
  gridColor: "rgba(196,181,253,0.16)",
  scanColor: "rgba(103,232,249,0.45)",
  ringInner: "rgba(255,255,255,0.92)",
  ringOuter: "rgba(196,181,253,0.6)",
  ringShadow: "0 0 54px rgba(196,181,253,0.7), inset 0 0 26px rgba(255,255,255,0.4)",
  cornerConic:
    "conic-gradient(from 45deg, rgba(196,181,253,0.0), rgba(214,166,74,0.7) 15%, rgba(196,181,253,0.5) 30%, rgba(103,232,249,0.3) 45%, rgba(196,181,253,0.0) 60%)",
  titleGradient: "linear-gradient(180deg, #ffffff 0%, #e9d5ff 42%, #7c3aed 100%)",
  titleFilter: "drop-shadow(0 0 26px rgba(233,213,255,0.98)) drop-shadow(0 0 52px rgba(124,58,237,0.7))",
  title: "SINGULARITY",
  engaged: "ACHIEVED",
  engagedColor: "rgba(233,213,255,0.98)",
  engagedShadow: "0 0 18px rgba(196,181,253,0.9), 0 0 36px rgba(103,232,249,0.6)",
  dividerGradient: "linear-gradient(90deg, transparent, rgba(233,213,255,0.9), rgba(214,166,74,0.7), transparent)",
  dividerShadow: "0 0 12px rgba(196,181,253,0.7)",
  copy: "Your star chain collapses into a singularity!",
  copyColor: "rgba(221,214,254,0.92)",
  copyShadow: "0 0 10px rgba(124,58,237,0.8)",
  bottomText: "10 correct in a row — cosmic mastery",
  bottomColor: "rgba(196,181,253,0.9)",
  bottomShadow: "0 0 12px rgba(124,58,237,0.8)",
  particleHues: [265, 45], // violet + gold
  particleSplit: 0.6,
};

const STATISTICS_THEME: RealmTheme = {
  flashBg: "radial-gradient(circle at 50% 50%, rgba(242,188,69,0.58) 0%, rgba(240,107,100,0.3) 40%, rgba(20,35,29,0) 75%)",
  gridColor: "rgba(143,191,127,0.16)",
  scanColor: "rgba(242,188,69,0.42)",
  ringInner: "rgba(255,240,199,0.92)",
  ringOuter: "rgba(240,107,100,0.62)",
  ringShadow: "0 0 52px rgba(242,188,69,0.68), inset 0 0 24px rgba(143,191,127,0.42)",
  cornerConic: "conic-gradient(from 45deg, rgba(242,188,69,0), rgba(242,188,69,0.72) 15%, rgba(240,107,100,0.54) 30%, rgba(143,191,127,0.34) 45%, rgba(242,188,69,0) 60%)",
  titleGradient: "linear-gradient(180deg, #fffaf0 0%, #f2bc45 44%, #c74f4b 100%)",
  titleFilter: "drop-shadow(0 0 24px rgba(242,188,69,0.95)) drop-shadow(0 0 48px rgba(240,107,100,0.68))",
  title: "MASTER ANALYST",
  engaged: "ACHIEVED",
  engagedColor: "rgba(255,224,150,0.98)",
  engagedShadow: "0 0 18px rgba(242,188,69,0.9), 0 0 36px rgba(240,107,100,0.64)",
  dividerGradient: "linear-gradient(90deg, transparent, rgba(242,188,69,0.9), rgba(240,107,100,0.72), transparent)",
  dividerShadow: "0 0 12px rgba(242,188,69,0.7)",
  copy: "You followed the data trail to a powerful insight!",
  copyColor: "rgba(255,240,199,0.94)",
  copyShadow: "0 0 10px rgba(240,107,100,0.74)",
  bottomText: "10 correct in a row — evidence mastered",
  bottomColor: "rgba(143,191,127,0.94)",
  bottomShadow: "0 0 12px rgba(143,191,127,0.72)",
  particleHues: [42, 4],
  particleSplit: 0.55,
};

const PATTERN_THEME: RealmTheme = {
  flashBg: "radial-gradient(circle at 50% 50%, rgba(52,211,153,0.62) 0%, rgba(124,58,237,0.34) 40%, rgba(4,20,16,0) 75%)",
  gridColor: "rgba(110,231,183,0.17)",
  scanColor: "rgba(196,181,253,0.44)",
  ringInner: "rgba(167,243,208,0.94)",
  ringOuter: "rgba(167,139,250,0.64)",
  ringShadow: "0 0 54px rgba(52,211,153,0.7), inset 0 0 26px rgba(167,139,250,0.42)",
  cornerConic: "conic-gradient(from 45deg, rgba(52,211,153,0), rgba(52,211,153,0.74) 15%, rgba(167,139,250,0.56) 30%, rgba(250,204,21,0.28) 45%, rgba(52,211,153,0) 60%)",
  titleGradient: "linear-gradient(180deg, #ecfdf5 0%, #6ee7b7 42%, #7c3aed 100%)",
  titleFilter: "drop-shadow(0 0 26px rgba(110,231,183,0.98)) drop-shadow(0 0 52px rgba(124,58,237,0.72))",
  title: "PATTERN MASTERY",
  engaged: "ACHIEVED",
  engagedColor: "rgba(221,214,254,0.98)",
  engagedShadow: "0 0 18px rgba(167,139,250,0.9), 0 0 36px rgba(52,211,153,0.66)",
  dividerGradient: "linear-gradient(90deg, transparent, rgba(110,231,183,0.92), rgba(167,139,250,0.74), transparent)",
  dividerShadow: "0 0 12px rgba(52,211,153,0.74)",
  copy: "You connected every step in the pattern!",
  copyColor: "rgba(209,250,229,0.94)",
  copyShadow: "0 0 10px rgba(16,185,129,0.8)",
  bottomText: "10 correct in a row - rule mastered",
  bottomColor: "rgba(196,181,253,0.94)",
  bottomShadow: "0 0 12px rgba(124,58,237,0.78)",
  particleHues: [152, 265],
  particleSplit: 0.55,
};

const CHANCE_THEME: RealmTheme = {
  flashBg: "radial-gradient(circle at 50% 50%, rgba(251,113,133,0.62) 0%, rgba(251,191,36,0.34) 40%, rgba(31,18,32,0) 75%)",
  gridColor: "rgba(255,228,230,0.16)",
  scanColor: "rgba(251,191,36,0.42)",
  ringInner: "rgba(255,228,230,0.94)",
  ringOuter: "rgba(251,113,133,0.66)",
  ringShadow: "0 0 54px rgba(251,113,133,0.72), inset 0 0 26px rgba(251,191,36,0.42)",
  cornerConic: "conic-gradient(from 45deg, rgba(251,113,133,0), rgba(251,113,133,0.76) 15%, rgba(251,191,36,0.58) 30%, rgba(34,211,238,0.32) 45%, rgba(251,113,133,0) 60%)",
  titleGradient: "linear-gradient(180deg, #fff1f2 0%, #fb7185 42%, #fbbf24 100%)",
  titleFilter: "drop-shadow(0 0 26px rgba(251,113,133,0.98)) drop-shadow(0 0 52px rgba(251,191,36,0.68))",
  title: "FORTUNE FLOW",
  engaged: "UNLOCKED",
  engagedColor: "rgba(255,228,230,0.98)",
  engagedShadow: "0 0 18px rgba(251,113,133,0.9), 0 0 36px rgba(251,191,36,0.62)",
  dividerGradient: "linear-gradient(90deg, transparent, rgba(251,113,133,0.92), rgba(251,191,36,0.74), transparent)",
  dividerShadow: "0 0 12px rgba(251,113,133,0.74)",
  copy: "The wheel is spinning in your favour!",
  copyColor: "rgba(255,228,230,0.94)",
  copyShadow: "0 0 10px rgba(251,113,133,0.82)",
  bottomText: "10 correct in a row - probability mastered",
  bottomColor: "rgba(253,230,138,0.94)",
  bottomShadow: "0 0 12px rgba(251,191,36,0.78)",
  particleHues: [345, 42],
  particleSplit: 0.55,
};

const FINALE_SECONDS = 3.2;

const CAVE_THEME={...NEXUS_THEME,title:'CRYSTAL RADIANCE'};

export default function NexusActivation({ comboCount, realmId, cave=false }: { comboCount: number; realmId?: string; cave?:boolean }) {
  const isMeasurement = realmId === "measurement";
  const isStarpath = realmId === "space";
  const isStatistics = realmId === "statistics";
  const isPattern = realmId === "pattern";
  const isChance = realmId === "chance";
  const t = cave && isStarpath ? {...STARPATH_THEME,title:"STAR CRYSTAL RADIANCE"} : cave && isMeasurement ? {...MEASURE_THEME,title:'AMBER RADIANCE'} : cave && (!realmId || realmId === "number") ? CAVE_THEME : isMeasurement ? MEASURE_THEME : isStarpath ? STARPATH_THEME : isStatistics ? STATISTICS_THEME : isPattern ? PATTERN_THEME : isChance ? CHANCE_THEME : NEXUS_THEME;
  const prevRef = useRef(comboCount);
  const idRef = useRef(0);
  const [active, setActive] = useState<ActivationKey | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = comboCount;
    if (prev < 10 && comboCount >= 10) {
      idRef.current += 1;
      setActive({ id: idRef.current, count: comboCount });
      const timer = setTimeout(() => setActive(null), FINALE_SECONDS * 1000 + 100);
      try {
        window.dispatchEvent(new CustomEvent(isMeasurement ? "lul:legendary-activated" : isStatistics ? "lul:master-analyst-activated" : isPattern ? "lul:pattern-mastery-activated" : isChance ? "lul:fortune-flow-activated" : "lul:nexus-activated"));
      } catch {}
      return () => clearTimeout(timer);
    }
  }, [comboCount, isChance, isMeasurement, isPattern, isStatistics]);

  if (!active) return null;

  return (
    <StreakBurst
      key={active.id}
      count={active.count}
      power={4}
      title={t.title}
      engaged={t.engaged}
      subtitle={t.copy}
      realm={streakStyleFor(realmId)}
      hues={t.particleHues}
      face={t.titleGradient}
      duration={FINALE_SECONDS}
    />
  );
}
