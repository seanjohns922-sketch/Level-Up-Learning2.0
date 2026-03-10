"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Sparkles, Star, Castle } from "lucide-react";

const REALMS = [
  { name: "Number Nexus", icon: "🔢", active: true, color: "from-emerald-400 to-teal-600", angle: 90 },
  { name: "Reading Ridge", icon: "📖", active: false, color: "from-amber-400 to-orange-500", angle: 130 },
  { name: "Inkwell Wilds", icon: "✒️", active: false, color: "from-rose-400 to-pink-500", angle: 170 },
  { name: "Runehaven Peaks", icon: "🏔️", active: false, color: "from-slate-400 to-zinc-500", angle: 210 },
  { name: "Measurelands", icon: "📐", active: false, color: "from-sky-400 to-blue-500", angle: 250 },
  { name: "Starpath Realm", icon: "⭐", active: false, color: "from-violet-400 to-purple-500", angle: 290 },
  { name: "Pattern Peaks", icon: "🌀", active: false, color: "from-fuchsia-400 to-pink-600", angle: 330 },
  { name: "Chance Hollow", icon: "🎲", active: false, color: "from-lime-400 to-green-600", angle: 10 },
  { name: "Statistica", icon: "📊", active: false, color: "from-cyan-400 to-teal-500", angle: 50 },
];

