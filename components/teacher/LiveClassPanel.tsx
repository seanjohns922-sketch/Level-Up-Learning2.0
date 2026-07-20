"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { normalizeWorkingLevelLabel } from "@/lib/studentLevelLabel";
import {
  buildLiveClassInsight,
  buildLiveStudentInsight,
  formatRelativeTime,
  type LearningState,
  type LiveStudentStatus,
} from "@/lib/live-class";
import { LiveStudentDrawer, type LiveStudentDrawerData, type LiveStudentEventRow } from "@/components/teacher/LiveStudentDrawer";

type ClassRow = {
  id: string;
  class_code: string;
  name: string;
  year_level: string;
};

type StudentRow = {
  id: string;
  display_name: string;
  class_id: string;
  user_id: string;
  working_level?: string | null;
};

type LiveStudentActivityRow = {
  id: string;
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
  latest_event_type?: import("@/lib/live-class").LiveLearningEventType | null;
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
  questions_answered?: number | null;
  correct_count?: number | null;
  accuracy_percent?: number | null;
  current_lesson_status?: string | null;
  completed_at?: string | null;
  lesson_started_at?: string | null;
  skill_tag?: string | null;
  misconception_tag?: string | null;
  ai_status?: LiveStudentStatus | null;
  ai_issue?: string | null;
  ai_likely_gap?: string | null;
  ai_suggested_action?: string | null;
  last_active_at?: string | null;
  updated_at?: string | null;
};

type LiveActivityEventRow = {
  id?: string;
  student_id: string;
  class_id: string;
  event_type: string;
  created_at: string;
  payload: Record<string, unknown> | null;
};

type CompletedActivityAttemptRow = {
  student_id: string;
  realm_id: string;
  working_level: string;
  week: number;
  lesson?: number | null;
  lesson_id?: string | null;
  quiz_id?: string | null;
  attempt_no: number;
  correct_count: number;
  total_questions: number;
  accuracy_percent: number;
  completed?: boolean | null;
  completed_at: string;
  activity_type: "lesson" | "quiz";
};

type CompletedActivityAttemptSummary = {
  attemptNumber: number | null;
  answered?: number | null;
  correct?: number | null;
  accuracy?: number | null;
};

type LiveStudentCard = {
  id: string;
  displayName: string;
  workingLevelBadge?: string | null;
  status: LiveStudentStatus;
  currentLevel?: string | null;
  currentRealm?: string | null;
  currentWeek?: number | null;
  currentLesson?: string | null;
  currentLessonTitle?: string | null;
  currentActivityLabel?: string | null;
  currentQuestionText?: string | null;
  currentQuestionOptions?: string[] | null;
  currentStepLabel?: string | null;
  progressPercent: number;
  progressLabel: string;
  lastActiveAt?: string | null;
  lastEventText: string;
  latestSelectedAnswer?: string | null;
  latestCorrectAnswer?: string | null;
  latestAnswerCorrect?: boolean | null;
  timeOnCurrentQuestion?: number | null;
  attemptNumber?: number | null;
  questionsAnswered?: number | null;
  correctCount?: number | null;
  accuracyPercent?: number | null;
  currentLessonStatus?: string | null;
  completedAt?: string | null;
  lessonStartedAt?: string | null;
  aiIssue?: string | null;
  aiLikelyGap?: string | null;
  aiSuggestedAction?: string | null;
  skillTag?: string | null;
  misconceptionTag?: string | null;
  learningState?: LearningState | null;
};

type LiveCardDisplayGroup = "live" | "needs_support" | "idle" | "waiting_to_start";
type LiveStatusFilter = "all" | LiveCardDisplayGroup;
type LiveSortKey = "student" | "realm" | "level" | "week" | "lesson" | "attempt" | "score" | "percentage" | "lastActive";
type LiveSortDirection = "asc" | "desc";
type LiveSort = { key: LiveSortKey; direction: LiveSortDirection } | null;

const STATUS_PRIORITY: Record<LiveCardDisplayGroup, number> = {
  needs_support: 0,
  live: 1,
  idle: 2,
  waiting_to_start: 3,
};

const MAX_LESSON_SCORE_QUESTIONS = 10;

function formatWorkingLevelBadge(workingLevel?: string | null) {
  const normalized = normalizeWorkingLevelLabel(workingLevel);
  if (!normalized) return null;
  if (normalized === "Prep") return "GROUND";
  const match = /Year\s+(\d+)/i.exec(normalized);
  if (match) return `LVL ${match[1]}`;
  return normalized.toUpperCase();
}

