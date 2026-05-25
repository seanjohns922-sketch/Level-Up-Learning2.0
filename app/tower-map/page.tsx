"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Star } from "lucide-react";

const REALMS = [
  { name: "Number Nexus",    symbol: "⚡", active: true,  bg: "rgb(46,200,140)",  shade: "rgb(20,120,85)",  border: "rgba(255,255,255,0.9)", top: "13%", left: "50%" },
  { name: "Reading Ridge",   symbol: "▧",  active: false, bg: "rgb(228,160,80)",  shade: "rgb(150,90,30)",  border: "rgba(255,255,255,0.5)", top: "28%", left: "23%" },
  { name: "Inkwell Wilds",   symbol: "✎",  active: false, bg: "rgb(80,190,180)",  shade: "rgb(30,110,110)", border: "rgba(255,255,255,0.5)", top: "28%", left: "77%" },
  { name: "Runehaven Peaks", symbol: "♦",  active: false, bg: "rgb(150,150,180)", shade: "rgb(80,80,110)",  border: "rgba(255,255,255,0.5)", top: "48%", left: "11%" },
  { name: "Measurelands",    symbol: "◈",  active: false, bg: "rgb(220,110,170)", shade: "rgb(130,40,90)",  border: "rgba(255,255,255,0.5)", top: "48%", left: "89%" },
  { name: "Starpath Realm",  symbol: "✦",  active: false, bg: "rgb(120,130,220)", shade: "rgb(55,60,140)",  border: "rgba(255,255,255,0.5)", top: "68%", left: "17%" },
  { name: "Statistica",      symbol: "▣",  active: false, bg: "rgb(175,130,225)", shade: "rgb(95,60,150)",  border: "rgba(255,255,255,0.5)", top: "68%", left: "83%" },
  { name: "Chance Hollow",   symbol: "◉",  active: false, bg: "rgb(110,200,110)", shade: "rgb(45,120,55)",  border: "rgba(255,255,255,0.5)", top: "82%", left: "33%" },
  { name: "Pattern Peaks",   symbol: "△",  active: false, bg: "rgb(225,105,105)", shade: "rgb(140,40,40)",  border: "rgba(255,255,255,0.5)", top: "82%", left: "67%" },
];

const TOWER = { top: "46%", left: "50%" };

