"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { REALM_QUIZ_THEMES, RealmWeeklyQuizChrome } from "@/components/quiz/RealmWeeklyQuizChrome";
import { TaskRenderer } from "@/components/TaskRenderer";
import { weeklyQuizPassed, ASSESSMENT_THRESHOLDS } from "@/lib/assessment-rules";
import { writeStarpathDemoJourney } from "@/lib/starpath-demo-state";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

export type StarpathVoyageQuizMeta = {
  level: RealmLevelId;
  levelLabel: string;
  week: number;
  title: string;
  coverage: string;
  weekHref: string;
};

const QUIZ_XP = 20;

function taskFeedback(task: PracticeTask) {
  return (task as { feedback?: { correct: string; wrong: string } }).feedback;
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
  const total = tasks.length;

  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [nonce, setNonce] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [done, setDone] = useState(false);
  const lockRef = useRef(false);

  const task = tasks[index];

  function answer(ok: boolean) {
    if (lockRef.current || !task) return;
    lockRef.current = true;
    const fb = taskFeedback(task);
    setFeedback({ ok, text: ok ? fb?.correct ?? "Correct!" : fb?.wrong ?? "Not quite." });
    const nextCorrect = correct + (ok ? 1 : 0);
    if (ok) setCorrect(nextCorrect);
    window.setTimeout(() => {
      setFeedback(null);
      lockRef.current = false;
      if (index + 1 >= total) {
        setDone(true);
        writeStarpathDemoJourney(quiz.level, { currentWeek: quiz.week, currentLesson: 3 });
      } else {
        setIndex((value) => value + 1);
        setNonce((value) => value + 1);
      }
    }, 1150);
  }

  function restart() {
    lockRef.current = false;
    setFeedback(null);
    setCorrect(0);
    setIndex(0);
    setNonce((value) => value + 1);
    setDone(false);
  }

  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = weeklyQuizPassed(percent);

  return (
    <main className="relative isolate min-h-screen px-3 py-4 text-white sm:px-6">
      <div className="mx-auto w-full max-w-[1200px]">
        <RealmWeeklyQuizChrome
          realm="space"
          levelNumber={levelNumber}
          levelLabel={quiz.levelLabel}
          year={quiz.level}
          week={quiz.week}
          questionCount={total}
          focus={quiz.coverage}
          demoMode
          onBack={() => router.push(quiz.weekHref)}
        />

        <section
          className="rounded-b-lg border px-4 py-6 text-slate-950 shadow-[0_24px_90px_rgba(0,0,0,0.42)] sm:px-7"
          style={{ background: theme.workspaceBg, borderColor: theme.panelBorder }}
        >
          {!done ? (
            <div className="mx-auto max-w-3xl">
              {/* Progress */}
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="font-mono text-xs font-black uppercase tracking-[0.16em] text-violet-800">
                  Question {index + 1} of {total}
                </span>
                <span className="font-mono text-xs font-black uppercase tracking-[0.16em] text-cyan-700">
                  Correct so far: {correct}
                </span>
              </div>
              <div className="mb-6 h-2 overflow-hidden rounded-full bg-violet-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${(index / total) * 100}%` }}
                />
              </div>

              {task ? (
                <TaskRenderer
                  key={nonce}
                  task={task}
                  taskNonce={nonce}
                  assessmentMode
                  callbacks={{
                    markCorrect: () => answer(true),
                    markCorrectSoft: () => answer(true),
                    markWrong: () => answer(false),
                  }}
                />
              ) : null}

              {feedback ? (
                <div
                  className={[
                    "mt-5 flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-base font-bold",
                    feedback.ok
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border-rose-300 bg-rose-50 text-rose-900",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white",
                      feedback.ok ? "bg-emerald-500" : "bg-rose-500",
                    ].join(" ")}
                  >
                    {feedback.ok ? <Check className="h-5 w-5" strokeWidth={3} /> : <X className="h-5 w-5" strokeWidth={3} />}
                  </span>
                  <span>{feedback.text}</span>
                </div>
              ) : null}
            </div>
          ) : (
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
                You answered {correct} of {total} correctly.
                {passed
                  ? ` That passes the ${ASSESSMENT_THRESHOLDS.weeklyQuizPassPercent}% mark — you earned ${QUIZ_XP} XP.`
                  : ` You need ${ASSESSMENT_THRESHOLDS.weeklyQuizPassPercent}% to pass. Try again to earn your XP.`}
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={restart}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-violet-300 bg-white px-6 text-base font-black text-violet-800 transition hover:bg-violet-50 active:scale-[0.98]"
                >
                  <RotateCcw className="h-5 w-5" /> Try Again
                </button>
                <button
                  type="button"
                  onClick={() => router.push(quiz.weekHref)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 text-base font-black text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
                >
                  Back to Week {quiz.week} <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
