"use client";

import { Timer } from "lucide-react";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function LessonTimer({
  seconds,
  total,
}: {
  seconds: number;
  total: number;
}) {
  const clamped = Math.max(0, seconds);
  const minutes = Math.floor(clamped / 60);
  const remaining = clamped % 60;
  const pct = total > 0 ? (clamped / total) * 100 : 0;

  const color =
    pct > 50
      ? "text-gray-500"
      : pct > 12
      ? "text-amber-600"
      : "text-red-500";

  const pillBg =
    pct > 50
      ? "bg-gray-50 border-gray-200"
      : pct > 12
      ? "bg-amber-50 border-amber-200"
      : "bg-red-50 border-red-200";

  return (
    <div
      className={`inline-flex min-w-[110px] items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 transition-colors duration-500 ${pillBg} shadow-sm`}
    >
      <Timer className={`h-4 w-4 ${color}`} />
      <span className={`text-base font-extrabold tabular-nums ${color}`}>
        {minutes}:{pad2(remaining)}
      </span>
    </div>
  );
}
