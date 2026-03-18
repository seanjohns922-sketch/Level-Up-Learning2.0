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
    setProgress(readProgress());
    // Trigger bar animation after mount
    const t = setTimeout(() => setBarAnimated(true), 100);
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
    <main className="relative min-h-screen overflow-hidden" style={{ background: "hsl(160, 15%, 96%)" }}>
      {/* Subtle math-themed background texture */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.035 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="math-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="80" y2="0" stroke="hsl(160, 40%, 40%)" strokeWidth="0.5" />
              <line x1="0" y1="0" x2="0" y2="80" stroke="hsl(160, 40%, 40%)" strokeWidth="0.5" />
            </pattern>
            <pattern id="math-symbols" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <text x="20" y="30" fontSize="14" fill="hsl(160, 40%, 40%)" fontFamily="monospace">1</text>
              <text x="70" y="60" fontSize="12" fill="hsl(160, 40%, 40%)" fontFamily="monospace">+</text>
              <text x="130" y="40" fontSize="14" fill="hsl(160, 40%, 40%)" fontFamily="monospace">7</text>
              <text x="170" y="80" fontSize="12" fill="hsl(160, 40%, 40%)" fontFamily="monospace">×</text>
              <text x="40" y="100" fontSize="14" fill="hsl(160, 40%, 40%)" fontFamily="monospace">3</text>
              <text x="100" y="120" fontSize="12" fill="hsl(160, 40%, 40%)" fontFamily="monospace">=</text>
              <text x="160" y="140" fontSize="14" fill="hsl(160, 40%, 40%)" fontFamily="monospace">9</text>
              <text x="20" y="160" fontSize="12" fill="hsl(160, 40%, 40%)" fontFamily="monospace">÷</text>
              <text x="80" y="180" fontSize="14" fill="hsl(160, 40%, 40%)" fontFamily="monospace">5</text>
              <text x="140" y="190" fontSize="12" fill="hsl(160, 40%, 40%)" fontFamily="monospace">−</text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#math-grid)" />
          <rect width="100%" height="100%" fill="url(#math-symbols)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero header with depth gradient */}
        <div className="relative overflow-hidden">
          {/* Header gradient backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, hsla(160, 30%, 88%, 0.8) 0%, hsla(160, 15%, 96%, 0) 100%)",
            }}
          />

          <div className="relative max-w-2xl mx-auto px-6 pt-6 pb-10">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => router.push("/legends")}
                className="text-sm font-bold transition flex items-center gap-1"
                style={{ color: "hsl(160, 50%, 35%)" }}
              >
                <ArrowLeft className="h-3.5 w-3.5" /> My Legends
              </button>
              <div
                className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full shadow-sm"
                style={{
                  background: "hsla(160, 40%, 94%, 0.9)",
                  color: "hsl(160, 50%, 30%)",
                  border: "1px solid hsla(160, 40%, 80%, 0.6)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Sparkles className="h-3.5 w-3.5" style={{ color: "hsl(160, 50%, 45%)" }} /> Number Nexus
              </div>
            </div>

            <h1
              className="text-4xl md:text-5xl font-black tracking-tight"
              style={{
                color: "hsl(220, 15%, 15%)",
                fontFamily: "'Quicksand', 'Nunito', sans-serif",
              }}
            >
              Numbot Collection
            </h1>
            <p className="mt-2 text-lg max-w-lg" style={{ color: "hsl(220, 10%, 50%)" }}>
              Collect powerful Numbots by mastering your number skills.
            </p>

            {/* Premium progress bar */}
            <div className="mt-6 max-w-sm">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-bold" style={{ color: "hsl(220, 15%, 15%)" }}>
                  {collectedCount} / {totalCount} collected
                </span>
                <span className="font-bold" style={{ color: "hsl(160, 50%, 35%)" }}>
                  {pct}%
                </span>
              </div>
              <div
                className="h-4 rounded-full overflow-hidden"
                style={{
                  background: "hsla(160, 20%, 90%, 0.8)",
                  border: "1px solid hsla(160, 30%, 82%, 0.6)",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
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
        <div className="max-w-2xl mx-auto px-6 py-8">
          <h2
            className="text-xs font-extrabold tracking-[0.15em] mb-5"
            style={{ color: "hsl(220, 10%, 55%)" }}
          >
            CARD BINDER
          </h2>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
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

          {/* Tip */}
          <div
            className="mt-10 rounded-2xl p-5 flex items-start gap-3"
            style={{
              background: "hsla(160, 30%, 95%, 0.8)",
              border: "1.5px solid hsla(160, 30%, 80%, 0.5)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="text-2xl flex-shrink-0">💡</span>
            <div>
              <div className="font-bold mb-0.5" style={{ color: "hsl(220, 15%, 15%)" }}>
                How to collect Numbots
              </div>
              <div className="text-sm" style={{ color: "hsl(220, 10%, 50%)" }}>
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
