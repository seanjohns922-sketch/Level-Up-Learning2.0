"use client";

import { YEAR_ORDER } from "@/data/yearOrder";
import { type StudentProgress, writeProgress } from "@/data/progress";
import { writeProgramStore, type ProgramProgressStore } from "@/lib/program-progress";
import { markActiveStudentIntroSeen } from "@/lib/studentIdentity";
import { fetchNumberCompatProgressForStudent } from "@/lib/realm-progress-compat";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { supabase } from "@/lib/supabase";

export type StudentProgressSnapshotRow = {
  year: string | null;
  pretest_score: number | null;
  status: string | null;
  week: number | null;
  placement_complete: boolean | null;
  assigned_week: number | null;
  required_weeks: unknown;
  optional_weeks: unknown;
  unlocked_legends: unknown;
  completed_lesson_ids: unknown;
  quiz_scores: unknown;
  lesson_attempts: unknown;
  has_seen_intro: boolean | null;
  updated_at: string | null;
};

type StudentRuntimeContextRow = {
  class_id: string | null;
  school_year_level: string | null;
  has_seen_intro: boolean | null;
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

function numberProgramKey(year: string) {
  return `${year.toLowerCase().replace(/\s+/g, "")}-number`;
}

async function getStudentRuntimeContext(studentId: string) {
  const { data, error } = await supabase.rpc("get_student_runtime_context", {
    p_student_id: studentId,
  });
  if (error) throw error;
  return Array.isArray(data) ? ((data[0] ?? null) as StudentRuntimeContextRow | null) : null;
}

function warnLegacyWrite(label: string, error: unknown) {
  console.warn(`[RealmMigration] Legacy ${label} write failed after realm write succeeded:`, error);
}

function yearIndex(year: string | null | undefined) {
  if (!year) return -1;
  return YEAR_ORDER.indexOf(year);
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function parseNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item >= 1 && item <= 12)
    .sort((a, b) => a - b);
}

function parseRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function ensureWeek(store: ProgramProgressStore, year: string, week: number) {
  const key = `${year}|${week}`;
  if (!store[key]) {
    store[key] = { lessonsCompleted: [false, false, false], quizCompleted: false };
  }
  return store[key];
}

function hydrateProgramStore(rows: StudentProgressSnapshotRow[]) {
  const store: ProgramProgressStore = {};

  rows.forEach((row) => {
    const year = row.year;
    if (!year) return;

    const completedLessonIds = parseStringArray(row.completed_lesson_ids);
    completedLessonIds.forEach((lessonId) => {
      const match = /-w(\d+)-l(\d+)$/i.exec(lessonId);
      if (!match) return;
      const week = Number(match[1]);
      const lessonNumber = Number(match[2]);
      if (!Number.isInteger(week) || week < 1 || week > 12) return;
      if (!Number.isInteger(lessonNumber) || lessonNumber < 1 || lessonNumber > 3) return;
      const wp = ensureWeek(store, year, week);
      wp.lessonsCompleted[lessonNumber - 1] = true;
    });

    const quizScores = parseRecord(row.quiz_scores);
    Object.entries(quizScores).forEach(([weekKey, value]) => {
      if (weekKey === "posttest") return;
      const week = Number(weekKey);
      if (!Number.isInteger(week) || week < 1 || week > 12) return;
      const quiz = parseRecord(value);
      const wp = ensureWeek(store, year, week);
      wp.quizCompleted = true;
      const percent = Number(quiz.percent);
      const score = Number(quiz.score);
      if (Number.isFinite(percent)) wp.quizScore = percent;
      else if (Number.isFinite(score)) wp.quizScore = score;
    });

    if (Number.isInteger(row.week) && row.week! >= 1 && row.week! <= 12) {
      ensureWeek(store, year, row.week!);
    }
  });

  writeProgramStore(store);
}

function choosePrimaryRow(rows: StudentProgressSnapshotRow[]) {
  const usableRows = rows.filter((row) => !!row.year);
  if (!usableRows.length) return null;

  const placementCompleteRows = usableRows.filter((row) => row.placement_complete === true);
  const pool = placementCompleteRows.length > 0 ? placementCompleteRows : usableRows;

  return [...pool].sort((a, b) => {
    const yearDelta = yearIndex(b.year) - yearIndex(a.year);
    if (yearDelta !== 0) return yearDelta;
    const aTime = a.updated_at ? Date.parse(a.updated_at) : 0;
    const bTime = b.updated_at ? Date.parse(b.updated_at) : 0;
    return bTime - aTime;
  })[0] ?? null;
}

