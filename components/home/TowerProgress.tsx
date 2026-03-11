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
    <div className="bg-card rounded-3xl border border-border shadow-sm p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-xs font-extrabold text-muted-foreground tracking-wider">TOWER STATUS</h3>
        <ReadAloudBtn text={summaryText} />
      </div>

      <div className="grid gap-3 flex-1">
        {/* Tower Strength */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-foreground">⚡ Tower Strength</span>
            <span className="text-xs font-extrabold text-teal-600">{towerStrength}%</span>
          </div>
          <div className="h-2 rounded-full bg-teal-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500" style={{ width: `${towerStrength}%` }} />
          </div>
        </div>

        {/* Fog Cleared */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-foreground">🌫️ Fog Cleared</span>
            <span className="text-xs font-extrabold text-emerald-600">{fogCleared}%</span>
          </div>
          <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500" style={{ width: `${fogCleared}%` }} />
          </div>
        </div>

        {/* Current Legend — text only */}
        <div className="flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-100/60 px-3 py-2 mt-1">
          <div>
            <div className="text-[10px] font-extrabold text-amber-600 tracking-wide">NEXT LEGEND</div>
            <div className="text-xs font-bold text-foreground">{legendName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
