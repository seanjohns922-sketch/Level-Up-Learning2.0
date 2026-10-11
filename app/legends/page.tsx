"use client";

import Image from "next/image";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import ReliqsWordmark from "@/components/brand/ReliqsWordmark";

import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { getAllLegends, getEffectiveUnlockedLegendIds } from "@/data/legends";
import { readProgress } from "@/data/progress";
import RealmCard from "@/components/legends/RealmCard";
import { useDemoPreviewMode } from "@/lib/demo-mode";

export type RealmDef = {
  id: string;
  name: string;
  legendLine: string;
  totalLegends: number;
  status: "open" | "coming-soon" | "locked";
  route?: string;
};

const REALMS: RealmDef[] = [
  {
    id: "number-nexus",
    name: "Number Nexus",
    legendLine: "Numbot Collection",
    totalLegends: getAllLegends("number-nexus").length,
    status: "open",
    route: "/legends/number",
  },
  {
    id: "chronorok",
    name: "Chronorok",
    legendLine: "Time Legends",
    totalLegends: 7,
    status: "coming-soon",
  },
  {
    id: "measurelands",
    name: "Measurelands",
    legendLine: "Measure Titans",
    totalLegends: getAllLegends("measurelands").length,
    status: "open",
    route: "/legends/measurelands",
  },
  {
    id: "starpath-realm",
    name: "Starpath Realm",
    legendLine: "Geospin Collection",
    totalLegends: getAllLegends("starpath").length,
    status: "open",
    route: "/legends/starpath",
  },
  {
    id: "pattern-peaks",
    name: "Pattern Peaks",
    legendLine: "Patternox Collection",
    totalLegends: getAllLegends("pattern-peaks").length,
    status: "open",
    route: "/legends/pattern-peaks",
  },
  {
    id: "statistica",
    name: "Statistica",
    legendLine: "Data Guardians",
    totalLegends: getAllLegends("statistica").length,
    status: "open",
    route: "/legends/statistica",
  },
  {
    id: "chance-hollow",
    name: "Chance Hollow",
    legendLine: "Fortune Seekers",
    totalLegends: getAllLegends("chance-hollow").length,
    status: "locked",
    route: "/legends/chance-hollow",
  },
  {
    id: "reading-ridge",
    name: "Reading Ridge",
    legendLine: "Lore Keepers",
    totalLegends: 7,
    status: "locked",
  },
  {
    id: "inkwell-wilds",
    name: "Inkwell Wilds",
    legendLine: "Script Spirits",
    totalLegends: 7,
    status: "locked",
  },
  {
    id: "runehaven-peaks",
    name: "Runehaven Peaks",
    legendLine: "Rune Masters",
    totalLegends: 7,
    status: "locked",
  },
];

