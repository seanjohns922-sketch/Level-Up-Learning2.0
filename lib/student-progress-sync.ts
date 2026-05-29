"use client";

import { YEAR_ORDER } from "@/data/yearOrder";
import { type StudentProgress, writeProgress } from "@/data/progress";
import { writeProgramStore, type ProgramProgressStore } from "@/lib/program-progress";
import { markActiveStudentIntroSeen } from "@/lib/studentIdentity";
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
  const { data, error } = await supabase.rpc("get_student_progress_snapshot", {
    p_student_id: studentId,
  });
  if (error) throw error;

  const rows = (Array.isArray(data) ? data : []) as StudentProgressSnapshotRow[];
  const introSeenFromStudentFlag = rows.some((row) => row.has_seen_intro === true);
  const introSeenFromHistoricalProgress = rows.some(
    (row) => row.pretest_score != null || row.placement_complete === true || row.status === "PASSED"
  );
  const introSeen = introSeenFromStudentFlag || introSeenFromHistoricalProgress;
  if (introSeen) {
    markActiveStudentIntroSeen(studentId);
  }

  const primaryRow = choosePrimaryRow(rows);
  if (!primaryRow) {
    return { rows, progress: null as StudentProgress | null, introSeen };
  }

  const progress = buildStudentProgress(primaryRow);
  if (progress) {
    writeProgress(progress);
  }
  hydrateProgramStore(rows);

  return { rows, progress, introSeen };
}

export async function saveStudentProgressState(
  studentId: string,
  year: string,
  data: Record<string, unknown>
) {
  const { error } = await supabase.rpc("save_student_progress_state", {
    p_student_id: studentId,
    p_year: year,
    p_data: data,
  });
  if (error) throw error;
}

export async function markStudentIntroSeen(studentId: string) {
  const { error } = await supabase.rpc("mark_student_intro_seen", {
    p_student_id: studentId,
  });
  if (error) throw error;
}
