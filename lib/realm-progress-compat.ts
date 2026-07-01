"use client";

import { supabase } from "@/lib/supabase";

export type CompatProgressRow = {
  student_id: string;
  realm_id: string;
  year: string;
  week: number | null;
  status: string;
  pretest_score: number | null;
  placement_complete?: boolean | null;
  assigned_week?: number | null;
  required_weeks?: unknown;
  optional_weeks?: unknown;
  completed_lesson_ids: unknown;
  unlocked_legends: unknown;
  quiz_scores: unknown;
  lesson_attempts?: unknown;
  has_seen_intro?: boolean | null;
  updated_at?: string | null;
};

type RealmProgressSummaryRow = {
  student_id: string;
  class_id: string | null;
  realm_id: string;
  program_key: string;
  school_year_level: string | null;
  working_level: string;
  is_current: boolean;
  status: string;
  current_week: number | null;
  assigned_week: number | null;
  placement_complete: boolean;
  pretest_score: number | null;
  pretest_completed_at: string | null;
  posttest_score: number | null;
  posttest_completed_at: string | null;
  required_weeks: unknown;
  optional_weeks: unknown;
  unlocked_legends: unknown;
  updated_at: string | null;
};

type LessonAttemptRow = {
  student_id: string;
  realm_id: string;
  working_level: string;
  week: number;
  lesson: number;
  lesson_id: string;
  attempt_no: number;
  correct_count: number;
  total_questions: number;
  accuracy_percent: number;
  time_spent_seconds: number | null;
  completed: boolean;
  completed_at: string;
  summary: Record<string, unknown> | null;
  insight: Record<string, unknown> | null;
};

type WeeklyQuizAttemptRow = {
  student_id: string;
  realm_id: string;
  working_level: string;
  week: number;
  quiz_id: string;
  attempt_no: number;
  correct_count: number;
  total_questions: number;
  accuracy_percent: number;
  passed: boolean;
  completed_at: string;
  lesson_breakdown: unknown;
  summary: Record<string, unknown> | null;
  insight: Record<string, unknown> | null;
};

type RealmAssessmentRow = {
  student_id: string;
  realm_id: string;
  working_level: string;
  assessment_type: string;
  correct_count: number | null;
  total_questions: number | null;
  score_percent: number;
  passed: boolean | null;
  placement_result: Record<string, unknown> | null;
  question_results: unknown;
  completed_at: string;
};

type LegacyProgressRow = {
  student_id: string;
  year: string | null;
  week: number | null;
  status: string | null;
  pretest_score: number | null;
  updated_at?: string | null;
};

type SnapshotLike = CompatProgressRow;

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  return {};
}

function snapshotKey(studentId: string, year: string) {
  return `${studentId}::${year}`;
}

function normalizeLessonAttemptSummary(row: LessonAttemptRow) {
  const summary = parseObject(row.summary);
  return {
    ...summary,
    completedAt: typeof summary.completedAt === "string" ? summary.completedAt : row.completed_at,
    questionsAnswered:
      typeof summary.questionsAnswered === "number" ? summary.questionsAnswered : row.total_questions,
    totalQuestions:
      typeof summary.totalQuestions === "number" ? summary.totalQuestions : row.total_questions,
    correctAnswers:
      typeof summary.correctAnswers === "number" ? summary.correctAnswers : row.correct_count,
    correctCount:
      typeof summary.correctCount === "number" ? summary.correctCount : row.correct_count,
    accuracy:
      typeof summary.accuracy === "number" ? summary.accuracy : row.accuracy_percent,
    accuracy_percent:
      typeof summary.accuracy_percent === "number" ? summary.accuracy_percent : row.accuracy_percent,
    time_spent_seconds:
      typeof summary.time_spent_seconds === "number" ? summary.time_spent_seconds : row.time_spent_seconds,
  };
}

