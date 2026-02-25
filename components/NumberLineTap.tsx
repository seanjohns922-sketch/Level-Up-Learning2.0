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

  const ticks = useMemo(() => {
    const arr: number[] = [];
    for (let n = min; n <= max; n += 10) arr.push(n);
    return arr;
  }, [min, max]);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const raw = min + pct * (max - min);
    const snapped = Math.round(raw);
    const clamped = Math.max(min, Math.min(max, snapped));
    setValue(clamped);
    onAttempt?.(clamped);
    if (clamped === target) {
      setTimeout(() => onComplete(), 500);
    }
  }

  const markerPct =
    value === null ? null : ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <div className="text-sm text-gray-600 mb-3">
        Tap on the number line to place the marker.
      </div>

      <div className="relative h-20" onClick={handleClick}>
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-300 rounded" />

        {ticks.map((t) => {
          const pct = ((t - min) / (max - min)) * 100;
          return (
            <div
              key={t}
              className="absolute top-[45%] text-xs text-gray-600"
              style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
            >
              {t}
            </div>
          );
        })}

        {markerPct !== null && (
          <div
            className="absolute top-[30%] h-6 w-6 rounded-full bg-indigo-600"
            style={{ left: `${markerPct}%`, transform: "translateX(-50%)" }}
          />
        )}
      </div>
    </div>
  );
}
