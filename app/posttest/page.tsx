"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPosttestForYearLabel } from "@/data/assessments/api";
import type { Question } from "@/data/assessments/posttests";
import { getLegendForYear } from "@/data/legends";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { readProgress, writeProgress, type StudentProgress } from "@/data/progress";
import AssessmentQuestionCard from "@/components/assessment/AssessmentQuestionCard";
import AssessmentShell from "@/components/assessment/AssessmentShell";

const PASS_THRESHOLD = 90;

export default function PostTestPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <p className="text-slate-500">Loading…</p>
        </div>
      }
    >
      <PostTestPage />
    </Suspense>
  );
}

function PostTestPage() {
  const router = useRouter();
  const params = useSearchParams();
  const year = params.get("year") ?? "Year 3";

  const test = useMemo(() => {
    return getPosttestForYearLabel(year) ?? getPosttestForYearLabel("Year 3");
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
      const expected = qu.answerOptionId ?? qu.correctAnswer ?? qu.answer;
      if (chosen && expected !== undefined && chosen === expected) correct++;
    }

    const percent = Math.round((correct / questions.length) * 100);

    const prev = readProgress();
    const unlockedLegends = prev?.unlockedLegends ?? [];

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

    router.push(
      `/results?year=${encodeURIComponent(year)}&score=${correct}&total=${questions.length}&posttest=1`
    );
  }

  if (!questions.length) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-800 rounded-3xl shadow-xl p-8 w-full max-w-xl text-center border border-slate-700/60">
          <h1 className="text-2xl font-extrabold text-white mb-2">
            Post-Test not found
          </h1>
          <p className="text-slate-400 mb-6">
            No post-test questions exist for{" "}
            <span className="font-bold text-white">{year}</span> yet.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold hover:from-teal-400 hover:to-emerald-400 transition"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <AssessmentShell
      testType="Post-Test"
      year={year}
      currentIndex={idx}
      totalQuestions={questions.length}
      subtitle="Complete all questions to unlock your Legend (90%+)"
      questionPrompt={q.prompt}
      questionContent={
        <div>
          <div className="flex justify-end mb-3">
            <ReadAloudBtn text={q.prompt} />
          </div>
          <AssessmentQuestionCard question={q} value={picked} onChange={pick} />
        </div>
      }
      hasAnswer={!!picked}
      isLast={idx === questions.length - 1}
      submitted={submitted}
      onBack={back}
      onNext={next}
      onSubmit={submit}
      onExit={() => router.push("/")}
    />
  );
}
