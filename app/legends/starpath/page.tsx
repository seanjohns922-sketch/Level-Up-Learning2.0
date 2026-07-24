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

export default function StarpathCollectionPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [selectedLegend, setSelectedLegend] = useState<Legend | null>(null);
  const [barAnimated, setBarAnimated] = useState(false);
  const demoPreview = isDemoPreviewMode();

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(readProgress("space"));
      setBarAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const unlockedIds = useMemo(
    () => getEffectiveUnlockedLegendIds(progress?.year, progress?.unlockedLegends, "starpath"),
    [progress],
  );
  const allLegends = useMemo(() => getAllLegends("starpath"), []);
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
          "linear-gradient(180deg, hsl(239, 48%, 10%) 0%, hsl(259, 52%, 9%) 48%, hsl(203, 56%, 8%) 100%)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-[520px] overflow-hidden"
          style={{
            maskImage: "linear-gradient(180deg, black 0%, black 76%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(180deg, black 0%, black 76%, transparent 100%)",
          }}
        >
          <img
            src="/images/starpath-home-bg-ground.png"
            alt=""
            aria-hidden="true"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
            style={{
              filter: "contrast(1.08) saturate(1.06) brightness(0.88)",
              objectPosition: "center center",
              transform: "scale(1.02)",
            }}
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, hsla(244, 55%, 10%, 0.16) 0%, hsla(259, 56%, 8%, 0.1) 42%, hsla(203, 60%, 6%, 0.58) 100%), radial-gradient(circle at 22% 24%, hsla(272, 82%, 64%, 0.16), transparent 26%), radial-gradient(circle at 76% 18%, hsla(188, 86%, 58%, 0.14), transparent 28%)",
          }}
        />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, hsla(254, 60%, 6%, 0.38), transparent 28%, transparent 72%, hsla(203, 64%, 5%, 0.38))",
        }}
      />

      <div className="relative z-10 min-w-0 w-full max-w-full overflow-x-hidden">
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, hsla(253, 60%, 16%, 0.36) 0%, transparent 100%)" }}
          />

          <div className="relative min-w-0 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-7">
            <div className="flex items-center justify-between mb-7">
              <button
                onClick={() => router.push("/legends")}
                className="text-sm font-bold transition flex items-center gap-1"
                style={{ color: "hsl(188, 76%, 84%)" }}
              >
                <ArrowLeft className="h-3.5 w-3.5" /> My Legends
              </button>
              <div
                className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full shadow-sm"
                style={{
                  background: "hsla(249, 46%, 14%, 0.78)",
                  color: "hsl(188, 78%, 86%)",
                  border: "1px solid hsla(270, 70%, 68%, 0.28)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Sparkles className="h-3.5 w-3.5" style={{ color: "hsl(188, 92%, 72%)" }} /> Legend Vault
              </div>
            </div>

            <h1
              className="text-4xl md:text-6xl font-black tracking-normal"
              style={{
                color: "hsl(224, 50%, 97%)",
                fontFamily: "'Quicksand', 'Inter', system-ui, sans-serif",
                textShadow: "0 2px 18px hsla(270, 80%, 56%, 0.3)",
              }}
            >
              Geospin Collection
            </h1>
            <p className="mt-2 text-base md:text-lg max-w-xl" style={{ color: "hsl(216, 26%, 84%)" }}>
              Collect Geospin&apos;s evolutions as you master shapes, position, transformation, and spatial reasoning.
            </p>

            <div className="mt-6 max-w-sm">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-bold" style={{ color: "hsl(210, 34%, 92%)" }}>
                  {collectedCount} / {totalCount} collected
                </span>
                <span className="font-bold" style={{ color: "hsl(188, 92%, 72%)" }}>
                  {pct}%
                </span>
              </div>
              <div
                className="h-4 rounded-full overflow-hidden"
                style={{
                  background: "hsla(247, 58%, 5%, 0.66)",
                  border: "1px solid hsla(270, 64%, 58%, 0.32)",
                  boxShadow: "inset 0 1px 4px hsla(247, 70%, 2%, 0.75)",
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: barAnimated ? `${Math.max(pct, 2)}%` : "0%",
                    background:
                      "linear-gradient(90deg, hsl(269, 72%, 58%), hsl(243, 78%, 66%), hsl(188, 86%, 56%))",
                    boxShadow: "0 0 12px hsla(188, 86%, 58%, 0.4), inset 0 1px 0 hsla(0, 0%, 100%, 0.3)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 w-full max-w-6xl mx-auto px-3 sm:px-6 pb-12 pt-3">
          <h2
            className="text-xs font-extrabold tracking-[0.22em] mb-5"
            style={{ color: "hsl(214, 26%, 76%)", fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', sans-serif" }}
          >
            CARD BINDER
          </h2>

          <section
            className="relative min-w-0 w-full max-w-full overflow-hidden rounded-[28px] p-3 sm:p-5 md:p-6"
            style={{
              background: "linear-gradient(180deg, hsla(247, 48%, 12%, 0.78), hsla(207, 54%, 8%, 0.7))",
              border: "1px solid hsla(188, 78%, 62%, 0.22)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 26px 80px hsla(247, 72%, 2%, 0.46), inset 0 1px 0 hsla(188, 70%, 76%, 0.08)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%, hsla(188, 88%, 66%, 0.12), transparent 36%), radial-gradient(circle at 20% 18%, hsla(270, 72%, 62%, 0.18), transparent 32%)",
              }}
            />
            <div className="relative min-w-0 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
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
              background: "hsla(247, 48%, 12%, 0.78)",
              border: "1.5px solid hsla(188, 72%, 58%, 0.22)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 18px 50px hsla(247, 68%, 2%, 0.26)",
            }}
          >
            <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(188, 92%, 72%)" }} />
            <div>
              <div className="font-bold mb-0.5" style={{ color: "hsl(220, 38%, 94%)" }}>
                How to collect Starpath legends
              </div>
              <div className="text-sm" style={{ color: "hsl(216, 20%, 78%)" }}>
                Complete each Starpath level to unlock its Geospin evolution. Ground Level prepares explorers for the first card.
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
