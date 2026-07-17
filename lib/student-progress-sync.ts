"use client";

import { YEAR_ORDER } from "@/data/yearOrder";
import { type StudentProgress, writeProgress } from "@/data/progress";
import { makeProgramProgressKey, readProgramStore, writeProgramStore, type ProgramProgressStore } from "@/lib/program-progress";
import { markActiveStudentIntroSeen } from "@/lib/studentIdentity";
import { fetchRealmCompatProgressForStudent } from "@/lib/realm-progress-compat";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { supabase } from "@/lib/supabase";

export type StudentProgressSnapshotRow = {
  realm_id?: string | null;
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

export type StudentProgressRealmId = "number" | "measurement";

function realmProgramKey(year: string, realmId: StudentProgressRealmId) {
  return `${year.toLowerCase().replace(/\s+/g, "")}-${realmId === "measurement" ? "measurelands" : "number"}`;
}

function quizIdForRealm(year: string, week: number, realmId: StudentProgressRealmId) {
  const yearNumber = parseInt(year.replace(/\D/g, ""), 10) || 0;
  return `y${yearNumber}-${realmId === "measurement" ? "measurement" : "number"}-w${week}-quiz`;
}

async function getStudentRuntimeContext(studentId: string) {
  const { data, error } = await supabase.rpc("get_student_runtime_context_secure", {
    p_student_id: studentId,
  });
  if (error) throw error;
  return Array.isArray(data) ? ((data[0] ?? null) as StudentRuntimeContextRow | null) : null;
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

function ensureWeek(store: ProgramProgressStore, year: string, week: number, realmId = "number") {
  const key = makeProgramProgressKey(year, week, realmId);
  if (!store[key]) {
    store[key] = { lessonsCompleted: [false, false, false], quizCompleted: false };
  }
  return store[key];
}

function hydrateProgramStore(rows: StudentProgressSnapshotRow[], realmId: StudentProgressRealmId) {
  const prefix = `${realmId}|`;
  const store: ProgramProgressStore = Object.fromEntries(
    Object.entries(readProgramStore()).filter(([key]) => !key.startsWith(prefix))
  );

  rows.forEach((row) => {
    const year = row.year;
    if (!year) return;
    const realmId = row.realm_id === "measurement" ? "measurement" : "number";

    const completedLessonIds = parseStringArray(row.completed_lesson_ids);
    completedLessonIds.forEach((lessonId) => {
      const match = /-w(\d+)-l(\d+)$/i.exec(lessonId);
      if (!match) return;
      const week = Number(match[1]);
      const lessonNumber = Number(match[2]);
      if (!Number.isInteger(week) || week < 1 || week > 12) return;
      if (!Number.isInteger(lessonNumber) || lessonNumber < 1 || lessonNumber > 3) return;
      const wp = ensureWeek(store, year, week, realmId);
      wp.lessonsCompleted[lessonNumber - 1] = true;
    });

    const quizScores = parseRecord(row.quiz_scores);
    Object.entries(quizScores).forEach(([weekKey, value]) => {
      if (weekKey === "posttest") return;
      const week = Number(weekKey);
      if (!Number.isInteger(week) || week < 1 || week > 12) return;
      const quiz = parseRecord(value);
      const wp = ensureWeek(store, year, week, realmId);
      wp.quizCompleted = true;
      const percent = Number(quiz.percent);
      const score = Number(quiz.score);
      if (Number.isFinite(percent)) wp.quizScore = percent;
      else if (Number.isFinite(score)) wp.quizScore = score;
    });

    if (Number.isInteger(row.week) && row.week! >= 1 && row.week! <= 12) {
      ensureWeek(store, year, row.week!, realmId);
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

export async function restoreStudentStateFromServer(
  studentId: string,
  realmId: StudentProgressRealmId,
) {
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
    writeProgress(progress, realmId);
    return { rows: [] as StudentProgressSnapshotRow[], progress, introSeen: true };
  }

  const [realmRows, studentResponse] = await Promise.all([
    fetchRealmCompatProgressForStudent(realmId, studentId),
    getStudentRuntimeContext(studentId),
  ]);

  const compatRows = realmRows as StudentProgressSnapshotRow[];
  const contextRow = studentResponse;
  const introSeenFromStudentFlag =
    contextRow?.has_seen_intro === true || compatRows.some((row) => row.has_seen_intro === true);
  const introSeenFromHistoricalProgress = compatRows.some(
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
    writeProgress(progress, realmId);
  }
  hydrateProgramStore(compatRows, realmId);

  return { rows: compatRows, progress, introSeen };
}

export async function saveStudentProgressState(
  studentId: string,
  year: string,
  data: Record<string, unknown>,
  realmId: StudentProgressRealmId = "number",
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

  const { error } = await supabase.rpc("save_student_realm_progress_secure", {
    p_student_id: studentId,
    p_class_id: studentRow?.class_id ?? null,
    p_realm_id: realmId,
    p_program_key: realmProgramKey(year, realmId),
    p_school_year_level: studentRow?.school_year_level ?? null,
    p_working_level: year,
    p_data: payload,
  });
  if (error) throw error;

}

export async function saveRealmLessonAttempt(
  studentId: string,
  year: string,
  week: number,
  lessonNumber: number,
  lessonId: string,
  attempt: Record<string, unknown>,
  completionKey: string,
  realmId: StudentProgressRealmId = "number",
) {
  if (isDemoPreviewMode()) return;

  const studentRow = await getStudentRuntimeContext(studentId);

  const { error } = await supabase.rpc("complete_realm_lesson", {
    p_student_id: studentId,
    p_class_id: studentRow?.class_id ?? null,
    p_realm_id: realmId,
    p_program_key: realmProgramKey(year, realmId),
    p_school_year_level: studentRow?.school_year_level ?? null,
    p_working_level: year,
    p_week: week,
    p_lesson: lessonNumber,
    p_lesson_id: lessonId,
    p_completion_key: completionKey,
    p_attempt: attempt,
    p_xp: 40,
  });
  if (error) throw error;

}

export async function saveNumberLessonAttempt(
  studentId: string,
  year: string,
  week: number,
  lessonNumber: number,
  lessonId: string,
  attempt: Record<string, unknown>,
  completionKey: string,
) {
  return saveRealmLessonAttempt(studentId, year, week, lessonNumber, lessonId, attempt, completionKey, "number");
}

export async function saveNumberWeeklyQuizAttempt(
  studentId: string,
  year: string,
  week: number,
  attempt: Record<string, unknown>,
  completionKey: string,
  realmId: StudentProgressRealmId = "number",
) {
  if (isDemoPreviewMode()) return;

  const studentRow = await getStudentRuntimeContext(studentId);

  const quizId = quizIdForRealm(year, week, realmId);

  const percent = typeof attempt.percent === "number" ? attempt.percent : 0;
  const { error } = await supabase.rpc("complete_realm_quiz", {
    p_student_id: studentId,
    p_class_id: studentRow?.class_id ?? null,
    p_realm_id: realmId,
    p_program_key: realmProgramKey(year, realmId),
    p_school_year_level: studentRow?.school_year_level ?? null,
    p_working_level: year,
    p_week: week,
    p_quiz_id: quizId,
    p_completion_key: completionKey,
    p_attempt: attempt,
    p_xp: Math.round((percent / 100) * 60),
  });
  if (error) throw error;

}

export async function saveRealmAssessment(
  studentId: string,
  year: string,
  assessmentType: "pretest" | "posttest",
  attempt: Record<string, unknown>,
  completionKey: string,
  progress: Record<string, unknown>,
  realmId: StudentProgressRealmId = "number",
) {
  if (isDemoPreviewMode()) return;

  const studentRow = await getStudentRuntimeContext(studentId);

  const { error } = await supabase.rpc("complete_realm_assessment", {
    p_student_id: studentId,
    p_class_id: studentRow?.class_id ?? null,
    p_realm_id: realmId,
    p_program_key: realmProgramKey(year, realmId),
    p_school_year_level: studentRow?.school_year_level ?? null,
    p_working_level: year,
    p_assessment_type: assessmentType,
    p_completion_key: completionKey,
    p_attempt: attempt,
    p_progress: progress,
  });
  if (error) throw error;

}

export async function saveNumberAssessment(
  studentId: string,
  year: string,
  assessmentType: "pretest" | "posttest",
  attempt: Record<string, unknown>,
  completionKey: string,
  progress: Record<string, unknown>,
) {
  return saveRealmAssessment(studentId, year, assessmentType, attempt, completionKey, progress, "number");
}

export async function markStudentIntroSeen(studentId: string) {
  if (isDemoPreviewMode()) return;

  const { error } = await supabase.rpc("mark_student_intro_seen_secure", {
    p_student_id: studentId,
  });
  if (error) throw error;
}
