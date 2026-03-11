"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Sparkles, Star } from "lucide-react";
import { readProgress, type StudentProgress } from "@/data/progress";
import { getAllLegends, type Legend } from "@/data/legends";
import { YEAR_ORDER } from "@/data/yearOrder";

function getLegendStatus(
  legend: Legend,
  unlockedIds: string[]
): "unlocked" | "locked" {
  return unlockedIds.includes(legend.id) ? "unlocked" : "locked";
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[10px] font-extrabold text-foreground w-7 text-right">{value}</span>
    </div>
  );
}

function LegendCard({ legend, status }: { legend: Legend; status: "unlocked" | "locked" }) {
  const isLocked = status === "locked";

  return (
    <div
      className={`relative rounded-2xl border-2 p-4 transition-all duration-300 ${
        isLocked
          ? "bg-card border-border opacity-55"
          : "bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30 shadow-md"
      }`}
    >
      {/* Status badge */}
      <div className="absolute -top-2.5 right-3">
        {status === "unlocked" ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-[9px] font-extrabold text-white shadow-md">
            <Star className="h-2.5 w-2.5" fill="currentColor" /> UNLOCKED
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-[9px] font-extrabold text-muted-foreground shadow-md">
            <Lock className="h-2.5 w-2.5" /> LOCKED
          </span>
        )}
      </div>

      <div className="flex items-start gap-3 mt-1">
        {/* Card image */}
        <div
          className={`relative flex-shrink-0 h-20 w-14 rounded-lg overflow-hidden border-2 ${
            isLocked ? "border-border grayscale" : "border-primary/20"
          }`}
        >
          <img
            src={legend.images.cardFront}
            alt={legend.name}
            className={`h-full w-full object-cover ${isLocked ? "blur-[2px] opacity-40" : ""}`}
          />
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/40">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-extrabold text-muted-foreground tracking-wider">{legend.yearLabel.toUpperCase()}</p>
          <h4 className={`text-sm font-extrabold leading-tight ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
            {legend.name}
          </h4>
          <p className={`text-[11px] mt-0.5 leading-snug ${isLocked ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
            {legend.description}
          </p>

          {/* Star rating */}
          {!isLocked && (
            <div className="flex items-center gap-0.5 mt-1.5">
              {Array.from({ length: Math.ceil(legend.stars) }).map((_, i) => (
                <Star key={i} className="h-3 w-3 text-amber-400" fill="currentColor" />
              ))}
            </div>
          )}

          {/* Stats for unlocked */}
          {!isLocked && (
            <div className="mt-2 space-y-1">
              <StatBar label="Calc" value={legend.stats.calculation} />
              <StatBar label="Speed" value={legend.stats.speed} />
              <StatBar label="Accuracy" value={legend.stats.accuracy} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NumbotCollectionPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<StudentProgress | null>(null);

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  const year = progress?.year ?? "Year 1";
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
      {/* Hero */}
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
            <div className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground bg-card px-4 py-1.5 rounded-full border border-border shadow-sm">
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
                className="h-full rounded-full bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 transition-all duration-700"
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

      {/* Legend cards */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-xs font-extrabold text-muted-foreground tracking-[0.15em] mb-4">NUMBOT LEGENDS</h2>
        <div className="space-y-4">
          {sortedLegends.map((legend) => {
            const status = getLegendStatus(legend, unlockedIds);
            return <LegendCard key={legend.id} legend={legend} status={status} />;
          })}
        </div>

        {/* Tip */}
        <div className="mt-10 rounded-2xl border-2 border-teal-500/20 bg-teal-500/5 p-5 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div>
            <div className="font-bold text-foreground mb-0.5">How to collect Numbots</div>
            <div className="text-sm text-muted-foreground">
              Pass a pre-test or complete the full 12-week number program to unlock each Numbot legend for that year level.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
