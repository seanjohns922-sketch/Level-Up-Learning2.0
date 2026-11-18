"use client";

import { ArrowLeft, ChartNoAxesColumnIncreasing, Dices, Orbit, Ruler, Sigma, Zap } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { getRealmLessonArtwork } from "@/components/lesson/RealmLessonHome";
import { getStarpathBackground } from "@/lib/starpath-visuals";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import type { LiveRealmId } from "@/lib/realms/realm-registry";

export type RealmQuizThemeId = LiveRealmId | "statistics" | "pattern" | "chance";

export const REALM_QUIZ_THEMES = {
  number: {
    realmName: "Number Nexus",
    quizName: "Weekly Quiz",
    eyebrow: "Nexus Knowledge Check",
    pageBg: "#031616",
    shellBg: "rgba(3, 24, 27, 0.96)",
    panelBorder: "rgba(94, 234, 212, 0.24)",
    accent: "#5eead4",
    accentSoft: "#99f6e4",
    heroOverlay:
      "linear-gradient(90deg, rgba(2,23,22,0.98) 0%, rgba(3,35,36,0.86) 48%, rgba(3,35,36,0.28) 100%)",
    backdropOverlay:
      "linear-gradient(180deg, rgba(2,18,22,0.68), rgba(2,18,22,0.94))",
    workspaceBg: "linear-gradient(180deg, #f7fffe 0%, #eaf9f8 100%)",
    ThemeIcon: Zap,
  },
  measurement: {
    realmName: "Measurelands",
    quizName: "Explorer Quiz",
    eyebrow: "Measurelands Knowledge Check",
    pageBg: "#17100a",
    shellBg: "rgba(43, 28, 18, 0.96)",
    panelBorder: "rgba(214, 166, 74, 0.32)",
    accent: "#d6a64a",
    accentSoft: "#f3e3bf",
    heroOverlay:
      "linear-gradient(90deg, rgba(23,16,10,0.98) 0%, rgba(43,28,18,0.86) 48%, rgba(43,28,18,0.28) 100%)",
    backdropOverlay:
      "linear-gradient(180deg, rgba(23,15,9,0.64), rgba(15,10,6,0.94))",
    workspaceBg: "linear-gradient(180deg, #fffaf0 0%, #f7eedc 100%)",
    ThemeIcon: Ruler,
  },
  space: {
    realmName: "Starpath",
    quizName: "Voyage Quiz",
    eyebrow: "Starpath Voyage Check",
    pageBg: "#070a1b",
    shellBg: "rgba(10, 13, 39, 0.96)",
    panelBorder: "rgba(103, 232, 249, 0.28)",
    accent: "#67e8f9",
    accentSoft: "#ddd6fe",
    heroOverlay:
      "linear-gradient(90deg, rgba(38,12,91,0.96) 0%, rgba(49,46,129,0.83) 48%, rgba(8,47,73,0.34) 100%)",
    backdropOverlay:
      "linear-gradient(180deg, rgba(7,10,27,0.62), rgba(7,10,27,0.94))",
    workspaceBg: "linear-gradient(180deg, #f8f7ff 0%, #eefcff 100%)",
    ThemeIcon: Orbit,
  },
  statistics: {
    realmName: "Statistica",
    quizName: "Data Quiz",
    eyebrow: "Statistica Evidence Check",
    pageBg: "#14231d",
    shellBg: "rgba(18, 49, 42, 0.96)",
    panelBorder: "rgba(242, 188, 69, 0.3)",
    accent: "#f06b64",
    accentSoft: "#fff4df",
    heroOverlay:
      "linear-gradient(90deg, rgba(18,49,42,0.97) 0%, rgba(35,67,55,0.82) 48%, rgba(35,67,55,0.22) 100%)",
    backdropOverlay:
      "linear-gradient(180deg, rgba(18,49,42,0.38), rgba(20,35,29,0.9))",
    workspaceBg: "linear-gradient(180deg, #fffaf0 0%, #edf5e8 100%)",
    ThemeIcon: ChartNoAxesColumnIncreasing,
  },
  pattern: {
    realmName: "Pattern Peaks",
    quizName: "Peak Quiz",
    eyebrow: "Pattern Peaks Knowledge Check",
    pageBg: "#071719",
    shellBg: "rgba(8, 31, 33, 0.96)",
    panelBorder: "rgba(57, 217, 160, 0.3)",
    accent: "#39d9a0",
    accentSoft: "#ddd6fe",
    heroOverlay: "linear-gradient(90deg, rgba(7,23,25,0.98) 0%, rgba(25,54,52,0.86) 48%, rgba(73,48,112,0.28) 100%)",
    backdropOverlay: "linear-gradient(180deg, rgba(7,18,24,0.5), rgba(7,19,24,0.94))",
    workspaceBg: "linear-gradient(180deg, #f7fffc 0%, #f1efff 100%)",
    ThemeIcon: Sigma,
  },
  chance: {
    realmName: "Chance Hollow",
    quizName: "Chance Quiz",
    eyebrow: "Chance Hollow Trial Check",
    pageBg: "#160d19",
    shellBg: "rgba(42, 20, 38, 0.96)",
    panelBorder: "rgba(251, 113, 133, 0.32)",
    accent: "#fb7185",
    accentSoft: "#fce7f3",
    heroOverlay: "linear-gradient(90deg, rgba(31,14,31,0.98) 0%, rgba(74,31,59,0.86) 48%, rgba(63,22,78,0.26) 100%)",
    backdropOverlay: "linear-gradient(180deg, rgba(22,13,25,0.52), rgba(22,13,25,0.94))",
    workspaceBg: "linear-gradient(180deg, #fff8fc 0%, #f7edf7 100%)",
    ThemeIcon: Dices,
  },
} as const satisfies Record<RealmQuizThemeId, object>;

