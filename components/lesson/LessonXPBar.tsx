"use client";

import { Zap } from "lucide-react";

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
    <div className="relative">
      {/* Bezel */}
      <div
        aria-hidden
        className="absolute -inset-[2px] pointer-events-none"
        style={{
          clipPath:
            "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
          background:
            "linear-gradient(135deg, rgba(251,191,36,0.45) 0%, rgba(94,234,212,0.3) 50%, rgba(251,191,36,0.4) 100%)",
        }}
      />
      <div
        className="relative px-2.5 py-2 overflow-hidden"
        style={{
          clipPath:
            "polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)",
          background:
            "linear-gradient(135deg, #021a18 0%, #0a3d36 50%, #154d3a 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(251,191,36,0.25), inset 0 -8px 16px rgba(0,0,0,0.4)",
        }}
      >
        {/* Scanlines */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(251,191,36,0.4) 0px, rgba(251,191,36,0.4) 1px, transparent 1px, transparent 3px)",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center"
            style={{
              clipPath:
                "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
              background:
                "radial-gradient(circle at 35% 30%, #fbbf24 0%, #b45309 70%, #451a03 100%)",
              boxShadow:
                "inset 0 0 6px rgba(254,240,138,0.6), 0 0 10px rgba(251,191,36,0.45)",
            }}
          >
            <Zap
              className="h-4 w-4 text-amber-50"
              style={{ filter: "drop-shadow(0 0 3px rgba(254,240,138,0.9))" }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span
                className="text-xs font-mono font-extrabold uppercase tracking-[0.16em] text-amber-100 md:text-sm"
                style={{ textShadow: "0 0 10px rgba(251,191,36,0.4)" }}
              >
                {earned} / {max} XP
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-teal-200/70 md:text-[11px]">
                Lesson Progress
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full"
              style={{
                background: "rgba(0,0,0,0.5)",
                boxShadow:
                  "inset 0 1px 2px rgba(0,0,0,0.6), inset 0 -1px 0 rgba(94,234,212,0.1)",
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  background:
                    "linear-gradient(90deg, #fbbf24 0%, #f59e0b 40%, #34d399 100%)",
                  boxShadow: "0 0 10px rgba(251,191,36,0.6)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
