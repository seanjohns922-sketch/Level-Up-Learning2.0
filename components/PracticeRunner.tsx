"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PracticeTask, Difficulty } from "@/data/activities/year1/practice-task";
import { getDifficultyFromTime } from "@/data/activities/year1/practice-task";
import { TaskRenderer } from "@/components/TaskRenderer";

function speak(text: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  u.pitch = 1.0;
  u.volume = 1.0;
  synth.speak(u);
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function Countdown({ seconds, total }: { seconds: number; total: number }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const pct = Math.max(0, Math.min(100, (seconds / total) * 100));
  return (
    <div className="flex items-center gap-3 flex-1">
      <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${pct}%`,
            background: pct > 50 ? 'hsl(145 65% 42%)' : pct > 20 ? 'hsl(42 95% 55%)' : 'hsl(0 72% 51%)',
          }}
        />
      </div>
      <span className="text-sm font-bold text-gray-500 tabular-nums whitespace-nowrap">
        {m}:{pad2(s)}
      </span>
    </div>
  );
}

function Dots({ count }: { count: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
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
}: {
  minutes?: number;
  getTask: (ctx?: {
    secondsLeft: number;
    totalSeconds: number;
    elapsedSeconds: number;
    difficulty: Difficulty;
  }) => PracticeTask;
  onComplete: () => void;
}) {
  const totalSeconds = minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

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
    setTimeout(() => setStatus("idle"), 1200);
  }, []);

  const markCorrect = useCallback(() => {
    setStatus("correct");
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

  // Inline renderers for simple built-in kinds (mcq, count, order3, audioPick, numberHunt, groupCountVisual)
  // These are lightweight and don't warrant separate components
  const isBuiltinKind = ["mcq", "count", "order3", "audioPick", "numberHunt", "groupCountVisual"].includes(task.kind);

  return (
    <div className={[
      "rounded-3xl border bg-white shadow-sm p-6 transition-all",
      status === "correct" ? "border-emerald-200 animate-correct" : status === "wrong" ? "border-red-200 animate-wrong" : "border-gray-100",
    ].join(" ")}>
      <div className="flex items-center justify-between gap-4 mb-5">
        <Countdown seconds={Math.max(0, secondsLeft)} total={totalSeconds} />
        <div
          className={[
            "px-3 py-1.5 rounded-full text-xs font-extrabold tracking-wide transition-all",
            status === "correct"
              ? "bg-emerald-50 text-emerald-700"
              : status === "wrong"
              ? "bg-red-50 text-red-700"
              : "bg-gray-50 text-gray-400",
          ].join(" ")}
        >
          {status === "correct" ? "✓ Correct!" : status === "wrong" ? "✗ Try again" : "Practice"}
        </div>
      </div>

      {isBuiltinKind && (
        <div className="text-2xl font-extrabold text-gray-900 mb-5 leading-tight">
          {"prompt" in task ? (task as any).prompt : ""}
        </div>
      )}

      {task.kind === "mcq" && (
        <div className="grid gap-3">
          {(task as any).options.map((opt: string, idx: number) => (
            <button
              key={`${opt}-${idx}`}
              onClick={() => opt === (task as any).answer ? markCorrect() : markWrong()}
              className="w-full text-left px-5 py-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition text-xl font-bold"
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
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
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
                <button key={`${opt}-${idx}`} onClick={() => opt === t.answer ? markCorrect() : markWrong()} className="w-full text-left px-5 py-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition text-xl font-bold">
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
            <input value={typed} onChange={(e) => setTyped(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" placeholder="Type your answer" className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-xl font-bold" />
            <button onClick={check} className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl hover:bg-indigo-700 transition">Check</button>
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
                  <button key={n} onClick={() => !used && setOrder((prev) => [...prev, n])} className={["px-6 py-4 rounded-2xl border text-xl font-extrabold transition", used ? "border-gray-200 bg-gray-100 text-gray-400" : "border-gray-200 bg-white hover:bg-gray-50"].join(" ")}>{n}</button>
                );
              })}
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="text-sm font-bold text-gray-600 mb-2">Your order</div>
              <div className="text-2xl font-extrabold text-gray-900">{order.length ? order.join(" , ") : "—"}</div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setOrder([])} className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-800 font-extrabold text-xl hover:bg-gray-200 transition">Reset</button>
              <button onClick={check} className="flex-1 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl hover:bg-indigo-700 transition">Check</button>
            </div>
          </div>
        );
      })()}

      {task.kind === "audioPick" && (() => {
        const t = task as any;
        return (
          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => { speak(t.speechText ?? String(t.targetNumber)); setHasPlayed(true); }} className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl hover:bg-indigo-700 transition">🔊 Listen</button>
              <div className="text-sm font-bold text-gray-600">{hasPlayed ? "Now tap the number." : "Tap Listen first."}</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {t.cards.map((n: number) => (
                <button key={n} type="button" onClick={() => { if (!hasPlayed) return; n === t.targetNumber ? markCorrect() : markWrong(); }} className="px-4 py-6 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition text-3xl font-extrabold">{n}</button>
              ))}
            </div>
            {!hasPlayed && <div className="text-sm text-gray-500">Tip: On iPads, audio will only play after a button tap (that&apos;s normal).</div>}
          </div>
        );
      })()}

      {task.kind === "numberHunt" && (() => {
        const t = task as any;
        return (
          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-gray-500">Tap the correct number tile.</div>
              <button type="button" onClick={() => speak(String(t.targetNumber))} className="px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition">🔊 Hear number</button>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
              {t.tiles.map((n: number) => (
                <button key={n} type="button" onClick={() => n === t.targetNumber ? markCorrect() : markWrong()} className="rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition text-lg sm:text-xl font-extrabold py-4 sm:py-5">{n}</button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Delegate to TaskRenderer for all complex component-based task kinds */}
      {!isBuiltinKind && (
        <TaskRenderer task={task} taskNonce={taskNonce} callbacks={callbacks} />
      )}

      <div className="mt-6 flex items-center justify-between">
        <button onClick={nextTask} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition" type="button">New task</button>
        <button onClick={onComplete} className="px-4 py-2 rounded-xl bg-amber-100 text-amber-900 font-bold hover:bg-amber-200 transition" type="button">Finish (dev)</button>
      </div>
    </div>
  );
}
