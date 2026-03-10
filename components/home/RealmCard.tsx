"use client";

const REALMS = [
  { name: "Number Nexus", active: true, icon: "🔢", color: "from-emerald-500 to-teal-600" },
  { name: "Shape Citadel", active: false, icon: "🔷", color: "from-blue-400 to-blue-600" },
  { name: "Data Lagoon", active: false, icon: "📊", color: "from-cyan-400 to-cyan-600" },
  { name: "Pattern Peaks", active: false, icon: "🌀", color: "from-amber-400 to-orange-500" },
];

export default function RealmCard() {
  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm p-5">
      <h3 className="text-xs font-extrabold text-muted-foreground tracking-wider mb-3">REALMS</h3>
      <div className="grid gap-2">
        {REALMS.map((r) => (
          <div
            key={r.name}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
              r.active
                ? "bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60"
                : "bg-muted/40 opacity-50"
            }`}
          >
            <span className="text-lg">{r.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground truncate">{r.name}</div>
            </div>
            {r.active ? (
              <span className="text-[10px] font-extrabold text-primary bg-primary-light px-2 py-0.5 rounded-full">ACTIVE</span>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
