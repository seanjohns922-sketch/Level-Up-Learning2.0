"use client";

import { useEffect, useState } from "react";

/**
 * StudentAvatar
 * ----------------------------------------------------
 * Stylised human-child avatar for Level Up Learning.
 * Designed for the long-term customization system —
 * every visual layer (hair, shirt, pants, shoes,
 * accessory) is driven by a prop on `AvatarOutfit`
 * so future cosmetic systems can swap palettes /
 * shapes without touching world-map code.
 *
 * Reference vibe: Disney Dreamlight Valley / Pokemon
 * trainer / Fortnite locker — semi-chibi, friendly,
 * gender-neutral, readable at small sizes.
 *
 * Customization is NOT implemented yet. This component
 * only ships the default look + the structural hooks.
 */

export type AvatarOutfit = {
  skin?: string;
  skinShade?: string;
  hair?: string;
  hairShade?: string;
  hairStyle?: "short" | "tuft" | "swept"; // future: "long" | "bun" | "cap" ...
  shirt?: string;
  shirtTrim?: string;
  pants?: string;
  shoes?: string;
  accessory?: "none" | "backpack" | "glasses"; // future: ...
};

export const DEFAULT_OUTFIT: Required<AvatarOutfit> = {
  skin: "#e8b48a",
  skinShade: "#c98c63",
  hair: "#3a2418",
  hairShade: "#1f1209",
  hairStyle: "swept",
  shirt: "#1d4ed8",
  shirtTrim: "#93c5fd",
  pants: "#111827",
  shoes: "#f8fafc",
  accessory: "none",
};

function readOutfitFromStorage(): AvatarOutfit {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("lul_avatar_outfit_v1");
    if (raw) return JSON.parse(raw) as AvatarOutfit;
  } catch {
    /* ignore */
  }
  return {};
}

type StudentAvatarProps = {
  height?: number;
  outfit?: AvatarOutfit;
  glowColor?: string;
  floatAnimation?: string; // CSS animation name (e.g. "char-float 4.5s ease-in-out infinite")
};

