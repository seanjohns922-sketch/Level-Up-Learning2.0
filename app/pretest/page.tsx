"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getPretestForYearLabel } from "@/data/assessments/api";
import type { Question } from "@/data/assessments/pretests";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import AssessmentQuestionCard from "@/components/assessment/AssessmentQuestionCard";
import AssessmentShell from "@/components/assessment/AssessmentShell";
import { ActiveLearningTracker } from "@/components/student/ActiveLearningTracker";
import { analyzeAssessmentResult, isAssessmentAnswerCorrect } from "@/data/assessments/analysis";
import { ACTIVE_STUDENT_KEY, isPlacementComplete, readProgress, type StudentProgress, writeProgress } from "@/data/progress";
import { ALL_PROGRAM_WEEKS, clearYearProgress, getOptionalWeeks, normalizeWeekList } from "@/lib/program-progress";
import { saveNumberAssessment, saveStudentProgressState } from "@/lib/student-progress-sync";
import { formatStudentLevelLabel } from "@/lib/studentLevelLabel";
import {
  clearPretestResume,
  loadPretestResume,
  pretestResumeHasProgress,
  savePretestResume,
} from "@/lib/resume-state";
import { clearActiveStudentSession } from "@/lib/studentIdentity";
import { supabase } from "@/lib/supabase";

const PRETEST_PASS_THRESHOLD = 85;
const YEAR_SEQUENCE = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"] as const;

function getNextYearLabel(year: string) {
  const index = YEAR_SEQUENCE.indexOf(year as (typeof YEAR_SEQUENCE)[number]);
  if (index === -1) return null;
  return YEAR_SEQUENCE[index + 1] ?? null;
}

function getLowestRecommendedWeek(recommendedWeeks: number[] | undefined) {
  if (!recommendedWeeks?.length) return undefined;
  return Math.min(...recommendedWeeks);
}

/* ── Inline visuals (kept from original) ── */

