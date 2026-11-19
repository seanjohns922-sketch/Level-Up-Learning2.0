"use client";

import { useState, type CSSProperties } from "react";
import { learningStatementFor, successCriteriaStatementsFor } from "@/lib/lesson-statements";
import LowerLessonGuide from "./LowerLessonGuide";
import { getLowerLessonGuide } from "@/data/lesson-guides/lower-level";
import { getGroundGuide } from "@/data/lesson-guides/ground";
import GroundLessonGuide from "./GroundLessonGuide";
import Level7JourneyLinks from "./Level7JourneyLinks";

import {getRealmTheme} from "@/lib/useRealmTheme";
import { getWeeklyQuizTheme } from "@/lib/weekly-quiz-theme";
import layout from "./Number7LessonLayout.module.css";
import caveLayout from "./cave7/Cave7LessonLayout.module.css";
import spaceLayout from "./Space7LessonLayout.module.css";
import measurementLayout from "./Measurement7LessonLayout.module.css";

import {
  ArrowLeft,
  Check,
  Clock3,
  Flame,
  Gem,
  ChartNoAxesColumnIncreasing,
  Home,
  Dices,
  Medal,
  Play,
  Ruler,
  Sigma,
  Sparkles,
  Star,
  UserRound,
  Video,
  Zap,
} from "lucide-react";
import Link from "next/link";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { FitToScreen } from "@/components/FitToScreen";
import ChanceVisual from "@/components/chance-hollow/ChanceVisual";
import type { ChanceVisual as ChanceVisualData } from "@/data/activities/year1/practice-task";
import { getHomeBg } from "@/lib/levelBand";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { getStatisticaBackground } from "@/lib/statistica-visuals";
import { getPatternPeaksBackground } from "@/lib/pattern-peaks-visuals";
import { getChanceHollowBackground } from "@/lib/chance-hollow-visuals";

export type RealmLessonThemeId = "space" | "number" | "measurement" | "statistics" | "pattern" | "chance";

type RealmLessonHomeProps = {
  realm: RealmLessonThemeId;
  levelNumber: number;
  levelLabel: string;
  year: string;
  week: number;
  lessonNumber: number;
  lessonTitle: string;
  focus: string;
  successCriteria: readonly string[];
  conceptIntro?: LessonConceptIntroData;
  embeddedVideoSrc?: string;
  hasNativeStartGuide?: boolean;
  startDisabled?: boolean;
  startDisabledLabel?: string;
  /** Replaces the realm's standard intro line (Starpath shows each mission's own brief). */
  intro?: string;
  /** Replaces the realm's standard artwork for this lesson. */
  artworkSrc?: string;
  onBack: () => void;
  onStart: () => void;
};

const MEASURELANDS_BACKGROUNDS: Record<number, string> = {
  1: "/images/measurelands-home-bg.png",
  2: "/images/measurelands-home-bg-y2.png",
  3: "/images/measurelands-home-bg-y3.jpg",
  4: "/images/measurelands-home-bg-y4.jpg",
  5: "/images/measurelands-home-bg-y5.png",
  6: "/images/measurelands-home-bg-y6.png",
};

