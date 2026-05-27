"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  getGenresForYear,
  getCurriculumPlan,
  lessonIdPrefix,
  DEFAULT_LESSON_XP,
  type Genre,
} from "@/data/programs/genres";
import {
  formatSchoolYearDisplayLabel,
  formatStudentLevelLabel,
  normalizeSchoolYearLabel,
  normalizeWorkingLevelLabel,
} from "@/lib/studentLevelLabel";
import type { Lesson } from "@/data/programs/year1";
import { getLatestPosttestProfile } from "@/data/assessments/analysis";
import LessonPreviewDrawer from "./LessonPreviewDrawer";
import type { TeacherInsight, TeacherInsightStatus } from "@/lib/teacher-insights";

type StudentRow = {
  id: string;
  display_name: string;
  class_id: string;
  user_id: string;
  school_year_level?: string | null;
  working_level?: string | null;
  year_level?: string | null;
};

type JsonObject = Record<string, unknown>;
type InsightCarrier = {
  latestInsight?: TeacherInsight | null | undefined;
  latestSummary?: {
    timeSpentSeconds?: number | null;
    accuracy?: number | null;
    questionsAnswered?: number | null;
    correctAnswers?: number | null;
    incorrectAnswers?: number | null;
  } | null;
  attempts?: unknown[] | null;
};
type ProgressRow = {
  student_id: string;
  year: string;
  week: number | null;
  status: string;
  pretest_score: number | null;
  completed_lesson_ids: unknown;
  unlocked_legends: unknown;
  quiz_scores: unknown;
  lesson_attempts?: unknown;
  updated_at?: string;
};

type LiveStudentActivityRow = {
  student_id: string;
  class_id: string;
  current_level?: string | null;
  current_week?: number | null;
  current_lesson?: string | null;
  current_lesson_title?: string | null;
  current_activity_label?: string | null;
  progress_percent?: number | null;
  progress_label?: string | null;
  latest_event_type?: string | null;
  current_lesson_status?: string | null;
  questions_answered?: number | null;
  correct_count?: number | null;
  accuracy_percent?: number | null;
  current_question_text?: string | null;
  completed_at?: string | null;
  time_on_current_question?: number | null;
  last_active_at?: string | null;
  updated_at?: string | null;
};

type LessonCardPerformance = {
  lessonId: string;
  status: "Completed" | "In Progress" | "Not Started";
  correct: number | null;
  total: number | null;
  accuracy: number | null;
};

type WeeklyPerformanceSummary = {
  status: string;
  mainGap: string;
  suggestedAction: string;
  lessonsCompleted: number;
  totalLessons: number;
  lessonCards: LessonCardPerformance[];
  questionsAnswered: number;
  correctCount: number;
  incorrectCount: number;
  weeklyAccuracy: number | null;
  weeklyQuizStatus: "Completed" | "Attempted" | "Not Attempted";
  weeklyQuizCorrect: number | null;
  weeklyQuizTotal: number | null;
  weeklyQuizAccuracy: number | null;
  weeklyQuizPassed: boolean | null;
};

type Props = {
  yearLabel: string;
  students: StudentRow[];
  progress: ProgressRow[];
  liveRows: LiveStudentActivityRow[];
};

type StrandStatus = "Not Started" | "In Progress" | "Needs Support" | "Completed";

function yearToLevelLabel(year: string): string {
  return formatStudentLevelLabel(year);
}
type StudentFlagTone = "neutral" | "red" | "yellow" | "green";
type StudentFlag = {
  label: string;
  emoji: string;
  tone: StudentFlagTone;
};

function parseCompleted(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

function parseQuizScores(raw: unknown): Record<string, JsonObject> {
  if (raw && typeof raw === "object") return raw as Record<string, JsonObject>;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, JsonObject>) : {};
    } catch {
      return {};
    }
  }
  return {};
}

function parseLessonAttempts(raw: unknown): Record<string, InsightCarrier> {
  if (raw && typeof raw === "object") return raw as Record<string, InsightCarrier>;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, InsightCarrier>) : {};
    } catch {
      return {};
    }
  }
  return {};
}

function weekLessonsDone(ids: string[], week: number): number {
  const tag = `-w${week}-`;
  return ids.filter((id) => id.includes(tag)).length;
}

function getQuizPercent(quiz: JsonObject | undefined): number | null {
  const value = quiz?.percent;
  return typeof value == "number" ? value : null;
}

function getQuizScore(quiz: JsonObject | undefined): number | null {
  const value = quiz?.score;
  return typeof value === "number" ? value : null;
}

function getQuizTotal(quiz: JsonObject | undefined): number | null {
  const value = quiz?.total;
  return typeof value === "number" ? value : null;
}

function getQuizPassed(quiz: JsonObject | undefined): boolean {
  return quiz?.passed === true;
}

function getQuizAttemptsCount(quiz: JsonObject | undefined): number {
  const attempts = quiz?.attempts;
  return Array.isArray(attempts) ? attempts.length : quiz ? 1 : 0;
}

function countCompletedQuizzes(raw: unknown): number {
  const quizScores = parseQuizScores(raw);
  return Object.entries(quizScores).filter(([key, value]) => {
    if (!/^\d+$/.test(key)) return false;
    if (!value || typeof value !== "object") return false;
    const candidate = value as Record<string, unknown>;
    if (Array.isArray(candidate.attempts)) return true;
    return ["score", "percent", "passed", "total"].some((field) => field in candidate);
  }).length;
}

function totalProgramActivities(plan: ReturnType<typeof getCurriculumPlan>): number {
  if (plan.length === 0) return 48;
  return plan.reduce((sum, week) => sum + week.lessons.length + 1, 0);
}

