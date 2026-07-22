"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Pin, PartyPopper } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { getPretestForYearLabel } from "@/data/assessments/api";
import type { Question } from "@/data/assessments/pretests";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import AssessmentQuestionCard from "@/components/assessment/AssessmentQuestionCard";
import AssessmentShell from "@/components/assessment/AssessmentShell";
import { MeasurelandsAssessmentTask } from "@/components/assessment/MeasurelandsAssessmentTask";
import type { MistakeReviewItem } from "@/components/review/MistakeReviewPanel";
import { ActiveLearningTracker } from "@/components/student/ActiveLearningTracker";
import { analyzeAssessmentResult, isAssessmentAnswerCorrect } from "@/data/assessments/analysis";
import { ACTIVE_STUDENT_KEY, isPlacementComplete, readProgress, type StudentProgress } from "@/data/progress";
import { clearYearProgress, getOptionalWeeks, getProgramWeeks, normalizeWeekList } from "@/lib/program-progress";
import { restoreStudentStateFromServer, saveRealmAssessment, StudentRestoreSupersededError } from "@/lib/student-progress-sync";
import { ASSESSMENT_THRESHOLDS, pretestPathwayForPercent } from "@/lib/assessment-rules";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { formatStudentLevelLabel } from "@/lib/studentLevelLabel";
import { getRealmTheme } from "@/lib/useRealmTheme";
import {
  clearPretestResume,
  clearCompletionId,
  getOrCreateCompletionId,
  loadPretestResume,
  pretestResumeHasProgress,
  savePretestResume,
} from "@/lib/resume-state";
import { clearActiveStudentSession } from "@/lib/studentIdentity";
import { supabase } from "@/lib/supabase";
import { saveAssessmentReviewState } from "@/lib/assessment-review-state";

const PRETEST_PASS_THRESHOLD = ASSESSMENT_THRESHOLDS.pretestPassPercent;
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

function isPretestResponseCorrect(question: Question, answer: string | null | undefined): boolean {
  if (!answer) return false;
  if (question.answerIndex !== undefined && question.answer == null && question.correctAnswer == null) {
    const option = (question.options ?? [])[question.answerIndex];
    const correctLabel = typeof option === "string" || typeof option === "number" ? String(option) : option?.label;
    return answer === correctLabel;
  }
  return isAssessmentAnswerCorrect(question, answer);
}