function buildStudentProgress(row: StudentProgressSnapshotRow): StudentProgress | null {
  if (!row.year) return null;
  return {
    year: row.year,
    scorePercent: row.pretest_score ?? 0,
    status: row.status === "PASSED" ? "PASSED" : "ASSIGNED_PROGRAM",
    placementComplete: row.placement_complete === true || row.status === "PASSED",
    assignedWeek: row.assigned_week ?? row.week ?? 1,
    requiredWeeks: parseNumberArray(row.required_weeks),
    optionalWeeks: parseNumberArray(row.optional_weeks),
    unlockedLegends: parseStringArray(row.unlocked_legends),
    lastPreTestPercent: row.pretest_score ?? undefined,
  };
}

export async function restoreStudentStateFromServer(studentId: string) {
  if (isDemoPreviewMode()) {
    const progress = {
      year: "Prep",
      scorePercent: 0,
      status: "ASSIGNED_PROGRAM" as const,
      placementComplete: true,
      assignedWeek: 1,
      requiredWeeks: [],
      optionalWeeks: [],
      unlockedLegends: [],
    };
    writeProgress(progress);
    return { rows: [] as StudentProgressSnapshotRow[], progress, introSeen: true };
  }

  const [rows, studentResponse] = await Promise.all([
    fetchNumberCompatProgressForStudent(studentId),
    getStudentRuntimeContext(studentId),
  ]);

  const compatRows = rows as StudentProgressSnapshotRow[];
  const contextRow = studentResponse;
  const introSeenFromStudentFlag =
    contextRow?.has_seen_intro === true || compatRows.some((row) => row.has_seen_intro === true);
  const introSeenFromHistoricalProgress = rows.some(
    (row) => row.pretest_score != null || row.placement_complete === true || row.status === "PASSED"
  );
  const introSeen = introSeenFromStudentFlag || introSeenFromHistoricalProgress;
  if (introSeen) {
    markActiveStudentIntroSeen(studentId);
  }

  const primaryRow = choosePrimaryRow(compatRows);
  if (!primaryRow) {
    return { rows: compatRows, progress: null as StudentProgress | null, introSeen };
  }

  const progress = buildStudentProgress(primaryRow);
  if (progress) {
    writeProgress(progress);
  }
  hydrateProgramStore(compatRows);

  return { rows: compatRows, progress, introSeen };
}

export async function saveStudentProgressState(
  studentId: string,
  year: string,
  data: Record<string, unknown>
) {
  if (isDemoPreviewMode()) return;

  const studentRow = await getStudentRuntimeContext(studentId);

  const payload = {
    status: data.status ?? "ASSIGNED_PROGRAM",
    current_week: data.week ?? null,
    assigned_week: data.assigned_week ?? data.week ?? null,
    placement_complete: data.placement_complete ?? false,
    pretest_score: data.pretest_score ?? null,
    required_weeks: data.required_weeks ?? [],
    optional_weeks: data.optional_weeks ?? [],
    unlocked_legends: data.unlocked_legends ?? [],
  };

  const { error } = await supabase.rpc("save_student_realm_progress", {
    p_student_id: studentId,
    p_class_id: studentRow?.class_id ?? null,
    p_realm_id: "number",
    p_program_key: numberProgramKey(year),
    p_school_year_level: studentRow?.school_year_level ?? null,
    p_working_level: year,
    p_data: payload,
  });
  if (error) throw error;

  const { error: legacyError } = await supabase.rpc("save_student_progress_state", {
    p_student_id: studentId,
    p_year: year,
    p_data: data,
  });
  if (legacyError) {
    warnLegacyWrite("progress summary", legacyError);
  }
}

export async function saveNumberLessonAttempt(
  studentId: string,
  year: string,
  week: number,
  lessonNumber: number,
  lessonId: string,
  attempt: Record<string, unknown>,
) {
  if (isDemoPreviewMode()) return;

  const studentRow = await getStudentRuntimeContext(studentId);

  const { error } = await supabase.rpc("save_realm_lesson_attempt", {
    p_student_id: studentId,
    p_class_id: studentRow?.class_id ?? null,
    p_realm_id: "number",
    p_program_key: numberProgramKey(year),
    p_school_year_level: studentRow?.school_year_level ?? null,
    p_working_level: year,
    p_week: week,
    p_lesson: lessonNumber,
    p_lesson_id: lessonId,
    p_attempt: attempt,
  });
  if (error) throw error;

  const { error: legacyAttemptError } = await supabase.rpc("save_lesson_progress", {
    p_student_id: studentId,
    p_year: year,
    p_week: week,
    p_lesson_id: lessonId,
    p_attempt: attempt,
  });
  if (legacyAttemptError) {
    warnLegacyWrite("lesson attempt", legacyAttemptError);
  }

  const isCompleted = attempt.completed !== false;
  if (isCompleted) {
    const { error: legacyCompletionError } = await supabase.rpc("save_lesson_completion", {
      p_student_id: studentId,
      p_year: year,
      p_week: week,
      p_lesson_id: lessonId,
    });
    if (legacyCompletionError) {
      warnLegacyWrite("lesson completion", legacyCompletionError);
    }
  }
}

