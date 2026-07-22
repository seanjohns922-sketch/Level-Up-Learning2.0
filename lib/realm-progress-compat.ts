"use client";

import { supabase } from "@/lib/supabase";

export type CompatProgressRow = {
  student_id: string;
  realm_id: string;
  year: string;
  is_current?: boolean | null;
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
  pretest_profile?: Record<string, unknown> | null;
  posttest_profile?: Record<string, unknown> | null;
  teacher_advanced_weeks?: number[];
  teacher_overrides?: StudentProgressOverrideRow[];
  has_seen_intro?: boolean | null;
  updated_at?: string | null;
};

export type TeacherRealmPlacementRow = {
  student_id: string;
  realm_id: string;
  assigned_start_level: string;
  assigned_entry_mode: PlacementEntryMode;
  updated_at: string;
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

export type StudentProgressOverrideRow = {
  id: string;
  student_id: string;
  realm_id: "number" | "measurement";
  working_level: string;
  week: number;
  advanced_to_week: number;
  teacher_id: string;
  reason: string;
  notes: string | null;
  created_at: string;
};

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

function normalizeAssessmentAttempt(row: RealmAssessmentRow) {
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
  overrides: StudentProgressOverrideRow[] = [],
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

  const overrideMap = new Map<string, StudentProgressOverrideRow[]>();
  overrides.forEach((row) => {
    const key = snapshotKey(row.student_id, row.working_level);
    const current = overrideMap.get(key);
    if (current) current.push(row);
    else overrideMap.set(key, [row]);
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
      const attempts = posttests.map(normalizeAssessmentAttempt);
      quizScores.posttest = {
        latest: attempts[attempts.length - 1],
        attempts,
      };
    }

    const pretests = assessmentRows.filter((row) => row.assessment_type === "pretest");
    const latestPretest = pretests[pretests.length - 1] ?? null;
    const latestPosttest = posttests[posttests.length - 1] ?? null;

    return {
      student_id: summary.student_id,
      realm_id: summary.realm_id,
      year: summary.working_level,
      is_current: summary.is_current,
      week: summary.current_week ?? summary.assigned_week ?? null,
      status: summary.status,
      pretest_score: latestPretest?.score_percent ?? summary.pretest_score,
      placement_complete: summary.placement_complete || latestPretest !== null,
      assigned_week: summary.assigned_week,
      required_weeks: summary.required_weeks,
      optional_weeks: summary.optional_weeks,
      completed_lesson_ids: completedLessonIds,
      unlocked_legends: parseStringArray(summary.unlocked_legends),
      quiz_scores: quizScores,
      lesson_attempts: lessonAttemptsById,
      pretest_profile: latestPretest ? normalizeAssessmentAttempt(latestPretest) : null,
      posttest_profile: latestPosttest ? normalizeAssessmentAttempt(latestPosttest) : null,
      teacher_advanced_weeks: (overrideMap.get(key) ?? []).map((row) => row.week).sort((a, b) => a - b),
      teacher_overrides: [...(overrideMap.get(key) ?? [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
      has_seen_intro: null,
      updated_at: summary.updated_at,
    } satisfies CompatProgressRow;
  });
}

export async function fetchRealmCompatProgressForClass(realmId: string, classId: string, studentIds: string[]) {
  if (studentIds.length === 0) return [] as CompatProgressRow[];

  const { data: compatData, error: compatError } = await supabase.rpc("get_class_realm_progress_compat", {
    p_class_id: classId,
    p_realm_id: realmId,
    p_working_level: null,
  });

  if (compatError) {
    throw new Error(`Unable to load canonical ${realmId} progress: ${compatError.message}`);
  }

  const summaries = (compatData ?? []) as RealmProgressSummaryRow[];
  const realmRows = summaries.filter((row) => row.realm_id === realmId);

  if (realmRows.length === 0) {
    return [];
  }

  const [lessonAttemptsResponse, quizAttemptsResponse, assessmentsResponse, overridesResponse] = await Promise.all([
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
      .in("student_id", studentIds)
      .eq("realm_id", realmId),
    supabase
      .from("student_progress_overrides")
      .select("id,student_id,realm_id,working_level,week,advanced_to_week,teacher_id,reason,notes,created_at")
      .in("student_id", studentIds)
      .eq("realm_id", realmId),
  ]);

  if (lessonAttemptsResponse.error) {
    throw new Error(`Unable to load canonical ${realmId} lesson attempts: ${lessonAttemptsResponse.error.message}`);
  }
  if (quizAttemptsResponse.error) {
    throw new Error(`Unable to load canonical ${realmId} quiz attempts: ${quizAttemptsResponse.error.message}`);
  }
  if (assessmentsResponse.error) {
    throw new Error(`Unable to load canonical ${realmId} assessments: ${assessmentsResponse.error.message}`);
  }
  if (overridesResponse.error) {
    throw new Error(`Unable to load canonical ${realmId} teacher overrides: ${overridesResponse.error.message}`);
  }

  const builtRows = buildRowsFromRealmData(
    realmRows,
    (lessonAttemptsResponse.data ?? []) as LessonAttemptRow[],
    (quizAttemptsResponse.data ?? []) as WeeklyQuizAttemptRow[],
    (assessmentsResponse.data ?? []) as RealmAssessmentRow[],
    (overridesResponse.data ?? []) as StudentProgressOverrideRow[],
  );

  return builtRows;
}

export async function fetchRealmCompatProgressForStudent(realmId: string, studentId: string) {
  const { data: compatData, error: compatError } = await supabase.rpc("get_student_realm_progress_compat_secure", {
    p_student_id: studentId,
    p_realm_id: realmId,
  });

  if (compatError) {
    throw compatError;
  }

  const summaries = (compatData ?? []) as RealmProgressSummaryRow[];
  const realmRows = summaries.filter((row) => row.realm_id === realmId);

  if (realmRows.length === 0) {
    return [];
  }

  const [lessonAttemptsResponse, quizAttemptsResponse, assessmentsResponse, overridesResponse] = await Promise.all([
    supabase.rpc("get_student_realm_lesson_attempts_secure", {
      p_student_id: studentId,
      p_realm_id: realmId,
      p_working_level: null,
    }),
    supabase.rpc("get_student_realm_weekly_quiz_attempts_secure", {
      p_student_id: studentId,
      p_realm_id: realmId,
      p_working_level: null,
    }),
    supabase.rpc("get_student_realm_assessments_secure", {
      p_student_id: studentId,
      p_realm_id: realmId,
      p_working_level: null,
    }),
    supabase.rpc("get_student_progress_overrides_secure", {
      p_student_id: studentId,
      p_realm_id: realmId,
    }),
  ]);

  if (lessonAttemptsResponse.error) throw lessonAttemptsResponse.error;
  if (quizAttemptsResponse.error) throw quizAttemptsResponse.error;
  if (assessmentsResponse.error) throw assessmentsResponse.error;
  if (overridesResponse.error) throw overridesResponse.error;

  const builtRows = buildRowsFromRealmData(
    realmRows,
    (lessonAttemptsResponse.data ?? []) as LessonAttemptRow[],
    (quizAttemptsResponse.data ?? []) as WeeklyQuizAttemptRow[],
    (assessmentsResponse.data ?? []) as RealmAssessmentRow[],
    (overridesResponse.data ?? []) as StudentProgressOverrideRow[],
  );

  return builtRows;
}

export async function fetchNumberCompatProgressForClass(classId: string, studentIds: string[]) {
  return fetchRealmCompatProgressForClass("number", classId, studentIds);
}

export async function fetchNumberCompatProgressForStudent(studentId: string) {
  return fetchRealmCompatProgressForStudent("number", studentId);
}

// ── Teacher placement & reset write-path (RPCs from 20260714120000) ─────────
// Teacher intent is kept separate from live progress. Each RPC verifies the
// teacher owns the student's class and writes a teacher_realm_actions audit row.
export type PlacementEntryMode = "pretest" | "full_level" | "ground_week1";

export async function fetchTeacherRealmPlacements(studentIds: string[]) {
  if (studentIds.length === 0) return [] as TeacherRealmPlacementRow[];

  const { data, error } = await supabase
    .from("student_realm_placement")
    .select("student_id,realm_id,assigned_start_level,assigned_entry_mode,updated_at")
    .in("student_id", studentIds);

  if (error) throw error;
  return (data ?? []) as TeacherRealmPlacementRow[];
}

export async function teacherChangeStartingLevel(
  studentId: string,
  realmId: string,
  assignedLevel: string,
  entryMode: PlacementEntryMode = "pretest",
) {
  const { error } = await supabase.rpc("teacher_change_starting_level", {
    p_student_id: studentId,
    p_realm_id: realmId,
    p_assigned_level: assignedLevel,
    p_entry_mode: entryMode,
  });
  if (error) throw error;
}

export async function teacherChangeStartingLevels(
  realmId: string,
  placements: Array<{ studentId: string; assignedLevel: string; entryMode: PlacementEntryMode }>,
) {
  const { data, error } = await supabase.rpc("teacher_change_starting_levels", {
    p_realm_id: realmId,
    p_placements: placements.map((placement) => ({
      student_id: placement.studentId,
      assigned_level: placement.assignedLevel,
      entry_mode: placement.entryMode,
    })),
  });
  if (error) throw error;
  if (data !== placements.length) throw new Error("Not all placements were saved");
}

export async function teacherResetPretest(studentId: string, realmId: string) {
  const { error } = await supabase.rpc("teacher_reset_pretest", {
    p_student_id: studentId,
    p_realm_id: realmId,
  });
  if (error) throw error;
}

export async function teacherResetWeek(studentId: string, realmId: string) {
  const { error } = await supabase.rpc("teacher_reset_week", {
    p_student_id: studentId,
    p_realm_id: realmId,
  });
  if (error) throw error;
}

export async function teacherResetRealm(studentId: string, realmId: string) {
  const { error } = await supabase.rpc("teacher_reset_realm", {
    p_student_id: studentId,
    p_realm_id: realmId,
  });
  if (error) throw error;
}

export type TeacherProgressOverrideReason =
  | "additional_needs"
  | "iep"
  | "professional_judgement"
  | "extended_absence"
  | "technical_issue"
  | "other";

export async function teacherAdvanceStudentWeek(input: {
  studentId: string;
  realmId: "number" | "measurement";
  workingLevel: string;
  week: number;
  reason: TeacherProgressOverrideReason;
  notes?: string;
}) {
  const { data, error } = await supabase.rpc("teacher_advance_student_week", {
    p_student_id: input.studentId,
    p_realm_id: input.realmId,
    p_working_level: input.workingLevel,
    p_week: input.week,
    p_reason: input.reason,
    p_notes: input.notes?.trim() || null,
  });
  if (error) throw error;
  return data as string;
}
