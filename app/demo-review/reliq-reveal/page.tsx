"use client";

import { useState } from "react";
import LegendUnlockReveal from "@/components/LegendUnlockReveal";
import { getLegendForYear, type LegendRealmId } from "@/data/legends";

const REALMS: LegendRealmId[] = ["number-nexus", "measurelands", "starpath", "pattern-peaks", "statistica", "chance-hollow"];

/** Review-only: replays the RELIQ unlock reveal for each realm without touching progress. */
export default function ReliqRevealReview() {
  const [realm, setRealm] = useState<LegendRealmId>("measurelands");
  const [run, setRun] = useState(0);
  const [open, setOpen] = useState(true);
  const legend = getLegendForYear("Year 4", realm);

  return (
    <main className="min-h-screen bg-[#07080d] p-6 text-white">
      <h1 className="text-xl font-black">RELIQ reveal review</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {REALMS.map((id) => (
          <button key={id} type="button" onClick={() => { setRealm(id); setRun((n) => n + 1); setOpen(true); }} className={`rounded-lg border px-3 py-2 text-sm font-bold ${id === realm ? "border-white bg-white/15" : "border-white/20"}`}>
            {id}
          </button>
        ))}
      </div>
      {open && (
        <LegendUnlockReveal
          key={`${realm}-${run}`}
          legend={legend}
          scorePercent={90}
          onContinue={() => setOpen(false)}
          onViewLegends={() => setOpen(false)}
        />
      )}
    </main>
  );
}
