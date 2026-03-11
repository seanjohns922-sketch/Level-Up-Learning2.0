"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Sparkles, Star, Zap, Target, Shield } from "lucide-react";
import { readProgress, type StudentProgress } from "@/data/progress";
import { readProgramStore, getWeekProgress, isWeekComplete } from "@/lib/program-progress";
import { getAllLegends, getLegendForYear, type Legend } from "@/data/legends";
import { YEAR_ORDER } from "@/data/yearOrder";

function getLegendStatus(
  legend: Legend,
  unlockedIds: string[],
  currentYear: string
): "unlocked" | "current" | "locked" {
  if (unlockedIds.includes(legend.id)) return "unlocked";
  if (legend.yearLabel === currentYear) return "current";
  return "locked";
}

function ProgressBar({ label, icon, value, color }: { label: string; icon: React.ReactNode; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">{icon} {label}</span>
        <span className={`text-xs font-extrabold ${color}`}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700`}
          style={{
            width: `${value}%`,
            background: color.includes("emerald")
              ? "linear-gradient(90deg, hsl(145 65% 42%), hsl(160 60% 50%))"
              : color.includes("amber")
              ? "linear-gradient(90deg, hsl(42 95% 55%), hsl(35 90% 60%))"
              : "linear-gradient(90deg, hsl(215 65% 52%), hsl(230 60% 60%))",
          }}
        />
      </div>
    </div>
  );
}

function LegendCard({ legend, status }: { legend: Legend; status: "unlocked" | "current" | "locked" }) {
  const isLocked = status === "locked";
  const isCurrent = status === "current";

  return (
    <div
      className={`relative rounded-2xl border p-4 transition-all duration-300 ${
        isCurrent
          ? "bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-amber-400/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/20"
          : isLocked
          ? "bg-slate-900/60 border-white/5 opacity-60"
          : "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-emerald-400/30 shadow-md"
      }`}
    >
      {/* Status badge */}
      <div className="absolute -top-2.5 right-3">
        {status === "unlocked" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-[9px] font-extrabold text-white shadow-md">
            <Star className="h-2.5 w-2.5" fill="currentColor" /> UNLOCKED
          </span>
        )}
        {status === "current" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-[9px] font-extrabold text-white shadow-md animate-pulse">
            <Target className="h-2.5 w-2.5" /> CURRENT
          </span>
        )}
        {status === "locked" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-600 text-[9px] font-extrabold text-slate-300 shadow-md">
            <Lock className="h-2.5 w-2.5" /> LOCKED
          </span>
        )}
      </div>

      {/* Card image area */}
      <div className="flex items-start gap-3 mt-1">
        <div
          className={`relative flex-shrink-0 h-16 w-12 rounded-lg overflow-hidden border ${
            isLocked ? "border-white/10 grayscale" : "border-white/20"
          }`}
        >
          <img
            src={legend.images.cardFront}
            alt={legend.name}
            className={`h-full w-full object-cover ${isLocked ? "blur-[2px] opacity-50" : ""}`}
          />
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Lock className="h-4 w-4 text-white/60" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-extrabold text-slate-400 tracking-wider">{legend.yearLabel.toUpperCase()}</p>
          <h4 className={`text-sm font-extrabold leading-tight ${isLocked ? "text-slate-500" : "text-white"}`}>
            {legend.name}
          </h4>
          <p className={`text-[11px] mt-0.5 leading-snug ${isLocked ? "text-slate-600" : "text-slate-400"}`}>
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
        </div>
      </div>

      {/* Current target glow */}
      {isCurrent && (
        <div className="absolute -inset-px rounded-2xl pointer-events-none" style={{
          background: "linear-gradient(135deg, hsla(42,95%,55%,0.08), transparent, hsla(42,95%,55%,0.05))",
        }} />
      )}
    </div>
  );
}

export default function NumberNexusPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<StudentProgress | null>(null);

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  const year = progress?.year ?? "Year 1";
  const week = progress?.assignedWeek ?? 1;
  const unlockedIds = progress?.unlockedLegends ?? [];

  const allLegends = useMemo(() => getAllLegends(), []);
  const sortedLegends = useMemo(
    () =>
      [...allLegends].sort(
        (a, b) => YEAR_ORDER.indexOf(a.yearLabel) - YEAR_ORDER.indexOf(b.yearLabel)
      ),
    [allLegends]
  );

  const currentLegend = getLegendForYear(year);
  const store = readProgramStore();
  const completedWeeks = Array.from({ length: 12 }, (_, i) => {
    const wp = getWeekProgress(store, year, i + 1);
    return isWeekComplete(wp);
  }).filter(Boolean).length;

  const nexusProgress = Math.round((completedWeeks / 12) * 100);
  const towerStrength = Math.round(nexusProgress * 0.6);
  const fogCleared = Math.round(nexusProgress * 0.8);

  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-top bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/images/number-nexus-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/50 to-slate-950/95 pointer-events-none" />

      {/* Floating light particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => {
          const size = 2 + (i % 5) * 1.2;
          const left = ((i * 31 + 7) % 100);
          const delay = (i * 1.3) % 14;
          const duration = 12 + (i % 6) * 3.5;
          const drift = -25 + (i % 9) * 6;
          const opacity = 0.15 + (i % 4) * 0.1;
          const color = i % 4 === 0
            ? "hsla(42, 95%, 65%, VAR)"
            : i % 4 === 1
            ? "hsla(175, 60%, 55%, VAR)"
            : i % 4 === 2
            ? "hsla(215, 65%, 60%, VAR)"
            : "hsla(280, 50%, 65%, VAR)";
          return (
            <div
              key={`p-${i}`}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                left: `${left}%`,
                bottom: `-${size}px`,
                opacity: 0,
                background: `radial-gradient(circle, ${color.replace(/VAR/g, "0.9")}, ${color.replace(/VAR/g, "0")})`,
                boxShadow: `0 0 ${size * 3}px ${color.replace(/VAR/g, String(opacity))}`,
                animation: `nexusFloat ${duration}s ${delay}s ease-in-out infinite`,
                ["--drift" as string]: `${drift}px`,
              }}
            />
          );
        })}

        {/* Flickering stars */}
        {Array.from({ length: 24 }).map((_, i) => {
          const size = 1 + (i % 3) * 0.8;
          const left = ((i * 43 + 13) % 98) + 1;
          const top = ((i * 29 + 5) % 55) + 2;
          const delay = (i * 0.9) % 6;
          const duration = 2 + (i % 4) * 1.2;
          const color = i % 3 === 0
            ? "hsla(42, 90%, 80%, 0.9)"
            : i % 3 === 1
            ? "hsla(195, 70%, 75%, 0.8)"
            : "hsla(0, 0%, 95%, 0.7)";
          return (
            <div
              key={`s-${i}`}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                left: `${left}%`,
                top: `${top}%`,
                background: color,
                boxShadow: `0 0 ${size * 4}px ${color}, 0 0 ${size * 2}px ${color}`,
                animation: `nexusFlicker ${duration}s ${delay}s ease-in-out infinite`,
              }}
            />
          );
        })}
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-4 pb-2 flex items-center justify-between">
        <button
          onClick={() => router.push("/tower-map")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 backdrop-blur-md text-slate-200 text-xs font-bold shadow-lg border border-teal-400/20 hover:bg-slate-800 transition-all active:scale-95"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Tower Map
        </button>
        <div className="px-3 py-1.5 rounded-full bg-slate-800/70 backdrop-blur-md border border-teal-400/20 shadow-lg">
          <span className="text-teal-300 text-[10px] font-extrabold tracking-[0.12em]">🔢 REALM</span>
        </div>
      </div>

      {/* Hero */}
      <div className="relative z-10 px-4 pt-4 pb-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/20 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span className="text-[10px] font-extrabold text-teal-300 tracking-wider">MATHEMATICS REALM</span>
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent leading-tight">
            Number Nexus
          </h1>
          <p className="text-sm text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
            A mechanical city of gears, circuits, and number bridges — home of the <span className="text-teal-300 font-bold">Numbots</span>.
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="relative z-10 px-4 pb-5">
        <div className="max-w-md mx-auto bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/5 p-4 space-y-3">
          <h3 className="text-[10px] font-extrabold text-slate-500 tracking-[0.15em]">REALM STATUS</h3>
          <ProgressBar label="Number Nexus Progress" icon={<Zap className="h-3 w-3 text-teal-400" />} value={nexusProgress} color="text-emerald-400" />
          <ProgressBar label="Tower Strength" icon={<Shield className="h-3 w-3 text-amber-400" />} value={towerStrength} color="text-amber-400" />
          <ProgressBar label="Fog Cleared" icon={<Sparkles className="h-3 w-3 text-blue-400" />} value={fogCleared} color="text-blue-400" />

          {/* Next legend preview */}
          <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-400/15 px-3 py-2.5 mt-1">
            <div className="h-10 w-8 rounded-md bg-slate-800 border border-amber-400/20 overflow-hidden flex-shrink-0">
              <img src={currentLegend.images.cardFront} alt={currentLegend.name} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-amber-400 tracking-wider">NEXT LEGEND</p>
              <p className="text-xs font-bold text-white">{currentLegend.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend Grid */}
      <div className="relative z-10 px-4 pb-6">
        <div className="max-w-md mx-auto">
          <h2 className="text-xs font-extrabold text-slate-500 tracking-[0.15em] mb-3">NUMBOT LEGENDS</h2>
          <div className="space-y-3">
            {sortedLegends.map((legend) => {
              const status = getLegendStatus(legend, unlockedIds, year);
              return <LegendCard key={legend.id} legend={legend} status={status} />;
            })}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="relative z-10 px-4 pb-8">
        <div className="max-w-md mx-auto">
          <div className="rounded-2xl bg-gradient-to-r from-teal-600/20 to-emerald-600/20 border border-teal-400/15 px-4 py-4 text-center">
            <Sparkles className="h-5 w-5 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">
              Complete your number lessons to unlock <span className="text-amber-300">{currentLegend.name}</span>.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Finish Week {week} to power up the Tower of Knowledge!
            </p>
            <button
              onClick={() => router.push("/home")}
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-extrabold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all active:scale-95"
            >
              <Zap className="h-3.5 w-3.5" /> Continue Lessons
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
