"use client";

import { useEffect, useMemo, useState } from "react";
import * as Icons from "lucide-react";
import EconomyHeader from "@/components/economy/EconomyHeader";
import StudentAvatar, { type AvatarOutfit } from "@/components/avatar/StudentAvatar";
import PetArt, { petSpeciesForItem } from "@/components/pets/PetArt";
import { economyErrorMessage, equipEconomyItem, fetchStudentEconomy, getExplorerRank, mergeAvatarOutfit, purchaseEconomyItem, RARITY_STYLES, type EconomyCategory, type EconomyItem, type EconomyState } from "@/lib/economy";
import { getActiveStudentProfile } from "@/lib/studentIdentity";

const CATEGORIES: Array<{ id: "all" | EconomyCategory; label: string }> = [
  { id: "all", label: "All" }, { id: "avatar", label: "Avatar" }, { id: "pet", label: "Pets" },
  { id: "home", label: "Home Base" }, { id: "background", label: "Backgrounds" },
  { id: "trail", label: "Trails" }, { id: "title", label: "Titles" },
];

function ItemIcon({ item, size = 32 }: { item: EconomyItem; size?: number }) {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>)[item.icon] ?? Icons.Sparkles;
  return <Icon size={size} strokeWidth={1.8} />;
}

// Pets render as premium art; everything else keeps its lucide icon.
function ItemVisual({ item, size = 32 }: { item: EconomyItem; size?: number }) {
  if (item.category === "pet") return <PetArt species={petSpeciesForItem(item.item_key, item.metadata)} size={Math.round(size * 1.5)} />;
  return <ItemIcon item={item} size={size} />;
}