export default function StudentAvatar({
  height = 196,
  outfit,
  glowColor = "rgba(255,255,255,0.18)",
  floatAnimation = "lul-avatar-float 4.6s ease-in-out infinite",
}: StudentAvatarProps) {
  // Pull saved outfit on mount (avoids SSR hydration mismatch).
  const [stored, setStored] = useState<AvatarOutfit>({});
  useEffect(() => {
    setStored(readOutfitFromStorage());
  }, []);

  const o: Required<AvatarOutfit> = {
    ...DEFAULT_OUTFIT,
    ...stored,
    ...(outfit ?? {}),
  };

  // Source viewBox is 120 × 220 — keep aspect when scaling by height.
  const width = Math.round((height * 120) / 220);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        animation: floatAnimation,
        filter: `drop-shadow(0 0 14px ${glowColor}) drop-shadow(0 10px 18px rgba(0,0,0,0.55))`,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 120 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <linearGradient id="lul-skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={o.skin} />
            <stop offset="100%" stopColor={o.skinShade} />
          </linearGradient>
          <linearGradient id="lul-shirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={o.shirt} />
            <stop offset="100%" stopColor={o.shirt} stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="lul-hair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={o.hair} />
            <stop offset="100%" stopColor={o.hairShade} />
          </linearGradient>
        </defs>

        {/* ── SHOES layer ──────────────────────────────── */}
        <g data-layer="shoes">
          <ellipse cx="44" cy="208" rx="14" ry="6" fill={o.shoes} />
          <ellipse cx="76" cy="208" rx="14" ry="6" fill={o.shoes} />
          <path d="M32 204 Q44 196 58 204 L58 210 Q44 214 32 210 Z" fill={o.shoes} />
          <path d="M62 204 Q76 196 88 204 L88 210 Q76 214 62 210 Z" fill={o.shoes} />
          <rect x="32" y="201" width="26" height="3" rx="1.5" fill={o.shirtTrim} opacity="0.6" />
          <rect x="62" y="201" width="26" height="3" rx="1.5" fill={o.shirtTrim} opacity="0.6" />
        </g>

        {/* ── PANTS layer ──────────────────────────────── */}
        <g data-layer="pants">
          <path d="M40 146 L36 204 L54 204 L58 168 Z" fill={o.pants} />
          <path d="M80 146 L84 204 L66 204 L62 168 Z" fill={o.pants} />
          <path d="M40 146 Q60 152 80 146 L80 162 Q60 168 40 162 Z" fill={o.pants} opacity="0.85" />
        </g>

        {/* ── SHIRT layer (torso + arms) ──────────────── */}
        <g data-layer="shirt">
          {/* Arms */}
          <path d="M20 96 Q14 104 16 144 Q22 152 30 148 Q32 124 32 104 Z" fill="url(#lul-shirt)" />
          <path d="M100 96 Q106 104 104 144 Q98 152 90 148 Q88 124 88 104 Z" fill="url(#lul-shirt)" />
          {/* Hands */}
          <circle cx="22" cy="150" r="7" fill="url(#lul-skin)" />
          <circle cx="98" cy="150" r="7" fill="url(#lul-skin)" />
          {/* Torso */}
          <path
            d="M32 96 Q60 88 88 96 L92 152 Q60 162 28 152 Z"
            fill="url(#lul-shirt)"
          />
          {/* Collar / trim */}
          <path
            d="M44 92 Q60 102 76 92 L72 102 Q60 108 48 102 Z"
            fill={o.shirtTrim}
            opacity="0.9"
          />
          {/* Subtle highlight */}
          <path d="M36 100 Q40 130 38 150" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="3" fill="none" />
        </g>

        {/* ── NECK + HEAD ──────────────────────────────── */}
        <g data-layer="head">
          <rect x="52" y="80" width="16" height="14" rx="5" fill="url(#lul-skin)" />
          {/* Head */}
          <path
            d="M34 52 Q34 22 60 22 Q86 22 86 52 L86 64 Q86 86 60 88 Q34 86 34 64 Z"
            fill="url(#lul-skin)"
          />
          {/* Ears */}
          <ellipse cx="34" cy="60" rx="4" ry="6" fill="url(#lul-skin)" />
          <ellipse cx="86" cy="60" rx="4" ry="6" fill="url(#lul-skin)" />

          {/* Cheeks */}
          <ellipse cx="44" cy="66" rx="4" ry="2.5" fill="#f0a0a0" opacity="0.55" />
          <ellipse cx="76" cy="66" rx="4" ry="2.5" fill="#f0a0a0" opacity="0.55" />

          {/* Eyes */}
          <ellipse cx="49" cy="58" rx="3" ry="4" fill="#1a1a2e" />
          <ellipse cx="71" cy="58" rx="3" ry="4" fill="#1a1a2e" />
          <circle cx="50" cy="56.5" r="1" fill="#ffffff" />
          <circle cx="72" cy="56.5" r="1" fill="#ffffff" />

          {/* Smile */}
          <path d="M54 70 Q60 74 66 70" stroke="#3d2613" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </g>

        {/* ── HAIR layer ───────────────────────────────── */}
        <g data-layer="hair">
          {o.hairStyle === "tuft" ? (
            <>
              <path
                d="M32 50 Q34 18 60 18 Q86 18 88 50 Q80 38 70 40 Q66 30 60 32 Q54 30 50 40 Q40 38 32 50 Z"
                fill="url(#lul-hair)"
              />
              <path d="M58 20 Q62 12 68 20 Q64 18 58 20 Z" fill="url(#lul-hair)" />
            </>
          ) : (
            <>
              {/* Short brown hair — covers crown + side fringe */}
              <path
                d="M32 54 Q30 22 60 18 Q90 22 88 54 Q86 44 80 42 Q76 36 68 36 Q60 32 52 38 Q44 36 40 42 Q34 44 32 54 Z"
                fill="url(#lul-hair)"
              />
              {/* Front fringe */}
              <path
                d="M40 44 Q50 50 62 46 Q72 50 82 44 Q80 54 70 54 Q60 56 50 54 Q42 54 40 44 Z"
                fill={o.hairShade}
              />
            </>
          )}
        </g>

        {/* ── ACCESSORY layer (reserved) ───────────────── */}
        <g data-layer="accessory" />
      </svg>

      {/* Ground glow */}
      <div
        style={{
          position: "absolute",
          bottom: -10,
          left: "50%",
          transform: "translateX(-50%)",
          width: width * 1.1,
          height: 22,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${glowColor} 0%, transparent 70%)`,
          filter: "blur(6px)",
          pointerEvents: "none",
        }}
      />

      <style>{`
        @keyframes lul-avatar-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}