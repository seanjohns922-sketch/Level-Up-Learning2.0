"use client";

import { Suspense, useEffect, useMemo, useState, type ComponentType } from "react";
import { Laugh, Smile, Meh, Frown } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { getLatestPosttestProfile } from "@/data/assessments/analysis";
import { YEAR_ORDER } from "@/data/yearOrder";
import { normalizeWorkingLevelLabel } from "@/lib/studentLevelLabel";
import { buildHeuristicTeacherInsight, type TeacherAttemptTopicSummary } from "@/lib/teacher-insights";
import { fetchRealmCompatProgressForStudent } from "@/lib/realm-progress-compat";

type StudentRow = {
  id: string;
  display_name: string;
  class_id: string;
  school_year_level?: string | null;
  working_level?: string | null;
  year_level?: string | null;
};

type ProgressRow = {
  student_id: string;
  realm_id?: string;
  year: string;
  week: number | null;
  status: string;
  pretest_score: number | null;
  completed_lesson_ids: unknown;
  unlocked_legends: unknown;
  quiz_scores: unknown;
  lesson_attempts?: unknown;
  updated_at?: string | null;
};

type LessonReflectionRow = {
  id: string;
  lesson_title?: string | null;
  level?: string | null;
  week?: number | null;
  confidence: number;
  hardest_part?: string | null;
  lesson_accuracy?: number | null;
  questions_answered?: number | null;
  created_at: string;
};

type JsonObject = Record<string, unknown>;

type LessonAttemptSummary = {
  completedAt?: string | null;
  questionsAnswered?: number | null;
  correctAnswers?: number | null;
  correctCount?: number | null;
  totalQuestions?: number | null;
  accuracy?: number | null;
  topicSummaries?: TeacherAttemptTopicSummary[] | null;
  lessonId?: string | null;
  title?: string | null;
};

type LessonAttemptRecord = {
  latestSummary?: LessonAttemptSummary | null;
  latestInsight?: {
    strongestSkill?: string;
    needsSupport?: string;
    teacherAction?: string;
  } | null;
  attempts?: LessonAttemptSummary[] | null;
};

type WeeklyPoint = {
  label: string;
  shortLabel: string;
  value: number;
};

type TimelineEntry = {
  year: string;
  enteredAt: string | null;
  completedAt: string | null;
  weeksSpent: number | null;
  current: boolean;
};

function parseCompleted(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }
  return [];
}

function parseRecord(raw: unknown): JsonObject {
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as JsonObject) : {};
}

function parseLessonAttempts(raw: unknown): Record<string, LessonAttemptRecord> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, LessonAttemptRecord>;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, LessonAttemptRecord>)
        : {};
    } catch {
      return {};
    }
  }
  return {};
}

function parseQuizScores(raw: unknown): Record<string, JsonObject> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, JsonObject>;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, JsonObject>)
        : {};
    } catch {
      return {};
    }
  }
  return {};
}

function yearOrdinal(year: string | null | undefined) {
  if (!year) return -1;
  return YEAR_ORDER.indexOf(year);
}

function chooseCurrentRow(rows: ProgressRow[], fallbackYear?: string | null) {
  const fallback = fallbackYear ? rows.find((row) => row.year === fallbackYear) : null;
  if (fallback) return fallback;
  return [...rows].sort((a, b) => {
    const yearGap = yearOrdinal(b.year) - yearOrdinal(a.year);
    if (yearGap !== 0) return yearGap;
    const aTime = a.updated_at ? Date.parse(a.updated_at) : 0;
    const bTime = b.updated_at ? Date.parse(b.updated_at) : 0;
    return bTime - aTime;
  })[0] ?? null;
}

function strandLabelForRealm(realmId: string | undefined | null) {
  const normalized = realmId?.trim().toLowerCase();
  return normalized === "measurement" || normalized === "measurelands" ? "Measurement" : "Number";
}