function parseEventPayload(payload: Record<string, unknown> | null | undefined) {
  return payload && typeof payload === "object" ? payload : {};
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function positiveNumberOrNull(value: unknown): number | null {
  const numberValue = numberOrNull(value);
  return numberValue != null && numberValue >= 0 ? Math.round(numberValue) : null;
}

function getQuestionKey(event: LiveActivityEventRow, index: number) {
  const payload = parseEventPayload(event.payload);
  const questionId = typeof payload.questionId === "string" ? payload.questionId.trim() : "";
  if (questionId) return questionId;
  const questionText = typeof payload.questionText === "string" ? payload.questionText.trim() : "";
  if (questionText) return `text:${questionText}`;
  return event.id ?? `${event.created_at}:${event.event_type}:${index}`;
}

function matchesCurrentLesson(row: LiveStudentActivityRow, event: LiveActivityEventRow) {
  const payload = parseEventPayload(event.payload);
  const eventLessonId = typeof payload.lessonId === "string" ? payload.lessonId : null;
  const eventLessonTitle = typeof payload.lessonTitle === "string" ? payload.lessonTitle : null;
  return Boolean(
    (row.current_lesson && eventLessonId === row.current_lesson) ||
    (row.current_lesson_title && eventLessonTitle === row.current_lesson_title)
  );
}

function normalizeAttemptRealm(value?: string | null) {
  const normalized = value?.trim().toLowerCase();
  return normalized === "measurement" || normalized === "measurelands" ? "measurement" : "number";
}

function formatRealmBadge(realm?: string | null) {
  return normalizeAttemptRealm(realm) === "measurement" ? "ML" : "NN";
}

function compareNullableNumbers(left: number | null, right: number | null, direction: LiveSortDirection) {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  return direction === "asc" ? left - right : right - left;
}

function levelSortValue(card: LiveStudentCard) {
  const label = card.currentLevel ?? card.workingLevelBadge ?? "";
  if (/prep|ground/i.test(label)) return 0;
  const match = /(?:year|level|lvl)\s*(\d+)/i.exec(label);
  return match ? Number(match[1]) : null;
}

function lessonSortValue(card: LiveStudentCard) {
  const lessonIdMatch = /(?:^|-)l(\d+)$/i.exec(card.currentLesson ?? "");
  if (lessonIdMatch) return Number(lessonIdMatch[1]);
  const titleMatch = /lesson\s*(\d+)/i.exec(card.currentLessonTitle ?? "");
  return titleMatch ? Number(titleMatch[1]) : null;
}

function compareLiveCards(left: LiveStudentCard, right: LiveStudentCard, sort: NonNullable<LiveSort>) {
  const directionFactor = sort.direction === "asc" ? 1 : -1;
  let comparison = 0;

  switch (sort.key) {
    case "student":
      comparison = left.displayName.localeCompare(right.displayName, undefined, { sensitivity: "base", numeric: true }) * directionFactor;
      break;
    case "realm":
      comparison = formatRealmBadge(left.currentRealm).localeCompare(formatRealmBadge(right.currentRealm)) * directionFactor;
      break;
    case "level":
      comparison = compareNullableNumbers(levelSortValue(left), levelSortValue(right), sort.direction);
      break;
    case "week":
      comparison = compareNullableNumbers(left.currentWeek ?? null, right.currentWeek ?? null, sort.direction);
      break;
    case "lesson":
      comparison = compareNullableNumbers(lessonSortValue(left), lessonSortValue(right), sort.direction);
      break;
    case "attempt":
      comparison = compareNullableNumbers(left.attemptNumber ?? null, right.attemptNumber ?? null, sort.direction);
      break;
    case "score":
      comparison = compareNullableNumbers(
        (left.questionsAnswered ?? 0) > 0 ? (left.correctCount ?? null) : null,
        (right.questionsAnswered ?? 0) > 0 ? (right.correctCount ?? null) : null,
        sort.direction,
      );
      if (comparison === 0) {
        comparison = compareNullableNumbers(
          (left.questionsAnswered ?? 0) > 0 ? (left.questionsAnswered ?? null) : null,
          (right.questionsAnswered ?? 0) > 0 ? (right.questionsAnswered ?? null) : null,
          sort.direction,
        );
      }
      break;
    case "percentage":
      comparison = compareNullableNumbers(
        (left.questionsAnswered ?? 0) > 0 ? (left.accuracyPercent ?? null) : null,
        (right.questionsAnswered ?? 0) > 0 ? (right.accuracyPercent ?? null) : null,
        sort.direction,
      );
      break;
    case "lastActive":
      comparison = compareNullableNumbers(
        left.lastActiveAt ? new Date(left.lastActiveAt).getTime() : null,
        right.lastActiveAt ? new Date(right.lastActiveAt).getTime() : null,
        sort.direction,
      );
      break;
  }

  return comparison || left.displayName.localeCompare(right.displayName, undefined, { sensitivity: "base", numeric: true });
}

function SortHeader({
  sortKey,
  children,
  sort,
  onSort,
  align = "left",
}: {
  sortKey: LiveSortKey;
  children: string;
  sort: LiveSort;
  onSort: (key: LiveSortKey) => void;
  align?: "left" | "right";
}) {
  const active = sort?.key === sortKey;
  const Icon = !active ? ChevronsUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`flex min-w-0 items-center gap-1 rounded px-1 py-1 transition hover:bg-slate-200 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
        align === "right" ? "justify-end" : "justify-start"
      } ${active ? "text-slate-700" : "text-slate-400"}`}
      aria-label={`Sort by ${children}${active ? `, currently ${sort.direction}ending` : ""}`}
      title={`Sort by ${children}`}
    >
      <span className="truncate">{children}</span>
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
    </button>
  );
}

