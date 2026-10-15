"use client";

import { useEffect, useMemo, useState } from "react";
import { BatteryCharging, Box, Cpu, Gem, LockKeyhole, Sparkles } from "lucide-react";
import EconomyHeader from "@/components/economy/EconomyHeader";
import GemCase from "@/components/gems/GemCase";
import GemIcon, { cutForGem, emblemForGem } from "@/components/gems/GemIcon";
import GemVaultHeader from "@/components/gems/GemVaultHeader";
import { enqueueReveal } from "@/lib/gem-reveal";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import {
  evaluateGems,
  fetchGemVault,
  setFavouriteGem,
  type GemDefinition,
  type GemRarity,
  type GemVault,
} from "@/lib/gems";
import { MATHS_REALMS } from "@/data/mathsRealms";
import { fetchDemoEconomy, fetchStudentEconomy, type EconomyItem, type EconomyState } from "@/lib/economy";

const COLLECTIBLE_ICONS = { Gem, BatteryCharging, Box, Cpu };
function CollectibleIcon({ item }: { item: EconomyItem }) {
  const Icon = COLLECTIBLE_ICONS[item.icon as keyof typeof COLLECTIBLE_ICONS] ?? Gem;
  return <Icon className="h-8 w-8" />;
}

const TABS: Array<{ id: string; label: string }> = [
  { id: "all", label: "All Gems" },
  { id: "lessons", label: "Lessons" },
  { id: "perfect", label: "Perfect Learning" },
  { id: "quizzes_tests", label: "Quizzes & Tests" },
  { id: "streaks_xp", label: "Streaks & XP" },
  { id: "explorer", label: "Explorer Milestones" },
  { id: "realm", label: "Realm Gems" },
];

const PANEL = "rounded-2xl border border-white/10 bg-white/[0.03]";