function toIsoOrNull(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function toNumberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function extractWeekFromLessonId(lessonId?: string | null) {
  if (!lessonId) return null;
  const match = /-w(\d+)-/i.exec(lessonId);
  return match ? Number(match[1]) : null;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function formatRelativeWeeks(from?: string | null, to?: string | null) {
  if (!from || !to) return null;
  const diffMs = new Date(to).getTime() - new Date(from).getTime();
  if (!Number.isFinite(diffMs) || diffMs <= 0) return 0;
  return Math.max(1, Math.round(diffMs / (7 * 24 * 60 * 60 * 1000)));
}

function confidenceMeta(value: number): {
  Icon: ComponentType<{ className?: string }>;
  label: string;
} {
  if (value >= 4) return { Icon: Laugh, label: "Very Confident" };
  if (value === 3) return { Icon: Smile, label: "Confident" };
  if (value === 2) return { Icon: Meh, label: "Unsure" };
  return { Icon: Frown, label: "Need Help" };
}

function weekQuizPassed(quiz: JsonObject | undefined) {
  if (!quiz) return false;
  if (quiz.passed === true) return true;
  const attempts = Array.isArray(quiz.attempts) ? quiz.attempts : [];
  return attempts.some((attempt) => {
    if (!attempt || typeof attempt !== "object") return false;
    const record = attempt as JsonObject;
    return record.passed === true;
  });
}

function statFromSummary(summary: LessonAttemptSummary | null | undefined) {
  const correct = toNumberOrNull(summary?.correctCount ?? summary?.correctAnswers) ?? 0;
  const total = toNumberOrNull(summary?.totalQuestions ?? summary?.questionsAnswered) ?? 0;
  return { correct, total };
}

type FlattenedAttempt = {
  year: string;
  week: number | null;
  completedAt: string | null;
  accuracy: number | null;
  correct: number;
  total: number;
  title: string | null;
  topicSummaries: TeacherAttemptTopicSummary[];
  insight: LessonAttemptRecord["latestInsight"];
};

type FlattenedQuiz = {
  year: string;
  week: number;
  percent: number | null;
  completedAt: string | null;
  passed: boolean;
};

function StudentInsightsPageInner() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const requestedRealm = searchParams.get("realm_id")?.trim().toLowerCase();
  const selectedRealmId = requestedRealm === "measurement" || requestedRealm === "measurelands" ? "measurement" : "number";
  const { user, loading: authLoading } = useAuthGuard();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentRow | null>(null);
  const [className, setClassName] = useState<string>("");
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([]);
  const [reflections, setReflections] = useState<LessonReflectionRow[]>([]);
  const [tab, setTab] = useState<"overview" | "progress" | "assessments" | "reflections" | "mastery">("overview");

  useEffect(() => {
    if (authLoading || !user || !studentId) return;
    const activeStudentId = studentId;

    let cancelled = false;

    async function load() {
      setLoading(true);

      const { data: studentRow } = await supabase
        .from("students")
        .select("id,display_name,class_id,school_year_level,working_level,year_level")
        .eq("id", activeStudentId)
        .maybeSingle();

      if (!studentRow) {
        if (!cancelled) {
          setStudent(null);
          setClassName("");
          setProgressRows([]);
          setReflections([]);
          setLoading(false);
        }
        return;
      }

      const { data: classRow } = await supabase
        .from("classes")
        .select("name")
        .eq("id", studentRow.class_id)
        .maybeSingle();

      const realmProgress = await fetchRealmCompatProgressForStudent(selectedRealmId, activeStudentId);

      let nextReflections: LessonReflectionRow[] = [];
      const { data: reflectionRows, error: reflectionError } = await supabase
        .from("lesson_reflections")
        .select("id,lesson_title,level,week,confidence,hardest_part,lesson_accuracy,questions_answered,created_at")
        .eq("student_id", activeStudentId)
        .order("created_at", { ascending: false });
      if (!reflectionError) {
        nextReflections = (reflectionRows ?? []) as LessonReflectionRow[];
      }

      if (!cancelled) {
        setStudent(studentRow as StudentRow);
        setClassName(classRow?.name ?? "");
        setProgressRows(realmProgress);
        setReflections(nextReflections);
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, selectedRealmId, studentId, user]);

  const derived = useMemo(() => {
    if (!student) return null;

    const currentWorkingLevel = normalizeWorkingLevelLabel(student.working_level ?? student.year_level) ?? "Year 1";
    const currentRow = chooseCurrentRow(progressRows, currentWorkingLevel);

    const completedAttempts: FlattenedAttempt[] = [];
    const quizAttempts: FlattenedQuiz[] = [];

    progressRows.forEach((row) => {
      const attemptsByLesson = parseLessonAttempts(row.lesson_attempts);
      Object.entries(attemptsByLesson).forEach(([lessonId, record]) => {
        const attempts = Array.isArray(record.attempts) && record.attempts.length > 0
          ? record.attempts
          : record.latestSummary
            ? [{ ...record.latestSummary, lessonId }]
            : [];
        attempts.forEach((attempt) => {
          const completedAt = toIsoOrNull(attempt.completedAt);
          if (!completedAt) return;
          const stats = statFromSummary(attempt);
          if (stats.total <= 0) return;
          completedAttempts.push({
            year: row.year,
            week: extractWeekFromLessonId(attempt.lessonId ?? lessonId) ?? row.week,
            completedAt,
            accuracy: toNumberOrNull(attempt.accuracy),
            correct: stats.correct,
            total: stats.total,
            title: typeof attempt.title === "string" ? attempt.title : null,
            topicSummaries: Array.isArray(attempt.topicSummaries) ? attempt.topicSummaries : [],
            insight: record.latestInsight ?? null,
          });
        });
      });

      const quizScores = parseQuizScores(row.quiz_scores);
      Object.entries(quizScores).forEach(([weekKey, rawQuiz]) => {
        if (!/^\d+$/.test(weekKey)) return;
        const week = Number(weekKey);
        const quiz = rawQuiz as JsonObject;
        const percent =
          toNumberOrNull(quiz.percent) ??
          (() => {
            const score = toNumberOrNull(quiz.score);
            const total = toNumberOrNull(quiz.total);
            return score != null && total && total > 0 ? Math.round((score / total) * 100) : null;
          })();
        const attempts = Array.isArray(quiz.attempts) ? quiz.attempts : [];
        if (attempts.length > 0) {
          attempts.forEach((attempt) => {
            if (!attempt || typeof attempt !== "object") return;
            const record = attempt as JsonObject;
            quizAttempts.push({
              year: row.year,
              week,
              percent:
                toNumberOrNull(record.percent) ??
                (() => {
                  const score = toNumberOrNull(record.score);
                  const total = toNumberOrNull(record.total);
                  return score != null && total && total > 0 ? Math.round((score / total) * 100) : percent;
                })(),
              completedAt: toIsoOrNull(record.completedAt) ?? row.updated_at ?? null,
              passed: record.passed === true,
            });
          });
          return;
        }
        if (percent != null || toIsoOrNull(quiz.completedAt)) {
          quizAttempts.push({
            year: row.year,
            week,
            percent,
            completedAt: toIsoOrNull(quiz.completedAt) ?? row.updated_at ?? null,
            passed: weekQuizPassed(quiz),
          });
        }
      });
    });

    completedAttempts.sort((a, b) => (a.completedAt ?? "").localeCompare(b.completedAt ?? ""));
    quizAttempts.sort((a, b) => (a.completedAt ?? "").localeCompare(b.completedAt ?? ""));

    const totalCorrect = completedAttempts.reduce((sum, attempt) => sum + attempt.correct, 0);
    const totalQuestions = completedAttempts.reduce((sum, attempt) => sum + attempt.total, 0);
    const currentAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null;
    const lessonsCompleted = completedAttempts.length;

    const weeksPassed = progressRows.reduce((sum, row) => {
      const completedIds = parseCompleted(row.completed_lesson_ids);
      const quizScores = parseQuizScores(row.quiz_scores);
      const passedWeeks = Array.from({ length: 12 }, (_, index) => index + 1).filter((week) => {
        const lessonCount = completedIds.filter((id) => id.includes(`-w${week}-`)).length;
        return lessonCount >= 3 && weekQuizPassed(quizScores[String(week)]);
      }).length;
      return sum + passedWeeks;
    }, 0);

    const topicMap = new Map<string, { correct: number; total: number }>();
    completedAttempts.forEach((attempt) => {
      attempt.topicSummaries.forEach((topic) => {
        const current = topicMap.get(topic.label) ?? { correct: 0, total: 0 };
        current.correct += topic.correct;
        current.total += topic.total;
        topicMap.set(topic.label, current);
      });
    });
    const aggregatedTopics: TeacherAttemptTopicSummary[] = [...topicMap.entries()].map(([label, value]) => ({
      label,
      correct: value.correct,
      total: value.total,
      accuracy: value.total > 0 ? Math.round((value.correct / value.total) * 100) : 0,
    }));

    const heuristicInsight = buildHeuristicTeacherInsight({
      studentId: student.id,
      level: currentWorkingLevel,
      strand: strandLabelForRealm(currentRow?.realm_id),
      week: currentRow?.week ?? 1,
      accuracy: currentAccuracy ?? 0,
      questionsAnswered: totalQuestions,
      topicSummaries: aggregatedTopics,
    });

    const lessonAccuracyByWeekMap = new Map<number, { correct: number; total: number }>();
    completedAttempts.forEach((attempt) => {
      if (!attempt.week) return;
      const current = lessonAccuracyByWeekMap.get(attempt.week) ?? { correct: 0, total: 0 };
      current.correct += attempt.correct;
      current.total += attempt.total;
      lessonAccuracyByWeekMap.set(attempt.week, current);
    });
    const lessonAccuracyByWeek: WeeklyPoint[] = [...lessonAccuracyByWeekMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([week, value]) => ({
        label: `Week ${week}`,
        shortLabel: `W${week}`,
        value: value.total > 0 ? Math.round((value.correct / value.total) * 100) : 0,
      }));

    const quizAccuracyByWeek: WeeklyPoint[] = quizAttempts
      .filter((item) => item.percent != null)
      .sort((a, b) => a.week - b.week)
      .map((item) => ({
        label: `Week ${item.week} Quiz`,
        shortLabel: `Q${item.week}`,
        value: item.percent ?? 0,
      }));

    const timelineBase = progressRows
      .filter((row) => row.year)
      .sort((a, b) => {
        const yearGap = yearOrdinal(a.year) - yearOrdinal(b.year);
        if (yearGap !== 0) return yearGap;
        const aTime = a.updated_at ? Date.parse(a.updated_at) : 0;
        const bTime = b.updated_at ? Date.parse(b.updated_at) : 0;
        return aTime - bTime;
      });
    const timelineEntries: TimelineEntry[] = timelineBase.map((row, index) => {
      const next = timelineBase[index + 1];
      const enteredAt = row.updated_at ?? completedAttempts.find((attempt) => attempt.year === row.year)?.completedAt ?? null;
      const completedAt =
        row.status === "PASSED" || getLatestPosttestProfile(row.quiz_scores)?.passed
          ? row.updated_at ?? null
          : null;
      return {
        year: row.year,
        enteredAt,
        completedAt,
        weeksSpent: formatRelativeWeeks(enteredAt, next?.updated_at ?? completedAt ?? new Date().toISOString()),
        current: row.year === currentWorkingLevel,
      };
    });

    const pretests = progressRows
      .filter((row) => row.pretest_score != null)
      .sort((a, b) => yearOrdinal(a.year) - yearOrdinal(b.year))
      .map((row) => ({
        year: row.year,
        score: row.pretest_score,
        date: row.updated_at,
      }));

    const posttests = progressRows
      .map((row) => ({
        year: row.year,
        profile: getLatestPosttestProfile(row.quiz_scores),
      }))
      .filter((item) => item.profile);

    const masterySkills: Array<{
      skill: string;
      status: "mastered" | "developing" | "not_yet";
      accuracy: number;
    }> = aggregatedTopics
      .sort((a, b) => b.total - a.total || b.accuracy - a.accuracy)
      .map((topic) => ({
        skill: topic.label,
        status: topic.total >= 3 && topic.accuracy >= 85
          ? "mastered"
          : topic.total >= 2 && topic.accuracy >= 60
            ? "developing"
            : "not_yet",
        accuracy: topic.accuracy,
      }));

    return {
      currentWorkingLevel,
      currentWeek: currentRow?.week ?? 1,
      currentAccuracy,
      lessonsCompleted,
      weeksPassed,
      heuristicInsight,
      lessonAccuracyByWeek,
      quizAccuracyByWeek,
      timelineEntries,
      pretests,
      posttests,
      masterySkills,
    };
  }, [progressRows, student]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-500">Loading learning insights…</div>
      </main>
    );
  }

  if (!student || !derived) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-500">Student not found.</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="rounded-3xl border border-[#E6E8EC] bg-white px-6 py-5 shadow-[0_4px_16px_-12px_rgba(15,23,42,0.18)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link
                href="/teacher/dashboard"
                className="text-xs font-bold uppercase tracking-[0.16em] text-[#64748B] hover:text-[#0F172A]"
              >
                ← Back to Teacher Dashboard
              </Link>
              <div className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-teal-700">
                Learning Insights
              </div>
              <h1 className="mt-1 text-3xl font-black text-[#0F172A]">{student.display_name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-[#64748B]">
                <span>{className || "Class"}</span>
                <span>·</span>
                <span>{derived.currentWorkingLevel}</span>
                <span>·</span>
                <span>Week {derived.currentWeek}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-teal-700">
                Teacher Recommendation
              </div>
              <div className="mt-1 max-w-sm text-sm font-semibold text-teal-900">
                {derived.heuristicInsight.teacherAction}
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-[#E6E8EC] bg-white p-2 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          {([
            ["overview", "Overview"],
            ["progress", "Progress"],
            ["assessments", "Assessment History"],
            ["reflections", "Reflection History"],
            ["mastery", "Mastery"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={[
                "rounded-xl px-4 py-2 text-sm font-bold transition",
                tab === id
                  ? "bg-[#0A2F2A] text-[#00E5C3]"
                  : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "overview" ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <InsightStatCard label="Current Accuracy" value={derived.currentAccuracy != null ? `${derived.currentAccuracy}%` : "—"} />
              <InsightStatCard label="Lessons Completed" value={derived.lessonsCompleted} />
              <InsightStatCard label="Weeks Passed" value={derived.weeksPassed} />
              <InsightStatCard label="Current Working Level" value={derived.currentWorkingLevel} sub={`Current week: ${derived.currentWeek}`} />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <NarrativeCard title="Strongest Skill" body={derived.heuristicInsight.strongestSkill} tone="good" />
              <NarrativeCard title="Needs Support" body={derived.heuristicInsight.needsSupport} tone="warn" />
              <NarrativeCard title="Teacher Recommendation" body={derived.heuristicInsight.teacherAction} tone="neutral" />
            </div>
          </div>
        ) : null}

        {tab === "progress" ? (
          <div className="space-y-5">
            <ChartCard
              title="Average Lesson Accuracy"
              subtitle="Completed lesson attempts only"
              content={<BarChart points={derived.lessonAccuracyByWeek} emptyLabel="No completed lesson attempts yet." />}
            />
            <ChartCard
              title="Weekly Quiz Accuracy"
              subtitle="Completed weekly quizzes only"
              content={<LineChart points={derived.quizAccuracyByWeek} emptyLabel="No completed weekly quizzes yet." />}
            />
            <ChartCard
              title="Level Journey Timeline"
              subtitle="Dates are based on recorded progress activity."
              content={<LevelTimeline entries={derived.timelineEntries} />}
            />
          </div>
        ) : null}

        {tab === "assessments" ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <HistoryCard title="Pre-Test">
              {derived.pretests.length > 0 ? derived.pretests.map((item) => (
                <HistoryRow
                  key={`pre-${item.year}`}
                  title={item.year}
                  value={`${item.score}%`}
                  meta={`Completed ${formatDate(item.date)}`}
                />
              )) : <EmptyState text="No pre-test history yet." />}
            </HistoryCard>
            <HistoryCard title="Post-Test">
              {derived.posttests.length > 0 ? derived.posttests.map((item) => (
                <HistoryRow
                  key={`post-${item.year}`}
                  title={item.year}
                  value={`${item.profile?.percentage ?? "—"}%`}
                  meta={item.profile?.passed ? "Passed" : "Needs review"}
                />
              )) : <EmptyState text="Post-Test not completed." />}
            </HistoryCard>
          </div>
        ) : null}

        {tab === "reflections" ? (
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <HistoryCard title="Confidence Trend">
              {reflections.length > 0 ? (
                <div className="space-y-3">
                  <LineChart
                    points={reflections.slice(0, 8).reverse().map((item, index) => ({
                      label: formatDate(item.created_at),
                      shortLabel: `R${index + 1}`,
                      value: item.confidence * 25,
                    }))}
                    emptyLabel="No reflections yet."
                  />
                  <div className="grid gap-2">
                    {reflections.slice(0, 4).map((item) => {
                      const meta = confidenceMeta(item.confidence);
                      return (
                        <div key={item.id} className="rounded-xl border border-[#E6E8EC] bg-[#F8FAFC] px-3 py-2">
                          <div className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]"><meta.Icon className="h-4 w-4" /> {meta.label}</div>
                          <div className="text-xs text-[#64748B]">{item.lesson_title ?? item.level ?? "Lesson"} · {formatDate(item.created_at)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : <EmptyState text="No reflection history yet." />}
            </HistoryCard>
            <HistoryCard title="Recent Reflections">
              {reflections.length > 0 ? reflections.map((item) => {
                const meta = confidenceMeta(item.confidence);
                return (
                  <div key={item.id} className="rounded-xl border border-[#E6E8EC] bg-white px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-[#0F172A]">{item.lesson_title ?? item.level ?? "Lesson"}</div>
                        <div className="text-xs text-[#64748B]">{formatDate(item.created_at)}</div>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]"><meta.Icon className="h-4 w-4" /> {meta.label}</div>
                    </div>
                    {item.hardest_part ? (
                      <div className="mt-2 text-sm text-[#475569]">Hardest part: {item.hardest_part}</div>
                    ) : null}
                  </div>
                );
              }) : <EmptyState text="No reflection history yet." />}
            </HistoryCard>
          </div>
        ) : null}

        {tab === "mastery" ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <HistoryCard title="Number Mastery">
              {derived.masterySkills.length > 0 ? derived.masterySkills.map((item) => (
                <MasteryRow
                  key={item.skill}
                  label={item.skill}
                  status={item.status}
                  detail={`${item.accuracy}% accuracy`}
                />
              )) : <EmptyState text="No mastery data yet." />}
            </HistoryCard>
            <HistoryCard title="Future Domains">
              {[
                "Measurement",
                "Space",
                "Algebra",
                "Statistics",
                "Probability",
                "Reading",
                "Writing",
                "Grammar",
              ].map((domain) => (
                <MasteryRow key={domain} label={domain} status="not_yet" detail="Future-ready placeholder" />
              ))}
            </HistoryCard>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function StudentInsightsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F7F8FA] flex items-center justify-center"><div className="text-sm font-semibold text-slate-500">Loading learning insights…</div></main>}>
      <StudentInsightsPageInner />
    </Suspense>
  );
}

function InsightStatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-[#E6E8EC] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#94A3B8]">{label}</div>
      <div className="mt-2 text-3xl font-black text-[#0F172A]">{value}</div>
      {sub ? <div className="mt-2 text-sm font-semibold text-[#64748B]">{sub}</div> : null}
    </div>
  );
}

function NarrativeCard({ title, body, tone }: { title: string; body: string; tone: "good" | "warn" | "neutral" }) {
  const toneClass =
    tone === "good"
      ? "border-emerald-200 bg-emerald-50"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50"
        : "border-[#E6E8EC] bg-white";
  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#64748B]">{title}</div>
      <div className="mt-2 text-base font-bold text-[#0F172A]">{body}</div>
    </div>
  );
}

function ChartCard({ title, subtitle, content }: { title: string; subtitle: string; content: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#E6E8EC] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-teal-700">{title}</div>
      <div className="mt-1 text-sm font-semibold text-[#64748B]">{subtitle}</div>
      <div className="mt-5">{content}</div>
    </section>
  );
}

function BarChart({ points, emptyLabel }: { points: WeeklyPoint[]; emptyLabel: string }) {
  if (points.length === 0) {
    return <EmptyState text={emptyLabel} />;
  }

  return (
    <div className="grid gap-3">
      {points.map((point) => (
        <div key={point.label} className="grid grid-cols-[80px_1fr_48px] items-center gap-3">
          <div className="text-sm font-bold text-[#0F172A]">{point.label}</div>
          <div className="h-4 rounded-full bg-[#EEF2F7] overflow-hidden">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#0EA5A4_0%,#14B8A6_100%)]"
              style={{ width: `${Math.max(0, Math.min(100, point.value))}%` }}
            />
          </div>
          <div className="text-right text-sm font-black text-[#0F172A]">{point.value}%</div>
        </div>
      ))}
    </div>
  );
}

function LineChart({ points, emptyLabel }: { points: WeeklyPoint[]; emptyLabel: string }) {
  if (points.length === 0) {
    return <EmptyState text={emptyLabel} />;
  }

  const width = 640;
  const height = 220;
  const maxValue = 100;
  const stepX = points.length > 1 ? width / (points.length - 1) : width;
  const polyline = points
    .map((point, index) => {
      const x = index * stepX;
      const y = height - (point.value / maxValue) * (height - 24) - 12;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        <polyline fill="none" stroke="#0EA5A4" strokeWidth="4" points={polyline} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((point, index) => {
          const x = index * stepX;
          const y = height - (point.value / maxValue) * (height - 24) - 12;
          return (
            <g key={point.label}>
              <circle cx={x} cy={y} r="6" fill="#14B8A6" />
              <text x={x} y={y - 12} textAnchor="middle" className="fill-[#0F172A] text-[12px] font-bold">
                {point.value}%
              </text>
            </g>
          );
        })}
      </svg>
      <div className="grid gap-2 md:grid-cols-4">
        {points.map((point) => (
          <div key={point.label} className="rounded-xl border border-[#E6E8EC] bg-[#F8FAFC] px-3 py-2">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#94A3B8]">{point.shortLabel}</div>
            <div className="mt-1 text-sm font-bold text-[#0F172A]">{point.label}</div>
            <div className="mt-1 text-lg font-black text-teal-700">{point.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LevelTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <EmptyState text="No level journey recorded yet." />;
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <div key={`${entry.year}-${index}`} className="flex gap-4 rounded-2xl border border-[#E6E8EC] bg-[#F8FAFC] p-4">
          <div className="flex flex-col items-center">
            <div className={`h-3 w-3 rounded-full ${entry.current ? "bg-teal-500" : "bg-slate-300"}`} />
            {index < entries.length - 1 ? <div className="mt-2 h-full min-h-10 w-px bg-slate-200" /> : null}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-lg font-black text-[#0F172A]">{entry.year}</div>
              {entry.current ? (
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700">Current</span>
              ) : null}
            </div>
            <div className="mt-2 grid gap-1 text-sm text-[#475569]">
              <div>Date entered: {formatDate(entry.enteredAt)}</div>
              <div>Date completed: {entry.current ? "In progress" : formatDate(entry.completedAt)}</div>
              <div>Weeks spent: {entry.weeksSpent != null ? `${entry.weeksSpent}` : "—"}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#E6E8EC] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-teal-700">{title}</div>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function HistoryRow({ title, value, meta }: { title: string; value: string; meta: string }) {
  return (
    <div className="rounded-xl border border-[#E6E8EC] bg-[#F8FAFC] px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-[#0F172A]">{title}</div>
          <div className="text-xs text-[#64748B]">{meta}</div>
        </div>
        <div className="text-xl font-black text-[#0F172A]">{value}</div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-6 text-center text-sm font-semibold text-[#64748B]">
      {text}
    </div>
  );
}

function MasteryRow({
  label,
  status,
  detail,
}: {
  label: string;
  status: "mastered" | "developing" | "not_yet";
  detail: string;
}) {
  const tone =
    status === "mastered"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "developing"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-rose-50 text-rose-700 border-rose-200";
  const labelText =
    status === "mastered"
      ? "Mastered"
      : status === "developing"
        ? "Developing"
        : "Not Yet Mastered";

  return (
    <div className="rounded-xl border border-[#E6E8EC] bg-[#F8FAFC] px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-[#0F172A]">{label}</div>
          <div className="text-xs text-[#64748B]">{detail}</div>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${tone}`}>
          {labelText}
        </span>
      </div>
    </div>
  );
}
