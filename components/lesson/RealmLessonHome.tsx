"use client";

import {
  ArrowLeft,
  Check,
  Clock3,
  Flame,
  Gem,
  Medal,
  Play,
  Ruler,
  Sparkles,
  Star,
  Video,
  Zap,
} from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { getHomeBg } from "@/lib/levelBand";

export type RealmLessonThemeId = "number" | "measurement";

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
  embeddedVideoSrc?: string;
  onBack: () => void;
  onStart: () => void;
};

const MEASURELANDS_BACKGROUNDS: Record<number, string> = {
  1: "/images/measurelands-home-bg-y1.jpg",
  2: "/images/measurelands-home-bg-y2.jpg",
  3: "/images/measurelands-home-bg-y3.jpg",
  4: "/images/measurelands-home-bg-y4.jpg",
  5: "/images/measurelands-home-bg-y5.png",
  6: "/images/measurelands-home-bg-y6.png",
};

export const REALM_LESSON_THEMES = {
  number: {
    realmName: "Number Nexus",
    experienceLabel: "Nexus Mission",
    startLabel: "Begin Mission",
    videoLabel: "Mission Transmission",
    rewardLabel: "Mission Rewards",
    completionLabel: "Mission Complete",
    legendLabel: "Legend",
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
} as const;

export function getRealmLessonArtwork(realm: RealmLessonThemeId, levelNumber: number, year: string) {
  if (realm === "number") return getHomeBg(levelNumber, year === "Prep");
  if (year === "Prep") return "/images/measurelands-home-bg.png";
  return MEASURELANDS_BACKGROUNDS[levelNumber] ?? "/images/measurelands-home-bg.png";
}

function childFacingCriterion(criterion: string) {
  const cleaned = criterion
    .replace(/^core concept:\s*/i, "")
    .replace(/^application task:\s*/i, "")
    .trim();

  if (/^reasoning prompt:/i.test(cleaned)) return "explain how I know";
  return cleaned;
}

function uniqueCriteria(criteria: readonly string[], focus: string) {
  const cleaned = criteria
    .filter((item) => !/^fluency\s*\(/i.test(item.trim()))
    .map(childFacingCriterion)
    .filter(Boolean);
  return [...new Set(cleaned)].slice(0, 3).length
    ? [...new Set(cleaned)].slice(0, 3)
    : [focus];
}

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
  embeddedVideoSrc,
  onBack,
  onStart,
}: RealmLessonHomeProps) {
  const theme = REALM_LESSON_THEMES[realm];
  const criteria = uniqueCriteria(successCriteria, focus);
  const artworkSrc = getRealmLessonArtwork(realm, levelNumber, year);
  const learningText = `Today I am learning to ${focus}`;
  const criteriaText = `I can ${criteria.join(". I can ")}.`;
  const readAllText = `${lessonTitle}. ${theme.intro} ${learningText}. ${criteriaText} This lesson takes approximately nine minutes.`;

  return (
    <div className="relative isolate min-h-[calc(100vh-3rem)] text-white">
      <div className="fixed inset-0 -z-20" aria-hidden="true" style={{ background: theme.pageBg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artworkSrc}
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: "brightness(0.38) saturate(1.12)" }}
        />
        <div className="absolute inset-0" style={{ background: theme.backdropOverlay }} />
        {realm === "number" ? (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(94,234,212,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(94,234,212,0.12) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(196,181,253,0.14),transparent_36%)]" />
        )}
      </div>

      <header
        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-3 backdrop-blur-md sm:px-5"
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
        <div className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em]" style={{ color: theme.accent }}>
          <theme.ThemeIcon className="h-5 w-5" /> {theme.realmName}
        </div>
      </header>

      <section
        className="mt-4 overflow-hidden rounded-lg border shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl"
        style={{ background: theme.shellBg, borderColor: theme.panelBorder }}
      >
        <div className="relative min-h-[280px] overflow-hidden border-b px-6 py-8 sm:px-10 sm:py-10" style={{ borderColor: theme.panelBorder }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artworkSrc} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: theme.heroOverlay }} />
          <div className="relative max-w-3xl">
            <div className="font-mono text-[11px] font-black uppercase tracking-[0.22em] sm:text-xs" style={{ color: theme.accentSoft }}>
              {levelLabel} · Week {week} · Lesson {lessonNumber}
            </div>
            <div
              className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em]"
              style={{ borderColor: theme.panelBorder, background: `${theme.accent}18`, color: theme.accentSoft }}
            >
              <Sparkles className="h-4 w-4" /> {theme.experienceLabel}
            </div>
            <div className="mt-4 flex max-w-3xl flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">{lessonTitle}</h1>
              <ReadAloudBtn
                text={readAllText}
                speechKey={`${realm}-lesson-home-${year}-${week}-${lessonNumber}`}
                size="md"
                label="Read lesson"
                className="!border-white/25 !bg-white/10 !text-white hover:!bg-white/20"
              />
            </div>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 sm:text-lg" style={{ color: theme.accentSoft }}>
              {theme.intro}
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-lg border p-5" style={{ background: theme.panelBg, borderColor: theme.panelBorder }}>
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-950" style={{ background: theme.accent }}>
                  <Video className="h-4 w-4" />
                </span>
                <span className="text-sm font-black uppercase tracking-[0.14em]" style={{ color: theme.accentSoft }}>{theme.videoLabel}</span>
                <span className="ml-auto inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: theme.accent, boxShadow: `0 0 7px ${theme.accent}` }} />
                  {embeddedVideoSrc ? "Ready" : "Coming soon"}
                </span>
              </div>
              {embeddedVideoSrc ? (
                <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
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
                <div className="relative flex aspect-video flex-col items-center justify-center gap-3 overflow-hidden rounded-lg" style={{ background: theme.videoBg }}>
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `linear-gradient(${theme.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)`,
                      backgroundSize: "28px 28px",
                    }}
                  />
                  <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full border bg-black/25" style={{ borderColor: theme.accent }}>
                    <Play className="ml-0.5 h-5 w-5 fill-current" style={{ color: theme.accent }} />
                  </span>
                  <span className="relative font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: theme.accentSoft }}>Video coming soon</span>
                </div>
              )}
            </section>

            <div className="space-y-5">
              <section className="rounded-lg border p-5" style={{ background: theme.panelBg, borderColor: theme.panelBorder }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: theme.accent }}>Today I am learning to...</div>
                  <ReadAloudBtn text={learningText} label="Read" className="!border-white/20 !bg-white/10 !text-white hover:!bg-white/20" />
                </div>
                <p className="mt-3 text-xl font-bold leading-8 text-white">{focus}</p>
              </section>

              <section className="rounded-lg border p-5" style={{ background: theme.panelBg, borderColor: theme.panelBorder }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: theme.secondary }}>I can...</div>
                  <ReadAloudBtn text={criteriaText} label="Read" className="!border-white/20 !bg-white/10 !text-white hover:!bg-white/20" />
                </div>
                <ul className="mt-3 space-y-3">
                  {criteria.map((criterion) => (
                    <li key={criterion} className="flex items-start gap-3 text-base font-semibold text-slate-100">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-950" style={{ background: theme.accent }}>
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </span>
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          <section className="rounded-lg border p-5" style={{ background: theme.panelBg, borderColor: theme.panelBorder }}>
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: theme.accent }}>{theme.rewardLabel}</div>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "XP", Icon: Star },
                    { label: "Chain", Icon: Flame },
                    { label: "Gems", Icon: Gem },
                    { label: theme.completionLabel, Icon: Medal },
                  ].map(({ label, Icon }) => (
                    <div key={label} className="flex min-h-20 flex-col items-center justify-center rounded-lg border border-white/10 bg-black/20 p-3 text-center">
                      <Icon className="h-6 w-6" style={{ color: theme.secondary }} />
                      <span className="mt-2 text-xs font-black text-white">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center xl:shrink-0">
                <div className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-black/20 px-4 py-3" style={{ color: theme.accentSoft }}>
                  <Clock3 className="h-5 w-5" style={{ color: theme.accent }} />
                  <span className="whitespace-nowrap font-bold">Approximately 9 minutes</span>
                </div>
                <button
                  type="button"
                  onClick={onStart}
                  className="flex min-h-14 w-full items-center justify-center gap-3 rounded-lg px-10 text-lg font-black text-white transition hover:brightness-110 active:scale-[0.99] sm:w-auto"
                  style={{ background: theme.buttonBg, boxShadow: theme.buttonShadow }}
                >
                  <Play className="h-6 w-6 fill-current" /> {theme.startLabel}
                </button>
              </div>
            </div>
            <div className="sr-only">Completing this lesson can unlock {theme.legendLabel} rewards.</div>
          </section>
        </div>
      </section>
    </div>
  );
}
