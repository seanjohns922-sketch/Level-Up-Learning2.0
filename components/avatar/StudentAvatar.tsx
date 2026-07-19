"use client";

import { useEffect, useState } from "react";
import { ACTIVE_STUDENT_KEY } from "@/data/progress";

/**
 * StudentAvatar
 * ----------------------------------------------------
 * Stylised human-child avatar for Level Up Learning.
 * Every visual layer (hair, shirt, pants, shoes, hat,
 * glasses, cape, backpack) is driven by a prop on
 * `AvatarOutfit` so the cosmetic / marketplace system
 * can swap palettes and shapes without touching
 * world-map code.
 *
 * Reference vibe: Disney Dreamlight Valley / Pokemon
 * trainer / Fortnite locker — semi-chibi, friendly,
 * gender-neutral base, readable at small sizes.
 *
 * A marketplace "avatar" item ships a partial AvatarOutfit
 * in its metadata; equipping it merges those fields over
 * the default look. Only the fields an item overrides need
 * to be present.
 */

export type HairStyle =
  | "short"
  | "tuft"
  | "swept"
  | "long"
  | "ponytail"
  | "bun"
  | "buzz"
  | "afro"
  | "curls"
  | "braids"
  | "sidepart"
  | "pigtails"
  | "spiky";
export type HatStyle = "none" | "beanie" | "cap" | "explorer" | "crown" | "wizard";
export type GlassesStyle = "none" | "round" | "shades" | "visor";
export type CapeStyle = "none" | "hero" | "royal";
export type BackpackStyle = "none" | "explorer" | "rocket";
/** Base body silhouette. "neutral" = trousers look, "dress" = flared skirt look. */
export type BodyType = "neutral" | "dress";

export type AvatarOutfit = {
  body?: BodyType;
  skin?: string;
  skinShade?: string;
  hair?: string;
  hairShade?: string;
  hairStyle?: HairStyle;
  shirt?: string;
  shirtTrim?: string;
  pants?: string;
  shoes?: string;
  hat?: HatStyle;
  hatColor?: string;
  glasses?: GlassesStyle;
  glassesColor?: string;
  cape?: CapeStyle;
  capeColor?: string;
  backpack?: BackpackStyle;
  backpackColor?: string;
  /** @deprecated retained for older saved outfits — dedicated fields above supersede it. */
  accessory?: "none" | "backpack" | "glasses";
};

export const DEFAULT_OUTFIT: Required<AvatarOutfit> = {
  body: "neutral",
  skin: "#f1c8a6",
  skinShade: "#d6a07a",
  hair: "#4a2e1c",
  hairShade: "#2e1a0e",
  hairStyle: "swept",
  shirt: "#1d4ed8",
  shirtTrim: "#93c5fd",
  pants: "#111827",
  shoes: "#f8fafc",
  hat: "none",
  hatColor: "#ef4444",
  glasses: "none",
  glassesColor: "#1f2937",
  cape: "none",
  capeColor: "#7c3aed",
  backpack: "none",
  backpackColor: "#f59e0b",
  accessory: "none",
};

function readOutfitFromStorage(): AvatarOutfit {
  if (typeof window === "undefined") return {};
  try {
    const studentId = localStorage.getItem(ACTIVE_STUDENT_KEY)?.trim();
    if (!studentId) return {};
    const raw = localStorage.getItem(`lul:${studentId}:avatar_outfit_v1`);
    if (raw) return JSON.parse(raw) as AvatarOutfit;
  } catch {
    /* ignore */
  }
  return {};
}

type Outfit = Required<AvatarOutfit>;

// ── Behind-body layers (drawn first, occluded by the torso) ────────────────
function CapeLayer({ o }: { o: Outfit }) {
  if (o.cape === "none") return null;
  return (
    <g data-layer="cape">
      <path d="M40 94 Q60 88 80 94 L96 190 Q60 202 24 190 Z" fill={o.capeColor} />
      <path d="M40 94 Q60 88 80 94 L82 114 Q60 122 38 114 Z" fill="#000" opacity="0.16" />
      {o.cape === "royal" ? (
        <>
          <path d="M24 190 Q60 202 96 190" stroke="#fde68a" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="50" cy="98" r="2.4" fill="#fde68a" />
          <circle cx="70" cy="98" r="2.4" fill="#fde68a" />
        </>
      ) : (
        <path d="M46 96 Q60 92 74 96" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="2" fill="none" />
      )}
    </g>
  );
}

