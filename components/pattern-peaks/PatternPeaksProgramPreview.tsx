"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Play, RotateCcw, Volume2, X } from "lucide-react";
import { useMemo, useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { getCurriculumPlan } from "@/data/programs/genres";
import {
  getPatternPeaksWeekPurposes,
  type PatternPeaksYearLabel,
} from "@/data/programs/patternPeaks";
import { getPatternPeaksBackground, getPatternoxCard } from "@/lib/pattern-peaks-visuals";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

const SUPPORTED_LEVELS: RealmLevelId[] = ["Year 3", "Year 4", "Year 5", "Year 6"];

const PATTERNOX_NAMES: Record<PatternPeaksYearLabel, string> = {
  "Year 3": "Wigglecode",
  "Year 4": "Sequencer",
  "Year 5": "Solver",
  "Year 6": "Codemaster",
};

const PATTERNOX_VIDEOS: Record<PatternPeaksYearLabel, string> = {
  "Year 3": "/videos/legends/patternox-wigglecode.mp4",
  "Year 4": "/videos/legends/patternox-sequencer.mp4",
  "Year 5": "/videos/legends/patternox-solver.mp4",
  "Year 6": "/videos/legends/patternox-codemaster.mp4",
};

function normalizeLevel(level: string): RealmLevelId {
  return SUPPORTED_LEVELS.includes(level as RealmLevelId) ? (level as RealmLevelId) : "Year 3";
}

export default function PatternPeaksProgramPreview({ level, selectedWeek }: { level: string; selectedWeek: number }) {
  const normalizedLevel = normalizeLevel(level);
  const [showCardBack, setShowCardBack] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const program = useMemo(() => getCurriculumPlan(normalizedLevel, "algebra"), [normalizedLevel]);
  const purposes = useMemo(
    () => getPatternPeaksWeekPurposes(normalizedLevel as PatternPeaksYearLabel),
    [normalizedLevel],
  );
  const activeWeek = Math.min(Math.max(selectedWeek, 1), 8);
  const patternoxName = PATTERNOX_NAMES[normalizedLevel as PatternPeaksYearLabel];
  const patternoxVideo = PATTERNOX_VIDEOS[normalizedLevel as PatternPeaksYearLabel];

  return (
    <main className="min-h-screen bg-[#0c1219] text-white">
      <header className="relative min-h-[250px] overflow-hidden border-b border-emerald-300/20">
        <Image
          src={getPatternPeaksBackground(normalizedLevel)}
          alt="Pattern Peaks mountain world"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,13,20,0.94)_0%,rgba(7,13,20,0.72)_45%,rgba(7,13,20,0.18)_100%)]" />
        <div className="relative mx-auto flex min-h-[250px] max-w-7xl items-end px-5 py-8 sm:px-8">
          <div className="max-w-2xl">
            <button
              type="button"
              onClick={() => window.location.assign(`/pattern-peaks?teacher_preview=1&level=${encodeURIComponent(normalizedLevel)}`)}
              className="mb-6 inline-flex h-11 items-center gap-2 border border-white/20 bg-black/30 px-4 text-sm font-bold backdrop-blur hover:bg-black/50"
            >
              <ArrowLeft size={18} /> Back to Pattern Peaks
            </button>
            <div className="flex items-center gap-3">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ffcc62]">{normalizedLevel} journey</p>
              <ReadAloudBtn text={`${normalizedLevel} Pattern Peaks journey. Eight weeks of patterns, rules, inverse relationships and unknown values.`} />
            </div>
            <h1 className="mt-2 text-4xl font-black sm:text-5xl">Pattern Peaks</h1>
            <p className="mt-3 max-w-xl text-base font-semibold leading-7 text-white/78">Eight weeks. Three investigations each week. One Patternox waiting at the summit.</p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section aria-labelledby="journey-heading">
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#39d9a0]">Eight-week spine</p>
              <h2 id="journey-heading" className="mt-1 text-2xl font-black">{normalizedLevel} journey</h2>
            </div>
            <span className="border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs font-black text-amber-100">24 lessons</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
              {program.map((week) => {
                const active = week.week === activeWeek;
                return (
                  <article
                    key={week.id}
                    className={`border p-5 ${active ? "border-[#39d9a0] bg-[#152b29] shadow-[0_0_28px_rgba(57,217,160,0.12)]" : "border-white/12 bg-white/[0.035]"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ffcc62]">Week {week.week}</p>
                        <h3 className="mt-1 text-xl font-black">{week.topic}</h3>
                      </div>
                      <ReadAloudBtn text={`Week ${week.week}. ${week.topic}. ${purposes[week.week]}`} />
                    </div>
                    <p className="mt-3 min-h-12 text-sm font-semibold leading-6 text-white/64">{purposes[week.week]}</p>
                    <ol className="mt-4 space-y-2 border-t border-white/10 pt-4">
                      {week.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <Link
                            href={`/pattern-peaks/lesson/${encodeURIComponent(normalizedLevel)}/${week.week}/${lesson.lesson}?teacher_preview=1`}
                            className="flex min-h-14 items-center gap-3 border border-transparent bg-black/20 px-3 py-2.5 transition hover:border-[#39d9a0]/60 hover:bg-[#39d9a0]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ffcc62]"
                          >
                            <span className="grid h-8 w-8 shrink-0 place-items-center border border-violet-300/30 bg-violet-300/10 text-xs font-black text-violet-100">{lesson.lesson}</span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold">{lesson.title}</p>
                              <p className="truncate text-xs text-white/45">{String(lesson.config?.mechanic ?? "Pattern investigation")}</p>
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#39d9a0]">Open</span>
                          </Link>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-4 flex items-center justify-between gap-3 text-xs font-bold">
                      <span className="inline-flex items-center gap-1.5 text-emerald-200"><CheckCircle2 size={15} /> Weekly quiz planned</span>
                      <span className="text-white/42">{week.curriculum.join(" · ")}</span>
                    </div>
                  </article>
                );
              })}
            </div>
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start" aria-label="Patternox reward">
          <div className="border border-violet-300/25 bg-[#15121d] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-200">Patternox</p>
                <h2 className="mt-1 text-lg font-black">{patternoxName}</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCardBack((value) => !value)}
                className="grid h-11 w-11 place-items-center border border-white/15 bg-white/[0.06] hover:bg-white/[0.12]"
                title="Turn card over"
                aria-label="Turn Patternox card over"
              >
                <RotateCcw size={18} />
              </button>
            </div>
            <div className="relative mt-4 aspect-[1054/1492] overflow-hidden bg-black">
              <Image
                src={getPatternoxCard(normalizedLevel, showCardBack ? "back" : "front")}
                alt={`${normalizedLevel} Patternox card ${showCardBack ? "back" : "front"}`}
                fill
                className="object-contain"
                sizes="280px"
              />
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-white/70">
              <Volume2 size={16} className="text-[#39d9a0]" /> Complete the level to earn this card.
            </div>
            <button
              type="button"
              onClick={() => setShowVideo(true)}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 bg-[#39d9a0] px-4 text-sm font-black text-[#071914] transition hover:bg-[#69e8bc]"
            >
              <Play size={17} fill="currentColor" /> Watch {patternoxName}
            </button>
          </div>
        </aside>
      </div>

      {showVideo ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setShowVideo(false)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden border border-emerald-300/30 bg-black shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <video
              src={patternoxVideo}
              controls
              autoPlay
              playsInline
              className="aspect-video w-full bg-black object-contain"
            />
            <button
              type="button"
              onClick={() => setShowVideo(false)}
              className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/70 text-white transition hover:bg-black"
              title="Close video"
              aria-label={`Close ${patternoxName} video`}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