function lessonNumberFromRow(row: LiveStudentActivityRow) {
  const lessonIdMatch = /(?:^|-)l(\d+)$/i.exec(row.current_lesson ?? "");
  if (lessonIdMatch) return Number(lessonIdMatch[1]);
  const titleMatch = /lesson\s*(\d+)/i.exec(row.current_lesson_title ?? "");
  return titleMatch ? Number(titleMatch[1]) : null;
}

function isQuizActivity(row: LiveStudentActivityRow) {
  return /quiz/i.test(`${row.current_lesson ?? ""} ${row.current_lesson_title ?? ""}`);
}

function matchesCompletedAttempt(row: LiveStudentActivityRow, attempt: CompletedActivityAttemptRow) {
  if (attempt.student_id !== row.student_id) return false;
  if (normalizeAttemptRealm(attempt.realm_id) !== normalizeAttemptRealm(row.current_strand)) return false;
  if (row.current_level && attempt.working_level !== row.current_level) return false;
  if (row.current_week != null && attempt.week !== row.current_week) return false;

  if (isQuizActivity(row)) {
    return attempt.activity_type === "quiz" && (!row.current_lesson || attempt.quiz_id === row.current_lesson || /quiz/i.test(row.current_lesson));
  }

  if (attempt.activity_type !== "lesson") return false;
  const lessonNumber = lessonNumberFromRow(row);
  return Boolean(
    (row.current_lesson && attempt.lesson_id === row.current_lesson) ||
    (lessonNumber != null && attempt.lesson === lessonNumber)
  );
}

function buildCompletedActivityAttemptSummary(
  row: LiveStudentActivityRow | null | undefined,
  attempts: CompletedActivityAttemptRow[],
): CompletedActivityAttemptSummary | null {
  if (!row) return null;

  const completedAttempts = attempts
    .filter((attempt) => attempt.completed !== false && matchesCompletedAttempt(row, attempt))
    .sort((left, right) => {
      if (right.attempt_no !== left.attempt_no) return right.attempt_no - left.attempt_no;
      return new Date(right.completed_at).getTime() - new Date(left.completed_at).getTime();
    });

  const latest = completedAttempts[0] ?? null;
  if (latest) {
    const rawAnswered = Math.max(0, latest.total_questions ?? 0);
    const rawCorrect = Math.min(Math.max(0, latest.correct_count ?? 0), rawAnswered);
    const shouldCap = latest.activity_type === "lesson" && rawAnswered > MAX_LESSON_SCORE_QUESTIONS;
    const answered = shouldCap ? MAX_LESSON_SCORE_QUESTIONS : rawAnswered;
    const correct = shouldCap
      ? Math.round((rawCorrect / rawAnswered) * answered)
      : rawCorrect;
    return {
      attemptNumber: Math.max(1, latest.attempt_no),
      answered,
      correct,
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    };
  }

  const hasActivity = Boolean(row.last_active_at || row.current_lesson || row.current_lesson_title);
  return {
    attemptNumber: hasActivity ? 1 : null,
  };
}

