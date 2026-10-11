"use client";

import ReliqsWordmark from "@/components/brand/ReliqsWordmark";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { getAllLegends, getEffectiveUnlockedLegendIds } from "@/data/legends";
import { readProgress, type StudentProgress } from "@/data/progress";
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

export default function LegendsPage() {
  const router = useRouter();
  // Progress is realm-scoped in storage, so each realm's legends must be read
  // from its own record — otherwise Measurelands unlocks (saved under the
  // "measurement" scope) are invisible on this shared page.
  const [numberProgress] = useState<StudentProgress | null>(() => readProgress("number"));
  const [measureProgress] = useState<StudentProgress | null>(() => readProgress("measurement"));
  const [spaceProgress] = useState<StudentProgress | null>(() => readProgress("space"));
  const [patternProgress] = useState<StudentProgress | null>(() => readProgress("pattern"));
  const [chanceProgress] = useState<StudentProgress | null>(() => readProgress("chance"));
  const demoPreview =
    useDemoPreviewMode() ||
    (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("teacher_preview") === "1");

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
      {/* Full-screen fantasy background */}
      <img
        src="/images/legends-bg.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-[center_40%]"
      />
      {/* World-integrated readability layers */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 54% 38%, rgba(255,190,90,0.08), transparent 28%), linear-gradient(90deg, rgba(8,10,12,0.62) 0%, rgba(8,10,12,0.42) 45%, rgba(8,10,12,0.45) 78%, rgba(8,10,12,0.4) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 180px 70px rgba(0,0,0,0.46)" }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="max-w-4xl mx-auto w-full px-5 pt-5 pb-2">
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

          <h1 className="mx-auto mb-5 mt-10 max-w-[400px] px-3"><ReliqsWordmark /></h1>
          <p
            className="text-center mt-1.5 text-base max-w-md mx-auto"
            style={{ color: "rgba(255,255,255,0.75)", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
          >
            Your collection. Every realm. Every discovery.
          </p>

          {/* Progress bar */}
          <div className="mt-5 max-w-sm mx-auto">
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
        <div className="max-w-4xl mx-auto w-full px-5 py-6 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                onClick={realm.route ? () => router.push(realm.route!) : undefined}
              />
            ))}
          </div>

          {/* Tip */}
          <div
            className="mt-8 rounded-2xl p-5 flex items-start gap-3"
            style={{
              background: "rgba(255,255,255,0.12)",
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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