function overallProgramPercent(
  prog: ProgressRow | undefined,
  yearLabel: string,
  plan: ReturnType<typeof getCurriculumPlan>,
): number {
  if (!prog) return 0;
  const ids = parseCompleted(prog.completed_lesson_ids);
  const prefix = lessonIdPrefix(yearLabel);
  const completedLessons = ids.filter((id) => id.startsWith(prefix)).length;
  const completedQuizzes = countCompletedQuizzes(prog.quiz_scores);
  const totalActivities = totalProgramActivities(plan);
  if (totalActivities <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round(((completedLessons + completedQuizzes) / totalActivities) * 100)));
}

function computeStatus(prog: ProgressRow | undefined, completedCount: number, pct: number): StrandStatus {
  if (!prog || (prog.week == null && completedCount === 0)) return "Not Started";
  if (pct >= 100) return "Completed";
  if (prog.pretest_score != null && prog.pretest_score < ASSESSMENT_PASS_THRESHOLD) return "Needs Support";
  // Latest post-test failed?
  const latest = getLatestPosttestProfile(prog.quiz_scores);
  if (latest && !latest.passed) return "Needs Support";
  return "In Progress";
}

const ASSESSMENT_PASS_THRESHOLD = 85;

const INSIGHT_SEVERITY: Record<TeacherInsightStatus, number> = {
  "Needs Support": 3,
  "Quick Check-in Recommended": 2,
  "On Track": 1,
  "Ready to Move On": 0,
};

function getWeekInsightList(
  prog: ProgressRow | undefined,
  weekNumber: number,
  lessonIds: string[],
): TeacherInsight[] {
  if (!prog) return [];
  const quizScores = parseQuizScores(prog.quiz_scores);
  const lessonAttempts = parseLessonAttempts(prog.lesson_attempts);

  const lessonInsights = lessonIds
    .map((lessonId) => lessonAttempts[lessonId]?.latestInsight as TeacherInsight | null | undefined)
    .filter((insight): insight is TeacherInsight => Boolean(insight));

  const quizInsight = quizScores[String(weekNumber)]?.latestInsight as TeacherInsight | null | undefined;
  return quizInsight ? [...lessonInsights, quizInsight] : lessonInsights;
}

function pickPrimaryInsight(insights: TeacherInsight[]): TeacherInsight | null {
  if (insights.length === 0) return null;
  return [...insights].sort((left, right) => {
    const severityGap = INSIGHT_SEVERITY[right.status] - INSIGHT_SEVERITY[left.status];
    if (severityGap !== 0) return severityGap;
    return left.gap.localeCompare(right.gap);
  })[0] ?? null;
}

function deriveStudentFlag(
  insight: TeacherInsight | null,
  fallbackStatus: StrandStatus,
): StudentFlag {
  if (insight?.status === "Needs Support" || fallbackStatus === "Needs Support") {
    return { label: "Needs support", emoji: "🔴", tone: "red" };
  }
  if (insight?.status === "Quick Check-in Recommended" || fallbackStatus === "In Progress") {
    return { label: "Check-in", emoji: "🟡", tone: "yellow" };
  }
  if (insight?.status === "On Track" || insight?.status === "Ready to Move On" || fallbackStatus === "Completed") {
    return { label: "On track", emoji: "🟢", tone: "green" };
  }
  return { label: "Not started", emoji: "⚪", tone: "neutral" };
}

