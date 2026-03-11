"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Sparkles, Star } from "lucide-react";

const REALMS = [
  { name: "Number Nexus",     icon: "🔢", active: true,  color: "from-emerald-400 to-teal-600",   top: "12%", left: "50%" },
  { name: "Reading Ridge",    icon: "📖", active: false, color: "from-amber-500 to-orange-600",   top: "28%", left: "25%" },
  { name: "Inkwell Wilds",    icon: "✒️", active: false, color: "from-teal-500 to-emerald-700",   top: "28%", left: "75%" },
  { name: "Runehaven Peaks",  icon: "🏔️", active: false, color: "from-slate-400 to-zinc-600",     top: "48%", left: "12%" },
  { name: "Measurelands",     icon: "📐", active: false, color: "from-fuchsia-400 to-pink-600",   top: "48%", left: "88%" },
  { name: "Starpath Realm",   icon: "⭐", active: false, color: "from-indigo-400 to-blue-600",    top: "68%", left: "18%" },
  { name: "Statistica",       icon: "📊", active: false, color: "from-purple-400 to-violet-600",  top: "68%", left: "82%" },
  { name: "Chance Hollow",    icon: "🎲", active: false, color: "from-lime-400 to-green-600",     top: "82%", left: "35%" },
  { name: "Pattern Peaks",    icon: "🌀", active: false, color: "from-rose-400 to-red-600",       top: "82%", left: "65%" },
];

const TOWER = { top: "50%", left: "50%" };

export default function TowerMapPage() {
  const router = useRouter();

  return (
    <main className="h-screen relative overflow-hidden bg-stone-900">
      {/* Background map */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/tower-map-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/5" />

      {/* Header */}
      <div className="relative z-30 flex items-center justify-between px-4 pt-3 pb-1">
        <button
          onClick={() => router.push("/home")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900/70 backdrop-blur-md text-amber-100 text-xs font-bold shadow-lg border border-amber-400/20 hover:bg-stone-900/80 transition-all active:scale-95"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </button>
        <div className="px-4 py-1.5 rounded-full bg-stone-900/70 backdrop-blur-md border border-amber-400/30 shadow-lg">
          <span className="text-amber-300 text-[10px] font-extrabold tracking-[0.15em]">
            REALMS OF KNOWLEDGE
          </span>
        </div>
      </div>

      {/* Map area */}
      <div className="relative z-10 w-full" style={{ height: "calc(100vh - 48px)" }}>
        {/* SVG glowing paths */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <defs>
            <linearGradient id="gpAct" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(42,90%,65%)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="hsl(145,60%,50%)" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="gpLck" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(35,40%,55%)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(35,30%,45%)" stopOpacity="0.1" />
            </linearGradient>
            <filter id="pathGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {REALMS.map((r) => {
            const tl = parseFloat(TOWER.left);
            const tt = parseFloat(TOWER.top);
            const rl = parseFloat(r.left);
            const rt = parseFloat(r.top);
            const mx = (tl + rl) / 2 + (rl > 50 ? 4 : rl < 50 ? -4 : 0);
            const my = (tt + rt) / 2 + (rt < tt ? -2 : 2);
            return (
              <path
                key={`path-${r.name}`}
                d={`M${tl}% ${tt}% Q${mx}% ${my}% ${rl}% ${rt}%`}
                fill="none"
                stroke={r.active ? "url(#gpAct)" : "url(#gpLck)"}
                strokeWidth={r.active ? "3" : "1.5"}
                strokeDasharray={r.active ? "8 4" : "4 4"}
                strokeLinecap="round"
                filter={r.active ? "url(#pathGlow)" : undefined}
              />
            );
          })}
        </svg>

        {/* Tower of Knowledge */}
        <div
          className="absolute z-15"
          style={{ top: TOWER.top, left: TOWER.left, transform: "translate(-50%,-50%)" }}
        >
          <div className="flex flex-col items-center">
            <Sparkles
              className="h-5 w-5 text-amber-300 mb-1"
              style={{ animation: "sparkle 2s ease-in-out infinite" }}
            />
            <div className="bg-stone-900/75 backdrop-blur-md border border-amber-400/40 rounded-lg px-4 py-2 shadow-2xl">
              <p className="text-amber-200 text-[10px] font-extrabold tracking-[0.18em] text-center whitespace-nowrap leading-tight">
                TOWER OF
                <br />
                KNOWLEDGE
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
              top: realm.top,
              left: realm.left,
              transform: "translate(-50%,-50%)",
              animation: `realmFadeIn 0.4s ${i * 0.05}s ease both`,
            }}
          >
            {realm.active ? (
              <button
                onClick={() => router.push("/number-nexus")}
                className="group flex flex-col items-center cursor-pointer"
              >
                {/* Glow */}
                <div
                  className="absolute -inset-5 rounded-full bg-emerald-400/25 blur-xl"
                  style={{ animation: "glowPulse 3s ease-in-out infinite" }}
                />
                <div className="relative">
                  <div
                    className={`relative h-14 w-14 rounded-2xl bg-gradient-to-br ${realm.color} shadow-xl shadow-emerald-700/40 flex items-center justify-center text-2xl border-2 border-white/50 group-hover:scale-110 group-active:scale-95 transition-transform`}
                  >
                    {realm.icon}
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-md">
                    <Star className="h-3 w-3 text-amber-800" fill="currentColor" />
                  </div>
                </div>
                <span className="mt-1.5 text-[10px] font-extrabold text-white bg-emerald-700/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg whitespace-nowrap border border-emerald-400/30">
                  {realm.name}
                </span>
              </button>
            ) : (
              <div className="flex flex-col items-center">
                <div
                  className={`relative h-12 w-12 rounded-xl bg-gradient-to-br ${realm.color} flex items-center justify-center text-lg border border-white/15 shadow-lg`}
                >
                  <div className="absolute inset-0 rounded-xl bg-stone-900/55 backdrop-blur-[1px] flex items-center justify-center">
                    <Lock className="h-4 w-4 text-white/70" />
                  </div>
                </div>
                <span className="mt-1 text-[9px] font-bold text-amber-100/80 bg-stone-900/50 backdrop-blur-sm px-2 py-0.5 rounded-full whitespace-nowrap">
                  {realm.name}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Story panel */}
      <div className="fixed bottom-0 inset-x-0 z-30">
        <div className="max-w-md mx-auto px-3 pb-2">
          <div className="bg-stone-900/85 backdrop-blur-xl border border-amber-400/25 rounded-xl px-3 py-2 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 h-6 w-6 rounded-md bg-amber-400/20 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-amber-300" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-100 leading-snug">
                  The Tower of Knowledge is powered by many realms.
                </p>
                <p className="text-[9px] text-amber-200/60 leading-snug">
                  <span className="text-emerald-400 font-extrabold">Number Nexus</span> is the first realm open. Complete lessons to strengthen the Tower!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes sparkle {
          0%,
          100% {
            opacity: 0.5;
            transform: translateY(0) scale(0.9);
          }
          50% {
            opacity: 1;
            transform: translateY(-3px) scale(1.1);
          }
        }
        @keyframes glowPulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.15);
          }
        }
        @keyframes realmFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, calc(-50% + 10px));
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </main>
  );
}
