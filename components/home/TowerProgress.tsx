"use client";

import ReadAloudBtn from "@/components/ReadAloudBtn";

type Props = {
  towerStrength: number;
  fogCleared: number;
  legendName: string;
  legendAvatar: string;
};

export default function TowerProgress({ towerStrength, fogCleared, legendName }: Props) {
  const summaryText = `Tower Strength is ${towerStrength} percent. Fog Cleared is ${fogCleared} percent. Your next legend is ${legendName}.`;

  return (
    <div
      className="rounded-3xl border border-white/40 shadow-xl p-5 flex flex-col"
      style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.3) inset",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-xs font-extrabold text-gray-500 tracking-wider">TOWER STATUS</h3>
        <ReadAloudBtn text={summaryText} />
      </div>

      <div className="grid gap-3 flex-1">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-800">⚡ Tower Strength</span>
            <span className="text-xs font-extrabold text-teal-600">{towerStrength}%</span>
          </div>
          <div className="h-2 rounded-full bg-teal-100/60 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500" style={{ width: `${towerStrength}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-800">🌫️ Fog Cleared</span>
            <span className="text-xs font-extrabold text-emerald-600">{fogCleared}%</span>
          </div>
          <div className="h-2 rounded-full bg-emerald-100/60 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500" style={{ width: `${fogCleared}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl bg-amber-50/80 border border-amber-200/40 px-3 py-2 mt-1">
          <div>
            <div className="text-[10px] font-extrabold text-amber-600 tracking-wide">NEXT LEGEND</div>
            <div className="text-xs font-bold text-gray-800">{legendName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