function simplifyGapLabel(gap: string) {
  return gap
    .replace(/^They were least secure in\s+/i, "")
    .replace(/, where accuracy dropped\.$/i, "")
    .replace(/\.$/, "")
    .trim();
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function buildWeekSummary(
  insights: TeacherInsight[],
  fallbackStatus: StrandStatus,
  liveRow?: LiveStudentActivityRow | null,
): {
  status: string;
  mainGap: string;
  suggestedAction: string;
} {
  const primary = pickPrimaryInsight(insights);
  if (primary) {
    return {
      status: primary.status,
      mainGap: simplifyGapLabel(primary.gap),
      suggestedAction: primary.teacherAction,
    };
  }

  if (liveRow) {
    const answered = liveRow.questions_answered ?? 0;
    const correct = liveRow.correct_count ?? 0;
    const accuracy = liveRow.accuracy_percent ?? (answered > 0 ? Math.round((correct / answered) * 100) : 0);
    const lessonLabel = liveRow.current_lesson_title ?? liveRow.current_lesson ?? "current lesson";
    const inactive = timeAgo(liveRow.last_active_at ?? undefined);

    if (liveRow.current_lesson_status === "completed") {
      return {
        status: "Completed",
        mainGap: `Completed ${lessonLabel}`,
        suggestedAction: answered > 0
          ? `Finished with ${correct}/${answered} correct (${accuracy}%). Last active ${inactive}.`
          : `Lesson completed. Last active ${inactive}.`,
      };
    }

    if (answered > 0) {
      return {
        status: fallbackStatus === "Needs Support" ? "Needs Support" : "On Track",
        mainGap: liveRow.current_question_text ? "Student has started but not completed this lesson yet" : "Student worked steadily in this lesson",
        suggestedAction: `Answered ${answered} question${answered === 1 ? "" : "s"} with ${correct}/${answered} correct (${accuracy}%). Last active ${inactive}.`,
      };
    }

    if (liveRow.latest_event_type) {
      return {
        status: fallbackStatus === "Needs Support" ? "Check-in Recommended" : "On Track",
        mainGap: "Student has started but not completed this lesson yet",
        suggestedAction: `No completed attempt data yet. Last active ${inactive}. Check in if they appear stuck.`,
      };
    }
  }

  if (fallbackStatus === "Needs Support") {
    return {
      status: "Needs Support",
      mainGap: "Foundational confidence is not secure yet",
      suggestedAction: "Run a quick teacher check-in before moving on.",
    };
  }

  if (fallbackStatus === "In Progress") {
    return {
      status: "Quick Check-in Recommended",
      mainGap: "This week is still in progress",
      suggestedAction: "Use a short verbal check before the next lesson.",
    };
  }

  if (fallbackStatus === "Completed") {
    return {
      status: "On Track",
      mainGap: "No clear gap recorded this week",
      suggestedAction: "Continue to the next lesson or weekly quiz.",
    };
  }

  return {
    status: "On Track",
    mainGap: "No attempt data yet",
    suggestedAction: "Wait for a completed lesson or quiz to generate insight.",
  };
}

function buildStudentWeeklyPerformanceSummary({
  weekNumber,
  lessons,
  completedIds,
  lessonAttempts,
  weekQuiz,
  fallbackStatus,
  liveRow,
}: {
  weekNumber: number;
  lessons: Lesson[];
  completedIds: string[];
  lessonAttempts: Record<string, InsightCarrier>;
  weekQuiz: JsonObject | undefined;
  fallbackStatus: StrandStatus;
  liveRow?: LiveStudentActivityRow | null;
}): WeeklyPerformanceSummary {
  const liveLessonMatch =
    liveRow &&
    liveRow.current_week === weekNumber &&
    (liveRow.current_lesson ?? liveRow.current_lesson_title)
      ? `${liveRow.current_lesson ?? ""}|${liveRow.current_lesson_title ?? ""}`
      : null;

  const lessonCards = lessons.map((lesson) => {
    const attempt = lessonAttempts[lesson.id];
    const latestSummary = attempt?.latestSummary;
    const summaryTotal = numberOrNull(latestSummary?.questionsAnswered);
    const summaryCorrect = numberOrNull(latestSummary?.correctAnswers);
    const summaryAccuracy = numberOrNull(latestSummary?.accuracy);

    const liveMatchesThisLesson =
      liveLessonMatch &&
      (liveRow?.current_lesson === lesson.id || liveRow?.current_lesson_title === lesson.title);

    const liveTotal = liveMatchesThisLesson ? numberOrNull(liveRow?.questions_answered) : null;
    const liveCorrect = liveMatchesThisLesson ? numberOrNull(liveRow?.correct_count) : null;
    const liveAccuracy = liveMatchesThisLesson ? numberOrNull(liveRow?.accuracy_percent) : null;

    const total = summaryTotal ?? liveTotal;
    const correct = summaryCorrect ?? liveCorrect;
    const accuracy =
      summaryAccuracy ??
      liveAccuracy ??
      (total && correct != null ? Math.round((correct / total) * 100) : null);

    const status: LessonCardPerformance["status"] = completedIds.includes(lesson.id)
      ? "Completed"
      : total != null || liveMatchesThisLesson
        ? "In Progress"
        : "Not Started";

    return {
      lessonId: lesson.id,
      status,
      correct,
      total,
      accuracy,
    };
  });

  const lessonsCompleted = lessonCards.filter((card) => card.status === "Completed").length;
  const questionsAnswered = lessonCards.reduce((sum, card) => sum + (card.total ?? 0), 0);
  const correctCount = lessonCards.reduce((sum, card) => sum + (card.correct ?? 0), 0);
  const incorrectCount = Math.max(0, questionsAnswered - correctCount);
  const weeklyAccuracy = questionsAnswered > 0 ? Math.round((correctCount / questionsAnswered) * 100) : null;

  const weekInsights = lessons
    .map((lesson) => lessonAttempts[lesson.id]?.latestInsight as TeacherInsight | null | undefined)
    .filter((insight): insight is TeacherInsight => Boolean(insight));
  const weekSummary = buildWeekSummary(weekInsights, fallbackStatus, liveRow ?? undefined);

  const weeklyQuizCorrect = getQuizScore(weekQuiz);
  const weeklyQuizTotal = getQuizTotal(weekQuiz);
  const weeklyQuizAccuracy =
    getQuizPercent(weekQuiz) ??
    (weeklyQuizCorrect != null && weeklyQuizTotal && weeklyQuizTotal > 0
      ? Math.round((weeklyQuizCorrect / weeklyQuizTotal) * 100)
      : null);
  const weeklyQuizPassed = weekQuiz ? getQuizPassed(weekQuiz) : null;
  const weeklyQuizStatus: WeeklyPerformanceSummary["weeklyQuizStatus"] = weekQuiz
    ? weeklyQuizPassed
      ? "Completed"
      : "Attempted"
    : "Not Attempted";

  return {
    status: questionsAnswered === 0 && !weekQuiz ? "Not Started" : weekSummary.status,
    mainGap: weekSummary.mainGap,
    suggestedAction: weekSummary.suggestedAction,
    lessonsCompleted,
    totalLessons: lessons.length,
    lessonCards,
    questionsAnswered,
    correctCount,
    incorrectCount,
    weeklyAccuracy,
    weeklyQuizStatus,
    weeklyQuizCorrect,
    weeklyQuizTotal,
    weeklyQuizAccuracy,
    weeklyQuizPassed,
  };
}

function buildClassInsight(
  rows: Array<{ flag: StudentFlag; summary: ReturnType<typeof buildWeekSummary> }>,
) {
  const activeRows = rows.filter((row) => row.summary.mainGap !== "No attempt data yet");
  if (activeRows.length === 0) {
    return {
      percent: 0,
      gap: "No class insight yet",
      action: "Complete a lesson or weekly quiz to generate class-level insight.",
    };
  }

  const gapCounts = new Map<string, number>();
  for (const row of activeRows) {
    const key = row.summary.mainGap;
    gapCounts.set(key, (gapCounts.get(key) ?? 0) + 1);
  }

  const [topGap, topCount] =
    [...gapCounts.entries()].sort((left, right) => right[1] - left[1])[0] ?? ["No clear shared gap", 0];
  const percent = Math.round((topCount / activeRows.length) * 100);
  const supportCount = activeRows.filter((row) => row.flag.tone === "red" || row.flag.tone === "yellow").length;

  return {
    percent,
    gap: topGap,
    action:
      supportCount >= Math.ceil(activeRows.length / 2)
        ? "Suggested whole-class reteach recommended."
        : "Target a small group before reteaching the whole class.",
  };
}

function timeAgo(iso?: string): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return "—";
  const d = Math.floor(ms / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) return "n/a";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (minutes <= 0) return `${remaining}s`;
  return `${minutes}m ${remaining}s`;
}

