"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Sparkles, Star } from "lucide-react";

const REALMS = [
  { name: "Number Nexus", icon: "🔢", active: true, color: "from-emerald-400 to-teal-600", angle: 90, terrain: "mechanical" },
  { name: "Reading Ridge", icon: "📖", active: false, color: "from-amber-400 to-orange-500", angle: 135, terrain: "ridge" },
  { name: "Inkwell Wilds", icon: "✒️", active: false, color: "from-rose-400 to-pink-500", angle: 180, terrain: "forest" },
  { name: "Runehaven Peaks", icon: "🏔️", active: false, color: "from-slate-400 to-zinc-500", angle: 225, terrain: "peaks" },
  { name: "Measurelands", icon: "📐", active: false, color: "from-sky-400 to-blue-500", angle: 270, terrain: "valley" },
  { name: "Starpath Realm", icon: "⭐", active: false, color: "from-violet-400 to-purple-500", angle: 315, terrain: "starpath" },
  { name: "Pattern Peaks", icon: "🌀", active: false, color: "from-fuchsia-400 to-pink-600", angle: 0, terrain: "geometric" },
  { name: "Chance Hollow", icon: "🎲", active: false, color: "from-lime-400 to-green-600", angle: 45, terrain: "hills" },
  { name: "Statistica", icon: "📊", active: false, color: "from-cyan-400 to-teal-500", angle: 67, terrain: "crystal" },
];

