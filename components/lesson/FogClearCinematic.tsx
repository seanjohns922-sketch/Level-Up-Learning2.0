"use client";

import { useEffect, useState } from "react";
import type { FogProgress } from "@/lib/fog-progress";

/**
 * One-shot cinematic shown on the post-test results screen when a post-test is
 * PASSED. The Fog of Forgetfulness blasts back and a floor of the Tower of
 * Knowledge relights. Auto-dismisses after ~4s.
 */
export default function FogClearCinematic({
  progress,
  onDone,
}: {
  progress: FogProgress;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"blast" | "tower">("blast");
  const { floorsLit, totalFloors } = progress;

  useEffect(() => {
    const toTower = window.setTimeout(() => setPhase("tower"), 1100);
    const done = window.setTimeout(onDone, 4200);
    return () => {
      window.clearTimeout(toTower);
      window.clearTimeout(done);
    };
  }, [onDone]);

  const ACCENT = "#e8c878";
  const GLOW = "rgba(200,160,48,0.6)";

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(10,8,20,0.92) 0%, rgba(4,2,10,0.98) 100%)" }}
    >
      <style jsx>{`
        @keyframes fogBlast {
          0% { opacity: 0.95; transform: scale(1); }
          100% { opacity: 0; transform: scale(2.4); filter: blur(40px); }
        }
        @keyframes fogFlash {
          0% { opacity: 0; }
          20% { opacity: 0.5; }
          100% { opacity: 0; }
        }
        @keyframes fogTextIn {
          0% { opacity: 0; transform: translateY(16px) scale(0.92); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes floorLight {
          0% { opacity: 0; transform: scaleX(0.2); }
          60% { opacity: 1; transform: scaleX(1.08); }
          100% { opacity: 1; transform: scaleX(1); }
        }
      `}</style>

      {/* Fog blasting outward */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(220,222,235,0.85) 0%, rgba(190,195,215,0.5) 40%, transparent 72%)",
          animation: "fogBlast 1.2s ease-in forwards",
        }}
      />
      <div className="absolute inset-0 bg-white" style={{ animation: "fogFlash 0.9s ease-out forwards" }} />

      {phase === "tower" && (
        <div className="relative text-center px-6" style={{ animation: "fogTextIn 0.6s cubic-bezier(0.22,1,0.36,1) forwards" }}>
          {/* tower */}
          <div className="mx-auto mb-5 flex w-fit flex-col-reverse items-center gap-[5px]">
            <span
              className="mb-1 block"
              style={{
                width: 0, height: 0,
                borderLeft: "12px solid transparent",
                borderRight: "12px solid transparent",
                borderBottom: `18px solid ${floorsLit >= totalFloors ? ACCENT : "rgba(255,255,255,0.2)"}`,
                filter: floorsLit >= totalFloors ? `drop-shadow(0 0 10px ${GLOW})` : "none",
                order: 99,
              }}
            />
            {Array.from({ length: totalFloors }).map((_, idx) => {
              const lit = idx < floorsLit;
              const isNewest = idx === floorsLit - 1;
              return (
                <span
                  key={idx}
                  className="block rounded-[3px]"
                  style={{
                    width: 44,
                    height: 13,
                    background: lit ? ACCENT : "rgba(255,255,255,0.1)",
                    boxShadow: lit ? `0 0 12px ${GLOW}, inset 0 1px 0 rgba(255,255,255,0.45)` : "none",
                    transformOrigin: "center",
                    animation: isNewest ? "floorLight 0.8s ease-out 0.2s both" : undefined,
                  }}
                />
              );
            })}
          </div>

          <div
            className="font-mono font-black uppercase"
            style={{
              fontSize: "clamp(1.8rem, 6vw, 3.2rem)",
              letterSpacing: "0.08em",
              background: "linear-gradient(180deg, #fff8e8 0%, #e8c878 55%, #8b6520 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 22px rgba(200,160,48,0.7))",
            }}
          >
            The Fog Retreats!
          </div>
          <div className="mt-2 font-sans font-bold text-white/90" style={{ fontSize: "clamp(1rem, 2.6vw, 1.4rem)" }}>
            {floorsLit >= totalFloors
              ? "The Tower of Knowledge is fully restored!"
              : "A floor of the Tower of Knowledge relights."}
          </div>
          <div className="mt-3 font-mono font-bold uppercase tracking-[0.2em]" style={{ color: ACCENT, fontSize: "clamp(0.75rem, 1.6vw, 1rem)" }}>
            Tower restored: {floorsLit} / {totalFloors}
          </div>
        </div>
      )}
    </div>
  );
}
