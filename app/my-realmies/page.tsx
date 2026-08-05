"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Heart,
  Lock,
  Orbit,
  Plus,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import EconomyHeader from "@/components/economy/EconomyHeader";
import { getExplorerRank, type EconomyState, fetchStudentEconomy } from "@/lib/economy";
import {
  fetchRealmieCollection,
  recordRealmieEvent,
  setRealmieDisplaySlot,
  setRealmieFavourite,
  type Realmie,
  type RealmieCollection,
  type RealmieRealm,
} from "@/lib/realmies";
import { getActiveStudentIdentity, getActiveStudentProfile } from "@/lib/studentIdentity";
import { isDemoPreviewMode } from "@/lib/demo-mode";

const REALM_STYLES: Record<
  RealmieRealm,
  { name: string; subtitle: string; accent: string; border: string; glow: string; shelf: string }
> = {
  number: {
    name: "Number Nexus",
    subtitle: "Digital citizens, helpers and guardians",
    accent: "text-cyan-200",
    border: "border-cyan-300/35",
    glow: "from-cyan-400/20 via-emerald-400/5 to-transparent",
    shelf: "bg-[linear-gradient(135deg,rgba(5,44,52,.94),rgba(8,18,34,.98))]",
  },
  measurement: {
    name: "Measurelands",
    subtitle: "Careful keepers of measure and discovery",
    accent: "text-amber-200",
    border: "border-amber-300/35",
    glow: "from-amber-300/20 via-emerald-500/5 to-transparent",
    shelf: "bg-[linear-gradient(135deg,rgba(50,37,12,.95),rgba(14,28,25,.98))]",
  },
};

const RARITY_STYLE = {
  common: "text-cyan-200 border-cyan-200/30 bg-cyan-300/10",
  rare: "text-emerald-200 border-emerald-200/30 bg-emerald-300/10",
  epic: "text-violet-200 border-violet-200/30 bg-violet-300/10",
  legendary: "text-amber-200 border-amber-200/30 bg-amber-300/10",
} as const;

