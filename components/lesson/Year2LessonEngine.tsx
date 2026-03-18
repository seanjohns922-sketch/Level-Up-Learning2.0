"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LessonRenderer } from "@/components/lesson/LessonRenderer";
import { generateYear2Question, type Year2QuestionData } from "@/data/activities/year2/lessonEngine";
import { pickWeightedIndex } from "@/lib/weightedRandom";
import type { Lesson } from "@/data/programs/year1";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function Countdown({ seconds, total }: { seconds: number; total: number }) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const pct = Math.max(0, Math.min(100, (seconds / total) * 100));

  return (
    <div className="flex items-center gap-3 flex-1">
      <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${pct}%`,
            background:
              pct > 50
                ? "hsl(145 65% 42%)"
                : pct > 20
                ? "hsl(42 95% 55%)"
                : "hsl(0 72% 51%)",
          }}
        />
      </div>
      <span className="text-sm font-bold text-gray-500 tabular-nums whitespace-nowrap">
        {minutes}:{pad2(remainingSeconds)}
      </span>
    </div>
  );
}

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
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Year2QuestionData | null>(null);
  const [questionKey, setQuestionKey] = useState(0);
  const [finished, setFinished] = useState(false);
  const bagRef = useRef<number[]>([]);
  const lastIndexRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markedCompleteRef = useRef(false);

  const activities = lesson.activities ?? [];
  const currentActivity = activities[currentActivityIndex] ?? null;

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
    const nextQuestion = generateYear2Question(lesson, nextActivity);

    setCurrentActivityIndex(picked.index);
    setCurrentQuestion(nextQuestion);
    setQuestionKey((value) => value + 1);
    setStatus("idle");
  }

  useEffect(() => {
    setSecondsLeft(totalSeconds);
    setStatus("idle");
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setFinished(false);
    bagRef.current = [];
    lastIndexRef.current = null;
    markedCompleteRef.current = false;
    loadNextQuestion();

    const interval = setInterval(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearPendingTimeout();
    };
  }, [lesson.id]);

  useEffect(() => {
    if (secondsLeft > 0 || finished) return;
    setFinished(true);
    if (!markedCompleteRef.current) {
      markedCompleteRef.current = true;
      onTimedComplete();
    }
  }, [finished, onTimedComplete, secondsLeft]);

  function handleCorrect() {
    if (finished || status !== "idle") return;
    clearPendingTimeout();
    setStatus("correct");
    setQuestionsAnswered((value) => value + 1);
    setCorrectAnswers((value) => value + 1);
    timeoutRef.current = setTimeout(() => {
      loadNextQuestion();
    }, 1000);
  }

  function handleWrong() {
    if (finished || status !== "idle") return;
    clearPendingTimeout();
    setStatus("wrong");
    setQuestionsAnswered((value) => value + 1);
    timeoutRef.current = setTimeout(() => {
      loadNextQuestion();
    }, 1200);
  }

  const accuracy =
    questionsAnswered > 0
      ? Math.round((correctAnswers / questionsAnswered) * 100)
      : 0;

  const statusLabel =
    status === "correct"
      ? "✓ Correct!"
      : status === "wrong"
      ? "✗ Try again"
      : currentActivity
      ? `${currentActivity.activityType.replace(/_/g, " ")}`
      : "Practice";

  const summary = useMemo(
    () => [
      { label: "Questions", value: questionsAnswered },
      { label: "Correct", value: correctAnswers },
      { label: "Accuracy", value: `${accuracy}%` },
    ],
    [accuracy, correctAnswers, questionsAnswered]
  );

  if (finished) {
    return (
      <div className="rounded-3xl border bg-white shadow-sm p-5 border-gray-100">
        <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Lesson Complete
        </div>
        <h2 className="mt-2 text-3xl font-black text-gray-900">{lesson.title}</h2>
        <p className="mt-2 text-sm text-gray-600">
          Eight minutes are up. Here is the lesson summary.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {summary.map((item) => (
            <div key={item.label} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
                {item.label}
              </div>
              <div className="mt-2 text-3xl font-black text-gray-900">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onExit}
            className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-lg font-extrabold text-primary-foreground hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
            style={{ boxShadow: "0 8px 24px -8px hsl(var(--primary) / 0.4)" }}
          >
            Return to Week
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "rounded-3xl border bg-white shadow-sm p-4 transition-all",
        status === "correct"
          ? "border-emerald-200"
          : status === "wrong"
          ? "border-red-200"
          : "border-gray-100",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <Countdown seconds={Math.max(0, secondsLeft)} total={totalSeconds} />
        <div
          className={[
            "px-3 py-1.5 rounded-full text-xs font-extrabold tracking-wide transition-all capitalize",
            status === "correct"
              ? "bg-emerald-50 text-emerald-700"
              : status === "wrong"
              ? "bg-red-50 text-red-700"
              : "bg-gray-50 text-gray-500",
          ].join(" ")}
        >
          {statusLabel}
        </div>
      </div>

      <div className="mb-3 grid gap-2 sm:grid-cols-3">
        {summary.map((item) => (
          <div key={item.label} className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2">
            <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
              {item.label}
            </div>
            <div className="mt-0.5 text-lg font-black text-gray-900">{item.value}</div>
          </div>
        ))}
      </div>

      {currentActivity && currentQuestion ? (
        <LessonRenderer
          key={questionKey}
          activity={currentActivity}
          prompt={lesson.title}
          questionData={currentQuestion}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
        />
      ) : null}
    </div>
  );
}
