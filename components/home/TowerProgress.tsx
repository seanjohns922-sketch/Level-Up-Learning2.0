"use client";

type Props = {
  towerStrength: number;
  fogCleared: number;
  legendName: string;
  legendAvatar: string;
};

export default function TowerProgress({ towerStrength, fogCleared, legendName, legendAvatar }: Props) {
  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm p-5 flex flex-col">
      <h3 className="text-xs font-extrabold text-muted-foreground tracking-wider mb-3">TOWER STATUS</h3>

      <div className="grid gap-3 flex-1">
        {/* Tower Strength */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-foreground">⚡ Tower Strength</span>
            <span className="text-xs font-extrabold text-purple-600">{towerStrength}%</span>
          </div>
          <div className="h-2 rounded-full bg-purple-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-500" style={{ width: `${towerStrength}%` }} />
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

        {/* Current Legend */}
        <div className="flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-100/60 px-3 py-2 mt-1">
          <div className="h-9 w-9 rounded-lg bg-white shadow-sm border border-amber-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={legendAvatar} alt={legendName} className="h-7 w-7 object-contain" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-amber-600 tracking-wide">NEXT LEGEND</div>
            <div className="text-xs font-bold text-foreground">{legendName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
