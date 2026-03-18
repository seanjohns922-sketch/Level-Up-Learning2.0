"use client";

import { useMemo, useState } from "react";

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

export default function NumberLineTap({
  min,
  max,
  target,
  onComplete,
  onAttempt,
}: {
  min: number;
  max: number;
  target: number;
  onComplete: () => void;
  onAttempt?: (value: number) => void;
}) {
  const [value, setValue] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);

  const range = max - min || 1;

  const ticks = useMemo(() => {
    const span = max - min;
    const step = niceStep(span);
    const values: number[] = [];
    const start = Math.ceil(min / step) * step;
    for (let v = start; v <= max; v += step) values.push(v);
    if (values[0] !== min) values.unshift(min);
    if (values[values.length - 1] !== max) values.push(max);
    return values;
  }, [min, max]);

  const minorTicks = useMemo(() => {
    const span = max - min;
    const majorStep = niceStep(span);
    const minorStep = majorStep / 2;
    if (minorStep < 1 || span / minorStep > 40) return [];
    const values: number[] = [];
    const start = Math.ceil(min / minorStep) * minorStep;
    for (let v = start; v <= max; v += minorStep) {
      if (v % majorStep === 0 && v >= min) continue;
      values.push(v);
    }
    return values;
  }, [min, max]);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (correct) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const raw = min + pct * range;
    const snapped = Math.round(raw);
    const clamped = Math.max(min, Math.min(max, snapped));
    setValue(clamped);
    onAttempt?.(clamped);
    if (clamped === target) {
      setCorrect(true);
      setTimeout(() => onComplete(), 600);
    }
  }

  const markerPct = value === null ? null : ((value - min) / range) * 100;

  return (
    <div className="w-full">
      <div className="text-sm text-muted-foreground mb-3">
        👆 Tap on the number line to place{" "}
        <span className="font-bold text-foreground">{target}</span>
      </div>

      <div
        className="relative cursor-pointer select-none rounded-2xl border border-border bg-muted/30 px-6"
        style={{ height: 100 }}
        onClick={handleClick}
      >
        {/* Base line */}
        <div
          className="absolute left-6 right-6 bg-primary/70 rounded-full"
          style={{ top: 36, height: 3 }}
        />
        {/* End caps */}
        <div
          className="absolute bg-primary/70 rounded-full"
          style={{ left: 24, top: 20, width: 3, height: 36 }}
        />
        <div
          className="absolute bg-primary/70 rounded-full"
          style={{ right: 24, top: 20, width: 3, height: 36 }}
        />

        {/* Inner container for ticks & markers, inset to match line */}
        <div className="absolute left-6 right-6 top-0 bottom-0">
          {/* Minor ticks */}
          {minorTicks.map((t) => {
            const pct = ((t - min) / range) * 100;
            return (
              <div
                key={`m-${t}`}
                className="absolute pointer-events-none"
                style={{ left: `${pct}%`, transform: "translateX(-50%)", top: 24 }}
              >
                <div
                  className="mx-auto bg-primary/30 rounded-full"
                  style={{ width: 2, height: 24 }}
                />
              </div>
            );
          })}

          {/* Major ticks */}
          {ticks.map((t) => {
            const pct = ((t - min) / range) * 100;
            return (
              <div
                key={t}
                className="absolute text-center pointer-events-none"
                style={{ left: `${pct}%`, transform: "translateX(-50%)", top: 16 }}
              >
                <div
                  className="mx-auto bg-primary/60 rounded-full"
                  style={{ width: 3, height: 40 }}
                />
                <div className="mt-1.5 text-sm font-bold text-foreground whitespace-nowrap">
                  {t}
                </div>
              </div>
            );
          })}

          {/* Placed marker */}
          {markerPct !== null && (
            <div
              className="absolute flex flex-col items-center pointer-events-none"
              style={{ left: `${markerPct}%`, transform: "translateX(-50%)", top: 22 }}
            >
              <div
                className={[
                  "w-5 h-5 rounded-full border-2 shadow-lg transition-colors",
                  correct
                    ? "bg-primary border-primary-foreground"
                    : value === target
                      ? "bg-primary border-primary-foreground"
                      : "bg-destructive border-destructive-foreground",
                ].join(" ")}
              />
              <span
                className={[
                  "mt-0.5 text-xs font-bold",
                  correct ? "text-primary" : "text-foreground",
                ].join(" ")}
              >
                {value}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Feedback */}
      {value !== null && !correct && value !== target && (
        <div className="mt-2 text-sm text-destructive font-bold text-center">
          Not quite — try again!
        </div>
      )}
      {correct && (
        <div className="mt-2 text-sm text-primary font-bold text-center">
          ✅ Correct!
        </div>
      )}
    </div>
  );
}