// The server and first hydration render use the same empty progress snapshot.
// React then switches to the client snapshot without an effect-driven state update.
const subscribeToClientSnapshot = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function LegendsPage() {
  const router = useRouter();
  // Progress is realm-scoped in storage, so each realm's legends must be read
  // from its own record — otherwise Measurelands unlocks (saved under the
  // "measurement" scope) are invisible on this shared page.
  const hydrated = useSyncExternalStore(subscribeToClientSnapshot, getClientSnapshot, getServerSnapshot);
  const { numberProgress, measureProgress, spaceProgress, patternProgress, chanceProgress } = useMemo(
    () => ({
      numberProgress: hydrated ? readProgress("number") : null,
      measureProgress: hydrated ? readProgress("measurement") : null,
      spaceProgress: hydrated ? readProgress("space") : null,
      patternProgress: hydrated ? readProgress("pattern") : null,
      chanceProgress: hydrated ? readProgress("chance") : null,
    }),
    [hydrated],
  );
  const demoPreview = useDemoPreviewMode();

  const unlockedIds = useMemo(
    () => getEffectiveUnlockedLegendIds(numberProgress?.year, numberProgress?.unlockedLegends, "number-nexus"),
    [numberProgress]
  );

  const numbotCollected = useMemo(() => {
    const all = getAllLegends("number-nexus");
    const visibleIds = demoPreview ? all.map((legend) => legend.id) : unlockedIds;
    return all.filter((legend) => visibleIds.includes(legend.id)).length;
  }, [demoPreview, unlockedIds]);

  const measurelandsCollected = useMemo(() => {
    const all = getAllLegends("measurelands");
    const visibleIds = demoPreview
      ? all.map((legend) => legend.id)
      : getEffectiveUnlockedLegendIds(measureProgress?.year, measureProgress?.unlockedLegends, "measurelands");
    return all.filter((legend) => visibleIds.includes(legend.id)).length;
  }, [demoPreview, measureProgress]);

  const starpathCollected = useMemo(() => {
    const all = getAllLegends("starpath");
    const visibleIds = demoPreview
      ? all.map((legend) => legend.id)
      : getEffectiveUnlockedLegendIds(spaceProgress?.year, spaceProgress?.unlockedLegends, "starpath");
    return all.filter((legend) => visibleIds.includes(legend.id)).length;
  }, [demoPreview, spaceProgress]);

  const statisticaCollected = useMemo(
    () => (demoPreview ? getAllLegends("statistica").length : 0),
    [demoPreview],
  );

  const patternPeaksCollected = useMemo(() => {
    const all = getAllLegends("pattern-peaks");
    const visibleIds = demoPreview
      ? all.map((legend) => legend.id)
      : getEffectiveUnlockedLegendIds(patternProgress?.year, patternProgress?.unlockedLegends, "pattern-peaks");
    return all.filter((legend) => visibleIds.includes(legend.id)).length;
  }, [demoPreview, patternProgress]);

  const chanceHollowCollected = useMemo(() => {
    const all = getAllLegends("chance-hollow");
    const visibleIds = demoPreview
      ? all.map((legend) => legend.id)
      : getEffectiveUnlockedLegendIds(chanceProgress?.year, chanceProgress?.unlockedLegends, "chance-hollow");
    return all.filter((legend) => visibleIds.includes(legend.id)).length;
  }, [chanceProgress, demoPreview]);

  const realms = useMemo(
    () =>
      REALMS.map((realm) =>
        demoPreview && realm.route
          ? { ...realm, status: "open" as const }
          : realm,
      ),
    [demoPreview],
  );

  const totalCollected =
    numbotCollected +
    measurelandsCollected +
    starpathCollected +
    patternPeaksCollected +
    chanceHollowCollected +
    statisticaCollected;
  const totalLegends = getAllLegends().length;
  const pct = totalLegends > 0 ? Math.round((totalCollected / totalLegends) * 100) : 0;

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* The archive stays at viewport scale instead of stretching down the collection. */}
      <div className="pointer-events-none absolute inset-0 bg-[#080d0c]" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-[100svh] min-h-[760px]">
          <Image src="/images/reliqs-archive-v1.png" alt="" fill priority sizes="100vw" className="object-cover object-[center_35%]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,8,0.15)_0%,rgba(5,10,8,0.12)_30%,rgba(8,13,12,0.6)_72%,#080d0c_100%)]" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_14%,transparent_20%,rgba(4,8,7,0.45)_85%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="max-w-5xl mx-auto w-full px-5 pt-6 pb-2">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push("/home-base")}
              className="text-sm font-bold text-amber-200 hover:text-white transition flex items-center gap-1"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
            >
              ← My Home
            </button>
            <div
              className="text-sm font-bold px-4 py-1.5 rounded-full border shadow-sm"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                borderColor: "rgba(255,255,255,0.25)",
                color: "rgba(255,255,255,0.9)",
                textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            >
              My RELIQS
            </div>
          </div>

          <p className="mt-12 text-center text-[11px] font-bold uppercase tracking-[0.3em] text-lime-100/70">The collection archive</p>
          <h1 className="mx-auto mb-5 mt-5 max-w-[400px] px-3"><ReliqsWordmark /></h1>
          <p
            className="text-center mt-1.5 text-base max-w-md mx-auto"
            style={{ color: "rgba(255,255,255,0.75)", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
          >
            Your collection. Every realm. Every discovery.
          </p>

          <div className="mt-4 flex justify-center">
            <ReadAloudBtn
              text={`Your RELIQS collection. Every realm. Every discovery. You have collected ${totalCollected} out of ${totalLegends} RELIQS. Explore the vaults. Choose a realm to see your cards. Tap Listen on a vault to hear its name and your collection progress.`}
              label="Listen" size="md" rate={0.9}
              className="min-h-11 !border-white/25 !bg-black/50 !text-white hover:!bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            />
          </div>

          {/* Progress bar */}
          <div className="mt-7 max-w-md mx-auto rounded-2xl border border-white/10 bg-black/40 px-5 py-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-bold text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                {totalCollected} / {totalLegends} RELIQS collected
              </span>
              <span className="font-bold text-lime-300" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                {pct}%
              </span>
            </div>
            <div
              className="h-3 rounded-full overflow-hidden shadow-inner"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, #00a600, #00d400)",
                  boxShadow: "0 0 8px rgba(45,212,160,0.4)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Realm Grid */}
        <div className="max-w-5xl mx-auto w-full px-5 pt-9 pb-12 flex-1">
          <div className="mb-5 flex items-center gap-4"><h2 className="shrink-0 text-xs font-bold uppercase tracking-[0.24em] text-white/70">Explore the vaults</h2><div className="h-px flex-1 bg-white/15" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {realms.map((realm) => (
              <RealmCard
                key={realm.id}
                realm={realm}
                collected={
                  realm.id === "number-nexus"
                    ? numbotCollected
                    : realm.id === "measurelands"
                      ? measurelandsCollected
                      : realm.id === "starpath-realm"
                        ? starpathCollected
                      : realm.id === "pattern-peaks"
                        ? patternPeaksCollected
                      : realm.id === "chance-hollow"
                        ? chanceHollowCollected
                      : realm.id === "statistica"
                        ? statisticaCollected
                      : 0
                }
                onClick={realm.route ? () => router.push(demoPreview ? `${realm.route}?teacher_preview=1` : realm.route!) : undefined}
              />
            ))}
          </div>

          {/* Tip */}
          <div
            className="mt-8 rounded-2xl p-5 flex items-start gap-3"
            style={{
              background: "rgba(10,18,15,0.8)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Lightbulb className="h-6 w-6 flex-shrink-0" />
            <div>
              <div className="font-bold text-white mb-0.5" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                How to collect RELIQS
              </div>
              <div className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                Complete lessons in each realm to collect RELIQS. Pass the pre-test or finish the full 12-week program to unlock a RELIQ card!
              </div>
              <ReadAloudBtn
                text="How to collect RELIQS. Complete lessons in each realm to collect RELIQS. Pass the pre-test or finish the full twelve-week program to unlock a RELIQ card!"
                label="Listen" size="md" rate={0.9}
                className="mt-3 min-h-11 !border-white/25 !bg-white/10 !text-white hover:!bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
