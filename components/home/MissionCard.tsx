"use client";

import type { Legend } from "@/data/legends";
import ReadAloudBtn from "@/components/ReadAloudBtn";

type Props = {
  legend: Legend;
  week: number;
  lessonsDone: number;
};

export default function MissionCard({ legend, week, lessonsDone }: Props) {
  const allDone = lessonsDone >= 3;
  const missionText = allDone
    ? "Great work! Complete the weekly quiz to power up the Tower!"
    : `Complete your number lessons to strengthen the Tower of Knowledge and unlock ${legend.name}!`;

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/40 shadow-xl p-5"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.3) inset",
      }}
    >
      <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-teal-200/30 blur-2xl" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-100/80 text-teal-700 text-xs font-extrabold tracking-wide">
            ⚡ MISSION
          </span>
          <ReadAloudBtn text={missionText} />
        </div>
        <p className="text-sm font-bold text-gray-800 leading-snug">
          {missionText}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-teal-200/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${Math.round((lessonsDone / 3) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-teal-600">{lessonsDone}/3</span>
        </div>
      </div>
    </div>
  );
}
