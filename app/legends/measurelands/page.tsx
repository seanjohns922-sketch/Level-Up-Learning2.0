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
          "linear-gradient(180deg, hsl(182, 46%, 10%) 0%, hsl(172, 50%, 7%) 46%, hsl(156, 52%, 6%) 100%)",
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
              "linear-gradient(180deg, hsla(178, 56%, 10%, 0.08) 0%, hsla(170, 54%, 6%, 0.04) 42%, hsla(164, 52%, 5%, 0.44) 100%), radial-gradient(circle at 22% 28%, hsla(46, 70%, 64%, 0.12), transparent 24%), radial-gradient(circle at 74% 18%, hsla(160, 68%, 56%, 0.12), transparent 28%)",
          }}
        />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, hsla(170, 60%, 8%, 0.34), transparent 28%, transparent 72%, hsla(170, 60%, 8%, 0.34))",
        }}
      />

      <div className="relative z-10">
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, hsla(162, 62%, 16%, 0.34) 0%, transparent 100%)",
            }}
          />

          <div className="relative max-w-6xl mx-auto px-6 pt-6 pb-7">
            <div className="flex items-center justify-between mb-7">
              <button
                onClick={() => router.push("/legends")}
                className="text-sm font-bold transition flex items-center gap-1"
                style={{ color: "hsl(150, 66%, 82%)" }}
              >
                <ArrowLeft className="h-3.5 w-3.5" /> My Legends
              </button>
              <div
                className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full shadow-sm"
                style={{
                  background: "hsla(166, 38%, 14%, 0.78)",
                  color: "hsl(156, 74%, 86%)",
                  border: "1px solid hsla(152, 48%, 64%, 0.22)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Sparkles className="h-3.5 w-3.5" style={{ color: "hsl(46, 90%, 70%)" }} /> Legend Vault
              </div>
            </div>

            <h1
              className="text-4xl md:text-6xl font-black tracking-normal"
              style={{
                color: "hsl(150, 40%, 94%)",
                fontFamily: "'Quicksand', 'Inter', system-ui, sans-serif",
                textShadow: "0 2px 18px hsla(156, 55%, 45%, 0.12)",
              }}
            >
              Measure Titans
            </h1>
            <p className="mt-2 text-base md:text-lg max-w-xl" style={{ color: "hsl(150, 18%, 82%)" }}>
              Collect the Measurelands legends as you master length, mass, capacity, time, and measurement reasoning.
            </p>

            <div className="mt-6 max-w-sm">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-bold" style={{ color: "hsl(150, 28%, 88%)" }}>
                  {collectedCount} / {totalCount} collected
                </span>
                <span className="font-bold" style={{ color: "hsl(46, 90%, 72%)" }}>
                  {pct}%
                </span>
              </div>
              <div
                className="h-4 rounded-full overflow-hidden"
                style={{
                  background: "hsla(166, 42%, 4%, 0.6)",
                  border: "1px solid hsla(152, 38%, 42%, 0.28)",
                  boxShadow: "inset 0 1px 4px hsla(170, 60%, 2%, 0.7)",
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: barAnimated ? `${Math.max(pct, 2)}%` : "0%",
                    background:
                      "linear-gradient(90deg, hsl(150, 58%, 44%), hsl(160, 56%, 46%), hsl(46, 90%, 68%))",
                    boxShadow: "0 0 12px hsla(154, 60%, 45%, 0.4), inset 0 1px 0 hsla(0, 0%, 100%, 0.3)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pb-12 pt-3">
          <h2
            className="text-xs font-extrabold tracking-[0.22em] mb-5"
            style={{ color: "hsl(150, 22%, 72%)", fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', sans-serif" }}
          >
            CARD BINDER
          </h2>

          <section
            className="relative overflow-hidden rounded-[28px] p-4 sm:p-5 md:p-6"
            style={{
              background: "linear-gradient(180deg, hsla(166, 36%, 10%, 0.74), hsla(170, 42%, 7%, 0.66))",
              border: "1px solid hsla(152, 42%, 58%, 0.18)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 26px 80px hsla(170, 70%, 2%, 0.42), inset 0 1px 0 hsla(160, 55%, 75%, 0.08)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%, hsla(46, 90%, 70%, 0.12), transparent 36%), radial-gradient(circle at 20% 18%, hsla(154, 58%, 50%, 0.14), transparent 32%)",
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
              background: "hsla(166, 40%, 10%, 0.76)",
              border: "1.5px solid hsla(152, 42%, 48%, 0.18)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 18px 50px hsla(170, 60%, 2%, 0.22)",
            }}
          >
            <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(46, 90%, 72%)" }} />
            <div>
              <div className="font-bold mb-0.5" style={{ color: "hsl(150, 34%, 92%)" }}>
                How to collect Measurelands legends
              </div>
              <div className="text-sm" style={{ color: "hsl(150, 16%, 74%)" }}>
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
