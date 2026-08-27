"use client";

import { useMemo, useState } from "react";
import {
  getGenresForYear,
  getCurriculumPlan,
  DEFAULT_LESSON_XP,
  type Genre,
} from "@/data/programs/genres";
import type { Lesson } from "@/data/programs/year1";
import LessonPreviewDrawer from "./LessonPreviewDrawer";
import { calculateAccuracy } from "@/lib/learning-score";
import { tryCanonicalRealmId } from "@/lib/realms/realm-registry";
import { selectCanonicalTeacherProgressRow } from "@/lib/teacher/teacher-student-snapshot";

type ProgressLike = {
  student_id: string;
  realm_id?: string;
  year: string;
  is_current?: boolean | null;
  updated_at?: string | null;
  week: number | null;
  completed_lesson_ids: string[] | null;
  quiz_scores?: unknown;
};

type QuizLessonBreakdownItem = {
  lessonNumber?: number;
  correct?: number;
  total?: number;
};

type QuizScoreLike = {
  percent?: number;
  score?: number;
  correct?: number;
  total?: number;
  accuracy?: number;
  status?: string;
  completedAt?: string;
  lessonBreakdown?: QuizLessonBreakdownItem[];
};

type Props = {
  yearLabel: string;
  studentCount: number;
  studentIds: string[];
  progress: ProgressLike[];
  progressAvailable?: boolean;
};

// Match the Students tab strand picker so the two views read as one system.
const STRAND_SHORT: Record<string, string> = {
  number: "Number", measurement: "Measurement", space: "Space",
  statistics: "Statistics", algebra: "Algebra", probability: "Probability",
  reading: "Reading", writing: "Writing", grammar: "Grammar",
};
const STRAND_ACCENT: Record<string, string> = {
  number: "#0e9c93", measurement: "#c2892e", space: "#5b6ee6",
  statistics: "#c2557a", algebra: "#7c3aed", probability: "#0891b2",
  reading: "#e07a5f", writing: "#3d8b6f", grammar: "#b45309",
};
const MATHS_STRAND_IDS = ["number", "measurement", "space", "statistics", "algebra", "probability"];
const ENGLISH_STRAND_IDS = ["reading", "writing", "grammar"];

