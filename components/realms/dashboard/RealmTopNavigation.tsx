"use client";

import type { ReactNode } from "react";
import { ArrowLeft, User, Zap } from "lucide-react";
import type { RealmDashboardConfig } from "@/lib/realms/realm-dashboard-config";

export default function RealmTopNavigation({
  config,
  globalXp,
  currentWeek,
  levelSelector,
  onBack,
  onProfile,
}: {
  config: RealmDashboardConfig;
  globalXp: number | null;
  currentWeek: number;
  levelSelector: ReactNode;
  onBack: () => void;
  onProfile: () => void;
}) {
  const chip = "inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 text-xs font-bold";
  return (
    <header className="absolute inset-x-0 top-0 z-50 flex min-h-14 items-center gap-2 border-b border-white/10 bg-slate-950/70 px-3 backdrop-blur-xl md:px-4">
      <button type="button" onClick={onBack} className={chip} aria-label="Return to the Tower of Knowledge">
        <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span>
      </button>
      <div className={chip} style={{ borderColor: `${config.theme.accent}55`, color: config.theme.accent }}>
        {config.displayName}
      </div>
      {levelSelector}
      <div className="flex-1" />
      <div className={chip} title="Global XP available in every realm">
        <Zap className="h-3.5 w-3.5" style={{ color: config.theme.accent }} />
        {globalXp == null ? "—" : globalXp} XP
      </div>
      <div className={`${chip} hidden sm:inline-flex`} style={{ color: config.theme.accent }}>
        {currentWeek}/{config.totalWeeks} weeks
      </div>
      <button type="button" onClick={onProfile} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/25" aria-label="Open student profile">
        <User className="h-4 w-4" style={{ color: config.theme.accent }} />
      </button>
    </header>
  );
}

