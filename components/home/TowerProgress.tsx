"use client";

import { Zap, CloudOff, Star } from "lucide-react";

type Props = {
  towerStrength: number;
  fogCleared: number;
  legendName: string;
  legendAvatar: string;
};

function CircularProgress({ value, size = 56, strokeWidth = 5, color }: { value: number; size?: number; strokeWidth?: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-gray-100" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}

export default function TowerProgress({ towerStrength, fogCleared, legendName }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm p-4 flex flex-col">
      <h3 className="text-xs font-extrabold text-gray-500 tracking-wider uppercase mb-3">Tower Status</h3>

      <div className="flex items-center gap-4 mb-3">
        {/* Tower strength ring */}
        <div className="relative">
          <CircularProgress value={towerStrength} color="hsl(160, 60%, 45%)" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black text-gray-800">{towerStrength}%</span>
          </div>
        </div>
        <div>
          <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-500" /> Tower Strength
          </div>
          <div className="text-xs font-bold text-gray-800 flex items-center gap-1 mt-1.5">
            <CloudOff className="h-3 w-3 text-emerald-500" /> Fog: {fogCleared}% cleared
          </div>
        </div>
      </div>

      {/* Next legend */}
      <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200/40 px-3 py-2 mt-auto">
        <Star className="h-4 w-4 text-amber-500" />
        <div>
          <div className="text-[10px] font-extrabold text-amber-600 tracking-wide uppercase">Next Legend</div>
          <div className="text-xs font-bold text-gray-800">{legendName}</div>
        </div>
      </div>
    </div>
  );
}
