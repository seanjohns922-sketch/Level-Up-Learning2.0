"use client";

import { useMemo, useState } from "react";

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

  // Generate sensible tick spacing
  const ticks = useMemo(() => {
    const span = max - min;
    let step = 1;
    if (span > 200) step = 50;
    else if (span > 100) step = 20;
    else if (span > 50) step = 10;
    else if (span > 20) step = 5;
    else if (span > 10) step = 2;

    const arr: number[] = [];
    const start = Math.ceil(min / step) * step;
    for (let n = start; n <= max; n += step) arr.push(n);
    if (arr[0] !== min) arr.unshift(min);
    if (arr[arr.length - 1] !== max) arr.push(max);
    return arr;
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
        👆 Tap on the number line to place <span className="font-bold text-foreground">{target}</span>
      </div>

      <div
        className="relative h-24 cursor-pointer select-none rounded-2xl border border-border bg-muted/30 px-4"
        onClick={handleClick}
      >
        {/* Base line */}
        <div className="absolute left-4 right-4 top-10 h-1 rounded-full bg-border" />

        {/* Tick marks */}
        {ticks.map((t) => {
          const pct = ((t - min) / range) * 100;
          return (
            <div
              key={t}
              className="absolute top-4 text-center pointer-events-none"
              style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
            >
              <div className="mx-auto h-4 w-0.5 bg-muted-foreground/40" />
              <div className="mt-1 text-xs font-bold text-muted-foreground">{t}</div>
            </div>
          );
        })}

        {/* Placed marker */}
        {markerPct !== null && (
          <div
            className="absolute top-6 flex flex-col items-center pointer-events-none"
            style={{ left: `${markerPct}%`, transform: "translateX(-50%)" }}
          >
            <div
              className={[
                "w-6 h-6 rounded-full border-2 shadow-lg transition-colors",
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
