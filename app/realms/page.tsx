"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { readProgress } from "@/data/progress";
import { DEMO_MODE } from "@/data/config";

const REALMS = [
  { id: "number-nexus", name: "Number Nexus", icon: "⚡", description: "Master numbers, operations & place value", color: "from-emerald-400 to-teal-500", active: true },
  { id: "pattern-peaks", name: "Pattern Peaks", icon: "🔢", description: "Algebra and pattern recognition", color: "from-amber-400 to-orange-500", active: false },
  { id: "measurelands", name: "Measurelands", icon: "📏", description: "Length, mass, capacity & more", color: "from-blue-400 to-indigo-500", active: false },
  { id: "statistica", name: "Statistica", icon: "📊", description: "Data, graphs & interpretation", color: "from-violet-400 to-purple-500", active: false },
  { id: "chance-hollow", name: "Chance Hollow", icon: "🎲", description: "Probability & chance", color: "from-rose-400 to-pink-500", active: false },
  { id: "chronorok", name: "Chronorok", icon: "⏳", description: "Time & duration", color: "from-cyan-400 to-sky-500", active: false, comingSoon: true },
  { id: "starpath-realm", name: "Starpath Realm", icon: "🌌", description: "Space & spatial reasoning", color: "from-indigo-400 to-blue-600", active: false },
  { id: "reading-ridge", name: "Reading Ridge", icon: "📖", description: "Reading comprehension & fluency", color: "from-yellow-400 to-amber-500", active: false },
  { id: "inkwell-wilds", name: "Inkwell Wilds", icon: "✒️", description: "Writing, grammar & spelling", color: "from-lime-400 to-green-500", active: false },
  { id: "runehaven-peaks", name: "Runehaven Peaks", icon: "🔥", description: "Advanced literacy & lore", color: "from-red-400 to-rose-500", active: false },
];

export default function RealmsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const level = searchParams.get("level") ?? "Year 1";
  const [entered, setEntered] = useState(false);
  const progress = useMemo(() => readProgress(), []);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, []);

  const levelLabel = level.startsWith("Year")
    ? `Level ${level.replace("Year ", "")}`
    : level;

  function handleRealmClick(realm: typeof REALMS[number]) {
    if (!realm.active && !DEMO_MODE) return;
    if (realm.id === "number-nexus") {
      router.push("/home");
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img
          src="/images/realm-select-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 40%" }}
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div
        className="relative z-10 min-h-screen flex flex-col px-6 py-8"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? "scale(1)" : "scale(1.05)",
          transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/levels")}
            className="text-sm text-white/80 hover:text-white transition"
            type="button"
          >
            ← Back to Levels
          </button>
          <span
            className="text-sm font-bold text-white/90 px-4 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
          >
            {levelLabel}
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl md:text-5xl font-black text-white tracking-wide"
            style={{
              fontFamily: "'Quicksand', 'Nunito', sans-serif",
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            Choose Your Realm
          </h1>
          <p
            className="text-white/70 mt-2 text-base font-medium"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
          >
            Each realm holds unique challenges to conquer.
          </p>
        </div>

        {/* Realm Grid */}
        <div className="flex-1 flex items-start justify-center">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl w-full">
            {REALMS.map((realm, idx) => {
              const isActive = realm.active || DEMO_MODE;
              return (
                <button
                  key={realm.id}
                  type="button"
                  onClick={() => handleRealmClick(realm)}
                  disabled={!isActive}
                  className="group relative text-left transition-all duration-200"
                  style={{
                    opacity: entered ? 1 : 0,
                    transform: entered ? "translateY(0)" : "translateY(20px)",
                    transition: `opacity 0.4s ease-out ${idx * 0.06}s, transform 0.4s ease-out ${idx * 0.06}s`,
                  }}
                >
                  <div
                    className={[
                      "rounded-2xl p-4 h-full border transition-all duration-200",
                      isActive
                        ? "cursor-pointer hover:translate-y-[-4px] hover:shadow-2xl"
                        : "cursor-not-allowed opacity-50",
                    ].join(" ")}
                    style={{
                      background: isActive
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(255,255,255,0.06)",
                      borderColor: isActive
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{realm.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">
                          {realm.name}
                        </div>
                        <div className="text-xs text-white/50 mt-0.5 line-clamp-2">
                          {realm.description}
                        </div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="mt-3">
                      {realm.active ? (
                        <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30">
                          ACTIVE
                        </span>
                      ) : realm.comingSoon ? (
                        <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/30">
                          COMING SOON
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-white/40">
                          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="4" y="11" width="16" height="9" rx="2" />
                            <path d="M8 11V7a4 4 0 018 0v4" />
                          </svg>
                          LOCKED
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
