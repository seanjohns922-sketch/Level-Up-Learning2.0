"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { normalizeWorkingLevelLabel } from "@/lib/studentLevelLabel";
import {
  buildLiveClassInsight,
  buildLiveStudentInsight,
  formatRelativeTime,
  getLearningStateMeta,
  getLiveStatusTone,
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
  student_id: string;
  class_id: string;
  event_type: string;
  created_at: string;
  payload: Record<string, unknown> | null;
};

type LiveStudentCard = {
  id: string;
  displayName: string;
  workingLevelBadge?: string | null;
  status: LiveStudentStatus;
  currentLevel?: string | null;
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

type LiveStatusFilter = "all" | LiveStudentStatus;

const STATUS_PRIORITY: Record<LiveStudentStatus, number> = {
  needs_support: 0,
  check_in: 1,
  on_track: 2,
  idle: 3,
};

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

function matchesCurrentLesson(row: LiveStudentActivityRow, event: LiveActivityEventRow) {
  const payload = parseEventPayload(event.payload);
  const eventLessonId = typeof payload.lessonId === "string" ? payload.lessonId : null;
  const eventLessonTitle = typeof payload.lessonTitle === "string" ? payload.lessonTitle : null;
  return Boolean(
    (row.current_lesson && eventLessonId === row.current_lesson) ||
    (row.current_lesson_title && eventLessonTitle === row.current_lesson_title)
  );
}

function buildCurrentLessonPerformance(
  row: LiveStudentActivityRow | null | undefined,
  events: LiveActivityEventRow[],
) {
  if (!row) return null;

  const lessonEvents = events
    .filter((event) => matchesCurrentLesson(row, event))
    .sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime());

  if (lessonEvents.length === 0) return null;

  let startIndex = 0;
  for (let index = lessonEvents.length - 1; index >= 0; index -= 1) {
    const eventType = lessonEvents[index]?.event_type;
    if (eventType === "lesson_started" || eventType === "quiz_started") {
      startIndex = index;
      break;
    }
  }

  const attemptEvents = lessonEvents.slice(startIndex);
  let answered = 0;
  let correct = 0;
  let completed = false;

  attemptEvents.forEach((event) => {
    if (event.event_type === "answer_correct") {
      answered += 1;
      correct += 1;
      return;
    }
    if (event.event_type === "answer_incorrect") {
      answered += 1;
      return;
    }
    if (event.event_type === "lesson_completed" || event.event_type === "quiz_completed") {
      completed = true;
      const payload = parseEventPayload(event.payload);
      const payloadAnswered = numberOrNull(payload.questionsAnswered ?? payload.totalQuestions);
      const payloadCorrect = numberOrNull(payload.correctCount ?? payload.correctAnswers);
      if (payloadAnswered != null) answered = payloadAnswered;
      if (payloadCorrect != null) correct = payloadCorrect;
    }
  });

  return {
    answered,
    correct,
    accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    completed,
  };
}

