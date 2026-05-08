"use client";

import { Flame } from "lucide-react";
import type { Legend } from "@/data/legends";

type Props = {
  legend: Legend;
  lessonsDone: number;
  totalLessons: number;
  isPrep?: boolean;
};

export default function MissionStrip({ legend, lessonsDone, totalLessons, isPrep }: Props) {
  const allDone = lessonsDone >= totalLessons;
  const missionText = isPrep
    ? allDone
      ? `Complete the weekly quiz to unlock ${legend.name}!`
      : `Complete your lessons to unlock ${legend.name}!`
    : allDone
      ? "Complete the weekly quiz to power up the Tower!"
      : `Complete your lessons to strengthen the Tower and unlock ${legend.name}!`;

  return (
    <div className="relative">
      {/* Outer bezel */}
      <div
        className="absolute -inset-[2px]"
        style={{
          clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
          background: "linear-gradient(135deg, rgba(94,234,212,0.45), rgba(13,148,136,0.15) 40%, rgba(13,148,136,0.45))",
        }}
      />
      <div
        className="relative flex items-center gap-3 px-4 py-3"
        style={{
          background: "linear-gradient(135deg, #021a18 0%, #052e2b 50%, #064e47 100%)",
          clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
          boxShadow: "inset 0 1px 0 rgba(94,234,212,0.2), inset 0 -8px 16px rgba(0,0,0,0.4), 0 0 18px rgba(20,184,166,0.18)",
        }}
      >
        {/* Scanline */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(94,234,212,0.6) 0 1px, transparent 1px 3px)" }}
        />
        {/* Hex emblem */}
        <span
          className="relative h-8 w-8 flex items-center justify-center flex-shrink-0"
          style={{
            clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
            background: "radial-gradient(circle at 30% 30%, #5eead4, #14b8a6 50%, #064e47 100%)",
            boxShadow: "inset 0 0 8px rgba(0,0,0,0.4), 0 0 10px rgba(94,234,212,0.5)",
          }}
        >
          <Flame className="h-4 w-4 text-teal-50" />
        </span>
        <div className="relative flex-1 min-w-0">
          <p className="text-xs font-bold text-teal-50/90 leading-snug truncate">
            {missionText}
          </p>
        </div>
        <span className="relative text-[11px] font-mono font-extrabold text-teal-200 tracking-[0.16em] flex-shrink-0">
          {lessonsDone}/{totalLessons}
        </span>
      </div>
    </div>
  );
}