function BackpackPack({ o }: { o: Outfit }) {
  if (o.backpack === "none") return null;
  return (
    <g data-layer="backpack-pack">
      <rect x="38" y="94" width="44" height="58" rx="12" fill={o.backpackColor} />
      <rect x="38" y="94" width="44" height="20" rx="10" fill="#000" opacity="0.14" />
      {o.backpack === "rocket" ? (
        <path d="M60 152 L53 170 Q60 165 67 170 Z" fill="#f97316" opacity="0.9" />
      ) : (
        <rect x="46" y="120" width="28" height="16" rx="4" fill="#000" opacity="0.16" />
      )}
    </g>
  );
}

// ── Lower body: trousers (neutral) or leggings + flared skirt (dress) ──────
function LowerBody({ o }: { o: Outfit }) {
  if (o.body === "dress") {
    return (
      <g data-layer="pants">
        {/* Leggings beneath the skirt */}
        <path d="M45 178 L41 200 L53 200 L53 178 Z" fill="url(#lul-pants)" />
        <path d="M75 178 L79 200 L67 200 L67 178 Z" fill="url(#lul-pants)" />
      </g>
    );
  }
  return (
    <g data-layer="pants">
      <path d="M40 150 L34 200 L56 200 L58 168 Z" fill="url(#lul-pants)" />
      <path d="M80 150 L86 200 L64 200 L62 168 Z" fill="url(#lul-pants)" />
      {/* waistband */}
      <path d="M38 148 Q60 154 82 148 L82 158 Q60 164 38 158 Z" fill="#000" opacity="0.35" />
      {/* center seam */}
      <line x1="60" y1="158" x2="60" y2="200" stroke="#000" strokeOpacity="0.25" strokeWidth="1" />
    </g>
  );
}

// Flared skirt, drawn over the hoodie hem so the dress reads as one piece.
function SkirtLayer({ o }: { o: Outfit }) {
  if (o.body !== "dress") return null;
  return (
    <g data-layer="skirt">
      <path d="M36 148 Q60 156 84 148 L94 184 Q60 196 26 184 Z" fill="url(#lul-shirt)" />
      {/* pleat shading */}
      <line x1="52" y1="154" x2="45" y2="188" stroke="#000" strokeOpacity="0.12" strokeWidth="1.4" />
      <line x1="60" y1="156" x2="60" y2="190" stroke="#000" strokeOpacity="0.12" strokeWidth="1.4" />
      <line x1="68" y1="154" x2="75" y2="188" stroke="#000" strokeOpacity="0.12" strokeWidth="1.4" />
      {/* hem trim */}
      <path d="M26 184 Q60 196 94 184" stroke={o.shirtTrim} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </g>
  );
}

// ── Front layers (drawn after head + hair) ─────────────────────────────────
function BackpackStraps({ o }: { o: Outfit }) {
  if (o.backpack === "none") return null;
  return (
    <g data-layer="backpack-straps">
      <path d="M45 100 L49 152" stroke={o.backpackColor} strokeWidth="6" strokeLinecap="round" />
      <path d="M75 100 L71 152" stroke={o.backpackColor} strokeWidth="6" strokeLinecap="round" />
      <rect x="46" y="126" width="6" height="5" rx="1.5" fill="#000" opacity="0.3" />
      <rect x="68" y="126" width="6" height="5" rx="1.5" fill="#000" opacity="0.3" />
    </g>
  );
}