export default function GemVaultPage() {
  const student = useMemo(() => getActiveStudentProfile(), []);
  const [vault, setVault] = useState<GemVault | null>(null);
  const [tab, setTab] = useState("all");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<"achievements" | "discoveries">("achievements");
  const [economy, setEconomy] = useState<EconomyState | null>(null);
  const [realm, setRealm] = useState<"measurement" | "number">("measurement");
  const studentId = student?.studentId;
  const isDemo = !studentId || studentId === "demo-preview" || isDemoPreviewMode();

  useEffect(() => {
    if (!studentId) {
      setMessage("Log in as a student to open your Gem Vault.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        // Demo synthesis happens inside the vault API and never writes student data.
        if (isDemo) {
          const v = await fetchGemVault(studentId);
          if (!cancelled) setVault(v);
        } else {
          const r = await evaluateGems(studentId, "vault_open");
          if (!cancelled) {
            enqueueReveal(r.newly_awarded);
            setVault(r.vault);
          }
        }
      } catch {
        try {
          const v = await fetchGemVault(studentId);
          if (!cancelled) setVault(v);
        } catch {
          if (!cancelled) setMessage("The Gem Vault is being prepared. Please try again after the latest update.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId, isDemo]);

  // Realm collectibles ("Discoveries") — folded in from the old Collection Journal.
  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    (async () => {
      try {
        const e = isDemo ? await fetchDemoEconomy() : await fetchStudentEconomy(studentId);
        if (!cancelled) setEconomy(e);
      } catch {
        /* discoveries stay empty */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId, isDemo]);

  const defs = vault?.definitions ?? [];
  const ownedById = useMemo(() => {
    const map = new Map<string, string>();
    for (const o of vault?.owned ?? []) map.set(o.gem_id, o.earned_at);
    return map;
  }, [vault?.owned]);

  const completionDefs = defs.filter((d) => d.active_for_completion !== false);
  const collected = completionDefs.filter((d) => ownedById.has(d.id)).length;
  const total = completionDefs.length;
  const favourite = defs.find((d) => d.id === vault?.favourite_gem_id) ?? null;
  const rarityCounts = useMemo(() => {
    const counts = { common: { owned: 0, total: 0 }, uncommon: { owned: 0, total: 0 }, rare: { owned: 0, total: 0 }, epic: { owned: 0, total: 0 }, legendary: { owned: 0, total: 0 } } as Record<GemRarity, { owned: number; total: number }>;
    for (const d of completionDefs) {
      counts[d.rarity].total += 1;
      if (ownedById.has(d.id)) counts[d.rarity].owned += 1;
    }
    return counts;
  }, [completionDefs, ownedById]);

  const visible = tab === "all" ? defs : defs.filter((d) => d.category === tab);
  const comingSoonRealms = MATHS_REALMS.filter((r) => r.status === "coming_soon");

  const ownedInv = useMemo(() => new Map(economy?.inventory.map((e) => [e.item_key, e]) ?? []), [economy?.inventory]);
  const collectibles = useMemo(() => (economy?.items ?? []).filter((i) => i.category === "collectible" && i.realm_id === realm), [economy?.items, realm]);
  const discCollected = collectibles.filter((i) => ownedInv.has(i.item_key)).length;
  const discPct = collectibles.length ? Math.round((discCollected / collectibles.length) * 100) : 0;

  async function toggleFavourite(gem: GemDefinition) {
    if (!studentId || busy) return;
    setBusy(true);
    try {
      const next = vault?.favourite_gem_id === gem.id ? null : gem.id;
      setVault(await setFavouriteGem(studentId, next));
    } catch {
      setMessage("Could not update your displayed gem. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(1100px_500px_at_50%_-10%,#1a2230,transparent),linear-gradient(#0c0f16,#0a0d13)] text-white">
      <EconomyHeader />
      <div className="mx-auto max-w-[1180px] px-4 py-6 md:px-6">
        <GemVaultHeader collected={collected} total={total} favourite={favourite} rarityCounts={rarityCounts} />

        {message ? (
          <div className="mb-4 rounded-md border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-100" role="status">{message}</div>
        ) : null}

        {/* View toggle: achievement gems vs realm discoveries */}
        <div className="mb-5 inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
          {([["achievements", "Achievements"], ["discoveries", "Discoveries"]] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setView(id)} className={`rounded-lg px-4 py-2 text-xs font-black transition ${view === id ? "bg-white text-slate-900" : "text-white/60 hover:bg-white/10"}`}>{label}</button>
          ))}
        </div>

        {view === "achievements" ? (
        <>
        {/* Tabs */}
        <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-black transition ${tab === t.id ? "bg-white text-slate-900" : "text-white/60 hover:bg-white/10"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {vault === null && !message ? (
          <p className="py-16 text-center text-sm font-bold text-white/40">Opening the vault…</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visible.map((gem) => (
              <GemCase
                key={gem.id}
                gem={gem}
                earnedAt={ownedById.get(gem.id)}
                favourite={vault?.favourite_gem_id === gem.id}
                busy={busy}
                onToggleFavourite={() => toggleFavourite(gem)}
              />
            ))}

            {/* Coming-soon realm previews (Realm tab / All) — never counted in completion */}
            {(tab === "realm" || tab === "all")
              ? comingSoonRealms.flatMap((realm) =>
                  [`${realm.name} First Level`, `${realm.name} Legends`].map((label) => (
                    <div key={label} className={`${PANEL} flex flex-col items-center overflow-hidden p-4 text-center opacity-70`}>
                      <div className="relative flex h-[76px] items-center justify-center">
                        <GemIcon rarity="legendary" cut={cutForGem(`${realm.realmId}-coming-soon`, "legendary")} emblem={emblemForGem(realm.realmId)} locked />
                        <Sparkles className="absolute h-4 w-4 text-amber-300/60" />
                      </div>
                      <span className="mt-1 rounded bg-amber-300/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-200">Coming Soon</span>
                      <p className="mt-1.5 text-sm font-black leading-tight text-white/60">{realm.name}</p>
                      <p className="mt-1 text-[11px] font-semibold leading-snug text-white/40">A new {realm.legendCollectionName} collection is being prepared.</p>
                    </div>
                  )),
                )
              : null}
          </div>
        )}
        </>
        ) : (
          <>
            {/* Discoveries: per-realm collectibles (folded in from the Journal) */}
            <div className="mb-4 inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
              {([["measurement", "Measurelands"], ["number", "Number Nexus"]] as const).map(([id, label]) => (
                <button key={id} type="button" onClick={() => setRealm(id)} className={`rounded-lg px-4 py-2 text-xs font-black transition ${realm === id ? "bg-white text-slate-900" : "text-white/60 hover:bg-white/10"}`}>{label}</button>
              ))}
            </div>
            <div className="mb-5 flex items-center gap-3">
              <div className="h-2 w-48 overflow-hidden rounded-full bg-white/12"><div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-400 transition-[width] duration-500" style={{ width: `${discPct}%` }} /></div>
              <span className="text-sm font-black">{discCollected} <span className="text-white/50">of {collectibles.length} found</span> · {discPct}%</span>
            </div>
            {economy === null ? (
              <p className="py-16 text-center text-sm font-bold text-white/40">Opening your discoveries…</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {collectibles.map((item) => {
                  const inv = ownedInv.get(item.item_key);
                  const owned = Boolean(inv);
                  return (
                    <div key={item.item_key} className={`${PANEL} relative flex flex-col items-center overflow-hidden p-4 text-center`} style={owned ? { borderColor: `${item.accent}66`, boxShadow: `0 0 0 1px ${item.accent}33, 0 10px 30px -16px ${item.accent}` } : undefined}>
                      <div className="relative flex h-[76px] items-center justify-center" style={{ color: owned ? item.accent : undefined }}>
                        {owned ? <CollectibleIcon item={item} /> : <LockKeyhole className="h-7 w-7 text-white/40" />}
                      </div>
                      <span className="mt-1 rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide" style={{ color: owned ? item.accent : "#94a3b8", background: owned ? `${item.accent}22` : "rgba(148,163,184,0.12)" }}>{item.rarity}</span>
                      <p className={`mt-1.5 text-sm font-black leading-tight ${owned ? "text-white" : "text-white/60"}`}>{owned ? item.name : "Undiscovered"}</p>
                      <p className="mt-1 text-[11px] font-semibold leading-snug text-white/45">{owned ? item.description : "Keep learning to discover"}</p>
                      {owned && inv ? <p className="mt-auto pt-2 text-[10px] font-bold text-white/40">Found {new Date(inv.acquired_at).toLocaleDateString()}</p> : null}
                    </div>
                  );
                })}
                {collectibles.length === 0 ? <p className="col-span-full py-10 text-center text-sm font-bold text-white/40">No discoveries in this realm yet.</p> : null}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