function buildCurrentLessonPerformance(
  row: LiveStudentActivityRow | null | undefined,
  events: LiveActivityEventRow[],
) {
  if (!row) return null;

  const rowAnswered = Math.max(0, row.questions_answered ?? 0);
  const rowCorrect = Math.max(0, row.correct_count ?? 0);
  const rowCompleted = row.current_lesson_status === "completed";

  const lessonEvents = events
    .filter((event) => matchesCurrentLesson(row, event))
    .sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime());

  let answered = 0;
  let correct = 0;
  let eventCompleted = false;
  let hasAttemptAnswerEvents = false;
  let payloadAnswered: number | null = null;
  let payloadCorrect: number | null = null;

  if (lessonEvents.length > 0) {
    let startIndex = 0;
    for (let index = lessonEvents.length - 1; index >= 0; index -= 1) {
      const eventType = lessonEvents[index]?.event_type;
      if (eventType === "lesson_started" || eventType === "quiz_started") {
        startIndex = index;
        break;
      }
    }

    const answerByQuestion = new Map<string, boolean>();
    lessonEvents.slice(startIndex).forEach((event, index) => {
      if (event.event_type === "answer_correct") {
        hasAttemptAnswerEvents = true;
        answerByQuestion.set(getQuestionKey(event, index), true);
        return;
      }
      if (event.event_type === "answer_incorrect") {
        hasAttemptAnswerEvents = true;
        answerByQuestion.set(getQuestionKey(event, index), false);
        return;
      }
      if (event.event_type === "lesson_completed" || event.event_type === "quiz_completed") {
        eventCompleted = true;
        const payload = parseEventPayload(event.payload);
        payloadAnswered = positiveNumberOrNull(payload.questionsAnswered ?? payload.totalQuestions);
        payloadCorrect = positiveNumberOrNull(payload.correctCount ?? payload.correctAnswers);
      }
    });

    answered = answerByQuestion.size;
    correct = Array.from(answerByQuestion.values()).filter(Boolean).length;
  }

  if (payloadAnswered != null && (!hasAttemptAnswerEvents || payloadAnswered <= answered)) {
    answered = payloadAnswered;
    correct = Math.min(payloadCorrect ?? correct, answered);
  }

  if (lessonEvents.length === 0 && answered === 0) {
    answered = rowAnswered;
    correct = Math.min(rowCorrect, answered);
  }

  if (!isQuizActivity(row)) {
    const rawAnswered = answered;
    const rawCorrect = Math.min(correct, rawAnswered);
    answered = Math.min(rawAnswered, MAX_LESSON_SCORE_QUESTIONS);
    correct = rawAnswered > MAX_LESSON_SCORE_QUESTIONS
      ? Math.round((rawCorrect / rawAnswered) * answered)
      : rawCorrect;
  }

  return {
    answered,
    correct,
    accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    completed: rowCompleted || eventCompleted,
  };
}

function toLiveCard(
  student: StudentRow,
  row?: LiveStudentActivityRow | null,
  lessonPerformance?: ReturnType<typeof buildCurrentLessonPerformance> | null,
  completedAttemptSummary?: CompletedActivityAttemptSummary | null,
): LiveStudentCard {
  const insight = row
    ? buildLiveStudentInsight({
        studentId: student.id,
        studentName: student.display_name,
        classId: student.class_id,
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
        questionsAnswered: row.questions_answered ?? null,
        correctCount: row.correct_count ?? null,
        accuracy: row.accuracy_percent ?? null,
        completedAt: row.completed_at ?? null,
        skillTag: row.skill_tag ?? null,
        misconceptionTag: row.misconception_tag ?? null,
        lastActiveAt: row.last_active_at ?? null,
        updatedAt: row.updated_at ?? null,
      })
    : null;

  return {
    id: student.id,
    displayName: student.display_name,
    workingLevelBadge: formatWorkingLevelBadge(student.working_level),
    status: insight?.status ?? row?.ai_status ?? "idle",
    currentLevel: row?.current_level ?? null,
    currentRealm: row?.current_strand ?? null,
    currentWeek: row?.current_week ?? null,
    currentLesson: row?.current_lesson ?? null,
    currentLessonTitle: row?.current_lesson_title ?? null,
    currentActivityLabel: row?.current_activity_label ?? null,
    currentQuestionText: row?.current_question_text ?? null,
    currentQuestionOptions: row?.current_question_options ?? [],
    currentStepLabel: row?.current_step_label ?? null,
    progressPercent: Math.max(0, Math.min(100, row?.progress_percent ?? 0)),
    progressLabel: row?.progress_label ?? "Waiting to start",
    lastActiveAt: row?.last_active_at ?? null,
    lastEventText: row?.last_event_text ?? "No live activity yet",
    latestSelectedAnswer: row?.latest_selected_answer ?? null,
    latestCorrectAnswer: row?.latest_correct_answer ?? null,
    latestAnswerCorrect: row?.latest_answer_correct ?? null,
    timeOnCurrentQuestion: row?.time_on_current_question ?? 0,
    attemptNumber: completedAttemptSummary?.attemptNumber ?? null,
    questionsAnswered: completedAttemptSummary?.answered ?? lessonPerformance?.answered ?? null,
    correctCount: completedAttemptSummary?.correct ?? lessonPerformance?.correct ?? null,
    accuracyPercent: completedAttemptSummary?.accuracy ?? lessonPerformance?.accuracy ?? null,
    currentLessonStatus: lessonPerformance?.completed ? "completed" : (row?.current_lesson_status ?? null),
    completedAt: row?.completed_at ?? null,
    lessonStartedAt: row?.lesson_started_at ?? null,
    aiIssue: insight?.issue ?? row?.ai_issue ?? null,
    aiLikelyGap: insight?.likelyGap ?? row?.ai_likely_gap ?? null,
    aiSuggestedAction: insight?.suggestedTeacherAction ?? row?.ai_suggested_action ?? null,
    skillTag: row?.skill_tag ?? null,
    misconceptionTag: row?.misconception_tag ?? null,
    learningState: insight?.learningState ?? null,
  };
}

