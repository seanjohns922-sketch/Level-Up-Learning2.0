"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PracticeTask, Difficulty } from "@/data/activities/year1/practice-task";
import { getDifficultyFromTime } from "@/data/activities/year1/practice-task";
import { TaskRenderer } from "@/components/TaskRenderer";
import { speak } from "@/lib/speak";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { LessonHUDRail } from "@/components/lesson/LessonHUDRail";
import { LessonCompleteCard } from "@/components/lesson/LessonCompleteCard";

function Dots({ count }: { count: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-card p-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className="inline-block h-6 w-6 rounded-full border border-gray-300 bg-gray-50"
          />
        ))}
      </div>
    </div>
  );
}

export function PracticeRunner({
  minutes = 8,
  getTask,
  onComplete,
  lessonTitle,
}: {
  minutes?: number;
  getTask: (ctx?: {
    secondsLeft: number;
    totalSeconds: number;
    elapsedSeconds: number;
    difficulty: Difficulty;
  }) => PracticeTask;
  onComplete: () => void;
  lessonTitle?: string;
}) {
  const totalSeconds = minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const [startTime] = useState<number>(() => {
    if (typeof window === "undefined") return Date.now();
    const key = "lul_lesson_start_time";
    const stored = sessionStorage.getItem(key);
    if (stored) return Number(stored);
    const now = Date.now();
    sessionStorage.setItem(key, String(now));
    return now;
  });

  function getElapsedSeconds() {
    return Math.floor((Date.now() - startTime) / 1000);
  }

  function makeCtx() {
    const elapsed = getElapsedSeconds();
    const difficulty = getDifficultyFromTime(elapsed);
    return { secondsLeft, totalSeconds, elapsedSeconds: elapsed, difficulty };
  }

  const [task, setTask] = useState<PracticeTask>(() => {
    const ctx = { secondsLeft: totalSeconds, totalSeconds, elapsedSeconds: 0, difficulty: "easy" as Difficulty };
    const t = getTask(ctx);
    t.difficulty = ctx.difficulty;
    return t;
  });
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [typed, setTyped] = useState("");
  const [order, setOrder] = useState<number[]>([]);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [taskNonce, setTaskNonce] = useState(0);
  const finished = secondsLeft <= 0;

  const accuracy =
    questionsAnswered > 0
      ? Math.round((correctAnswers / questionsAnswered) * 100)
      : 0;

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0 && !completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current();
    }
  }, [secondsLeft]);

  useEffect(() => {
    setStatus("idle");
    setTyped("");
    setOrder([]);
    setHasPlayed(false);
  }, [task]);

  useEffect(() => {
    if (task.kind !== "numberHunt") return;
    speak(String((task as any).targetNumber));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  const correctOrder = useMemo(() => {
    if (task.kind !== "order3") return [];
    const t = task as any;
    const sorted = [...t.numbers].sort((a: number, b: number) => a - b);
    return t.direction === "ASC" ? sorted : sorted.reverse();
  }, [task]);

  function nextTask() {
    const ctx = makeCtx();
    const requiredDifficulty = ctx.difficulty;
    let generated = getTask(ctx);
    generated.difficulty = requiredDifficulty;
    if (requiredDifficulty === "easy" && generated.difficulty !== "easy") {
      generated.difficulty = "easy";
    }
    setTask(generated);
    setTaskNonce((n) => n + 1);
  }

  const markWrong = useCallback(() => {
    setStatus("wrong");
    setQuestionsAnswered((v) => v + 1);
    setTimeout(() => setStatus("idle"), 1200);
  }, []);

  const markCorrect = useCallback(() => {
    setStatus("correct");
    setQuestionsAnswered((v) => v + 1);
    setCorrectAnswers((v) => v + 1);
    setTimeout(() => nextTask(), 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markCorrectSoft = useCallback(() => {
    setStatus("correct");
    setTimeout(() => setStatus("idle"), 500);
  }, []);

  const callbacks = useMemo(() => ({ markCorrect, markCorrectSoft, markWrong }), [markCorrect, markCorrectSoft, markWrong]);

  function check() {
    if (task.kind === "mcq") return;
    if (task.kind === "count") {
      const n = Number(typed);
      if (!Number.isFinite(n)) return markWrong();
      return n === (task as any).count ? markCorrect() : markWrong();
    }
    if (task.kind === "order3") {
      if (order.length !== (task as any).numbers.length) return markWrong();
      const ok = order.every((v, i) => v === correctOrder[i]);
      return ok ? markCorrect() : markWrong();
    }
  }

  const isBuiltinKind = ["mcq", "count", "order3", "audioPick", "numberHunt", "groupCountVisual"].includes(task.kind);

  const hint =
    "helper" in task && (task as any).helper
      ? (task as any).helper
      : null;

  // ── Finished state ──
  if (finished) {
    return (
      <LessonCompleteCard
        lessonTitle={lessonTitle ?? "Practice Session"}
        questionsAnswered={questionsAnswered}
        correctAnswers={correctAnswers}
        accuracy={accuracy}
        onExit={onComplete}
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

  const feedbackOverlay =
    status === "correct"
      ? "bg-emerald-400/12"
      : status === "wrong"
      ? "bg-red-400/12"
      : "bg-transparent";

  const statusMotion = status === "wrong" ? "animate-[shake_0.35s_ease-in-out]" : "";

  return (
    <div className="relative">
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
      `}</style>
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-40 transition-all duration-500 ${feedbackOverlay} ${
          status === "correct" ? "animate-pulse" : ""
        }`}
      />

      {/* Two-column landscape: sticky HUD rail + question workspace */}
      <div className="grid gap-3 lg:grid-cols-[300px_1fr] lg:items-start lg:gap-5">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <LessonHUDRail
            lessonTitle={lessonTitle ?? null}
            correctAnswers={correctAnswers}
            questionsAnswered={questionsAnswered}
            accuracy={accuracy}
            secondsLeft={Math.max(0, secondsLeft)}
            totalSeconds={totalSeconds}
            xpTarget={Math.max(5, questionsAnswered + 2)}
            hint={hint}
          />
        </aside>

        <div className="min-w-0 space-y-3">
          {/* Status feedback pill */}
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

          {/* Main task card */}
          <div
            className={`rounded-[1.75rem] border-2 bg-card p-5 shadow-lg transition-all duration-300 ${statusBorder} ${statusMotion}`}
          >
        {/* Activity type label */}
        <div className="mb-3">
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            {task.kind.replace(/([A-Z])/g, " $1").toUpperCase()}
          </span>
        </div>

        {/* Prompt with read-aloud for builtin kinds */}
        {isBuiltinKind && "prompt" in task && (task as any).prompt && (
          <div className="mb-4 flex items-center gap-2">
            <div className="text-xl font-extrabold leading-tight text-foreground md:text-2xl">
              {(task as any).prompt}
            </div>
            <ReadAloudBtn text={(task as any).prompt} />
          </div>
        )}

        {/* ── Builtin task renderers ── */}
        {task.kind === "mcq" && (
          <div className="grid gap-3">
            {(task as any).options.map((opt: string, idx: number) => (
              <button
                key={`${opt}-${idx}`}
                onClick={() => opt === (task as any).answer ? markCorrect() : markWrong()}
                className="w-full text-left px-5 py-4 rounded-2xl border border-border bg-card hover:bg-muted transition text-xl font-bold"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {task.kind === "groupCountVisual" && (() => {
          const t = task as any;
          return (
            <div className="grid gap-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="grid gap-3">
                  {Array.from({ length: t.groups }).map((_: unknown, gi: number) => (
                    <div key={gi} className="flex items-center gap-2">
                      {Array.from({ length: t.perGroup }).map((__: unknown, di: number) => (
                        <span key={di} className="inline-block h-5 w-5 rounded-full bg-teal-600" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3">
                {t.options.map((opt: string, idx: number) => (
                  <button key={`${opt}-${idx}`} onClick={() => opt === t.answer ? markCorrect() : markWrong()} className="w-full text-left px-5 py-4 rounded-2xl border border-border bg-card hover:bg-muted transition text-xl font-bold">
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {task.kind === "count" && (
          <div className="grid gap-4">
            <Dots count={(task as any).count} />
            <div className="flex items-center gap-3">
              <input value={typed} onChange={(e) => setTyped(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" placeholder="Type your answer" className="flex-1 px-4 py-3 rounded-2xl border border-border text-xl font-bold bg-card" />
              <button onClick={check} className="px-5 py-3 rounded-2xl bg-teal-600 text-white font-extrabold text-xl hover:bg-teal-700 transition">Check</button>
            </div>
          </div>
        )}

        {task.kind === "order3" && (() => {
          const t = task as any;
          return (
            <div className="grid gap-4">
              <div className="flex gap-3 flex-wrap">
                {t.numbers.map((n: number) => {
                  const used = order.includes(n);
                  return (
                    <button key={n} onClick={() => !used && setOrder((prev) => [...prev, n])} className={["px-6 py-4 rounded-2xl border text-xl font-extrabold transition", used ? "border-border bg-muted text-muted-foreground" : "border-border bg-card hover:bg-muted"].join(" ")}>{n}</button>
                  );
                })}
              </div>
              <div className="rounded-2xl border border-border bg-muted p-4">
                <div className="text-sm font-bold text-muted-foreground mb-2">Your order</div>
                <div className="text-2xl font-extrabold text-foreground">{order.length ? order.join(" , ") : "—"}</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setOrder([])} className="px-5 py-3 rounded-2xl bg-muted text-foreground font-extrabold text-xl hover:bg-muted/80 transition">Reset</button>
                <button onClick={check} className="flex-1 px-5 py-3 rounded-2xl bg-teal-600 text-white font-extrabold text-xl hover:bg-teal-700 transition">Check</button>
              </div>
            </div>
          );
        })()}

        {task.kind === "audioPick" && (() => {
          const t = task as any;
          return (
            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => { speak(t.speechText ?? String(t.targetNumber)); setHasPlayed(true); }} className="px-5 py-3 rounded-2xl bg-teal-600 text-white font-extrabold text-xl hover:bg-teal-700 transition">🔊 Listen</button>
                <div className="text-sm font-bold text-muted-foreground">{hasPlayed ? "Now tap the number." : "Tap Listen first."}</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {t.cards.map((n: number) => (
                  <button key={n} type="button" onClick={() => { if (!hasPlayed) return; n === t.targetNumber ? markCorrect() : markWrong(); }} className="px-4 py-6 rounded-2xl border border-border bg-card hover:bg-muted transition text-3xl font-extrabold">{n}</button>
                ))}
              </div>
              {!hasPlayed && <div className="text-sm text-muted-foreground">Tip: On iPads, audio will only play after a button tap (that&apos;s normal).</div>}
            </div>
          );
        })()}

        {task.kind === "numberHunt" && (() => {
          const t = task as any;
          return (
            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">Tap the correct number tile.</div>
                <button type="button" onClick={() => speak(String(t.targetNumber))} className="px-3 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition">🔊 Hear number</button>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {t.tiles.map((n: number) => (
                  <button key={n} type="button" onClick={() => n === t.targetNumber ? markCorrect() : markWrong()} className="rounded-2xl border border-border bg-card hover:bg-muted transition text-lg sm:text-xl font-extrabold py-4 sm:py-5">{n}</button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Delegate to TaskRenderer for complex component-based task kinds */}
        {!isBuiltinKind && (
          <TaskRenderer task={task} taskNonce={taskNonce} callbacks={callbacks} />
        )}
      </div>
    </div>
  );
}