export default function MarketplacePage() {
  const student = useMemo(() => getActiveStudentProfile(), []);
  const [state, setState] = useState<EconomyState | null>(null);
  const [category, setCategory] = useState<"all" | EconomyCategory>("all");
  const [selected, setSelected] = useState<EconomyItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const sessionMessage = student?.studentId ? null : "Log in as a student to open the Marketplace.";

  useEffect(() => {
    if (!student?.studentId) return;
    fetchStudentEconomy(student.studentId).then((next) => {
      setState(next);
      setSelected(next.items.find((item) => item.purchasable) ?? null);
    }).catch((error) => setMessage(economyErrorMessage(error)));
  }, [student?.studentId]);

  const owned = useMemo(() => new Set(state?.inventory.map((entry) => entry.item_key) ?? []), [state?.inventory]);
  const items = useMemo(() => (state?.items ?? []).filter((item) => item.purchasable && (category === "all" || item.category === category)), [category, state?.items]);
  const selectedOwned = selected ? owned.has(selected.item_key) : false;
  const selectedEquipped = selected ? Object.values(state?.equipped ?? {}).includes(selected.item_key) : false;
  // Preview an avatar item layered over the student's current look, not in isolation.
  const previewOutfit = selected?.category === "avatar"
    ? (() => {
        const base = state ? mergeAvatarOutfit(state) : {};
        const layer = { ...(selected.metadata as Record<string, unknown>) };
        delete layer.slot;
        return { ...base, ...layer } as AvatarOutfit;
      })()
    : undefined;

  async function act() {
    if (!student?.studentId || !selected || busy) return;
    setBusy(true); setMessage(null);
    try {
      const next = selectedOwned
        ? await equipEconomyItem(student.studentId, selected.item_key)
        : await purchaseEconomyItem(student.studentId, selected.item_key);
      setState(next);
      setMessage(selectedOwned ? `${selected.name} is now equipped.` : `${selected.name} added to your collection.`);
    } catch (error) { setMessage(economyErrorMessage(error)); }
    finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen bg-[#eef2f6] text-slate-900">
      <EconomyHeader xp={state?.wallet.xp_balance} essence={state?.wallet.essence} rankLevel={getExplorerRank(state?.wallet.xp_earned ?? 0).level} />
      <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">Rewards for learning</p><h1 className="text-3xl font-black md:text-4xl">Marketplace</h1><p className="mt-1 text-sm text-slate-600">Permanent cosmetic rewards. No academic advantages.</p></div>
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Marketplace categories">{CATEGORIES.map((item) => <button type="button" key={item.id} onClick={() => setCategory(item.id)} className={`shrink-0 rounded-md border px-3 py-2 text-xs font-extrabold ${category === item.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600"}`}>{item.label}</button>)}</div>
        </div>
        {message || sessionMessage ? <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900" role="status">{message ?? sessionMessage}</div> : null}
        <div className="grid gap-5 lg:grid-cols-[1fr_390px]">
          <section className="grid content-start grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4" aria-label="Marketplace items">
            {items.map((item) => { const rarity = RARITY_STYLES[item.rarity]; const isOwned = owned.has(item.item_key); return (
              <button type="button" key={item.item_key} onClick={() => setSelected(item)} className={`min-h-[190px] overflow-hidden rounded-md border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${selected?.item_key === item.item_key ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200"}`}>
                <div className="mb-4 flex h-20 items-center justify-center rounded-md" style={{ color: item.accent, background: `${item.accent}18` }}><ItemVisual item={item} size={42} /></div>
                <div className="flex items-start justify-between gap-2"><h2 className="text-sm font-black leading-tight">{item.name}</h2>{isOwned ? <Icons.Check className="h-4 w-4 shrink-0 text-emerald-600" /> : null}</div>
                <div className="mt-2 flex items-center justify-between gap-2"><span className="rounded px-1.5 py-0.5 text-[10px] font-black uppercase" style={{ color: rarity.color, background: rarity.background }}>{rarity.label}</span><span className="text-xs font-black text-amber-700">{isOwned ? "Owned" : `${item.price} XP`}</span></div>
              </button>
            ); })}
            {state && items.length === 0 ? <div className="col-span-full rounded-md border border-dashed border-slate-300 bg-white p-10 text-center text-sm font-bold text-slate-500">No items in this category yet.</div> : null}
          </section>
          <aside className="h-fit rounded-md border border-slate-200 bg-white p-5 lg:sticky lg:top-20">
            {selected ? <>
              <div className="relative flex h-64 items-end justify-center overflow-hidden rounded-md bg-slate-950" style={{ background: `linear-gradient(160deg, ${selected.accent}35, #0f172a 65%)` }}>
                {selected.category === "avatar" ? <StudentAvatar height={220} outfit={previewOutfit} /> : selected.category === "pet" ? <div className="mb-6"><PetArt species={petSpeciesForItem(selected.item_key, selected.metadata)} size={170} /></div> : <div className="mb-16" style={{ color: selected.accent }}><ItemIcon item={selected} size={100} /></div>}
                <span className="absolute left-3 top-3 rounded bg-black/40 px-2 py-1 text-[10px] font-black uppercase text-white">Preview</span>
              </div>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.16em]" style={{ color: selected.accent }}>{selected.realm_id === "measurement" ? "Measurelands" : selected.realm_id === "number" ? "Number Nexus" : "Universal"}</p>
              <h2 className="mt-1 text-2xl font-black">{selected.name}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{selected.description}</p>
              <button type="button" disabled={busy || selectedEquipped || (!selectedOwned && (state?.wallet.xp_balance ?? 0) < (selected.price ?? 0))} onClick={act} className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-amber-400 px-4 py-3 text-sm font-black text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">
                {selectedEquipped ? <><Icons.Check className="h-4 w-4" /> Equipped</> : selectedOwned ? "Equip item" : <><Icons.Zap className="h-4 w-4" /> Buy for {selected.price} XP</>}
              </button>
            </> : <div className="py-16 text-center text-sm font-bold text-slate-500">Select an item to preview it.</div>}
          </aside>
        </div>
      </div>
    </main>
  );
}
