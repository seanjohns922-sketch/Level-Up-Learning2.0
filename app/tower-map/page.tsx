"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Sparkles, Star } from "lucide-react";

const REALMS = [
  { name: "Number Nexus", icon: "🔢", active: true, color: "from-emerald-400 to-teal-500", pos: "top-[28%] left-[50%] -translate-x-1/2" },
  { name: "Reading Ridge", icon: "📖", active: false, color: "from-amber-400 to-orange-500", pos: "top-[12%] left-[22%]" },
  { name: "Inkwell Wilds", icon: "✒️", active: false, color: "from-rose-400 to-pink-500", pos: "top-[12%] right-[22%]" },
  { name: "Runehaven Peaks", icon: "🏔️", active: false, color: "from-slate-400 to-zinc-500", pos: "top-[42%] left-[12%]" },
  { name: "Measurelands", icon: "📐", active: false, color: "from-sky-400 to-blue-500", pos: "top-[42%] right-[12%]" },
  { name: "Starpath Realm", icon: "⭐", active: false, color: "from-violet-400 to-purple-500", pos: "bottom-[28%] left-[16%]" },
  { name: "Pattern Peaks", icon: "🌀", active: false, color: "from-fuchsia-400 to-pink-600", pos: "bottom-[28%] right-[16%]" },
  { name: "Statistica", icon: "📊", active: false, color: "from-cyan-400 to-teal-500", pos: "bottom-[12%] left-[28%]" },
  { name: "Chance Hollow", icon: "🎲", active: false, color: "from-lime-400 to-green-500", pos: "bottom-[12%] right-[28%]" },
  { name: "Chronoscape", icon: "⏳", active: false, color: "from-yellow-400 to-amber-500", pos: "bottom-[4%] left-[50%] -translate-x-1/2" },
];

export default function TowerMapPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Fog / ambient layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Stars */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`s${i}`}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              top: `${(i * 31) % 100}%`,
              left: `${(i * 47 + 13) % 100}%`,
              opacity: 0.3 + (i % 5) * 0.1,
              animationDelay: `${(i * 0.4) % 3}s`,
              animationDuration: `${2 + (i % 4) * 0.5}s`,
            }}
          />
        ))}
        {/* Fog drifts */}
        <div className="absolute top-1/3 -left-20 w-[60vw] h-48 bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute bottom-1/4 -right-20 w-[50vw] h-40 bg-indigo-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-1/2 left-1/3 w-[40vw] h-32 bg-violet-300/4 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "7s" }} />
      </div>

      {/* Back button */}
      <div className="relative z-20 p-4">
        <button
          onClick={() => router.push("/home")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur text-white text-sm font-bold hover:bg-white/20 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>
      </div>

      {/* Map container */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 pb-8" style={{ minHeight: "calc(100vh - 80px)" }}>
        {/* Central Tower */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          {/* Tower glow */}
          <div className="absolute -inset-8 rounded-full bg-gradient-to-t from-amber-400/20 via-purple-400/10 to-transparent blur-2xl animate-pulse" style={{ animationDuration: "4s" }} />

          {/* Tower visual */}
          <div className="relative flex flex-col items-center">
            {/* Spire */}
            <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-b-[24px] border-l-transparent border-r-transparent border-b-amber-400 mb-[-2px]" />
            <Sparkles className="absolute -top-3 text-amber-300 h-4 w-4 animate-pulse" />
            {/* Main tower body */}
            <div className="w-14 h-24 bg-gradient-to-b from-amber-200 via-amber-100 to-amber-50 rounded-t-lg border-2 border-amber-300/60 relative overflow-hidden">
              {/* Windows */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-5 rounded-t-full bg-amber-400/40 border border-amber-300/50" />
              <div className="absolute top-12 left-2 w-2.5 h-3 rounded-t-full bg-amber-400/30" />
              <div className="absolute top-12 right-2 w-2.5 h-3 rounded-t-full bg-amber-400/30" />
              {/* Shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
            {/* Base */}
            <div className="w-20 h-4 bg-gradient-to-b from-amber-100 to-amber-200 rounded-b-lg border-x-2 border-b-2 border-amber-300/60" />
            <div className="w-24 h-2 bg-amber-300/30 rounded-full mt-1 blur-sm" />
          </div>

          <p className="mt-3 text-amber-200 text-xs font-extrabold tracking-widest text-center">
            TOWER OF<br />KNOWLEDGE
          </p>
        </div>

        {/* Realm nodes */}
        {REALMS.map((realm) => (
          <div
            key={realm.name}
            className={`absolute ${realm.pos} z-20`}
          >
            {realm.active ? (
              <button
                onClick={() => router.push("/home")}
                className="group flex flex-col items-center gap-1.5 animate-[fadeUp_0.6s_ease_both]"
              >
                {/* Active glow ring */}
                <div className="relative">
                  <div className="absolute -inset-2 rounded-full bg-emerald-400/30 blur-md animate-pulse" style={{ animationDuration: "3s" }} />
                  <div className={`relative h-16 w-16 rounded-2xl bg-gradient-to-br ${realm.color} shadow-lg shadow-emerald-500/30 flex items-center justify-center text-2xl border-2 border-white/30 group-hover:scale-110 group-active:scale-95 transition-transform`}>
                    {realm.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 border-2 border-indigo-950 flex items-center justify-center">
                    <Star className="h-2.5 w-2.5 text-amber-900" fill="currentColor" />
                  </div>
                </div>
                <span className="text-[11px] font-extrabold text-white bg-emerald-600/80 backdrop-blur px-2.5 py-0.5 rounded-full shadow-sm">
                  {realm.name}
                </span>
              </button>
            ) : (
              <div className="flex flex-col items-center gap-1.5 opacity-40">
                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${realm.color} flex items-center justify-center text-xl border border-white/10 relative`}>
                  {realm.icon}
                  <div className="absolute inset-0 rounded-2xl bg-slate-900/50 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-white/70" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-white/50 px-2 py-0.5 rounded-full">
                  {realm.name}
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Connecting lines (subtle) — drawn as absolute SVG */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" preserveAspectRatio="none">
          <defs>
            <radialGradient id="lineGlow">
              <stop offset="0%" stopColor="rgba(167,139,250,0.3)" />
              <stop offset="100%" stopColor="rgba(167,139,250,0)" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Story panel at bottom */}
      <div className="fixed bottom-0 inset-x-0 z-30">
        <div className="max-w-2xl mx-auto px-4 pb-5">
          <div className="bg-indigo-900/80 backdrop-blur-xl border border-indigo-500/20 rounded-2xl px-5 py-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-amber-400/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-snug">
                  The Tower of Knowledge is powered by many realms.
                </p>
                <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
                  <span className="text-emerald-300 font-extrabold">Number Nexus</span> is the first realm open on your journey. Complete lessons to strengthen the Tower and push back the Fog of Forgetfulness!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
