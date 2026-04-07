"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Star } from "lucide-react";

const REALMS = [
  { name: "Number Nexus",    symbol: "⚡", active: true,  bg: "rgb(52,211,153)",  border: "rgba(52,211,153,0.6)", top: "12%", left: "50%" },
  { name: "Reading Ridge",   symbol: "▧",  active: false, bg: "rgb(217,150,80)",  border: "rgba(217,150,80,0.4)", top: "28%", left: "25%" },
  { name: "Inkwell Wilds",   symbol: "✎",  active: false, bg: "rgb(80,180,170)",  border: "rgba(80,180,170,0.4)", top: "28%", left: "75%" },
  { name: "Runehaven Peaks", symbol: "♦",  active: false, bg: "rgb(140,140,165)", border: "rgba(140,140,165,0.4)", top: "48%", left: "12%" },
  { name: "Measurelands",    symbol: "◈",  active: false, bg: "rgb(200,100,160)", border: "rgba(200,100,160,0.4)", top: "48%", left: "88%" },
  { name: "Starpath Realm",  symbol: "✦",  active: false, bg: "rgb(110,120,200)", border: "rgba(110,120,200,0.4)", top: "68%", left: "18%" },
  { name: "Statistica",      symbol: "▣",  active: false, bg: "rgb(160,120,210)", border: "rgba(160,120,210,0.4)", top: "68%", left: "82%" },
  { name: "Chance Hollow",   symbol: "◉",  active: false, bg: "rgb(100,190,100)", border: "rgba(100,190,100,0.4)", top: "82%", left: "35%" },
  { name: "Pattern Peaks",   symbol: "△",  active: false, bg: "rgb(210,100,100)", border: "rgba(210,100,100,0.4)", top: "82%", left: "65%" },
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
          onClick={() => router.push("/home")}
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
              <path
                key={`path-${r.name}`}
                d={`M${tl}% ${tt}% Q${mx}% ${my}% ${rl}% ${rt}%`}
                fill="none"
                stroke={r.active ? "url(#gpAct)" : "url(#gpLck)"}
                strokeWidth={r.active ? "2.5" : "1.2"}
                strokeDasharray={r.active ? "6 3" : "3 4"}
                strokeLinecap="round"
              />
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
            onClick={() => router.push("/home")}
            className="group flex flex-col items-center cursor-pointer"
            type="button"
          >
            <div
              className="px-5 py-2.5 rounded-xl transition-transform duration-200 group-hover:scale-105"
              style={{
                background: "rgba(20,18,14,0.8)",
                border: "1.5px solid rgba(200,170,100,0.35)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <p
                className="text-amber-100 text-[11px] font-extrabold tracking-[0.15em] text-center whitespace-nowrap leading-tight"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
              >
                TOWER OF
                <br />
                KNOWLEDGE
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
              animation: `realmFadeIn 0.35s ${i * 0.04}s ease both`,
            }}
          >
            {realm.active ? (
              <button
                onClick={() => router.push("/number-nexus")}
                className="group flex flex-col items-center cursor-pointer"
              >
                <div className="relative">
                  {/* Marker circle */}
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
                    style={{
                      background: realm.bg,
                      border: `2px solid rgba(255,255,255,0.4)`,
                      boxShadow: `0 4px 16px rgba(0,0,0,0.3), 0 2px 8px ${realm.border}`,
                    }}
                  >
                    {realm.symbol}
                  </div>
                  {/* Star badge */}
                  <div
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgb(250,204,21)",
                      border: "2px solid white",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    }}
                  >
                    <Star className="h-2.5 w-2.5 text-amber-800" fill="currentColor" />
                  </div>
                </div>
                <span
                  className="mt-1.5 text-[10px] font-bold text-white px-3 py-1 rounded-full whitespace-nowrap"
                  style={{
                    background: realm.bg,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  }}
                >
                  {realm.name}
                </span>
              </button>
            ) : (
              <div className="flex flex-col items-center">
                {/* Locked marker */}
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center relative"
                  style={{
                    background: realm.bg,
                    border: `1.5px solid ${realm.border}`,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                    opacity: 0.7,
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.4)" }}
                  >
                    <Lock className="h-4 w-4 text-white/70" />
                  </div>
                </div>
                <span
                  className="mt-1 text-[9px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap"
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    background: "rgba(20,18,14,0.6)",
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
            transform: translate(-50%, calc(-50% + 8px));
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
