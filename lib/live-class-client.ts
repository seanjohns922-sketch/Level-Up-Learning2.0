"use client";

import { supabase } from "@/lib/supabase";
import {
  buildLastEventText,
  buildLiveStudentInsight,
  type LiveLearningEventType,
  type LiveStudentSnapshot,
} from "@/lib/live-class";
import { getActiveStudentIdentity } from "@/lib/studentIdentity";

type LiveLearningEventInput = {
  eventType: LiveLearningEventType;
  studentId?: string | null;
  classId?: string | null;
  level?: string | null;
  strand?: string | null;
  week?: number | null;
  lessonId?: string | null;
  lessonTitle?: string | null;
  activityId?: string | null;
  activityLabel?: string | null;
  questionId?: string | null;
  questionText?: string | null;
  questionType?: string | null;
  questionOptions?: string[] | null;
  selectedAnswer?: string | null;
  correctAnswer?: string | null;
  isCorrect?: boolean | null;
  timestamp?: string;
  timeOnQuestion?: number | null;
  attemptNumber?: number | null;
  progressPercent?: number | null;
  progressLabel?: string | null;
  skillTag?: string | null;
  misconceptionTag?: string | null;
  currentStepLabel?: string | null;
};

type LiveStudentActivityRow = {
  id?: string;
  session_id?: string | null;
  student_id: string;
  class_id: string;
  current_level?: string | null;
  current_strand?: string | null;
  current_week?: number | null;
  current_lesson?: string | null;
  current_lesson_title?: string | null;
  current_activity_id?: string | null;
  current_activity_label?: string | null;
  current_question_id?: string | null;
  current_question_text?: string | null;
  current_question_type?: string | null;
  current_question_options?: string[] | null;
  current_step_label?: string | null;
  progress_percent?: number | null;
  progress_label?: string | null;
  latest_event_type?: LiveLearningEventType | null;
  latest_answer_correct?: boolean | null;
  latest_selected_answer?: string | null;
  latest_correct_answer?: string | null;
  last_event_text?: string | null;
  time_on_current_question?: number | null;
  current_question_attempts?: number | null;
  session_incorrect_count?: number | null;
  consecutive_incorrect_count?: number | null;
  session_hint_count?: number | null;
  attempt_number?: number | null;
  skill_tag?: string | null;
  misconception_tag?: string | null;
  ai_status?: string | null;
  ai_issue?: string | null;
  ai_likely_gap?: string | null;
  ai_suggested_action?: string | null;
  last_active_at?: string | null;
  updated_at?: string | null;
};

let idleTimer: ReturnType<typeof setTimeout> | null = null;
let lastIdleKey: string | null = null;

