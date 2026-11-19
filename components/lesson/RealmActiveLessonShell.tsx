"use client";

import { FullscreenToggle } from "@/components/FullscreenToggle";
import Level7JourneyLinks from "./Level7JourneyLinks";

import layout from "./Number7LessonLayout.module.css";
import caveLayout from "./cave7/Cave7LessonLayout.module.css";
import spaceLayout from "./Space7LessonLayout.module.css";
import measurementLayout from "./Measurement7LessonLayout.module.css";

import { ArrowLeft } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { getWeeklyQuizTheme } from "@/lib/weekly-quiz-theme";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { FitToScreen } from "@/components/FitToScreen";
import {
  getRealmLessonArtwork,
  REALM_LESSON_THEMES,
  type RealmLessonThemeId,
} from "@/components/lesson/RealmLessonHome";
import { learningStatementFor } from "@/lib/lesson-statements";

const BANNER_FADE = "linear-gradient(180deg, #000 60%, transparent 100%)";

export function RealmActiveLessonShell({
  realm,
  levelNumber,
  levelLabel,
  year,
  week,
  lessonNumber,
  lessonTitle,
  focus,
  demoMode = false,
  artworkSrc: artworkOverride,
  onBack,
  children,
}: {
  realm: RealmLessonThemeId;
  levelNumber: number;
  levelLabel: string;
  year: string;
  week: number;
  lessonNumber: number;
  lessonTitle: string;
  focus?: string | null;
  demoMode?: boolean;
  /** Replaces the realm's standard artwork (Starpath missions have their own). */
  artworkSrc?: string;
  onBack: () => void;
  children: ReactNode;
}) {
  const isCoreHunt = levelNumber >= 7;
  const theme = REALM_LESSON_THEMES[realm];
  const artworkSrc = artworkOverride ?? getRealmLessonArtwork(realm, levelNumber, year);
  const experienceNoun = realm === "measurement" ? "Quest" : realm === "statistics" ? "Investigation" : realm === "pattern" ? "Challenge" : realm === "chance" ? "Trial" : "Mission";
  const learningStatement = focus ? learningStatementFor(focus, lessonTitle) : null;
  const readText = `${lessonTitle}. ${learningStatement ?? "Practise today's lesson skill."}`;

  return (
    <div style={getWeeklyQuizTheme(realm) as CSSProperties} className={`relative isolate min-h-[calc(100vh-3rem)] text-white ${levelNumber >= 7 ? (realm === "pattern" || realm === "statistics" || realm === "chance" ? caveLayout.active : realm === "space" ? spaceLayout.active : realm === "measurement" ? measurementLayout.active : layout.active) : ""}`}>
      <div className="fixed inset-0 -z-20" aria-hidden="true" style={{ background: theme.pageBg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artworkSrc}
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: realm === "statistics" || realm === "pattern" || realm === "chance" ? "brightness(0.5) saturate(1.16)" : "brightness(0.34) saturate(1.14)" }}
        />
        <div className="absolute inset-0" style={{ background: theme.backdropOverlay }} />
        {realm === "number" || realm === "statistics" || realm === "pattern" || realm === "chance" ? (
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `linear-gradient(${theme.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)`,
              backgroundSize: "44px 44px",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(196,181,253,0.16),transparent_34%)]" />
        )}
      </div>

      <FitToScreen>
      <header className={`mb-3 flex flex-wrap items-center justify-between gap-3 ${isCoreHunt ? "sticky top-0 z-40" : ""}`}>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-black/40 px-5 text-base font-bold text-white backdrop-blur-md transition hover:bg-black/55"
        >
          <ArrowLeft className="h-5 w-5" /> Back to Week {week}
        </button>
        {levelNumber >= 7 && <Level7JourneyLinks level={levelNumber} realm={realm} week={week} demo={demoMode} />}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 rounded-full border bg-black/40 px-4 py-2.5 font-[family-name:var(--font-display)] text-xs font-black uppercase tracking-[0.14em] backdrop-blur-md"
            style={{ borderColor: theme.panelBorder, color: theme.accent }}
          >
            <theme.ThemeIcon className="h-5 w-5" />
            {isCoreHunt ? `Hunt for the ${theme.realmName} Core · Level ${levelNumber}` : theme.realmName}{demoMode && !isCoreHunt ? " · Demo Mode" : ""}
          </div>
          <FullscreenToggle icon className="h-11 w-11 rounded-full border bg-black/40 backdrop-blur-md transition hover:bg-black/55" style={{ borderColor: theme.panelBorder, color: theme.accentSoft }} />
        </div>
      </header>

      {/* A slim banner: the realm's art fades into the page behind the title. */}
      <section className="relative mb-3 overflow-hidden rounded-[26px] px-5 pb-5 pt-5 sm:px-8">
        <div className="absolute inset-0" style={{ maskImage: BANNER_FADE, WebkitMaskImage: BANNER_FADE }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artworkSrc} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: theme.heroOverlay }} />
        </div>
        <div className="relative max-w-4xl">
          <span
            className="inline-flex rounded-full border bg-black/35 px-3 py-1 font-[family-name:var(--font-display)] text-[11px] font-black uppercase tracking-[0.12em]"
            style={{ borderColor: theme.panelBorder, color: theme.accentSoft }}
          >
            {levelLabel} · Week {week} · {experienceNoun} {lessonNumber}
          </span>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-black tracking-normal text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)] sm:text-4xl">{lessonTitle}</h1>
            <ReadAloudBtn
              text={readText}
              label="Read"
              className="!border-white/20 !bg-black/25 !text-white hover:!border-white/35 hover:!bg-black/40 hover:!text-white"
            />
          </div>
          {focus ? (
            <p className="mt-1.5 max-w-3xl text-base font-semibold leading-6" style={{ color: theme.accentSoft }}>
              {learningStatement}
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-[30px] bg-[image:var(--quiz-frame)] p-[3px] shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
        <div
          className="rounded-[27px] p-3 text-slate-950 sm:p-5"
          style={{
            background:
              realm === "measurement"
                ? "linear-gradient(180deg, #fffaf0 0%, #f7eedc 100%)"
                : realm === "statistics"
                  ? "linear-gradient(180deg, #fffaf2 0%, #eef5e7 100%)"
                  : realm === "pattern"
                    ? "linear-gradient(180deg, #f7fff9 0%, #eef1ff 100%)"
                  : realm === "chance"
                    ? "linear-gradient(180deg, #fff7ed 0%, #fff1f2 100%)"
                  : realm === "space"
                    ? "linear-gradient(180deg, #f8f7ff 0%, #eefcff 100%)"
                  : "linear-gradient(180deg, #f7fffe 0%, #eaf9f8 100%)",
          }}
        >
          {children}
        </div>
      </section>
      </FitToScreen>
    </div>
  );
}
