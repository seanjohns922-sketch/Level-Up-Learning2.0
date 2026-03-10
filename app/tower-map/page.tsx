"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Sparkles, Star } from "lucide-react";

const REALMS = [
  { name: "Number Nexus", icon: "🔢", active: true, color: "from-emerald-400 to-teal-600", top: "38%", left: "50%" },
  { name: "Reading Ridge", icon: "📖", active: false, color: "from-amber-400 to-orange-500", top: "68%", left: "22%" },
  { name: "Inkwell Wilds", icon: "✒️", active: false, color: "from-rose-400 to-pink-500", top: "78%", left: "72%" },
  { name: "Runehaven Peaks", icon: "🏔️", active: false, color: "from-slate-400 to-zinc-500", top: "48%", left: "14%" },
  { name: "Measurelands", icon: "📐", active: false, color: "from-sky-400 to-blue-500", top: "28%", left: "22%" },
  { name: "Starpath Realm", icon: "⭐", active: false, color: "from-violet-400 to-purple-500", top: "85%", left: "46%" },
  { name: "Pattern Peaks", icon: "🌀", active: false, color: "from-fuchsia-400 to-pink-600", top: "18%", left: "72%" },
  { name: "Chance Hollow", icon: "🎲", active: false, color: "from-lime-400 to-green-600", top: "60%", left: "76%" },
  { name: "Statistica", icon: "📊", active: false, color: "from-cyan-400 to-teal-500", top: "38%", left: "80%" },
];

export default function TowerMapPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen relative overflow-hidden bg-stone-900">
      {/* ═══ FULL-SCREEN MAP BACKGROUND ═══ */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/tower-map-bg.jpg')" }}
      />
      {/* Slight overlay for readability */}
      <div className="absolute inset-0 bg-black/10" />

      {/* ═══ HEADER BAR ═══ */}
      <div className="relative z-30 flex items-center justify-between p-4">
        <button
          onClick={() => router.push("/home")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900/60 backdrop-blur-md text-amber-100 text-sm font-bold shadow-lg border border-amber-400/20 hover:bg-stone-900/80 transition-all active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </button>
        <div className="px-4 py-1.5 rounded-full bg-stone-900/60 backdrop-blur-md border border-amber-400/30 shadow-lg">
          <span className="text-amber-300 text-xs font-extrabold tracking-[0.15em]">REALMS OF KNOWLEDGE</span>
        </div>
      </div>

      {/* ═══ MAP CONTAINER — realm nodes positioned over the background ═══ */}
      <div className="relative z-10 w-full h-[calc(100vh-64px)]">

        {/* ── TOWER LABEL (center of map) ── */}
        <div className="absolute z-20" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <div className="flex flex-col items-center">
            <Sparkles className="h-5 w-5 text-amber-300 mb-1" style={{ animation: "sparkle 2s ease-in-out infinite" }} />
            <div className="bg-stone-900/70 backdrop-blur-md border border-amber-400/40 rounded-xl px-4 py-2 shadow-xl">
              <p className="text-amber-200 text-[11px] font-extrabold tracking-[0.2em] text-center whitespace-nowrap">
                TOWER OF<br/>KNOWLEDGE
              </p>
            </div>
          </div>
        </div>

        {/* ── REALM NODES ── */}
        {REALMS.map((realm, i) => (
          <div
            key={realm.name}
            className="absolute z-20"
            style={{
              top: realm.top,
              left: realm.left,
              transform: "translate(-50%, -50%)",
              animation: `realmFadeIn 0.5s ${i * 0.06}s ease both`,
            }}
          >
            {realm.active ? (
              <button
                onClick={() => router.push("/home")}
                className="group flex flex-col items-center cursor-pointer"
              >
                {/* Glow pulse behind active node */}
                <div className="absolute -inset-4 rounded-full bg-emerald-400/25 blur-lg" style={{ animation: "glowPulse 3s ease-in-out infinite" }} />

                {/* Icon node */}
                <div className="relative">
                  <div className={`relative h-[58px] w-[58px] rounded-2xl bg-gradient-to-br ${realm.color} shadow-xl shadow-emerald-700/40 flex items-center justify-center text-2xl border-2 border-white/50 group-hover:scale-110 group-active:scale-95 transition-transform`}>
                    {realm.icon}
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-md">
                    <Star className="h-3 w-3 text-amber-800" fill="currentColor" />
                  </div>
                </div>

                {/* Label */}
                <span className="mt-1.5 text-[10px] font-extrabold text-white bg-emerald-700/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg whitespace-nowrap border border-emerald-400/30">
                  {realm.name}
                </span>
              </button>
            ) : (
              <div className="flex flex-col items-center">
                {/* Icon node — dimmed & locked */}
                <div className={`relative h-[48px] w-[48px] rounded-2xl bg-gradient-to-br ${realm.color} flex items-center justify-center text-lg border border-white/15 shadow-lg`}>
                  {realm.icon}
                  <div className="absolute inset-0 rounded-2xl bg-stone-900/50 backdrop-blur-[1px] flex items-center justify-center">
                    <Lock className="h-4 w-4 text-white/70" />
                  </div>
                </div>
                {/* Label */}
                <span className="mt-1 text-[9px] font-bold text-amber-100/80 bg-stone-900/50 backdrop-blur-sm px-2 py-0.5 rounded-full whitespace-nowrap">
                  {realm.name}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ═══ STORY PANEL ═══ */}
      <div className="fixed bottom-0 inset-x-0 z-30">
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <div className="bg-stone-900/80 backdrop-blur-xl border border-amber-400/25 rounded-2xl px-5 py-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-amber-400/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-100 leading-snug">
                  The Tower of Knowledge is powered by many realms.
                </p>
                <p className="text-xs text-amber-200/70 mt-1 leading-relaxed">
                  <span className="text-emerald-400 font-extrabold">Number Nexus</span> is the first realm open on your journey. Complete lessons to strengthen the Tower and push back the Fog of Forgetfulness!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ KEYFRAMES ═══ */}
      <style jsx>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0.5; transform: translateY(0) scale(0.9); }
          50% { opacity: 1; transform: translateY(-3px) scale(1.1); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.08); }
        }
        @keyframes realmFadeIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 10px)); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </main>
  );
}