function toLiveCard(
  student: StudentRow,
  row?: LiveStudentActivityRow | null,
  lessonPerformance?: ReturnType<typeof buildCurrentLessonPerformance> | null,
): LiveStudentCard {
  const insight = row
    ? buildLiveStudentInsight({
        studentId: student.id,
        studentName: student.display_name,
        classId: student.class_id,
        currentLevel: row.current_level ?? null,
        currentStrand: null,
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
    status: lessonPerformance?.completed ? "on_track" : (insight?.status ?? row?.ai_status ?? "idle"),
    currentLevel: row?.current_level ?? null,
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
    questionsAnswered: lessonPerformance?.answered ?? null,
    correctCount: lessonPerformance?.correct ?? null,
    accuracyPercent: lessonPerformance?.accuracy ?? null,
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

function formatLocation(card: LiveStudentCard) {
  const parts = [
    card.currentWeek ? `Week ${card.currentWeek}` : null,
    card.currentLesson ? card.currentLesson.replace(/^.*-/, "").toUpperCase() : null,
    card.currentActivityLabel ? card.currentActivityLabel : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "No live lesson yet";
}

const LESSON_DURATION_SECS = 9 * 60;

function formatLessonTimer(lessonStartedAt: string | null | undefined, now: number): string | null {
  if (!lessonStartedAt) return null;
  const elapsed = Math.floor((now - new Date(lessonStartedAt).getTime()) / 1000);
  if (elapsed < 0) return null;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  if (elapsed >= LESSON_DURATION_SECS) {
    return `${mins}m (over 9min)`;
  }
  return `${mins}m ${secs}s / 9min`;
}

function statusFilterLabel(filter: LiveStatusFilter) {
  switch (filter) {
    case "needs_support":
      return "Needs Support";
    case "check_in":
      return "Check-in";
    case "on_track":
      return "On Track";
    case "idle":
      return "Idle";
    default:
      return "All";
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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LiveStatusFilter>("all");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const [spotlightMode, setSpotlightMode] = useState(false);
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
          setLoading(false);
        }
        return;
      }
      if (!cancelled) setLoading(true);
      const { data, error } = await supabase
        .from("live_student_activity")
        .select("*")
        .eq("class_id", selectedClass.id)
        .order("last_active_at", { ascending: false });
      const { data: eventData, error: eventError } = await supabase
        .from("live_activity_events")
        .select("student_id,class_id,event_type,created_at,payload")
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
      if (error) {
        console.warn("[LiveClassPanel] Failed to load live student activity", error);
      }
      if (eventError) {
        console.warn("[LiveClassPanel] Failed to load live activity events", eventError);
      }
      if (!cancelled) {
        setRows((data ?? []) as LiveStudentActivityRow[]);
        setEvents((eventData ?? []) as LiveActivityEventRow[]);
        setLoading(false);
      }
    }

    void ensureLiveSession();
    void loadRows();
    intervalId = setInterval(loadRows, 8000);
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
    const intervalId = setInterval(loadStudentEvents, 8000);
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
      const lessonPerformance = buildCurrentLessonPerformance(row, eventMap.get(student.id) ?? []);
      return toLiveCard(student, row, lessonPerformance);
    });
  }, [events, rows, students]);

  const filteredCards = useMemo(() => {
    const base = filter === "all" ? cards : cards.filter((card) => card.status === filter);
    const sorted = [...base].sort((left, right) => {
      const statusGap = STATUS_PRIORITY[left.status] - STATUS_PRIORITY[right.status];
      if (statusGap !== 0) return statusGap;
      const leftTime = left.lastActiveAt ? new Date(left.lastActiveAt).getTime() : 0;
      const rightTime = right.lastActiveAt ? new Date(right.lastActiveAt).getTime() : 0;
      return rightTime - leftTime;
    });
    return spotlightMode ? sorted.slice(0, 6) : sorted;
  }, [cards, filter, spotlightMode]);

  const selectedStudent = useMemo<LiveStudentDrawerData | null>(
    () => filteredCards.concat(cards).find((card) => card.id === selectedStudentId) ?? null,
    [cards, filteredCards, selectedStudentId]
  );

  const statusCounts = useMemo(() => {
    return cards.reduce(
      (acc, card) => {
        acc[card.status] += 1;
        return acc;
      },
      {
        on_track: 0,
        check_in: 0,
        needs_support: 0,
        idle: 0,
      } as Record<LiveStudentStatus, number>
    );
  }, [cards]);

  const activeStudentCount = cards.filter((card) => card.status !== "idle").length;
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
                  See who is working, who needs a check-in, and who needs support right now.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={spotlightMode}
                  onChange={(event) => setSpotlightMode(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                Spotlight Mode
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Students Active", value: activeStudentCount, tone: "text-teal-700" },
                { label: "Needs Support", value: statusCounts.needs_support, tone: "text-rose-700" },
                { label: "Check-in", value: statusCounts.check_in, tone: "text-amber-700" },
                { label: "Idle", value: statusCounts.idle, tone: "text-slate-600" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-slate-500">
                    {item.label}
                  </div>
                  <div className={`mt-2 text-3xl font-black ${item.tone}`}>{item.value}</div>
                </div>
              ))}
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
          {(["all", "needs_support", "check_in", "on_track", "idle"] as const).map((status) => {
            const active = filter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCards.map((card) => {
              const tone = getLiveStatusTone(card.status);
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedStudentId(card.id)}
                  className={`group rounded-3xl border bg-white p-4 text-left shadow-[0_14px_36px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(15,23,42,0.12)] ${tone.border}`}
                >
                  {/* Header: name + badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-lg font-black text-slate-900">{card.displayName}</div>
                        {card.workingLevelBadge ? (
                          <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-teal-700">
                            {card.workingLevelBadge}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {card.currentLessonTitle ?? formatLocation(card)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-bold ${tone.badge}`}>
                        <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                        {card.currentLessonStatus === "completed"
                          ? "Completed"
                          : card.status === "on_track"
                          ? "Working"
                          : card.status === "check_in"
                          ? "Check-in"
                          : card.status === "needs_support"
                          ? "Needs Support"
                          : "Idle"}
                      </span>
                      {card.learningState && card.learningState !== "confident" && card.status !== "idle" ? (() => {
                        const meta = getLearningStateMeta(card.learningState);
                        return (
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${meta.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                        );
                      })() : null}
                    </div>
                  </div>

                  {/* Score + lesson timer */}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {(card.questionsAnswered ?? 0) > 0 ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900">{card.correctCount ?? 0}/{card.questionsAnswered ?? 0}</span>
                          <span className="text-[11px] font-bold text-slate-400">correct</span>
                        </div>
                      ) : (
                        <div className="text-sm font-semibold text-slate-400">No answers yet</div>
                      )}
                      {(card.questionsAnswered ?? 0) > 0 && (card.accuracyPercent ?? 0) > 0 ? (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          (card.accuracyPercent ?? 0) >= 80
                            ? "bg-emerald-50 text-emerald-700"
                            : (card.accuracyPercent ?? 0) >= 60
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}>
                          {card.accuracyPercent ?? 0}%
                        </span>
                      ) : null}
                    </div>
                    {formatLessonTimer(card.lessonStartedAt, now) ? (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 tabular-nums">
                        {formatLessonTimer(card.lessonStartedAt, now)}
                      </span>
                    ) : null}
                  </div>

                  {/* Current question */}
                  <div className="mt-3 grid gap-1.5 text-sm">
                    <div className="font-semibold text-slate-700">
                      {card.currentLesson ? card.currentLesson.replace(/^.*-/, "").toUpperCase() : "No lesson yet"}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      {card.currentLessonStatus === "completed"
                        ? "Lesson complete"
                        : card.progressLabel ?? formatLocation(card)}
                    </div>
                    <div className="font-semibold text-slate-700">
                      {card.currentActivityLabel ?? "No activity yet"}
                    </div>
                    <div className="line-clamp-2 text-slate-500 text-xs">
                      {card.currentLessonStatus === "completed"
                        ? `${card.currentLessonTitle ?? card.currentLesson ?? "Lesson"} completed`
                        : (card.currentQuestionText ?? card.lastEventText)}
                    </div>
                  </div>

                  {/* Footer: last event + time */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{card.currentLessonStatus === "completed" ? "Completed lesson" : card.lastEventText}</span>
                    <span>{formatRelativeTime(card.lastActiveAt)}</span>
                  </div>

                  {/* AI insight — alert states only */}
                  {card.aiIssue && card.status !== "on_track" ? (
                    <div className={`mt-3 rounded-xl border px-3 py-2 text-xs font-semibold ${tone.badge}`}>
                      {card.aiIssue}
                    </div>
                  ) : null}
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