function MabPicker({
  target,
  maxTens = 10,
  maxOnes = 10,
  value,
  onChange,
}: {
  target: number;
  maxTens?: number;
  maxOnes?: number;
  value: { tens: number; ones: number };
  onChange: (v: { tens: number; ones: number }) => void;
}) {
  function toggleTens(idx: number) {
    const next = idx < value.tens ? idx : idx + 1;
    onChange({ tens: next, ones: value.ones });
  }

  function toggleOnes(idx: number) {
    const next = idx < value.ones ? idx : idx + 1;
    onChange({ tens: value.tens, ones: next });
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-end gap-4 mb-4">
        <div className="px-4 py-2 rounded-xl font-bold border bg-slate-700/50 border-slate-600 text-slate-300">
          Target: {target}
        </div>
      </div>

      <div className="mb-5">
        <div className="text-sm font-bold text-slate-400 mb-2">Tens</div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: maxTens }).map((_, i) => {
            const selected = i < value.tens;
            return (
              <button
                key={`t-${i}`}
                type="button"
                onClick={() => toggleTens(i)}
                className={[
                  "w-10 h-20 rounded-xl border-2 transition",
                  selected
                    ? "border-teal-500 bg-teal-500/20"
                    : "border-slate-600 bg-slate-700/50 hover:bg-slate-700",
                ].join(" ")}
                title={selected ? "Tap to remove" : "Tap to add"}
              >
                <div className="h-full w-full flex flex-col gap-1 p-2">
                  {Array.from({ length: 10 }).map((__, k) => (
                    <div
                      key={k}
                      className={[
                        "h-2 rounded",
                        selected ? "bg-teal-500/60" : "bg-slate-600",
                      ].join(" ")}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-sm font-bold text-slate-400 mb-2">Ones</div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: maxOnes }).map((_, i) => {
            const selected = i < value.ones;
            return (
              <button
                key={`o-${i}`}
                type="button"
                onClick={() => toggleOnes(i)}
                className={[
                  "w-10 h-10 rounded-lg border-2 transition",
                  selected
                    ? "border-teal-500 bg-teal-500/20"
                    : "border-slate-600 bg-slate-700/50 hover:bg-slate-700",
                ].join(" ")}
                title={selected ? "Tap to remove" : "Tap to add"}
              >
                <div className="w-6 h-6 rounded-md border border-slate-500 mx-auto my-auto" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GroupsVisual({ groups }: { groups: number[] }) {
  return (
    <div className="rounded-xl border border-slate-600 bg-slate-700/50 p-3">
      <div className="grid gap-2">
        {groups.map((count, rowIdx) => (
          <div key={rowIdx} className="flex flex-wrap gap-2">
            {Array.from({ length: count }).map((_, i) => (
              <span
                key={i}
                className="inline-block h-4 w-4 rounded-full border border-slate-500 bg-slate-600"
                aria-hidden
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DotAddVisual({
  leftTarget,
  rightTarget,
  maxDots = 10,
}: {
  leftTarget: number;
  rightTarget: number;
  maxDots?: number;
}) {
  const [leftOn, setLeftOn] = useState<boolean[]>(
    Array.from({ length: maxDots }, () => false)
  );
  const [rightOn, setRightOn] = useState<boolean[]>(
    Array.from({ length: maxDots }, () => false)
  );

  function toggle(side: "left" | "right", idx: number) {
    if (side === "left") {
      setLeftOn((prev) => prev.map((v, i) => (i === idx ? !v : v)));
    } else {
      setRightOn((prev) => prev.map((v, i) => (i === idx ? !v : v)));
    }
  }

  function clear() {
    setLeftOn(Array.from({ length: maxDots }, () => false));
    setRightOn(Array.from({ length: maxDots }, () => false));
  }

  return (
    <div className="rounded-2xl border border-slate-600 bg-slate-700/50 p-5 mb-4">
      <div className="text-sm text-slate-400 mb-3">
        Click dots to show <span className="font-bold text-white">{leftTarget}</span> +{" "}
        <span className="font-bold text-white">{rightTarget}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {leftOn.map((on, i) => (
            <button
              key={`left-${i}`}
              type="button"
              onClick={() => toggle("left", i)}
              className={[
                "h-8 w-8 rounded-full border transition",
                on
                  ? "bg-teal-500 border-teal-400"
                  : "bg-slate-700 border-slate-500 hover:bg-slate-600",
              ].join(" ")}
              aria-label={`left dot ${i + 1}`}
            />
          ))}
        </div>
        <div className="text-4xl font-extrabold text-slate-400 select-none">+</div>
        <div className="flex flex-wrap gap-2 justify-center">
          {rightOn.map((on, i) => (
            <button
              key={`right-${i}`}
              type="button"
              onClick={() => toggle("right", i)}
              className={[
                "h-8 w-8 rounded-full border transition",
                on
                  ? "bg-teal-500 border-teal-400"
                  : "bg-slate-700 border-slate-500 hover:bg-slate-600",
              ].join(" ")}
              aria-label={`right dot ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={clear}
          className="px-3 py-2 rounded-xl bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 transition border border-slate-600"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function GroupCountersVisual({
  totalCounters,
  groupSize,
  selectTarget,
}: {
  totalCounters: number;
  groupSize: number;
  selectTarget: number;
}) {
  const [selected, setSelected] = useState<boolean[]>(
    Array.from({ length: totalCounters }, () => false)
  );

  function toggle(idx: number) {
    setSelected((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  }

  function clear() {
    setSelected(Array.from({ length: totalCounters }, () => false));
  }

  return (
    <div className="rounded-2xl border border-slate-600 bg-slate-700/50 p-5 mb-4">
      <div className="text-sm text-slate-400 mb-3">
        Click counters to show <b className="text-white">{selectTarget}</b> counters grouped in{" "}
        <b className="text-white">{groupSize}s</b>
      </div>

      <div
        className="grid gap-2 justify-center"
        style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
      >
        {selected.map((on, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={[
              "h-10 w-10 rounded-full border transition",
              on
                ? "bg-teal-500 border-teal-400"
                : "bg-slate-700 border-slate-500 hover:bg-slate-600",
            ].join(" ")}
            aria-label={`counter ${i + 1}`}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={clear}
          className="px-3 py-2 rounded-xl bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 transition border border-slate-600"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

/* ── Page ── */

export default function PretestPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <p className="text-slate-500">Loading…</p>
        </div>
      }
    >
      <PretestPage />
    </Suspense>
  );
}

function PretestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const year = searchParams.get("year") ?? "Year 3";
  const studentLevelLabel = formatStudentLevelLabel(year);

  const questions: Question[] = useMemo(
    () => getPretestForYearLabel(year),
    [year]
  );

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<string | null>>(
    Array(questions.length).fill(null)
  );
  const [mab, setMab] = useState<{ tens: number; ones: number }>({
    tens: 0,
    ones: 0,
  });
  // Question ids the student tapped "I Don't Know" on (analytics-only).
  const [idkResponses, setIdkResponses] = useState<string[]>([]);
  // Save & resume gate + restored-snapshot flag.
  const [resumeReady, setResumeReady] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  // 85%+ pass celebration before routing to results.
  const [passCelebration, setPassCelebration] = useState<{
    score: number;
    total: number;
    nextYear: string | null;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const question = questions[index];
  const selected = answers[index];

  useEffect(() => {
    const studentId = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_STUDENT_KEY)?.trim() : null;
    const progress = readProgress();

    if (!studentId) {
      router.replace("/login");
      return;
    }

    if (isPlacementComplete(progress)) {
      router.replace("/levels");
      return;
    }

    if (progress?.year && progress.year !== year) {
      router.replace(`/pretest?year=${encodeURIComponent(progress.year)}`);
    }
  }, [router, year]);

  useEffect(() => {
    setMab({ tens: 0, ones: 0 });
  }, [index]);

  // ── Load any saved snapshot once; offer to resume rather than auto-restart ──
  useEffect(() => {
    const snapshot = loadPretestResume(year);
    if (pretestResumeHasProgress(snapshot)) {
      setShowResumePrompt(true);
    }
    setResumeReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  function resumeFromSnapshot() {
    const snapshot = loadPretestResume(year);
    if (snapshot) {
      const restored = [...Array(questions.length).fill(null)];
      snapshot.answers.forEach((a, i) => {
        if (i < restored.length) restored[i] = a;
      });
      setAnswers(restored);
      setIdkResponses(snapshot.idkResponses ?? []);
      setIndex(Math.min(snapshot.index, Math.max(0, questions.length - 1)));
    }
    setShowResumePrompt(false);
  }

  function restartAssessment() {
    clearPretestResume(year);
    setAnswers(Array(questions.length).fill(null));
    setIdkResponses([]);
    setIndex(0);
    setShowResumePrompt(false);
  }

  // ── Auto-save snapshot on every change (after the resume gate is resolved) ──
  useEffect(() => {
    if (!resumeReady || showResumePrompt) return;
    savePretestResume({
      year,
      index,
      answers,
      idkResponses,
      updatedAt: Date.now(),
    });
  }, [resumeReady, showResumePrompt, year, index, answers, idkResponses]);

  function choose(value: string) {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
  }

  function nextQuestion() {
    if (index < questions.length - 1) setIndex(index + 1);
  }

  function prevQuestion() {
    if (index > 0) setIndex(index - 1);
  }

  // "I Don't Know" — record the response, mark the question incorrect ("idk"),
  // then auto-advance (or finish if this is the last question).
  function answerIdk() {
    const next = [...answers];
    next[index] = "idk";
    setAnswers(next);
    if (question?.id) {
      setIdkResponses((prev) => (prev.includes(question.id) ? prev : [...prev, question.id]));
    }
    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      void finish(next);
    }
  }

  // ── Exit options — every path saves the snapshot first so nothing is lost ──
  function persistSnapshot() {
    savePretestResume({ year, index, answers, idkResponses, updatedAt: Date.now() });
  }
  function exitToHome() {
    persistSnapshot();
    router.push("/home");
  }
  function exitToLevels() {
    persistSnapshot();
    router.push("/levels");
  }
  async function exitLogout() {
    persistSnapshot();
    try {
      await supabase.auth.signOut();
    } catch {
      /* offline / already signed out — non-fatal */
    }
    clearActiveStudentSession();
    router.push("/login");
  }

  async function finish(finalAnswers?: Array<string | null>) {
    if (submitting) return;
    setSubmitting(true);
    const resolved = finalAnswers ?? answers;
    const score = resolved.reduce((acc, answer, i) => {
      const q = questions[i];
      if (!answer) return acc;
      if (q.answerIndex !== undefined && q.answer == null && q.correctAnswer == null) {
        const opt = (q.options ?? [])[q.answerIndex ?? 0];
        const correctLabel = typeof opt === "string" || typeof opt === "number" ? String(opt) : opt.label;
        return acc + (answer === correctLabel ? 1 : 0);
      }
      return acc + (isAssessmentAnswerCorrect(q, answer) ? 1 : 0);
    }, 0);

    const answerMap = questions.reduce<Record<string, string | undefined>>((acc, q, i) => {
      const answer = resolved[i];
      if (answer != null) acc[q.id] = answer;
      return acc;
    }, {});

    const studentId = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_STUDENT_KEY) : null;
    const profile = analyzeAssessmentResult({
      questions,
      answers: answerMap,
      yearLevel: Number(year.replace(/\D/g, "")) || 3,
      testType: "pre",
      passThreshold: PRETEST_PASS_THRESHOLD,
      studentId,
    });
    clearYearProgress(year);

    const prev = readProgress();
    const prevUnlocked = prev?.unlockedLegends ?? [];
    const nextYear = getNextYearLabel(year);
    const passed = profile.percentage >= PRETEST_PASS_THRESHOLD;
    const diagnosticRequiredWeeks = normalizeWeekList(profile.recommendedWeeks);
    const requiresFullPathway = !passed && profile.percentage < PRETEST_PASS_THRESHOLD;
    const requiredWeeks = passed
      ? []
      : requiresFullPathway || diagnosticRequiredWeeks.length === 0
        ? ALL_PROGRAM_WEEKS
        : diagnosticRequiredWeeks;
    const optionalWeeks = passed
      ? ALL_PROGRAM_WEEKS
      : requiresFullPathway
        ? []
        : getOptionalWeeks(requiredWeeks);

    let nextProgress: StudentProgress;

    if (passed) {
      nextProgress = {
        ...(prev ?? {
          year,
          scorePercent: 0,
          status: "ASSIGNED_PROGRAM" as const,
          unlockedLegends: [],
        }),
        year: nextYear ?? year,
        scorePercent: profile.percentage,
        status: "PASSED",
        placementComplete: !nextYear,
        assignedWeek: prev?.assignedWeek,
        assignedWeeksHistory: prev?.assignedWeeksHistory,
        requiredWeeks: [],
        optionalWeeks: ALL_PROGRAM_WEEKS,
        unlockedLegends: prevUnlocked,
        lastPreTestPercent: profile.percentage,
        lastPreTestProfile: profile,
      };
    } else {
      const assignedWeek = profile.assignedWeek ?? getLowestRecommendedWeek(profile.recommendedWeeks) ?? 1;
      nextProgress = {
        ...(prev ?? {
          year,
          scorePercent: 0,
          status: "ASSIGNED_PROGRAM" as const,
          unlockedLegends: [],
        }),
        year,
        scorePercent: profile.percentage,
        status: "ASSIGNED_PROGRAM",
        placementComplete: true,
        assignedWeek,
        requiredWeeks,
        optionalWeeks,
        unlockedLegends: prevUnlocked,
        lastPreTestPercent: profile.percentage,
        lastPreTestProfile: profile,
      };
    }

    writeProgress(nextProgress);

    if (studentId) {
      try {
        await saveNumberAssessment(studentId, year, "pretest", {
          correct_count: score,
          total_questions: questions.length,
          score_percent: profile.percentage,
          passed: nextProgress.status === "PASSED",
          placement_result: profile,
          question_results: [],
          completed_at: new Date().toISOString(),
        });
        await saveStudentProgressState(studentId, year, {
          pretest_score: profile.percentage,
          status: nextProgress.status === "PASSED" ? "PASSED" : "ASSIGNED_PROGRAM",
          week: nextProgress.assignedWeek ?? 1,
          placement_complete: nextProgress.placementComplete ?? false,
          assigned_week: nextProgress.assignedWeek ?? null,
          required_weeks: nextProgress.requiredWeeks ?? [],
          optional_weeks: nextProgress.optionalWeeks ?? [],
          unlocked_legends: nextProgress.unlockedLegends ?? [],
        });
      } catch (error) {
        console.warn("[Pretest] DB save failed:", error);
        window.alert("We couldn't save your pre-test result yet. Please try again.");
        setSubmitting(false);
        return;
      }
    }

    // Assessment complete — clear the resume snapshot so we don't re-offer it.
    clearPretestResume(year);

    // 85%+ → celebrate the level advancement before showing the full results.
    if (passed) {
      setPassCelebration({ score, total: questions.length, nextYear });
      return;
    }

    router.push(
      `/results?year=${encodeURIComponent(year)}&score=${score}&total=${questions.length}`
    );
  }

  function continueFromCelebration() {
    if (!passCelebration) return;
    router.push(
      `/results?year=${encodeURIComponent(year)}&score=${passCelebration.score}&total=${passCelebration.total}`
    );
  }

  const mabTotal = mab.tens * 10 + mab.ones;
  const mabHasSelection = mab.tens > 0 || mab.ones > 0;
  const isReady =
    question?.type === "mab"
      ? mabHasSelection
      : question?.type === "numeric"
        ? (selected ?? "").trim().length > 0
        : selected !== null;

  useEffect(() => {
    if (question?.type !== "mab") return;
    const next = [...answers];
    next[index] = mabHasSelection ? String(mabTotal) : null;
    setAnswers(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mabTotal, mabHasSelection, question?.type, index]);

  if (!questions.length || !question) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-800 rounded-3xl shadow-xl p-8 w-full max-w-xl text-center border border-slate-700/60">
          <h2 className="text-xl font-bold text-white mb-2">
            No questions found
          </h2>
          <p className="text-slate-400 mb-4">
            We couldn&apos;t find a pre-test for {studentLevelLabel}.
          </p>
          <button
            onClick={() => router.push("/home")}
            className="px-5 py-3 rounded-2xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 transition"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  /* Build question content based on type */
  let questionContent: React.ReactNode;

  if (question.type === "mab") {
    questionContent = (
      <MabPicker
        target={question.target ?? 0}
        maxTens={question.maxTens ?? 10}
        maxOnes={question.maxOnes ?? 10}
        value={mab}
        onChange={setMab}
      />
    );
  } else if (question.type === "numberLine") {
    questionContent = (
      <div className="mt-4">
        <div className="relative w-full h-20">
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-600 rounded" />
          <div className="absolute left-0 top-[55%] text-xs text-slate-400">
            {question.min}
          </div>
          <div className="absolute right-0 top-[55%] text-xs text-slate-400">
            {question.max}
          </div>

          {((question.options ?? []) as number[]).map((n) => {
            const qMin = question.min ?? 0;
            const qMax = question.max ?? 100;
            const pct = ((n - qMin) / (qMax - qMin)) * 100;
            const isSelected = selected === String(n);

            return (
              <button
                key={n}
                onClick={() => choose(String(n))}
                className={[
                  "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
                  "w-14 h-14 rounded-full border-2 font-extrabold transition",
                  isSelected
                    ? "border-teal-500 bg-teal-500/20 text-teal-300"
                    : "border-slate-500 bg-slate-700 hover:bg-slate-600 text-slate-300",
                ].join(" ")}
                style={{ left: `${pct}%` }}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="mt-3 text-sm text-slate-400">
          Tap the correct point on the line.
        </div>
      </div>
    );
  } else if (question.type === "groups") {
    questionContent = (
      <div className="grid gap-4">
        {((question.options ?? []) as Array<{ id: string; label: string; groups: number[] }>).map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => choose(opt.id)}
              className={[
                "w-full rounded-2xl border p-5 text-left transition",
                isSelected
                  ? "border-teal-500 bg-teal-500/10"
                  : "border-slate-600 bg-slate-700/50 hover:bg-slate-700",
              ].join(" ")}
            >
              <div className="text-lg font-extrabold text-white mb-3">
                {opt.label}
              </div>
              <GroupsVisual groups={opt.groups} />
            </button>
          );
        })}
      </div>
    );
  } else {
    questionContent = (
      <>
        {question.visual?.type === "dot_add" &&
          question.visual.leftTarget !== undefined &&
          question.visual.rightTarget !== undefined ? (
          <DotAddVisual
            leftTarget={question.visual.leftTarget}
            rightTarget={question.visual.rightTarget}
            maxDots={question.visual.maxDots ?? 10}
          />
        ) : question.visual?.type === "group_counters" &&
          question.visual.totalCounters !== undefined &&
          question.visual.groupSize !== undefined &&
          question.visual.selectTarget !== undefined &&
          !(question.options ?? []).some(
            (opt) => typeof opt === "object" && opt !== null && "groups" in opt && Boolean(opt.groups)
          ) ? (
          <GroupCountersVisual
            totalCounters={question.visual.totalCounters}
            groupSize={question.visual.groupSize}
            selectTarget={question.visual.selectTarget}
          />
        ) : null}
        <AssessmentQuestionCard
          question={question}
          value={selected}
          onChange={choose}
        />
      </>
    );
  }

  return (
    <>
      <ActiveLearningTracker context="pretest" />
      <AssessmentShell
        testType="Pre-Test"
        year={year}
        currentIndex={index}
        totalQuestions={questions.length}
        questionPrompt={question.prompt}
        questionContent={
          <div>
            <div className="flex justify-end mb-3">
              <ReadAloudBtn text={question.prompt} />
            </div>
            {questionContent}
          </div>
        }
        hasAnswer={isReady}
        isLast={index === questions.length - 1}
        submitted={submitting}
        onBack={prevQuestion}
        onNext={nextQuestion}
        onSubmit={() => finish()}
        onExit={exitToLevels}
        onIdk={answerIdk}
        onHome={exitToHome}
        onExitAssessment={exitToLevels}
        onLogout={exitLogout}
      />

      {/* ── Save & Resume gate ── */}
      {showResumePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-6">
          <div className="w-full max-w-md rounded-3xl border border-slate-700/60 bg-slate-900 p-8 text-center shadow-2xl">
            <div className="text-5xl mb-4">📌</div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Welcome back!</h2>
            <p className="text-slate-400 mb-6">
              You started the {studentLevelLabel} Pre-Test earlier. Want to pick up right where you left off?
            </p>
            <div className="space-y-3">
              <button
                onClick={resumeFromSnapshot}
                className="w-full py-3.5 rounded-2xl font-extrabold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 transition active:scale-[0.98]"
              >
                ▶ Resume Pre-Test
              </button>
              <button
                onClick={restartAssessment}
                className="w-full py-3 rounded-2xl font-semibold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition active:scale-[0.98]"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 85%+ Pass celebration ── */}
      {passCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 overflow-hidden">
          <PassConfetti />
          <div className="relative z-10 w-full max-w-lg rounded-3xl border border-teal-400/30 bg-gradient-to-b from-slate-900 to-slate-950 p-10 text-center shadow-[0_20px_70px_-20px_rgba(20,184,166,0.6)]">
            <div className="text-7xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Amazing Work!</h2>
            <p className="text-slate-300 mb-2 text-lg">
              You already know most of {studentLevelLabel}.
            </p>
            <div className="my-6 inline-flex flex-col items-center gap-1 px-6 py-4 rounded-2xl border border-teal-400/30 bg-teal-500/10">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-teal-300/80">
                You have unlocked
              </span>
              <span className="text-xl font-extrabold text-teal-200">
                {passCelebration.nextYear
                  ? `${formatStudentLevelLabel(passCelebration.nextYear)} Pre-Test`
                  : "The Tower of Knowledge"}
              </span>
            </div>
            <div className="mb-6 text-sm text-slate-400">
              You scored {Math.round((passCelebration.score / passCelebration.total) * 100)}% — that&apos;s a pass!
            </div>
            <button
              onClick={continueFromCelebration}
              className="w-full py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 transition active:scale-[0.98]"
              style={{ boxShadow: "0 10px 30px -8px rgba(16,185,129,0.5)" }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ── lightweight confetti for the pass celebration ── */
function PassConfetti() {
  const pieces = Array.from({ length: 40 });
  const colors = ["#2dd4bf", "#34d399", "#fcd34d", "#f472b6", "#38bdf8"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map((_, i) => {
        const left = (i * 53) % 100;
        const delay = (i % 10) * 0.18;
        const dur = 2.6 + (i % 5) * 0.5;
        const color = colors[i % colors.length];
        const size = 6 + (i % 4) * 3;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              top: "-24px",
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: color,
              borderRadius: i % 2 === 0 ? "2px" : "50%",
              animation: `confettiFall ${dur}s linear ${delay}s infinite`,
              opacity: 0.9,
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(540deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
