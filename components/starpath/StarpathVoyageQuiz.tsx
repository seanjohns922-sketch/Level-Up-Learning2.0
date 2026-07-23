"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Gem,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { REALM_QUIZ_THEMES, RealmWeeklyQuizChrome } from "@/components/quiz/RealmWeeklyQuizChrome";
import { TaskRenderer } from "@/components/TaskRenderer";
import { weeklyQuizPassed, ASSESSMENT_THRESHOLDS } from "@/lib/assessment-rules";
import { writeStarpathDemoJourney } from "@/lib/starpath-demo-state";
import { saveNumberWeeklyQuizAttempt } from "@/lib/student-progress-sync";
import { getActiveStudentIdentity } from "@/lib/studentIdentity";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

export type StarpathVoyageQuizMeta = {
  level: RealmLevelId;
  levelLabel: string;
  week: number;
  title: string;
  coverage: string;
  lessonTitles: [string, string, string];
  weekHref: string;
};

type QuizPhase = "home" | "quiz" | "results" | "review";

type SavedVoyageQuiz = {
  version: 2;
  order: number[];
  index: number;
  answers: Record<string, boolean>;
};

const QUIZ_XP = 20;

function taskFeedback(task: PracticeTask) {
  return (task as { feedback?: { correct: string; wrong: string } }).feedback;
}

function taskPrompt(task: PracticeTask) {
  return "prompt" in task && typeof task.prompt === "string" ? task.prompt : "Starpath quiz question";
}

function lessonOrder(length: number) {
  return Array.from({ length }, (_, index) => index);
}

