"use client";

import { Flame } from "lucide-react";
import type { Legend } from "@/data/legends";

type Props = {
  legend: Legend;
  lessonsDone: number;
  totalLessons: number;
};

export default function MissionStrip({ legend, lessonsDone, totalLessons }: Props) {
  const allDone = lessonsDone >= totalLessons;
  const missionText = allDone
    ? "Complete the weekly quiz to power up the Tower!"
    : `Complete your lessons to strengthen the Tower and unlock ${legend.name}!`;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/8">
      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500/80 to-emerald-600/80 text-white flex items-center justify-center flex-shrink-0">
        <Flame className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white/70 leading-snug truncate">
          {missionText}
        </p>
      </div>
      <span className="text-xs font-extrabold text-emerald-300 flex-shrink-0">
        {lessonsDone}/{totalLessons}
      </span>
    </div>
  );
}