function CollectionCard({
  realmie,
  onOpen,
}: {
  realmie: Realmie;
  onOpen: (realmie: Realmie) => void;
}) {
  const owned = realmie.owned;
  return (
    <button
      type="button"
      onClick={() => onOpen(realmie)}
      className="group relative min-w-0 overflow-hidden rounded-md border border-white/12 bg-black/25 text-left transition hover:-translate-y-1 hover:border-white/30 hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      aria-label={owned ? `Open ${realmie.display_name}` : "Open locked Realmie clue"}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,.16),transparent_62%)]">
        <Image
          src={owned ? realmie.asset_path : realmie.silhouette_asset_path}
          alt={owned ? realmie.display_name : "Locked Realmie silhouette"}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 240px"
          className={`object-contain p-3 transition duration-300 group-hover:scale-[1.03] ${owned ? "" : "opacity-55 grayscale"}`}
        />
        {!owned ? (
          <span className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-md border border-white/15 bg-black/55 text-white/75">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
        {realmie.favourite ? (
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md bg-rose-500 text-white shadow-lg" title="Favourite">
            <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
          </span>
        ) : null}
        {realmie.display_slot ? (
          <span className="absolute bottom-3 right-3 rounded-md border border-white/20 bg-black/65 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white">
            Display {realmie.display_slot}
          </span>
        ) : null}
      </div>
      <div className="border-t border-white/10 p-3">
        <p className="truncate text-base font-black text-white">{owned ? realmie.display_name : "?????"}</p>
        <p className={`mt-1 inline-flex rounded-sm border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] ${RARITY_STYLE[realmie.rarity]}`}>
          {owned ? realmie.rarity : "Undiscovered"}
        </p>
      </div>
    </button>
  );
}

export default function MyRealmiesPage() {
  const [student] = useState(() => getActiveStudentProfile());
  const [collection, setCollection] = useState<RealmieCollection | null>(null);
  const [economy, setEconomy] = useState<EconomyState | null>(null);
  const [selected, setSelected] = useState<Realmie | null>(null);
  const [celebration, setCelebration] = useState<Realmie | null>(null);
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const studentId = student?.studentId;
  const explorerRank = getExplorerRank(economy?.wallet.xp_earned ?? 0);

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    const requestedStudentId = studentId;
    void Promise.all([
      fetchRealmieCollection(requestedStudentId),
      fetchStudentEconomy(requestedStudentId).catch(() => null),
    ])
      .then(([nextCollection, nextEconomy]) => {
        if (cancelled || getActiveStudentIdentity().studentId !== requestedStudentId) return;
        setCollection(nextCollection);
        setEconomy(nextEconomy);
        void recordRealmieEvent(requestedStudentId, "realmie_collection_opened");

        if (typeof window === "undefined") return;
        if (requestedStudentId === "demo-preview") {
          const reviewReveal = isDemoPreviewMode()
            && new URLSearchParams(window.location.search).get("review_reveal") === "1";
          if (reviewReveal) {
            const newest = [...nextCollection.catalogue]
              .filter((item) => item.owned)
              .sort((a, b) => (b.earned_at ?? "").localeCompare(a.earned_at ?? ""))[0];
            if (newest) setCelebration(newest);
          }
          return;
        }
        const seenKey = `lul:realmies:seen:${requestedStudentId}`;
        const ownedKeys = nextCollection.catalogue.filter((item) => item.owned).map((item) => item.realmie_key);
        const stored = window.localStorage.getItem(seenKey);
        if (stored) {
          let seen = new Set<string>();
          try {
            const parsed = JSON.parse(stored) as unknown;
            if (Array.isArray(parsed)) {
              seen = new Set(parsed.filter((item): item is string => typeof item === "string"));
            }
          } catch {
            // A stale local cache must never prevent the canonical collection loading.
          }
          const newest = [...nextCollection.catalogue]
            .filter((item) => item.owned && !seen.has(item.realmie_key))
            .sort((a, b) => (b.earned_at ?? "").localeCompare(a.earned_at ?? ""))[0];
          if (newest) setCelebration(newest);
        }
        window.localStorage.setItem(seenKey, JSON.stringify(ownedKeys));
      })
      .catch((nextError) => {
        if (!cancelled) setError(nextError instanceof Error ? nextError.message : "My Realmies could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const displayBySlot = useMemo(
    () => new Map((collection?.display ?? []).map((entry) => [entry.slot_number, entry])),
    [collection?.display],
  );

  async function refreshFrom(action: Promise<RealmieCollection>) {
    setBusy(true);
    setError(null);
    try {
      const next = await action;
      setCollection(next);
      if (selected) {
        setSelected(next.catalogue.find((item) => item.realmie_key === selected.realmie_key) ?? null);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "That change could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  function openRealmie(realmie: Realmie) {
    setSelected(realmie);
    if (studentId) {
      void recordRealmieEvent(studentId, realmie.owned ? "realmie_detail_viewed" : "realmie_clue_viewed", realmie);
    }
  }

  async function toggleFavourite(realmie: Realmie) {
    if (!studentId || !realmie.owned || busy) return;
    await refreshFrom(setRealmieFavourite(studentId, realmie, !realmie.favourite));
    void recordRealmieEvent(studentId, "realmie_favourited", realmie);
  }

  async function chooseSlot(slotNumber: number, realmie: Realmie) {
    if (!studentId || !realmie.owned || busy) return;
    const removing = realmie.display_slot === slotNumber;
    await refreshFrom(setRealmieDisplaySlot(studentId, slotNumber, removing ? null : realmie));
    void recordRealmieEvent(studentId, removing ? "realmie_display_removed" : "realmie_display_added", realmie);
  }

  async function clearSlot(slotNumber: number) {
    if (!studentId || busy) return;
    await refreshFrom(setRealmieDisplaySlot(studentId, slotNumber, null));
  }

  return (
    <main className="min-h-screen bg-[#090d13] text-white">
      <EconomyHeader
        xp={economy?.wallet.xp_balance}
        essence={economy?.wallet.essence}
        rankLevel={explorerRank.level}
      />

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,.14),transparent_45%),linear-gradient(180deg,#101923,#090d13)] px-4 py-8 md:px-7">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-2 text-cyan-200">
                <Orbit className="h-5 w-5" aria-hidden="true" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">My Realmies</p>
              </div>
              <h1 className="mt-2 text-4xl font-black sm:text-5xl">Your realm friends</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/65">
                Discover helpers, citizens and guardians by learning across each realm.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-md border border-white/15 bg-white/5 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/50">Discovered</p>
                <p className="mt-1 text-2xl font-black">{collection ? `${collection.totals.collected} / 8` : "— / 8"}</p>
              </div>
              <button
                type="button"
                onClick={() => setFavouritesOnly((current) => !current)}
                className={`flex h-[62px] items-center gap-2 rounded-md border px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 ${
                  favouritesOnly ? "border-rose-300 bg-rose-500 text-white" : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <Heart className={`h-5 w-5 ${favouritesOnly ? "fill-current" : ""}`} aria-hidden="true" />
                Favourites
              </button>
            </div>
          </div>

          <div className="mt-7 border-t border-white/10 pt-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">Home display</h2>
                <p className="mt-1 text-xs font-semibold text-white/50">Choose up to six discovered Realmies.</p>
              </div>
              <span className="text-xs font-black text-white/45">{collection?.display.length ?? 0} / 6 placed</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {[1, 2, 3, 4, 5, 6].map((slotNumber) => {
                const entry = displayBySlot.get(slotNumber);
                return (
                  <button
                    key={slotNumber}
                    type="button"
                    onClick={() => (entry ? void clearSlot(slotNumber) : null)}
                    disabled={!entry || busy}
                    className="relative aspect-square overflow-hidden rounded-md border border-white/12 bg-black/30 transition hover:border-white/30 disabled:cursor-default"
                    aria-label={entry ? `Remove ${entry.display_name} from display slot ${slotNumber}` : `Empty display slot ${slotNumber}`}
                  >
                    {entry ? (
                      <>
                        <Image src={entry.asset_path} alt={entry.display_name} fill sizes="160px" className="object-contain p-2" />
                        <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-sm bg-black/65 text-[10px] font-black">{slotNumber}</span>
                      </>
                    ) : (
                      <span className="flex h-full flex-col items-center justify-center text-white/30">
                        <Plus className="h-5 w-5" aria-hidden="true" />
                        <span className="mt-1 text-[10px] font-black uppercase tracking-wide">Slot {slotNumber}</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-7 md:px-7">
        {(["number", "measurement"] as RealmieRealm[]).map((realmId) => {
          const style = REALM_STYLES[realmId];
          const realmies = (collection?.catalogue ?? [])
            .filter((item) => item.realm_id === realmId)
            .filter((item) => !favouritesOnly || item.favourite);
          return (
            <section key={realmId} className={`overflow-hidden rounded-md border ${style.border} ${style.shelf}`}>
              <div className={`border-b border-white/10 bg-gradient-to-r ${style.glow} px-5 py-4`}>
                <h2 className={`text-2xl font-black ${style.accent}`}>{style.name}</h2>
                <p className="mt-1 text-sm font-semibold text-white/55">{style.subtitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                {!collection
                  ? [0, 1, 2, 3].map((index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-md bg-white/5" />)
                  : realmies.map((realmie) => <CollectionCard key={realmie.realmie_key} realmie={realmie} onOpen={openRealmie} />)}
              </div>
              {collection && realmies.length === 0 ? (
                <p className="px-5 pb-5 text-sm font-semibold text-white/50">No favourites from this realm yet.</p>
              ) : null}
            </section>
          );
        })}

        <section className="relative overflow-hidden rounded-md border border-violet-300/25 bg-[linear-gradient(110deg,#17102f,#0b1830)] px-5 py-8">
          <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_25%,white_0_1px,transparent_1.5px),radial-gradient(circle_at_72%_65%,white_0_1px,transparent_1.5px)] [background-size:80px_80px,110px_110px]" />
          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Starpath Realmies</p>
              <h2 className="mt-2 text-2xl font-black">A new collection is approaching</h2>
              <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-white/60">
                Starpath and its Realmies are not available to students yet.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md border border-violet-200/25 bg-violet-300/10 px-4 py-3 text-sm font-black text-violet-100">
              <Sparkles className="h-4 w-4" aria-hidden="true" /> Coming Soon
            </span>
          </div>
        </section>
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={selected.owned ? selected.display_name : "Locked Realmie"}
          onClick={() => setSelected(null)}
        >
          <div
            className="grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-md border border-white/15 bg-[#111722] shadow-2xl md:grid-cols-[minmax(280px,42%)_1fr]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative min-h-[340px] bg-[radial-gradient(circle_at_50%_45%,rgba(45,212,191,.22),transparent_62%)]">
              <Image
                src={selected.owned ? selected.asset_path : selected.silhouette_asset_path}
                alt={selected.owned ? selected.display_name : "Locked Realmie silhouette"}
                fill
                sizes="420px"
                className={`object-contain p-6 ${selected.owned ? "" : "opacity-60 grayscale"}`}
              />
            </div>
            <div className="relative p-6">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-white/70 hover:bg-white/10"
                aria-label="Close Realmie details"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className={`text-xs font-black uppercase tracking-[0.18em] ${REALM_STYLES[selected.realm_id].accent}`}>
                {REALM_STYLES[selected.realm_id].name}
              </p>
              <h2 className="mt-2 pr-10 text-3xl font-black">{selected.owned ? selected.display_name : "?????"}</h2>
              <span className={`mt-3 inline-flex rounded-sm border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${RARITY_STYLE[selected.rarity]}`}>
                {selected.rarity}
              </span>

              {selected.owned ? (
                <>
                  <p className="mt-5 text-base font-semibold leading-7 text-white/70">{selected.lore_text}</p>
                  <button
                    type="button"
                    onClick={() => void toggleFavourite(selected)}
                    disabled={busy}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-black transition ${
                      selected.favourite ? "border-rose-300 bg-rose-500 text-white" : "border-white/15 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${selected.favourite ? "fill-current" : ""}`} aria-hidden="true" />
                    {selected.favourite ? "Favourite" : "Add to favourites"}
                  </button>
                  <div className="mt-6">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-white/50">Choose display slot</p>
                    <div className="mt-2 grid grid-cols-6 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((slotNumber) => (
                        <button
                          key={slotNumber}
                          type="button"
                          onClick={() => void chooseSlot(slotNumber, selected)}
                          disabled={busy}
                          className={`flex aspect-square items-center justify-center rounded-md border text-sm font-black transition ${
                            selected.display_slot === slotNumber
                              ? "border-emerald-300 bg-emerald-500 text-white"
                              : "border-white/15 bg-white/5 hover:bg-white/10"
                          }`}
                          aria-label={`Use display slot ${slotNumber}`}
                        >
                          {selected.display_slot === slotNumber ? <Check className="h-4 w-4" aria-hidden="true" /> : slotNumber}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-6 rounded-md border border-white/12 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-amber-200">
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    <p className="text-xs font-black uppercase tracking-[0.16em]">Discovery clue</p>
                  </div>
                  <p className="mt-3 text-base font-bold leading-6 text-white/75">{selected.unlock_clue}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {celebration ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#071018]/90 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="New Realmie discovered">
          <div className="relative w-full max-w-xl overflow-hidden rounded-md border border-cyan-200/35 bg-[radial-gradient(circle_at_50%_35%,rgba(34,211,238,.28),transparent_48%),#101827] p-6 text-center shadow-2xl">
            <Sparkles className="mx-auto h-7 w-7 text-amber-200" aria-hidden="true" />
            <p className="mt-3 text-xs font-black uppercase tracking-[0.22em] text-cyan-200">New discovery</p>
            <div className="relative mx-auto mt-2 aspect-square max-w-[300px]">
              <Image src={celebration.asset_path} alt={celebration.display_name} fill sizes="300px" className="object-contain" />
            </div>
            <h2 className="text-4xl font-black">{celebration.display_name}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-6 text-white/65">{celebration.lore_text}</p>
            <button
              type="button"
              onClick={() => setCelebration(null)}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-cyan-300 px-6 py-3 text-sm font-black text-slate-950 hover:bg-cyan-200"
            >
              <Star className="h-4 w-4 fill-current" aria-hidden="true" /> Meet your Realmie
            </button>
          </div>
        </div>
      ) : null}

      {error || !studentId ? (
        <div className="fixed bottom-4 left-1/2 z-40 w-[min(92vw,600px)] -translate-x-1/2 rounded-md border border-amber-200/35 bg-amber-950/95 px-4 py-3 text-center text-sm font-bold text-amber-100 shadow-xl" role="status">
          {error ?? "Log in as a student to open My Realmies."}
        </div>
      ) : null}
    </main>
  );
}
