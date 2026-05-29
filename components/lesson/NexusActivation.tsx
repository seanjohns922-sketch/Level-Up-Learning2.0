"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Full-screen Nexus State activation burst.
 * Fires once when comboCount crosses 10 (cold → nexus).
 * Plays a ~2.2s cinematic: shockwave ring, "NEXUS STATE ACTIVATED" lockup,
 * teal/emerald particle burst, screen flash.
 *
 * Lightweight: pure CSS animations, no JS animation loop.
 */

function seeded(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

type ActivationKey = { id: number };

export default function NexusActivation({ comboCount }: { comboCount: number }) {
  const prevRef = useRef(comboCount);
  const idRef = useRef(0);
  const [active, setActive] = useState<ActivationKey | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = comboCount;
    if (prev < 10 && comboCount >= 10) {
      idRef.current += 1;
      setActive({ id: idRef.current });
      const t = setTimeout(() => setActive(null), 2400);
      // Optional sound hook
      try {
        window.dispatchEvent(new CustomEvent("lul:nexus-activated"));
      } catch {}
      return () => clearTimeout(t);
    }
  }, [comboCount]);

  const particles = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 36 }, (_, i) => {
      const angle = (i / 36) * Math.PI * 2 + seeded(active.id * 13 + i) * 0.4;
      const distance = 220 + seeded(active.id * 17 + i) * 260;
      const size = 4 + seeded(active.id * 23 + i) * 6;
      const delay = seeded(active.id * 29 + i) * 0.25;
      const duration = 1.1 + seeded(active.id * 31 + i) * 0.7;
      const hue = seeded(active.id * 37 + i) < 0.55 ? 168 : 152; // teal / emerald
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size,
        delay,
        duration,
        hue,
      };
    });
  }, [active]);

  if (!active) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    >
      <style jsx>{`
        @keyframes nexusFlash {
          0% { opacity: 0; }
          15% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes nexusRing {
          0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0; border-width: 14px; }
          15% { opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(3.4); opacity: 0; border-width: 2px; }
        }
        @keyframes nexusBurst {
          0% { transform: translate(-50%, -50%) translate(0, 0) scale(0.4); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.2); opacity: 0; }
        }
        @keyframes nexusBadgeIn {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); filter: blur(8px); }
          18% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); filter: blur(0); }
          32% { transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.04); filter: blur(2px); }
        }
        @keyframes nexusSubIn {
          0% { opacity: 0; transform: translate(-50%, 0) translateY(12px); }
          25% { opacity: 1; transform: translate(-50%, 0) translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, 0) translateY(-6px); }
        }
        @keyframes nexusScanline {
          0% { transform: translateY(-100%); opacity: 0; }
          20% { opacity: 0.7; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>

      {/* Teal screen flash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(45,212,191,0.55) 0%, rgba(16,185,129,0.25) 35%, rgba(2,6,23,0) 70%)",
          animation: "nexusFlash 0.9s ease-out forwards",
        }}
      />

      {/* Energy data scanline */}
      <div
        className="absolute inset-x-0 h-32"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(94,234,212,0.35) 50%, transparent 100%)",
          mixBlendMode: "screen",
          animation: "nexusScanline 1.4s ease-in forwards",
        }}
      />

      {/* Shockwave rings */}
      {[0, 0.18, 0.36].map((d, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: 220,
            height: 220,
            borderStyle: "solid",
            borderColor: "rgba(94,234,212,0.85)",
            boxShadow:
              "0 0 60px rgba(45,212,191,0.7), inset 0 0 30px rgba(94,234,212,0.5)",
            animation: `nexusRing 1.6s cubic-bezier(0.22,1,0.36,1) ${d}s forwards`,
          }}
        />
      ))}

      {/* Particle burst */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={
            {
              width: p.size,
              height: p.size,
              background: `hsl(${p.hue} 90% 65%)`,
              boxShadow: `0 0 ${p.size * 3}px hsl(${p.hue} 95% 60% / 0.95), 0 0 ${p.size * 6}px hsl(${p.hue} 95% 55% / 0.55)`,
              ["--dx" as never]: `${p.x}px`,
              ["--dy" as never]: `${p.y}px`,
              animation: `nexusBurst ${p.duration}s cubic-bezier(0.16,1,0.3,1) ${p.delay}s forwards`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* NEXUS STATE ACTIVATED lockup */}
      <div
        className="absolute left-1/2 top-1/2 text-center"
        style={{
          animation: "nexusBadgeIn 2.2s cubic-bezier(0.22,1,0.36,1) forwards",
        }}
      >
        <div
          className="font-mono font-black uppercase"
          style={{
            fontSize: "clamp(2.2rem, 6vw, 4.2rem)",
            letterSpacing: "0.18em",
            lineHeight: 1,
            color: "rgba(236,254,255,1)",
            textShadow:
              "0 0 16px rgba(94,234,212,0.95), 0 0 36px rgba(20,184,166,0.85), 0 0 72px rgba(16,185,129,0.6)",
            background:
              "linear-gradient(180deg, #ecfeff 0%, #5eead4 60%, #10b981 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            paddingBottom: "0.1em",
          }}
        >
          Nexus State
        </div>
        <div
          className="mt-1 font-mono font-bold uppercase"
          style={{
            fontSize: "clamp(0.7rem, 1.4vw, 0.95rem)",
            letterSpacing: "0.42em",
            color: "rgba(167,243,208,0.95)",
            textShadow: "0 0 12px rgba(20,184,166,0.8)",
          }}
        >
          Activated
        </div>
      </div>

      {/* Subtitle */}
      <div
        className="absolute left-1/2 text-center font-sans font-extrabold"
        style={{
          bottom: "26%",
          color: "rgba(236,254,255,0.95)",
          fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)",
          textShadow: "0 0 14px rgba(20,184,166,0.9)",
          animation: "nexusSubIn 2.2s ease-out 0.15s forwards",
          opacity: 0,
        }}
      >
        10 correct in a row — your number power is surging!
      </div>
    </div>
  );
}
