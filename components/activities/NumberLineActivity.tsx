"use client";

import { useMemo, useState, useCallback } from "react";
import type { NumberLineQuestion } from "@/data/activities/year2/lessonEngine";

export default function NumberLineActivity({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: NumberLineQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [placed, setPlaced] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const ticks = useMemo(() => {
    const span = questionData.max - questionData.min;
    // Use 100 increments for large ranges, otherwise use step
    const tickStep = span >= 200 ? 100 : questionData.step;
    const values: number[] = [];
    for (let current = questionData.min; current <= questionData.max; current += tickStep) {
      values.push(current);
    }
    if (values[values.length - 1] !== questionData.max) values.push(questionData.max);
    return values;
  }, [questionData.max, questionData.min, questionData.step]);

  const range = questionData.max - questionData.min || 1;

  const handleLineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (checked) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const raw = questionData.min + pct * range;

      // Snap to nearest integer like Level 1
      const snapped = Math.round(raw);
      const clamped = Math.max(questionData.min, Math.min(questionData.max, snapped));

      setPlaced(clamped);
    },
    [checked, questionData.min, questionData.max, questionData.step, range]
  );

  function check() {
    if (placed === null) return;
    setChecked(true);

    const difference = Math.abs(placed - questionData.expected);
    const allowed =
      questionData.mode === "estimate"
        ? Math.max(5, Math.floor(questionData.step / 2))
        : 5;

    if (difference <= allowed) {
      setIsCorrect(true);
      onCorrect?.();
    } else {
      setIsCorrect(false);
      onWrong?.();
    }
  }

  const markerPct = placed !== null ? ((placed - questionData.min) / range) * 100 : null;
  const correctPct = checked ? ((questionData.expected - questionData.min) / range) * 100 : null;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-primary">
          Number Line
        </div>
        <h2 className="mt-2 text-2xl font-black text-foreground">
          {questionData.prompt}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{questionData.helper}</p>
      </div>

      {/* Clickable number line */}
      <div
        className="mt-8 rounded-2xl border border-border bg-muted/30 px-6 py-8 cursor-pointer select-none"
        onClick={handleLineClick}
      >
        <div className="relative mx-auto h-20 max-w-3xl">
          {/* Base line */}
          <div className="absolute left-0 right-0 top-10 h-1 rounded-full bg-border" />

          {/* Tick marks */}
          {ticks.map((tick) => {
            const left = ((tick - questionData.min) / range) * 100;
            return (
              <div
                key={tick}
                className="absolute top-0 text-center pointer-events-none"
                style={{ left: `${left}%`, transform: "translateX(-50%)" }}
              >
                <div className="mx-auto h-6 w-0.5 bg-muted-foreground/40" />
                <div className="mt-1 text-xs font-bold text-muted-foreground">{tick}</div>
              </div>
            );
          })}

          {/* Correct answer marker (shown after check) */}
          {checked && correctPct !== null && !isCorrect && (
            <div
              className="absolute top-4 flex flex-col items-center pointer-events-none"
              style={{ left: `${correctPct}%`, transform: "translateX(-50%)" }}
            >
              <div className="w-4 h-4 rounded-full bg-primary border-2 border-primary-foreground shadow-md" />
              <span className="mt-1 text-xs font-bold text-primary">{questionData.expected}</span>
            </div>
          )}

          {/* User's placed marker */}
          {markerPct !== null && (
            <div
              className="absolute top-4 flex flex-col items-center pointer-events-none"
              style={{ left: `${markerPct}%`, transform: "translateX(-50%)" }}
            >
              <div
                className={[
                  "w-4 h-4 rounded-full border-2 shadow-lg transition-colors",
                  checked
                    ? isCorrect
                      ? "bg-primary border-primary-foreground"
                      : "bg-destructive border-destructive-foreground"
                    : "bg-accent-foreground border-accent",
                ].join(" ")}
              />
              <span
                className={[
                  "mt-1 text-xs font-bold",
                  checked
                    ? isCorrect
                      ? "text-primary"
                      : "text-destructive"
                    : "text-foreground",
                ].join(" ")}
              >
                {placed}
              </span>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          {placed === null ? "👆 Tap on the number line to place your answer" : "Tap again to adjust"}
        </p>
      </div>

      {/* Check button */}
      <div className="mt-6 flex justify-center">
        {!checked ? (
          <button
            type="button"
            onClick={check}
            disabled={placed === null}
            className="rounded-2xl bg-primary px-8 py-3 font-black text-primary-foreground hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40"
          >
            Check answer
          </button>
        ) : (
          <div
            className={[
              "rounded-2xl px-8 py-3 font-black text-center",
              isCorrect
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive",
            ].join(" ")}
          >
            {isCorrect ? "✅ Correct!" : `❌ The answer was ${questionData.expected}`}
          </div>
        )}
      </div>
    </div>
  );
}