export const REALM_LESSON_THEMES = {
  space: {
    realmName:"Starpath",experienceLabel:"Starpath Mission",startLabel:"Begin Mission",videoLabel:"Mission Transmission",rewardLabel:"Mission Rewards",completionLabel:"Mission Complete",legendLabel:"RELIQ card",intro:"Follow the crystal trail and discover spatial connections.",pageBg:"#100b26",shellBg:"#15102e",panelBg:"#201638",panelBorder:getRealmTheme("space").borderRing,accent:getRealmTheme("space").accentText,accentSoft:getRealmTheme("space").accentTextSoft,secondary:"#c4b5fd",heroOverlay:"linear-gradient(90deg,#100b26ee,#20163899,#20163833)",backdropOverlay:"linear-gradient(180deg,#100b2677,#100b26ee)",videoBg:getRealmTheme("space").cardSurface,buttonBg:getRealmTheme("space").ctaGradientCss,buttonShadow:getRealmTheme("space").ctaShadow,gridColor:getRealmTheme("space").borderRing,ThemeIcon:Star,
  },
  number: {
    realmName: "Number Nexus",
    experienceLabel: "Nexus Mission",
    startLabel: "Begin Mission",
    videoLabel: "Mission Transmission",
    rewardLabel: "Mission Rewards",
    completionLabel: "Mission Complete",
    legendLabel: "RELIQ card",
    intro:
      "Power up your number skills, complete the mission, and keep the Nexus running.",
    pageBg: "#031616",
    shellBg: "rgba(3, 24, 27, 0.96)",
    panelBg: "rgba(8, 41, 43, 0.78)",
    panelBorder: "rgba(94, 234, 212, 0.22)",
    accent: "#5eead4",
    accentSoft: "#99f6e4",
    secondary: "#facc15",
    heroOverlay:
      "linear-gradient(90deg, rgba(2,23,22,0.98) 0%, rgba(3,35,36,0.86) 48%, rgba(3,35,36,0.28) 100%)",
    backdropOverlay:
      "linear-gradient(180deg, rgba(2,18,22,0.62), rgba(2,18,22,0.9))",
    videoBg: "linear-gradient(135deg, #021716 0%, #064e47 58%, #0f766e 100%)",
    buttonBg: "linear-gradient(90deg, #0f766e, #0d9488, #22c55e)",
    buttonShadow: "0 16px 40px rgba(20,184,166,0.26)",
    gridColor: "rgba(94,234,212,0.42)",
    ThemeIcon: Zap,
  },
  measurement: {
    realmName: "Measurelands",
    experienceLabel: "Measurelands Quest",
    startLabel: "Begin Quest",
    videoLabel: "Explorer Scroll",
    rewardLabel: "Quest Rewards",
    completionLabel: "Quest Complete",
    legendLabel: "Meazurex",
    intro:
      "Prepare your explorer tools, practise today’s measurement skill, and continue your journey through Measurelands.",
    pageBg: "#100a05",
    shellBg: "rgba(26, 17, 10, 0.975)",
    panelBg: "rgba(36, 23, 14, 0.9)",
    panelBorder: "rgba(214, 166, 74, 0.24)",
    accent: "#d6a64a",
    accentSoft: "#f3e3bf",
    secondary: "#e6c079",
    heroOverlay:
      "linear-gradient(90deg, rgba(16,11,6,0.98) 0%, rgba(28,18,11,0.88) 48%, rgba(28,18,11,0.3) 100%)",
    backdropOverlay:
      "linear-gradient(180deg, rgba(16,11,6,0.66), rgba(10,7,4,0.94))",
    videoBg: "linear-gradient(135deg, #120c07 0%, #221610 55%, #46320f 120%)",
    buttonBg: "linear-gradient(90deg, #3a2413, #8b6520, #d6a64a)",
    buttonShadow: "0 16px 40px rgba(214,166,74,0.28)",
    gridColor: "rgba(214,166,74,0.30)",
    ThemeIcon: Ruler,
  },
  statistics: {
    realmName: "Statistica",
    experienceLabel: "Data Investigation",
    startLabel: "Start Lesson",
    videoLabel: "Data Briefing",
    rewardLabel: "Investigation Rewards",
    completionLabel: "Investigation Complete",
    legendLabel: "RELIQ card",
    intro:
      "Follow the data trail, look for patterns, and use evidence to explain what you discover.",
    pageBg: "#14231d",
    shellBg: "rgba(18, 49, 42, 0.96)",
    panelBg: "rgba(36, 70, 57, 0.86)",
    panelBorder: "rgba(242, 188, 69, 0.3)",
    accent: "#f06b64",
    accentSoft: "#fff4df",
    secondary: "#f2bc45",
    heroOverlay:
      "linear-gradient(90deg, rgba(18,49,42,0.97) 0%, rgba(35,67,55,0.82) 48%, rgba(35,67,55,0.22) 100%)",
    backdropOverlay:
      "linear-gradient(180deg, rgba(18,49,42,0.38), rgba(20,35,29,0.78))",
    videoBg: "linear-gradient(135deg, #163a32 0%, #345b45 52%, #7b3c43 100%)",
    buttonBg: "linear-gradient(90deg, #a83e4b, #e85d63 58%, #f2bc45)",
    buttonShadow: "0 16px 40px rgba(232,93,99,0.28)",
    gridColor: "rgba(240,107,100,0.28)",
    ThemeIcon: ChartNoAxesColumnIncreasing,
  },
  pattern: {
    realmName: "Pattern Peaks",
    experienceLabel: "Pattern Challenge",
    startLabel: "Start Challenge",
    videoLabel: "Summit Briefing",
    rewardLabel: "Challenge Rewards",
    completionLabel: "Challenge Complete",
    legendLabel: "Patternox",
    intro:
      "Read the pattern trail, test each rule, and explain why your algebra works.",
    pageBg: "#0c1219",
    shellBg: "rgba(12, 21, 28, 0.97)",
    panelBg: "rgba(25, 45, 48, 0.9)",
    panelBorder: "rgba(57, 217, 160, 0.3)",
    accent: "#39d9a0",
    accentSoft: "#e8fff7",
    secondary: "#ffcc62",
    heroOverlay:
      "linear-gradient(90deg, rgba(8,17,23,0.98) 0%, rgba(18,39,42,0.86) 50%, rgba(18,39,42,0.2) 100%)",
    backdropOverlay:
      "linear-gradient(180deg, rgba(8,14,22,0.46), rgba(8,14,22,0.88))",
    videoBg: "linear-gradient(135deg, #101923 0%, #183d39 54%, #4b3970 100%)",
    buttonBg: "linear-gradient(90deg, #14785f, #28b98b 58%, #7659c4)",
    buttonShadow: "0 16px 40px rgba(57,217,160,0.24)",
    gridColor: "rgba(57,217,160,0.24)",
    ThemeIcon: Sigma,
  },
  chance: {
    realmName: "Chance Hollow",
    experienceLabel: "Chance Trial",
    startLabel: "Start Trial",
    videoLabel: "Trial Briefing",
    rewardLabel: "Trial Rewards",
    completionLabel: "Trial Complete",
    legendLabel: "Chanzia",
    intro:
      "Read the chance clues, name the possible outcomes, and test what happens across repeated trials.",
    pageBg: "#17111b",
    shellBg: "rgba(31, 18, 32, 0.97)",
    panelBg: "rgba(52, 30, 42, 0.9)",
    panelBorder: "rgba(251, 191, 36, 0.28)",
    accent: "#fb7185",
    accentSoft: "#fff7ed",
    secondary: "#fbbf24",
    heroOverlay:
      "linear-gradient(90deg, rgba(24,14,30,0.98) 0%, rgba(64,35,48,0.84) 50%, rgba(64,35,48,0.22) 100%)",
    backdropOverlay:
      "linear-gradient(180deg, rgba(24,14,30,0.46), rgba(23,17,27,0.9))",
    videoBg: "linear-gradient(135deg, #17111b 0%, #4a2638 52%, #9a3412 100%)",
    buttonBg: "linear-gradient(90deg, #be3455, #fb7185 58%, #fbbf24)",
    buttonShadow: "0 16px 40px rgba(251,113,133,0.24)",
    gridColor: "rgba(251,191,36,0.22)",
    ThemeIcon: Dices,
  },
} as const;

