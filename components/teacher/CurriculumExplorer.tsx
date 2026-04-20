"use client";

import { useMemo, useState } from "react";
import {
  getGenresForYear,
  getCurriculumPlan,
  lessonIdPrefix,
  DEFAULT_LESSON_XP,
  type Genre,
} from "@/data/programs/genres";
import type { Lesson } from "@/data/programs/year1";
import LessonPreviewDrawer from "./LessonPreviewDrawer";

type ProgressLike = {
  student_id: string;
  year: string;
  week: number | null;
  completed_lesson_ids: any;
  quiz_scores?: any;
};

type Props = {
  yearLabel: string;
  studentCount: number;
  progress: ProgressLike[];
};

function parseCompleted(raw: any): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

export default function CurriculumExplorer({
  yearLabel,
  studentCount,
  progress,
}: Props) {
  const genres = getGenresForYear(yearLabel);
  const firstAvailable = genres.find((g) => g.available) ?? genres[0];
  const [genreId, setGenreId] = useState<string>(firstAvailable.id);
  const [weekNum, setWeekNum] = useState<number>(1);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

  const genre: Genre | undefined = genres.find((g) => g.id === genreId);
  const plan = useMemo(
    () => getCurriculumPlan(yearLabel, genreId),
    [yearLabel, genreId]
  );

  const week = plan.find((w) => w.week === weekNum) ?? plan[0];
  const yearProgress = progress.filter((p) => p.year === yearLabel);
  const isPlaceholder = !genre?.available;
  const prefix = lessonIdPrefix(yearLabel);

  /** Per-lesson status counts across loaded students. */
  function lessonStatusCounts(lessonId: string) {
    let completed = 0;
    let inProgress = 0;
    for (const p of yearProgress) {
      const ids = parseCompleted(p.completed_lesson_ids);
      if (ids.includes(lessonId)) completed += 1;
      else if ((p.week ?? 0) >= (week?.week ?? 1)) inProgress += 1;
    }
    const notStarted = Math.max(0, studentCount - completed - inProgress);
    return { completed, inProgress, notStarted, struggling: 0 };
  }

  /** Class average completion % for a given week. */
  function weekAvgPct(w: number) {
    if (yearProgress.length === 0 || studentCount === 0) return 0;
    const lessonsInWeek = plan.find((x) => x.week === w)?.lessons.length ?? 3;
    const total = lessonsInWeek * studentCount;
    let done = 0;
    const wantPrefix = `-w${w}-`;
    for (const p of yearProgress) {
      const ids = parseCompleted(p.completed_lesson_ids);
      done += ids.filter((id) => id.startsWith(prefix) && id.includes(wantPrefix)).length;
    }
    return total === 0 ? 0 : Math.round((done / total) * 100);
  }

  function parseQuiz(raw: any): Record<string, any> {
    return raw && typeof raw === "object" ? raw : {};
  }

  /** Class average quiz accuracy % for a week (across all students who attempted). */
  function weekAvgAccuracy(w: number): { avg: number; attempts: number } {
    let sum = 0;
    let n = 0;
    for (const p of yearProgress) {
      const qs = parseQuiz(p.quiz_scores);
      const wq = qs[String(w)];
      if (wq && typeof wq.percent === "number") {
        sum += wq.percent;
        n += 1;
      }
    }
    return { avg: n === 0 ? 0 : Math.round(sum / n), attempts: n };
  }

  /** Class average per-lesson accuracy from weekly quiz lessonBreakdown. */
  function lessonAvgAccuracy(w: number, lessonNumber: number): { avg: number; attempts: number } {
    let sumCorrect = 0;
    let sumTotal = 0;
    let n = 0;
    for (const p of yearProgress) {
      const qs = parseQuiz(p.quiz_scores);
      const wq = qs[String(w)];
      const lb = Array.isArray(wq?.lessonBreakdown) ? wq.lessonBreakdown : [];
      const item = lb.find((x: any) => Number(x?.lessonNumber) === lessonNumber);
      if (item && typeof item.correct === "number" && typeof item.total === "number" && item.total > 0) {
        sumCorrect += item.correct;
        sumTotal += item.total;
        n += 1;
      }
    }
    return { avg: sumTotal === 0 ? 0 : Math.round((sumCorrect / sumTotal) * 100), attempts: n };
  }

  function accTone(avg: number, attempts: number) {
    if (attempts === 0) return "bg-slate-50 text-slate-400 border-slate-200";
    if (avg >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (avg >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  return (
    <div className="space-y-5">
      {/* Genre row */}
      <div className="bg-white rounded-2xl border border-[#E6E8EC] p-4">
        <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-[0.12em] mb-2">
          Strand / Realm
        </div>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => {
            const active = g.id === genreId;
            return (
              <button
                key={g.id}
                onClick={() => { setGenreId(g.id); setWeekNum(1); }}
                className={[
                  "group relative px-3.5 py-2 rounded-xl border text-left transition",
                  active
                    ? "border-teal-300 bg-teal-50 ring-2 ring-teal-200"
                    : "border-[#E6E8EC] bg-white hover:border-[#CBD5E1]",
                ].join(" ")}
              >
                <div className={`text-sm font-bold ${active ? "text-teal-800" : "text-[#0F172A]"}`}>
                  {g.strand}
                </div>
                <div className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1.5">
                  {g.realm}
                  {!g.available && (
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-500">
                      Soon
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Week strip + detail */}
      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        {/* Week strip */}
        <div className="bg-white rounded-2xl border border-[#E6E8EC] p-3 h-fit">
          <div className="px-2 py-1 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-[0.12em]">
            Weeks
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-2 gap-2 mt-1">
            {plan.map((w) => {
              const active = w.week === weekNum;
              const pct = weekAvgPct(w.week);
              const acc = weekAvgAccuracy(w.week);
              return (
                <button
                  key={w.week}
                  onClick={() => setWeekNum(w.week)}
                  className={[
                    "rounded-xl border px-3 py-2.5 text-left transition",
                    active
                      ? "border-teal-300 bg-teal-50 ring-2 ring-teal-200"
                      : "border-[#E6E8EC] bg-white hover:border-[#CBD5E1]",
                  ].join(" ")}
                >
                  <div className={`text-[11px] font-extrabold uppercase tracking-wider ${active ? "text-teal-700" : "text-[#94A3B8]"}`}>
                    Week {w.week}
                  </div>
                  <div className="text-[12px] font-bold text-[#0F172A] line-clamp-2 leading-snug mt-0.5">
                    {w.topic}
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-[#64748B] tabular-nums">
                      {pct}% done
                    </span>
                    <span
                      title={acc.attempts === 0 ? "No quiz attempts yet" : `Quiz accuracy avg across ${acc.attempts} student${acc.attempts === 1 ? "" : "s"}`}
                      className={`text-[9px] font-extrabold tabular-nums px-1.5 py-0.5 rounded border ${accTone(acc.avg, acc.attempts)}`}
                    >
                      {acc.attempts === 0 ? "—" : `${acc.avg}%`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="space-y-4">
          {/* Week header */}
          <div className="bg-white rounded-2xl border border-[#E6E8EC] px-5 py-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold text-teal-700 uppercase tracking-[0.14em]">
                  {genre?.strand} · {genre?.realm}
                </div>
                <h2 className="text-xl font-black text-[#0F172A] mt-0.5 tracking-tight">
                  Week {week?.week} — {week?.topic}
                </h2>
                <div className="text-xs font-semibold text-[#64748B] mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{yearLabel} · {studentCount} student{studentCount === 1 ? "" : "s"}</span>
                  <span>· class avg <b className="text-[#0F172A]">{weekAvgPct(week?.week ?? 1)}%</b> done</span>
                  {(() => {
                    const acc = weekAvgAccuracy(week?.week ?? 1);
                    return (
                      <span>
                        · quiz avg{" "}
                        <b className={acc.attempts === 0 ? "text-[#94A3B8]" : acc.avg >= 80 ? "text-emerald-700" : acc.avg >= 60 ? "text-amber-700" : "text-rose-700"}>
                          {acc.attempts === 0 ? "—" : `${acc.avg}%`}
                        </b>
                        <span className="text-[#94A3B8]"> ({acc.attempts} attempt{acc.attempts === 1 ? "" : "s"})</span>
                      </span>
                    );
                  })()}
                </div>
              </div>
              <button
                disabled
                title="Coming soon: assign this whole week to your class or selected students"
                className="px-3.5 py-2 rounded-lg bg-[#0F172A] text-white text-sm font-bold opacity-40 cursor-not-allowed"
              >
                Assign Week
              </button>
            </div>
            {isPlaceholder && (
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-800">
                Curriculum content for this strand is coming soon. Lesson titles and focus descriptions are placeholders.
              </div>
            )}
          </div>

          {/* Lesson cards */}
          <div className="grid md:grid-cols-3 gap-3">
            {(week?.lessons ?? []).map((lsn) => {
              const counts = lessonStatusCounts(lsn.id);
              const lacc = lessonAvgAccuracy(week?.week ?? 1, lsn.lesson);
              return (
                <button
                  key={lsn.id}
                  type="button"
                  onClick={() => setPreviewLesson(lsn)}
                  className="text-left bg-white rounded-2xl border border-[#E6E8EC] p-4 flex flex-col gap-3 hover:border-teal-300 hover:shadow-sm transition cursor-pointer"
                  title="Click to preview lesson content"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-teal-50 text-teal-700 text-xs font-black">
                      L{lsn.lesson}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md">
                      {DEFAULT_LESSON_XP} XP
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-black text-[#0F172A] leading-snug">
                      {lsn.title}
                    </div>
                    <div className="text-xs text-[#64748B] mt-1 leading-relaxed line-clamp-3">
                      {lsn.focus}
                    </div>
                  </div>

                  {/* Class avg accuracy on this lesson's quiz questions */}
                  <div
                    className={`rounded-lg border px-2.5 py-1.5 flex items-center justify-between ${accTone(lacc.avg, lacc.attempts)}`}
                    title={lacc.attempts === 0
                      ? "No students have attempted this week's quiz yet"
                      : `Average % correct on Lesson ${lsn.lesson} quiz questions across ${lacc.attempts} student${lacc.attempts === 1 ? "" : "s"}`}
                  >
                    <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-80">
                      Quiz Accuracy
                    </span>
                    <span className="text-[12px] font-black tabular-nums">
                      {lacc.attempts === 0 ? "—" : `${lacc.avg}%`}
                      <span className="text-[9px] font-bold opacity-70 ml-1">
                        ({lacc.attempts})
                      </span>
                    </span>
                  </div>

                  {/* Status counts */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <StatusPill label="Done" value={counts.completed} tone="teal" />
                    <StatusPill label="Active" value={counts.inProgress} tone="amber" />
                    <StatusPill label="New" value={counts.notStarted} tone="slate" />
                    <StatusPill label="Help" value={counts.struggling} tone="rose" />
                  </div>

                  <span className="mt-auto w-full px-3 py-2 rounded-lg bg-teal-50 text-teal-700 text-xs font-extrabold text-center border border-teal-100">
                    Preview lesson →
                  </span>
                </button>
              );
            })}
          </div>

          {/* Weekly quiz card */}
          <div className="bg-white rounded-2xl border border-[#E6E8EC] p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-[0.14em]">
                Weekly Quiz
              </div>
              <div className="text-sm font-black text-[#0F172A] mt-0.5">
                Week {week?.week} mastery check
              </div>
              <div className="text-xs text-[#64748B] mt-0.5">
                15 questions · 5 from each lesson · 80% to pass
              </div>
            </div>
            <button
              disabled
              className="px-3.5 py-2 rounded-lg bg-[#F1F5F9] text-[#64748B] text-sm font-bold cursor-not-allowed"
            >
              Assign Quiz
            </button>
          </div>
        </div>
      </div>

      <LessonPreviewDrawer
        open={!!previewLesson}
        onClose={() => setPreviewLesson(null)}
        lesson={previewLesson}
        weekNumber={week?.week}
        weekTopic={week?.topic}
        strand={genre?.strand}
        realm={genre?.realm}
        yearLabel={yearLabel}
        isPlaceholder={isPlaceholder}
        classStats={previewLesson ? (() => {
          const c = lessonStatusCounts(previewLesson.id);
          const a = lessonAvgAccuracy(week?.week ?? 1, previewLesson.lesson);
          return {
            studentCount,
            completed: c.completed,
            inProgress: c.inProgress,
            notStarted: c.notStarted,
            quizAvg: a.avg,
            quizAttempts: a.attempts,
          };
        })() : null}
      />
    </div>
  );
}

function StatusPill({
  label, value, tone,
}: {
  label: string;
  value: number;
  tone: "teal" | "amber" | "slate" | "rose";
}) {
  const map = {
    teal:  "bg-teal-50 text-teal-700 border-teal-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
    rose:  "bg-rose-50 text-rose-700 border-rose-100",
  } as const;
  return (
    <div className={`rounded-lg border px-1.5 py-1 text-center ${map[tone]}`}>
      <div className="text-[14px] font-black tabular-nums leading-none">{value}</div>
      <div className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5 opacity-80">{label}</div>
    </div>
  );
}
