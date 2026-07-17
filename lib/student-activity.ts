"use client";

import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { supabase } from "@/lib/supabase";

export type StudentActivityDailyRow = {
  activity_date: string;
  class_id: string | null;
  questions_answered: number;
  correct_answers: number;
  lessons_completed: number;
  quizzes_completed: number;
  seconds_active: number;
  minutes_active: number;
  xp_earned: number;
  updated_at: string;
};

type StudentActivityDelta = {
  questionsAnswered?: number;
  correctAnswers?: number;
  lessonsCompleted?: number;
  quizzesCompleted?: number;
  secondsActive?: number;
  xpEarned?: number;
};

function getActivityScope() {
  const profile = getActiveStudentProfile();
  return {
    studentId: profile?.studentId ?? null,
    classId: profile?.classId ?? null,
  };
}

async function upsertStudentActivity(delta: StudentActivityDelta) {
  if (isDemoPreviewMode()) return;
  const { studentId, classId } = getActivityScope();
  if (!studentId) return;

  const { error } = await supabase.rpc("upsert_student_activity_daily_secure", {
    p_student_id: studentId,
    p_class_id: classId ?? null,
    p_questions_answered: Math.max(0, Math.round(delta.questionsAnswered ?? 0)),
    p_correct_answers: Math.max(0, Math.round(delta.correctAnswers ?? 0)),
    p_lessons_completed: Math.max(0, Math.round(delta.lessonsCompleted ?? 0)),
    p_quizzes_completed: Math.max(0, Math.round(delta.quizzesCompleted ?? 0)),
    p_seconds_active: Math.max(0, Math.round(delta.secondsActive ?? 0)),
    p_xp_earned: Math.max(0, Math.round(delta.xpEarned ?? 0)),
  });

  if (error) {
    console.warn("[StudentActivity] Upsert failed:", error);
  }
}

export async function ensureStudentActivityDay() {
  await upsertStudentActivity({});
}

export async function recordStudentActivityDelta(delta: StudentActivityDelta) {
  await upsertStudentActivity(delta);
}

export async function fetchStudentActivityDaily(studentId: string) {
  if (isDemoPreviewMode()) return [];
  const { data, error } = await supabase.rpc("get_student_activity_daily_secure", {
    p_student_id: studentId,
  });
  if (error) throw error;
  return (data ?? []) as StudentActivityDailyRow[];
}
