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
          <linearGradient id="lul-pants" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={o.pants} />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="lul-shoe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor={o.shoes} />
          </linearGradient>
        </defs>

        {/* ── SHOES layer (chunky sneakers) ────────────── */}
        <g data-layer="shoes">
          <path d="M30 206 Q30 198 42 198 L58 198 Q60 204 60 210 Q60 214 56 214 L32 214 Q28 214 28 210 Z" fill="url(#lul-shoe)" />
          <path d="M90 206 Q90 198 78 198 L62 198 Q60 204 60 210 Q60 214 64 214 L88 214 Q92 214 92 210 Z" fill="url(#lul-shoe)" />
          {/* sole */}
          <rect x="28" y="210" width="32" height="4" rx="2" fill={o.shirt} opacity="0.85" />
          <rect x="60" y="210" width="32" height="4" rx="2" fill={o.shirt} opacity="0.85" />
          {/* swoosh accent */}
          <path d="M34 205 Q44 202 56 205" stroke={o.shirt} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7" />
          <path d="M64 205 Q76 202 86 205" stroke={o.shirt} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7" />
        </g>

        {/* ── PANTS layer (slim joggers) ───────────────── */}
        <g data-layer="pants">
          <path d="M40 150 L34 200 L56 200 L58 168 Z" fill="url(#lul-pants)" />
          <path d="M80 150 L86 200 L64 200 L62 168 Z" fill="url(#lul-pants)" />
          {/* waistband */}
          <path d="M38 148 Q60 154 82 148 L82 158 Q60 164 38 158 Z" fill="#000" opacity="0.35" />
          {/* center seam */}
          <line x1="60" y1="158" x2="60" y2="200" stroke="#000" strokeOpacity="0.25" strokeWidth="1" />
        </g>

        {/* ── HOODIE layer (torso + arms + hood) ────── */}
        <g data-layer="shirt">
          {/* Arms */}
          <path d="M22 100 Q14 112 18 150 Q24 158 32 154 Q34 128 34 108 Z" fill="url(#lul-shirt)" />
          <path d="M98 100 Q106 112 102 150 Q96 158 88 154 Q86 128 86 108 Z" fill="url(#lul-shirt)" />
          {/* Hands */}
          <circle cx="24" cy="156" r="7.5" fill="url(#lul-skin)" />
          <circle cx="96" cy="156" r="7.5" fill="url(#lul-skin)" />
          {/* Torso (hoodie body) */}
          <path
            d="M32 100 Q60 92 88 100 L94 156 Q60 168 26 156 Z"
            fill="url(#lul-shirt)"
          />
          {/* Hood back (behind neck) */}
          <path
            d="M34 100 Q40 82 60 80 Q80 82 86 100 Q72 92 60 92 Q48 92 34 100 Z"
            fill={o.shirt}
            opacity="0.95"
          />
          {/* Kangaroo pocket */}
          <path d="M42 128 L78 128 Q80 142 60 144 Q40 142 42 128 Z" fill="#000" opacity="0.18" />
          {/* Drawstrings */}
          <line x1="54" y1="100" x2="52" y2="118" stroke={o.shirtTrim} strokeWidth="1.4" strokeLinecap="round" />
          <line x1="66" y1="100" x2="68" y2="118" stroke={o.shirtTrim} strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="52" cy="119" r="1.4" fill={o.shirtTrim} />
          <circle cx="68" cy="119" r="1.4" fill={o.shirtTrim} />
          {/* Side highlight */}
          <path d="M32 108 Q34 138 30 156" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="3" fill="none" />
        </g>

        {/* ── NECK + HEAD ──────────────────────────────── */}
        <g data-layer="head">
          <rect x="54" y="82" width="12" height="10" rx="4" fill={o.skinShade} />
          {/* Head — softly rounded */}
          <path
            d="M32 50 Q32 18 60 18 Q88 18 88 50 L88 62 Q88 86 60 90 Q32 86 32 62 Z"
            fill="url(#lul-skin)"
          />
          {/* Ears */}
          <ellipse cx="32" cy="58" rx="4" ry="6" fill="url(#lul-skin)" />
          <ellipse cx="88" cy="58" rx="4" ry="6" fill="url(#lul-skin)" />
          <ellipse cx="32" cy="59" rx="1.6" ry="3" fill={o.skinShade} opacity="0.6" />
          <ellipse cx="88" cy="59" rx="1.6" ry="3" fill={o.skinShade} opacity="0.6" />

          {/* Cheeks */}
          <ellipse cx="44" cy="68" rx="4.5" ry="2.6" fill="#f4a8a8" opacity="0.55" />
          <ellipse cx="76" cy="68" rx="4.5" ry="2.6" fill="#f4a8a8" opacity="0.55" />

          {/* Eyebrows — SEPARATE, not a monobrow */}
          <path d="M44 50 Q49 47 54 50" stroke={o.hairShade} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M66 50 Q71 47 76 50" stroke={o.hairShade} strokeWidth="2.2" strokeLinecap="round" fill="none" />

          {/* Eyes — larger, glossy */}
          <ellipse cx="49" cy="60" rx="3.6" ry="4.6" fill="#ffffff" />
          <ellipse cx="71" cy="60" rx="3.6" ry="4.6" fill="#ffffff" />
          <ellipse cx="49" cy="61" rx="2.4" ry="3.2" fill="#2c1810" />
          <ellipse cx="71" cy="61" rx="2.4" ry="3.2" fill="#2c1810" />
          <circle cx="50" cy="59.5" r="1.1" fill="#ffffff" />
          <circle cx="72" cy="59.5" r="1.1" fill="#ffffff" />
          <circle cx="48.2" cy="62.4" r="0.5" fill="#ffffff" opacity="0.8" />
          <circle cx="70.2" cy="62.4" r="0.5" fill="#ffffff" opacity="0.8" />

          {/* Nose hint */}
          <path d="M60 64 Q61 68 60 70" stroke={o.skinShade} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />

          {/* Friendly smile */}
          <path d="M52 74 Q60 80 68 74" stroke="#3d2613" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M54 75 Q60 78 66 75" stroke="#f4a8a8" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
        </g>

        {/* ── HAIR layer (modern silhouettes) ─────────── */}
        <g data-layer="hair">
          {o.hairStyle === "tuft" ? (
            <>
              <path
                d="M32 50 Q34 18 60 18 Q86 18 88 50 Q80 38 70 40 Q66 30 60 32 Q54 30 50 40 Q40 38 32 50 Z"
                fill="url(#lul-hair)"
              />
              <path d="M58 20 Q62 10 68 20 Q64 16 58 20 Z" fill="url(#lul-hair)" />
            </>
          ) : o.hairStyle === "short" ? (
            <>
              <path
                d="M30 54 Q28 20 60 16 Q92 20 90 54 Q86 42 80 40 Q76 34 68 34 Q60 30 52 36 Q44 34 40 40 Q34 42 30 54 Z"
                fill="url(#lul-hair)"
              />
              <path d="M40 44 Q50 50 62 46 Q72 50 82 44 Q80 54 70 54 Q60 56 50 54 Q42 54 40 44 Z" fill={o.hairShade} />
            </>
          ) : (
            <>
              {/* Swept/modern Roblox-style fringe */}
              <path
                d="M30 52 Q28 18 60 16 Q92 18 90 52 Q86 38 82 36 Q76 30 68 32 Q58 26 48 34 Q40 36 36 44 Q32 46 30 52 Z"
                fill="url(#lul-hair)"
              />
              {/* Side-swept fringe over forehead */}
              <path
                d="M36 40 Q46 36 60 38 Q74 36 86 42 Q82 52 70 50 Q60 48 50 52 Q42 52 36 40 Z"
                fill={o.hairShade}
              />
              {/* Sweep accent */}
              <path d="M44 42 Q58 38 78 44" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1.4" fill="none" />
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