function hasLiveTelemetry(card: LiveStudentCard) {
  return Boolean(
    card.lastActiveAt ||
    card.currentLesson ||
    card.currentActivityLabel ||
    card.currentQuestionText ||
    card.questionsAnswered ||
    card.correctCount ||
    card.progressPercent > 0
  );
}

function getDisplayStatusSubtext(card: LiveStudentCard, group: LiveCardDisplayGroup) {
  if (group === "waiting_to_start") return "Waiting To Start";
  if (card.currentLessonStatus === "completed" && card.lastActiveAt) {
    return `Completed ${formatRelativeTime(card.lastActiveAt)}`;
  }
  if (group === "idle" && card.lastActiveAt) {
    return `Idle ${formatRelativeTime(card.lastActiveAt)}`;
  }
  if (group === "live" && card.lastActiveAt) {
    return "Active now";
  }
  return formatRelativeTime(card.lastActiveAt);
}

function getCardDisplayGroup(card: LiveStudentCard): LiveCardDisplayGroup {
  const hasTelemetry = hasLiveTelemetry(card);
  if (card.status === "needs_support") return "needs_support";
  if (!hasTelemetry) return "waiting_to_start";
  if (card.status === "idle") return "idle";
  if (card.status === "check_in" || card.status === "on_track") return "live";
  return "live";
}

// Compact-row status: red struggling / amber needs attention / green on track /
// grey idle — finer than the group by splitting the "live" group on card.status.
function rowStatusMeta(card: LiveStudentCard, group: LiveCardDisplayGroup) {
  if (group === "needs_support") return { dot: "bg-rose-500", text: "text-rose-700", label: "Struggling" };
  if (group === "idle") return { dot: "bg-slate-400", text: "text-slate-500", label: "Idle" };
  if (group === "waiting_to_start") return { dot: "bg-slate-300", text: "text-slate-400", label: "Not started" };
  if (card.currentLessonStatus === "completed") return { dot: "bg-teal-500", text: "text-teal-700", label: "Completed" };
  if (card.status === "check_in") return { dot: "bg-amber-500", text: "text-amber-700", label: "Needs attention" };
  return { dot: "bg-emerald-500", text: "text-emerald-700", label: "On track" };
}

function statusFilterLabel(filter: LiveStatusFilter) {
  switch (filter) {
    case "live":
      return "Active Now";
    case "needs_support":
      return "Needs Support";
    case "idle":
      return "Idle";
    case "waiting_to_start":
      return "Waiting To Start";
    default:
      return "Live View";
  }
}

