"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { readProgress, type StudentProgress } from "@/data/progress";
import { getAllLegends, type Legend } from "@/data/legends";
import { YEAR_ORDER } from "@/data/yearOrder";
import BinderCard from "@/components/legends/BinderCard";
import LegendDetailModal from "@/components/legends/LegendDetailModal";

export default function NumbotCollectionPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [selectedLegend, setSelectedLegend] = useState<Legend | null>(null);
  const [barAnimated, setBarAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setProgress(readProgress());
      setBarAnimated(true);
    }, 100);
    return () => clearTimeout(t);
  }, []);

  const unlockedIds = progress?.unlockedLegends ?? [];

  const allLegends = useMemo(() => getAllLegends(), []);
  const sortedLegends = useMemo(
    () =>
      [...allLegends].sort(
        (a, b) => YEAR_ORDER.indexOf(a.yearLabel) - YEAR_ORDER.indexOf(b.yearLabel)
      ),
    [allLegends]
  );

  const collectedCount = allLegends.filter((l) => unlockedIds.includes(l.id)).length;
  const totalCount = allLegends.length;
  const pct = totalCount > 0 ? Math.round((collectedCount / totalCount) * 100) : 0;

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, hsl(176, 58%, 8%) 0%, hsl(170, 54%, 6%) 48%, hsl(164, 48%, 5%) 100%)",
      }}
    >
      {/* Layer 2: visible Number Nexus city environment */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src="/images/number-nexus-home-bg-y5.jpg"
          alt=""
          aria-hidden="true"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            filter: "blur(1px) saturate(1.08) contrast(1.08)",
            opacity: 0.96,
            objectPosition: "center 32%",
            transform: "scale(1.01)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, hsla(176, 58%, 5%, 0.22), hsla(170, 54%, 4%, 0.34)), radial-gradient(circle at 50% 48%, hsla(160, 58%, 8%, 0), hsla(170, 62%, 3%, 0.34) 84%)",
          }}
        />
      </div>

      {/* Calm Number Nexus archive atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 22%, hsla(160, 68%, 42%, 0.08), transparent 34%), radial-gradient(circle at 78% 34%, hsla(176, 65%, 38%, 0.04), transparent 30%), linear-gradient(90deg, hsla(170, 60%, 8%, 0.34), transparent 28%, transparent 72%, hsla(170, 60%, 8%, 0.34))",
        }}
      />
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.035, filter: "blur(0.2px)" }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="math-grid" x="0" y="0" width="88" height="88" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="88" y2="0" stroke="hsl(160, 54%, 54%)" strokeWidth="0.45" />
              <line x1="0" y1="0" x2="0" y2="88" stroke="hsl(160, 54%, 54%)" strokeWidth="0.45" />
              <path d="M18 44H44V18M44 70V44H70" fill="none" stroke="hsl(160, 54%, 54%)" strokeWidth="0.45" />
            </pattern>
            <pattern id="math-symbols" x="0" y="0" width="260" height="220" patternUnits="userSpaceOnUse">
              <text x="28" y="38" fontSize="13" fill="hsl(160, 54%, 58%)" fontFamily="monospace">01</text>
              <text x="132" y="64" fontSize="11" fill="hsl(160, 54%, 58%)" fontFamily="monospace">+7</text>
              <text x="204" y="118" fontSize="12" fill="hsl(160, 54%, 58%)" fontFamily="monospace">×3</text>
              <text x="64" y="168" fontSize="12" fill="hsl(160, 54%, 58%)" fontFamily="monospace">=12</text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#math-grid)" />
          <rect width="100%" height="100%" fill="url(#math-symbols)" />
        </svg>
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, hsla(168, 58%, 8%, 0) 0%, hsla(168, 58%, 5%, 0.08) 60%, hsla(168, 58%, 3%, 0.28) 100%), radial-gradient(ellipse at center, transparent 56%, hsla(170, 62%, 3%, 0.48) 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-[250px] bottom-20 max-w-3xl mx-auto pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, hsla(160, 56%, 42%, 0.11), transparent 72%)",
          filter: "blur(34px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero header with depth gradient */}
        <div className="relative overflow-hidden">
          {/* Header gradient backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, hsla(160, 58%, 16%, 0.42) 0%, hsla(160, 58%, 8%, 0) 100%)",
            }}
          />

          <div className="relative max-w-6xl mx-auto px-6 pt-6 pb-7">
            <div className="flex items-center justify-between mb-7">
              <button
                onClick={() => router.push("/legends")}
                className="text-sm font-bold transition flex items-center gap-1"
                style={{ color: "hsl(160, 62%, 72%)" }}
              >
                <ArrowLeft className="h-3.5 w-3.5" /> My Legends
              </button>
              <div
                className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full shadow-sm"
                style={{
                  background: "hsla(166, 45%, 12%, 0.74)",
                  color: "hsl(160, 62%, 75%)",
                  border: "1px solid hsla(160, 50%, 58%, 0.22)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Sparkles className="h-3.5 w-3.5" style={{ color: "hsl(160, 58%, 62%)" }} /> Number Nexus
              </div>
            </div>

            <h1
              className="text-3xl md:text-5xl font-black tracking-[0.08em] uppercase"
              style={{
                color: "hsl(160, 38%, 92%)",
                fontFamily: "'Rajdhani', 'Exo 2', 'Orbitron', 'Quicksand', sans-serif",
                textShadow: "0 2px 18px hsla(160, 55%, 45%, 0.14)",
              }}
            >
              Numbot Collection
            </h1>
            <p className="mt-2 text-base md:text-lg max-w-xl" style={{ color: "hsl(166, 18%, 76%)" }}>
              Collect powerful Numbots by mastering your number skills.
            </p>

            {/* Premium progress bar */}
            <div className="mt-6 max-w-sm">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-bold" style={{ color: "hsl(160, 30%, 86%)" }}>
                  {collectedCount} / {totalCount} collected
                </span>
                <span className="font-bold" style={{ color: "hsl(160, 58%, 66%)" }}>
                  {pct}%
                </span>
              </div>
              <div
                className="h-4 rounded-full overflow-hidden"
                style={{
                  background: "hsla(166, 42%, 4%, 0.6)",
                  border: "1px solid hsla(160, 38%, 42%, 0.28)",
                  boxShadow: "inset 0 1px 4px hsla(170, 60%, 2%, 0.7)",
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: barAnimated ? `${Math.max(pct, 2)}%` : "0%",
                    background: "linear-gradient(90deg, hsl(160, 60%, 42%), hsl(155, 55%, 48%), hsl(150, 60%, 45%))",
                    boxShadow: "0 0 12px hsla(160, 60%, 45%, 0.4), inset 0 1px 0 hsla(0, 0%, 100%, 0.3)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card Binder Grid */}
        <div className="max-w-6xl mx-auto px-6 pb-12 pt-3">
          <h2
            className="text-xs font-extrabold tracking-[0.22em] mb-5"
            style={{ color: "hsl(160, 24%, 66%)", fontFamily: "'Orbitron', 'Rajdhani', 'Exo 2', sans-serif" }}
          >
            CARD BINDER
          </h2>

          <section
            className="relative overflow-hidden rounded-[28px] p-4 sm:p-5 md:p-6"
            style={{
              background: "linear-gradient(180deg, hsla(166, 46%, 8%, 0.72), hsla(170, 52%, 5%, 0.62))",
              border: "1px solid hsla(160, 42%, 58%, 0.18)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 26px 80px hsla(170, 70%, 2%, 0.42), inset 0 1px 0 hsla(160, 55%, 75%, 0.08)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%, hsla(160, 58%, 48%, 0.12), transparent 42%), linear-gradient(90deg, hsla(160, 55%, 45%, 0.08), transparent 18%, transparent 82%, hsla(160, 55%, 45%, 0.08))",
              }}
            />
            <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {sortedLegends.map((legend) => {
                const isUnlocked = unlockedIds.includes(legend.id);
                return (
                  <BinderCard
                    key={legend.id}
                    legend={legend}
                    isUnlocked={isUnlocked}
                    onClick={() => setSelectedLegend(legend)}
                  />
                );
              })}
            </div>
          </section>

          {/* Tip */}
          <div
            className="mt-10 rounded-2xl p-5 flex items-start gap-3"
            style={{
              background: "hsla(166, 44%, 9%, 0.72)",
              border: "1.5px solid hsla(160, 42%, 48%, 0.18)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 18px 50px hsla(170, 60%, 2%, 0.22)",
            }}
          >
            <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(160, 58%, 64%)" }} />
            <div>
              <div className="font-bold mb-0.5" style={{ color: "hsl(160, 34%, 90%)" }}>
                How to collect Numbots
              </div>
              <div className="text-sm" style={{ color: "hsl(166, 16%, 68%)" }}>
                Pass a pre-test or complete the full 12-week number program to unlock each Numbot legend for that year level.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLegend && (
        <LegendDetailModal
          legend={selectedLegend}
          onClose={() => setSelectedLegend(null)}
        />
      )}
    </main>
  );
}
