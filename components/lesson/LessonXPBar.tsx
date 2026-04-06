"use client";

const XP_PER_CORRECT = 10;

export function calcXP(correct: number) {
  return correct * XP_PER_CORRECT;
}

export function LessonXPBar({
  correct,
  totalTarget,
}: {
  correct: number;
  totalTarget: number;
}) {
  const earned = calcXP(correct);
  const max = totalTarget * XP_PER_CORRECT;
  const pct = max > 0 ? Math.min(100, (earned / max) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3.5 rounded-full bg-gray-100 overflow-hidden shadow-inner">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, hsl(265 70% 58%), hsl(280 75% 62%), hsl(310 70% 60%))",
          }}
        />
      </div>
      <span className="text-sm font-extrabold text-gray-600 tabular-nums whitespace-nowrap">
        {earned} / {max} XP
      </span>
    </div>
  );
}
