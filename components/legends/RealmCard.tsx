"use client";

import { Lock, Sparkles, ChevronRight, Check } from "lucide-react";
import type { RealmDef } from "@/app/legends/page";
import ReliqsWordmark from "@/components/brand/ReliqsWordmark";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { getReliqsColor } from "@/lib/reliqs-brand";

export default function RealmCard({ realm, collected, onClick }: {
  realm: RealmDef;
  collected: number;
  onClick?: () => void;
}) {
  const isOpen = realm.status === "open";
  const color = getReliqsColor(realm.id);
  const complete = isOpen && realm.totalLegends > 0 && collected >= realm.totalLegends;
  const percentage = realm.totalLegends > 0 ? Math.min(100, collected / realm.totalLegends * 100) : 0;

  const narration = `${realm.name}. ${realm.legendLine}. ${isOpen ? `You have collected ${collected} out of ${realm.totalLegends} RELIQS. ${complete ? "Collection complete." : "Open this vault to see your collection."}` : realm.status === "coming-soon" ? "Coming soon." : "This vault will unlock in a future update."}`;

  return (
    <div
      className="group relative w-full overflow-hidden rounded-2xl transition duration-200"
      style={{
        background: "linear-gradient(145deg, rgba(25,28,33,0.94), rgba(10,12,17,0.90))",
        border: `1px solid ${isOpen ? color : "#ffffff30"}`,
        boxShadow: "0 14px 36px rgba(0,0,0,0.25)",
        backdropFilter: "blur(16px)",
      }}
    >
      <button
        type="button"
        onClick={isOpen ? onClick : undefined}
        disabled={!isOpen}
        aria-label={`${realm.name}: ${isOpen ? `${collected} of ${realm.totalLegends} RELIQS collected. Open vault` : realm.status === "coming-soon" ? "Coming soon" : "Locked"}`}
        className={`w-full rounded-2xl p-5 text-left focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white ${isOpen ? "hover:bg-white/5" : "opacity-60"}`}
      >
      <div className="mb-5 flex items-center justify-between gap-4">
        <ReliqsWordmark color={color} className="max-w-[190px]" />
        {isOpen ? <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-white/60 transition group-hover:translate-x-1 motion-reduce:transition-none" /> : <Lock aria-hidden="true" className="h-4 w-4 shrink-0 text-white/50" />}
      </div>
      <h2 className="text-lg font-extrabold tracking-tight text-white">{realm.name}</h2>
      <p className="mt-1 text-sm text-white/65">{realm.legendLine}</p>
      <div className="mt-5 border-t border-white/10 pt-4">
        {isOpen ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
              <span className="text-white/85">{collected} / {realm.totalLegends} collected</span>
              {complete ? <span className="inline-flex items-center gap-1 text-amber-200"><Check aria-hidden="true" className="h-3.5 w-3.5" /> Collection complete</span> : <span className="text-white/60">Open vault</span>}
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: color }} />
            </div>
          </>
        ) : (
          <span className="inline-flex items-center gap-2 text-xs font-bold text-white/65">
            {realm.status === "coming-soon" ? <><Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> Coming soon</> : <><Lock aria-hidden="true" className="h-3.5 w-3.5" /> Unlock in future updates</>}
          </span>
        )}
      </div>
      </button>
      <div className="px-5 pb-5">
        <ReadAloudBtn text={narration} label="Listen" size="md" rate={0.9} className="min-h-11 !border-white/25 !bg-white/10 !text-white hover:!bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" />
      </div>
    </div>
  );
}
