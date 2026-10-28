"use client";

import { previewCrystalReveal } from "@/lib/chrono-crystals";

// Review page: show each kind of Chrono Crystal reveal. Nothing is saved.
const CASES = [
  { label: "Everyday crystal (+1)", reveal: { crystals: 64, learningDays: 64, chronorok: "Chronorok Current", milestone: null } },
  { label: "First crystal", reveal: { crystals: 1, learningDays: 1, chronorok: "Chronorok Current", milestone: "first" } },
  { label: "Chronorok opens (day 5)", reveal: { crystals: 5, learningDays: 5, chronorok: "Chronorok Current", milestone: "open" } },
  { label: "25 / 50 / 75 milestone", reveal: { crystals: 50, learningDays: 50, chronorok: "Chronorok Current", milestone: "quarter" } },
  { label: "100 — the Awakening", reveal: { crystals: 100, learningDays: 100, chronorok: "Chronorok Current", milestone: "awaken" } },
] as const;

export default function Page() {
  return (
    <main className="min-h-screen bg-[#2a1c30] p-8 font-sans text-white">
      <h1 className="font-display text-2xl font-black">Chrono Crystal reveals</h1>
      <div className="mt-5 flex flex-wrap gap-3">
        {CASES.map((c) => (
          <button key={c.label} type="button" onClick={() => previewCrystalReveal({ ...c.reveal })} className="rounded-full bg-white px-5 py-3 font-display text-sm font-black text-[#16121f]">{c.label}</button>
        ))}
      </div>
    </main>
  );
}
