"use client";

type Props = {
  onLessons: () => void;
  onLegends: () => void;
  onLevels: () => void;
  onTowerMap: () => void;
  scorePercent: number;
  week: number;
};

const frostedStyle = {
  background: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(255,255,255,0.3) inset",
};

export default function QuickLinks({ onLessons, onLegends, onLevels, onTowerMap, scorePercent, week }: Props) {
  return (
    <>
      <button
        onClick={onTowerMap}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:brightness-110 transition-all active:scale-[0.98]"
        type="button"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" /><path d="M8 2v16M16 6v16" />
        </svg>
        Tower Map
      </button>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={onLessons}
          className="rounded-2xl border border-white/40 shadow-lg p-4 text-center hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] group"
          style={frostedStyle}
          type="button"
        >
          <div className="h-11 w-11 rounded-xl bg-teal-100/80 text-teal-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
            </svg>
          </div>
          <div className="text-xs font-bold text-gray-800">Lessons</div>
        </button>

        <button
          onClick={onLegends}
          className="rounded-2xl border border-white/40 shadow-lg p-4 text-center hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] group"
          style={frostedStyle}
          type="button"
        >
          <div className="h-11 w-11 rounded-xl bg-amber-50/80 text-amber-500 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 21h8M12 17v4M7 4h10l-1 6H8L7 4z" />
            </svg>
          </div>
          <div className="text-xs font-bold text-gray-800">My Legends</div>
        </button>

        <button
          onClick={onLevels}
          className="rounded-2xl border border-white/40 shadow-lg p-4 text-center hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] group"
          style={frostedStyle}
          type="button"
        >
          <div className="h-11 w-11 rounded-xl bg-blue-50/80 text-blue-500 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div className="text-xs font-bold text-gray-800">Levels</div>
        </button>
      </div>

      <div
        className="rounded-2xl border border-white/40 shadow-lg p-4 flex items-center justify-between"
        style={frostedStyle}
      >
        <div>
          <div className="text-xs text-gray-500 font-medium">Pre-test Score</div>
          <div className="text-2xl font-black text-gray-800 mt-0.5">{scorePercent}%</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 font-medium">Status</div>
          <div className="text-sm font-extrabold text-teal-600 mt-0.5">Week {week}/12</div>
        </div>
      </div>
    </>
  );
}
