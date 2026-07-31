"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Heart,
  Lock,
  Sparkles,
  Star,
  ToyBrick,
  X,
} from "lucide-react";
import EconomyHeader from "@/components/economy/EconomyHeader";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import {
  acknowledgeRealmieUnlocks,
  fetchRealmieCollection,
  setRealmieDisplaySlot,
  setRealmieFavourite,
  type RealmieCollection,
  type RealmieDefinition,
  type RealmieRealmId,
} from "@/lib/realmies";
import { getActiveStudentProfile } from "@/lib/studentIdentity";

const REALMS: Array<{
  id: RealmieRealmId;
  label: string;
  character: string;
  accent: string;
  panel: string;
}> = [
  { id: "number", label: "Number Nexus", character: "Numbot", accent: "#22d3ee", panel: "from-cyan-400/15 to-emerald-400/5" },
  { id: "measurement", label: "Measurelands", character: "Meazurex", accent: "#fbbf24", panel: "from-amber-300/15 to-emerald-400/5" },
  { id: "space", label: "Starpath", character: "Geospin", accent: "#c084fc", panel: "from-violet-400/20 to-cyan-400/5" },
];

const RARITY_LABEL = {
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

function FigureImage({
  figure,
  locked = false,
  className = "",
}: {
  figure: RealmieDefinition;
  locked?: boolean;
  className?: string;
}) {
  return figure.asset_path ? (
    <img
      src={figure.asset_path}
      alt={locked ? "Locked Realmie silhouette" : figure.display_name}
      className={`h-full w-full object-contain ${locked ? "brightness-0 saturate-0 opacity-55" : ""} ${className}`}
    />
  ) : (
    <ToyBrick className="h-14 w-14 text-white/25" aria-hidden="true" />
  );
}

export default function MyRealmiesPage() {
  const [student] = useState(() => getActiveStudentProfile());
  const [collection, setCollection] = useState<RealmieCollection | null>(null);
  const [realm, setRealm] = useState<RealmieRealmId>("number");
  const [selected, setSelected] = useState<RealmieDefinition | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [unlockCount, setUnlockCount] = useState(0);
  const studentId = student?.studentId;
  const demo = studentId === "demo-preview" || isDemoPreviewMode();

  async function reload() {
    if (!studentId) return;
    const next = await fetchRealmieCollection(studentId);
    setCollection(next);
    setUnlockCount(Number(next.backfill.unseen_count ?? 0));
    setSelected((current) => current
      ? next.catalogue.find((figure) => figure.realmie_key === current.realmie_key) ?? null
      : null);
  }

  useEffect(() => {
    if (!studentId) {
      setMessage("Log in as a student to open My Realmies.");
      return;
    }
    let cancelled = false;
    void fetchRealmieCollection(studentId)
      .then((next) => {
        if (cancelled) return;
        setCollection(next);
        setUnlockCount(Number(next.backfill.unseen_count ?? 0));
      })
      .catch(() => {
        if (!cancelled) setMessage("My Realmies could not be opened. Please try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const statusByRealm = useMemo(
    () => new Map(collection?.availability.map((entry) => [entry.realm_id, entry.status]) ?? []),
    [collection?.availability],
  );
  const figures = useMemo(
    () => (collection?.catalogue ?? [])
      .filter((figure) => figure.realm_id === realm)
      .sort((a, b) => a.evolution_level - b.evolution_level),
    [collection?.catalogue, realm],
  );
  const visibleCatalogue = useMemo(
    () => (collection?.catalogue ?? []).filter((figure) => demo || statusByRealm.get(figure.realm_id) === "live"),
    [collection?.catalogue, demo, statusByRealm],
  );
  const collected = visibleCatalogue.filter((figure) => figure.owned).length;
  const displayBySlot = useMemo(
    () => new Map((collection?.display ?? []).map((entry) => [entry.slot_number, entry])),
    [collection?.display],
  );
  const currentRealm = REALMS.find((entry) => entry.id === realm) ?? REALMS[0];
  const comingSoon = !demo && statusByRealm.get(realm) === "coming_soon";

  async function toggleFavourite(figure: RealmieDefinition) {
    if (!studentId || busy || !figure.owned) return;
    setBusy(true);
    setMessage(null);
    try {
      await setRealmieFavourite(studentId, figure, !figure.favourite);
      await reload();
    } catch {
      setMessage("That favourite could not be updated. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function assignSlot(slot: number, figure: RealmieDefinition | null) {
    if (!studentId || busy || (figure && !figure.owned)) return;
    setBusy(true);
    setMessage(null);
    try {
      await setRealmieDisplaySlot(studentId, slot, figure);
      await reload();
    } catch {
      setMessage("That display slot could not be updated. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function closeUnlockCelebration() {
    setUnlockCount(0);
    if (!studentId) return;
    try {
      await acknowledgeRealmieUnlocks(studentId);
    } catch {
      // The celebration can close even if acknowledgement needs another attempt.
    }
  }

  return (
    <main className="min-h-screen bg-[#090d16] text-white">
      <EconomyHeader />

      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.16),transparent_42%),linear-gradient(180deg,#11182a,#090d16)]">
        <div className="mx-auto max-w-[1380px] px-4 py-7 md:px-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">
                <ToyBrick className="h-4 w-4" aria-hidden="true" /> Digital collection
              </p>
              <h1 className="mt-2 text-4xl font-black">My Realmies</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold text-white/60">
                Realmies evolve as you master each realm. Choose your favourites and place up to six on display.
              </p>
              {demo ? (
                <p className="mt-3 inline-flex items-center gap-2 rounded-md border border-amber-200/30 bg-amber-300/10 px-3 py-2 text-xs font-black text-amber-100">
                  <Sparkles className="h-4 w-4" aria-hidden="true" /> Demo Mode: all 18 Realmies are unlocked
                </p>
              ) : null}
            </div>
            <div className="flex gap-3">
              <div className="min-w-28 rounded-md border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/45">Collected</p>
                <p className="mt-1 text-xl font-black">{collected}<span className="text-sm text-white/35">/{visibleCatalogue.length}</span></p>
              </div>
              <div className="min-w-28 rounded-md border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/45">On display</p>
                <p className="mt-1 text-xl font-black">{collection?.display.length ?? 0}<span className="text-sm text-white/35">/6</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1380px] px-4 py-6 md:px-6">
        {message ? (
          <div className="mb-5 rounded-md border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-100" role="status">
            {message}
          </div>
        ) : null}

        <section aria-labelledby="display-heading">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">My Home display</p>
              <h2 id="display-heading" className="mt-1 text-xl font-black">Display Shelf</h2>
            </div>
            <p className="text-xs font-bold text-white/40">Select an empty slot from a Realmie detail card.</p>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {Array.from({ length: 6 }, (_, index) => {
              const slot = index + 1;
              const entry = displayBySlot.get(slot);
              const figure = entry ? collection?.catalogue.find((item) => item.realmie_key === entry.realmie_key) : null;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => figure ? setSelected(figure) : undefined}
                  className="relative flex aspect-[4/5] min-h-28 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.02))] p-2 transition hover:border-cyan-200/35"
                  aria-label={figure ? `Display slot ${slot}: ${figure.display_name}` : `Empty display slot ${slot}`}
                >
                  <span className="absolute left-2 top-2 text-[10px] font-black text-white/30">{slot}</span>
                  {figure ? <FigureImage figure={figure} /> : <span className="text-xs font-black uppercase tracking-wider text-white/20">Empty</span>}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="collection-heading">
          <div className="flex gap-1 overflow-x-auto border-b border-white/10" role="tablist" aria-label="Realm collections">
            {REALMS.map((entry) => {
              const isComingSoon = !demo && statusByRealm.get(entry.id) === "coming_soon";
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={realm === entry.id}
                  onClick={() => setRealm(entry.id)}
                  className={`shrink-0 border-b-2 px-4 py-3 text-sm font-black transition ${realm === entry.id ? "border-cyan-300 text-white" : "border-transparent text-white/45 hover:text-white/75"}`}
                >
                  {entry.label}
                  {isComingSoon ? <span className="ml-2 rounded bg-violet-300/15 px-1.5 py-0.5 text-[9px] uppercase text-violet-200">Coming soon</span> : null}
                </button>
              );
            })}
          </div>

          <div className={`mt-5 rounded-md border border-white/10 bg-gradient-to-br ${currentRealm.panel} p-4 md:p-5`}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: currentRealm.accent }}>{currentRealm.label}</p>
                <h2 id="collection-heading" className="mt-1 text-2xl font-black">{currentRealm.character} Evolutions</h2>
              </div>
              {!comingSoon ? (
                <p className="text-sm font-black text-white/50">{figures.filter((figure) => figure.owned).length} / {figures.length}</p>
              ) : null}
            </div>

            {collection === null && !message ? (
              <p className="py-20 text-center text-sm font-bold text-white/40">Opening your collection…</p>
            ) : comingSoon ? (
              <div className="my-5 flex min-h-72 flex-col items-center justify-center rounded-md border border-violet-200/15 bg-black/20 px-5 text-center">
                <Sparkles className="h-8 w-8 text-violet-200" aria-hidden="true" />
                <h3 className="mt-4 text-2xl font-black">Geospin Realmies are coming soon</h3>
                <p className="mt-2 max-w-xl text-sm font-semibold text-white/55">Starpath is still being prepared for students. Its Realmies will unlock when the realm goes live.</p>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {figures.map((figure) => (
                  <button
                    key={figure.realmie_key}
                    type="button"
                    onClick={() => setSelected(figure)}
                    className="group relative flex min-h-[270px] flex-col overflow-hidden rounded-md border border-white/10 bg-black/25 p-3 text-left transition hover:-translate-y-0.5 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                  >
                    <span className="absolute left-3 top-3 z-10 rounded bg-black/45 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white/65">Level {figure.evolution_level}</span>
                    {figure.favourite ? <Heart className="absolute right-3 top-3 z-10 h-4 w-4 fill-rose-400 text-rose-400" aria-label="Favourite" /> : null}
                    <span className="flex h-44 items-center justify-center">
                      <FigureImage figure={figure} locked={!figure.owned} className="transition-transform duration-300 group-hover:scale-[1.03]" />
                      {!figure.owned ? <Lock className="absolute h-6 w-6 text-white/65" aria-hidden="true" /> : null}
                    </span>
                    <span className="mt-auto">
                      <span className="block text-[9px] font-black uppercase tracking-wider" style={{ color: currentRealm.accent }}>{RARITY_LABEL[figure.rarity]}</span>
                      <span className={`mt-1 block text-sm font-black leading-tight ${figure.owned ? "text-white" : "text-white/55"}`}>{figure.owned ? figure.display_name : "Locked Realmie"}</span>
                      <span className="mt-1 block text-[11px] font-semibold text-white/35">{figure.owned ? "View figure" : `Complete Level ${figure.evolution_level}`}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={selected.display_name} onClick={() => setSelected(null)}>
          <div className="grid max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-md border border-white/15 bg-[#121827] shadow-2xl md:grid-cols-[minmax(260px,44%)_1fr]" onClick={(event) => event.stopPropagation()}>
            <div className="relative flex min-h-80 items-center justify-center bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,.18),transparent_62%)] p-6">
              <FigureImage figure={selected} locked={!selected.owned} />
              {!selected.owned ? <Lock className="absolute h-9 w-9 text-white/70" aria-hidden="true" /> : null}
            </div>
            <div className="relative p-6">
              <button type="button" onClick={() => setSelected(null)} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-white/70 hover:bg-white/10" aria-label="Close Realmie details">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">Level {selected.evolution_level} · {RARITY_LABEL[selected.rarity]}</p>
              <h2 className="mt-2 pr-10 text-3xl font-black">{selected.owned ? selected.display_name : "Locked Realmie"}</h2>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-white/60">
                {selected.owned ? selected.lore_text : `Pass the Level ${selected.evolution_level} post-test to add this Realmie to your collection.`}
              </p>

              {selected.owned ? (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => toggleFavourite(selected)}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-rose-300/25 bg-rose-300/10 px-4 py-3 text-sm font-black text-rose-100 transition hover:bg-rose-300/15 disabled:opacity-50"
                  >
                    <Heart className={`h-4 w-4 ${selected.favourite ? "fill-current" : ""}`} aria-hidden="true" />
                    {selected.favourite ? "Remove favourite" : "Add to favourites"}
                  </button>

                  <div className="mt-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Choose display slot</p>
                    <div className="mt-2 grid grid-cols-6 gap-2">
                      {Array.from({ length: 6 }, (_, index) => {
                        const slot = index + 1;
                        const current = displayBySlot.get(slot);
                        const selectedHere = current?.realmie_key === selected.realmie_key;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={busy}
                            onClick={() => assignSlot(slot, selectedHere ? null : selected)}
                            className={`flex aspect-square items-center justify-center rounded-md border text-sm font-black transition disabled:opacity-50 ${selectedHere ? "border-cyan-200 bg-cyan-300 text-slate-950" : "border-white/15 bg-white/[0.04] text-white hover:border-cyan-200/50"}`}
                            aria-label={selectedHere ? `Remove from display slot ${slot}` : `Add to display slot ${slot}`}
                          >
                            {selectedHere ? <Check className="h-4 w-4" aria-hidden="true" /> : slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {unlockCount > 0 ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="New Realmies unlocked">
          <div className="w-full max-w-md rounded-md border border-amber-200/30 bg-[#151827] p-7 text-center shadow-2xl">
            <Star className="mx-auto h-10 w-10 fill-amber-300 text-amber-300" aria-hidden="true" />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-amber-200">Collection updated</p>
            <h2 className="mt-2 text-3xl font-black">{unlockCount} Realm{unlockCount === 1 ? "ie" : "ies"} unlocked!</h2>
            <p className="mt-2 text-sm font-semibold text-white/60">Your previously completed levels have been added to My Realmies.</p>
            <button type="button" onClick={closeUnlockCelebration} className="mt-6 w-full rounded-md bg-amber-300 px-4 py-3 text-sm font-black text-slate-950 hover:bg-amber-200">View collection</button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