function normalizeQuizAttemptSummary(row: WeeklyQuizAttemptRow) {
  const summary = parseObject(row.summary);
  return {
    ...summary,
    completedAt: typeof summary.completedAt === "string" ? summary.completedAt : row.completed_at,
    correct:
      typeof summary.correct === "number"
        ? summary.correct
        : typeof summary.score === "number"
        ? summary.score
        : row.correct_count,
    score:
      typeof summary.score === "number"
        ? summary.score
        : typeof summary.correct === "number"
        ? summary.correct
        : row.correct_count,
    total:
      typeof summary.total === "number"
        ? summary.total
        : typeof summary.totalQuestions === "number"
        ? summary.totalQuestions
        : row.total_questions,
    totalQuestions:
      typeof summary.totalQuestions === "number" ? summary.totalQuestions : row.total_questions,
    percent:
      typeof summary.percent === "number"
        ? summary.percent
        : typeof summary.accuracy === "number"
        ? summary.accuracy
        : row.accuracy_percent,
    accuracy:
      typeof summary.accuracy === "number"
        ? summary.accuracy
        : typeof summary.percent === "number"
        ? summary.percent
        : row.accuracy_percent,
    accuracy_percent:
      typeof summary.accuracy_percent === "number" ? summary.accuracy_percent : row.accuracy_percent,
    passed: typeof summary.passed === "boolean" ? summary.passed : row.passed,
    lessonBreakdown: summary.lessonBreakdown ?? row.lesson_breakdown ?? [],
  };
}

function normalizePosttestAttempt(row: RealmAssessmentRow) {
  const placementResult = parseObject(row.placement_result);
  return {
    ...placementResult,
    score: row.correct_count ?? placementResult.score ?? null,
    correct: row.correct_count ?? placementResult.correct ?? null,
    total: row.total_questions ?? placementResult.total ?? null,
    percent: row.score_percent,
    score_percent: row.score_percent,
    passed: row.passed ?? placementResult.passed ?? null,
    questionResults: row.question_results ?? placementResult.questionResults ?? [],
    completedAt: row.completed_at,
  };
}

function buildRowsFromRealmData(
  summaries: RealmProgressSummaryRow[],
  lessonAttempts: LessonAttemptRow[],
  quizAttempts: WeeklyQuizAttemptRow[],
  assessments: RealmAssessmentRow[],
) {
  const lessonMap = new Map<string, LessonAttemptRow[]>();
  lessonAttempts.forEach((row) => {
    const key = snapshotKey(row.student_id, row.working_level);
    const current = lessonMap.get(key);
    if (current) current.push(row);
    else lessonMap.set(key, [row]);
  });

  const quizMap = new Map<string, WeeklyQuizAttemptRow[]>();
  quizAttempts.forEach((row) => {
    const key = snapshotKey(row.student_id, row.working_level);
    const current = quizMap.get(key);
    if (current) current.push(row);
    else quizMap.set(key, [row]);
  });

  const assessmentMap = new Map<string, RealmAssessmentRow[]>();
  assessments.forEach((row) => {
    const key = snapshotKey(row.student_id, row.working_level);
    const current = assessmentMap.get(key);
    if (current) current.push(row);
    else assessmentMap.set(key, [row]);
  });

  return summaries.map((summary) => {
    const key = snapshotKey(summary.student_id, summary.working_level);
    const lessonRows = [...(lessonMap.get(key) ?? [])].sort((a, b) => {
      const timeGap = new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
      return timeGap !== 0 ? timeGap : a.attempt_no - b.attempt_no;
    });
    const quizRows = [...(quizMap.get(key) ?? [])].sort((a, b) => {
      const timeGap = new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
      return timeGap !== 0 ? timeGap : a.attempt_no - b.attempt_no;
    });
    const assessmentRows = [...(assessmentMap.get(key) ?? [])].sort((a, b) => {
      return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
    });

    const completedLessonIds = Array.from(
      new Set(
        lessonRows
          .filter((row) => row.completed)
          .map((row) => row.lesson_id)
          .filter((id) => typeof id === "string" && id.length > 0),
      ),
    );

    const lessonAttemptsById = lessonRows.reduce<Record<string, Record<string, unknown>>>((acc, row) => {
      const summaryData = normalizeLessonAttemptSummary(row);
      const existing = acc[row.lesson_id];
      const attempts = Array.isArray(existing?.attempts) ? (existing?.attempts as unknown[]) : [];
      const latestSummary = existing?.latestSummary;
      const latestCompletedAt =
        latestSummary && typeof latestSummary === "object" && latestSummary && "completedAt" in latestSummary
          ? String((latestSummary as Record<string, unknown>).completedAt ?? "")
          : "";
      const shouldReplaceLatest =
        !latestCompletedAt || new Date(summaryData.completedAt as string).getTime() >= new Date(latestCompletedAt).getTime();

      acc[row.lesson_id] = {
        latestSummary: shouldReplaceLatest ? summaryData : existing?.latestSummary ?? summaryData,
        latestInsight:
          shouldReplaceLatest ? parseObject(row.insight) : parseObject(existing?.latestInsight),
        attempts: [...attempts, summaryData],
      };
      return acc;
    }, {});

    const quizScores = quizRows.reduce<Record<string, Record<string, unknown>>>((acc, row) => {
      const summaryData = normalizeQuizAttemptSummary(row);
      const weekKey = String(row.week);
      const existing = acc[weekKey];
      const attempts = Array.isArray(existing?.attempts) ? (existing?.attempts as unknown[]) : [];
      const latestCompletedAt = typeof existing?.completedAt === "string" ? existing.completedAt : "";
      const shouldReplaceLatest =
        !latestCompletedAt || new Date(summaryData.completedAt as string).getTime() >= new Date(latestCompletedAt).getTime();

      acc[weekKey] = {
        ...(shouldReplaceLatest ? summaryData : existing),
        latestInsight:
          shouldReplaceLatest ? parseObject(row.insight) : parseObject(existing?.latestInsight),
        attempts: [...attempts, summaryData],
      };
      return acc;
    }, {});

    const posttests = assessmentRows.filter((row) => row.assessment_type === "posttest");
    if (posttests.length > 0) {
      const attempts = posttests.map(normalizePosttestAttempt);
      quizScores.posttest = {
        latest: attempts[attempts.length - 1],
        attempts,
      };
    }

    return {
      student_id: summary.student_id,
      realm_id: summary.realm_id,
      year: summary.working_level,
      week: summary.current_week ?? summary.assigned_week ?? null,
      status: summary.status,
      pretest_score: summary.pretest_score,
      placement_complete: summary.placement_complete,
      assigned_week: summary.assigned_week,
      required_weeks: summary.required_weeks,
      optional_weeks: summary.optional_weeks,
      completed_lesson_ids: completedLessonIds,
      unlocked_legends: parseStringArray(summary.unlocked_legends),
      quiz_scores: quizScores,
      lesson_attempts: lessonAttemptsById,
      has_seen_intro: null,
      updated_at: summary.updated_at,
    } satisfies CompatProgressRow;
  });
}

