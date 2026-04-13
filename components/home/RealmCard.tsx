"use client";

const REALMS = [
  { name: "Number Nexus", active: true, icon: "N", color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", border: "border-emerald-200/60" },
  { name: "Shape Citadel", active: false, icon: "S", color: "from-blue-400 to-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  { name: "Data Lagoon", active: false, icon: "D", color: "from-cyan-400 to-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100" },
  { name: "Pattern Peaks", active: false, icon: "P", color: "from-amber-400 to-orange-500", bg: "bg-amber-50", border: "border-amber-100" },
];

export default function RealmCard() {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm p-4">
      <h3 className="text-xs font-extrabold text-gray-500 tracking-wider uppercase mb-3">Realms</h3>
      <div className="grid gap-2">
        {REALMS.map((r) => (
          <div
            key={r.name}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition border ${
              r.active
                ? `${r.bg} ${r.border}`
                : "bg-gray-50 border-gray-100 opacity-50"
            }`}
          >
            <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${r.color} text-white text-xs font-black flex items-center justify-center shadow-sm`}>
              {r.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-800 truncate">{r.name}</div>
            </div>
            {r.active ? (
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">ACTIVE</span>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