export function getRealmLessonArtwork(realm: RealmLessonThemeId, levelNumber: number, year: string) {
  if (levelNumber === 8) return `/backgrounds/level8/${realm}-stronghold.webp`;
  if (levelNumber === 7) return `/images/shattered-realms/${realm}-cavern.webp`;
  if (realm === "number") return getHomeBg(levelNumber, year === "Prep");
  if (realm === "statistics") return getStatisticaBackground(`Year ${levelNumber}` as RealmLevelId);
  if (realm === "pattern") return getPatternPeaksBackground(`Year ${levelNumber}` as RealmLevelId);
  if (realm === "chance") return getChanceHollowBackground(`Year ${levelNumber}` as RealmLevelId);
  if (year === "Prep") return "/images/measurelands-home-bg.png";
  return MEASURELANDS_BACKGROUNDS[levelNumber] ?? "/images/measurelands-home-bg.png";
}

export type LessonConceptIntroData = {
  term: string;
  title: string;
  meaning: string;
  example: string;
  exampleExplanation: string;
  chanceVisual?: ChanceVisualData;
  chanceModel?: {
    visual: ChanceVisualData;
    numerator: number;
    denominator: number;
    winningLabel: string;
    totalLabel: string;
  };
  factorModel?: {
    product: number;
    pairs: Array<[number, number]>;
    nonFactor: number;
  };
  multipleModel?: {
    base: number;
    multipliers: number[];
    nonMultiple: number;
  };
};