function HairLayer({ o }: { o: Outfit }) {
  const swept = (
    <path
      d="M30 44 Q28 16 60 14 Q92 16 90 44 Q86 36 80 34 Q72 28 60 30 Q48 28 40 34 Q34 36 30 44 Z"
      fill="url(#lul-hair)"
    />
  );
  const short = (
    <>
      <path
        d="M30 54 Q28 20 60 16 Q92 20 90 54 Q86 42 80 40 Q76 34 68 34 Q60 30 52 36 Q44 34 40 40 Q34 42 30 54 Z"
        fill="url(#lul-hair)"
      />
      <path d="M40 44 Q50 50 62 46 Q72 50 82 44 Q80 54 70 54 Q60 56 50 54 Q42 54 40 44 Z" fill={o.hairShade} />
    </>
  );
  switch (o.hairStyle) {
    case "tuft":
      return (
        <g data-layer="hair">
          <path
            d="M32 50 Q34 18 60 18 Q86 18 88 50 Q80 38 70 40 Q66 30 60 32 Q54 30 50 40 Q40 38 32 50 Z"
            fill="url(#lul-hair)"
          />
          <path d="M58 20 Q62 10 68 20 Q64 16 58 20 Z" fill="url(#lul-hair)" />
        </g>
      );
    case "short":
      return <g data-layer="hair">{short}</g>;
    case "buzz":
      return (
        <g data-layer="hair">
          <path
            d="M32 48 Q30 22 60 20 Q90 22 88 48 Q80 40 60 40 Q40 40 32 48 Z"
            fill="url(#lul-hair)"
            opacity="0.9"
          />
        </g>
      );
    case "long":
      return (
        <g data-layer="hair">
          {/* side lengths falling to the shoulders (behind the sweep) */}
          <path d="M30 42 Q24 72 30 96 Q37 98 41 92 Q36 66 40 46 Z" fill="url(#lul-hair)" />
          <path d="M90 42 Q96 72 90 96 Q83 98 79 92 Q84 66 80 46 Z" fill="url(#lul-hair)" />
          {swept}
        </g>
      );
    case "ponytail":
      return (
        <g data-layer="hair">
          <path d="M86 30 Q104 36 100 58 Q96 74 86 68 Q92 50 82 42 Z" fill="url(#lul-hair)" />
          <circle cx="86" cy="31" r="3" fill={o.hairShade} />
          {short}
        </g>
      );
    case "bun":
      return (
        <g data-layer="hair">
          {swept}
          <circle cx="60" cy="11" r="8" fill="url(#lul-hair)" />
          <circle cx="60" cy="11" r="8" fill="#000" opacity="0.1" />
          <path d="M53 8 Q60 4 67 8" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1.2" fill="none" />
        </g>
      );
    case "afro":
      return (
        <g data-layer="hair">
          <path
            d="M28 46 Q22 10 60 8 Q98 10 92 46 Q92 60 82 64 Q88 44 78 38 Q84 28 60 26 Q36 28 42 38 Q32 44 38 64 Q28 60 28 46 Z"
            fill="url(#lul-hair)"
          />
          <circle cx="40" cy="20" r="3" fill={o.hairShade} opacity="0.35" />
          <circle cx="60" cy="13" r="3" fill={o.hairShade} opacity="0.35" />
          <circle cx="80" cy="20" r="3" fill={o.hairShade} opacity="0.35" />
          <circle cx="31" cy="38" r="2.6" fill={o.hairShade} opacity="0.3" />
          <circle cx="89" cy="38" r="2.6" fill={o.hairShade} opacity="0.3" />
        </g>
      );
    case "curls":
      return (
        <g data-layer="hair">
          <path
            d="M30 50 Q28 18 60 16 Q92 18 90 50 Q86 44 82 44 Q84 34 76 34 Q78 26 68 30 Q70 22 60 26 Q50 22 52 30 Q44 26 44 34 Q36 34 38 44 Q34 44 30 50 Z"
            fill="url(#lul-hair)"
          />
          <circle cx="42" cy="26" r="3.4" fill="#ffffff" opacity="0.08" />
          <circle cx="60" cy="22" r="3.4" fill="#ffffff" opacity="0.08" />
          <circle cx="78" cy="26" r="3.4" fill="#ffffff" opacity="0.08" />
        </g>
      );
    case "braids":
      return (
        <g data-layer="hair">
          <path d="M30 44 Q26 74 30 100 L40 100 Q40 72 40 46 Z" fill="url(#lul-hair)" />
          <path d="M90 44 Q94 74 90 100 L80 100 Q80 72 80 46 Z" fill="url(#lul-hair)" />
          <line x1="30" y1="58" x2="40" y2="58" stroke={o.hairShade} strokeWidth="1.4" />
          <line x1="30" y1="70" x2="40" y2="70" stroke={o.hairShade} strokeWidth="1.4" />
          <line x1="30" y1="82" x2="40" y2="82" stroke={o.hairShade} strokeWidth="1.4" />
          <line x1="30" y1="94" x2="40" y2="94" stroke={o.hairShade} strokeWidth="1.4" />
          <line x1="80" y1="58" x2="90" y2="58" stroke={o.hairShade} strokeWidth="1.4" />
          <line x1="80" y1="70" x2="90" y2="70" stroke={o.hairShade} strokeWidth="1.4" />
          <line x1="80" y1="82" x2="90" y2="82" stroke={o.hairShade} strokeWidth="1.4" />
          <line x1="80" y1="94" x2="90" y2="94" stroke={o.hairShade} strokeWidth="1.4" />
          <path
            d="M30 44 Q28 16 60 14 Q92 16 90 44 Q84 34 74 34 Q66 26 60 28 Q54 26 46 34 Q36 34 30 44 Z"
            fill="url(#lul-hair)"
          />
        </g>
      );
    case "sidepart":
      return (
        <g data-layer="hair">
          <path
            d="M30 46 Q28 16 60 14 Q92 16 90 46 Q86 34 70 32 Q66 22 48 28 Q40 30 34 40 Q32 42 30 46 Z"
            fill="url(#lul-hair)"
          />
          <path d="M52 20 Q66 25 84 30" stroke={o.hairShade} strokeWidth="1.2" fill="none" opacity="0.7" />
        </g>
      );
    case "pigtails":
      return (
        <g data-layer="hair">
          <circle cx="28" cy="46" r="9" fill="url(#lul-hair)" />
          <circle cx="92" cy="46" r="9" fill="url(#lul-hair)" />
          <path
            d="M30 54 Q28 20 60 16 Q92 20 90 54 Q86 42 80 40 Q76 34 68 34 Q60 30 52 36 Q44 34 40 40 Q34 42 30 54 Z"
            fill="url(#lul-hair)"
          />
          <path d="M40 44 Q50 50 62 46 Q72 50 82 44 Q80 54 70 54 Q60 56 50 54 Q42 54 40 44 Z" fill={o.hairShade} />
        </g>
      );
    case "spiky":
      return (
        <g data-layer="hair">
          <path
            d="M30 48 Q30 22 60 20 Q90 22 90 48 Q84 40 78 42 L82 28 L72 40 L74 24 L64 38 L62 22 L54 38 L50 26 L48 40 L40 28 L42 42 Q36 40 30 48 Z"
            fill="url(#lul-hair)"
          />
        </g>
      );
    default:
      return (
        <g data-layer="hair">
          {swept}
          <path d="M40 28 Q60 22 80 28" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1.2" fill="none" />
        </g>
      );
  }
}

