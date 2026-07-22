"use client";

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import {
  getRealmLessonArtwork,
  REALM_LESSON_THEMES,
  type RealmLessonThemeId,
} from "@/components/lesson/RealmLessonHome";

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
  onBack: () => void;
  children: ReactNode;
}) {
  const theme = REALM_LESSON_THEMES[realm];
  const artworkSrc = getRealmLessonArtwork(realm, levelNumber, year);
  const experienceNoun = realm === "measurement" ? "Quest" : "Mission";
  const readText = `${lessonTitle}. ${focus ?? "Practise today's lesson skill."}`;

  return (
    <div className="relative isolate min-h-[calc(100vh-3rem)] text-white">
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
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(196,181,253,0.16),transparent_34%)]" />
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
        <div className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em]" style={{ color: theme.accentSoft }}>
          <theme.ThemeIcon className="h-5 w-5" style={{ color: theme.accent }} />
          {theme.realmName}{demoMode ? " · Demo Mode" : ""}
        </div>
      </header>

      <section
        className="overflow-hidden rounded-lg border shadow-[0_24px_90px_rgba(0,0,0,0.42)]"
        style={{ background: theme.shellBg, borderColor: theme.panelBorder }}
      >
        <div className="relative overflow-hidden border-b px-5 py-5 sm:px-7" style={{ borderColor: theme.panelBorder }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artworkSrc} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: theme.heroOverlay }} />
          <div className="relative max-w-4xl">
            <div className="font-mono text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
              {levelLabel} · Week {week} · {experienceNoun} {lessonNumber}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black tracking-normal text-white sm:text-4xl">{lessonTitle}</h1>
              <ReadAloudBtn
                text={readText}
                label="Read"
                className="!border-white/20 !bg-black/25 !text-white hover:!border-white/35 hover:!bg-black/40 hover:!text-white"
              />
            </div>
            {focus ? (
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 sm:text-base" style={{ color: theme.accentSoft }}>
                {focus}
              </p>
            ) : null}
          </div>
        </div>

        <div
          className="p-3 text-slate-950 sm:p-5"
          style={{
            background:
              realm === "measurement"
                ? "linear-gradient(180deg, #fffaf0 0%, #f7eedc 100%)"
                : "linear-gradient(180deg, #f7fffe 0%, #eaf9f8 100%)",
          }}
        >
          {children}
        </div>
      </section>
    </div>
  );
}