function newCompletionKey() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export default function StarpathVoyageQuiz({
  quiz,
  tasks,
}: {
  quiz: StarpathVoyageQuizMeta;
  tasks: PracticeTask[];
}) {
  const router = useRouter();
  const theme = REALM_QUIZ_THEMES.space;
  const levelNumber = quiz.level === "Prep" ? 0 : Number(quiz.level.replace(/\D/g, "")) || 0;
  const storageKey = `starpath-voyage-quiz:v2:${getActiveStudentIdentity().studentId ?? "demo"}:${quiz.level}:${quiz.week}`;

  const [phase, setPhase] = useState<QuizPhase>("home");
  const [order, setOrder] = useState<number[]>(() => tasks.map((_, index) => index));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [nonce, setNonce] = useState(0);
  const [hasResume, setHasResume] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [saving, setSaving] = useState(false);

  const orderedTasks = useMemo(
    () => order.map((taskIndex) => tasks[taskIndex]).filter((task): task is PracticeTask => Boolean(task)),
    [order, tasks]
  );
  const task = orderedTasks[index];
  const currentAnswer = answers[String(index)];
  const answeredCount = Object.keys(answers).length;
  const total = orderedTasks.length;
  const percent = total > 0 ? Math.round((finalScore / total) * 100) : 0;
  const passed = weeklyQuizPassed(percent);
  const lessonScores = [0, 1, 2].map((lessonIndex) => {
    const start = lessonIndex * 5;
    const score = Array.from({ length: 5 }, (_, offset) => answers[String(start + offset)])
      .filter((answer) => answer === true).length;
    return {
      lesson: lessonIndex + 1,
      title: quiz.lessonTitles[lessonIndex],
      score,
    };
  });
  const weakestScore = Math.min(...lessonScores.map((result) => result.score));
  const weakestLessons = lessonScores.filter((result) => result.score === weakestScore);
  const wrongIndexes = orderedTasks
    .map((_, questionIndex) => questionIndex)
    .filter((questionIndex) => answers[String(questionIndex)] === false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setOrder(lessonOrder(tasks.length));
        return;
      }
      const saved = JSON.parse(raw) as SavedVoyageQuiz;
      const validOrder =
        saved.version === 2 &&
        saved.order.length === tasks.length &&
        new Set(saved.order).size === tasks.length &&
        saved.order.every((taskIndex) => taskIndex >= 0 && taskIndex < tasks.length);
      if (!validOrder) {
        localStorage.removeItem(storageKey);
        setOrder(lessonOrder(tasks.length));
        return;
      }
      setOrder(saved.order);
      setIndex(Math.min(saved.index, tasks.length - 1));
      setAnswers(saved.answers);
      setHasResume(Object.keys(saved.answers).length > 0);
    } catch {
      localStorage.removeItem(storageKey);
      setOrder(lessonOrder(tasks.length));
    }
  }, [storageKey, tasks.length]);

  useEffect(() => {
    if (phase !== "quiz") return;
    const saved: SavedVoyageQuiz = { version: 2, order, index, answers };
    localStorage.setItem(storageKey, JSON.stringify(saved));
  }, [answers, index, order, phase, storageKey]);

  function answer(ok: boolean) {
    if (!task || currentAnswer !== undefined) return;
    setAnswers((current) => ({ ...current, [String(index)]: ok }));
  }

  function changeAnswer() {
    setAnswers((current) => {
      const next = { ...current };
      delete next[String(index)];
      return next;
    });
    setNonce((value) => value + 1);
  }

  function beginQuiz() {
    if (!hasResume) {
      setOrder(lessonOrder(tasks.length));
      setIndex(0);
      setAnswers({});
      localStorage.removeItem(storageKey);
    }
    setPhase("quiz");
  }

  async function finishQuiz() {
    if (saving || answeredCount !== total) return;
    setSaving(true);
    const score = Object.values(answers).filter(Boolean).length;
    const finalPercent = total > 0 ? Math.round((score / total) * 100) : 0;
    const studentId = getActiveStudentIdentity().studentId;

    try {
      writeStarpathDemoJourney(quiz.level, { currentWeek: quiz.week, currentLesson: 3 });
      if (studentId) {
        await saveNumberWeeklyQuizAttempt(
          studentId,
          quiz.level,
          quiz.week,
          { percent: finalPercent, score, total },
          newCompletionKey(),
          "space"
        );
      }
      localStorage.removeItem(storageKey);
      setHasResume(false);
      setFinalScore(score);
      setPhase("results");
    } catch (error) {
      console.warn("[Starpath] Voyage Quiz persist failed", error);
      window.alert("We couldn't save this quiz yet. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function restart() {
    setOrder(lessonOrder(tasks.length));
    setAnswers({});
    setIndex(0);
    setNonce((value) => value + 1);
    setFinalScore(0);
    setHasResume(false);
    localStorage.removeItem(storageKey);
    setPhase("quiz");
  }

  return (
    <main className="relative isolate min-h-screen px-3 py-4 text-white sm:px-6">
      <div className="mx-auto w-full max-w-[1200px]">
        <RealmWeeklyQuizChrome
          realm="space"
          levelNumber={levelNumber}
          levelLabel={quiz.levelLabel}
          year={quiz.level}
          week={quiz.week}
          questionCount={total || 15}
          focus={quiz.coverage}
          demoMode
          onBack={() => router.push(quiz.weekHref)}
        />

        <section
          className="rounded-b-lg border px-4 py-6 text-slate-950 shadow-[0_24px_90px_rgba(0,0,0,0.42)] sm:px-7"
          style={{ background: theme.workspaceBg, borderColor: theme.panelBorder }}
        >
          {phase === "home" ? (
            <div className="mx-auto max-w-4xl">
              <div className="overflow-hidden rounded-lg border border-violet-300 bg-[#111735] shadow-xl">
                <div className="relative px-6 py-9 text-white sm:px-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.38),transparent_34%),radial-gradient(circle_at_82%_28%,rgba(34,211,238,0.28),transparent_30%)]" />
                  <div className="relative">
                    <div className="font-mono text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                      Starpath Voyage Quiz
                    </div>
                    <h1 className="mt-3 text-3xl font-black sm:text-5xl">{quiz.title}</h1>
                    <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-violet-100">
                      Great work completing this week&apos;s missions! It&apos;s time to show what you discovered across all three missions.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-white/10 bg-[#0b1029] p-5 sm:grid-cols-4 sm:p-7">
                  {[
                    { icon: BookOpen, value: "15 questions", label: "Five from each mission" },
                    { icon: Clock3, value: "8–10 minutes", label: "Work at your own pace" },
                    { icon: Trophy, value: "80% pass mark", label: "Show your mastery" },
                    { icon: Gem, value: `${QUIZ_XP} XP`, label: "Plus chain and gems" },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={value} className="rounded-lg border border-white/10 bg-white/5 p-4 text-white">
                      <Icon className="h-6 w-6 text-cyan-300" />
                      <div className="mt-3 font-black">{value}</div>
                      <div className="mt-1 text-sm text-violet-200">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={beginQuiz}
                className="mx-auto mt-6 flex min-h-14 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-8 text-lg font-black text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
              >
                <Sparkles className="h-5 w-5" />
                {hasResume ? "Resume Quiz" : "Begin Quiz"}
              </button>
            </div>
          ) : null}

          {phase === "quiz" ? (
            <div className="mx-auto max-w-3xl">
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="font-mono text-xs font-black uppercase tracking-[0.16em] text-violet-800">
                  Question {index + 1} of {total}
                </span>
                <span className="font-mono text-xs font-black uppercase tracking-[0.16em] text-cyan-700">
                  {answeredCount} answered
                </span>
              </div>
              <div className="mb-6 h-2 overflow-hidden rounded-full bg-violet-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${total ? (answeredCount / total) * 100 : 0}%` }}
                />
              </div>

              {task ? (
                <div className={currentAnswer !== undefined ? "pointer-events-none opacity-75" : ""}>
                  <TaskRenderer
                    key={`${index}-${nonce}`}
                    task={task}
                    taskNonce={nonce}
                    assessmentMode
                    callbacks={{
                      markCorrect: () => answer(true),
                      markCorrectSoft: () => answer(true),
                      markWrong: () => answer(false),
                    }}
                  />
                </div>
              ) : null}

              {currentAnswer !== undefined ? (
                <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border-2 border-cyan-200 bg-cyan-50 px-4 py-3">
                  <div className="flex items-center gap-2 font-bold text-cyan-950">
                    <Check className="h-5 w-5 text-cyan-600" />
                    Answer saved
                  </div>
                  <button
                    type="button"
                    onClick={changeAnswer}
                    className="rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-black text-violet-800 transition hover:bg-violet-50"
                  >
                    Change Answer
                  </button>
                </div>
              ) : null}

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => {
                    setIndex((value) => Math.max(0, value - 1));
                    setNonce((value) => value + 1);
                  }}
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg border-2 border-violet-300 bg-white px-5 font-black text-violet-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-5 w-5" /> Back
                </button>

                {index < total - 1 ? (
                  <button
                    type="button"
                    disabled={currentAnswer === undefined}
                    onClick={() => {
                      setIndex((value) => Math.min(total - 1, value + 1));
                      setNonce((value) => value + 1);
                    }}
                    className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-6 font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next <ArrowRight className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={answeredCount !== total || saving}
                    onClick={finishQuiz}
                    className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-6 font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving ? "Saving…" : "Finish Quiz"} <Check className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {phase === "results" ? (
            <div className="mx-auto max-w-xl text-center">
              <div className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-violet-700">
                {quiz.title}
              </div>
              <div
                className={[
                  "mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full text-white shadow-lg",
                  passed ? "bg-gradient-to-br from-violet-600 to-cyan-500" : "bg-gradient-to-br from-slate-500 to-slate-700",
                ].join(" ")}
              >
                <span className="text-3xl font-black">{percent}%</span>
              </div>
              <h2 className="mt-5 text-3xl font-black text-slate-950">
                {passed ? "Voyage complete!" : "Keep exploring!"}
              </h2>
              <p className="mt-2 text-base font-semibold text-slate-600">
                You answered {finalScore}/{total} correctly.
                {passed
                  ? ` You passed the ${ASSESSMENT_THRESHOLDS.weeklyQuizPassPercent}% mark and earned ${QUIZ_XP} XP.`
                  : ` You need ${ASSESSMENT_THRESHOLDS.weeklyQuizPassPercent}% to pass.`}
              </p>
              <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
                {lessonScores.map((result) => (
                  <div
                    key={result.lesson}
                    className={[
                      "rounded-lg border-2 p-4",
                      result.score >= 4
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-amber-200 bg-amber-50",
                    ].join(" ")}
                  >
                    <div className="font-mono text-xs font-black uppercase tracking-[0.16em] text-violet-700">
                      Mission {result.lesson}
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-950">{result.score}/5</div>
                    <div className="mt-1 text-sm font-bold text-slate-700">{result.title}</div>
                  </div>
                ))}
              </div>
              {wrongIndexes.length ? (
                <div className="mt-5 rounded-lg border-2 border-violet-200 bg-violet-50 p-4 text-left">
                  <div className="font-mono text-xs font-black uppercase tracking-[0.16em] text-violet-700">
                    Where to practise
                  </div>
                  <p className="mt-2 font-bold text-slate-900">
                    Return to {weakestLessons
                      .map((result) => `Mission ${result.lesson}: ${result.title}`)
                      .join(" and ")} for more practice.
                  </p>
                </div>
              ) : null}
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={restart}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 border-violet-300 bg-white px-6 text-base font-black text-violet-800"
                >
                  <RotateCcw className="h-5 w-5" /> Try Again
                </button>
                {wrongIndexes.length ? (
                  <button
                    type="button"
                    onClick={() => setPhase("review")}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-violet-700 px-6 text-base font-black text-white"
                  >
                    Review Answers <BookOpen className="h-5 w-5" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => router.push(quiz.weekHref)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-6 text-base font-black text-white shadow-lg"
                >
                  Back to Week {quiz.week} <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : null}

          {phase === "review" ? (
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <div className="font-mono text-xs font-black uppercase tracking-[0.2em] text-violet-700">
                  Quiz Review
                </div>
                <h2 className="mt-2 text-3xl font-black text-slate-950">Questions to revisit</h2>
              </div>
              <div className="mt-6 space-y-3">
                {wrongIndexes.map((questionIndex) => {
                  const reviewTask = orderedTasks[questionIndex]!;
                  return (
                    <div key={questionIndex} className="rounded-lg border-2 border-rose-200 bg-rose-50 p-4">
                      <div className="font-mono text-xs font-black uppercase tracking-[0.16em] text-rose-700">
                        Question {questionIndex + 1}
                      </div>
                      <div className="mt-2 text-lg font-black text-slate-950">{taskPrompt(reviewTask)}</div>
                      <div className="mt-2 font-semibold text-rose-900">
                        {taskFeedback(reviewTask)?.wrong ?? "Review this question and try the quiz again."}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setPhase("results")}
                className="mx-auto mt-6 flex min-h-12 items-center gap-2 rounded-lg border-2 border-violet-300 bg-white px-6 font-black text-violet-800"
              >
                <ArrowLeft className="h-5 w-5" /> Back to Results
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
