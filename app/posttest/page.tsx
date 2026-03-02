"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { POSTTESTS, type Question } from "@/data/assessments/posttests";
import { getLegendForYear } from "@/data/legends";

type StudentProgress = {
  year: string;
  scorePercent: number;
  status: "PASSED" | "ASSIGNED_PROGRAM";
  assignedWeek?: number;
  unlockedLegends: string[];
  lastPostTestPercent?: number;
};

const STORAGE_KEY = "lul_student_progress_v1";
const PASS_THRESHOLD = 90;

function readProgress(): StudentProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StudentProgress;
  } catch {
    return null;
  }
}

function writeProgress(next: StudentProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export default function PostTestPageWrapper() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading…</p></div>}><PostTestPage /></Suspense>;
}

function PostTestPage() {
  const router = useRouter();
  const params = useSearchParams();

  // year comes from query: /posttest?year=Year%203
  const year = params.get("year") ?? "Year 3";

  const test = useMemo(() => {
    return POSTTESTS[year] ?? POSTTESTS["Year 3"];
  }, [year]);

  const questions: Question[] = test?.questions ?? [];

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const q = questions[idx];

  const picked = answers[q?.id ?? ""] ?? "";

  function pick(option: string) {
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: option }));
  }

  function next() {
    if (idx < questions.length - 1) setIdx((v) => v + 1);
  }

  function back() {
    if (idx > 0) setIdx((v) => v - 1);
  }

  function submit() {
    if (!questions.length) return;

    let correct = 0;
    for (const qu of questions) {
      const chosen = answers[qu.id];
      if (chosen && chosen === qu.correctAnswer) correct++;
    }

    const percent = Math.round((correct / questions.length) * 100);

    const prev = readProgress();
    const unlockedLegends = prev?.unlockedLegends ?? [];

    // Unlock the legend if they pass post-test
    const legend = getLegendForYear(year);
    const didPass = percent >= PASS_THRESHOLD;
    const nextUnlocked = didPass
      ? Array.from(new Set([...unlockedLegends, legend.id]))
      : unlockedLegends;

    const nextProgress: StudentProgress = {
      year,
      scorePercent: prev?.scorePercent ?? 0,
      status: prev?.status ?? "ASSIGNED_PROGRAM",
      assignedWeek: prev?.assignedWeek,
      unlockedLegends: nextUnlocked,
      lastPostTestPercent: percent,
    };

    writeProgress(nextProgress);
    setSubmitted(true);

    // Send to results (reuse your existing results page)
    router.push(`/results?year=${encodeURIComponent(year)}&score=${correct}&total=${questions.length}&posttest=1`);
  }

  if (!questions.length) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl text-center">
          <h1 className="text-2xl font-extrabold text-gray-800 mb-2">
            Post-Test not found
          </h1>
          <p className="text-gray-600 mb-6">
            No post-test questions exist for <span className="font-bold">{year}</span> yet.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-indigo-700 hover:underline"
          >
            ← Home
          </button>
          <div className="text-sm text-gray-500">
            Post-Test • {year}
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
          Post-Test
        </h1>
        <p className="text-gray-500 mb-6">
          Answer all questions to unlock your Legend (90%+).
        </p>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-gray-700">
              Question {idx + 1} of {questions.length}
            </div>
            <div className="text-xs text-gray-500">
              {Math.round(((idx + 1) / questions.length) * 100)}%
            </div>
          </div>

          <div className="text-lg font-extrabold text-gray-800 mb-4">
            {q.prompt}
          </div>

          <div className="grid gap-2">
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => pick(opt)}
                className={[
                  "text-left w-full px-4 py-3 rounded-xl border font-semibold transition",
                  picked === opt
                    ? "border-indigo-500 bg-indigo-50 text-gray-900"
                    : "border-gray-200 bg-white hover:bg-gray-50 text-gray-800",
                ].join(" ")}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={back}
            disabled={idx === 0}
            className={[
              "px-4 py-3 rounded-xl font-bold transition",
              idx === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200",
            ].join(" ")}
          >
            Back
          </button>

          {idx < questions.length - 1 ? (
            <button
              onClick={next}
              disabled={!picked}
              className={[
                "px-6 py-3 rounded-xl font-bold transition",
                picked
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed",
              ].join(" ")}
            >
              Next
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!picked || submitted}
              className={[
                "px-6 py-3 rounded-xl font-bold transition",
                picked && !submitted
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed",
              ].join(" ")}
            >
              Submit
            </button>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Progress saved on this device (MVP mode)
        </div>
      </div>
    </main>
  );
}
