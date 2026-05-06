"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  buildLiveClassInsight,
  formatRelativeTime,
  formatTimeActive,
  getLiveStatusTone,
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
  latest_event_type?: string | null;
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
  ai_status?: LiveStudentStatus | null;
  ai_issue?: string | null;
  ai_likely_gap?: string | null;
  ai_suggested_action?: string | null;
  last_active_at?: string | null;
  updated_at?: string | null;
};

type LiveStudentCard = {
  id: string;
  displayName: string;
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
  aiIssue?: string | null;
  aiLikelyGap?: string | null;
  aiSuggestedAction?: string | null;
  skillTag?: string | null;
  misconceptionTag?: string | null;
};

type LiveStatusFilter = "all" | LiveStudentStatus;

const STATUS_PRIORITY: Record<LiveStudentStatus, number> = {
  needs_support: 0,
  check_in: 1,
  on_track: 2,
  idle: 3,
};

function toLiveCard(student: StudentRow, row?: LiveStudentActivityRow | null): LiveStudentCard {
  return {
    id: student.id,
    displayName: student.display_name,
    status: row?.ai_status ?? "idle",
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
    aiIssue: row?.ai_issue ?? null,
    aiLikelyGap: row?.ai_likely_gap ?? null,
    aiSuggestedAction: row?.ai_suggested_action ?? null,
    skillTag: row?.skill_tag ?? null,
    misconceptionTag: row?.misconception_tag ?? null,
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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LiveStatusFilter>("all");
  const [spotlightMode, setSpotlightMode] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentEvents, setSelectedStudentEvents] = useState<LiveStudentEventRow[]>([]);

  useEffect(() => {
    setSelectedStudentId(null);
    setSelectedStudentEvents([]);
  }, [selectedClass?.id]);

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
      if (error) {
        console.warn("[LiveClassPanel] Failed to load live student activity", error);
      }
      if (!cancelled) {
        setRows((data ?? []) as LiveStudentActivityRow[]);
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
      setSelectedStudentEvents([]);
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
    return students.map((student) => toLiveCard(student, rowMap.get(student.id)));
  }, [rows, students]);

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
          classId: selectedClass?.id ?? "",
          skillTag: card.skillTag,
          misconceptionTag: card.misconceptionTag,
          aiStatus: card.status,
        }))
      ),
    [cards, selectedClass?.id]
  );

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

          <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#062521_0%,#0a2f2a_45%,#0e3f38_100%)] p-5 text-white shadow-[0_18px_40px_rgba(2,23,22,0.28)]">
            <div className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#7DE7D7]">
              Class Insight
            </div>
            <div className="mt-3 text-lg font-black leading-tight">{classInsight.headline}</div>
            <div className="mt-3 text-sm text-slate-200">{classInsight.suggestedAction}</div>
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
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-black text-slate-900">{card.displayName}</div>
                      <div className="mt-1 text-sm text-slate-500">{formatLocation(card)}</div>
                    </div>
                    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-bold ${tone.badge}`}>
                      <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                      {card.status === "on_track"
                        ? "On Track"
                        : card.status === "check_in"
                        ? "Check-in"
                        : card.status === "needs_support"
                        ? "Needs Support"
                        : "Idle"}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.16em] text-slate-500">
                      <span>Progress</span>
                      <span>{card.progressPercent}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          card.status === "needs_support"
                            ? "bg-rose-500"
                            : card.status === "check_in"
                            ? "bg-amber-400"
                            : card.status === "idle"
                            ? "bg-slate-300"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${card.progressPercent}%` }}
                      />
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-700">{card.progressLabel}</div>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <div>{card.currentActivityLabel ?? "No current activity recorded"}</div>
                    <div className="line-clamp-2 text-slate-500">
                      {card.currentQuestionText ?? card.lastEventText}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{card.lastEventText}</span>
                      <span>{formatRelativeTime(card.lastActiveAt)}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Time active: {formatTimeActive(card.timeOnCurrentQuestion)}
                    </div>
                    {card.aiIssue && card.status !== "on_track" ? (
                      <div className={`rounded-xl border px-3 py-2 text-xs font-semibold ${tone.badge}`}>
                        {card.aiIssue}
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <LiveStudentDrawer
        open={Boolean(selectedStudentId)}
        onClose={() => setSelectedStudentId(null)}
        student={selectedStudent}
        events={selectedStudentEvents}
      />
    </>
  );
}
