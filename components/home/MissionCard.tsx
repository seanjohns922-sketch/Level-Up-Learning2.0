"use client";

import type { Legend } from "@/data/legends";

type Props = {
  legend: Legend;
  week: number;
  lessonsDone: number;
};

export default function MissionCard({ legend, week, lessonsDone }: Props) {
  const allDone = lessonsDone >= 3;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 rounded-3xl border border-purple-100/60 shadow-lg shadow-purple-100/30 p-5">
      {/* Decorative glow */}
      <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-purple-200/30 blur-2xl" />

      <div className="relative flex items-start gap-4">
        {/* Legend avatar */}
        <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-white shadow-md border border-purple-100 flex items-center justify-center overflow-hidden">
          <img src={legend.images.avatar} alt={legend.name} className="h-14 w-14 object-contain" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold tracking-wide">
              ⚡ MISSION
            </span>
          </div>
          <p className="text-sm font-bold text-foreground leading-snug">
            {allDone
              ? "Great work! Complete the weekly quiz to power up the Tower!"
              : `Complete your number lessons to strengthen the Tower of Knowledge and unlock ${legend.name}!`}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-purple-200/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-500"
                style={{ width: `${Math.round((lessonsDone / 3) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-purple-600">{lessonsDone}/3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