function HatLayer({ o }: { o: Outfit }) {
  switch (o.hat) {
    case "beanie":
      return (
        <g data-layer="hat">
          <path d="M28 40 Q28 10 60 10 Q92 10 92 40 Q60 30 28 40 Z" fill={o.hatColor} />
          <rect x="27" y="36" width="66" height="9" rx="4.5" fill={o.hatColor} />
          <rect x="27" y="36" width="66" height="9" rx="4.5" fill="#ffffff" opacity="0.12" />
          <circle cx="60" cy="9" r="4" fill="#ffffff" opacity="0.85" />
        </g>
      );
    case "cap":
      return (
        <g data-layer="hat">
          <path d="M30 36 Q32 12 60 12 Q88 12 90 36 Q60 26 30 36 Z" fill={o.hatColor} />
          <path d="M58 34 Q88 32 102 40 Q88 45 58 41 Z" fill={o.hatColor} />
          <path d="M58 34 Q88 32 102 40 Q88 45 58 41 Z" fill="#000" opacity="0.14" />
          <path d="M40 30 Q60 24 80 30" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.4" fill="none" />
        </g>
      );
    case "explorer":
      return (
        <g data-layer="hat">
          <ellipse cx="60" cy="37" rx="37" ry="7.5" fill={o.hatColor} />
          <path d="M40 37 Q40 15 60 15 Q80 15 80 37 Z" fill={o.hatColor} />
          <rect x="40" y="30" width="40" height="5" rx="2" fill="#000" opacity="0.28" />
          <ellipse cx="60" cy="37" rx="37" ry="7.5" fill="none" stroke="#000" strokeOpacity="0.12" strokeWidth="1" />
        </g>
      );
    case "crown":
      return (
        <g data-layer="hat">
          <path d="M36 32 L42 13 L51 26 L60 11 L69 26 L78 13 L84 32 Z" fill="#fcd34d" />
          <rect x="36" y="30" width="48" height="6" rx="2" fill="#f59e0b" />
          <circle cx="60" cy="19" r="2.2" fill="#ef4444" />
          <circle cx="46" cy="23" r="1.6" fill="#38bdf8" />
          <circle cx="74" cy="23" r="1.6" fill="#38bdf8" />
        </g>
      );
    case "wizard":
      return (
        <g data-layer="hat">
          <path d="M60 1 L43 34 Q60 40 77 34 Z" fill={o.hatColor} />
          <path d="M41 33 Q60 40 79 33 L81 39 Q60 46 39 39 Z" fill={o.hatColor} />
          <path d="M60 15 L62 21 L68 23 L62 25 L60 31 L58 25 L52 23 L58 21 Z" fill="#fde68a" />
        </g>
      );
    default:
      return null;
  }
}