function getQuizArtwork(realm: RealmQuizThemeId, levelNumber: number, year: string) {
  if (levelNumber === 8) return `/backgrounds/level8/${realm}-stronghold.webp`;
  if (levelNumber === 7) return `/images/shattered-realms/${realm}-cavern.webp`;
  if (realm === "space") return getStarpathBackground(year as RealmLevelId);
  return getRealmLessonArtwork(realm, levelNumber, year);
}

const HERO_FADE = "linear-gradient(180deg, #000 55%, transparent 100%)";

export function RealmWeeklyQuizChrome({
  realm,
  levelNumber,
  levelLabel,
  year,
  week,
  questionCount = 15,
  focus,
  demoMode = false,
  compact = false,
  onBack,
}: {
  realm: RealmQuizThemeId;
  levelNumber: number;
  levelLabel: string;
  year: string;
  week: number;
  questionCount?: number;
  focus?: string | null;
  demoMode?: boolean;
  /** A slimmer header while questions are on screen, so the question gets the room. */
  compact?: boolean;
  onBack: () => void;
}) {
  const theme = REALM_QUIZ_THEMES[realm];
  const artworkSrc = getQuizArtwork(realm, levelNumber, year);
  const readText = `${theme.quizName}. ${levelLabel}, week ${week}. ${questionCount} questions. ${focus ?? "Show what you know from this week."}`;

  return (
    <>
      <div className="fixed inset-0 -z-20" aria-hidden="true" style={{ background: theme.pageBg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artworkSrc}
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: "brightness(0.34) saturate(1.14)" }}
        />
        <div className="absolute inset-0" style={{ background: theme.backdropOverlay }} />
        {realm === "number" ? (
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "linear-gradient(rgba(94,234,212,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(94,234,212,0.12) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
        ) : realm === "space" ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_28%_38%,rgba(139,92,246,0.18),transparent_34%)]" />
        ) : realm === "statistics" ? (
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(rgba(242,188,69,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(240,107,100,0.1) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        ) : realm === "pattern" ? (
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(57,217,160,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(118,89,196,0.12) 1px, transparent 1px)", backgroundSize: "46px 46px" }} />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(214,166,74,0.15),transparent_34%)]" />
        )}
      </div>

      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 bg-black/40 px-5 text-base font-bold text-white backdrop-blur-md transition hover:bg-black/55"
        >
          <ArrowLeft className="h-5 w-5" /> Back to Week {week}
        </button>
        <div
          className="flex items-center gap-2 rounded-full border bg-black/40 px-4 py-2.5 font-[family-name:var(--font-display)] text-xs font-black uppercase tracking-[0.14em] backdrop-blur-md"
          style={{ borderColor: theme.panelBorder, color: theme.accent }}
        >
          <theme.ThemeIcon className="h-5 w-5" />
          {theme.realmName}{demoMode ? " · Demo Mode" : ""}
        </div>
      </header>

      {/* The realm's art fades into the page behind the title, rather than sitting in a box. */}
      <section className={`relative overflow-hidden rounded-[30px] ${compact ? "mb-3 px-5 pb-4 pt-4 sm:px-8" : "mb-6 px-5 pb-8 pt-10 sm:px-10 sm:pt-14"}`}>
        <div className="absolute inset-0" style={{ maskImage: HERO_FADE, WebkitMaskImage: HERO_FADE }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artworkSrc} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: theme.heroOverlay }} />
        </div>
        <div className="relative max-w-4xl">
          <span
            className="inline-flex rounded-full border bg-black/35 px-3.5 py-1.5 font-[family-name:var(--font-display)] text-xs font-black uppercase tracking-[0.12em]"
            style={{ borderColor: theme.panelBorder, color: theme.accentSoft }}
          >
            {levelLabel} · Week {week} · {theme.eyebrow}
          </span>
          <div className={`flex flex-wrap items-center gap-3 ${compact ? "mt-1.5" : "mt-3"}`}>
            <h1 className={`font-[family-name:var(--font-display)] font-black tracking-normal text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)] ${compact ? "text-3xl sm:text-4xl" : "text-4xl sm:text-6xl"}`}>{theme.quizName}</h1>
            <ReadAloudBtn
              text={readText}
              label="Read"
              className="!border-white/20 !bg-black/25 !text-white hover:!border-white/35 hover:!bg-black/40 hover:!text-white"
            />
          </div>
          <p className={`max-w-3xl font-semibold ${compact ? "mt-1 text-sm leading-6 sm:text-base" : "mt-2 text-base leading-7 sm:text-lg"}`} style={{ color: theme.accentSoft }}>
            {questionCount} questions · {focus ?? "Show what you know from this week"}
          </p>
        </div>
      </section>
    </>
  );
}