const YEAR_ORDER = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
function yearOrdinal(label: string): number {
  const i = YEAR_ORDER.indexOf(label);
  return i === -1 ? 0 : i;
}

/** Pick the most relevant year for a student from their progress rows. */
function pickStudentYear(rows: ProgressRow[], fallback: string): string {
  if (rows.length === 0) return fallback;
  // Prefer the most recently updated row; otherwise highest year ordinal.
  const sorted = [...rows].sort((a, b) => {
    const tA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
    const tB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
    if (tA !== tB) return tB - tA;
    return yearOrdinal(b.year) - yearOrdinal(a.year);
  });
  return sorted[0].year;
}

function levelToYearLabel(level?: string | null): string | null {
  return normalizeWorkingLevelLabel(level);
}

function liveRowToStatus(row?: LiveStudentActivityRow | undefined): StrandStatus {
  if (!row) return "Not Started";
  if (row.current_lesson_status === "completed") return "Completed";
  if (row.latest_event_type) return "In Progress";
  return "Not Started";
}

export default function StrandStudentsPanel({ yearLabel, students, progress, liveRows }: Props) {
  const genres = getGenresForYear(yearLabel);
  const firstAvail = genres.find((g) => g.available) ?? genres[0];
  const [genreId, setGenreId] = useState<string>(firstAvail.id);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  type SortKey = "name" | "level" | "week" | "status" | "tower";
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir(k === "name" ? "asc" : "desc"); }
  }

  const genre = genres.find((g) => g.id === genreId)!;
  const isPlaceholder = !genre.available;

  function getProg(studentId: string, year: string) {
    return progress.find((p) => p.student_id === studentId && p.year === year);
  }

  function getStudentProgressRows(studentId: string) {
    return progress.filter((p) => p.student_id === studentId);
  }

  function getLatestPretestProgress(studentId: string): ProgressRow | undefined {
    const rows = getStudentProgressRows(studentId).filter((p) => p.pretest_score != null);
    return [...rows].sort((a, b) => {
      const tA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const tB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      if (tA !== tB) return tB - tA;
      return yearOrdinal(b.year) - yearOrdinal(a.year);
    })[0];
  }

  function getLiveRow(studentId: string) {
    return liveRows.find((row) => row.student_id === studentId);
  }

  function getWorkingYear(student: StudentRow): string {
    const liveYear = levelToYearLabel(getLiveRow(student.id)?.current_level);
    if (liveYear) return liveYear;
    const rows = progress.filter((p) => p.student_id === student.id);
    if (rows.length > 0) return pickStudentYear(rows, normalizeWorkingLevelLabel(student.working_level ?? student.year_level) ?? yearLabel);
    return normalizeWorkingLevelLabel(student.working_level ?? student.year_level) ?? yearLabel;
  }

  function getSchoolYear(student: StudentRow): string {
    return normalizeSchoolYearLabel(student.school_year_level) ?? formatSchoolYearDisplayLabel(yearLabel);
  }

  const studentRows = students
    .map((s) => {
      const schoolYear = getSchoolYear(s);
      const workingYear = getWorkingYear(s);
      const prog = getProg(s.id, workingYear);
      const liveRow = getLiveRow(s.id);
      const ids = prog ? parseCompleted(prog.completed_lesson_ids) : [];
      const sPrefix = lessonIdPrefix(workingYear);
      const strandIds = isPlaceholder ? [] : ids.filter((id) => id.startsWith(sPrefix));
      const planForStudentYear = getCurriculumPlan(workingYear, genreId);
      const pct = isPlaceholder ? 0 : overallProgramPercent(prog, workingYear, planForStudentYear);
      const computedStatus = isPlaceholder ? "Not Started" : computeStatus(prog, strandIds.length, pct);
      const status = computedStatus === "Not Started" && liveRow ? liveRowToStatus(liveRow) : computedStatus;
      const week = isPlaceholder ? null : (prog?.week ?? liveRow?.current_week ?? null);
      const activeWeek = week ?? 1;
      const activeWeekPlan = planForStudentYear.find((entry) => entry.week === activeWeek);
      const activeLessonIds = activeWeekPlan?.lessons.map((lesson) => lesson.id) ?? [];
      const weekInsights = getWeekInsightList(prog, activeWeek, activeLessonIds);
      const summary = buildWeekSummary(weekInsights, status, liveRow);
      const flag = deriveStudentFlag(pickPrimaryInsight(weekInsights), status);
      const latestPretest = getLatestPretestProgress(s.id);

      return { s, prog, liveRow, pct, status, week, schoolYear, workingYear, summary, flag, latestPretest };
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const rank: Record<string, number> = { "Not Started": 0, "In Progress": 1, "Needs Support": 2, "Completed": 3 };
      const nameCmp = a.s.display_name.localeCompare(b.s.display_name);
      switch (sortKey) {
        case "name":   return dir * nameCmp;
        case "level":  return dir * (yearOrdinal(a.workingYear) - yearOrdinal(b.workingYear)) || nameCmp;
        case "week":   return dir * ((a.week ?? -1) - (b.week ?? -1)) || nameCmp;
        case "status": return dir * (rank[a.status] - rank[b.status]) || nameCmp;
        case "tower":  return dir * (a.pct - b.pct) || nameCmp;
      }
    });

  const classInsight = buildClassInsight(studentRows.map((row) => ({ flag: row.flag, summary: row.summary })));

  return (
    <div className="space-y-5">
      {/* Strand tab strip */}
      <div className="bg-white rounded-2xl border border-[#E6E8EC] p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="px-1 pb-2 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-[0.16em]">
          Strand · Realm
        </div>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => {
            const locked = false; // already filtered by year ordinal
            const active = g.id === genreId;
            const placeholder = !g.available;
            return (
              <button
                key={g.id}
                onClick={() => { setGenreId(g.id); setExpandedId(null); }}
                disabled={locked}
                className={[
                  "px-3.5 py-2 rounded-xl border text-left transition",
                  active
                    ? "border-[#00C2A8] bg-white shadow-[0_0_0_3px_rgba(0,194,168,0.12),0_8px_22px_-12px_rgba(0,194,168,0.55)]"
                    : "border-[#E6E8EC] bg-white hover:border-[#00C2A8]/50",
                  locked && "opacity-50 cursor-not-allowed",
                ].filter(Boolean).join(" ")}
              >
                <div className={`text-sm font-bold ${active ? "text-[#0A2F2A]" : "text-[#0F172A]"}`}>
                  {g.strand}
                </div>
                <div className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1.5 tracking-wide">
                  {g.realm}
                  {placeholder && (
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

      {/* Strand context banner */}
      {isPlaceholder && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs font-semibold text-amber-800">
          {genre.strand} · {genre.realm} curriculum is coming soon. Student data shown is placeholder.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="relative overflow-hidden rounded-2xl p-5 bg-white border border-[#E6E8EC] shadow-[0_4px_18px_-12px_rgba(15,23,42,0.18)]">
          <div className="absolute inset-y-0 left-0 w-[3px] bg-[#00C2A8] shadow-[0_0_14px_1px_rgba(0,229,195,0.45)]" />
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-extrabold text-[#0A2F2A] uppercase tracking-[0.18em]">
              Class Insight
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#00E5C3] shadow-[0_0_6px_rgba(0,229,195,0.8)]" />
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">live</span>
          </div>
          <div className="text-2xl font-black text-[#0F172A] tracking-tight leading-snug">
            {classInsight.percent > 0 ? `${classInsight.percent}% of students struggled with:` : "Class insight pending"}
          </div>
          <div className="mt-2 text-base font-bold text-[#0A2F2A]">
            → {classInsight.gap}
          </div>
          <div className="mt-3 text-sm font-medium text-[#475569] tracking-wide">
            {classInsight.action}
          </div>
        </div>
      </div>

      {/* Student table */}
      <div className="bg-white rounded-2xl border border-[#E6E8EC] overflow-hidden shadow-[0_4px_16px_-12px_rgba(15,23,42,0.18)]">
        <div className="grid grid-cols-[2fr_0.7fr_0.7fr_0.7fr_1.1fr] px-5 py-3 bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] border-b border-[#E6E8EC]">
          {([
            ["name",   "Student"],
            ["level",  "School Year"],
            ["level",  "Working Level"],
            ["week",   "Week"],
            ["tower",  "Tower"],
          ] as [SortKey, string][]).map(([key, label], idx) => {
            const active = sortKey === key;
            return (
              <button
                key={`${key}-${idx}`}
                onClick={() => toggleSort(key)}
                className={[
                  "text-left text-[10px] font-extrabold uppercase tracking-[0.12em] transition flex items-center gap-1",
                  active ? "text-[#0A2F2A]" : "text-[#94A3B8] hover:text-[#475569]",
                ].join(" ")}
              >
                {label}
                <span className="text-[9px] opacity-70">
                  {active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                </span>
              </button>
            );
          })}
        </div>

        {students.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[#64748B]">
            No students enrolled yet.
          </div>
        ) : (
          studentRows.map(({ s, prog, liveRow, pct, week, schoolYear, workingYear, latestPretest }) => {
              const isOpen = expandedId === s.id;

            return (
              <div key={s.id} className="border-b border-[#F1F5F9] last:border-0">
                <button
                  onClick={() => setExpandedId(isOpen ? null : s.id)}
                  className={[
                    "w-full grid grid-cols-[2fr_0.7fr_0.7fr_0.7fr_1.1fr] items-center px-5 py-3.5 text-left transition",
                    isOpen ? "bg-[#FAFBFC]" : "hover:bg-[#FAFBFC]",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-[#0A2F2A] text-[#00E5C3] ring-1 ring-[#00C2A8]/40 shadow-[0_0_10px_-2px_rgba(0,229,195,0.55)] flex items-center justify-center text-xs font-black shrink-0">
                      {s.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex items-center gap-2.5 flex-wrap">
                      <div className="text-sm font-bold text-[#0F172A] truncate">{s.display_name}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#475569]">{schoolYear}</span>
                  <span className="text-xs font-bold text-[#475569]">{yearToLevelLabel(workingYear)}</span>
                  <span className="text-xs font-bold text-[#475569] tabular-nums">
                    {week ? `W${week}` : "—"}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-[#00C2A8] shadow-[0_0_8px_rgba(0,229,195,0.55)] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-[#475569] tabular-nums w-9 text-right">{pct}%</span>
                  </div>
                </button>

                {isOpen && (
                  <StudentStrandDetail
                    student={s}
                    schoolYearLabel={schoolYear}
                    yearLabel={workingYear}
                    genre={genre}
                    prog={prog}
                    liveRow={liveRow}
                    latestPretest={latestPretest}
                    isPlaceholder={isPlaceholder}
                    prefix={lessonIdPrefix(workingYear)}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ───────── Detail view ───────── */

function StudentStrandDetail({
  student, schoolYearLabel, yearLabel, genre, prog, liveRow, latestPretest, isPlaceholder, prefix,
}: {
  student: StudentRow;
  schoolYearLabel: string;
  yearLabel: string;
  genre: Genre;
  prog: ProgressRow | undefined;
  liveRow?: LiveStudentActivityRow | undefined;
  latestPretest?: ProgressRow | undefined;
  isPlaceholder: boolean;
  prefix: string;
}) {
  const plan = useMemo(() => getCurriculumPlan(yearLabel, genre.id), [yearLabel, genre.id]);
  const ids = prog ? parseCompleted(prog.completed_lesson_ids) : [];
  const currentWeek = prog?.week ?? liveRow?.current_week ?? 1;
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

  const quizScores = parseQuizScores(prog?.quiz_scores);
  const lessonAttempts = parseLessonAttempts(prog?.lesson_attempts);
  const latestPost = getLatestPosttestProfile(prog?.quiz_scores);

  function weekStatus(w: number): "Complete" | "In Progress" | "Not Started" | "Struggled" {
    if (isPlaceholder) return "Not Started";
    const done = weekLessonsDone(ids, w);
    const q = quizScores[String(w)];
    if (q && !getQuizPassed(q)) return "Struggled";
    if (done >= 3) return "Complete";
    if (done > 0 || w === currentWeek) return "In Progress";
    return "Not Started";
  }

  const week = plan.find((p) => p.week === selectedWeek) ?? plan[0];
  const weekDone = weekLessonsDone(ids, week?.week ?? 1);
  const weekQuiz = quizScores[String(week?.week ?? 1)];  const weekQuizAttempts = getQuizAttemptsCount(weekQuiz);
  const weekQuizInsight = (weekQuiz?.latestInsight ?? null) as TeacherInsight | null;  const overallPct = overallProgramPercent(prog, yearLabel, plan);
  const summaryStatus = computeStatus(prog, ids.filter((id) => id.startsWith(prefix)).length, overallPct);
  const weekPerformance = buildStudentWeeklyPerformanceSummary({
    weekNumber: week?.week ?? 1,
    lessons: week?.lessons ?? [],
    completedIds: ids,
    lessonAttempts,
    weekQuiz,
    fallbackStatus: summaryStatus,
    liveRow,
  });
  const pretestScore = latestPretest?.pretest_score ?? null;
  const pretestSub =
    pretestScore == null
      ? "Not taken"
      : pretestScore >= ASSESSMENT_PASS_THRESHOLD
        ? `${yearToLevelLabel(latestPretest?.year ?? yearLabel)} pre-test passed · ${timeAgo(latestPretest?.updated_at)}`
        : `${yearToLevelLabel(latestPretest?.year ?? yearLabel)} assigned · ${timeAgo(latestPretest?.updated_at)}`;

  // Teacher insights
  const insights: string[] = [];
  if (!isPlaceholder) {
    if (prog?.pretest_score != null && prog.pretest_score < ASSESSMENT_PASS_THRESHOLD) {
      insights.push("Failed pre-test — start with foundation review");
    }
    if (latestPost && !latestPost.passed) {
      insights.push(`Post-test ${latestPost.percentage}% — assign Week ${latestPost.assignedWeek ?? currentWeek}`);
    }
    plan.forEach((w) => {
      const q = quizScores[String(w.week)];
      if (q && !getQuizPassed(q)) insights.push(`Failed Week ${w.week} quiz — revisit lessons`);
    });
    if (weekDone > 0 && weekDone < 3 && week?.week === currentWeek) {
      insights.push(`Currently on Week ${currentWeek}, ${weekDone}/3 lessons done`);
    }
    if (pctTotal(ids, prefix) >= 100) {
      insights.push("Strand complete — ready for next level");
    }
    if (insights.length === 0) {
      insights.push("On track — continue current week");
    }
  } else {
    insights.push("Curriculum coming soon for this strand.");
  }

  return (
    <div className="bg-[#F8FAFC] border-t border-[#E6E8EC] px-5 py-5 space-y-5">
      {/* Snapshot */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        <SnapshotTile label="Strand" value={`${genre.strand}`} sub={genre.realm} />
        <SnapshotTile label="School Year" value={schoolYearLabel} sub="Student's class year" />
        <SnapshotTile label="Working Level / Week" value={yearToLevelLabel(yearLabel)} sub={`Week ${currentWeek} / 12`} />
        <SnapshotTile label="Current Plan" value={`${yearToLevelLabel(yearLabel)} ${genre.realm}`} sub={week?.topic ?? `Week ${currentWeek}`} />
        <SnapshotTile
          label="Pre-test"
          value={pretestScore != null ? `${pretestScore}%` : "—"}
          sub={pretestSub}
        />
        <SnapshotTile
          label="Last Post-test"
          value={latestPost ? `${latestPost.percentage}%` : "—"}
          sub={latestPost ? (latestPost.passed ? "Pass" : "Needs review") : `Last active ${timeAgo(prog?.updated_at)}`}
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#E6E8EC] p-4">
        <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-[0.12em] mb-2">
          This Week Summary
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-3">
          <SummaryMetric label="Status" value={weekPerformance.status} />
          <SummaryMetric
            label="Performance"
            value={
              <div className="space-y-1.5">
                <div>Lessons Completed: {weekPerformance.lessonsCompleted} / {weekPerformance.totalLessons}</div>
                <div>Questions Answered: {weekPerformance.questionsAnswered}</div>
                <div>Correct: {weekPerformance.correctCount} / {weekPerformance.questionsAnswered || "—"}</div>
                <div>Accuracy: {weekPerformance.weeklyAccuracy != null ? `${weekPerformance.weeklyAccuracy}%` : "—"}</div>
              </div>
            }
          />
          <SummaryMetric
            label="Weekly Quiz"
            value={
              <div className="space-y-1.5">
                <div>{weekPerformance.weeklyQuizStatus}</div>
                <div>
                  {weekPerformance.weeklyQuizCorrect != null && weekPerformance.weeklyQuizTotal != null
                    ? `${weekPerformance.weeklyQuizCorrect} / ${weekPerformance.weeklyQuizTotal}`
                    : "— / —"}
                </div>
                <div>{weekPerformance.weeklyQuizAccuracy != null ? `${weekPerformance.weeklyQuizAccuracy}% accuracy` : "— accuracy"}</div>
                <div>
                  {weekPerformance.weeklyQuizPassed == null
                    ? "Not attempted"
                    : weekPerformance.weeklyQuizPassed
                      ? "Passed"
                      : "Needs Review"}
                </div>
              </div>
            }
          />
          <SummaryMetric label="Main Gap" value={weekPerformance.mainGap} />
          <SummaryMetric label="Suggested Action" value={weekPerformance.suggestedAction} />
        </div>
      </div>

      {/* Week strip */}
      <div className="bg-white rounded-2xl border border-[#E6E8EC] p-3">
        <div className="px-1 pb-2 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-[0.12em]">
          Weekly Journey
        </div>
        <div className="grid grid-cols-6 lg:grid-cols-12 gap-1.5">
          {plan.map((w) => {
            const st = weekStatus(w.week);
            const active = w.week === selectedWeek;
            const isExpanded = w.week === expandedWeek;
            const tone =
              st === "Complete"   ? "bg-emerald-500 text-white border-emerald-500" :
              st === "In Progress"? "bg-amber-100 text-amber-800 border-amber-300" :
              st === "Struggled"  ? "bg-rose-100 text-rose-800 border-rose-300" :
                                    "bg-slate-50 text-slate-500 border-slate-200";
            return (
              <button
                key={w.week}
                onClick={() => {
                  setSelectedWeek(w.week);
                  setExpandedWeek((prev) => (prev === w.week ? null : w.week));
                }}
                title={`Week ${w.week}: ${st} — click to ${isExpanded ? "collapse" : "expand"}`}
                className={[
                  "rounded-lg border py-2 text-center transition",
                  tone,
                  active && "ring-2 ring-teal-400 ring-offset-1",
                  isExpanded && "shadow-md",
                ].filter(Boolean).join(" ")}
              >
                <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">W{w.week}</div>
                <div className="text-[9px] font-bold mt-0.5 leading-none">{shortStatus(st)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected week detail */}
      {week && expandedWeek === week.week && (
        <div className="bg-white rounded-2xl border border-[#E6E8EC] p-4 space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-[10px] font-extrabold text-teal-700 uppercase tracking-[0.14em]">
                Week {week.week} Focus
              </div>
              <div className="text-base font-black text-[#0F172A] mt-0.5">{week.topic}</div>
            </div>
            <button
              disabled
              title="Coming soon"
              className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] text-[#64748B] text-xs font-bold cursor-not-allowed"
            >
              Assign Week
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-2.5">
            {week.lessons.map((lsn) => {
              const done = !isPlaceholder && ids.includes(lsn.id);
              const performance =
                weekPerformance.lessonCards.find((card) => card.lessonId === lsn.id) ??
                { lessonId: lsn.id, status: done ? "Completed" : "Not Started", correct: null, total: null, accuracy: null };
              return (
                <button
                  key={lsn.id}
                  type="button"
                  onClick={() => setPreviewLesson(lsn)}
                  title="Click to preview lesson content"
                  className={[
                    "text-left rounded-xl border p-3 flex flex-col gap-2 transition hover:border-teal-300 hover:shadow-sm cursor-pointer",
                    done ? "border-emerald-200 bg-emerald-50/40" : "border-[#E6E8EC] bg-white",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-teal-50 text-teal-700 text-[11px] font-black">
                      L{lsn.lesson}
                    </span>
                    <span className={[
                      "text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded",
                      performance.status === "Completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : performance.status === "In Progress"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-500",
                    ].join(" ")}>
                      {performance.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#0F172A] leading-snug">{lsn.title}</div>
                    <div className="text-[11px] text-[#64748B] mt-1 leading-relaxed line-clamp-3">
                      {lsn.focus}
                    </div>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="font-semibold text-[#475569]">
                      {performance.correct != null && performance.total != null
                        ? `${performance.correct} / ${performance.total}`
                        : "— / —"}
                    </div>
                    <div className="font-semibold text-[#475569]">
                      {performance.accuracy != null ? `${performance.accuracy}% accuracy` : "— accuracy"}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md">
                      {DEFAULT_LESSON_XP} XP
                    </span>
                    <span className="text-[10px] font-extrabold text-teal-700">
                      Preview →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quiz row */}
          <div className="rounded-xl border border-[#E6E8EC] bg-white px-3 py-2.5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-[0.14em]">
                Weekly Quiz
              </span>
              {weekQuiz ? (
                <span className={[
                  "text-[11px] font-extrabold px-2 py-0.5 rounded-md border",
                  weekPerformance.weeklyQuizPassed ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                   : "bg-rose-50 text-rose-700 border-rose-200",
                ].join(" ")}>
                  {weekPerformance.weeklyQuizStatus}
                </span>
              ) : (
                <span className="text-[11px] font-bold text-[#94A3B8]">Not attempted</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
              <span>Score: <b className="text-[#0F172A]">{weekPerformance.weeklyQuizCorrect != null && weekPerformance.weeklyQuizTotal != null ? `${weekPerformance.weeklyQuizCorrect} / ${weekPerformance.weeklyQuizTotal}` : "— / —"}</b></span>
              <span>Attempts: <b className="text-[#0F172A]">{weekQuizAttempts}</b></span>
              <span>Accuracy: <b className="text-[#0F172A]">{weekPerformance.weeklyQuizAccuracy != null ? `${weekPerformance.weeklyQuizAccuracy}%` : "n/a"}</b></span>
              <span>Result: <b className="text-[#0F172A]">{weekPerformance.weeklyQuizPassed == null ? "Not attempted" : weekPerformance.weeklyQuizPassed ? "Passed" : "Needs Review"}</b></span>
              <button
                disabled
                title="Coming soon"
                className="px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[#64748B] text-[11px] font-bold cursor-not-allowed"
              >
                Assign Quiz
              </button>
            </div>
          </div>
          {weekQuizInsight ? (
            <div className="rounded-xl border border-[#E6E8EC] bg-[#F8FAFC] px-3 py-3">
              <div className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-[0.14em] mb-2">
                AI Quiz Insight
              </div>
              <div className="grid md:grid-cols-2 gap-2 text-xs">
                <div><b className="text-[#64748B]">Status:</b> <span className="font-semibold text-[#0F172A]">{weekQuizInsight.status}</span></div>
                <div><b className="text-[#64748B]">Strength:</b> <span className="font-semibold text-[#0F172A]">{weekQuizInsight.strength}</span></div>
                <div><b className="text-[#64748B]">Gap:</b> <span className="font-semibold text-[#0F172A]">{weekQuizInsight.gap}</span></div>
                <div><b className="text-[#64748B]">Teacher action:</b> <span className="font-semibold text-[#0F172A]">{weekQuizInsight.teacherAction}</span></div>
                <div className="md:col-span-2"><b className="text-[#64748B]">Recommended revisit:</b> <span className="font-semibold text-[#0F172A]">{weekQuizInsight.recommendedRevisit}</span></div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Teacher insights */}
      <div className="bg-white rounded-2xl border border-[#E6E8EC] p-4">
        <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-[0.12em] mb-2">
          Teacher Insights
        </div>
        <ul className="grid sm:grid-cols-2 gap-2">
          {insights.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-[#0F172A] bg-[#F8FAFC] border border-[#E6E8EC] rounded-lg px-3 py-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
              <span className="font-semibold">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <LessonPreviewDrawer
        open={!!previewLesson}
        onClose={() => setPreviewLesson(null)}
        lesson={previewLesson}
        weekNumber={previewLesson?.week}
        weekTopic={plan.find((p) => p.week === previewLesson?.week)?.topic}
        strand={genre.strand}
        realm={genre.realm}
        yearLabel={yearLabel}
        isPlaceholder={isPlaceholder}
        student={previewLesson ? (() => {
          const lessonAttempt = lessonAttempts[previewLesson.id];
          const latestSummary = lessonAttempt?.latestSummary;
          const latestInsight = lessonAttempt?.latestInsight as TeacherInsight | null | undefined;
          return {
            id: student.id,
            display_name: student.display_name,
            status: ids.includes(previewLesson.id) ? "Completed" : (previewLesson.week === currentWeek ? "In Progress" : "Not Started"),
            attempts: lessonAttempt?.attempts?.length ?? (ids.includes(previewLesson.id) ? 1 : 0),
            timeSpent: formatDuration(latestSummary?.timeSpentSeconds),
            accuracy: latestSummary?.accuracy ?? null,
            aiInsight: latestInsight ?? null,
            quizPercent: getQuizPercent(quizScores[String(previewLesson.week)]),
            quizPassed: (() => {
              const q = quizScores[String(previewLesson.week)];
              return q ? getQuizPassed(q) : null;
            })(),
          };
        })() : null}
      />
    </div>
  );
}

function pctTotal(ids: string[], prefix: string) {
  return Math.min(100, Math.round((ids.filter((id) => id.startsWith(prefix)).length / 36) * 100));
}

function shortStatus(s: string) {
  if (s === "Complete")    return "✓";
  if (s === "In Progress") return "•••";
  if (s === "Struggled")   return "!";
  return "—";
}

function SnapshotTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E6E8EC] px-3 py-2.5">
      <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-[0.12em]">{label}</div>
      <div className="text-sm font-black text-[#0F172A] mt-1">{value}</div>
      {sub && <div className="text-[11px] font-semibold text-[#64748B] mt-0.5">{sub}</div>}
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E6E8EC] bg-[#F8FAFC] px-3 py-3">
      <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-[0.12em]">{label}</div>
      <div className="mt-1 text-sm font-bold text-[#0F172A]">{value}</div>
    </div>
  );
}
