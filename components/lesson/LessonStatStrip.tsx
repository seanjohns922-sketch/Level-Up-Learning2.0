"use client";

import { BarChart3, CheckCircle, Compass, HelpCircle, Orbit, Sigma, Sparkles, Target } from "lucide-react";

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
  const isStarpath = realmId === "space";
  const isStatistics = realmId === "statistics";
  const isPattern = realmId === "pattern";
  const isRounded = isMeasurement || isStarpath || isStatistics || isPattern;

  const stats = [
    {
      label: isMeasurement || isStarpath || isPattern ? "Challenges" : isStatistics ? "Data Tasks" : "Questions",
      value: questionsAnswered,
      icon: isMeasurement ? Compass : isStarpath ? Orbit : isStatistics ? BarChart3 : isPattern ? Sigma : HelpCircle,
      iconColor: isMeasurement ? "text-amber-300" : isStarpath ? "text-violet-200" : isStatistics ? "text-[#f2bc45]" : isPattern ? "text-emerald-300" : "text-cyan-300",
      glow: isMeasurement ? "rgba(200,160,48,0.5)" : isStarpath ? "rgba(167,139,250,0.55)" : isStatistics ? "rgba(242,188,69,0.5)" : isPattern ? "rgba(52,211,153,0.5)" : "rgba(34,211,238,0.45)",
    },
    {
      label: isMeasurement || isStarpath || isStatistics || isPattern ? "Solved" : "Correct",
      value: correctAnswers,
      icon: CheckCircle,
      iconColor: isMeasurement ? "text-amber-200" : isStarpath ? "text-cyan-200" : isStatistics ? "text-[#8fbf7f]" : isPattern ? "text-emerald-200" : "text-emerald-300",
      glow: isMeasurement ? "rgba(232,200,120,0.55)" : isStarpath ? "rgba(103,232,249,0.55)" : isStatistics ? "rgba(143,191,127,0.5)" : isPattern ? "rgba(52,211,153,0.55)" : "rgba(16,185,129,0.5)",
    },
    {
      label: isMeasurement || isPattern ? "Mastery" : isStarpath ? "Mission Accuracy" : isStatistics ? "Data Accuracy" : "Accuracy",
      value: `${accuracy}%`,
      icon: isMeasurement || isStarpath || isStatistics || isPattern ? Sparkles : Target,
      iconColor: isMeasurement ? "text-amber-200" : isStarpath ? "text-fuchsia-200" : isStatistics ? "text-[#f06b64]" : isPattern ? "text-violet-200" : "text-teal-200",
      glow: isMeasurement ? "rgba(200,160,48,0.5)" : isStarpath ? "rgba(240,171,252,0.5)" : isStatistics ? "rgba(240,107,100,0.5)" : isPattern ? "rgba(124,58,237,0.5)" : "rgba(94,234,212,0.5)",
    },
  ];

  const bezelBg = isMeasurement
    ? "linear-gradient(135deg, rgba(200,160,48,0.42) 0%, rgba(120,90,15,0.18) 50%, rgba(200,160,48,0.36) 100%)"
    : isStarpath
      ? "linear-gradient(135deg, rgba(103,232,249,0.58) 0%, rgba(124,58,237,0.52) 50%, rgba(240,171,252,0.42) 100%)"
      : isStatistics
        ? "linear-gradient(135deg, rgba(242,188,69,0.6) 0%, rgba(240,107,100,0.5) 50%, rgba(143,191,127,0.46) 100%)"
      : isPattern
        ? "linear-gradient(135deg, rgba(16,185,129,0.6) 0%, rgba(124,58,237,0.48) 50%, rgba(52,211,153,0.46) 100%)"
      : "linear-gradient(135deg, rgba(94,234,212,0.45) 0%, rgba(15,118,110,0.25) 50%, rgba(94,234,212,0.35) 100%)";

  const plateBg = isMeasurement
    ? "linear-gradient(135deg, #140e04 0%, #2a1a06 50%, #3d2808 100%)"
    : isStarpath
      ? "linear-gradient(135deg, #170a35 0%, #23205f 52%, #08364a 100%)"
      : isStatistics
        ? "linear-gradient(135deg, #17281f 0%, #2d4932 54%, #493821 100%)"
      : isPattern
        ? "linear-gradient(135deg, #0a110e 0%, #12261f 54%, #1b1638 100%)"
      : "linear-gradient(135deg, #021a18 0%, #052e2b 50%, #064e47 100%)";

  const plateShadow = isMeasurement
    ? "inset 0 1px 0 rgba(200,160,48,0.22), inset 0 -8px 16px rgba(0,0,0,0.4)"
    : isStarpath
      ? "inset 0 1px 0 rgba(165,243,252,0.20), inset 0 -8px 18px rgba(2,6,23,0.48)"
      : isStatistics
        ? "inset 0 1px 0 rgba(255,240,199,0.2), inset 0 -8px 18px rgba(8,18,13,0.48)"
      : isPattern
        ? "inset 0 1px 0 rgba(167,243,208,0.2), inset 0 -8px 18px rgba(6,14,10,0.5)"
      : "inset 0 1px 0 rgba(94,234,212,0.25), inset 0 -8px 16px rgba(0,0,0,0.4)";

  const labelColor = isMeasurement ? "rgba(240,210,150,0.75)" : isStarpath ? "rgba(207,250,254,0.88)" : isStatistics ? "rgba(255,240,199,0.86)" : isPattern ? "rgba(167,243,208,0.85)" : "rgba(94,234,212,0.8)";

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {stats.map((s) => (
        <div key={s.label} className="relative">
          {/* Bezel frame */}
          <div
            aria-hidden
            className="absolute -inset-[2px] pointer-events-none"
            style={{
              clipPath: isRounded
                ? undefined
                : "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
              borderRadius: isRounded ? 10 : undefined,
              background: bezelBg,
            }}
          />
          {/* Inner plate */}
          <div
            className="relative px-3 py-2.5 overflow-hidden"
            style={{
              clipPath: isRounded
                ? undefined
                : "polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)",
              borderRadius: isRounded ? 8 : undefined,
              background: plateBg,
              boxShadow: plateShadow,
            }}
          >
            {/* Scanlines — Nexus only */}
            {!isRounded && (
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