function parseCompleted(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

export default function CurriculumExplorer({
  yearLabel,
  studentCount,
  studentIds,
  progress,
  progressAvailable = true,
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
  const selectedRealmId = tryCanonicalRealmId(genreId);

  const week = plan.find((w) => w.week === weekNum) ?? plan[0];
  const selectedWeekNumber = week?.week ?? null;
  const yearProgress =
    progressAvailable && selectedRealmId
      ? studentIds
          .map((studentId) =>
            selectCanonicalTeacherProgressRow(studentId, selectedRealmId, progress),
          )
          .filter(
            (row): row is ProgressLike => row != null && row.year === yearLabel,
          )
      : [];
  const isPlaceholder = !genre?.available;

  /** Per-lesson status counts across loaded students. */
  function lessonStatusCounts(lessonId: string) {
    if (isPlaceholder) {
      return { completed: 0, inProgress: 0, notStarted: studentCount, struggling: 0 };
    }
    let completed = 0;
    let inProgress = 0;
    for (const p of yearProgress) {
      const ids = parseCompleted(p.completed_lesson_ids);
      if (ids.includes(lessonId)) completed += 1;
      else if (selectedWeekNumber != null && (p.week ?? 0) >= selectedWeekNumber) inProgress += 1;
    }
    const notStarted = Math.max(0, studentCount - completed - inProgress);
    return { completed, inProgress, notStarted, struggling: 0 };
  }


  function parseQuizLessonBreakdown(raw: unknown): QuizLessonBreakdownItem[] {
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const record = item as Record<string, unknown>;
        return {
          lessonNumber: typeof record.lessonNumber === "number" ? record.lessonNumber : undefined,
          correct: typeof record.correct === "number" ? record.correct : undefined,
          total: typeof record.total === "number" ? record.total : undefined,
        };
      });
  }

  function parseQuiz(raw: unknown): Record<string, QuizScoreLike> {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    const parsed: Record<string, QuizScoreLike> = {};
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (!value || typeof value !== "object" || Array.isArray(value)) continue;
      const record = value as Record<string, unknown>;
      parsed[key] = {
        percent: typeof record.percent === "number" ? record.percent : undefined,
        score: typeof record.score === "number" ? record.score : undefined,
        correct: typeof record.correct === "number" ? record.correct : undefined,
        total: typeof record.total === "number" ? record.total : undefined,
        accuracy: typeof record.accuracy === "number" ? record.accuracy : undefined,
        status: typeof record.status === "string" ? record.status : undefined,
        completedAt: typeof record.completedAt === "string" ? record.completedAt : undefined,
        lessonBreakdown: parseQuizLessonBreakdown(record.lessonBreakdown),
      };
    }
    return parsed;
  }

  /** Class average quiz accuracy % for a week (across all students who attempted). */
  function weekAvgAccuracy(w: number | null): { avg: number; attempts: number } {
    if (isPlaceholder) return { avg: 0, attempts: 0 };
    if (w == null) return { avg: 0, attempts: 0 };
    let correct = 0;
    let total = 0;
    let n = 0;
    for (const p of yearProgress) {
      const qs = parseQuiz(p.quiz_scores);
      const wq = qs[String(w)];
      const quizCorrect = wq?.score ?? wq?.correct;
      if (typeof quizCorrect === "number" && typeof wq?.total === "number" && wq.total > 0) {
        correct += quizCorrect;
        total += wq.total;
        n += 1;
      }
    }
    return { avg: calculateAccuracy(correct, total) ?? 0, attempts: n };
  }

  /** Class average per-lesson accuracy from weekly quiz lessonBreakdown. */
  function lessonAvgAccuracy(w: number | null, lessonNumber: number): { avg: number; attempts: number } {
    if (isPlaceholder) return { avg: 0, attempts: 0 };
    if (w == null) return { avg: 0, attempts: 0 };
    let sumCorrect = 0;
    let sumTotal = 0;
    let n = 0;
    for (const p of yearProgress) {
      const qs = parseQuiz(p.quiz_scores);
      const wq = qs[String(w)];
      const lb = wq?.lessonBreakdown ?? [];
      const item = lb.find((entry) => entry.lessonNumber === lessonNumber);
      if (typeof item?.correct === "number" && typeof item.total === "number" && item.total > 0) {
        sumCorrect += item.correct;
        sumTotal += item.total;
        n += 1;
      }
    }
    return { avg: calculateAccuracy(sumCorrect, sumTotal) ?? 0, attempts: n };
  }

  function accTone(avg: number, attempts: number) {
    if (attempts === 0) return "bg-slate-50 text-slate-400 border-slate-200";
    if (avg >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (avg >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  function handleDownloadCsv() {
    const rows: string[] = [
      ["Week", "Topic", "Lesson", "Title", "Focus", "Curriculum Codes"].join(","),
    ];
    for (const w of plan) {
      for (const l of w.lessons) {
        rows.push(
          [
            w.week,
            `"${w.topic.replace(/"/g, '""')}"`,
            l.lesson,
            `"${l.title.replace(/"/g, '""')}"`,
            `"${l.focus.replace(/"/g, '""')}"`,
            `"${l.curriculum.join(", ")}"`,
          ].join(",")
        );
      }
    }
    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${yearLabel.replace(" ", "-").toLowerCase()}-lesson-schedule.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Strand picker — matches the Students tab pill filter */}
      <div className="bg-white rounded-2xl border border-[#E6E8EC] overflow-hidden shadow-[0_4px_16px_-12px_rgba(15,23,42,0.18)]">
        <div className="flex items-center gap-2 overflow-x-auto px-5 py-2.5">
          <span className="shrink-0 pr-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">Strand</span>
          {[...MATHS_STRAND_IDS, "__divider__", ...ENGLISH_STRAND_IDS].map((id, idx) => {
            if (id === "__divider__") return <span key={`div-${idx}`} className="mx-1 h-5 w-px shrink-0 bg-[#E2E8F0]" />;
            const g = genres.find((x) => x.id === id);
            if (!g) return null;
            const active = g.id === genreId;
            const soon = !g.available;
            const accent = STRAND_ACCENT[g.id] ?? "#64748B";
            return (
              <button
                key={g.id}
                onClick={() => { if (!soon) { setGenreId(g.id); setWeekNum(1); } }}
                disabled={soon}
                aria-pressed={active}
                title={g.realm}
                className={[
                  "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-bold transition",
                  active
                    ? "border-[#00C2A8] bg-[#00C2A8]/[0.08] text-[#0A2F2A] shadow-[0_0_0_2px_rgba(0,194,168,0.16)]"
                    : soon
                      ? "border-[#EEF1F4] bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed"
                      : "border-[#E6E8EC] bg-white text-[#0F172A] hover:border-[#00C2A8]/60",
                ].join(" ")}
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: soon ? "#CBD5E1" : accent }} />
                {STRAND_SHORT[g.id] ?? g.strand}
                {soon ? (
                  <span className="text-[9px] font-extrabold uppercase tracking-wide text-[#94A3B8]">soon</span>
                ) : active ? (
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#00C2A8" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
                ) : null}
              </button>
            );
          })}
          <button
            onClick={handleDownloadCsv}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-[#E6E8EC] bg-white px-3 py-1.5 text-[11px] font-bold text-[#64748B] transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download Schedule
          </button>
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
                  <div
                    className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden"
                    title={acc.attempts === 0 ? "No quiz attempts yet" : `Quiz accuracy avg across ${acc.attempts} student${acc.attempts === 1 ? "" : "s"}`}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${
                        acc.attempts === 0
                          ? "bg-slate-200"
                          : acc.avg >= 80
                            ? "bg-emerald-500"
                            : acc.avg >= 60
                              ? "bg-amber-500"
                              : "bg-rose-500"
                      }`}
                      style={{ width: `${acc.attempts === 0 ? 0 : acc.avg}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                      Accuracy
                    </span>
                    <span
                      className={`text-[10px] font-extrabold tabular-nums ${
                        acc.attempts === 0
                          ? "text-[#94A3B8]"
                          : acc.avg >= 80
                            ? "text-emerald-700"
                            : acc.avg >= 60
                              ? "text-amber-700"
                              : "text-rose-700"
                      }`}
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
                  {(() => {
                    const acc = weekAvgAccuracy(selectedWeekNumber);
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
              const lacc = lessonAvgAccuracy(selectedWeekNumber, lsn.lesson);
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
                      Lesson Accuracy
                    </span>
                    <span className="text-[12px] font-black tabular-nums">
                      {lacc.attempts === 0 ? "—" : `${lacc.avg}%`}
                      <span className="text-[9px] font-bold opacity-70 ml-1">
                        ({lacc.attempts})
                      </span>
                    </span>
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
            <div className="flex items-center gap-3">
              {(() => {
                const q = weekAvgAccuracy(selectedWeekNumber);
                return (
                  <div
                    className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${accTone(q.avg, q.attempts)}`}
                    title={q.attempts === 0
                      ? "No students have completed this week's quiz yet"
                      : `Average quiz score across ${q.attempts} student${q.attempts === 1 ? "" : "s"}`}
                  >
                    <div className="text-left">
                      <div className="text-[9px] font-extrabold uppercase tracking-wider opacity-80">
                        Class Avg Score
                      </div>
                      <div className="text-2xl font-black tabular-nums leading-none mt-0.5">
                        {q.attempts === 0 ? "—" : `${q.avg}%`}
                      </div>
                    </div>
                    <div className="text-[10px] font-bold opacity-70 leading-tight">
                      {q.attempts === 0 ? "no attempts yet" : `${q.attempts} sat`}
                    </div>
                  </div>
                );
              })()}
              <button
                disabled
                className="px-3.5 py-2 rounded-lg bg-[#F1F5F9] text-[#64748B] text-sm font-bold cursor-not-allowed"
              >
                Assign Quiz
              </button>
            </div>
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
        realmId={selectedRealmId ?? undefined}
        yearLabel={yearLabel}
        isPlaceholder={isPlaceholder}
        classStats={previewLesson ? (() => {
          const c = lessonStatusCounts(previewLesson.id);
          const a = lessonAvgAccuracy(selectedWeekNumber, previewLesson.lesson);
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