function mergeLegacyRows(baseRows: SnapshotLike[], legacyRows: LegacyProgressRow[]) {
  const merged = [...baseRows];
  legacyRows.forEach((legacyRow) => {
    if (!legacyRow.year || typeof legacyRow.pretest_score !== "number") return;
    const existingIndex = merged.findIndex(
      (row) => row.student_id === legacyRow.student_id && row.year === legacyRow.year,
    );

    if (existingIndex >= 0) {
      if (merged[existingIndex].pretest_score == null) {
        merged[existingIndex] = {
          ...merged[existingIndex],
          pretest_score: legacyRow.pretest_score,
          updated_at: merged[existingIndex].updated_at ?? legacyRow.updated_at ?? null,
          status: merged[existingIndex].status || legacyRow.status || "ACTIVE",
          week: merged[existingIndex].week ?? legacyRow.week,
        };
      }
      return;
    }

    merged.push({
      student_id: legacyRow.student_id,
      realm_id: "number",
      year: legacyRow.year,
      week: legacyRow.week,
      status: legacyRow.status ?? "ACTIVE",
      pretest_score: legacyRow.pretest_score,
      placement_complete: null,
      assigned_week: legacyRow.week,
      required_weeks: [],
      optional_weeks: [],
      completed_lesson_ids: [],
      unlocked_legends: [],
      quiz_scores: {},
      lesson_attempts: {},
      has_seen_intro: null,
      updated_at: legacyRow.updated_at ?? null,
    });
  });
  return merged;
}

async function fetchSnapshotFallbackForClass(studentIds: string[]) {
  const [{ data: prog }, { data: legacyProg }] = await Promise.all([
    supabase.from("progress_snapshot").select("*").in("student_id", studentIds),
    supabase
      .from("progress")
      .select("student_id,year,week,status,pretest_score,updated_at")
      .in("student_id", studentIds)
      .not("pretest_score", "is", null),
  ]);

  return mergeLegacyRows(
    ((prog ?? []) as SnapshotLike[]),
    (legacyProg ?? []) as LegacyProgressRow[],
  );
}

async function fetchSnapshotFallbackForStudent(studentId: string) {
  const { data, error } = await supabase.rpc("get_student_progress_snapshot", {
    p_student_id: studentId,
  });
  if (error) throw error;
  return (data ?? []) as SnapshotLike[];
}

