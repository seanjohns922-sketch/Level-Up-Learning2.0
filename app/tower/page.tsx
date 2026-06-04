"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { getTowerFloors, getFloorsRestored, getTowerStreakLevel } from "@/lib/tower-realms";

export default function TowerOfKnowledgePage() {
  const router = useRouter();
  const floors = useMemo(() => getTowerFloors(), []);
  const restoredCount = useMemo(() => getFloorsRestored(floors), [floors]);
  const streakLevel = useMemo(() => getTowerStreakLevel(), []);
  const overall = floors.length ? floors.reduce((s, f) => s + f.percent, 0) / floors.length : 0;
  const pct = Math.round(overall * 100);

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#0a0814" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/dashboard-bg.jpg"
        alt=""
        className="pointer-events-none fixed inset-0 h-full w-full object-cover"
        style={{ objectPosition: "center 35%", filter: "brightness(0.4) saturate(1.05)" }}
      />
      <div className="pointer-events-none fixed inset-0" style={{ background: "radial-gradient(ellipse 80% 70% at 50% 25%, rgba(200,160,48,0.12) 0%, transparent 60%), linear-gradient(180deg, rgba(8,6,20,0.72) 0%, rgba(6,4,14,0.93) 100%)" }} />

      <style jsx>{`
        @keyframes beaconPulse { 0%,100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
      `}</style>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs font-mono font-black uppercase tracking-[0.14em] text-white/85 backdrop-blur-md transition hover:bg-black/45"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="rounded-full border border-amber-300/30 bg-black/30 px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-amber-200/90 backdrop-blur-md">
          {restoredCount}/{floors.length} Floors · {pct}%
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 mt-3 text-center px-6">
        <h1
          className="font-mono font-black uppercase tracking-[0.06em]"
          style={{
            fontSize: "clamp(1.8rem, 6vw, 3rem)",
            background: "linear-gradient(180deg, #fff8e8 0%, #e8c878 55%, #8b6520 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 22px rgba(200,160,48,0.5))",
          }}
        >
          Tower of Knowledge
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-white/65">
          The Fog of Forgetfulness shattered the Tower. Restore it floor by floor —
          complete each level&apos;s realms and fight off the villains to relight it.
        </p>
      </div>

      {/* Beacon — brightness from streak */}
      <div className="relative z-10 mt-5 flex flex-col items-center gap-1.5">
        <div
          className="rounded-full"
          style={{
            width: 38 + streakLevel * 18,
            height: 38 + streakLevel * 18,
            background: `radial-gradient(circle, rgba(255,248,232,${0.35 + streakLevel * 0.65}) 0%, rgba(200,160,48,${0.25 + streakLevel * 0.6}) 50%, transparent 75%)`,
            boxShadow: `0 0 ${18 + streakLevel * 70}px rgba(200,160,48,${0.35 + streakLevel * 0.6})`,
            animation: "beaconPulse 2.6s ease-in-out infinite",
          }}
        />
        <div className="text-[9px] font-mono font-bold uppercase tracking-[0.22em] text-amber-200/70">
          {streakLevel > 0 ? "Beacon glows with your streak" : "Build a streak to light the beacon"}
        </div>
      </div>

      {/* The Tower — level floors, base (Ground) at the bottom */}
      <div className="relative z-10 mx-auto mt-5 flex w-full max-w-md flex-col gap-2 px-4 pb-12">
        {[...floors].reverse().map((floor) => {
          const filled = Math.round(floor.percent * 100);
          const enterable = floor.state !== "locked";
          const accent =
            floor.state === "restored" ? "#e8c878" : floor.state === "current" ? "#5eead4" : "#64748b";
          const glow =
            floor.state === "restored" ? "rgba(200,160,48,0.5)" : floor.state === "current" ? "rgba(45,212,191,0.45)" : "transparent";
          return (
            <button
              key={floor.year}
              type="button"
              disabled={!enterable}
              onClick={() => enterable && router.push(`/realms?level=${encodeURIComponent(floor.year)}`)}
              className="group relative w-full overflow-hidden rounded-2xl px-4 py-3 text-left transition-all"
              style={{
                background: floor.state === "locked" ? "rgba(18,18,28,0.7)" : "linear-gradient(135deg, rgba(20,14,4,0.85), rgba(40,30,10,0.7))",
                border: `1px solid ${enterable ? accent + "66" : "rgba(255,255,255,0.08)"}`,
                boxShadow: enterable ? `0 0 16px ${glow}, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.03)",
                cursor: enterable ? "pointer" : "default",
                opacity: floor.state === "locked" ? 0.72 : 1,
              }}
            >
              <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 transition-all duration-700" style={{ width: `${filled}%`, background: `linear-gradient(90deg, ${accent}22, ${accent}05)` }} />

              <div className="relative flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-black leading-tight text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
                    {floor.label}
                  </div>
                  <div className="text-[11px] font-semibold" style={{ color: floor.state === "restored" ? "#e8c878" : floor.state === "current" ? "#7de7d7" : "rgba(255,255,255,0.4)" }}>
                    {floor.state === "restored" ? "Restored" : floor.state === "current" ? "Restoring…" : "Shrouded in fog"}
                  </div>
                </div>
                <div className="text-right">
                  {enterable ? (
                    <>
                      <div className="font-mono font-black tabular-nums" style={{ color: accent, fontSize: "1.05rem", textShadow: `0 0 10px ${glow}` }}>
                        {filled}%
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/45 group-hover:text-white/70">
                        Enter ▸
                      </div>
                    </>
                  ) : (
                    <Lock size={16} className="text-white/35" />
                  )}
                </div>
              </div>

              {enterable && (
                <div className="relative mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${filled}%`, background: accent, boxShadow: `0 0 8px ${glow}` }} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </main>
  );
}