function buildPretestReviewItems(
  questions: Question[],
  answers: Array<string | null>
): MistakeReviewItem[] {
  return questions.flatMap((question, index) => {
    if (isPretestResponseCorrect(question, answers[index])) return [];
    return [{
      id: question.id,
      questionNumber: index + 1,
      prompt: question.prompt,
      week: question.linkedWeeks?.[0] ?? null,
      lesson: question.linkedLessons?.[0] ?? null,
      lessonTitle: question.skillLabel ?? null,
      skillLabel: question.skillLabel ?? null,
      explanation: "You will learn this during your adventure.",
    }];
  });
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
  const realmId = searchParams.get("realm_id") ?? "number";
  if (realmId !== "number" && realmId !== "measurement") {
    throw new Error(`Unsupported pre-test realm: ${realmId}`);
  }
  const progressRealmId = realmId === "measurement" ? "measurement" : "number";
  const theme = getRealmTheme(realmId);
  const studentLevelLabel = formatStudentLevelLabel(year);

  useEffect(() => {
    if (year === "Prep") {
      router.replace(realmId === "measurement" ? "/measurelands" : "/home");
    }
  }, [realmId, router, year]);

  const questions: Question[] = useMemo(
    () => getPretestForYearLabel(year, progressRealmId),
    [year, progressRealmId]
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
  const [canonicalProgress, setCanonicalProgress] = useState<StudentProgress | null>(null);
  const [restoreState, setRestoreState] = useState<"loading" | "ready" | "error">(
    isDemoPreviewMode() ? "ready" : "loading"
  );
  const [restoreError, setRestoreError] = useState("");

  const question = questions[index];
  const selected = answers[index];

  useEffect(() => {
    const studentId = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_STUDENT_KEY)?.trim() : null;
    if (!studentId) {
      router.replace("/login");
      return;
    }
    if (isDemoPreviewMode()) {
      setCanonicalProgress(readProgress(progressRealmId));
      return;
    }
    let cancelled = false;
    void restoreStudentStateFromServer(studentId, progressRealmId)
      .then((restored) => {
        if (cancelled) return;
        const progress = restored.progress;
        if (!progress) {
          setRestoreError("Your placement is not ready. Ask your teacher to check your starting level.");
          setRestoreState("error");
          return;
        }
        setCanonicalProgress(progress);
        setRestoreState("ready");
        if (isPlacementComplete(progress)) {
          router.replace(progressRealmId === "measurement" ? "/measurelands" : "/levels");
        } else if (progress.year !== year) {
          router.replace(`/pretest?year=${encodeURIComponent(progress.year)}&realm_id=${encodeURIComponent(progressRealmId)}`);
        }
      })
      .catch((error) => {
        if (cancelled || error instanceof StudentRestoreSupersededError) return;
        console.warn("[Pretest] Canonical restore failed", error);
        setRestoreError("We could not load your saved placement. Check your connection and retry.");
        setRestoreState("error");
      });
    return () => { cancelled = true; };
  }, [progressRealmId, router, year]);

  useEffect(() => {
    setMab({ tens: 0, ones: 0 });
  }, [index]);

  // ── Load any saved snapshot once; offer to resume rather than auto-restart ──
  useEffect(() => {
    const snapshot = loadPretestResume(year, progressRealmId);
    if (pretestResumeHasProgress(snapshot)) {
      setShowResumePrompt(true);
    }
    setResumeReady(true);
  }, [progressRealmId, year]);

  function resumeFromSnapshot() {
    const snapshot = loadPretestResume(year, progressRealmId);
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
    clearPretestResume(year, progressRealmId);
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
      realmId: progressRealmId,
      index,
      answers,
      idkResponses,
      updatedAt: Date.now(),
    });
  }, [resumeReady, showResumePrompt, year, progressRealmId, index, answers, idkResponses]);

  function choose(value: string) {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
    if (question?.id) {
      setIdkResponses((prev) => prev.filter((questionId) => questionId !== question.id));
    }
  }

  function clearCurrentAnswer() {
    const next = [...answers];
    next[index] = null;
    setAnswers(next);
    if (question?.id) {
      setIdkResponses((prev) => prev.filter((questionId) => questionId !== question.id));
    }
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
    savePretestResume({ year, realmId: progressRealmId, index, answers, idkResponses, updatedAt: Date.now() });
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
    clearActiveStudentSession();
    try {
      await supabase.auth.signOut();
    } catch {
      /* offline / already signed out — non-fatal */
    }
    router.push("/login");
  }

  async function finish(finalAnswers?: Array<string | null>) {
    if (submitting) return;
    setSubmitting(true);
    const resolved = finalAnswers ?? answers;
    const score = resolved.reduce((acc, answer, i) => {
      const q = questions[i];
      return acc + (isPretestResponseCorrect(q, answer) ? 1 : 0);
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
    const prev = canonicalProgress;
    const prevUnlocked = prev?.unlockedLegends ?? [];
    const nextYear = getNextYearLabel(year);
    const passed = profile.percentage >= PRETEST_PASS_THRESHOLD;
    const diagnosticRequiredWeeks = normalizeWeekList(profile.recommendedWeeks, progressRealmId);
    const requiresFullPathway = pretestPathwayForPercent(profile.percentage) === "full";
    // Full-pathway weeks are realm-specific (Measurelands = 8, Number = 12).
    const allProgramWeeks = getProgramWeeks(progressRealmId);
    const requiredWeeks = passed
      ? []
      : requiresFullPathway || diagnosticRequiredWeeks.length === 0
        ? allProgramWeeks
        : diagnosticRequiredWeeks;
    const optionalWeeks = passed
      ? allProgramWeeks
      : requiresFullPathway
        ? []
        : getOptionalWeeks(requiredWeeks, progressRealmId);

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
        optionalWeeks: allProgramWeeks,
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

    try {
      if (!studentId) throw new Error("No active student session");
      const assessmentCompletionKey = `pretest:${progressRealmId}:${year}`;
      const completionId = getOrCreateCompletionId(assessmentCompletionKey);
      const progressPayload = {
        pretest_score: profile.percentage,
        status: nextProgress.status === "PASSED" ? "PASSED" : "ASSIGNED_PROGRAM",
        current_week: nextProgress.assignedWeek ?? 1,
        placement_complete: nextProgress.placementComplete ?? false,
        assigned_week: nextProgress.assignedWeek ?? null,
        required_weeks: nextProgress.requiredWeeks ?? [],
        optional_weeks: nextProgress.optionalWeeks ?? [],
        unlocked_legends: nextProgress.unlockedLegends ?? [],
        next_working_level: passed ? nextYear : null,
      };
      await saveRealmAssessment(studentId, year, "pretest", {
          correct_count: score,
          total_questions: questions.length,
          score_percent: profile.percentage,
          passed: nextProgress.status === "PASSED",
          placement_result: profile,
          question_results: [],
          completed_at: new Date().toISOString(),
        }, completionId, progressPayload, progressRealmId);
      const restored = await restoreStudentStateFromServer(studentId, progressRealmId);
      if (!restored.progress) throw new Error("Saved pre-test did not produce canonical progress");
      setCanonicalProgress(restored.progress);
      clearCompletionId(assessmentCompletionKey);
    } catch (error) {
      console.warn("[Pretest] DB save failed:", error);
      window.alert("We couldn't save your pre-test result yet. Please try again.");
      setSubmitting(false);
      return;
    }

    clearYearProgress(year, progressRealmId);
    // Assessment complete — clear the resume snapshot so we don't re-offer it.
    saveAssessmentReviewState({
      year,
      realmId: progressRealmId,
      mode: "pretest",
      items: buildPretestReviewItems(questions, resolved),
    });
    clearPretestResume(year, progressRealmId);

    // 85%+ → celebrate the level advancement before showing the full results.
    if (passed) {
      setPassCelebration({ score, total: questions.length, nextYear });
      return;
    }

    router.push(
      `/results?year=${encodeURIComponent(year)}&score=${score}&total=${questions.length}${realmId ? `&realm_id=${encodeURIComponent(realmId)}` : ""}`
    );
  }

  function continueFromCelebration() {
    if (!passCelebration) return;
    router.push(
      `/results?year=${encodeURIComponent(year)}&score=${passCelebration.score}&total=${passCelebration.total}${realmId ? `&realm_id=${encodeURIComponent(realmId)}` : ""}`
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

  const isMeasurelandsTask =
    question?.type === "measurelandsTask" && Boolean(question.practiceTask);

  useEffect(() => {
    if (question?.type !== "mab") return;
    const next = [...answers];
    next[index] = mabHasSelection ? String(mabTotal) : null;
    setAnswers(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mabTotal, mabHasSelection, question?.type, index]);

  if (year === "Prep") {
    return null;
  }

  if (restoreState !== "ready") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-center">
        <div>
          <p className="font-bold text-slate-200">{restoreState === "loading" ? "Loading your placement..." : restoreError}</p>
          {restoreState === "error" ? <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-teal-500 px-5 py-3 font-bold text-slate-950">Retry</button> : null}
        </div>
      </main>
    );
  }

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
            className="px-5 py-3 rounded-2xl font-bold text-white transition" style={{ background: theme.ctaGradientCss }}
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  /* Build question content based on type */
  let questionContent: React.ReactNode;

  if (isMeasurelandsTask && question.practiceTask) {
    questionContent = (
      <MeasurelandsAssessmentTask
        key={question.id}
        questionId={question.id}
        task={question.practiceTask}
        value={selected ?? ""}
        correctToken={question.correctAnswer ?? "__measurelands_task_correct__"}
        onRecord={choose}
        onClear={clearCurrentAnswer}
      />
    );
  } else if (question.type === "mab") {
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
          realmId={realmId}
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
        questionContent={isMeasurelandsTask ? questionContent :
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
        wideContent={isMeasurelandsTask}
        hidePrompt={isMeasurelandsTask}
        realmId={realmId}
      />

      {/* ── Save & Resume gate ── */}
      {showResumePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-6">
          <div className="w-full max-w-md rounded-3xl border border-slate-700/60 bg-slate-900 p-8 text-center shadow-2xl">
            <div className="mb-4 flex justify-center"><Pin className="h-12 w-12 text-slate-300" /></div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Welcome back!</h2>
            <p className="text-slate-400 mb-6">
              You started the {studentLevelLabel} Pre-Test earlier. Want to pick up right where you left off?
            </p>
            <div className="space-y-3">
              <button
                onClick={resumeFromSnapshot}
                className="w-full py-3.5 rounded-2xl font-extrabold text-white transition active:scale-[0.98]"
                style={{ background: theme.ctaGradientCss }}
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
          <PassConfetti theme={theme} />
          <div
            className="relative z-10 w-full max-w-lg rounded-3xl border bg-gradient-to-b from-slate-900 to-slate-950 p-10 text-center"
            style={{
              borderColor: theme.borderRing,
              boxShadow: theme.isMeasurement
                ? "0 20px 70px -20px rgba(184,137,58,0.55)"
                : "0 20px 70px -20px rgba(20,184,166,0.6)",
            }}
          >
            <div className="mb-4 flex justify-center animate-bounce"><PartyPopper className="h-16 w-16 text-white" /></div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Amazing Work!</h2>
            <p className="text-slate-300 mb-2 text-lg">
              You already know most of {studentLevelLabel}.
            </p>
            <div
              className="my-6 inline-flex flex-col items-center gap-1 px-6 py-4 rounded-2xl border"
              style={{ borderColor: theme.borderRing, background: theme.surfaceTint }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-[0.25em]"
                style={{ color: theme.accentTextSoft }}
              >
                You have unlocked
              </span>
              <span className="text-xl font-extrabold" style={{ color: theme.accentText }}>
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
              className="w-full py-4 rounded-2xl font-extrabold text-white transition active:scale-[0.98]"
              style={{ background: theme.ctaGradientCss, boxShadow: theme.ctaShadow }}
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
function PassConfetti({ theme }: { theme: ReturnType<typeof getRealmTheme> }) {
  const pieces = Array.from({ length: 40 });
  const colors = theme.confetti;
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