function GlassesLayer({ o }: { o: Outfit }) {
  switch (o.glasses) {
    case "round":
      return (
        <g data-layer="glasses" stroke={o.glassesColor} strokeWidth="1.6" fill="none">
          <circle cx="49" cy="60" r="5.5" />
          <circle cx="71" cy="60" r="5.5" />
          <line x1="54.5" y1="60" x2="65.5" y2="60" />
          <line x1="43.5" y1="59" x2="34" y2="57" strokeLinecap="round" />
          <line x1="76.5" y1="59" x2="86" y2="57" strokeLinecap="round" />
        </g>
      );
    case "shades":
      return (
        <g data-layer="glasses">
          <path d="M42 56 h14 q3 0 3 3 v3 q0 3 -3 3 h-10 q-3 0 -4 -2 l-2 -4 q-1 -3 2 -3 Z" fill={o.glassesColor} />
          <path d="M78 56 h-14 q-3 0 -3 3 v3 q0 3 3 3 h10 q3 0 4 -2 l2 -4 q1 -3 -2 -3 Z" fill={o.glassesColor} />
          <line x1="56" y1="58" x2="64" y2="58" stroke={o.glassesColor} strokeWidth="2" />
          <line x1="42" y1="57" x2="34" y2="55" stroke={o.glassesColor} strokeWidth="1.6" strokeLinecap="round" />
          <line x1="78" y1="57" x2="86" y2="55" stroke={o.glassesColor} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M45 59 Q49 58 53 59" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1" fill="none" />
        </g>
      );
    case "visor":
      return (
        <g data-layer="glasses">
          <path d="M39 56 Q60 51 81 56 L81 62 Q60 67 39 62 Z" fill={o.glassesColor} opacity="0.88" />
          <path d="M44 58 Q60 55 76 58" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.4" fill="none" />
        </g>
      );
    default:
      return null;
  }
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
    // localStorage is only readable after mount (avoids SSR hydration mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      className="lul-student-avatar"
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

        {/* ── BEHIND-BODY cosmetic layers ──────────────── */}
        <CapeLayer o={o} />
        <BackpackPack o={o} />

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

        {/* ── LOWER BODY (trousers or leggings) ────────── */}
        <LowerBody o={o} />

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

        {/* Skirt sits over the hoodie hem so a dress reads as one piece */}
        <SkirtLayer o={o} />

        {/* Backpack straps sit over the hoodie */}
        <BackpackStraps o={o} />

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
          <path d="M45 53 Q49 51 53 53" stroke={o.hairShade} strokeWidth="1.4" strokeLinecap="round" fill="none" />
          <path d="M67 53 Q71 51 75 53" stroke={o.hairShade} strokeWidth="1.4" strokeLinecap="round" fill="none" />

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

        {/* ── HAIR + HEADWEAR + EYEWEAR ────────────────── */}
        <HairLayer o={o} />
        <HatLayer o={o} />
        <GlassesLayer o={o} />
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
        @media (prefers-reduced-motion: reduce) {
          .lul-student-avatar { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