export default function TowerMapPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(180deg, hsl(200 60% 72%) 0%, hsl(140 40% 65%) 40%, hsl(95 35% 55%) 70%, hsl(80 30% 50%) 100%)" }}>
      {/* ── Map background elements ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Clouds */}
        {[0, 1, 2, 3, 4].map(i => (
          <div key={`cloud-${i}`} className="absolute rounded-full bg-white/40 blur-xl" style={{
            width: `${120 + i * 40}px`, height: `${40 + i * 12}px`,
            top: `${4 + i * 5}%`, left: `${10 + i * 18}%`,
            animation: `cloudDrift ${18 + i * 4}s ease-in-out infinite alternate`,
          }} />
        ))}

        {/* Mountains (back range) */}
        <svg className="absolute bottom-[30%] left-0 w-full" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <path d="M0 200 L100 80 L180 140 L280 40 L380 120 L460 60 L560 130 L650 30 L750 110 L850 50 L950 120 L1050 70 L1150 130 L1200 90 L1200 200Z" fill="hsl(220 20% 65%)" opacity="0.35" />
          <path d="M0 200 L80 120 L200 70 L300 130 L420 50 L520 110 L640 40 L740 120 L860 60 L960 130 L1080 80 L1200 110 L1200 200Z" fill="hsl(200 15% 55%)" opacity="0.25" />
          {/* Snow caps */}
          <path d="M270 50 L280 40 L290 50Z" fill="white" opacity="0.6" />
          <path d="M640 40 L650 30 L660 40Z" fill="white" opacity="0.6" />
          <path d="M840 58 L850 50 L860 58Z" fill="white" opacity="0.5" />
        </svg>

        {/* Forests */}
        <svg className="absolute bottom-[18%] left-0 w-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          {[40, 90, 150, 220, 300, 370, 440, 520, 600, 680, 760, 840, 920, 1000, 1080, 1150].map((x, i) => (
            <g key={`tree-${i}`} opacity={0.3 + (i % 3) * 0.1}>
              <polygon points={`${x},${100 - (i % 4) * 8} ${x - 12},120 ${x + 12},120`} fill="hsl(140 40% 30%)" />
              <polygon points={`${x},${85 - (i % 4) * 8} ${x - 9},${105 - (i % 4) * 8} ${x + 9},${105 - (i % 4) * 8}`} fill="hsl(140 45% 35%)" />
            </g>
          ))}
        </svg>

        {/* Rivers */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(200 70% 65%)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(200 60% 55%)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path d="M120 0 Q140 100 100 200 Q60 300 130 400 Q180 460 150 550 Q120 650 160 800" fill="none" stroke="url(#riverGrad)" strokeWidth="6" strokeLinecap="round" />
          <path d="M680 0 Q660 120 700 240 Q730 340 680 440 Q640 520 670 650 Q690 740 650 800" fill="none" stroke="url(#riverGrad)" strokeWidth="5" strokeLinecap="round" />
          {/* Connecting stream */}
          <path d="M150 550 Q300 530 400 500 Q500 470 600 490 Q650 500 680 440" fill="none" stroke="url(#riverGrad)" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        </svg>

        {/* Rolling hills */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 180" preserveAspectRatio="none">
          <path d="M0 180 Q150 100 300 130 Q450 80 600 120 Q750 60 900 110 Q1050 80 1200 130 L1200 180Z" fill="hsl(95 30% 45%)" opacity="0.4" />
          <path d="M0 180 Q200 120 400 150 Q550 110 700 140 Q900 100 1100 140 L1200 160 L1200 180Z" fill="hsl(90 28% 40%)" opacity="0.3" />
        </svg>

        {/* Subtle fog wisps */}
        <div className="absolute bottom-[10%] left-[-5%] w-[50vw] h-32 bg-white/10 rounded-full blur-3xl" style={{ animation: "fogDrift 12s ease-in-out infinite alternate" }} />
        <div className="absolute top-[60%] right-[-5%] w-[40vw] h-24 bg-white/8 rounded-full blur-3xl" style={{ animation: "fogDrift 15s ease-in-out infinite alternate-reverse" }} />
      </div>

      {/* ── Back button ── */}
      <div className="relative z-30 p-4">
        <button
          onClick={() => router.push("/home")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-emerald-800 text-sm font-bold shadow-md hover:bg-white hover:shadow-lg transition-all active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>
      </div>

      {/* ── Map container ── */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4" style={{ height: "calc(100vh - 140px)" }}>
        {/* ── Paths connecting realms to tower ── */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="pathActive" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(145 65% 42%)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(42 95% 55%)" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="pathLocked" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(30 20% 60%)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(30 15% 50%)" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          {REALMS.map((realm) => {
            const rad = (realm.angle * Math.PI) / 180;
            const radius = 210;
            const cx = 300, cy = 300;
            const rx = cx + Math.cos(rad) * radius;
            const ry = cy - Math.sin(rad) * radius;
            const mx = cx + Math.cos(rad) * (radius * 0.45);
            const my = cy - Math.sin(rad) * (radius * 0.45);
            return (
              <path
                key={`path-${realm.name}`}
                d={`M${cx} ${cy} Q${mx + (realm.angle % 2 === 0 ? 15 : -15)} ${my + 15} ${rx} ${ry}`}
                fill="none"
                stroke={realm.active ? "url(#pathActive)" : "url(#pathLocked)"}
                strokeWidth={realm.active ? "3" : "2"}
                strokeDasharray={realm.active ? "none" : "6 4"}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* ── Central Tower of Knowledge ── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          {/* Hill beneath tower */}
          <div className="absolute bottom-[-20px] w-32 h-10 bg-gradient-to-t from-green-700/40 to-green-500/20 rounded-[50%] blur-sm" />
          
          {/* Tower glow */}
          <div className="absolute -inset-10 rounded-full bg-gradient-radial from-amber-300/25 via-amber-200/10 to-transparent blur-2xl" style={{ animation: "towerPulse 4s ease-in-out infinite" }} />

          {/* Tower structure */}
          <div className="relative flex flex-col items-center">
            {/* Spire */}
            <div className="relative">
              <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-b-[28px] border-l-transparent border-r-transparent border-b-amber-400 mb-[-2px]" />
              <Sparkles className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-300 h-5 w-5" style={{ animation: "sparkle 2s ease-in-out infinite" }} />
            </div>
            {/* Tower body */}
            <div className="w-16 h-28 bg-gradient-to-b from-amber-100 via-amber-50 to-stone-100 rounded-t-lg border-2 border-amber-300/60 relative overflow-hidden shadow-lg">
              {/* Top window */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-5 h-6 rounded-t-full bg-amber-400/40 border border-amber-300/50" />
              {/* Bottom windows */}
              <div className="absolute top-14 left-2 w-3 h-4 rounded-t-full bg-amber-400/30" />
              <div className="absolute top-14 right-2 w-3 h-4 rounded-t-full bg-amber-400/30" />
              {/* Door */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-7 rounded-t-full bg-amber-700/40 border border-amber-600/30" />
              {/* Shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </div>
            {/* Base */}
            <div className="w-24 h-5 bg-gradient-to-b from-stone-200 to-stone-300 rounded-b-lg border-x-2 border-b-2 border-stone-400/40 shadow-md" />
            {/* Ground shadow */}
            <div className="w-28 h-3 bg-stone-700/15 rounded-full mt-1 blur-sm" />
          </div>

          <p className="mt-3 text-amber-900/80 text-[10px] font-extrabold tracking-[0.2em] text-center bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
            TOWER OF KNOWLEDGE
          </p>
        </div>

        {/* ── Realm nodes (circular layout) ── */}
        {REALMS.map((realm) => {
          const rad = (realm.angle * Math.PI) / 180;
          const radius = 38; // percentage
          const cx = 50, cy = 50;
          const x = cx + Math.cos(rad) * radius;
          const y = cy - Math.sin(rad) * radius;

          return (
            <div
              key={realm.name}
              className="absolute z-20"
              style={{ top: `${y}%`, left: `${x}%`, transform: "translate(-50%, -50%)" }}
            >
              {realm.active ? (
                <button
                  onClick={() => router.push("/home")}
                  className="group flex flex-col items-center gap-1 cursor-pointer"
                  style={{ animation: "fadeUp 0.6s ease both" }}
                >
                  {/* Active glow */}
                  <div className="relative">
                    <div className="absolute -inset-3 rounded-full bg-emerald-400/30 blur-md" style={{ animation: "towerPulse 3s ease-in-out infinite" }} />
                    <div className={`relative h-[60px] w-[60px] rounded-2xl bg-gradient-to-br ${realm.color} shadow-lg shadow-emerald-600/30 flex items-center justify-center text-2xl border-2 border-white/50 group-hover:scale-110 group-active:scale-95 transition-transform`}>
                      {realm.icon}
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-sm">
                      <Star className="h-3 w-3 text-amber-800" fill="currentColor" />
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-white bg-emerald-600/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
                    {realm.name}
                  </span>
                </button>
              ) : (
                <div className="flex flex-col items-center gap-1 opacity-50">
                  <div className={`h-[50px] w-[50px] rounded-2xl bg-gradient-to-br ${realm.color} flex items-center justify-center text-lg border border-white/20 relative shadow`}>
                    {realm.icon}
                    <div className="absolute inset-0 rounded-2xl bg-stone-800/40 flex items-center justify-center backdrop-blur-[1px]">
                      <Lock className="h-4 w-4 text-white/80" />
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-stone-700/70 whitespace-nowrap">
                    {realm.name}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Story panel ── */}
      <div className="fixed bottom-0 inset-x-0 z-30">
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <div className="bg-white/85 backdrop-blur-xl border border-amber-200/60 rounded-2xl px-5 py-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shadow-sm">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-800 leading-snug">
                  The Tower of Knowledge is powered by many realms.
                </p>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  <span className="text-emerald-600 font-extrabold">Number Nexus</span> is the first realm open on your journey. Complete lessons to strengthen the Tower and push back the Fog of Forgetfulness!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Inline keyframes ── */}
      <style jsx>{`
        @keyframes cloudDrift {
          0% { transform: translateX(0); }
          100% { transform: translateX(30px); }
        }
        @keyframes fogDrift {
          0% { transform: translateX(-20px); opacity: 0.08; }
          100% { transform: translateX(20px); opacity: 0.15; }
        }
        @keyframes towerPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.6; transform: translate(-50%, 0) scale(0.9); }
          50% { opacity: 1; transform: translate(-50%, -3px) scale(1.1); }
        }
      `}</style>
    </main>
  );
}