export default function TowerMapPage() {
  const router = useRouter();

  return (
    <main className="h-screen relative overflow-hidden" style={{ background: "#1a1510" }}>
      {/* Background map — no glow, natural lighting */}
      <div className="absolute inset-0">
        <img
          src="/images/tower-map-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 35%" }}
        />
        {/* Vignette for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: "inset 0 0 150px 60px rgba(10,8,5,0.55), inset 0 -80px 80px -20px rgba(10,8,5,0.4)",
          }}
        />
        {/* Subtle top darkening for sky contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/15" />
      </div>

      {/* Header */}
      <div className="relative z-30 flex items-center justify-between px-4 pt-3 pb-1">
        <button
          onClick={() => router.push("/levels")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white/80 text-xs font-bold transition-all active:scale-95 hover:text-white"
          style={{
            background: "rgba(20,18,14,0.7)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(8px)",
          }}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </button>
        <div
          className="px-4 py-1.5 rounded-full"
          style={{
            background: "rgba(20,18,14,0.7)",
            border: "1px solid rgba(200,170,100,0.2)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span className="text-amber-200/80 text-[9px] font-bold tracking-[0.12em]">
            REALMS OF KNOWLEDGE
          </span>
        </div>
      </div>

      {/* Map area */}
      <div className="relative z-10 w-full" style={{ height: "calc(100vh - 48px)" }}>
        {/* SVG paths — clean, no glow filter */}
        <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <defs>
            <linearGradient id="gpAct" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(200,180,120,0.6)" />
              <stop offset="100%" stopColor="rgba(52,211,153,0.5)" />
            </linearGradient>
            <linearGradient id="gpLck" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(160,140,100,0.15)" />
              <stop offset="100%" stopColor="rgba(140,120,80,0.08)" />
            </linearGradient>
          </defs>
          {REALMS.map((r) => {
            const tl = parseFloat(TOWER.left);
            const tt = parseFloat(TOWER.top);
            const rl = parseFloat(r.left);
            const rt = parseFloat(r.top);
            const mx = (tl + rl) / 2 + (rl > 50 ? 5 : rl < 50 ? -5 : 0);
            const my = (tt + rt) / 2 + (rt < tt ? -3 : 3);
            return (
              <g key={`path-${r.name}`}>
                {/* Path shadow base */}
                <path
                  d={`M${tl}% ${tt}% Q${mx}% ${my}% ${rl}% ${rt}%`}
                  fill="none"
                  stroke="rgba(0,0,0,0.45)"
                  strokeWidth={r.active ? "11" : "7"}
                  strokeLinecap="round"
                />
                {/* Path body */}
                <path
                  d={`M${tl}% ${tt}% Q${mx}% ${my}% ${rl}% ${rt}%`}
                  fill="none"
                  stroke={r.active ? "rgb(232,206,140)" : "rgba(120,100,75,0.55)"}
                  strokeWidth={r.active ? "8" : "5"}
                  strokeLinecap="round"
                />
                {/* Dashed walking line */}
                <path
                  d={`M${tl}% ${tt}% Q${mx}% ${my}% ${rl}% ${rt}%`}
                  fill="none"
                  stroke={r.active ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.18)"}
                  strokeWidth={r.active ? "2" : "1.4"}
                  strokeDasharray="5 6"
                  strokeLinecap="round"
                />
              </g>
            );
          })}
          {/* Small checkpoint nodes along active path */}
          {REALMS.filter((r) => r.active).map((r) => {
            const tl = parseFloat(TOWER.left);
            const tt = parseFloat(TOWER.top);
            const rl = parseFloat(r.left);
            const rt = parseFloat(r.top);
            return [0.3, 0.6].map((t, i) => {
              const cx = tl + (rl - tl) * t;
              const cy = tt + (rt - tt) * t;
              return (
                <circle
                  key={`node-${r.name}-${i}`}
                  cx={`${cx}%`}
                  cy={`${cy}%`}
                  r="3"
                  fill="rgba(200,180,120,0.5)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                />
              );
            });
          })}
        </svg>

        {/* Tower of Knowledge — interactive */}
        <div
          className="absolute z-15"
          style={{ top: TOWER.top, left: TOWER.left, transform: "translate(-50%,-50%)" }}
        >
          <button
            onClick={() => router.push("/levels")}
            className="group flex flex-col items-center cursor-pointer towerBob"
            type="button"
          >
            <div
              className="relative px-6 py-3 rounded-2xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
              style={{
                background: "linear-gradient(180deg, #f8d77a 0%, #d99a35 55%, #8a5418 100%)",
                border: "3px solid #2a1a08",
                boxShadow:
                  "0 0 0 2px rgba(255,230,160,0.55) inset, 0 10px 0 #2a1a08, 0 14px 30px rgba(0,0,0,0.55)",
              }}
            >
              <p
                className="text-white text-[13px] font-black tracking-[0.18em] text-center whitespace-nowrap leading-tight"
                style={{
                  textShadow:
                    "0 2px 0 #2a1a08, 0 -1px 0 rgba(255,255,255,0.25), 0 0 12px rgba(255,210,120,0.6)",
                  WebkitTextStroke: "0.5px #2a1a08",
                }}
              >
                ⚔ TOWER OF
                <br />
                KNOWLEDGE ⚔
              </p>
            </div>
          </button>
        </div>

        {/* Realm markers */}
        {REALMS.map((realm, i) => (
          <div
            key={realm.name}
            className="absolute z-20"
            style={{
              top: realm.top,
              left: realm.left,
              transform: "translate(-50%,-50%)",
              animation: `realmFadeIn 0.45s ${i * 0.05}s ease both`,
            }}
          >
            {realm.active ? (
              <button
                onClick={() => router.push("/number-nexus")}
                className="group flex flex-col items-center cursor-pointer realmBob"
              >
                <div className="relative">
                  {/* Pulse halo */}
                  <div
                    className="absolute inset-0 rounded-[28px] -z-10 animate-ping"
                    style={{ background: realm.bg, opacity: 0.25 }}
                  />
                  {/* Chunky crest */}
                  <div
                    className="h-20 w-20 rounded-[28px] flex items-center justify-center text-3xl font-black text-white transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
                    style={{
                      background: `linear-gradient(180deg, ${realm.bg} 0%, ${realm.bg} 50%, ${realm.shade} 100%)`,
                      border: `4px solid #1a1208`,
                      boxShadow: `inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -8px 0 rgba(0,0,0,0.25), 0 8px 0 #1a1208, 0 14px 24px rgba(0,0,0,0.45)`,
                      textShadow: "0 2px 0 rgba(0,0,0,0.45)",
                    }}
                  >
                    {realm.symbol}
                  </div>
                  {/* Gem star badge */}
                  <div
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full flex items-center justify-center"
                    style={{
                      background: "linear-gradient(180deg, #ffe680 0%, #f5b400 60%, #8a5a00 100%)",
                      border: "2.5px solid #1a1208",
                      boxShadow: "0 3px 0 #1a1208, 0 0 12px rgba(255,200,60,0.7)",
                    }}
                  >
                    <Star className="h-3.5 w-3.5 text-amber-900" fill="currentColor" />
                  </div>
                </div>
                {/* Ribbon nameplate */}
                <span
                  className="mt-2.5 text-[11px] font-black text-white px-4 py-1.5 whitespace-nowrap tracking-wide uppercase"
                  style={{
                    background: `linear-gradient(180deg, ${realm.bg}, ${realm.shade})`,
                    border: "2.5px solid #1a1208",
                    borderRadius: "8px",
                    boxShadow: "0 4px 0 #1a1208, 0 6px 14px rgba(0,0,0,0.4)",
                    textShadow: "0 1.5px 0 rgba(0,0,0,0.5)",
                  }}
                >
                  {realm.name}
                </span>
              </button>
            ) : (
              <div className="flex flex-col items-center">
                {/* Locked stone crest */}
                <div
                  className="h-16 w-16 rounded-[22px] flex items-center justify-center relative"
                  style={{
                    background: `linear-gradient(180deg, ${realm.bg}, ${realm.shade})`,
                    border: "3.5px solid #1a1208",
                    boxShadow: "inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -6px 0 rgba(0,0,0,0.3), 0 6px 0 #1a1208, 0 10px 18px rgba(0,0,0,0.4)",
                    filter: "saturate(0.55) brightness(0.75)",
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-[18px] flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                  >
                    <Lock className="h-5 w-5 text-white/85" />
                  </div>
                </div>
                <span
                  className="mt-2 text-[10px] font-extrabold px-3 py-1 whitespace-nowrap uppercase tracking-wide"
                  style={{
                    color: "rgba(255,240,210,0.85)",
                    background: "rgba(20,16,10,0.85)",
                    border: "2px solid #1a1208",
                    borderRadius: "6px",
                    boxShadow: "0 3px 0 #1a1208",
                  }}
                >
                  {realm.name}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom info card */}
      <div className="fixed bottom-0 inset-x-0 z-30">
        <div className="max-w-lg mx-auto px-3 pb-3">
          <div
            className="rounded-2xl px-4 py-3"
            style={{
              background: "rgba(20,18,14,0.85)",
              border: "1px solid rgba(200,170,100,0.15)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 -4px 24px rgba(0,0,0,0.3)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(200,170,100,0.15)" }}
              >
                <span className="text-amber-300 text-sm">⚡</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-amber-100/90 leading-snug">
                  The Tower of Knowledge is powered by many realms.
                </p>
                <p className="text-[10px] text-white/50 leading-snug mt-0.5">
                  <span className="text-emerald-400 font-bold">Number Nexus</span> is the first realm open. Complete lessons to strengthen the Tower!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes realmFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, calc(-50% + 14px)) scale(0.85);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
        .realmBob { animation: bob 2.8s ease-in-out infinite; }
        .towerBob { animation: bob 3.4s ease-in-out infinite; }
      `}</style>
    </main>
  );
}
