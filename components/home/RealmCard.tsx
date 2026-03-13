"use client";

const REALMS = [
  { name: "Number Nexus", active: true, icon: "🔢", color: "from-emerald-500 to-teal-600" },
  { name: "Shape Citadel", active: false, icon: "🔷", color: "from-blue-400 to-blue-600" },
  { name: "Data Lagoon", active: false, icon: "📊", color: "from-cyan-400 to-cyan-600" },
  { name: "Pattern Peaks", active: false, icon: "🌀", color: "from-amber-400 to-orange-500" },
];

export default function RealmCard() {
  return (
    <div
      className="rounded-3xl border border-white/40 shadow-xl p-5"
      style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.3) inset",
      }}
    >
      <h3 className="text-xs font-extrabold text-gray-500 tracking-wider mb-3">REALMS</h3>
      <div className="grid gap-2">
        {REALMS.map((r) => (
          <div
            key={r.name}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
              r.active
                ? "bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200/60"
                : "bg-gray-100/50 opacity-50"
            }`}
          >
            <span className="text-lg">{r.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-800 truncate">{r.name}</div>
            </div>
            {r.active ? (
              <span className="text-[10px] font-extrabold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">ACTIVE</span>
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
