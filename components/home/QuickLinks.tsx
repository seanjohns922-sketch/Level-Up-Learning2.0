"use client";

type Props = {
  onLessons: () => void;
  onLegends: () => void;
  onLevels: () => void;
  onTowerMap: () => void;
  scorePercent: number;
  week: number;
};

export default function QuickLinks({ onLessons, onLegends, onLevels, onTowerMap, scorePercent, week }: Props) {
  return (
    <>
      {/* Tower Map prominent button */}
      <button
        onClick={onTowerMap}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-teal-200/60 hover:shadow-teal-300 hover:brightness-110 transition-all active:scale-[0.98]"
        type="button"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" /><path d="M8 2v16M16 6v16" />
        </svg>
        Tower Map
      </button>

      {/* Quick link tiles */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={onLessons}
          className="bg-card rounded-2xl border border-primary-light shadow-sm p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98] group"
          type="button"
        >
          <div className="h-11 w-11 rounded-xl bg-primary-light text-primary flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
            </svg>
          </div>
          <div className="text-xs font-bold text-foreground">Lessons</div>
        </button>

        <button
          onClick={onLegends}
          className="bg-card rounded-2xl border border-amber-100 shadow-sm p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98] group"
          type="button"
        >
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 21h8M12 17v4M7 4h10l-1 6H8L7 4z" />
            </svg>
          </div>
          <div className="text-xs font-bold text-foreground">My Legends</div>
        </button>

        <button
          onClick={onLevels}
          className="bg-card rounded-2xl border border-blue-100 shadow-sm p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98] group"
          type="button"
        >
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div className="text-xs font-bold text-foreground">Levels</div>
        </button>
      </div>

      {/* Score bar */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground font-medium">Pre-test Score</div>
          <div className="text-2xl font-black text-foreground mt-0.5">{scorePercent}%</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground font-medium">Status</div>
          <div className="text-sm font-extrabold text-primary mt-0.5">Week {week}/12</div>
        </div>
      </div>
    </>
  );
}
