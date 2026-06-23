"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { readProgress, type StudentProgress } from "@/data/progress";
import { getAllLegends, getEffectiveUnlockedLegendIds, type Legend } from "@/data/legends";
import { YEAR_ORDER } from "@/data/yearOrder";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import BinderCard from "@/components/legends/BinderCard";
import LegendDetailModal from "@/components/legends/LegendDetailModal";

export default function MeasurelandsCollectionPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [selectedLegend, setSelectedLegend] = useState<Legend | null>(null);
  const [barAnimated, setBarAnimated] = useState(false);
  const demoPreview = isDemoPreviewMode();

  useEffect(() => {
    const t = setTimeout(() => {
      setProgress(readProgress());
      setBarAnimated(true);
    }, 100);
    return () => clearTimeout(t);
  }, []);

  const unlockedIds = useMemo(
    () => getEffectiveUnlockedLegendIds(progress?.year, progress?.unlockedLegends, "measurelands"),
    [progress],
  );

  const allLegends = useMemo(() => getAllLegends("measurelands"), []);
  const visibleUnlockedIds = useMemo(
    () => (demoPreview ? allLegends.map((legend) => legend.id) : unlockedIds),
    [allLegends, demoPreview, unlockedIds],
  );
  const sortedLegends = useMemo(
    () =>
      [...allLegends].sort(
        (a, b) => YEAR_ORDER.indexOf(a.yearLabel) - YEAR_ORDER.indexOf(b.yearLabel),
      ),
    [allLegends],
  );

  const collectedCount = allLegends.filter((legend) => visibleUnlockedIds.includes(legend.id)).length;
  const totalCount = allLegends.length;
  const pct = totalCount > 0 ? Math.round((collectedCount / totalCount) * 100) : 0;

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, hsl(266, 40%, 12%) 0%, hsl(284, 34%, 9%) 46%, hsl(30, 42%, 8%) 100%)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-[520px] overflow-hidden"
          style={{
            maskImage: "linear-gradient(180deg, black 0%, black 76%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(180deg, black 0%, black 76%, transparent 100%)",
          }}
        >
          <img
            src="/images/measurelands-home-bg.jpg"
            alt=""
            aria-hidden="true"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
            style={{
              filter: "contrast(1.08) saturate(1.05) brightness(1.02)",
              objectPosition: "center center",
              transform: "scale(1.02)",
            }}
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, hsla(266, 46%, 12%, 0.08) 0%, hsla(284, 40%, 8%, 0.04) 42%, hsla(30, 44%, 7%, 0.5) 100%), radial-gradient(circle at 22% 28%, hsla(46, 72%, 64%, 0.12), transparent 24%), radial-gradient(circle at 74% 18%, hsla(266, 68%, 66%, 0.12), transparent 28%)",
          }}
        />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, hsla(280, 50%, 8%, 0.34), transparent 28%, transparent 72%, hsla(280, 50%, 8%, 0.34))",
        }}
      />

      <div className="relative z-10">
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, hsla(272, 52%, 18%, 0.34) 0%, transparent 100%)",
            }}
          />

          <div className="relative max-w-6xl mx-auto px-6 pt-6 pb-7">
            <div className="flex items-center justify-between mb-7">
              <button
                onClick={() => router.push("/legends")}
                className="text-sm font-bold transition flex items-center gap-1"
                style={{ color: "hsl(44, 60%, 84%)" }}
              >
                <ArrowLeft className="h-3.5 w-3.5" /> My Legends
              </button>
              <div
                className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full shadow-sm"
                style={{
                  background: "hsla(272, 32%, 16%, 0.78)",
                  color: "hsl(44, 72%, 86%)",
                  border: "1px solid hsla(266, 48%, 64%, 0.24)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Sparkles className="h-3.5 w-3.5" style={{ color: "hsl(46, 90%, 70%)" }} /> Legend Vault
              </div>
            </div>

            <h1
              className="text-4xl md:text-6xl font-black tracking-normal"
              style={{
                color: "hsl(42, 48%, 95%)",
                fontFamily: "'Quicksand', 'Inter', system-ui, sans-serif",
                textShadow: "0 2px 18px hsla(266, 60%, 52%, 0.22)",
              }}
            >
              Meazurex Collection
            </h1>
            <p className="mt-2 text-base md:text-lg max-w-xl" style={{ color: "hsl(40, 22%, 84%)" }}>
              Collect the Measurelands legends as you master length, mass, capacity, time, and measurement reasoning.
            </p>

            <div className="mt-6 max-w-sm">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-bold" style={{ color: "hsl(40, 30%, 90%)" }}>
                  {collectedCount} / {totalCount} collected
                </span>
                <span className="font-bold" style={{ color: "hsl(46, 90%, 72%)" }}>
                  {pct}%
                </span>
              </div>
              <div
                className="h-4 rounded-full overflow-hidden"
                style={{
                  background: "hsla(280, 42%, 6%, 0.6)",
                  border: "1px solid hsla(266, 44%, 52%, 0.3)",
                  boxShadow: "inset 0 1px 4px hsla(280, 60%, 2%, 0.7)",
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: barAnimated ? `${Math.max(pct, 2)}%` : "0%",
                    background:
                      "linear-gradient(90deg, hsl(266, 55%, 56%), hsl(286, 52%, 56%), hsl(46, 90%, 68%))",
                    boxShadow: "0 0 12px hsla(266, 60%, 55%, 0.4), inset 0 1px 0 hsla(0, 0%, 100%, 0.3)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pb-12 pt-3">
          <h2
            className="text-xs font-extrabold tracking-[0.22em] mb-5"
            style={{ color: "hsl(40, 22%, 74%)", fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', sans-serif" }}
          >
            CARD BINDER
          </h2>

          <section
            className="relative overflow-hidden rounded-[28px] p-4 sm:p-5 md:p-6"
            style={{
              background: "linear-gradient(180deg, hsla(272, 32%, 12%, 0.74), hsla(284, 36%, 8%, 0.66))",
              border: "1px solid hsla(46, 60%, 60%, 0.2)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 26px 80px hsla(280, 70%, 2%, 0.42), inset 0 1px 0 hsla(44, 60%, 75%, 0.08)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%, hsla(46, 90%, 70%, 0.12), transparent 36%), radial-gradient(circle at 20% 18%, hsla(266, 58%, 60%, 0.16), transparent 32%)",
              }}
            />
            <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {sortedLegends.map((legend) => {
                const isUnlocked = visibleUnlockedIds.includes(legend.id);
                return (
                  <BinderCard
                    key={legend.id}
                    legend={legend}
                    isUnlocked={isUnlocked}
                    isDemoPreview={demoPreview}
                    onClick={() => setSelectedLegend(legend)}
                  />
                );
              })}
            </div>
          </section>

          <div
            className="mt-10 rounded-2xl p-5 flex items-start gap-3"
            style={{
              background: "hsla(272, 34%, 12%, 0.76)",
              border: "1.5px solid hsla(46, 52%, 52%, 0.2)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 18px 50px hsla(280, 60%, 2%, 0.22)",
            }}
          >
            <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(46, 90%, 72%)" }} />
            <div>
              <div className="font-bold mb-0.5" style={{ color: "hsl(42, 34%, 92%)" }}>
                How to collect Measurelands legends
              </div>
              <div className="text-sm" style={{ color: "hsl(40, 16%, 76%)" }}>
                Pass a pre-test or complete the full Measurelands program for that year level to unlock each Meazurex legend.
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedLegend && (
        <LegendDetailModal legend={selectedLegend} onClose={() => setSelectedLegend(null)} />
      )}
    </main>
  );
}
