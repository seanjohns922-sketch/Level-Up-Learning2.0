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

  useEffect(() => {
    setProgress(readProgress());
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

  return (
    <main className="min-h-screen bg-background">
      {/* Hero — kept exactly as before */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-card">
        <div className="absolute inset-0 pointer-events-none">
          {["🤖", "⚙️", "🔢", "✨", "🏆", "💎"].map((emoji, i) => (
            <span
              key={i}
              className="absolute text-2xl opacity-10"
              style={{
                top: `${10 + i * 13}%`,
                left: `${6 + i * 15}%`,
                transform: `rotate(${i * 30 - 60}deg)`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <div className="relative max-w-2xl mx-auto px-6 pt-6 pb-10">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push("/legends")}
              className="text-sm font-bold text-primary hover:text-primary/80 transition flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> My Legends
            </button>
            <div className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 bg-teal-50 px-4 py-1.5 rounded-full border border-teal-200 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-teal-500" /> Number Nexus
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Numbot Collection
          </h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-lg">
            Collect powerful Numbots by mastering your number skills.
          </p>

          {/* Progress */}
          <div className="mt-6 max-w-sm">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-bold text-foreground">{collectedCount} / {totalCount} collected</span>
              <span className="font-bold text-teal-600">{totalCount > 0 ? Math.round((collectedCount / totalCount) * 100) : 0}%</span>
            </div>
            <div className="h-3 rounded-full bg-card border border-border overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${totalCount > 0 ? (collectedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 40" fill="none" preserveAspectRatio="none" style={{ height: 40 }}>
          <path d="M0 40V20C240 0 480 0 720 20C960 40 1200 40 1440 20V40H0Z" fill="hsl(var(--background))" />
        </svg>
      </div>

      {/* Card Binder Grid */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-xs font-extrabold text-muted-foreground tracking-[0.15em] mb-5">
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
        <div className="mt-10 rounded-2xl border-2 border-teal-400/20 bg-teal-50/50 p-5 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div>
            <div className="font-bold text-foreground mb-0.5">How to collect Numbots</div>
            <div className="text-sm text-muted-foreground">
              Pass a pre-test or complete the full 12-week number program to unlock each Numbot legend for that year level.
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
