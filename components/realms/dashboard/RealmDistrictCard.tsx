"use client";

import { Check, Lock } from "lucide-react";
import type { RealmDistrictConfig } from "@/lib/realms/realm-dashboard-config";
import type { RealmDistrictState } from "./types";

export default function RealmDistrictCard({
  district,
  state,
  accent,
  onSelect,
}: {
  district: RealmDistrictConfig;
  state: RealmDistrictState;
  accent: string;
  onSelect: () => void;
}) {
  const locked = state === "locked";
  return (
    <button
      type="button"
      disabled={locked}
      onClick={onSelect}
      className="min-h-28 w-full rounded-lg border bg-slate-950/75 p-4 text-left text-white shadow-xl backdrop-blur-md transition enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
      style={{ borderColor: state === "current" ? accent : "rgba(255,255,255,0.18)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: locked ? "rgba(255,255,255,0.45)" : accent }}>
            Weeks {district.weeks.join(" · ")} · {state}
          </p>
          <h2 className="mt-1 text-lg font-black uppercase tracking-[0.08em]">{district.title}</h2>
        </div>
        {locked ? <Lock className="h-4 w-4" /> : null}
        {state === "completed" ? <Check className="h-5 w-5" style={{ color: accent }} /> : null}
      </div>
      <p className="mt-2 text-xs font-semibold leading-5 text-white/60">{district.description}</p>
    </button>
  );
}

