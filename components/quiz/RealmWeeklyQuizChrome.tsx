"use client";

import { ArrowLeft, Orbit, Ruler, Zap } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { getRealmLessonArtwork } from "@/components/lesson/RealmLessonHome";
import { getStarpathBackground } from "@/lib/starpath-visuals";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

export type RealmQuizThemeId = "number" | "measurement" | "space";

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
} as const;

function getQuizArtwork(realm: RealmQuizThemeId, levelNumber: number, year: string) {
  if (realm === "space") return getStarpathBackground(year as RealmLevelId);
  return getRealmLessonArtwork(realm, levelNumber, year);
}

export function RealmWeeklyQuizChrome({
  realm,
  levelNumber,
  levelLabel,
  year,
  week,
  questionCount = 15,
  focus,
  demoMode = false,
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
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(214,166,74,0.15),transparent_34%)]" />
        )}
      </div>

      <header
        className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-3 backdrop-blur-md sm:px-5"
        style={{ background: theme.shellBg, borderColor: theme.panelBorder }}
      >
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-bold transition hover:bg-white/10"
          style={{ borderColor: theme.panelBorder, color: theme.accentSoft }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Week {week}
        </button>
        <div
          className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em]"
          style={{ color: theme.accentSoft }}
        >
          <theme.ThemeIcon className="h-5 w-5" style={{ color: theme.accent }} />
          {theme.realmName}{demoMode ? " · Demo Mode" : ""}
        </div>
      </header>

      <section
        className="relative overflow-hidden rounded-t-lg border border-b-0 px-5 py-6 shadow-[0_24px_90px_rgba(0,0,0,0.42)] sm:px-8"
        style={{ background: theme.shellBg, borderColor: theme.panelBorder }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={artworkSrc} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: theme.heroOverlay }} />
        <div className="relative max-w-4xl">
          <div className="font-mono text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
            {levelLabel} · Week {week} · {theme.eyebrow}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-normal text-white sm:text-4xl">{theme.quizName}</h1>
            <ReadAloudBtn
              text={readText}
              label="Read"
              className="!border-white/20 !bg-black/25 !text-white hover:!border-white/35 hover:!bg-black/40 hover:!text-white"
            />
          </div>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 sm:text-base" style={{ color: theme.accentSoft }}>
            {questionCount} questions · {focus ?? "Show what you know from this week"}
          </p>
        </div>
      </section>
    </>
  );
}
