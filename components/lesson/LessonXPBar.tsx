"use client";

import { Hourglass, Zap } from "lucide-react";

const XP_PER_CORRECT = 10;

export function calcXP(correct: number) {
  return correct * XP_PER_CORRECT;
}

export function LessonXPBar({
  correct,
  totalTarget,
  mode = "xp",
  currentValue,
  maxValue,
  valueLabel,
  rightLabel,
  realmId,
}: {
  correct?: number;
  totalTarget?: number;
  mode?: "xp" | "progress";
  currentValue?: number;
  maxValue?: number;
  valueLabel?: string;
  rightLabel?: string;
  realmId?: string;
}) {
  const isMeasurement = realmId === "measurement";
  const earned = mode === "progress" ? Math.max(0, currentValue ?? 0) : calcXP(correct ?? 0);
  const max = mode === "progress"
    ? Math.max(1, maxValue ?? 1)
    : Math.max(1, (totalTarget ?? 0) * XP_PER_CORRECT);
  const pct = max > 0 ? Math.min(100, (earned / max) * 100) : 0;
  const leftLabel = valueLabel ?? (mode === "progress" ? `${earned} / ${max}` : `${earned} / ${max} XP`);
  const defaultRight = isMeasurement
    ? (mode === "progress" ? "Explorer Progress" : "Journey Progress")
    : (mode === "progress" ? "Session Progress" : "Lesson Progress");
  const trailingLabel = rightLabel ?? defaultRight;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-[2px] pointer-events-none"
        style={isMeasurement ? {
          borderRadius: 12,
          background:
            "linear-gradient(135deg, rgba(200,160,48,0.55) 0%, rgba(139,92,246,0.25) 50%, rgba(200,160,48,0.5) 100%)",
        } : {
          clipPath:
            "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
          background:
            "linear-gradient(135deg, rgba(251,191,36,0.45) 0%, rgba(94,234,212,0.3) 50%, rgba(251,191,36,0.4) 100%)",
        }}
      />
      <div
        className="relative px-2.5 py-2 overflow-hidden"
        style={isMeasurement ? {
          borderRadius: 10,
          background:
            "linear-gradient(135deg, #1a1004 0%, #2e1d06 50%, #3d2808 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(200,160,48,0.28), inset 0 -8px 16px rgba(0,0,0,0.45)",
        } : {
          clipPath:
            "polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)",
          background:
            "linear-gradient(135deg, #021a18 0%, #0a3d36 50%, #154d3a 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(251,191,36,0.25), inset 0 -8px 16px rgba(0,0,0,0.4)",
        }}
      >
        {!isMeasurement && (
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.15] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(251,191,36,0.4) 0px, rgba(251,191,36,0.4) 1px, transparent 1px, transparent 3px)",
            }}
          />
        )}
        <div className="relative flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center"
            style={isMeasurement ? {
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 30%, #e8c878 0%, #8b6520 60%, #2a1a04 100%)",
              boxShadow:
                "inset 0 0 6px rgba(240,210,150,0.55), 0 0 10px rgba(200,160,48,0.4)",
            } : {
              clipPath:
                "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
              background:
                "radial-gradient(circle at 35% 30%, #fbbf24 0%, #b45309 70%, #451a03 100%)",
              boxShadow:
                "inset 0 0 6px rgba(254,240,138,0.6), 0 0 10px rgba(251,191,36,0.45)",
            }}
          >
            {isMeasurement ? (
              <Hourglass
                className="h-4 w-4 text-amber-50"
                style={{ filter: "drop-shadow(0 0 3px rgba(240,210,150,0.85))" }}
              />
            ) : (
              <Zap
                className="h-4 w-4 text-amber-50"
                style={{ filter: "drop-shadow(0 0 3px rgba(254,240,138,0.9))" }}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span
                className="text-xs font-mono font-extrabold uppercase tracking-[0.16em] md:text-sm"
                style={{
                  color: isMeasurement ? "#fceec1" : "#fef3c7",
                  textShadow: isMeasurement ? "0 0 10px rgba(200,160,48,0.4)" : "0 0 10px rgba(251,191,36,0.4)",
                }}
              >
                {leftLabel}
              </span>
              <span
                className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] md:text-[11px]"
                style={{ color: isMeasurement ? "rgba(240,210,150,0.78)" : "rgba(153,246,228,0.7)" }}
              >
                {trailingLabel}
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full"
              style={{
                background: "rgba(0,0,0,0.5)",
                boxShadow: isMeasurement
                  ? "inset 0 1px 2px rgba(0,0,0,0.6), inset 0 -1px 0 rgba(200,160,48,0.18)"
                  : "inset 0 1px 2px rgba(0,0,0,0.6), inset 0 -1px 0 rgba(94,234,212,0.1)",
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  background: isMeasurement
                    ? "linear-gradient(90deg, #e8c878 0%, #c8a030 45%, #a78bfa 100%)"
                    : "linear-gradient(90deg, #fbbf24 0%, #f59e0b 40%, #34d399 100%)",
                  boxShadow: isMeasurement
                    ? "0 0 10px rgba(200,160,48,0.55)"
                    : "0 0 10px rgba(251,191,36,0.6)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
