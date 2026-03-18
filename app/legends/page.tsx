"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Sparkles, ChevronRight, Zap, Clock, Mountain, Compass, Triangle, BarChart3, Dices, BookOpen, Feather, Languages } from "lucide-react";
import { getAllLegends } from "@/data/legends";
import { readProgress, type StudentProgress } from "@/data/progress";
import RealmCard from "@/components/legends/RealmCard";

export type RealmDef = {
  id: string;
  name: string;
  legendLine: string;
  icon: React.ReactNode;
  totalLegends: number;
  status: "open" | "coming-soon" | "locked";
  route?: string;
  glowColor: string;
  borderGlow: string;
};

const REALMS: RealmDef[] = [
  {
    id: "number-nexus",
    name: "Number Nexus",
    legendLine: "Numbot Collection",
    icon: <Zap className="h-5 w-5" />,
    totalLegends: 7,
    status: "open",
    route: "/legends/number",
    glowColor: "rgba(45, 212, 160, 0.25)",
    borderGlow: "rgba(45, 212, 160, 0.6)",
  },
  {
    id: "chronorok",
    name: "Chronorok",
    legendLine: "Time Legends",
    icon: <Clock className="h-5 w-5" />,
    totalLegends: 7,
    status: "coming-soon",
    glowColor: "rgba(245, 180, 50, 0.2)",
    borderGlow: "rgba(245, 180, 50, 0.5)",
  },
  {
    id: "measurelands",
    name: "Measurelands",
    legendLine: "Measure Titans",
    icon: <Mountain className="h-5 w-5" />,
    totalLegends: 7,
    status: "locked",
    glowColor: "transparent",
    borderGlow: "rgba(255,255,255,0.15)",
  },
  {
    id: "starpath-realm",
    name: "Starpath Realm",
    legendLine: "Star Navigators",
    icon: <Compass className="h-5 w-5" />,
    totalLegends: 7,
    status: "locked",
    glowColor: "transparent",
    borderGlow: "rgba(255,255,255,0.15)",
  },
  {
    id: "pattern-peaks",
    name: "Pattern Peaks",
    legendLine: "Pattern Weavers",
    icon: <Triangle className="h-5 w-5" />,
    totalLegends: 7,
    status: "locked",
    glowColor: "transparent",
    borderGlow: "rgba(255,255,255,0.15)",
  },
  {
    id: "statistica",
    name: "Statistica",
    legendLine: "Data Guardians",
    icon: <BarChart3 className="h-5 w-5" />,
    totalLegends: 7,
    status: "locked",
    glowColor: "transparent",
    borderGlow: "rgba(255,255,255,0.15)",
  },
  {
    id: "chance-hollow",
    name: "Chance Hollow",
    legendLine: "Fortune Seekers",
    icon: <Dices className="h-5 w-5" />,
    totalLegends: 7,
    status: "locked",
    glowColor: "transparent",
    borderGlow: "rgba(255,255,255,0.15)",
  },
  {
    id: "reading-ridge",
    name: "Reading Ridge",
    legendLine: "Lore Keepers",
    icon: <BookOpen className="h-5 w-5" />,
    totalLegends: 7,
    status: "locked",
    glowColor: "transparent",
    borderGlow: "rgba(255,255,255,0.15)",
  },
  {
    id: "inkwell-wilds",
    name: "Inkwell Wilds",
    legendLine: "Script Spirits",
    icon: <Feather className="h-5 w-5" />,
    totalLegends: 7,
    status: "locked",
    glowColor: "transparent",
    borderGlow: "rgba(255,255,255,0.15)",
  },
  {
    id: "runehaven-peaks",
    name: "Runehaven Peaks",
    legendLine: "Rune Masters",
    icon: <Languages className="h-5 w-5" />,
    totalLegends: 7,
    status: "locked",
    glowColor: "transparent",
    borderGlow: "rgba(255,255,255,0.15)",
  },
];

export default function LegendsPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<StudentProgress | null>(null);

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  const unlockedIds = progress?.unlockedLegends ?? [];

  const numbotCollected = useMemo(() => {
    const all = getAllLegends();
    return all.filter((l) => unlockedIds.includes(l.id)).length;
  }, [unlockedIds]);

  const totalCollected = numbotCollected;
  const totalLegends = REALMS.reduce((sum, r) => sum + r.totalLegends, 0);
  const pct = totalLegends > 0 ? Math.round((totalCollected / totalLegends) * 100) : 0;

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Full-screen fantasy background */}
      <img
        src="/images/legends-bg.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-[center_35%]"
      />
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="max-w-4xl mx-auto w-full px-5 pt-5 pb-2">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push("/home")}
              className="text-sm font-bold text-amber-200 hover:text-white transition flex items-center gap-1"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
            >
              ← Home
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
              My Legends
            </div>
          </div>

          <h1
            className="text-4xl md:text-5xl font-black text-white tracking-tight text-center"
            style={{
              fontFamily: "'Quicksand', 'Nunito', sans-serif",
              textShadow: "0 2px 16px rgba(0,0,0,0.5), 0 0 40px rgba(245,180,50,0.3)",
            }}
          >
            Level Up Legends
          </h1>
          <p
            className="text-center mt-1.5 text-base max-w-md mx-auto"
            style={{ color: "rgba(255,255,255,0.75)", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
          >
            Unlock powerful legends across the realms of knowledge.
          </p>

          {/* Progress bar */}
          <div className="mt-5 max-w-sm mx-auto">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-bold text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                {totalCollected} / {totalLegends} total legends
              </span>
              <span className="font-bold text-amber-300" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
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
                  background: "linear-gradient(90deg, hsl(145, 65%, 42%), hsl(42, 95%, 55%))",
                  boxShadow: "0 0 8px rgba(45,212,160,0.4)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Realm Grid */}
        <div className="max-w-4xl mx-auto w-full px-5 py-6 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REALMS.map((realm) => (
              <RealmCard
                key={realm.id}
                realm={realm}
                collected={realm.id === "number-nexus" ? numbotCollected : 0}
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
            <span className="text-2xl flex-shrink-0">💡</span>
            <div>
              <div className="font-bold text-white mb-0.5" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                How to unlock Legends
              </div>
              <div className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                Complete lessons in each realm to collect powerful legends. Pass the pre-test or finish the full 12-week program to unlock a Legend!
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
