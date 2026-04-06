"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LessonRenderer } from "@/components/lesson/LessonRenderer";
import { LessonXPBar } from "@/components/lesson/LessonXPBar";
import { LessonTimer } from "@/components/lesson/LessonTimer";
import { LessonStatStrip } from "@/components/lesson/LessonStatStrip";
import { LessonSupportPanel } from "@/components/lesson/LessonSupportPanel";
import { LessonCompleteCard } from "@/components/lesson/LessonCompleteCard";
import {
  buildLessonActivityPool,
  generateQuestion,
  getLevelForLesson,
  type Year2QuestionData,
} from "@/data/activities/year2/lessonEngine";
import { pickWeightedIndex } from "@/lib/weightedRandom";
import type { Lesson } from "@/data/programs/year1";

function buildInitialTurn(lesson: Lesson, activities: Lesson["activities"] = []) {
  const level = getLevelForLesson(lesson);
  if (!activities || activities.length === 0) {
    return {
      bag: [] as number[],
      lastIndex: null as number | null,
      activityIndex: 0,
      question: null as Year2QuestionData | null,
    };
  }

  const picked = pickWeightedIndex(activities, [], null);
  return {
    bag: picked.bag,
    lastIndex: picked.index,
    activityIndex: picked.index,
    question: generateQuestion(level, lesson, activities[picked.index]),
  };
}

const XP_TARGET = 5; // target questions per session for XP bar scaling

export function Year2LessonEngine({
  lesson,
  onTimedComplete,
  onExit,
}: {
  lesson: Lesson;
  onTimedComplete: () => void;
  onExit: () => void;
}) {
  const totalSeconds = 8 * 60;
  const level = useMemo(() => getLevelForLesson(lesson), [lesson]);
  const lessonPool = useMemo(() => buildLessonActivityPool(level, lesson), [level, lesson]);
  const activities = lessonPool.activities;
  const initialTurn = useMemo(() => buildInitialTurn(lesson, activities), [activities, lesson]);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(initialTurn.activityIndex);
  const [currentQuestion, setCurrentQuestion] = useState<Year2QuestionData | null>(initialTurn.question);
  const [questionKey, setQuestionKey] = useState(0);
  const bagRef = useRef<number[]>(initialTurn.bag);
  const lastIndexRef = useRef<number | null>(initialTurn.lastIndex);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markedCompleteRef = useRef(false);
  const scoredThisTurnRef = useRef(false);
  const finished = secondsLeft <= 0;
  const currentActivity = activities[currentActivityIndex] ?? null;

  const accuracy =
    questionsAnswered > 0
      ? Math.round((correctAnswers / questionsAnswered) * 100)
      : 0;

  function clearPendingTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function loadNextQuestion() {
    clearPendingTimeout();
    if (activities.length === 0) return;

    const picked = pickWeightedIndex(activities, bagRef.current, lastIndexRef.current);
    bagRef.current = picked.bag;
    lastIndexRef.current = picked.index;

    const nextActivity = activities[picked.index];
    const nextQuestion = generateQuestion(level, lesson, nextActivity);

    setCurrentActivityIndex(picked.index);
    setCurrentQuestion(nextQuestion);
    setQuestionKey((v) => v + 1);
    setStatus("idle");
    scoredThisTurnRef.current = false;
  }

  useEffect(() => {
    if (lessonPool.violations.length === 0) return;
    const summary = lessonPool.violations
      .map((v) => `${v.reason}: ${v.message}`)
      .join(" | ");
    console.error(`[Year2LessonPool] ${lesson.title}: ${summary}`);
  }, [lesson.title, lessonPool.violations]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((c) => c - 1);
    }, 1000);
    return () => {
      clearInterval(interval);
      clearPendingTimeout();
    };
  }, []);

  useEffect(() => {
    if (!finished) return;
    if (!markedCompleteRef.current) {
      markedCompleteRef.current = true;
      onTimedComplete();
    }
  }, [finished, onTimedComplete]);

  function handleCorrect() {
    if (finished || status !== "idle" || scoredThisTurnRef.current) return;
    scoredThisTurnRef.current = true;
    clearPendingTimeout();
    setStatus("correct");
    setQuestionsAnswered((v) => v + 1);
    setCorrectAnswers((v) => v + 1);
    timeoutRef.current = setTimeout(() => loadNextQuestion(), 1000);
  }

  function handleWrong() {
    if (finished || status !== "idle" || scoredThisTurnRef.current) return;
    scoredThisTurnRef.current = true;
    clearPendingTimeout();
    setStatus("wrong");
    setQuestionsAnswered((v) => v + 1);
    timeoutRef.current = setTimeout(() => loadNextQuestion(), 1200);
  }

  // Derive task description + hint from question data
  const taskDescription = currentQuestion
    ? (currentQuestion as Record<string, unknown>).prompt as string ??
      currentActivity?.activityType?.replace(/_/g, " ") ??
      "Complete the activity"
    : "Complete the activity";

  const hint = currentQuestion
    ? (currentQuestion as Record<string, unknown>).helper as string | undefined ?? null
    : null;

  const activityLabel = currentActivity
    ? currentActivity.activityType.replace(/_/g, " ").toUpperCase()
    : "PRACTISE";

  // ── Finished state ──
  if (finished) {
    return (
      <LessonCompleteCard
        lessonTitle={lesson.title}
        questionsAnswered={questionsAnswered}
        correctAnswers={correctAnswers}
        accuracy={accuracy}
        onExit={onExit}
      />
    );
  }

  // ── Active state ──
  const statusBorder =
    status === "correct"
      ? "border-emerald-300 shadow-emerald-100/50"
      : status === "wrong"
      ? "border-red-300 shadow-red-100/50"
      : "border-border/50";

  return (
    <div className="space-y-3">
      {/* ── Summary strip: XP + Timer ── */}
      <div className="rounded-3xl border border-border/50 bg-card p-4 shadow-md space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <LessonXPBar correct={correctAnswers} totalTarget={Math.max(XP_TARGET, questionsAnswered + 2)} />
          </div>
          <LessonTimer seconds={Math.max(0, secondsLeft)} total={totalSeconds} />
        </div>

        <LessonStatStrip
          questionsAnswered={questionsAnswered}
          correctAnswers={correctAnswers}
          accuracy={accuracy}
        />
      </div>

      {/* ── Status feedback pill ── */}
      {status !== "idle" && (
        <div
          className={`rounded-xl px-4 py-2.5 text-center text-sm font-extrabold shadow-sm transition-all ${
            status === "correct"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {status === "correct" ? "✓ Correct! +10 XP" : "✗ Not quite — keep going!"}
        </div>
      )}

      {/* ── Support panel ── */}
      <LessonSupportPanel taskDescription={taskDescription} hint={hint} />

      {/* ── Main task card ── */}
      {currentActivity && currentQuestion ? (
        <div
          className={`rounded-[1.75rem] border-2 bg-card p-5 shadow-lg transition-all duration-300 ${statusBorder}`}
        >
          {/* Activity type label */}
          <div className="mb-3">
            <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              {activityLabel}
            </span>
          </div>

          {/* Actual activity renderer */}
          <LessonRenderer
            key={questionKey}
            activity={currentActivity}
            prompt={lesson.title}
            questionData={currentQuestion}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          This lesson has no valid activities for the current policy. Check the lesson config or
          source activity pool.
        </div>
      )}
    </div>
  );
}