export async function fetchRealmCompatProgressForClass(realmId: string, classId: string, studentIds: string[]) {
  if (studentIds.length === 0) return [] as CompatProgressRow[];

  const { data: compatData, error: compatError } = await supabase.rpc("get_class_realm_progress_compat", {
    p_class_id: classId,
    p_realm_id: realmId,
    p_working_level: null,
  });

  if (compatError) {
    console.warn("[RealmProgressCompat] Failed to read class compat rows, falling back to progress_snapshot", compatError);
    return realmId === "number" ? fetchSnapshotFallbackForClass(studentIds) : [];
  }

  const summaries = (compatData ?? []) as RealmProgressSummaryRow[];
  const realmRows = summaries.filter((row) => row.realm_id === realmId);

  if (realmRows.length === 0) {
    return realmId === "number" ? fetchSnapshotFallbackForClass(studentIds) : [];
  }

  const [lessonAttemptsResponse, quizAttemptsResponse, assessmentsResponse, legacyProgResponse] = await Promise.all([
    supabase.rpc("get_class_realm_lesson_attempts", {
      p_class_id: classId,
      p_realm_id: realmId,
      p_working_level: null,
    }),
    supabase.rpc("get_class_realm_weekly_quiz_attempts", {
      p_class_id: classId,
      p_realm_id: realmId,
      p_working_level: null,
    }),
    supabase
      .from("student_realm_assessments")
      .select("student_id,realm_id,working_level,assessment_type,correct_count,total_questions,score_percent,passed,placement_result,question_results,completed_at")
      .eq("class_id", classId)
      .eq("realm_id", realmId),
    realmId === "number"
      ? supabase
          .from("progress")
          .select("student_id,year,week,status,pretest_score,updated_at")
          .in("student_id", studentIds)
          .not("pretest_score", "is", null)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const builtRows = buildRowsFromRealmData(
    realmRows,
    (lessonAttemptsResponse.data ?? []) as LessonAttemptRow[],
    (quizAttemptsResponse.data ?? []) as WeeklyQuizAttemptRow[],
    (assessmentsResponse.data ?? []) as RealmAssessmentRow[],
  );

  return realmId === "number" ? mergeLegacyRows(builtRows, (legacyProgResponse.data ?? []) as LegacyProgressRow[]) : builtRows;
}

export async function fetchRealmCompatProgressForStudent(realmId: string, studentId: string) {
  const { data: compatData, error: compatError } = await supabase.rpc("get_student_realm_progress_compat", {
    p_student_id: studentId,
    p_realm_id: realmId,
  });

  if (compatError) {
    console.warn("[RealmProgressCompat] Failed to read student compat rows, falling back to progress_snapshot", compatError);
    return realmId === "number" ? fetchSnapshotFallbackForStudent(studentId) : [];
  }

  const summaries = (compatData ?? []) as RealmProgressSummaryRow[];
  const realmRows = summaries.filter((row) => row.realm_id === realmId);

  if (realmRows.length === 0) {
    return realmId === "number" ? fetchSnapshotFallbackForStudent(studentId) : [];
  }

  const [lessonAttemptsResponse, quizAttemptsResponse, assessmentsResponse, legacyProgResponse] = await Promise.all([
    supabase.rpc("get_student_realm_lesson_attempts", {
      p_student_id: studentId,
      p_realm_id: realmId,
      p_working_level: null,
    }),
    supabase.rpc("get_student_realm_weekly_quiz_attempts", {
      p_student_id: studentId,
      p_realm_id: realmId,
      p_working_level: null,
    }),
    supabase.rpc("get_student_realm_assessments", {
      p_student_id: studentId,
      p_realm_id: realmId,
      p_working_level: null,
    }),
    realmId === "number"
      ? supabase
          .from("progress")
          .select("student_id,year,week,status,pretest_score,updated_at")
          .eq("student_id", studentId)
          .not("pretest_score", "is", null)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const builtRows = buildRowsFromRealmData(
    realmRows,
    (lessonAttemptsResponse.data ?? []) as LessonAttemptRow[],
    (quizAttemptsResponse.data ?? []) as WeeklyQuizAttemptRow[],
    (assessmentsResponse.data ?? []) as RealmAssessmentRow[],
  );

  return realmId === "number" ? mergeLegacyRows(builtRows, (legacyProgResponse.data ?? []) as LegacyProgressRow[]) : builtRows;
}

export async function fetchNumberCompatProgressForClass(classId: string, studentIds: string[]) {
  return fetchRealmCompatProgressForClass("number", classId, studentIds);
}

export async function fetchNumberCompatProgressForStudent(studentId: string) {
  return fetchRealmCompatProgressForStudent("number", studentId);
}
