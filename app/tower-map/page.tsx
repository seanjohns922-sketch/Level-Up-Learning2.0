"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Sparkles, Star } from "lucide-react";

const REALMS = [
  { name: "Number Nexus", icon: "🔢", active: true, color: "from-emerald-400 to-teal-600", pct: [50, 18] },
  { name: "Measurelands", icon: "📐", active: false, color: "from-sky-400 to-blue-500", pct: [22, 24] },
  { name: "Pattern Peaks", icon: "🌀", active: false, color: "from-fuchsia-400 to-pink-600", pct: [78, 24] },
  { name: "Runehaven Peaks", icon: "🏔️", active: false, color: "from-slate-400 to-zinc-500", pct: [12, 46] },
  { name: "Statistica", icon: "📊", active: false, color: "from-cyan-400 to-teal-500", pct: [88, 46] },
  { name: "Reading Ridge", icon: "📖", active: false, color: "from-amber-400 to-orange-500", pct: [15, 70] },
  { name: "Chance Hollow", icon: "🎲", active: false, color: "from-lime-400 to-green-600", pct: [85, 70] },
  { name: "Starpath Realm", icon: "⭐", active: false, color: "from-violet-400 to-purple-500", pct: [34, 82] },
  { name: "Inkwell Wilds", icon: "✒️", active: false, color: "from-rose-400 to-pink-500", pct: [66, 82] },
];

const TOWER = [50, 46]; // center %

export default function TowerMapPage() {
  const router = useRouter();

  return (
    <main className="h-screen relative overflow-hidden bg-stone-900">
      {/* Background map */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/tower-map-bg.jpg')", transform: "scale(1.15)" }} />
      <div className="absolute inset-0 bg-black/8" />

      {/* Header */}
      <div className="relative z-30 flex items-center justify-between px-4 pt-3 pb-1">
        <button onClick={() => router.push("/home")} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/60 backdrop-blur-md text-amber-100 text-xs font-bold shadow-lg border border-amber-400/20 hover:bg-stone-900/80 transition-all active:scale-95">
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </button>
        <div className="px-3 py-1 rounded-full bg-stone-900/60 backdrop-blur-md border border-amber-400/30 shadow-lg">
          <span className="text-amber-300 text-[10px] font-extrabold tracking-[0.15em]">REALMS OF KNOWLEDGE</span>
        </div>
      </div>

      {/* Map area */}
      <div className="relative z-10 w-full" style={{ height: "calc(100vh - 44px)" }}>

        {/* SVG paths from tower to each realm */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <defs>
            <linearGradient id="gpAct" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(42,90%,60%)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(145,60%,50%)" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="gpLck" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(35,40%,50%)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(35,30%,45%)" stopOpacity="0.08" />
            </linearGradient>
            <filter id="pathGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {REALMS.map((r) => {
            const tx = `${TOWER[0]}%`, ty = `${TOWER[1]}%`;
            const rx = `${r.pct[0]}%`, ry = `${r.pct[1]}%`;
            // midpoint with slight curve
            const mx = (TOWER[0] + r.pct[0]) / 2 + (r.pct[0] > 50 ? 3 : -3);
            const my = (TOWER[1] + r.pct[1]) / 2 + 2;
            return (
              <path
                key={`path-${r.name}`}
                d={`M${tx} ${ty} Q${mx}% ${my}% ${rx} ${ry}`}
                fill="none"
                stroke={r.active ? "url(#gpAct)" : "url(#gpLck)"}
                strokeWidth={r.active ? "2.5" : "1.5"}
                strokeDasharray={r.active ? "6 3" : "4 4"}
                strokeLinecap="round"
                filter={r.active ? "url(#pathGlow)" : undefined}
              />
            );
          })}
        </svg>

        {/* Tower label */}
        <div className="absolute z-15" style={{ top: `${TOWER[1]}%`, left: `${TOWER[0]}%`, transform: "translate(-50%,-50%)" }}>
          <div className="flex flex-col items-center">
            <Sparkles className="h-4 w-4 text-amber-300 mb-0.5" style={{ animation: "sparkle 2s ease-in-out infinite" }} />
            <div className="bg-stone-900/65 backdrop-blur-md border border-amber-400/35 rounded-lg px-3 py-1.5 shadow-xl">
              <p className="text-amber-200 text-[9px] font-extrabold tracking-[0.18em] text-center whitespace-nowrap leading-tight">
                TOWER OF<br />KNOWLEDGE
              </p>
            </div>
          </div>
        </div>

        {/* Realm nodes */}
        {REALMS.map((realm, i) => (
          <div
            key={realm.name}
            className="absolute z-20"
            style={{
              top: `${realm.pct[1]}%`,
              left: `${realm.pct[0]}%`,
              transform: "translate(-50%,-50%)",
              animation: `realmFadeIn 0.4s ${i * 0.05}s ease both`,
            }}
          >
            {realm.active ? (
              <button onClick={() => router.push("/home")} className="group flex flex-col items-center cursor-pointer">
                <div className="absolute -inset-4 rounded-full bg-emerald-400/20 blur-lg" style={{ animation: "glowPulse 3s ease-in-out infinite" }} />
                <div className="relative">
                  <div className={`relative h-14 w-14 rounded-2xl bg-gradient-to-br ${realm.color} shadow-xl shadow-emerald-700/40 flex items-center justify-center text-2xl border-2 border-white/50 group-hover:scale-110 group-active:scale-95 transition-transform`}>
                    {realm.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-md">
                    <Star className="h-2.5 w-2.5 text-amber-800" fill="currentColor" />
                  </div>
                </div>
                <span className="mt-1 text-[9px] font-extrabold text-white bg-emerald-700/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap border border-emerald-400/30">
                  {realm.name}
                </span>
              </button>
            ) : (
              <div className="flex flex-col items-center">
                <div className={`relative h-11 w-11 rounded-xl bg-gradient-to-br ${realm.color} flex items-center justify-center text-base border border-white/15 shadow-lg`}>
                  {realm.icon}
                  <div className="absolute inset-0 rounded-xl bg-stone-900/50 backdrop-blur-[1px] flex items-center justify-center">
                    <Lock className="h-3.5 w-3.5 text-white/70" />
                  </div>
                </div>
                <span className="mt-0.5 text-[8px] font-bold text-amber-100/70 bg-stone-900/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  {realm.name}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Story panel */}
      <div className="fixed bottom-0 inset-x-0 z-30">
        <div className="max-w-xl mx-auto px-4 pb-3">
          <div className="bg-stone-900/80 backdrop-blur-xl border border-amber-400/25 rounded-2xl px-4 py-3 shadow-2xl">
            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-amber-400/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-amber-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-100 leading-snug">
                  The Tower of Knowledge is powered by many realms.
                </p>
                <p className="text-[10px] text-amber-200/60 mt-0.5 leading-relaxed">
                  <span className="text-emerald-400 font-extrabold">Number Nexus</span> is the first realm open on your journey. Complete lessons to strengthen the Tower and push back the Fog of Forgetfulness!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0.5; transform: translateY(0) scale(0.9); }
          50% { opacity: 1; transform: translateY(-2px) scale(1.1); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes realmFadeIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 8px)); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </main>
  );
}
