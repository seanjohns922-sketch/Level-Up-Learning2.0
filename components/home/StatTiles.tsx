"use client";

import { Zap, Trophy, Flame, Target } from "lucide-react";

type Props = {
  xp: number;
  levelNum: number;
  streakDays: number;
  accuracy: number;
};

const tiles = [
  {
    key: "xp",
    label: "Current XP",
    icon: Zap,
    bg: "bg-amber-50",
    border: "border-amber-200/60",
    iconBg: "bg-gradient-to-br from-amber-400 to-yellow-500",
    valueColor: "text-amber-900",
  },
  {
    key: "level",
    label: "Your Level",
    icon: Trophy,
    bg: "bg-sky-50",
    border: "border-sky-200/60",
    iconBg: "bg-gradient-to-br from-sky-400 to-blue-500",
    valueColor: "text-sky-900",
  },
  {
    key: "streak",
    label: "Streak",
    icon: Flame,
    bg: "bg-rose-50",
    border: "border-rose-200/60",
    iconBg: "bg-gradient-to-br from-rose-400 to-pink-500",
    valueColor: "text-rose-900",
  },
  {
    key: "accuracy",
    label: "Accuracy",
    icon: Target,
    bg: "bg-emerald-50",
    border: "border-emerald-200/60",
    iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
    valueColor: "text-emerald-900",
  },
];

export default function StatTiles({ xp, levelNum, streakDays, accuracy }: Props) {
  const values: Record<string, string> = {
    xp: `${xp.toLocaleString()}`,
    level: `Level ${levelNum}`,
    streak: `${streakDays}d`,
    accuracy: `${accuracy}%`,
  };

  return (
    <div className="grid grid-cols-4 gap-2.5">
      {tiles.map((t) => (
        <div
          key={t.key}
          className={`rounded-2xl border ${t.border} ${t.bg} p-3 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
        >
          <div
            className={`h-9 w-9 rounded-xl ${t.iconBg} text-white flex items-center justify-center mx-auto mb-2 shadow-sm`}
          >
            <t.icon className="h-4 w-4" />
          </div>
          <div className={`text-base font-black ${t.valueColor} leading-tight`}>
            {values[t.key]}
          </div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
            {t.label}
          </div>
        </div>
      ))}
    </div>
  );
}
