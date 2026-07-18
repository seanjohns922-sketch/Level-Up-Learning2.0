"use client";

import { useEffect, useMemo, useState } from "react";
import { BatteryCharging, BookOpen, Box, Cpu, Gem, LockKeyhole } from "lucide-react";
import EconomyHeader from "@/components/economy/EconomyHeader";
import { economyErrorMessage, fetchStudentEconomy, getExplorerRank, RARITY_STYLES, type EconomyItem, type EconomyState } from "@/lib/economy";
import { getActiveStudentProfile } from "@/lib/studentIdentity";

const ICONS = { Gem, BatteryCharging, Box, Cpu };

function CollectibleIcon({ item }: { item: EconomyItem }) {
  const Icon = ICONS[item.icon as keyof typeof ICONS] ?? Gem;
  return <Icon className="h-8 w-8" />;
}

export default function CollectionsPage() {
  const student = useMemo(() => getActiveStudentProfile(), []);
  const [state, setState] = useState<EconomyState | null>(null);
  const [realm, setRealm] = useState<"measurement" | "number">("measurement");
  const [error, setError] = useState<string | null>(null);
  const sessionError = student?.studentId ? null : "Log in as a student to open your Collection Journal.";

  useEffect(() => {
    if (!student?.studentId) return;
    fetchStudentEconomy(student.studentId).then(setState).catch((nextError) => setError(economyErrorMessage(nextError)));
  }, [student?.studentId]);

  const owned = useMemo(() => new Map(state?.inventory.map((entry) => [entry.item_key, entry]) ?? []), [state?.inventory]);
  const collectibles = useMemo(() => (state?.items ?? []).filter((item) => item.category === "collectible" && item.realm_id === realm), [realm, state?.items]);
  const collectedCount = collectibles.filter((item) => owned.has(item.item_key)).length;
  const percent = collectibles.length ? Math.round((collectedCount / collectibles.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#f4f7f5] text-slate-900">
      <EconomyHeader xp={state?.wallet.xp_balance} essence={state?.wallet.essence} rankLevel={getExplorerRank(state?.wallet.xp_earned ?? 0).level} />
      <div className="mx-auto max-w-6xl px-4 py-7 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Permanent discoveries</p><h1 className="text-3xl font-black md:text-4xl">Collection Journal</h1><p className="mt-1 text-sm text-slate-600">Every discovery records a piece of your learning journey.</p></div>
          <div className="flex rounded-md border border-slate-200 bg-white p-1" role="tablist">
            <button type="button" role="tab" aria-selected={realm === "measurement"} onClick={() => setRealm("measurement")} className={`rounded px-4 py-2 text-xs font-black ${realm === "measurement" ? "bg-emerald-700 text-white" : "text-slate-600"}`}>Measurelands</button>
            <button type="button" role="tab" aria-selected={realm === "number"} onClick={() => setRealm("number")} className={`rounded px-4 py-2 text-xs font-black ${realm === "number" ? "bg-cyan-800 text-white" : "text-slate-600"}`}>Number Nexus</button>
          </div>
        </div>
        {error || sessionError ? <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">{error ?? sessionError}</div> : null}
        <section className="mt-6 grid gap-4 md:grid-cols-[260px_1fr]">
          <div className="rounded-md border border-slate-200 bg-white p-5">
            <div className={`flex h-12 w-12 items-center justify-center rounded-md ${realm === "measurement" ? "bg-emerald-100 text-emerald-700" : "bg-cyan-100 text-cyan-800"}`}><BookOpen className="h-6 w-6" /></div>
            <h2 className="mt-4 text-xl font-black">{realm === "measurement" ? "Nature Museum" : "Technology Museum"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{realm === "measurement" ? "Gemstones and natural wonders found throughout Measurelands." : "Energy crystals and rare technology recovered from Number Nexus."}</p>
            <div className="mt-6 flex items-end justify-between"><span className="text-3xl font-black">{percent}%</span><span className="text-xs font-bold text-slate-500">{collectedCount} / {collectibles.length}</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${realm === "measurement" ? "bg-emerald-500" : "bg-cyan-600"}`} style={{ width: `${percent}%` }} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {collectibles.map((item) => { const inventory = owned.get(item.item_key); const rarity = RARITY_STYLES[item.rarity]; return (
              <article key={item.item_key} className={`min-h-[190px] rounded-md border p-4 ${inventory ? "border-slate-200 bg-white" : "border-dashed border-slate-300 bg-slate-50"}`}>
                <div className={`flex h-20 items-center justify-center rounded-md ${inventory ? "" : "bg-slate-200 text-slate-400"}`} style={inventory ? { color: item.accent, background: `${item.accent}18` } : undefined}>{inventory ? <CollectibleIcon item={item} /> : <LockKeyhole className="h-7 w-7" />}</div>
                <h3 className={`mt-3 text-sm font-black ${inventory ? "text-slate-900" : "text-slate-500"}`}>{inventory ? item.name : "Undiscovered"}</h3>
                <span className="mt-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-black uppercase" style={{ color: rarity.color, background: rarity.background }}>{rarity.label}</span>
                <p className="mt-2 text-[10px] font-bold text-slate-400">{inventory ? `Found ${new Date(inventory.acquired_at).toLocaleDateString("en-AU")}` : "Keep learning to discover"}</p>
              </article>
            ); })}
          </div>
        </section>
      </div>
    </main>
  );
}
