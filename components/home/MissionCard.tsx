"use client";

import type { Legend } from "@/data/legends";
import { Flame, ArrowRight } from "lucide-react";
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
    <div className="rounded-2xl border border-teal-200/60 bg-gradient-to-br from-teal-50 to-emerald-50 shadow-sm p-4 overflow-hidden relative">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
          <Flame className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider">
              Today&apos;s Challenge
            </span>
            <ReadAloudBtn text={missionText} />
          </div>
          <p className="text-sm font-bold text-gray-800 leading-snug">
            {missionText}
          </p>
          <div className="mt-2.5 flex items-center gap-3">
            <div className="h-1.5 flex-1 rounded-full bg-teal-200/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.round((lessonsDone / 3) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-teal-600">{lessonsDone}/3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
