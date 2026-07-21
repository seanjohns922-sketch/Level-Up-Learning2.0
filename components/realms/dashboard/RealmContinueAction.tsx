"use client";

import { Play } from "lucide-react";

export default function RealmContinueAction({ label, accent, onContinue }: { label: string; accent: string; onContinue: () => void }) {
  return (
    <button
      type="button"
      onClick={onContinue}
      className="inline-flex min-h-16 items-center gap-3 rounded-full border-2 border-white/70 px-8 text-base font-black uppercase tracking-[0.14em] text-slate-950 shadow-2xl transition hover:-translate-y-0.5"
      style={{ background: accent, boxShadow: `0 12px 40px ${accent}55` }}
    >
      <Play className="h-5 w-5 fill-current" /> {label}
    </button>
  );
}

