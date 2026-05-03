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
import { getLatestPosttestProfile } from "@/data/assessments/analysis";
import LessonPreviewDrawer from "./LessonPreviewDrawer";
import type { TeacherInsight, TeacherInsightStatus } from "@/lib/teacher-insights";

type StudentRow = {
  id: string;
  display_name: string;
  class_id: string;
  user_id: string;
};

type ProgressRow = {
  student_id: string;
  year: string;
  week: number | null;
  status: string;
  pretest_score: number | null;
  completed_lesson_ids: any;
  unlocked_legends: any;
  quiz_scores: any;
  lesson_attempts?: any;
  updated_at?: string;
};

type Props = {
  yearLabel: string;
  students: StudentRow[];
  progress: ProgressRow[];
};

type StrandStatus = "Not Started" | "In Progress" | "Needs Support" | "Completed";
type StudentFlagTone = "neutral" | "red" | "yellow" | "green";
type StudentFlag = {
  label: string;
  emoji: string;
  tone: StudentFlagTone;
};

function parseCompleted(raw: any): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

function weekLessonsDone(ids: string[], week: number): number {
  const tag = `-w${week}-`;
  return ids.filter((id) => id.includes(tag)).length;
}

function pctComplete(ids: string[], prefix: string): number {
  const mine = ids.filter((id) => id.startsWith(prefix));
  return Math.min(100, Math.round((mine.length / 36) * 100));
}

function computeStatus(prog: ProgressRow | undefined, completedCount: number, pct: number): StrandStatus {
  if (!prog || (prog.week == null && completedCount === 0)) return "Not Started";
  if (pct >= 100) return "Completed";
  if (prog.pretest_score != null && prog.pretest_score < 50) return "Needs Support";
  // Latest post-test failed?
  const latest = getLatestPosttestProfile(prog.quiz_scores);
  if (latest && !latest.passed) return "Needs Support";
  return "In Progress";
}

