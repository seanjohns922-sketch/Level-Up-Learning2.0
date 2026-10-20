"use client";

import { useMemo, useState } from "react";
import { openDocumentWindow, writeDocument } from "@/lib/documents/reliq-document";
import { scopeAndSequenceHtml } from "@/lib/documents/scope-sequence";
import { coverageRows, FRAMEWORKS, frameworkAvailable, frameworkCodes, type CurriculumFramework } from "@/lib/curriculum/frameworks";
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
const FRAMEWORK_STORAGE_KEY = "reliq:scope-framework:v1";

const FRAMEWORK_SOURCE: Record<CurriculumFramework, string> = {
  aus: "Content descriptions © ACARA, Australian Curriculum v9.0 (CC BY 4.0) · RELIQ · BrightUp Education",
  vic: "Codes from the Victorian Curriculum F–10 Version 2.0 © VCAA, matched to AC9 from official documents · RELIQ",
  nsw: "Outcome codes © NESA, mapped through NESA's Australian Curriculum map K–6 · RELIQ",
};

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
  const genres = getGenresForYear(yearLabel).map(g=>(yearLabel === "Year 7" || yearLabel === "Year 8") && (["number","measurement","space","pattern","statistics","chance","algebra","probability"].includes(g.id)) ? {...g,available:true}:g);
  const firstAvailable = genres.find((g) => g.available) ?? genres[0];
  const [genreId, setGenreId] = useState<string>(firstAvailable.id);
  const [weekNum, setWeekNum] = useState<number>(1);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  // Curriculum the scope and sequence is printed against; remembered on this device.
  const [framework, setFramework] = useState<CurriculumFramework>(() => {
    try {
      const stored = typeof window !== "undefined" ? window.localStorage.getItem(FRAMEWORK_STORAGE_KEY) : null;
      return stored === "vic" || stored === "nsw" ? stored : "aus";
    } catch {
      return "aus";
    }
  });

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
    if (attempts === 0) return "bg-[#F7F8F5] text-[#5A5E63] border-[#E3E5E0]";
    if (avg >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (avg >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  // NSW is only mapped to Stage 3, so higher levels fall back to the Australian Curriculum.
  const activeFramework: CurriculumFramework = frameworkAvailable(framework, yearLabel, genreId) ? framework : "aus";

  function chooseFramework(next: CurriculumFramework) {
    setFramework(next);
    try {
      window.localStorage.setItem(FRAMEWORK_STORAGE_KEY, next);
    } catch {
      /* the choice still applies for this visit */
    }
  }

  function handleScopePdf() {
    const win = openDocumentWindow();
    if (!win) return;
    const lessons = plan.flatMap((week) => week.lessons.map((lesson, index) => ({ week: week.week, lesson: index + 1, title: lesson.title, ac9: lesson.curriculum ?? [] })));
    writeDocument(win, scopeAndSequenceHtml({
      realmName: genre?.realm ?? "",
      strandLabel: STRAND_SHORT[genreId] ?? genre?.strand ?? genreId,
      yearLabel,
      curriculumMeta: FRAMEWORKS[activeFramework].meta,
      sourceNote: FRAMEWORK_SOURCE[activeFramework],
      weeks: plan.map((week) => ({
        week: week.week,
        topic: week.topic,
        lessons: week.lessons.map((lesson) => lesson.title),
        codes: frameworkCodes(activeFramework, week.lessons.flatMap((lesson) => lesson.curriculum ?? []), yearLabel),
      })),
      coverage: coverageRows(activeFramework, yearLabel, genreId, lessons),
    }));
  }

  function handleDownloadCsv() {
    if(yearLabel === "Year 7" && (["number","measurement","space","pattern","statistics","chance","algebra","probability"].includes(genreId))){const a=document.createElement("a");a.href=`/curriculum/${genreId==="algebra"?"pattern":genreId==="probability"?"chance":genreId}-level7-scope-and-sequence.csv`;a.download=`reliq-${genreId}-level-7-scope-and-sequence.csv`;a.click();return;}
    const rows: string[] = [
      ["Week", "Topic", "Lesson", "Title", "Focus", "Curriculum Codes", ...(activeFramework === "aus" ? [] : [`${FRAMEWORKS[activeFramework].label} Codes`])].join(","),
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
            ...(activeFramework === "aus" ? [] : [`"${frameworkCodes(activeFramework, l.curriculum, yearLabel).join(", ")}"`]),
          ].join(",")
        );
      }
    }
    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reliq-${yearLabel.replace(" ", "-").toLowerCase()}-lesson-schedule.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Realm picker */}
      <div className="overflow-hidden rounded-2xl border border-[#E3E5E0] bg-white">
        <div className="flex items-center gap-2 overflow-x-auto px-5 py-3">
          <span className="shrink-0 pr-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#5A5E63] [font-family:var(--font-display)]">Realm</span>
          {[...MATHS_STRAND_IDS, "__divider__", ...ENGLISH_STRAND_IDS].map((id, idx) => {
            if (id === "__divider__") return <span key={`div-${idx}`} className="mx-1 h-5 w-px shrink-0 bg-[#E3E5E0]" />;
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
                  "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border-2 px-3.5 py-1.5 text-[13px] font-bold transition",
                  active
                    ? "border-[#121314] bg-[#121314] text-white"
                    : soon
                      ? "border-[#EEF0EC] bg-[#F7F8F5] text-[#A3A7A1] cursor-not-allowed"
                      : "border-[#121314] bg-white text-[#121314] hover:bg-[#EEFBDB]",
                ].join(" ")}
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: soon ? "#CFD2CC" : active ? "#83E300" : accent }} />
                {STRAND_SHORT[g.id] ?? g.strand}
                {soon ? (
                  <span className="text-[9px] font-extrabold uppercase tracking-wide text-[#8A8E89]">soon</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>


      {/* Documents: schedule, curriculum and scope and sequence */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl bg-[#121314] px-5 py-3">
        <div className="mr-auto">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#83E300] [font-family:var(--font-display)]">Plan and print</div>
          <div className="text-[13px] font-semibold text-white/70">{genre?.realm ?? "This realm"} · {yearLabel.replace("Year", "Level").replace("Prep", "Ground")}</div>
        </div>
          <button
            onClick={handleDownloadCsv}
            className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-white/70 px-3.5 py-1.5 text-[12px] font-bold text-white transition hover:border-[#83E300] hover:text-[#83E300] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83E300]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download Schedule
          </button>
          {MATHS_STRAND_IDS.includes(genreId) && plan.length > 0 ? (
            <select
              aria-label="Curriculum for the scope and sequence"
              value={activeFramework}
              onChange={(event) => chooseFramework(event.target.value as CurriculumFramework)}
              className="shrink-0 cursor-pointer rounded-full border-2 border-white/70 bg-[#121314] px-3.5 py-1.5 text-[12px] font-bold text-white transition hover:border-[#83E300] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#83E300]"
            >
              {(Object.keys(FRAMEWORKS) as CurriculumFramework[]).map((key) => (
                <option key={key} value={key} disabled={!frameworkAvailable(key, yearLabel, genreId)}>
                  {FRAMEWORKS[key].label}{frameworkAvailable(key, yearLabel, genreId) ? "" : " (Foundation–Level 6)"}
                </option>
              ))}
            </select>
          ) : null}
          {MATHS_STRAND_IDS.includes(genreId) && plan.length > 0 ? (
            <button
              onClick={handleScopePdf}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#83E300] px-4 py-2 text-[12px] font-black uppercase tracking-wide text-[#121314] transition hover:bg-[#74CC00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white [font-family:var(--font-display)]"
            >
              Scope and sequence PDF
            </button>
          ) : null}
      </div>

      {/* Week strip + detail */}
      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        {/* Week strip */}
        <div className="h-fit rounded-2xl border border-[#E3E5E0] bg-white p-3">
          <div className="px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#5A5E63] [font-family:var(--font-display)]">
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
                      ? "border-[#121314] bg-[#121314]"
                      : "border-[#E3E5E0] bg-white hover:border-[#121314]",
                  ].join(" ")}
                >
                  <div className={`text-[11px] font-black uppercase tracking-wider [font-family:var(--font-display)] ${active ? "text-[#83E300]" : "text-[#5A5E63]"}`}>
                    Week {w.week}
                  </div>
                  <div className={`text-[12px] font-bold line-clamp-2 leading-snug mt-0.5 ${active ? "text-white" : "text-[#121314]"}`}>
                    {w.topic}
                  </div>
                  <div
                    className={`mt-2 h-1.5 rounded-full overflow-hidden ${active ? "bg-white/15" : "bg-[#EEF0EC]"}`}
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
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider ${active ? "text-white/60" : "text-[#5A5E63]"}`}>
                      Accuracy
                    </span>
                    <span
                      className={`text-[10px] font-extrabold tabular-nums ${
                        acc.attempts === 0
                          ? "text-[#8A8E89]"
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
          <div className="rounded-2xl border border-[#E3E5E0] bg-white px-6 py-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3D6600] [font-family:var(--font-display)]">
                  {genre?.strand} · {genre?.realm}
                </div>
                <h2 className="mt-2 text-2xl font-black uppercase leading-tight tracking-tight text-[#121314] [font-family:var(--font-display)]">
                  <span className="mr-2 inline-block bg-[#83E300] px-2 py-0.5">Week {week?.week}</span>
                  {week?.topic}
                </h2>
                <div className="text-xs font-semibold text-[#5A5E63] mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{yearLabel} · {studentCount} student{studentCount === 1 ? "" : "s"}</span>
                  {(() => {
                    const acc = weekAvgAccuracy(selectedWeekNumber);
                    return (
                      <span>
                        · quiz avg{" "}
                        <b className={acc.attempts === 0 ? "text-[#8A8E89]" : acc.avg >= 80 ? "text-emerald-700" : acc.avg >= 60 ? "text-amber-700" : "text-rose-700"}>
                          {acc.attempts === 0 ? "—" : `${acc.avg}%`}
                        </b>
                        <span className="text-[#8A8E89]"> ({acc.attempts} attempt{acc.attempts === 1 ? "" : "s"})</span>
                      </span>
                    );
                  })()}
                </div>
              </div>
              <button
                disabled
                title="Coming soon: assign this whole week to your class or selected students"
                className="cursor-not-allowed rounded-full bg-[#121314] px-4 py-2 text-[12px] font-black uppercase tracking-wide text-[#83E300] opacity-40 [font-family:var(--font-display)]"
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
                  className="group flex cursor-pointer flex-col gap-3 rounded-2xl border border-[#E3E5E0] bg-white p-4 text-left transition hover:border-[#121314]"
                  title="Click to preview lesson content"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#121314] text-xs font-black text-[#83E300] [font-family:var(--font-display)]">
                      L{lsn.lesson}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#121314] px-2 py-0.5 text-[10px] font-extrabold text-[#121314]">
                      {DEFAULT_LESSON_XP} XP
                    </span>
                  </div>
                  <div>
                    <div className="text-[15px] font-black leading-snug text-[#121314]">
                      {lsn.title}
                    </div>
                    <div className="mt-1 line-clamp-3 text-xs leading-relaxed text-[#5A5E63]">
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

                  <span className="mt-auto w-full rounded-full border-2 border-[#121314] px-3 py-2 text-center text-[11px] font-black uppercase tracking-wide text-[#121314] transition group-hover:bg-[#83E300] [font-family:var(--font-display)]">
                    Preview lesson →
                  </span>
                </button>
              );
            })}
          </div>

          {/* Weekly quiz card */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E3E5E0] bg-white p-5">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3D6600] [font-family:var(--font-display)]">
                Weekly Quiz
              </div>
              <div className="mt-1 text-lg font-black uppercase tracking-tight text-[#121314] [font-family:var(--font-display)]">
                Week {week?.week} mastery check
              </div>
              <div className="mt-0.5 text-xs text-[#5A5E63]">
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
                className="cursor-not-allowed rounded-full bg-[#121314] px-4 py-2 text-[12px] font-black uppercase tracking-wide text-[#83E300] opacity-40 [font-family:var(--font-display)]"
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
