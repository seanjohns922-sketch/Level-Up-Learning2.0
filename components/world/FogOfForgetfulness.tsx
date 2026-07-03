"use client";

import { useMemo } from "react";
import type { FogProgress } from "@/lib/fog-progress";

/**
 * The Fog of Forgetfulness on a realm world map + the Tower of Knowledge badge.
 * The fog is heavy when no post-tests are passed and recedes to nothing as the
 * Tower's floors relight (one floor per post-test passed, 7 total).
 *
 * Drop into a full-screen, position:relative map. Pure CSS — iPad-friendly.
 */
export default function FogOfForgetfulness({
  progress,
  accent,
  glow,
  badgeClassName = "bottom-32 left-4",
}: {
  progress: FogProgress;
  accent: string; // realm tint for the lit tower floors
  glow: string;
  badgeClassName?: string;
}) {
  const { floorsLit, totalFloors, fraction } = progress;
  const fogOpacity = Math.max(0, 1 - fraction); // 1 = full fog, 0 = clear

  const clouds = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const seed = (n: number) => {
          const x = Math.sin((i + 1) * n * 12.9898) * 43758.5453;
          return x - Math.floor(x);
        };
        return {
          id: i,
          top: 8 + seed(2) * 64,
          size: 36 + seed(3) * 34, // vw
          dur: 26 + seed(4) * 26,
          delay: -seed(5) * 30,
          dir: i % 2 === 0 ? 1 : -1,
        };
      }),
    []
  );

  return (
    <>
      {/* ── Drifting fog ── */}
      {fogOpacity > 0.02 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
          style={{ opacity: fogOpacity }}
        >
          <style jsx>{`
            @keyframes fogDriftR {
              0% { transform: translateX(-30%); }
              100% { transform: translateX(130%); }
            }
            @keyframes fogDriftL {
              0% { transform: translateX(130%); }
              100% { transform: translateX(-30%); }
            }
          `}</style>
          {/* flat haze */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(40,44,60,0.55) 0%, rgba(30,32,46,0.32) 45%, rgba(22,24,38,0.6) 100%)",
            }}
          />
          {/* drifting cloud blobs */}
          {clouds.map((c) => (
            <div
              key={c.id}
              className="absolute"
              style={{
                top: `${c.top}%`,
                left: 0,
                width: `${c.size}vw`,
                height: `${c.size * 0.6}vw`,
                background:
                  "radial-gradient(ellipse at center, rgba(220,222,235,0.5) 0%, rgba(200,205,225,0.28) 40%, transparent 72%)",
                filter: "blur(26px)",
                animation: `${c.dir === 1 ? "fogDriftR" : "fogDriftL"} ${c.dur}s linear ${c.delay}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Tower of Knowledge badge ── (raised to clear the bottom nav bar) */}
      <div className={`absolute z-[20] select-none ${badgeClassName}`}>
        <div
          className="flex items-end gap-2.5 rounded-2xl px-3 py-2.5 backdrop-blur-md"
          style={{
            background: "rgba(8,10,20,0.55)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 6px 22px rgba(0,0,0,0.5)",
          }}
        >
          {/* mini tower */}
          <div className="flex flex-col-reverse items-center gap-[3px]">
            {/* spire (lights only when fully restored) */}
            <span
              className="mb-[2px] block"
              style={{
                width: 0,
                height: 0,
                borderLeft: "7px solid transparent",
                borderRight: "7px solid transparent",
                borderBottom: `10px solid ${floorsLit >= totalFloors ? accent : "rgba(255,255,255,0.18)"}`,
                filter: floorsLit >= totalFloors ? `drop-shadow(0 0 6px ${glow})` : "none",
                order: 99,
              }}
            />
            {Array.from({ length: totalFloors }).map((_, idx) => {
              const lit = idx < floorsLit;
              return (
                <span
                  key={idx}
                  className="block rounded-[2px] transition-all duration-500"
                  style={{
                    width: 18,
                    height: 6,
                    background: lit ? accent : "rgba(255,255,255,0.1)",
                    boxShadow: lit ? `0 0 8px ${glow}, inset 0 1px 0 rgba(255,255,255,0.4)` : "none",
                  }}
                />
              );
            })}
          </div>

          {/* label */}
          <div className="pb-0.5">
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-white/55">
              Tower of Knowledge
            </div>
            <div className="mt-0.5 font-mono font-black text-white" style={{ fontSize: "1.05rem" }}>
              {floorsLit}
              <span className="text-white/45 text-sm font-bold"> / {totalFloors}</span>
            </div>
            <div className="text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: accent }}>
              {floorsLit >= totalFloors
                ? "Fully restored!"
                : floorsLit === 0
                ? "Shrouded in fog"
                : "Pushing back the fog"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
