"use client";

import { useEffect, useState } from "react";
import ComboActivation from "@/components/lesson/ComboActivation";
import { ComboCounter } from "@/components/lesson/ComboCounter";
import { renderStreakSound, setStreakSoundsEnabled, type StreakStyle } from "@/lib/audio/streak-sfx";
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

/** Review-only: fires the in-lesson streak moments for each realm. ?realm=space&n=8 fires on load; &sound=1 turns streak sounds on. */
export default function StreakReview() {
  const [realm, setRealm] = useState<string>("number");
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("realm");
    const n = Number(params.get("n"));
    const realmTimer = setTimeout(() => {
      if (r) setRealm(r);
      if (params.get("sound") === "1") setStreakSoundsEnabled(true);
    }, 0);
    const timer = setTimeout(() => {
      if (n) setCombo(n);
    }, Number(params.get("delay")) || 300);
    return () => {
      clearTimeout(realmTimer);
      clearTimeout(timer);
    };
  }, []);

  // Exposed for review tooling: render a realm's sound offline and return its peak level.
  useEffect(() => {
    (window as unknown as { __renderStreak?: unknown }).__renderStreak = async (style: StreakStyle, power: number) => {
      const buffer = await renderStreakSound(style, power);
      const data = buffer.getChannelData(0);
      const pcm = new Int16Array(data.length);
      let peak = 0;
      for (let i = 0; i < data.length; i += 1) {
        const v = Math.max(-1, Math.min(1, data[i]!));
        peak = Math.max(peak, Math.abs(v));
        pcm[i] = v * 32767;
      }
      let binary = "";
      const bytes = new Uint8Array(pcm.buffer);
      for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
      return { peak, sampleRate: buffer.sampleRate, pcm: btoa(binary) };
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
      <div className="fixed right-6 top-6 w-44"><ComboCounter count={combo} realmId={realm} /></div>
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
