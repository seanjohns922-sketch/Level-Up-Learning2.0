"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * The top-tier 10-combo celebration.
 * Realm-aware:
 *   - Number Nexus: "NEXUS STATE — ACTIVATED" (teal energy grid + data scanline).
 *   - Measurelands: "LEGENDARY — EXPLORER" (golden clock-face bloom, sweeping
 *     clock hand, purple+brass particle storm, floating measurement glyphs).
 */

function seeded(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

type ActivationKey = { id: number };

type RealmTheme = {
  flashBg: string;
  gridColor: string;
  scanColor: string;
  ringInner: string;
  ringOuter: string;
  ringShadow: string;
  cornerConic: string;
  titleGradient: string;
  titleFilter: string;
  title: string;
  engaged: string;
  engagedColor: string;
  engagedShadow: string;
  dividerGradient: string;
  dividerShadow: string;
  copy: string;
  copyColor: string;
  copyShadow: string;
  bottomText: string;
  bottomColor: string;
  bottomShadow: string;
  particleHues: [number, number];
  particleSplit: number;
};

const NEXUS_THEME: RealmTheme = {
  flashBg: "radial-gradient(circle at 50% 50%, rgba(45,212,191,0.65) 0%, rgba(16,185,129,0.3) 40%, rgba(2,6,23,0) 75%)",
  gridColor: "rgba(94,234,212,0.18)",
  scanColor: "rgba(94,234,212,0.45)",
  ringInner: "rgba(94,234,212,0.9)",
  ringOuter: "rgba(45,212,191,0.6)",
  ringShadow: "0 0 50px rgba(45,212,191,0.7), inset 0 0 24px rgba(94,234,212,0.45)",
  cornerConic:
    "conic-gradient(from 45deg, rgba(94,234,212,0.0), rgba(94,234,212,0.7) 15%, rgba(45,212,191,0.5) 30%, rgba(16,185,129,0.3) 45%, rgba(94,234,212,0.0) 60%)",
  titleGradient: "linear-gradient(180deg, #ecfeff 0%, #5eead4 45%, #10b981 100%)",
  titleFilter: "drop-shadow(0 0 24px rgba(45,212,191,0.95)) drop-shadow(0 0 48px rgba(16,185,129,0.7))",
  title: "NEXUS STATE",
  engaged: "ACTIVATED",
  engagedColor: "rgba(167,243,208,0.98)",
  engagedShadow: "0 0 18px rgba(45,212,191,0.9), 0 0 36px rgba(20,184,166,0.7)",
  dividerGradient: "linear-gradient(90deg, transparent, rgba(94,234,212,0.9), rgba(16,185,129,0.7), transparent)",
  dividerShadow: "0 0 12px rgba(45,212,191,0.7)",
  copy: "Your number power is surging!",
  copyColor: "rgba(167,243,208,0.9)",
  copyShadow: "0 0 10px rgba(20,184,166,0.8)",
  bottomText: "10 correct in a row",
  bottomColor: "rgba(94,234,212,0.9)",
  bottomShadow: "0 0 12px rgba(20,184,166,0.8)",
  particleHues: [168, 152],
  particleSplit: 0.55,
};

const MEASURE_THEME: RealmTheme = {
  flashBg: "radial-gradient(circle at 50% 50%, rgba(200,160,48,0.6) 0%, rgba(109,40,217,0.32) 42%, rgba(20,8,0,0) 75%)",
  gridColor: "rgba(200,160,48,0.16)",
  scanColor: "rgba(200,160,48,0.4)",
  ringInner: "rgba(232,200,120,0.9)",
  ringOuter: "rgba(167,139,250,0.6)",
  ringShadow: "0 0 50px rgba(200,160,48,0.6), inset 0 0 24px rgba(167,139,250,0.4)",
  cornerConic:
    "conic-gradient(from 45deg, rgba(200,160,48,0.0), rgba(200,160,48,0.7) 15%, rgba(167,139,250,0.5) 30%, rgba(109,40,217,0.3) 45%, rgba(200,160,48,0.0) 60%)",
  titleGradient: "linear-gradient(180deg, #fff8e8 0%, #e8c878 45%, #8b6520 100%)",
  titleFilter: "drop-shadow(0 0 24px rgba(200,160,48,0.95)) drop-shadow(0 0 48px rgba(109,40,217,0.6))",
  title: "LEGENDARY",
  engaged: "EXPLORER",
  engagedColor: "rgba(232,200,120,0.98)",
  engagedShadow: "0 0 18px rgba(200,160,48,0.9), 0 0 36px rgba(109,40,217,0.6)",
  dividerGradient: "linear-gradient(90deg, transparent, rgba(200,160,48,0.9), rgba(167,139,250,0.7), transparent)",
  dividerShadow: "0 0 12px rgba(200,160,48,0.7)",
  copy: "Your measuring magic is legendary!",
  copyColor: "rgba(232,200,120,0.92)",
  copyShadow: "0 0 10px rgba(139,101,32,0.8)",
  bottomText: "10 in a row — Meazurex is impressed",
  bottomColor: "rgba(200,160,48,0.9)",
  bottomShadow: "0 0 12px rgba(139,101,32,0.8)",
  particleHues: [42, 265],
  particleSplit: 0.5,
};

const MEASURE_GLYPHS = ["⏳", "⚙", "½", "⏱", "⚖", "📏"];

export default function NexusActivation({ comboCount, realmId }: { comboCount: number; realmId?: string }) {
  const isMeasurement = realmId === "measurement";
  const t = isMeasurement ? MEASURE_THEME : NEXUS_THEME;
  const prevRef = useRef(comboCount);
  const idRef = useRef(0);
  const [active, setActive] = useState<ActivationKey | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = comboCount;
    if (prev < 10 && comboCount >= 10) {
      idRef.current += 1;
      setActive({ id: idRef.current });
      const timer = setTimeout(() => setActive(null), 2800);
      try {
        window.dispatchEvent(new CustomEvent(isMeasurement ? "lul:legendary-activated" : "lul:nexus-activated"));
      } catch {}
      return () => clearTimeout(timer);
    }
  }, [comboCount, isMeasurement]);

  const particles = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 52 }, (_, i) => {
      const angle = (i / 52) * Math.PI * 2 + seeded(active.id * 13 + i) * 0.5;
      const distance = 180 + seeded(active.id * 17 + i) * 300;
      const size = 3 + seeded(active.id * 23 + i) * 8;
      const delay = seeded(active.id * 29 + i) * 0.3;
      const duration = 1.0 + seeded(active.id * 31 + i) * 0.8;
      const hue = seeded(active.id * 37 + i) < t.particleSplit ? t.particleHues[0] : t.particleHues[1];
      return { id: i, x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, size, delay, duration, hue };
    });
  }, [active, t.particleHues, t.particleSplit]);

  const glyphs = useMemo(() => {
    if (!active || !isMeasurement) return [];
    return Array.from({ length: 14 }, (_, i) => {
      const left = 5 + seeded(active.id * 61 + i) * 90;
      const delay = seeded(active.id * 67 + i) * 0.7;
      const size = 24 + seeded(active.id * 71 + i) * 32;
      const rot = (seeded(active.id * 73 + i) - 0.5) * 50;
      return { id: i, char: MEASURE_GLYPHS[i % MEASURE_GLYPHS.length], left, delay, size, rot };
    });
  }, [active, isMeasurement]);

  if (!active) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <style jsx>{`
        @keyframes nexusFlash { 0% { opacity: 0; } 8% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes nexusFlashWhite { 0% { opacity: 0; } 5% { opacity: 0.22; } 25% { opacity: 0; } }
        @keyframes nexusRing {
          0% { transform: translate(-50%, -50%) scale(0.05); opacity: 0; border-width: 18px; }
          12% { opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(4); opacity: 0; border-width: 1px; }
        }
        @keyframes nexusBurst {
          0% { transform: translate(-50%, -50%) translate(0, 0) scale(0.5); opacity: 0; }
          12% { opacity: 1; }
          100% { transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(0.1); opacity: 0; }
        }
        @keyframes nexusTitleIn {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5) translateY(16px); filter: blur(12px); }
          16% { opacity: 1; transform: translate(-50%, -50%) scale(1.06) translateY(-4px); filter: blur(0); }
          30% { transform: translate(-50%, -50%) scale(1); }
          76% { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.03); filter: blur(4px); }
        }
        @keyframes nexusSubIn {
          0% { opacity: 0; transform: translate(-50%, 0) translateY(16px); }
          22% { opacity: 1; transform: translate(-50%, 0) translateY(0); }
          76% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, 0) translateY(-8px); }
        }
        @keyframes nexusScanline {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 0.9; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes nexusCorner {
          0% { opacity: 0; transform: scale(0.2); }
          15% { opacity: 1; transform: scale(1.1); }
          30% { transform: scale(1); }
          75% { opacity: 0.7; }
          100% { opacity: 0; }
        }
        @keyframes nexusGrid {
          0% { opacity: 0; } 10% { opacity: 0.18; } 60% { opacity: 0.10; } 100% { opacity: 0; }
        }
        @keyframes nexusClock {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.15) rotate(0deg); }
          14% { opacity: 0.55; }
          70% { opacity: 0.28; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(3) rotate(90deg); }
        }
        @keyframes nexusHand {
          0% { opacity: 0; transform: translate(-50%, -100%) rotate(0deg); }
          16% { opacity: 0.85; }
          100% { opacity: 0; transform: translate(-50%, -100%) rotate(460deg); }
        }
        @keyframes nexusGlyph {
          0% { opacity: 0; transform: translate(-50%, 0) translateY(80px) scale(0.5) rotate(var(--rot)); }
          18% { opacity: 0.95; }
          78% { opacity: 0.6; }
          100% { opacity: 0; transform: translate(-50%, 0) translateY(-300px) scale(1.2) rotate(calc(var(--rot) * -1)); }
        }
      `}</style>

      {/* Colour flash */}
      <div className="absolute inset-0" style={{ background: t.flashBg, animation: "nexusFlash 1.1s ease-out forwards" }} />
      {/* White punch flash */}
      <div className="absolute inset-0 bg-white" style={{ animation: "nexusFlashWhite 0.5s ease-out forwards" }} />

      {/* Energy grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${t.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${t.gridColor} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          animation: "nexusGrid 2.2s ease-out forwards",
          mixBlendMode: "screen",
        }}
      />

      {/* Measurelands: golden clock-face bloom + sweeping hand */}
      {isMeasurement && (
        <>
          <div
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: 280,
              height: 280,
              background:
                "repeating-conic-gradient(from 0deg, rgba(200,160,48,0.5) 0deg 1.4deg, transparent 1.4deg 30deg)",
              animation: "nexusClock 2.6s cubic-bezier(0.16,1,0.3,1) forwards",
              mixBlendMode: "screen",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 origin-bottom rounded-full"
            style={{
              width: 4,
              height: 130,
              background: "linear-gradient(to top, rgba(232,200,120,0.95), rgba(200,160,48,0))",
              boxShadow: "0 0 12px rgba(200,160,48,0.8)",
              animation: "nexusHand 2.4s cubic-bezier(0.22,1,0.36,1) forwards",
            }}
          />
        </>
      )}

      {/* Data scanline */}
      <div
        className="absolute inset-x-0 h-48"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, ${t.scanColor} 50%, transparent 100%)`,
          mixBlendMode: "screen",
          animation: "nexusScanline 1.2s ease-in forwards",
        }}
      />

      {/* Shockwave rings */}
      {[0, 0.12, 0.24, 0.38, 0.52].map((d, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: 200,
            height: 200,
            borderStyle: "solid",
            borderColor: i < 2 ? t.ringInner : t.ringOuter,
            boxShadow: t.ringShadow,
            animation: `nexusRing 1.8s cubic-bezier(0.16,1,0.3,1) ${d}s forwards`,
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
              boxShadow: `0 0 ${p.size * 3}px hsl(${p.hue} 95% 62% / 0.95), 0 0 ${p.size * 7}px hsl(${p.hue} 95% 55% / 0.5)`,
              "--dx": `${p.x}px`,
              "--dy": `${p.y}px`,
              animation: `nexusBurst ${p.duration}s cubic-bezier(0.16,1,0.3,1) ${p.delay}s forwards`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Floating measurement glyphs (Measurelands only) */}
      {glyphs.map((g) => (
        <span
          key={g.id}
          className="absolute bottom-[16%]"
          style={
            {
              left: `${g.left}%`,
              fontSize: g.size,
              lineHeight: 1,
              filter: "drop-shadow(0 0 12px rgba(200,160,48,0.7))",
              "--rot": `${g.rot}deg`,
              animation: `nexusGlyph 2.5s ease-out ${g.delay.toFixed(2)}s forwards`,
              opacity: 0,
            } as React.CSSProperties
          }
        >
          {g.char}
        </span>
      ))}

      {/* Corner energy bursts */}
      {[
        { top: "0%", left: "0%", origin: "top left" },
        { top: "0%", right: "0%", origin: "top right" },
        { bottom: "0%", left: "0%", origin: "bottom left" },
        { bottom: "0%", right: "0%", origin: "bottom right" },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            ...pos,
            width: 160,
            height: 160,
            background: t.cornerConic,
            transformOrigin: pos.origin as string,
            animation: `nexusCorner 2.2s cubic-bezier(0.22,1,0.36,1) ${0.08 * i}s forwards`,
            mixBlendMode: "screen",
          }}
        />
      ))}

      {/* Main title lockup */}
      <div className="absolute left-1/2 top-1/2 text-center" style={{ animation: "nexusTitleIn 2.6s cubic-bezier(0.22,1,0.36,1) forwards" }}>
        <div
          className="font-mono font-black uppercase leading-none"
          style={{
            fontSize: "clamp(2.6rem, 7.5vw, 5rem)",
            letterSpacing: "0.15em",
            background: t.titleGradient,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "none",
            filter: t.titleFilter,
          }}
        >
          {t.title}
        </div>
        <div
          className="font-mono font-black uppercase"
          style={{
            fontSize: "clamp(1rem, 2.6vw, 1.7rem)",
            letterSpacing: "0.55em",
            marginTop: "0.15em",
            color: t.engagedColor,
            textShadow: t.engagedShadow,
          }}
        >
          {t.engaged}
        </div>
        <div
          className="mx-auto mt-3 h-[2px] rounded-full"
          style={{
            width: "clamp(160px, 28vw, 320px)",
            background: t.dividerGradient,
            boxShadow: t.dividerShadow,
          }}
        />
        <div
          className="mt-2 font-sans font-extrabold"
          style={{
            fontSize: "clamp(0.8rem, 1.4vw, 1rem)",
            letterSpacing: "0.06em",
            color: t.copyColor,
            textShadow: t.copyShadow,
          }}
        >
          {t.copy}
        </div>
      </div>

      {/* Bottom subtitle */}
      <div
        className="absolute left-1/2 text-center font-mono font-bold uppercase"
        style={{
          bottom: "22%",
          fontSize: "clamp(0.75rem, 1.3vw, 0.95rem)",
          letterSpacing: "0.3em",
          color: t.bottomColor,
          textShadow: t.bottomShadow,
          animation: "nexusSubIn 2.6s ease-out 0.1s forwards",
          opacity: 0,
        }}
      >
        {t.bottomText}
      </div>
    </div>
  );
}
