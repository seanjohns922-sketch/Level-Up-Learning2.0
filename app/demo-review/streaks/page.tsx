"use client";

import { useEffect, useState } from "react";
import ComboActivation from "@/components/lesson/ComboActivation";
import NexusActivation from "@/components/lesson/NexusActivation";

const REALMS = [
  ["number", "Number Nexus"],
  ["measurement", "Measurelands"],
  ["space", "Starpath"],
  ["pattern", "Pattern Peaks"],
  ["statistics", "Statistica"],
  ["chance", "Chance Hollow"],
] as const;
const STEPS = [3, 5, 8, 10];

/** Review-only: fires the in-lesson streak moments for each realm. ?realm=space&n=8 fires on load. */
export default function StreakReview() {
  const [realm, setRealm] = useState<string>("number");
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("realm");
    const n = Number(params.get("n"));
    const realmTimer = setTimeout(() => {
      if (r) setRealm(r);
    }, 0);
    const timer = setTimeout(() => {
      if (n) setCombo(n);
    }, Number(params.get("delay")) || 300);
    return () => {
      clearTimeout(realmTimer);
      clearTimeout(timer);
    };
  }, []);

  function fire(n: number) {
    setCombo(n - 1);
    setTimeout(() => setCombo(n), 30);
  }

  return (
    <main className="min-h-screen bg-[#0b1020] p-6 text-white">
      <h1 className="text-xl font-black">Streak reveals review</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {REALMS.map(([id, label]) => (
          <button key={id} type="button" onClick={() => { setRealm(id); setCombo(0); }} className={`rounded-lg border px-3 py-2 text-sm font-bold ${realm === id ? "border-white bg-white/15" : "border-white/20"}`}>{label}</button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {STEPS.map((n) => (
          <button key={n} type="button" onClick={() => fire(n)} className="rounded-lg border border-white/20 px-3 py-2 text-sm font-bold">{n} in a row</button>
        ))}
      </div>
      <div data-combo-counter className="fixed right-6 top-6 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-center"><div className="text-[10px] font-black tracking-widest text-white/60">STREAK</div><div className="text-2xl font-black">{combo}</div></div>
      {/* Stand-in lesson card so the overlay is judged over real-looking content */}
      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm font-bold text-white/60">Question 6 of 12</p>
        <p className="mt-2 text-2xl font-black">What is 7 × 8?</p>
        <div className="mt-6 grid grid-cols-2 gap-3">{[54, 56, 63, 48].map((v) => <div key={v} className="rounded-xl border border-white/15 bg-white/5 p-4 text-center text-xl font-black">{v}</div>)}</div>
      </div>
      <ComboActivation comboCount={combo} realmId={realm} />
      <NexusActivation comboCount={combo} realmId={realm} />
    </main>
  );
}
