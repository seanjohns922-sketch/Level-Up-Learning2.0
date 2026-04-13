"use client";

import { BookOpen, Trophy, LayoutGrid, Map } from "lucide-react";

type Props = {
  onLessons: () => void;
  onLegends: () => void;
  onLevels: () => void;
  onTowerMap: () => void;
  scorePercent: number;
  week: number;
};

export default function QuickLinks({ onLessons, onLegends, onLevels, onTowerMap, scorePercent, week }: Props) {
  const links = [
    { label: "Tower Map", icon: Map, onClick: onTowerMap, iconBg: "bg-gradient-to-br from-teal-500 to-emerald-600" },
    { label: "Lessons", icon: BookOpen, onClick: onLessons, iconBg: "bg-gradient-to-br from-amber-400 to-amber-500" },
    { label: "My Legends", icon: Trophy, onClick: onLegends, iconBg: "bg-gradient-to-br from-rose-400 to-pink-500" },
    { label: "Levels", icon: LayoutGrid, onClick: onLevels, iconBg: "bg-gradient-to-br from-sky-400 to-blue-500" },
  ];

  return (
    <>
      <div className="grid grid-cols-4 gap-2.5">
        {links.map((l) => (
          <button
            key={l.label}
            onClick={l.onClick}
            className="rounded-2xl border border-gray-200/80 bg-white shadow-sm p-3 text-center hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98] group"
            type="button"
          >
            <div className={`h-10 w-10 rounded-xl ${l.iconBg} text-white flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform shadow-sm`}>
              <l.icon className="h-4.5 w-4.5" />
            </div>
            <div className="text-[11px] font-bold text-gray-700">{l.label}</div>
          </button>
        ))}
      </div>

      {/* Pre-test score strip */}
      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm p-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Pre-test Score</div>
          <div className="text-2xl font-black text-gray-800 mt-0.5">{scorePercent}%</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Progress</div>
          <div className="text-sm font-extrabold text-teal-600 mt-0.5">Week {week}/12</div>
        </div>
      </div>
    </>
  );
}