function statusTone(s: StrandStatus) {
  switch (s) {
    case "Completed":     return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "In Progress":   return "bg-amber-50 text-amber-700 border-amber-200";
    case "Needs Support": return "bg-rose-50 text-rose-700 border-rose-200";
    default:              return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

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
  const quizScores: Record<string, any> =
    prog.quiz_scores && typeof prog.quiz_scores === "object" ? (prog.quiz_scores as Record<string, any>) : {};
  const lessonAttempts: Record<string, any> =
    prog.lesson_attempts && typeof prog.lesson_attempts === "object" ? (prog.lesson_attempts as Record<string, any>) : {};

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

function flagTone(flag: StudentFlagTone) {
  switch (flag) {
    case "red":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "yellow":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "green":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

function simplifyGapLabel(gap: string) {
  return gap
    .replace(/^They were least secure in\s+/i, "")
    .replace(/, where accuracy dropped\.$/i, "")
    .replace(/\.$/, "")
    .trim();
}

function buildWeekSummary(
  insights: TeacherInsight[],
  fallbackStatus: StrandStatus,
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

export default function StrandStudentsPanel({ yearLabel, students, progress }: Props) {
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
  const plan = useMemo(() => getCurriculumPlan(yearLabel, genreId), [yearLabel, genreId]);

  function getProg(studentId: string, year: string) {
    return progress.find((p) => p.student_id === studentId && p.year === year);
  }

  function getStudentYear(studentId: string): string {
    const rows = progress.filter((p) => p.student_id === studentId);
    return pickStudentYear(rows, yearLabel);
  }

  const studentRows = students
    .map((s) => {
      const studentYear = getStudentYear(s.id);
      const prog = getProg(s.id, studentYear);
      const ids = prog ? parseCompleted(prog.completed_lesson_ids) : [];
      const sPrefix = lessonIdPrefix(studentYear);
      const strandIds = isPlaceholder ? [] : ids.filter((id) => id.startsWith(sPrefix));
      const pct = isPlaceholder ? 0 : pctComplete(ids, sPrefix);
      const status = isPlaceholder ? "Not Started" : computeStatus(prog, strandIds.length, pct);
      const week = isPlaceholder ? null : (prog?.week ?? null);
      const planForStudentYear = getCurriculumPlan(studentYear, genreId);
      const activeWeek = week ?? 1;
      const activeWeekPlan = planForStudentYear.find((entry) => entry.week === activeWeek);
      const activeLessonIds = activeWeekPlan?.lessons.map((lesson) => lesson.id) ?? [];
      const weekInsights = getWeekInsightList(prog, activeWeek, activeLessonIds);
      const summary = buildWeekSummary(weekInsights, status);
      const flag = deriveStudentFlag(pickPrimaryInsight(weekInsights), status);

      return { s, prog, pct, status, week, studentYear, summary, flag };
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const rank: Record<string, number> = { "Not Started": 0, "In Progress": 1, "Needs Support": 2, "Completed": 3 };
      const nameCmp = a.s.display_name.localeCompare(b.s.display_name);
      switch (sortKey) {
        case "name":   return dir * nameCmp;
        case "level":  return dir * (yearOrdinal(a.studentYear) - yearOrdinal(b.studentYear)) || nameCmp;
        case "week":   return dir * ((a.week ?? -1) - (b.week ?? -1)) || nameCmp;
        case "status": return dir * (rank[a.status] - rank[b.status]) || nameCmp;
        case "tower":  return dir * (a.pct - b.pct) || nameCmp;
      }
    });

  const classInsight = buildClassInsight(studentRows.map((row) => ({ flag: row.flag, summary: row.summary })));

  return (
    <div className="space-y-5">
      {/* Strand tab strip */}
      <div className="bg-white rounded-2xl border border-[#E6E8EC] p-3">
        <div className="px-1 pb-2 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-[0.12em]">
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
                    ? "border-teal-300 bg-teal-50 ring-2 ring-teal-200"
                    : "border-[#E6E8EC] bg-white hover:border-[#CBD5E1]",
                  locked && "opacity-50 cursor-not-allowed",
                ].filter(Boolean).join(" ")}
              >
                <div className={`text-sm font-bold ${active ? "text-teal-800" : "text-[#0F172A]"}`}>
                  {g.strand}
                </div>
                <div className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1.5">
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

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#E6E8EC] p-4">
          <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-[0.12em] mb-2">
            Class Insight
          </div>
          <div className="text-lg font-black text-[#0F172A]">
            {classInsight.percent > 0 ? `${classInsight.percent}% of students struggled with:` : "Class insight pending"}
          </div>
          <div className="mt-2 text-sm font-bold text-[#0F172A]">
            → {classInsight.gap}
          </div>
          <div className="mt-3 text-sm font-semibold text-[#475569]">
            {classInsight.action}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E6E8EC] p-4">
          <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-[0.12em] mb-2">
            Student Flags
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <FlagLegend label="Needs support" emoji="🔴" tone="red" />
            <FlagLegend label="Check-in" emoji="🟡" tone="yellow" />
            <FlagLegend label="On track" emoji="🟢" tone="green" />
          </div>
          <div className="mt-3 text-sm font-semibold text-[#475569]">
            Flags update automatically from weekly lesson and quiz insight data.
          </div>
        </div>
      </div>

      {/* Student table */}
      <div className="bg-white rounded-2xl border border-[#E6E8EC] overflow-hidden">
        <div className="grid grid-cols-[2fr_0.9fr_0.7fr_1.1fr] px-5 py-3 bg-[#FAFBFC] border-b border-[#E6E8EC]">
          {([
            ["name",   "Student"],
            ["level",  "Level"],
            ["week",   "Week"],
            ["tower",  "Tower"],
          ] as [SortKey, string][]).map(([key, label]) => {
            const active = sortKey === key;
            return (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={[
                  "text-left text-[10px] font-extrabold uppercase tracking-[0.12em] transition flex items-center gap-1",
                  active ? "text-teal-700" : "text-[#94A3B8] hover:text-[#475569]",
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
          studentRows.map(({ s, prog, pct, status, week, studentYear, flag }) => {
              const isOpen = expandedId === s.id;

            return (
              <div key={s.id} className="border-b border-[#F1F5F9] last:border-0">
                <button
                  onClick={() => setExpandedId(isOpen ? null : s.id)}
                  className={[
                    "w-full grid grid-cols-[2fr_0.9fr_0.7fr_1.1fr] items-center px-5 py-3.5 text-left transition",
                    isOpen ? "bg-[#FAFBFC]" : "hover:bg-[#FAFBFC]",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-white flex items-center justify-center text-xs font-black shrink-0">
                      {s.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex items-center gap-2.5 flex-wrap">
                      <div className="text-sm font-bold text-[#0F172A] truncate">{s.display_name}</div>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-extrabold uppercase tracking-wider ${flagTone(flag.tone)}`}>
                        <span>{flag.emoji}</span>
                        <span>{flag.label}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#475569]">{studentYear}</span>
                  <span className="text-xs font-bold text-[#475569] tabular-nums">
                    {week ? `W${week}` : "—"}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-[#475569] tabular-nums w-9 text-right">{pct}%</span>
                  </div>
                </button>

                {isOpen && (
                  <StudentStrandDetail
                    student={s}
                    yearLabel={studentYear}
                    genre={genre}
                    plan={plan}
                    prog={prog}
                    isPlaceholder={isPlaceholder}
                    prefix={lessonIdPrefix(studentYear)}
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
  student, yearLabel, genre, plan, prog, isPlaceholder, prefix,
}: {
  student: StudentRow;
  yearLabel: string;
  genre: Genre;
  plan: ReturnType<typeof getCurriculumPlan>;
  prog: ProgressRow | undefined;
  isPlaceholder: boolean;
  prefix: string;
}) {
  const ids = prog ? parseCompleted(prog.completed_lesson_ids) : [];
  const currentWeek = prog?.week ?? 1;
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(currentWeek);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

  const quizScores: Record<string, any> =
    prog?.quiz_scores && typeof prog.quiz_scores === "object" ? (prog.quiz_scores as any) : {};
  const lessonAttempts: Record<string, any> =
    prog?.lesson_attempts && typeof prog.lesson_attempts === "object" ? (prog.lesson_attempts as any) : {};
  const latestPost = getLatestPosttestProfile(prog?.quiz_scores);

  function weekStatus(w: number): "Complete" | "In Progress" | "Not Started" | "Struggled" {
    if (isPlaceholder) return "Not Started";
    const done = weekLessonsDone(ids, w);
    const q = quizScores[String(w)];
    if (q && q.passed === false) return "Struggled";
    if (done >= 3) return "Complete";
    if (done > 0 || w === currentWeek) return "In Progress";
    return "Not Started";
  }

  const week = plan.find((p) => p.week === selectedWeek) ?? plan[0];
  const weekDone = weekLessonsDone(ids, week?.week ?? 1);
  const weekQuiz = quizScores[String(week?.week ?? 1)];
  const weekLessonIds = week?.lessons.map((lesson) => lesson.id) ?? [];
  const weekInsights = getWeekInsightList(prog, week?.week ?? 1, weekLessonIds);
  const summaryStatus = computeStatus(prog, ids.filter((id) => id.startsWith(prefix)).length, pctTotal(ids, prefix));
  const weekSummary = buildWeekSummary(weekInsights, summaryStatus);

  // Teacher insights
  const insights: string[] = [];
  if (!isPlaceholder) {
    if (prog?.pretest_score != null && prog.pretest_score < 50) {
      insights.push("Failed pre-test — start with foundation review");
    }
    if (latestPost && !latestPost.passed) {
      insights.push(`Post-test ${latestPost.percentage}% — assign Week ${latestPost.assignedWeek ?? currentWeek}`);
    }
    plan.forEach((w) => {
      const q = quizScores[String(w.week)];
      if (q && q.passed === false) insights.push(`Failed Week ${w.week} quiz — revisit lessons`);
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
        <SnapshotTile label="Level / Week" value={yearLabel} sub={`Week ${currentWeek} / 12`} />
        <SnapshotTile
          label="Pre-test"
          value={prog?.pretest_score != null ? `${prog.pretest_score}%` : "—"}
          sub={prog?.pretest_score != null ? (prog.pretest_score >= 50 ? "Pass" : "Below 50%") : "Not taken"}
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
        <div className="grid md:grid-cols-3 gap-3">
          <SummaryMetric label="Status" value={weekSummary.status} />
          <SummaryMetric label="Main Gap" value={weekSummary.mainGap} />
          <SummaryMetric label="Suggested Action" value={weekSummary.suggestedAction} />
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
                      done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500",
                    ].join(" ")}>
                      {done ? "Done" : "Not done"}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#0F172A] leading-snug">{lsn.title}</div>
                    <div className="text-[11px] text-[#64748B] mt-1 leading-relaxed line-clamp-3">
                      {lsn.focus}
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
                  weekQuiz.passed ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200",
                ].join(" ")}>
                  {weekQuiz.percent ?? 0}% · {weekQuiz.passed ? "Pass" : "Fail"}
                </span>
              ) : (
                <span className="text-[11px] font-bold text-[#94A3B8]">Not attempted</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
              <span>Time: <b className="text-[#0F172A]">n/a</b></span>
              <span>Attempts: <b className="text-[#0F172A]">{weekQuiz?.attempts?.length ?? (weekQuiz ? 1 : 0)}</b></span>
              <span>Accuracy: <b className="text-[#0F172A]">{weekQuiz?.percent ? `${weekQuiz.percent}%` : "n/a"}</b></span>
              <button
                disabled
                title="Coming soon"
                className="px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[#64748B] text-[11px] font-bold cursor-not-allowed"
              >
                Assign Quiz
              </button>
            </div>
          </div>
          {weekQuiz?.latestInsight ? (
            <div className="rounded-xl border border-[#E6E8EC] bg-[#F8FAFC] px-3 py-3">
              <div className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-[0.14em] mb-2">
                AI Quiz Insight
              </div>
              <div className="grid md:grid-cols-2 gap-2 text-xs">
                <div><b className="text-[#64748B]">Status:</b> <span className="font-semibold text-[#0F172A]">{weekQuiz.latestInsight.status}</span></div>
                <div><b className="text-[#64748B]">Strength:</b> <span className="font-semibold text-[#0F172A]">{weekQuiz.latestInsight.strength}</span></div>
                <div><b className="text-[#64748B]">Gap:</b> <span className="font-semibold text-[#0F172A]">{weekQuiz.latestInsight.gap}</span></div>
                <div><b className="text-[#64748B]">Teacher action:</b> <span className="font-semibold text-[#0F172A]">{weekQuiz.latestInsight.teacherAction}</span></div>
                <div className="md:col-span-2"><b className="text-[#64748B]">Recommended revisit:</b> <span className="font-semibold text-[#0F172A]">{weekQuiz.latestInsight.recommendedRevisit}</span></div>
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
            quizPercent: (() => {
              const q = quizScores[String(previewLesson.week)];
              return q?.percent ?? null;
            })(),
            quizPassed: (() => {
              const q = quizScores[String(previewLesson.week)];
              return q?.passed ?? null;
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

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E6E8EC] bg-[#F8FAFC] px-3 py-3">
      <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-[0.12em]">{label}</div>
      <div className="mt-1 text-sm font-bold text-[#0F172A]">{value}</div>
    </div>
  );
}

function FlagLegend({ label, emoji, tone }: { label: string; emoji: string; tone: StudentFlagTone }) {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-[11px] font-extrabold uppercase tracking-wider ${flagTone(tone)}`}>
      <span>{emoji}</span>
      <span>{label}</span>
    </div>
  );
}
