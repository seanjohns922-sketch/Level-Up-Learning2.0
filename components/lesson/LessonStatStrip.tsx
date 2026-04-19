"use client";

import { CheckCircle, HelpCircle, Target } from "lucide-react";

export function LessonStatStrip({
  questionsAnswered,
  correctAnswers,
  accuracy,
}: {
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
}) {
  const stats = [
    {
      label: "Questions",
      value: questionsAnswered,
      icon: HelpCircle,
      iconColor: "text-cyan-300",
      glow: "rgba(34,211,238,0.45)",
    },
    {
      label: "Correct",
      value: correctAnswers,
      icon: CheckCircle,
      iconColor: "text-emerald-300",
      glow: "rgba(16,185,129,0.5)",
    },
    {
      label: "Accuracy",
      value: `${accuracy}%`,
      icon: Target,
      iconColor: "text-teal-200",
      glow: "rgba(94,234,212,0.5)",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {stats.map((s) => (
        <div key={s.label} className="relative">
          {/* Bezel frame */}
          <div
            aria-hidden
            className="absolute -inset-[2px] pointer-events-none"
            style={{
              clipPath:
                "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
              background:
                "linear-gradient(135deg, rgba(94,234,212,0.45) 0%, rgba(15,118,110,0.25) 50%, rgba(94,234,212,0.35) 100%)",
            }}
          />
          {/* Inner plate */}
          <div
            className="relative px-3 py-2.5 overflow-hidden"
            style={{
              clipPath:
                "polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)",
              background:
                "linear-gradient(135deg, #021a18 0%, #052e2b 50%, #064e47 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(94,234,212,0.25), inset 0 -8px 16px rgba(0,0,0,0.4)",
            }}
          >
            {/* Scanlines */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.18] pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(94,234,212,0.5) 0px, rgba(94,234,212,0.5) 1px, transparent 1px, transparent 3px)",
              }}
            />
            <div className="relative mb-1 flex items-center gap-1.5">
              <s.icon
                className={`h-3.5 w-3.5 ${s.iconColor}`}
                style={{ filter: `drop-shadow(0 0 3px ${s.glow})` }}
              />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-teal-200/80">
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