function toSnapshot(row: Partial<LiveStudentActivityRow>): LiveStudentSnapshot {
  return {
    studentId: row.student_id ?? "",
    classId: row.class_id ?? "",
    currentLevel: row.current_level ?? null,
    currentStrand: row.current_strand ?? null,
    currentWeek: row.current_week ?? null,
    currentLesson: row.current_lesson ?? null,
    currentLessonTitle: row.current_lesson_title ?? null,
    currentActivityId: row.current_activity_id ?? null,
    currentActivityLabel: row.current_activity_label ?? null,
    currentQuestionId: row.current_question_id ?? null,
    currentQuestionText: row.current_question_text ?? null,
    currentQuestionType: row.current_question_type ?? null,
    currentQuestionOptions: row.current_question_options ?? null,
    currentStepLabel: row.current_step_label ?? null,
    progressPercent: row.progress_percent ?? null,
    progressLabel: row.progress_label ?? null,
    latestEventType: row.latest_event_type ?? null,
    latestAnswerCorrect: row.latest_answer_correct ?? null,
    latestSelectedAnswer: row.latest_selected_answer ?? null,
    latestCorrectAnswer: row.latest_correct_answer ?? null,
    lastEventText: row.last_event_text ?? null,
    timeOnCurrentQuestion: row.time_on_current_question ?? null,
    currentQuestionAttempts: row.current_question_attempts ?? null,
    sessionIncorrectCount: row.session_incorrect_count ?? null,
    consecutiveIncorrectCount: row.consecutive_incorrect_count ?? null,
    sessionHintCount: row.session_hint_count ?? null,
    attemptNumber: row.attempt_number ?? null,
    skillTag: row.skill_tag ?? null,
    misconceptionTag: row.misconception_tag ?? null,
    lastActiveAt: row.last_active_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function buildNextActivityRow(
  existing: Partial<LiveStudentActivityRow> | null,
  input: LiveLearningEventInput,
  studentId: string,
  classId: string,
  timestamp: string
): LiveStudentActivityRow {
  const sameQuestion = existing?.current_question_id && input.questionId
    ? existing.current_question_id === input.questionId
    : false;

  const prevAttempts = existing?.current_question_attempts ?? 0;
  const prevIncorrect = existing?.session_incorrect_count ?? 0;
  const prevConsecutiveIncorrect = existing?.consecutive_incorrect_count ?? 0;
  const prevHints = existing?.session_hint_count ?? 0;

  let currentQuestionAttempts =
    input.eventType === "question_loaded"
      ? 0
      : sameQuestion
      ? prevAttempts
      : input.questionId
      ? 0
      : prevAttempts;
  let sessionIncorrectCount = prevIncorrect;
  let consecutiveIncorrectCount = prevConsecutiveIncorrect;
  let sessionHintCount = prevHints;

  if (input.eventType === "answer_correct" || input.eventType === "answer_incorrect") {
    currentQuestionAttempts = sameQuestion ? prevAttempts + 1 : 1;
  }
  if (input.eventType === "answer_incorrect") {
    sessionIncorrectCount += 1;
    consecutiveIncorrectCount += 1;
  } else if (input.eventType === "answer_correct") {
    consecutiveIncorrectCount = 0;
  }
  if (input.eventType === "hint_used") {
    sessionHintCount += 1;
  }
  if (input.eventType === "lesson_started" || input.eventType === "quiz_started") {
    sessionIncorrectCount = 0;
    consecutiveIncorrectCount = 0;
    sessionHintCount = 0;
    currentQuestionAttempts = 0;
  }

  const row: LiveStudentActivityRow = {
    ...(existing ?? {}),
    student_id: studentId,
    class_id: classId,
    current_level: input.level ?? existing?.current_level ?? null,
    current_strand: input.strand ?? existing?.current_strand ?? null,
    current_week: input.week ?? existing?.current_week ?? null,
    current_lesson: input.lessonId ?? existing?.current_lesson ?? null,
    current_lesson_title: input.lessonTitle ?? existing?.current_lesson_title ?? null,
    current_activity_id: input.activityId ?? existing?.current_activity_id ?? null,
    current_activity_label: input.activityLabel ?? existing?.current_activity_label ?? null,
    current_question_id: input.questionId ?? existing?.current_question_id ?? null,
    current_question_text: input.questionText ?? existing?.current_question_text ?? null,
    current_question_type: input.questionType ?? existing?.current_question_type ?? null,
    current_question_options: input.questionOptions ?? existing?.current_question_options ?? [],
    current_step_label: input.currentStepLabel ?? existing?.current_step_label ?? null,
    progress_percent: input.progressPercent ?? existing?.progress_percent ?? null,
    progress_label: input.progressLabel ?? existing?.progress_label ?? null,
    latest_event_type: input.eventType,
    latest_answer_correct: input.isCorrect ?? existing?.latest_answer_correct ?? null,
    latest_selected_answer: input.selectedAnswer ?? existing?.latest_selected_answer ?? null,
    latest_correct_answer: input.correctAnswer ?? existing?.latest_correct_answer ?? null,
    last_event_text: buildLastEventText(input.eventType, {
      isCorrect: input.isCorrect,
      timeOnQuestion: input.timeOnQuestion,
      progressLabel: input.progressLabel,
    }),
    time_on_current_question: input.timeOnQuestion ?? existing?.time_on_current_question ?? 0,
    current_question_attempts: currentQuestionAttempts,
    session_incorrect_count: sessionIncorrectCount,
    consecutive_incorrect_count: consecutiveIncorrectCount,
    session_hint_count: sessionHintCount,
    attempt_number: input.attemptNumber ?? existing?.attempt_number ?? null,
    skill_tag: input.skillTag ?? existing?.skill_tag ?? null,
    misconception_tag: input.misconceptionTag ?? existing?.misconception_tag ?? null,
    last_active_at: timestamp,
    updated_at: timestamp,
  };

  const insight = buildLiveStudentInsight(toSnapshot(row));
  row.ai_status = insight.status;
  row.ai_issue = insight.issue;
  row.ai_likely_gap = insight.likelyGap;
  row.ai_suggested_action = insight.suggestedTeacherAction;
  return row;
}

export async function trackLiveLearningEvent(input: LiveLearningEventInput) {
  if (typeof window === "undefined") return;

  const identity = getActiveStudentIdentity();
  const studentId = input.studentId ?? identity.studentId;
  const classId = input.classId ?? identity.classId;
  if (!studentId || !classId) return;

  const timestamp = input.timestamp ?? new Date().toISOString();

  try {
    const { data: existing, error: existingError } = await supabase
      .from("live_student_activity")
      .select("*")
      .eq("student_id", studentId)
      .eq("class_id", classId)
      .maybeSingle();

    if (existingError) {
      console.warn("[LiveClass] Could not read existing activity row", existingError);
    }

    const nextRow = buildNextActivityRow(existing, input, studentId, classId, timestamp);

    const { error: upsertError } = await supabase
      .from("live_student_activity")
      .upsert(nextRow, { onConflict: "class_id,student_id" });

    if (upsertError) {
      console.warn("[LiveClass] Activity upsert failed", upsertError);
    }

    const payload = {
      ...input,
      studentId,
      classId,
      timestamp,
    };

    const { error: eventError } = await supabase.from("live_activity_events").insert({
      session_id: existing?.session_id ?? null,
      student_id: studentId,
      class_id: classId,
      event_type: input.eventType,
      payload,
      created_at: timestamp,
    });

    if (eventError) {
      console.warn("[LiveClass] Event insert failed", eventError);
    }
  } catch (error) {
    console.warn("[LiveClass] Tracking failed", error);
  }
}

export function scheduleIdleLiveEvent(base: Omit<LiveLearningEventInput, "eventType">) {
  if (typeof window === "undefined") return;
  if (idleTimer) clearTimeout(idleTimer);
  const idleKey = `${base.lessonId ?? "session"}:${base.questionId ?? "question"}`;
  lastIdleKey = idleKey;
  idleTimer = setTimeout(() => {
    if (lastIdleKey !== idleKey) return;
    void trackLiveLearningEvent({
      ...base,
      eventType: "idle_detected",
    });
  }, 120000);
}

export function clearIdleLiveEventTimer() {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
  lastIdleKey = null;
}