// The "Meet the idea" teaching card. Shared so it can appear either on the
// lesson home or as a step inside the lesson (Pattern Peaks shows it inside,
// after Start, so the home page stays a clean briefing).
export function LessonConceptIntro({
  realm,
  conceptIntro,
}: {
  realm: RealmLessonThemeId;
  conceptIntro: LessonConceptIntroData;
}) {
  const theme = REALM_LESSON_THEMES[realm];
  const factorModelText = conceptIntro.factorModel
    ? `The factor pairs for ${conceptIntro.factorModel.product} shown here are ${conceptIntro.factorModel.pairs.map(([left, right]) => `${left} times ${right}`).join(", ")}. ${conceptIntro.factorModel.nonFactor} is not a factor because ${conceptIntro.factorModel.product} divided by ${conceptIntro.factorModel.nonFactor} leaves a remainder of ${conceptIntro.factorModel.product % conceptIntro.factorModel.nonFactor}.`
    : "";
  const multipleModelText = conceptIntro.multipleModel
    ? `The multiples of ${conceptIntro.multipleModel.base} shown here are ${conceptIntro.multipleModel.multipliers.map((multiplier) => conceptIntro.multipleModel!.base * multiplier).join(", ")}. Each jump adds ${conceptIntro.multipleModel.base}. ${conceptIntro.multipleModel.nonMultiple} is not a multiple of ${conceptIntro.multipleModel.base} because it is not in that equal-jump sequence.`
    : "";
  const conceptText = `${conceptIntro.term}. ${conceptIntro.title}. ${conceptIntro.meaning} For example, ${conceptIntro.example}. ${conceptIntro.exampleExplanation} ${factorModelText} ${multipleModelText}`;
  const factorCheck = conceptIntro.factorModel?.pairs.at(-1)?.[0] ?? 1;
  const multipleCheckMultiplier = conceptIntro.multipleModel?.multipliers.find((multiplier) => multiplier > 1) ?? 1;
  const multipleCheckValue = (conceptIntro.multipleModel?.base ?? 1) * multipleCheckMultiplier;
  return (
    <section
      className="overflow-hidden rounded-lg border p-5 sm:p-6"
      style={{ background: theme.panelBg, borderColor: theme.panelBorder }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: theme.secondary }}>
            Meet the idea · {conceptIntro.term}
          </div>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{conceptIntro.title}</h2>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7" style={{ color: theme.accentSoft }}>
            {conceptIntro.meaning}
          </p>
        </div>
        <ReadAloudBtn
          text={conceptText}
          label="Read idea"
          className="!border-white/20 !bg-white/10 !text-white hover:!bg-white/20"
        />
      </div>
      <div className="mt-5 grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="rounded-lg border border-white/10 bg-black/25 px-5 py-5 text-center text-2xl font-black text-white sm:text-3xl">
          <div>{conceptIntro.example}</div>
          {conceptIntro.chanceVisual ? (
            <div className="mt-6 flex justify-center border-t border-white/10 pt-5">
              <ChanceVisual visual={conceptIntro.chanceVisual} variant="concept" />
            </div>
          ) : null}
          {conceptIntro.chanceModel ? (
            <div className="mt-6 flex flex-col items-center justify-center gap-5 border-t border-white/10 pt-5 sm:flex-row sm:gap-10">
              <ChanceVisual visual={conceptIntro.chanceModel.visual} variant="concept" />
              <div className="flex items-center gap-5" aria-label={`${conceptIntro.chanceModel.numerator} out of ${conceptIntro.chanceModel.denominator}`}>
                <div className="min-w-20 text-center text-4xl font-black leading-none text-rose-300 sm:text-5xl">
                  <div>{conceptIntro.chanceModel.numerator}</div>
                  <div className="my-2 h-1 rounded-full bg-amber-300" />
                  <div className="text-white">{conceptIntro.chanceModel.denominator}</div>
                </div>
                <div className="space-y-2 text-left text-sm font-bold leading-5 sm:text-base">
                  <div className="flex items-center gap-2 text-rose-200">
                    <span className="h-3 w-3 rounded-full bg-[#fb7185]" />
                    {conceptIntro.chanceModel.winningLabel}
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <span className="h-3 w-3 rounded-full border border-white/30 bg-[#6d3f9c]" />
                    {conceptIntro.chanceModel.totalLabel}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div
          className="rounded-lg border px-5 py-4 text-center text-base font-black md:max-w-56"
          style={{ borderColor: `${theme.accent}55`, background: `${theme.accent}16`, color: theme.accentSoft }}
        >
          {conceptIntro.exampleExplanation}
        </div>
      </div>
      {conceptIntro.factorModel ? (
        <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-4 sm:p-5">
          <div className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: theme.accentSoft }}>
            Factor pairs make exact arrays
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {conceptIntro.factorModel.pairs.map(([rows, columns]) => (
              <div key={`${rows}-${columns}`} className="rounded-lg border border-white/10 bg-white/10 p-4 text-center">
                <div className="mx-auto grid w-fit gap-1.5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 0.65rem))` }}>
                  {Array.from({ length: rows * columns }, (_, index) => (
                    <span key={index} className="h-2.5 w-2.5 rounded-full" style={{ background: theme.accent }} />
                  ))}
                </div>
                <div className="mt-3 text-lg font-black text-white">{rows} × {columns} = {conceptIntro.factorModel!.product}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 font-black text-emerald-100">
              {conceptIntro.factorModel.product} ÷ {factorCheck} = {conceptIntro.factorModel.product / factorCheck} · no remainder ✓
            </div>
            <div className="rounded-lg border border-rose-300/25 bg-rose-400/10 px-4 py-3 font-black text-rose-100">
              {conceptIntro.factorModel.product} ÷ {conceptIntro.factorModel.nonFactor} = 2 remainder {conceptIntro.factorModel.product % conceptIntro.factorModel.nonFactor} · not a factor
            </div>
          </div>
        </div>
      ) : null}
      {conceptIntro.multipleModel ? (
        <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-4 sm:p-5">
          <div className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: theme.accentSoft }}>
            Multiples form equal jumps
          </div>
          <div className="mt-4 overflow-x-auto pb-2">
            <div className="flex min-w-max items-center gap-2">
              {conceptIntro.multipleModel.multipliers.map((multiplier, index) => {
                const value = conceptIntro.multipleModel!.base * multiplier;
                return (
                  <div key={multiplier} className="flex items-center gap-2">
                    {index > 0 ? <span className="text-xl font-black" style={{ color: theme.accent }}>→</span> : null}
                    <div className="rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-center">
                      <div className="text-xs font-bold" style={{ color: theme.accentSoft }}>
                        {conceptIntro.multipleModel!.base} × {multiplier}
                      </div>
                      <div className="mt-1 text-2xl font-black text-white">{value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 font-black text-emerald-100">
              {multipleCheckValue} is in the {conceptIntro.multipleModel.base} times table · multiple ✓
            </div>
            <div className="rounded-lg border border-rose-300/25 bg-rose-400/10 px-4 py-3 font-black text-rose-100">
              {conceptIntro.multipleModel.nonMultiple} is not in the {conceptIntro.multipleModel.base} times table · not a multiple
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

const TOP_BAR_PILL = "inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 bg-black/40 px-5 text-base font-bold text-white backdrop-blur-md transition hover:bg-black/55";
const HERO_FADE = "linear-gradient(180deg, #000 55%, transparent 100%)";

export function RealmLessonHome({
  realm,
  levelNumber,
  levelLabel,
  year,
  week,
  lessonNumber,
  lessonTitle,
  focus,
  successCriteria,
  conceptIntro,
  embeddedVideoSrc,
  hasNativeStartGuide = false,
  startDisabled = false,
  startDisabledLabel,
  intro,
  artworkSrc: artworkOverride,
  onBack,
  onStart,
}: RealmLessonHomeProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  // Ground runs on levelNumber 1, but Level 1's guides are far too hard for it.
  const groundGuide = year === "Prep" ? getGroundGuide(realm, week, lessonNumber) : null;
  const lowerGuide = year === "Prep" ? null : getLowerLessonGuide(realm, levelNumber, week, lessonNumber);
  const startLesson = () => {
    if ((lowerGuide || groundGuide) && !hasNativeStartGuide) setGuideOpen(true);
    else onStart();
  };
  const isCave=levelNumber >= 7;
  const theme = isCave ? {...REALM_LESSON_THEMES[realm],experienceLabel:levelNumber===8?"Stronghold Mission":"Cave Mission",startLabel:"Learn the skill",intro:levelNumber===8?"Enter the stronghold, learn the skill, and work towards recovering the Core.":"Follow the crystal trail, learn the skill, and continue the search for the stolen Core."} : REALM_LESSON_THEMES[realm];
  const learningStatement = learningStatementFor(focus, lessonTitle);
  const criteriaStatements = successCriteriaStatementsFor(successCriteria, focus, lessonTitle);
  const artworkSrc = artworkOverride ?? getRealmLessonArtwork(realm, levelNumber, year);
  const introText = intro ?? theme.intro;
  const learningText = learningStatement;
  const criteriaText = `${criteriaStatements.join(". ")}.`;
  const conceptText = conceptIntro
    ? `${conceptIntro.term}. ${conceptIntro.title}. ${conceptIntro.meaning} For example, ${conceptIntro.example}. ${conceptIntro.exampleExplanation}`
    : "";
  const readAllText = `${lessonTitle}. ${introText} ${conceptText} ${learningText}. ${criteriaText} This lesson takes approximately nine minutes.`;

  if (guideOpen && groundGuide) return <div className="mx-auto max-w-5xl py-4"><GroundLessonGuide guide={groundGuide} title={lessonTitle} realm={realm} onContinue={onStart} /></div>;
  if (guideOpen && lowerGuide) return <div className="mx-auto max-w-6xl py-4">
    <button type="button" onClick={() => setGuideOpen(false)} className="mb-3 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900">Back to lesson overview</button>
    <LowerLessonGuide guide={lowerGuide} title={lessonTitle} realm={realm} onContinue={onStart} />
  </div>;

  return (
    <div style={getWeeklyQuizTheme(realm) as CSSProperties} className={`relative isolate min-h-[calc(100vh-3rem)] text-white ${levelNumber === 7 ? (realm === "pattern" || realm === "statistics" || realm === "chance" ? caveLayout.home : realm === "space" ? spaceLayout.home : realm === "measurement" ? measurementLayout.home : layout.home) : ""}`}>
      <div className="fixed inset-0 -z-20" aria-hidden="true" style={{ background: theme.pageBg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artworkSrc}
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: realm === "statistics" || realm === "pattern" ? "brightness(0.56) saturate(1.16)" : "brightness(0.38) saturate(1.12)" }}
        />
        <div className="absolute inset-0" style={{ background: theme.backdropOverlay }} />
        {realm === "number" || realm === "statistics" || realm === "pattern" ? (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                realm === "statistics" || realm === "pattern"
                  ? `linear-gradient(${theme.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)`
                  : "linear-gradient(rgba(94,234,212,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(94,234,212,0.12) 1px, transparent 1px)",
              backgroundSize: realm === "statistics" ? "36px 36px" : "44px 44px",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(196,181,253,0.14),transparent_36%)]" />
        )}
      </div>

      <FitToScreen>
      {/* Back to the week, home to the hub and the profile (where students log out) are always one tap away. */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className={TOP_BAR_PILL}
          >
            <ArrowLeft className="h-5 w-5" /> Back to Week {week}
          </button>
          <Link href="/world" className={TOP_BAR_PILL} aria-label="Home to the central hub">
            <Home className="h-5 w-5" /> Hub
          </Link>
          {levelNumber === 7 && <Level7JourneyLinks realm={realm} week={week} showHub={false} />}
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 rounded-full border bg-black/40 px-4 py-2.5 font-[family-name:var(--font-display)] text-xs font-black uppercase tracking-[0.14em] backdrop-blur-md"
            style={{ borderColor: theme.panelBorder, color: theme.accent }}
          >
            <theme.ThemeIcon className="h-5 w-5" /> {theme.realmName}
          </div>
          <Link
            href="/profile"
            aria-label="My profile and log out"
            title="Profile"
            className="grid h-12 w-12 place-items-center rounded-full border-2 border-white/70 text-white shadow-[0_6px_18px_rgba(0,0,0,0.4)] transition hover:brightness-110"
            style={{ background: theme.buttonBg }}
          >
            <UserRound className="h-6 w-6" />
          </Link>
        </div>
      </header>

      {/* The realm's art fades into the page behind the title, rather than sitting in a box. */}
      <section className="relative mt-4 overflow-hidden rounded-[30px] px-5 pb-10 pt-10 sm:px-10 sm:pt-14">
        <div className="absolute inset-0" style={{ maskImage: HERO_FADE, WebkitMaskImage: HERO_FADE }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artworkSrc} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: theme.heroOverlay }} />
        </div>
        <div className="relative max-w-3xl">
          <div
            className="inline-flex rounded-full border bg-black/35 px-3.5 py-1.5 font-[family-name:var(--font-display)] text-xs font-black uppercase tracking-[0.12em]"
            style={{ borderColor: theme.panelBorder, color: theme.accentSoft }}
          >
            {levelLabel} · Week {week} · Lesson {lessonNumber}
          </div>
          <div
            className="ml-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-[family-name:var(--font-display)] text-xs font-black uppercase tracking-[0.12em]"
            style={{ borderColor: theme.panelBorder, background: `${theme.accent}24`, color: theme.accentSoft }}
          >
            <Sparkles className="h-4 w-4" /> {theme.experienceLabel}
          </div>
          <div className="mt-4 flex max-w-3xl flex-wrap items-center gap-3">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-black tracking-normal text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] sm:text-6xl">{lessonTitle}</h1>
            <ReadAloudBtn
              text={readAllText}
              speechKey={`${realm}-lesson-home-${year}-${week}-${lessonNumber}`}
              size="md"
              label="Read lesson"
              className="!border-white/25 !bg-white/10 !text-white hover:!bg-white/20"
            />
          </div>
          <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 sm:text-xl" style={{ color: theme.accentSoft }}>
            {introText}
          </p>
        </div>
      </section>

      <div className="space-y-5">
        {conceptIntro ? <LessonConceptIntro realm={realm} conceptIntro={conceptIntro} /> : null}

        <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
          <section className="rounded-[28px] border-2 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.42)]" style={{ background: theme.panelBg, borderColor: theme.panelBorder }}>
            <div className="mb-3 flex items-center gap-2 px-1">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-950" style={{ background: theme.accent }}>
                <Video className="h-5 w-5" />
              </span>
              <span className="font-[family-name:var(--font-display)] text-sm font-black uppercase tracking-[0.1em]" style={{ color: theme.accentSoft }}>{theme.videoLabel}</span>
              <span className="ml-auto rounded-full bg-black/30 px-3 py-1 text-sm font-bold" style={{ color: theme.accentSoft }}>
                {embeddedVideoSrc ? "Ready" : "Video coming soon"}
              </span>
            </div>
            {embeddedVideoSrc ? (
              <div className="relative aspect-video overflow-hidden rounded-[20px] bg-black">
                <iframe
                  src={embeddedVideoSrc}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                  title={`${lessonTitle} video`}
                />
              </div>
            ) : (
              <div className="relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-[20px]" style={{ background: theme.videoBg }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={artworkSrc} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
                <span className="relative inline-flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/60 bg-white/15 backdrop-blur-sm">
                  <Play className="ml-1 h-8 w-8 fill-current text-white" />
                </span>
              </div>
            )}
          </section>

          <section className="rounded-[28px] border p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_24px_60px_rgba(0,0,0,0.4)]" style={{ background: theme.panelBg, borderColor: theme.panelBorder }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-[family-name:var(--font-display)] text-xs font-black uppercase tracking-[0.12em]" style={{ color: theme.accent }}>Today I am learning to...</div>
                <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-extrabold leading-8 text-white sm:text-2xl">{learningStatement}</p>
              </div>
              <ReadAloudBtn text={learningText} label="Read" className="shrink-0 !border-white/20 !bg-white/10 !text-white hover:!bg-white/20" />
            </div>
            <div className="my-5 h-px bg-white/12" aria-hidden="true" />
            <div className="flex items-center justify-between gap-2">
              <div className="font-[family-name:var(--font-display)] text-xs font-black uppercase tracking-[0.12em]" style={{ color: theme.secondary }}>I can...</div>
              <ReadAloudBtn text={criteriaText} label="Read" className="!border-white/20 !bg-white/10 !text-white hover:!bg-white/20" />
            </div>
            <ul className="mt-3 space-y-2.5">
              {criteriaStatements.map((criterion) => (
                <li key={criterion} className="flex items-start gap-3 rounded-2xl bg-white/[0.05] px-3 py-3 text-lg font-semibold text-slate-100">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2" style={{ borderColor: theme.accent }}>
                    <Check className="h-4 w-4" strokeWidth={3} style={{ color: theme.accent }} />
                  </span>
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="flex flex-col gap-4 rounded-[28px] border p-4 sm:p-5 2xl:flex-row 2xl:items-center" style={{ background: theme.panelBg, borderColor: theme.panelBorder }}>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <span className="mr-1 font-[family-name:var(--font-display)] text-xs font-black uppercase tracking-[0.12em]" style={{ color: theme.accent }}>{theme.rewardLabel}</span>
            {[
              { label: "XP", Icon: Star, chip: "linear-gradient(135deg, #fde047, #f59e0b)", tint: "rgba(250,204,21,0.12)", edge: "rgba(250,204,21,0.4)", ink: "#78350f" },
              { label: "Chain", Icon: Flame, chip: "linear-gradient(135deg, #fb923c, #ea580c)", tint: "rgba(249,115,22,0.12)", edge: "rgba(249,115,22,0.4)", ink: "#ffffff" },
              { label: "Gems", Icon: Gem, chip: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})`, tint: `${theme.accent}1f`, edge: `${theme.accent}66`, ink: "#0f172a" },
              { label: theme.completionLabel, Icon: Medal, chip: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.secondary})`, tint: `${theme.secondary}24`, edge: `${theme.secondary}73`, ink: "#0f172a" },
            ].map(({ label, Icon, chip, tint, edge, ink }) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-2xl border py-1.5 pl-1.5 pr-3.5 font-[family-name:var(--font-display)] text-[15px] font-black text-white" style={{ background: tint, borderColor: edge }}>
                <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: chip }}>
                  <Icon className="h-5 w-5" style={{ color: ink }} aria-hidden="true" />
                </span>
                {label}
              </span>
            ))}
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end 2xl:shrink-0">
            <div className="flex items-center justify-center gap-2 px-2 font-bold" style={{ color: theme.accentSoft }}>
              <Clock3 className="h-5 w-5" style={{ color: theme.accent }} />
              <span className="whitespace-nowrap">Approximately 9 minutes</span>
            </div>
            <button
              type="button"
              onClick={startLesson}
              disabled={startDisabled}
              className="flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl px-10 font-[family-name:var(--font-display)] text-xl font-black text-white transition hover:brightness-110 active:translate-y-1 disabled:cursor-not-allowed disabled:saturate-50 disabled:opacity-65 sm:w-auto"
              style={{ background: theme.buttonBg, boxShadow: `0 7px 0 var(--quiz-edge), ${theme.buttonShadow}` }}
            >
              <Play className="h-6 w-6 fill-current" /> {startDisabled ? (startDisabledLabel ?? theme.startLabel) : theme.startLabel}
            </button>
          </div>
          <div className="sr-only">Completing this lesson can unlock {theme.legendLabel} rewards.</div>
        </section>
      </div>
      </FitToScreen>
    </div>
  );
}
