"use client";

import { useMemo, useState, useCallback } from "react";
import type { NumberLineQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

const fmt = (n: number) => n.toLocaleString();

/* Pick a clean tick step so we get 5–11 labelled ticks */
function niceStep(span: number): number {
  if (span <= 10) return 1;
  if (span <= 20) return 2;
  if (span <= 50) return 5;
  if (span <= 100) return 10;
  if (span <= 200) return 20;
  if (span <= 500) return 50;
  if (span <= 1000) return 100;
  if (span <= 2000) return 200;
  if (span <= 5000) return 500;
  return 1000;
}

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

  const range = questionData.max - questionData.min || 1;

  const ticks = useMemo(() => {
    const span = questionData.max - questionData.min;
    const step = niceStep(span);
    const values: number[] = [];
    const start = Math.ceil(questionData.min / step) * step;
    for (let v = start; v <= questionData.max; v += step) values.push(v);
    if (values[0] !== questionData.min) values.unshift(questionData.min);
    if (values[values.length - 1] !== questionData.max) values.push(questionData.max);
    return values;
  }, [questionData.max, questionData.min]);

  /* Also compute minor ticks (unlabelled) for visual density */
  const minorTicks = useMemo(() => {
    const span = questionData.max - questionData.min;
    const majorStep = niceStep(span);
    // minor ticks = half of major, only if span allows it and won't be too many
    const minorStep = majorStep / 2;
    if (minorStep < 1 || span / minorStep > 40) return [];
    const values: number[] = [];
    const start = Math.ceil(questionData.min / minorStep) * minorStep;
    for (let v = start; v <= questionData.max; v += minorStep) {
      // skip if it's already a major tick
      if (v % majorStep === 0 && v >= questionData.min) continue;
      values.push(v);
    }
    return values;
  }, [questionData.max, questionData.min]);

  const handleLineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (checked) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const raw = questionData.min + pct * range;
      const snapped = Math.round(raw);
      const clamped = Math.max(questionData.min, Math.min(questionData.max, snapped));
      setPlaced(clamped);
    },
    [checked, questionData.min, questionData.max, range]
  );

  function check() {
    if (placed === null) return;
    setChecked(true);

    const difference = Math.abs(placed - questionData.expected);
    const allowed =
      questionData.mode === "estimate"
        ? Math.max(5, Math.floor(questionData.step / 2))
        : Math.max(1, Math.floor(questionData.step / 4));

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
        <div className="flex items-center gap-2 mt-2">
          <h2 className="text-2xl font-black text-foreground">{questionData.prompt}</h2>
          <ReadAloudBtn text={`${questionData.prompt}. ${questionData.helper}`} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{questionData.helper}</p>
      </div>

      {/* Clickable number line */}
      <div
        className="mt-8 rounded-2xl border border-border bg-muted/30 px-8 py-8 cursor-pointer select-none"
        onClick={handleLineClick}
      >
        <div className="relative mx-auto max-w-3xl" style={{ height: 80 }}>
          {/* Base line */}
          <div
            className="absolute left-0 right-0 bg-primary/70 rounded-full"
            style={{ top: 36, height: 3 }}
          />
          {/* End caps */}
          <div
            className="absolute bg-primary/70 rounded-full"
            style={{ left: 0, top: 20, width: 3, height: 36 }}
          />
          <div
            className="absolute bg-primary/70 rounded-full"
            style={{ right: 0, top: 20, width: 3, height: 36 }}
          />

          {/* Minor tick marks (unlabelled) */}
          {minorTicks.map((tick) => {
            const left = ((tick - questionData.min) / range) * 100;
            return (
              <div
                key={`m-${tick}`}
                className="absolute pointer-events-none"
                style={{ left: `${left}%`, transform: "translateX(-50%)", top: 24 }}
              >
                <div
                  className="mx-auto bg-primary/30 rounded-full"
                  style={{ width: 2, height: 24 }}
                />
              </div>
            );
          })}

          {/* Major tick marks (labelled) */}
          {ticks.map((tick) => {
            const left = ((tick - questionData.min) / range) * 100;
            return (
              <div
                key={tick}
                className="absolute text-center pointer-events-none"
                style={{ left: `${left}%`, transform: "translateX(-50%)", top: 16 }}
              >
                <div
                  className="mx-auto bg-primary/60 rounded-full"
                  style={{ width: 3, height: 40 }}
                />
                <div className="mt-1.5 text-sm font-bold text-foreground whitespace-nowrap">
                  {tick}
                </div>
              </div>
            );
          })}

          {/* Correct answer marker (shown after check) */}
          {checked && correctPct !== null && !isCorrect && (
            <div
              className="absolute flex flex-col items-center pointer-events-none"
              style={{ left: `${correctPct}%`, transform: "translateX(-50%)", top: 22 }}
            >
              <div className="w-5 h-5 rounded-full bg-primary border-2 border-primary-foreground shadow-md" />
              <span className="mt-0.5 text-xs font-bold text-primary">{questionData.expected}</span>
            </div>
          )}

          {/* User's placed marker */}
          {markerPct !== null && (
            <div
              className="absolute flex flex-col items-center pointer-events-none"
              style={{ left: `${markerPct}%`, transform: "translateX(-50%)", top: 22 }}
            >
              <div
                className={[
                  "w-5 h-5 rounded-full border-2 shadow-lg transition-colors",
                  checked
                    ? isCorrect
                      ? "bg-primary border-primary-foreground"
                      : "bg-destructive border-destructive-foreground"
                    : "bg-accent-foreground border-accent",
                ].join(" ")}
              />
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
