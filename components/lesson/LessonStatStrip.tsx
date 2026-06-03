"use client";

import { CheckCircle, Compass, Hourglass, Sparkles } from "lucide-react";

export function LessonStatStrip({
  questionsAnswered,
  correctAnswers,
  accuracy,
  realmId,
}: {
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  realmId?: string;
}) {
  const isMeasurement = realmId === "measurement";

  const stats = [
    {
      label: isMeasurement ? "Challenges" : "Questions",
      value: questionsAnswered,
      icon: isMeasurement ? Compass : Hourglass,
      iconColor: isMeasurement ? "text-amber-300" : "text-cyan-300",
      glow: isMeasurement ? "rgba(200,160,48,0.5)" : "rgba(34,211,238,0.45)",
    },
    {
      label: isMeasurement ? "Solved" : "Correct",
      value: correctAnswers,
      icon: CheckCircle,
      iconColor: isMeasurement ? "text-amber-200" : "text-emerald-300",
      glow: isMeasurement ? "rgba(232,200,120,0.55)" : "rgba(16,185,129,0.5)",
    },
    {
      label: isMeasurement ? "Mastery" : "Accuracy",
      value: `${accuracy}%`,
      icon: isMeasurement ? Sparkles : CheckCircle,
      iconColor: isMeasurement ? "text-amber-200" : "text-teal-200",
      glow: isMeasurement ? "rgba(200,160,48,0.5)" : "rgba(94,234,212,0.5)",
    },
  ];

  const bezelBg = isMeasurement
    ? "linear-gradient(135deg, rgba(200,160,48,0.42) 0%, rgba(120,90,15,0.18) 50%, rgba(200,160,48,0.36) 100%)"
    : "linear-gradient(135deg, rgba(94,234,212,0.45) 0%, rgba(15,118,110,0.25) 50%, rgba(94,234,212,0.35) 100%)";

  const plateBg = isMeasurement
    ? "linear-gradient(135deg, #140e04 0%, #2a1a06 50%, #3d2808 100%)"
    : "linear-gradient(135deg, #021a18 0%, #052e2b 50%, #064e47 100%)";

  const plateShadow = isMeasurement
    ? "inset 0 1px 0 rgba(200,160,48,0.22), inset 0 -8px 16px rgba(0,0,0,0.4)"
    : "inset 0 1px 0 rgba(94,234,212,0.25), inset 0 -8px 16px rgba(0,0,0,0.4)";

  const labelColor = isMeasurement ? "rgba(240,210,150,0.75)" : "rgba(94,234,212,0.8)";

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {stats.map((s) => (
        <div key={s.label} className="relative">
          {/* Bezel frame */}
          <div
            aria-hidden
            className="absolute -inset-[2px] pointer-events-none"
            style={{
              clipPath: isMeasurement
                ? undefined
                : "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
              borderRadius: isMeasurement ? 10 : undefined,
              background: bezelBg,
            }}
          />
          {/* Inner plate */}
          <div
            className="relative px-3 py-2.5 overflow-hidden"
            style={{
              clipPath: isMeasurement
                ? undefined
                : "polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)",
              borderRadius: isMeasurement ? 8 : undefined,
              background: plateBg,
              boxShadow: plateShadow,
            }}
          >
            {/* Scanlines — Nexus only */}
            {!isMeasurement && (
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.18] pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, rgba(94,234,212,0.5) 0px, rgba(94,234,212,0.5) 1px, transparent 1px, transparent 3px)",
                }}
              />
            )}
            <div className="relative mb-1 flex items-center gap-1.5">
              <s.icon
                className={`h-3.5 w-3.5 ${s.iconColor}`}
                style={{ filter: `drop-shadow(0 0 3px ${s.glow})` }}
              />
              <span
                className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
                style={{ color: labelColor }}
              >
                {s.label}
              </span>
            </div>
            <div
              className="relative text-2xl font-black text-white tabular-nums md:text-[1.7rem]"
              style={{ textShadow: `0 0 14px ${s.glow}` }}
            >
              {s.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