export async function saveNumberWeeklyQuizAttempt(
  studentId: string,
  year: string,
  week: number,
  attempt: Record<string, unknown>,
) {
  if (isDemoPreviewMode()) return;

  const studentRow = await getStudentRuntimeContext(studentId);

  const yearNumber = parseInt(year.replace(/\D/g, ""), 10) || 0;
  const quizId = `y${yearNumber}-number-w${week}-quiz`;

  const { error } = await supabase.rpc("save_realm_weekly_quiz_attempt", {
    p_student_id: studentId,
    p_class_id: studentRow?.class_id ?? null,
    p_realm_id: "number",
    p_program_key: numberProgramKey(year),
    p_school_year_level: studentRow?.school_year_level ?? null,
    p_working_level: year,
    p_week: week,
    p_quiz_id: quizId,
    p_attempt: attempt,
  });
  if (error) throw error;

  const nextWeek =
    typeof attempt.passed === "boolean"
      ? (attempt.passed ? Math.min(12, week + 1) : week)
      : week;
  const { error: legacyError } = await supabase.rpc("save_weekly_quiz_progress", {
    p_student_id: studentId,
    p_year: year,
    p_week: week,
    p_attempt: attempt,
    p_next_week: nextWeek,
  });
  if (legacyError) {
    warnLegacyWrite("weekly quiz", legacyError);
  }
}

export async function saveNumberAssessment(
  studentId: string,
  year: string,
  assessmentType: "pretest" | "posttest",
  attempt: Record<string, unknown>,
) {
  if (isDemoPreviewMode()) return;

  const studentRow = await getStudentRuntimeContext(studentId);

  const { error } = await supabase.rpc("save_realm_assessment", {
    p_student_id: studentId,
    p_class_id: studentRow?.class_id ?? null,
    p_realm_id: "number",
    p_program_key: numberProgramKey(year),
    p_school_year_level: studentRow?.school_year_level ?? null,
    p_working_level: year,
    p_assessment_type: assessmentType,
    p_attempt: attempt,
  });
  if (error) throw error;

  if (assessmentType === "pretest") {
    const placementResult =
      attempt.placement_result && typeof attempt.placement_result === "object"
        ? (attempt.placement_result as Record<string, unknown>)
        : {};
    const score =
      typeof attempt.score_percent === "number"
        ? attempt.score_percent
        : typeof attempt.percent === "number"
        ? attempt.percent
        : 0;
    const status =
      typeof attempt.passed === "boolean" && attempt.passed
        ? "PASSED"
        : "ASSIGNED_PROGRAM";
    const week =
      typeof attempt.assigned_week === "number"
        ? attempt.assigned_week
        : typeof placementResult.assignedWeek === "number"
        ? placementResult.assignedWeek
        : typeof attempt.week === "number"
        ? attempt.week
        : 1;
    const { error: legacyError } = await supabase.rpc("save_pretest_progress", {
      p_student_id: studentId,
      p_year: year,
      p_score: score,
      p_status: status,
      p_week: week,
    });
    if (legacyError) {
      warnLegacyWrite("pre-test", legacyError);
    }
    return;
  }

  const latest = attempt.placement_result ?? attempt.profile ?? attempt;
  const latestRecord =
    latest && typeof latest === "object" && !Array.isArray(latest)
      ? (latest as Record<string, unknown>)
      : {};
  const status =
    typeof attempt.passed === "boolean" && attempt.passed
      ? "PASSED"
      : "ASSIGNED_PROGRAM";
  const week =
    typeof attempt.assigned_week === "number"
      ? attempt.assigned_week
      : typeof latestRecord.assignedWeek === "number"
      ? latestRecord.assignedWeek
      : typeof attempt.week === "number"
      ? attempt.week
      : null;
  const { error: legacyError } = await supabase.rpc("save_posttest_progress", {
    p_student_id: studentId,
    p_year: year,
    p_latest: latest,
    p_status: status,
    p_week: week,
  });
  if (legacyError) {
    warnLegacyWrite("post-test", legacyError);
  }
}

export async function markStudentIntroSeen(studentId: string) {
  if (isDemoPreviewMode()) return;

  const { error } = await supabase.rpc("mark_student_intro_seen", {
    p_student_id: studentId,
  });
  if (error) throw error;
}
