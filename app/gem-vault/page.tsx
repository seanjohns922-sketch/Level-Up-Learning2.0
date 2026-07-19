"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock, Sparkles, Star } from "lucide-react";
import EconomyHeader from "@/components/economy/EconomyHeader";
import GemIcon, { GEM_RARITY as RARITY } from "@/components/gems/GemIcon";
import GemRevealHost from "@/components/gems/GemRevealHost";
import { enqueueReveal } from "@/lib/gem-reveal";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import {
  evaluateGems,
  fetchGemCatalog,
  fetchGemVault,
  setFavouriteGem,
  RARITY_LABEL,
  type GemDefinition,
  type GemVault,
} from "@/lib/gems";
import { MATHS_REALMS } from "@/data/mathsRealms";

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
        // Real student: evaluate first so any owed gems are awarded on open.
        if (isDemo) {
          const v = await fetchGemCatalog();
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
          const v = isDemo ? await fetchGemCatalog() : await fetchGemVault(studentId);
          if (!cancelled) setVault(v);
        } catch {
          try {
            if (!cancelled) setVault(await fetchGemCatalog());
          } catch {
            if (!cancelled) setMessage("The Gem Vault is being prepared. Please try again after the latest update.");
          }
        }
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
  const pct = total > 0 ? Math.round((collected / total) * 100) : 0;
  const favourite = defs.find((d) => d.id === vault?.favourite_gem_id) ?? null;

  const visible = tab === "all" ? defs : defs.filter((d) => d.category === tab);
  const comingSoonRealms = MATHS_REALMS.filter((r) => r.status === "coming_soon");

  async function toggleFavourite(gem: GemDefinition) {
    if (!studentId || isDemo || busy) return;
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
      <GemRevealHost />
      <EconomyHeader />
      <div className="mx-auto max-w-[1180px] px-4 py-6 md:px-6">
        {/* Header */}
        <div className={`${PANEL} mb-5 overflow-hidden`}>
          <div className="relative flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_80%_50%,rgba(245,158,11,0.10),transparent_60%)]" aria-hidden="true" />
            <div className="relative">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-amber-300"><Sparkles className="h-4 w-4" /> Gem Vault</p>
              <h1 className="mt-1 text-3xl font-black md:text-4xl">Your Collection</h1>
              <p className="mt-2 text-sm font-semibold text-white/70">Every gem is a moment you earned through learning.</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-2 w-48 overflow-hidden rounded-full bg-white/12">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-[width] duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm font-black">{collected} <span className="text-white/50">of {total} discovered</span> · {pct}%</span>
              </div>
            </div>
            {/* Favourite display */}
            <div className="relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
              {favourite ? (
                <>
                  <GemIcon rarity={favourite.rarity} size={52} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/50">On display</p>
                    <p className="text-sm font-black">{favourite.name}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm font-bold text-white/50">Choose a gem to display</p>
              )}
            </div>
          </div>
        </div>

        {message ? (
          <div className="mb-4 rounded-md border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-100" role="status">{message}</div>
        ) : null}

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
            {visible.map((gem) => {
              const earnedAt = ownedById.get(gem.id);
              const owned = Boolean(earnedAt);
              const c = RARITY[gem.rarity];
              const showBar = !owned && gem.target > 1;
              return (
                <div key={gem.id} className={`${PANEL} relative flex flex-col items-center overflow-hidden p-4 text-center`} style={owned ? { borderColor: `${c.mid}66`, boxShadow: `0 0 0 1px ${c.mid}33, 0 10px 30px -16px ${c.mid}` } : undefined}>
                  {owned ? (
                    <button type="button" onClick={() => toggleFavourite(gem)} disabled={isDemo || busy} aria-label={vault?.favourite_gem_id === gem.id ? "Displayed in My Home" : "Display in My Home"} className="absolute right-2 top-2 z-10 text-white/40 transition hover:text-amber-300 disabled:opacity-40">
                      <Star className="h-4 w-4" fill={vault?.favourite_gem_id === gem.id ? "#fbbf24" : "none"} color={vault?.favourite_gem_id === gem.id ? "#fbbf24" : "currentColor"} />
                    </button>
                  ) : null}
                  <div className="relative flex h-[76px] items-center justify-center">
                    <GemIcon rarity={gem.rarity} locked={!owned} />
                    {!owned ? <Lock className="absolute h-4 w-4 text-white/40" /> : null}
                  </div>
                  <span className="mt-1 rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide" style={{ color: owned ? c.light : "#94a3b8", background: owned ? `${c.mid}22` : "rgba(148,163,184,0.12)" }}>{RARITY_LABEL[gem.rarity]}</span>
                  <p className={`mt-1.5 text-sm font-black leading-tight ${owned ? "text-white" : "text-white/60"}`}>{gem.name}</p>
                  <p className="mt-1 text-[11px] font-semibold leading-snug text-white/45">{gem.description}</p>
                  {owned ? (
                    <p className="mt-auto pt-2 text-[10px] font-bold text-white/40">Earned {earnedAt ? new Date(earnedAt).toLocaleDateString() : ""}</p>
                  ) : showBar ? (
                    <div className="mt-auto w-full pt-2">
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-white/40" style={{ width: `${Math.min(100, Math.round((gem.current / Math.max(1, gem.target)) * 100))}%` }} />
                      </div>
                      <p className="mt-1 text-[10px] font-black text-white/50">{Math.min(gem.current, gem.target)} / {gem.target}</p>
                    </div>
                  ) : (
                    <p className="mt-auto pt-2 text-[10px] font-bold text-white/35">Not yet earned</p>
                  )}
                </div>
              );
            })}

            {/* Coming-soon realm previews (Realm tab / All) — never counted in completion */}
            {(tab === "realm" || tab === "all")
              ? comingSoonRealms.flatMap((realm) =>
                  [`${realm.name} First Level`, `${realm.name} Legends`].map((label) => (
                    <div key={label} className={`${PANEL} flex flex-col items-center overflow-hidden p-4 text-center opacity-70`}>
                      <div className="relative flex h-[76px] items-center justify-center">
                        <GemIcon rarity="legendary" locked />
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
      </div>
    </main>
  );
}