/* Small SVG terrain snippet per realm type */
function TerrainBase({ terrain, active }: { terrain: string; active: boolean }) {
  const o = active ? 1 : 0.55;
  switch (terrain) {
    case "mechanical":
      return (
        <svg viewBox="0 0 100 40" className="w-24 h-10 -mb-1" style={{ opacity: o }}>
          {/* Gear city base */}
          <ellipse cx="50" cy="32" rx="48" ry="10" fill="hsl(145,30%,38%)" />
          <rect x="20" y="14" width="8" height="18" rx="1" fill="hsl(40,50%,65%)" />
          <rect x="32" y="10" width="10" height="22" rx="1" fill="hsl(40,55%,70%)" />
          <rect x="46" y="16" width="7" height="16" rx="1" fill="hsl(40,45%,60%)" />
          <rect x="57" y="12" width="9" height="20" rx="1" fill="hsl(40,50%,68%)" />
          <rect x="70" y="18" width="7" height="14" rx="1" fill="hsl(40,45%,62%)" />
          {/* Tiny gear */}
          <circle cx="37" cy="8" r="4" fill="none" stroke="hsl(145,50%,50%)" strokeWidth="1.5" opacity="0.7" />
          {/* Glow */}
          <ellipse cx="50" cy="20" rx="30" ry="12" fill="hsl(145,60%,50%)" opacity="0.12" />
        </svg>
      );
    case "ridge":
      return (
        <svg viewBox="0 0 100 40" className="w-20 h-8 -mb-1" style={{ opacity: o }}>
          <polygon points="10,40 30,12 50,28 70,8 90,40" fill="hsl(25,35%,55%)" />
          <polygon points="15,40 35,18 55,30 75,14 85,40" fill="hsl(25,30%,48%)" />
          <ellipse cx="50" cy="36" rx="46" ry="6" fill="hsl(90,25%,42%)" />
        </svg>
      );
    case "forest":
      return (
        <svg viewBox="0 0 100 40" className="w-20 h-8 -mb-1" style={{ opacity: o }}>
          <ellipse cx="50" cy="34" rx="46" ry="8" fill="hsl(140,35%,32%)" />
          {[15, 30, 45, 58, 72, 85].map((x, i) => (
            <g key={i}>
              <polygon points={`${x},${34 - (i % 3) * 4} ${x - 7},38 ${x + 7},38`} fill={`hsl(${140 + i * 5},${40 + i * 3}%,${28 + i * 2}%)`} />
              <polygon points={`${x},${28 - (i % 3) * 4} ${x - 5},${34 - (i % 3) * 4} ${x + 5},${34 - (i % 3) * 4}`} fill={`hsl(${140 + i * 5},${45 + i * 2}%,${32 + i * 2}%)`} />
            </g>
          ))}
        </svg>
      );
    case "peaks":
      return (
        <svg viewBox="0 0 100 44" className="w-20 h-9 -mb-1" style={{ opacity: o }}>
          <polygon points="5,44 25,8 45,44" fill="hsl(220,15%,50%)" />
          <polygon points="30,44 50,4 70,44" fill="hsl(220,12%,45%)" />
          <polygon points="55,44 75,10 95,44" fill="hsl(220,15%,52%)" />
          {/* Snow */}
          <polygon points="23,12 25,8 27,12" fill="white" opacity="0.7" />
          <polygon points="48,8 50,4 52,8" fill="white" opacity="0.8" />
          <polygon points="73,14 75,10 77,14" fill="white" opacity="0.65" />
          <ellipse cx="50" cy="40" rx="46" ry="5" fill="hsl(220,10%,40%)" opacity="0.3" />
        </svg>
      );
    case "valley":
      return (
        <svg viewBox="0 0 100 36" className="w-20 h-7 -mb-1" style={{ opacity: o }}>
          <path d="M0 20 Q25 8 50 18 Q75 28 100 14 L100 36 L0 36Z" fill="hsl(95,35%,50%)" />
          <path d="M0 26 Q30 18 60 24 Q80 28 100 22 L100 36 L0 36Z" fill="hsl(90,30%,42%)" />
          {/* Small fields */}
          <rect x="20" y="22" width="12" height="6" rx="2" fill="hsl(50,50%,60%)" opacity="0.4" />
          <rect x="60" y="20" width="14" height="5" rx="2" fill="hsl(90,40%,55%)" opacity="0.35" />
        </svg>
      );
    case "starpath":
      return (
        <svg viewBox="0 0 100 36" className="w-20 h-7 -mb-1" style={{ opacity: o }}>
          <ellipse cx="50" cy="28" rx="46" ry="10" fill="hsl(270,25%,40%)" />
          {[20, 40, 60, 80].map((x, i) => (
            <circle key={i} cx={x} cy={22 + (i % 2) * 4} r="2" fill="hsl(270,60%,70%)" opacity={0.4 + i * 0.1} />
          ))}
          <ellipse cx="50" cy="24" rx="20" ry="6" fill="hsl(270,40%,60%)" opacity="0.15" />
        </svg>
      );
    case "geometric":
      return (
        <svg viewBox="0 0 100 40" className="w-20 h-8 -mb-1" style={{ opacity: o }}>
          {/* Geometric/crystalline mountains */}
          <polygon points="10,40 22,14 34,40" fill="hsl(300,30%,50%)" />
          <polygon points="28,40 42,10 56,40" fill="hsl(300,25%,45%)" />
          <polygon points="48,40 62,16 76,40" fill="hsl(300,30%,52%)" />
          <polygon points="66,40 78,20 90,40" fill="hsl(300,28%,48%)" />
          {/* Crystal tips */}
          <polygon points="20,18 22,14 24,18" fill="hsl(300,50%,75%)" opacity="0.6" />
          <polygon points="40,14 42,10 44,14" fill="hsl(300,50%,75%)" opacity="0.7" />
          <ellipse cx="50" cy="37" rx="44" ry="5" fill="hsl(300,20%,38%)" opacity="0.3" />
        </svg>
      );
    case "hills":
      return (
        <svg viewBox="0 0 100 36" className="w-20 h-7 -mb-1" style={{ opacity: o }}>
          <ellipse cx="25" cy="28" rx="24" ry="10" fill="hsl(100,35%,48%)" />
          <ellipse cx="60" cy="26" rx="28" ry="12" fill="hsl(100,32%,44%)" />
          <ellipse cx="85" cy="30" rx="18" ry="8" fill="hsl(100,30%,50%)" />
        </svg>
      );
    case "crystal":
      return (
        <svg viewBox="0 0 100 40" className="w-20 h-8 -mb-1" style={{ opacity: o }}>
          <ellipse cx="50" cy="34" rx="46" ry="8" fill="hsl(190,30%,40%)" />
          {/* Crystal shards */}
          <polygon points="20,34 24,12 28,34" fill="hsl(190,50%,65%)" opacity="0.7" />
          <polygon points="38,34 42,8 46,34" fill="hsl(190,55%,70%)" opacity="0.8" />
          <polygon points="54,34 57,16 60,34" fill="hsl(190,50%,62%)" opacity="0.65" />
          <polygon points="68,34 72,10 76,34" fill="hsl(190,55%,68%)" opacity="0.75" />
          {/* Glow */}
          <ellipse cx="50" cy="24" rx="24" ry="10" fill="hsl(190,60%,70%)" opacity="0.1" />
        </svg>
      );
    default:
      return null;
  }
}