export default function LiveClassPanel({
  selectedClass,
  students,
}: {
  selectedClass: ClassRow | null;
  students: StudentRow[];
}) {
  const [rows, setRows] = useState<LiveStudentActivityRow[]>([]);
  const [events, setEvents] = useState<LiveActivityEventRow[]>([]);
  const [completedAttempts, setCompletedAttempts] = useState<CompletedActivityAttemptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LiveStatusFilter>("all");
  const [spotlightMode, setSpotlightMode] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);
  const [sort, setSort] = useState<LiveSort>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentEvents, setSelectedStudentEvents] = useState<LiveStudentEventRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function ensureLiveSession() {
      if (!selectedClass?.id) return;
      const { data: existing } = await supabase
        .from("live_class_sessions")
        .select("id")
        .eq("class_id", selectedClass.id)
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing?.id) return;
      await supabase.from("live_class_sessions").insert({
        class_id: selectedClass.id,
        status: "active",
      });
    }

    async function loadRows() {
      if (!selectedClass?.id) {
        if (!cancelled) {
          setRows([]);
          setEvents([]);
          setCompletedAttempts([]);
          setLoading(false);
        }
        return;
      }
      // Note: don't flip `loading` on refreshes — only the initial load shows the
      // spinner, so periodic polls update in place without flashing the panel.
      const { data, error } = await supabase
        .from("live_student_activity")
        .select("*")
        .eq("class_id", selectedClass.id)
        .order("last_active_at", { ascending: false });
      const { data: eventData, error: eventError } = await supabase
        .from("live_activity_events")
        .select("id,student_id,class_id,event_type,created_at,payload")
        .eq("class_id", selectedClass.id)
        .in("event_type", [
          "lesson_started",
          "quiz_started",
          "answer_correct",
          "answer_incorrect",
          "lesson_completed",
          "quiz_completed",
        ])
        .order("created_at", { ascending: true });
      const { data: lessonAttemptData, error: lessonAttemptError } = await supabase
        .from("student_lesson_attempts")
        .select("student_id,realm_id,working_level,week,lesson,lesson_id,attempt_no,correct_count,total_questions,accuracy_percent,completed,completed_at")
        .eq("class_id", selectedClass.id)
        .eq("completed", true);
      const { data: quizAttemptData, error: quizAttemptError } = await supabase
        .from("student_weekly_quiz_attempts")
        .select("student_id,realm_id,working_level,week,quiz_id,attempt_no,correct_count,total_questions,accuracy_percent,completed_at")
        .eq("class_id", selectedClass.id);
      if (error) {
        console.warn("[LiveClassPanel] Failed to load live student activity", error);
      }
      if (eventError) {
        console.warn("[LiveClassPanel] Failed to load live activity events", eventError);
      }
      if (lessonAttemptError) {
        console.warn("[LiveClassPanel] Failed to load completed lesson attempts", lessonAttemptError);
      }
      if (quizAttemptError) {
        console.warn("[LiveClassPanel] Failed to load completed quiz attempts", quizAttemptError);
      }
      if (!cancelled) {
        setRows((data ?? []) as LiveStudentActivityRow[]);
        setEvents((eventData ?? []) as LiveActivityEventRow[]);
        setCompletedAttempts([
          ...((lessonAttemptData ?? []) as Omit<CompletedActivityAttemptRow, "activity_type">[]).map((attempt) => ({
            ...attempt,
            activity_type: "lesson" as const,
          })),
          ...((quizAttemptData ?? []) as Omit<CompletedActivityAttemptRow, "activity_type" | "completed" | "lesson" | "lesson_id">[]).map((attempt) => ({
            ...attempt,
            completed: true,
            lesson: null,
            lesson_id: null,
            activity_type: "quiz" as const,
          })),
        ]);
        setLoading(false);
      }
    }

    void ensureLiveSession();
    void loadRows();
    intervalId = setInterval(loadRows, 30000);
    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedClass?.id]);

  useEffect(() => {
    let cancelled = false;
    const selectedClassId = selectedClass?.id ?? null;
    if (!selectedClassId || !selectedStudentId) {
      return;
    }

    async function loadStudentEvents() {
      const { data, error } = await supabase
        .from("live_activity_events")
        .select("id,event_type,created_at,payload")
        .eq("class_id", selectedClassId)
        .eq("student_id", selectedStudentId)
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) {
        console.warn("[LiveClassPanel] Failed to load student timeline", error);
      }
      if (!cancelled) {
        setSelectedStudentEvents((data ?? []) as LiveStudentEventRow[]);
      }
    }

    void loadStudentEvents();
    const intervalId = setInterval(loadStudentEvents, 30000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [selectedClass?.id, selectedStudentId]);

  const cards = useMemo(() => {
    const rowMap = new Map(rows.map((row) => [row.student_id, row]));
    const eventMap = new Map<string, LiveActivityEventRow[]>();
    events.forEach((event) => {
      const current = eventMap.get(event.student_id);
      if (current) current.push(event);
      else eventMap.set(event.student_id, [event]);
    });
    return students.map((student) => {
      const row = rowMap.get(student.id);
      const studentEvents = eventMap.get(student.id) ?? [];
      const lessonPerformance = buildCurrentLessonPerformance(row, studentEvents);
      const completedAttemptSummary = buildCompletedActivityAttemptSummary(row, completedAttempts);
      return toLiveCard(student, row, lessonPerformance, completedAttemptSummary);
    });
  }, [completedAttempts, events, rows, students]);

  const filteredCards = useMemo(() => {
    let base = filter === "all" ? cards : cards.filter((card) => getCardDisplayGroup(card) === filter);
    if (activeOnly) {
      // Hide idle / not-yet-started students during a live rotation.
      base = base.filter((card) => {
        const g = getCardDisplayGroup(card);
        return g === "live" || g === "needs_support";
      });
    }
    const sorted = [...base].sort((left, right) => {
      if (sort) return compareLiveCards(left, right, sort);
      const leftGroup = getCardDisplayGroup(left);
      const rightGroup = getCardDisplayGroup(right);
      const statusGap = STATUS_PRIORITY[leftGroup] - STATUS_PRIORITY[rightGroup];
      if (statusGap !== 0) return statusGap;
      // Within a group, surface lower accuracy first (needs attention), then recency.
      const leftAcc = (left.questionsAnswered ?? 0) > 0 ? (left.accuracyPercent ?? 100) : 200;
      const rightAcc = (right.questionsAnswered ?? 0) > 0 ? (right.accuracyPercent ?? 100) : 200;
      if (leftAcc !== rightAcc) return leftAcc - rightAcc;
      const leftTime = left.lastActiveAt ? new Date(left.lastActiveAt).getTime() : 0;
      const rightTime = right.lastActiveAt ? new Date(right.lastActiveAt).getTime() : 0;
      return rightTime - leftTime;
    });
    return spotlightMode ? sorted.slice(0, 6) : sorted;
  }, [cards, filter, spotlightMode, activeOnly, sort]);

  function updateSort(key: LiveSortKey) {
    const descendingFirst: LiveSortKey[] = ["score", "percentage", "lastActive"];
    setSort((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: descendingFirst.includes(key) ? "desc" : "asc" };
    });
  }

  const selectedStudent = useMemo<LiveStudentDrawerData | null>(
    () => filteredCards.concat(cards).find((card) => card.id === selectedStudentId) ?? null,
    [cards, filteredCards, selectedStudentId]
  );

  const statusCounts = useMemo(() => {
    return cards.reduce(
      (acc, card) => {
        acc[getCardDisplayGroup(card)] += 1;
        return acc;
      },
      {
        live: 0,
        needs_support: 0,
        idle: 0,
        waiting_to_start: 0,
      } as Record<LiveCardDisplayGroup, number>
    );
  }, [cards]);

  const activeStudentCount = cards.filter((card) => getCardDisplayGroup(card) === "live").length;
  const classAccuracy = useMemo(() => {
    const answered = cards.filter((card) => (card.questionsAnswered ?? 0) > 0);
    if (answered.length === 0) return null;
    return Math.round(
      answered.reduce((sum, card) => sum + Math.max(0, card.accuracyPercent ?? 0), 0) / answered.length
    );
  }, [cards]);
  const classInsight = useMemo(
    () =>
      buildLiveClassInsight(
        cards.map((card) => ({
          studentId: card.id,
          studentName: card.displayName,
          classId: selectedClass?.id ?? "",
          skillTag: card.skillTag,
          misconceptionTag: card.misconceptionTag,
          aiStatus: card.status,
          learningState: card.learningState,
          accuracyPercent: card.accuracyPercent ?? null,
          questionsAnswered: card.questionsAnswered ?? null,
        }))
      ),
    [cards, selectedClass?.id]
  );

  const isDrawerOpen = Boolean(selectedStudent);

  return (
    <>
      <section className="grid gap-4">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-teal-700">
                  Live Class
                </div>
                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  {selectedClass?.name ?? "Select a class"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  See who is working right now, who needs support, and who is idle.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={activeOnly}
                    onChange={(event) => setActiveOnly(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  Active only
                </label>
                <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={spotlightMode}
                    onChange={(event) => setSpotlightMode(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  Spotlight
                </label>
              </div>
            </div>

            {/* Compact class total — not another set of big widgets */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold">
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />{activeStudentCount} active
              </span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5 text-rose-700">
                <span className="h-2 w-2 rounded-full bg-rose-500" />{statusCounts.needs_support} need help
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600">{classAccuracy == null ? "—" : `${classAccuracy}%`} class accuracy</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500">{statusCounts.idle} idle</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#062521_0%,#0a2f2a_45%,#0e3f38_100%)] p-5 text-white shadow-[0_18px_40px_rgba(2,23,22,0.28)] flex flex-col">
            <div className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#7DE7D7]">
              {classInsight.title}
            </div>
            <div className="mt-2 text-xl font-black leading-tight">{classInsight.headline}</div>
            {classInsight.detail && (
              <div className="mt-1 text-sm font-semibold text-teal-200/80">{classInsight.detail}</div>
            )}
            <div className="mt-auto pt-4 border-t border-white/10">
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-teal-400/80 mb-1">
                Suggested Action
              </div>
              <div className="text-sm font-semibold text-slate-100 leading-snug">{classInsight.suggestedAction}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["live", "needs_support", "idle", "waiting_to_start"] as const).map((status) => {
            const active = filter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilter((current) => (current === status ? "all" : status))}
                className={[
                  "rounded-full border px-3 py-1.5 text-sm font-bold transition",
                  active
                    ? "border-teal-500 bg-teal-600 text-white shadow-[0_8px_18px_-12px_rgba(13,148,136,0.8)]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
                ].join(" ")}
              >
                {statusFilterLabel(status)}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">
            Loading live class activity…
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No students match the current filter yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_28px_-16px_rgba(15,23,42,0.18)]">
            {/* Column headers */}
            <div className="grid grid-cols-[1.5fr_0.6fr_0.7fr_0.5fr_0.7fr_0.8fr_0.7fr_0.7fr_1fr] items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
              <SortHeader sortKey="student" sort={sort} onSort={updateSort}>Student</SortHeader>
              <SortHeader sortKey="realm" sort={sort} onSort={updateSort}>Realm</SortHeader>
              <SortHeader sortKey="level" sort={sort} onSort={updateSort}>Level</SortHeader>
              <SortHeader sortKey="week" sort={sort} onSort={updateSort}>Week</SortHeader>
              <SortHeader sortKey="lesson" sort={sort} onSort={updateSort}>Lesson</SortHeader>
              <SortHeader sortKey="attempt" sort={sort} onSort={updateSort}>Lesson attempt</SortHeader>
              <SortHeader sortKey="score" sort={sort} onSort={updateSort} align="right">Score</SortHeader>
              <SortHeader sortKey="percentage" sort={sort} onSort={updateSort} align="right">%</SortHeader>
              <SortHeader sortKey="lastActive" sort={sort} onSort={updateSort} align="right">Last active</SortHeader>
            </div>
            {filteredCards.map((card) => {
              const displayGroup = getCardDisplayGroup(card);
              const meta = rowStatusMeta(card, displayGroup);
              const answered = Math.max(0, card.questionsAnswered ?? 0);
              const correct = Math.max(0, card.correctCount ?? 0);
              const accuracy = answered > 0 ? Math.max(0, card.accuracyPercent ?? 0) : null;
              const notStarted = displayGroup === "waiting_to_start";
              const levelTag = notStarted ? "—" : (card.workingLevelBadge ?? "—");
              const weekTag = notStarted ? "—" : (card.currentWeek ? `W${card.currentWeek}` : "—");
              const lessonTag = notStarted ? "—" : (card.currentLesson ? card.currentLesson.replace(/^.*-/, "").toUpperCase() : "—");
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedStudentId(card.id)}
                  className="grid w-full grid-cols-[1.5fr_0.6fr_0.7fr_0.5fr_0.7fr_0.8fr_0.7fr_0.7fr_1fr] items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-left transition hover:bg-slate-50"
                  title="Open student detail"
                >
                  {/* status dot + name */}
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />
                    <span className="truncate text-sm font-bold text-slate-900">{card.displayName}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{formatRealmBadge(card.currentRealm)}</span>
                  <span className="text-xs font-semibold text-slate-600">{levelTag}</span>
                  <span className="text-xs font-semibold text-slate-500 tabular-nums">{weekTag}</span>
                  <span className="truncate text-xs font-semibold text-slate-600">{lessonTag}</span>
                  <span className="truncate text-xs font-bold tabular-nums text-slate-500">
                    {!notStarted && card.attemptNumber ? `Attempt ${card.attemptNumber}` : "—"}
                  </span>
                  {/* score */}
                  <span className="text-right text-sm font-bold tabular-nums text-slate-700">
                    {answered > 0 ? `${correct}/${answered}` : "—"}
                  </span>
                  {/* accuracy */}
                  <span className={`text-right text-sm font-black tabular-nums ${
                    accuracy == null ? "text-slate-300"
                    : accuracy >= 70 ? "text-emerald-700"
                    : accuracy >= 50 ? "text-amber-700"
                    : "text-rose-700"
                  }`}>
                    {accuracy == null ? "—" : `${accuracy}%`}
                  </span>
                  {/* last active */}
                  <span className="text-right text-[11px] font-semibold text-slate-400">
                    {getDisplayStatusSubtext(card, displayGroup)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <LiveStudentDrawer
        open={isDrawerOpen}
        onClose={() => setSelectedStudentId(null)}
        student={selectedStudent}
        events={isDrawerOpen ? selectedStudentEvents : []}
      />
    </>
  );
}