export default function TowerMapPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen relative overflow-hidden select-none" style={{ background: "linear-gradient(180deg, hsl(200 55% 78%) 0%, hsl(195 45% 72%) 15%, hsl(140 30% 60%) 50%, hsl(95 30% 50%) 75%, hsl(80 25% 42%) 100%)" }}>
      {/* ═══ SKY LAYER ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Clouds */}
        {[
          { w: 180, h: 40, t: 3, l: 8, dur: 22 },
          { w: 140, h: 32, t: 6, l: 55, dur: 26 },
          { w: 200, h: 44, t: 1, l: 30, dur: 20 },
          { w: 120, h: 28, t: 8, l: 78, dur: 28 },
          { w: 160, h: 36, t: 4, l: -5, dur: 24 },
        ].map((c, i) => (
          <div key={`c${i}`} className="absolute rounded-full bg-white/50 blur-lg" style={{
            width: c.w, height: c.h, top: `${c.t}%`, left: `${c.l}%`,
            animation: `cloudDrift ${c.dur}s ease-in-out infinite alternate`,
          }} />
        ))}
      </div>

      {/* ═══ DISTANT MOUNTAINS ═══ */}
      <svg className="absolute top-[18%] left-0 w-full pointer-events-none" viewBox="0 0 1200 200" preserveAspectRatio="none" style={{ opacity: 0.35 }}>
        <path d="M0 200 L60 100 L120 150 L200 60 L300 120 L380 40 L480 110 L560 30 L660 100 L740 50 L840 120 L920 70 L1020 130 L1100 80 L1200 120 L1200 200Z" fill="hsl(220,20%,62%)" />
        {/* Snow caps */}
        <polygon points="195,68 200,60 205,68" fill="white" opacity="0.5" />
        <polygon points="375,48 380,40 385,48" fill="white" opacity="0.55" />
        <polygon points="555,38 560,30 565,38" fill="white" opacity="0.6" />
        <polygon points="735,58 740,50 745,58" fill="white" opacity="0.5" />
      </svg>

      {/* ═══ MID MOUNTAINS ═══ */}
      <svg className="absolute top-[28%] left-0 w-full pointer-events-none" viewBox="0 0 1200 160" preserveAspectRatio="none" style={{ opacity: 0.3 }}>
        <path d="M0 160 L100 80 L220 120 L340 50 L440 100 L580 40 L700 90 L820 60 L940 110 L1060 70 L1200 100 L1200 160Z" fill="hsl(160,18%,48%)" />
      </svg>

      {/* ═══ FOREST BAND ═══ */}
      <svg className="absolute top-[38%] left-0 w-full pointer-events-none" viewBox="0 0 1200 100" preserveAspectRatio="none" style={{ opacity: 0.3 }}>
        {Array.from({ length: 28 }).map((_, i) => {
          const x = 20 + i * 43;
          const h = 30 + (i % 5) * 12;
          return (
            <g key={`ft${i}`}>
              <polygon points={`${x},100 ${x - 14},100 ${x - 7},${100 - h}`} fill={`hsl(${135 + (i % 4) * 5},${35 + (i % 3) * 5}%,${28 + (i % 4) * 3}%)`} />
            </g>
          );
        })}
      </svg>

      {/* ═══ RIVERS ═══ */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid meet" style={{ opacity: 0.4 }}>
        <defs>
          <linearGradient id="riv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(200,65%,65%)" />
            <stop offset="100%" stopColor="hsl(200,55%,55%)" />
          </linearGradient>
        </defs>
        {/* West river */}
        <path d="M100 50 Q90 150 120 250 Q140 320 110 400 Q80 480 130 560 Q160 620 140 720" fill="none" stroke="url(#riv)" strokeWidth="5" strokeLinecap="round" />
        {/* East river */}
        <path d="M700 80 Q680 180 710 280 Q730 370 690 450 Q660 530 700 620 Q720 700 680 780" fill="none" stroke="url(#riv)" strokeWidth="4.5" strokeLinecap="round" />
        {/* Cross stream */}
        <path d="M130 400 Q250 380 400 390 Q550 400 690 450" fill="none" stroke="url(#riv)" strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
      </svg>

      {/* ═══ FOREGROUND HILLS ═══ */}
      <svg className="absolute bottom-0 left-0 w-full pointer-events-none" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0 120 Q100 60 250 80 Q400 40 550 70 Q700 30 850 65 Q1000 45 1200 80 L1200 120Z" fill="hsl(95,28%,40%)" opacity="0.4" />
        <path d="M0 120 Q150 80 350 95 Q500 70 700 90 Q900 65 1100 85 L1200 100 L1200 120Z" fill="hsl(90,25%,35%)" opacity="0.35" />
      </svg>

      {/* ═══ FOREGROUND TREES ═══ */}
      <svg className="absolute bottom-0 left-0 w-full pointer-events-none" viewBox="0 0 1200 80" preserveAspectRatio="none" style={{ opacity: 0.45 }}>
        {[30, 80, 160, 1020, 1080, 1140, 1180].map((x, i) => (
          <g key={`fg${i}`}>
            <rect x={x - 2} y={55} width={4} height={25} fill="hsl(25,30%,30%)" />
            <polygon points={`${x},30 ${x - 12},60 ${x + 12},60`} fill={`hsl(${130 + i * 4},${40 + i * 2}%,${25 + i * 2}%)`} />
            <polygon points={`${x},18 ${x - 9},38 ${x + 9},38`} fill={`hsl(${130 + i * 4},${42 + i * 2}%,${30 + i * 2}%)`} />
          </g>
        ))}
      </svg>

      {/* ═══ FOG WISPS ═══ */}
      <div className="absolute bottom-[8%] left-[-6%] w-[55vw] h-28 bg-white/8 rounded-full blur-3xl pointer-events-none" style={{ animation: "fogDrift 14s ease-in-out infinite alternate" }} />
      <div className="absolute top-[55%] right-[-6%] w-[45vw] h-20 bg-white/6 rounded-full blur-3xl pointer-events-none" style={{ animation: "fogDrift 18s ease-in-out infinite alternate-reverse" }} />

      {/* ═══ BACK BUTTON ═══ */}
      <div className="relative z-30 p-4">
        <button
          onClick={() => router.push("/home")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm text-emerald-800 text-sm font-bold shadow-md hover:bg-white hover:shadow-lg transition-all active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>
      </div>

      {/* ═══ MAP CONTAINER ═══ */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4" style={{ height: "calc(100vh - 140px)" }}>

        {/* ── PATHS from tower to realms ── */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="pAct" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(35,40%,55%)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="hsl(35,30%,50%)" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="pLck" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(30,20%,55%)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(30,15%,50%)" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          {REALMS.map((realm) => {
            const rad = (realm.angle * Math.PI) / 180;
            const r = 210;
            const cx = 300, cy = 300;
            const rx = cx + Math.cos(rad) * r;
            const ry = cy - Math.sin(rad) * r;
            // Curved control point
            const cpx = cx + Math.cos(rad) * r * 0.5 + (realm.angle % 2 === 0 ? 20 : -20);
            const cpy = cy - Math.sin(rad) * r * 0.5 + 15;
            return (
              <path
                key={`p-${realm.name}`}
                d={`M${cx} ${cy} Q${cpx} ${cpy} ${rx} ${ry}`}
                fill="none"
                stroke={realm.active ? "url(#pAct)" : "url(#pLck)"}
                strokeWidth={realm.active ? "3.5" : "2"}
                strokeDasharray={realm.active ? "8 4" : "5 5"}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* ── CENTRAL TOWER ── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          {/* Central hill */}
          <svg className="absolute bottom-[-28px] w-40 h-12" viewBox="0 0 160 48">
            <ellipse cx="80" cy="30" rx="78" ry="20" fill="hsl(90,28%,42%)" />
            <ellipse cx="80" cy="28" rx="60" ry="14" fill="hsl(90,32%,48%)" />
          </svg>

          {/* Glow */}
          <div className="absolute -inset-12 rounded-full bg-amber-300/20 blur-2xl" style={{ animation: "towerPulse 4s ease-in-out infinite" }} />

          {/* Tower */}
          <div className="relative flex flex-col items-center">
            <div className="relative">
              <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-b-[28px] border-l-transparent border-r-transparent border-b-amber-400 mb-[-2px]" />
              <Sparkles className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-300 h-5 w-5" style={{ animation: "sparkle 2s ease-in-out infinite" }} />
            </div>
            <div className="w-16 h-28 bg-gradient-to-b from-amber-100 via-amber-50 to-stone-100 rounded-t-lg border-2 border-amber-300/60 relative overflow-hidden shadow-lg">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-5 h-6 rounded-t-full bg-amber-400/40 border border-amber-300/50" />
              <div className="absolute top-14 left-2 w-3 h-4 rounded-t-full bg-amber-400/30" />
              <div className="absolute top-14 right-2 w-3 h-4 rounded-t-full bg-amber-400/30" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-7 rounded-t-full bg-amber-700/40 border border-amber-600/30" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </div>
            <div className="w-24 h-5 bg-gradient-to-b from-stone-200 to-stone-300 rounded-b-lg border-x-2 border-b-2 border-stone-400/40 shadow-md" />
          </div>

          <p className="mt-3 text-amber-900/80 text-[10px] font-extrabold tracking-[0.18em] text-center bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
            TOWER OF KNOWLEDGE
          </p>
        </div>

        {/* ── REALM NODES ── */}
        {REALMS.map((realm) => {
          const rad = (realm.angle * Math.PI) / 180;
          const radiusPct = 38;
          const cx = 50, cy = 50;
          const x = cx + Math.cos(rad) * radiusPct;
          const y = cy - Math.sin(rad) * radiusPct;

          return (
            <div
              key={realm.name}
              className="absolute z-20"
              style={{ top: `${y}%`, left: `${x}%`, transform: "translate(-50%, -50%)" }}
            >
              {realm.active ? (
                <button
                  onClick={() => router.push("/home")}
                  className="group flex flex-col items-center cursor-pointer"
                  style={{ animation: "fadeUp 0.6s ease both" }}
                >
                  {/* Terrain base */}
                  <TerrainBase terrain={realm.terrain} active />
                  {/* Icon marker */}
                  <div className="relative -mt-3">
                    <div className="absolute -inset-3 rounded-full bg-emerald-400/30 blur-md" style={{ animation: "towerPulse 3s ease-in-out infinite" }} />
                    <div className={`relative h-[56px] w-[56px] rounded-2xl bg-gradient-to-br ${realm.color} shadow-lg shadow-emerald-600/30 flex items-center justify-center text-2xl border-2 border-white/50 group-hover:scale-110 group-active:scale-95 transition-transform`}>
                      {realm.icon}
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-sm">
                      <Star className="h-3 w-3 text-amber-800" fill="currentColor" />
                    </div>
                  </div>
                  <span className="mt-1 text-[10px] font-extrabold text-white bg-emerald-600/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
                    {realm.name}
                  </span>
                </button>
              ) : (
                <div className="flex flex-col items-center">
                  {/* Terrain base */}
                  <TerrainBase terrain={realm.terrain} active={false} />
                  {/* Icon marker */}
                  <div className={`relative -mt-2 h-[46px] w-[46px] rounded-2xl bg-gradient-to-br ${realm.color} flex items-center justify-center text-lg border border-white/20 shadow opacity-50`}>
                    {realm.icon}
                    <div className="absolute inset-0 rounded-2xl bg-stone-800/40 flex items-center justify-center backdrop-blur-[1px]">
                      <Lock className="h-4 w-4 text-white/80" />
                    </div>
                  </div>
                  <span className="mt-0.5 text-[9px] font-bold text-stone-700/60 whitespace-nowrap">
                    {realm.name}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ STORY PANEL ═══ */}
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

      {/* ═══ KEYFRAMES ═══ */}
      <style jsx>{`
        @keyframes cloudDrift {
          0% { transform: translateX(0); }
          100% { transform: translateX(40px); }
        }
        @keyframes fogDrift {
          0% { transform: translateX(-20px); opacity: 0.06; }
          100% { transform: translateX(20px); opacity: 0.12; }
        }
        @keyframes towerPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.5; transform: translate(-50%, 0) scale(0.9); }
          50% { opacity: 1; transform: translate(-50%, -3px) scale(1.1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 12px)); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </main>
  );
}
