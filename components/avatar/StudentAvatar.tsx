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
  | "bob"
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

// Hoodie (neutral / boy body) — torso, arms, hood, kangaroo pocket.
function HoodieTorso({ o }: { o: Outfit }) {
  return (
    <g data-layer="shirt">
      {/* Arms */}
      <path d="M22 100 Q14 112 18 150 Q24 158 32 154 Q34 128 34 108 Z" fill="url(#lul-shirt)" />
      <path d="M98 100 Q106 112 102 150 Q96 158 88 154 Q86 128 86 108 Z" fill="url(#lul-shirt)" />
      {/* Hands */}
      <circle cx="24" cy="156" r="7.5" fill="url(#lul-skin)" />
      <circle cx="96" cy="156" r="7.5" fill="url(#lul-skin)" />
      {/* Torso (hoodie body) */}
      <path d="M32 100 Q60 92 88 100 L94 156 Q60 168 26 156 Z" fill="url(#lul-shirt)" />
      {/* Hood back */}
      <path d="M34 100 Q40 82 60 80 Q80 82 86 100 Q72 92 60 92 Q48 92 34 100 Z" fill={o.shirt} opacity="0.95" />
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
  );
}

// Dress (girl body) — fitted bodice, puff sleeves, collar, sash and flared
// skirt in one piece. Deliberately its own shape, not the hoodie plus a skirt.
function DressTorso({ o }: { o: Outfit }) {
  return (
    <g data-layer="dress">
      {/* Sleeves (dress colour) */}
      <path d="M24 102 Q16 114 20 150 Q26 158 33 154 Q35 128 35 110 Z" fill="url(#lul-shirt)" />
      <path d="M96 102 Q104 114 100 150 Q94 158 87 154 Q85 128 85 110 Z" fill="url(#lul-shirt)" />
      {/* Hands */}
      <circle cx="26" cy="156" r="7.5" fill="url(#lul-skin)" />
      <circle cx="94" cy="156" r="7.5" fill="url(#lul-skin)" />
      {/* Puff sleeve caps at the shoulders */}
      <ellipse cx="33" cy="105" rx="9.5" ry="8.5" fill="url(#lul-shirt)" />
      <ellipse cx="87" cy="105" rx="9.5" ry="8.5" fill="url(#lul-shirt)" />
      <ellipse cx="33" cy="104" rx="9.5" ry="8.5" fill="#ffffff" opacity="0.08" />
      <ellipse cx="87" cy="104" rx="9.5" ry="8.5" fill="#ffffff" opacity="0.08" />
      {/* Fitted bodice */}
      <path d="M34 100 Q60 94 86 100 L82 150 Q60 156 38 150 Z" fill="url(#lul-shirt)" />
      {/* Neckline collar */}
      <path d="M49 99 Q60 111 71 99 Q66 104 60 104 Q54 104 49 99 Z" fill={o.shirtTrim} />
      {/* Waist sash */}
      <path d="M38 145 Q60 151 82 145 L82 152 Q60 158 38 152 Z" fill={o.shirtTrim} opacity="0.95" />
      {/* Flared skirt */}
      <path d="M37 150 Q60 157 83 150 L94 187 Q60 198 26 187 Z" fill="url(#lul-shirt)" />
      {/* Pleat shading */}
      <line x1="50" y1="156" x2="43" y2="184" stroke="#000" strokeOpacity="0.10" strokeWidth="1.4" />
      <line x1="60" y1="158" x2="60" y2="185" stroke="#000" strokeOpacity="0.10" strokeWidth="1.4" />
      <line x1="70" y1="156" x2="77" y2="184" stroke="#000" strokeOpacity="0.10" strokeWidth="1.4" />
      {/* Hem trim */}
      <path d="M26 187 Q60 198 94 187" stroke={o.shirtTrim} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Side highlight */}
      <path d="M37 110 Q35 130 34 150" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2.5" fill="none" />
    </g>
  );
}

function Torso({ o }: { o: Outfit }) {
  return o.body === "dress" ? <DressTorso o={o} /> : <HoodieTorso o={o} />;
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
  // A clean hair cap: covers the crown and temples, with a soft rounded fringe
  // that sits well ABOVE the eyebrows (brows are at ~y51) — the same hair colour
  // throughout, so there is never a dark bar reading as a monobrow.
  const cap = (
    <path
      d="M30 55 Q28 18 60 15 Q92 18 90 55 Q85 43 76 41 Q68 38 60 40 Q52 38 44 41 Q35 43 30 55 Z"
      fill="url(#lul-hair)"
    />
  );
  const shine = (
    <path
      d="M40 33 Q58 25 80 35"
      stroke="#ffffff"
      strokeOpacity="0.16"
      strokeWidth="1.6"
      strokeLinecap="round"
      fill="none"
    />
  );

  switch (o.hairStyle) {
    case "buzz":
      return (
        <g data-layer="hair">
          <path d="M32 53 Q31 23 60 21 Q89 23 88 53 Q80 47 60 47 Q40 47 32 53 Z" fill="url(#lul-hair)" opacity="0.92" />
        </g>
      );
    case "short":
      return (
        <g data-layer="hair">
          {cap}
          {shine}
        </g>
      );
    case "sidepart":
      return (
        <g data-layer="hair">
          {/* fringe swept across from a side part */}
          <path d="M30 55 Q29 18 60 15 Q91 18 90 55 Q86 41 72 39 Q64 30 44 37 Q36 41 30 55 Z" fill="url(#lul-hair)" />
          <path d="M50 22 Q66 28 83 37" stroke={o.hairShade} strokeWidth="1.3" strokeLinecap="round" opacity="0.5" fill="none" />
        </g>
      );
    case "tuft":
      return (
        <g data-layer="hair">
          <path d="M33 53 Q34 24 60 22 Q86 24 87 53 Q80 45 70 45 Q66 37 60 38 Q54 37 50 45 Q40 45 33 53 Z" fill="url(#lul-hair)" />
          <path d="M55 24 Q60 11 66 23 Q62 18 55 24 Z" fill="url(#lul-hair)" />
        </g>
      );
    case "spiky":
      return (
        <g data-layer="hair">
          <path d="M30 51 Q30 24 60 21 Q90 24 90 51 Q84 42 78 44 L82 29 L72 42 L74 25 L64 40 L61 23 L54 40 L49 26 L47 44 L40 29 L43 45 Q36 43 30 51 Z" fill="url(#lul-hair)" />
        </g>
      );
    case "curls":
      return (
        <g data-layer="hair">
          <path d="M30 53 Q28 20 60 16 Q92 20 90 53 Q90 46 85 46 Q88 37 79 37 Q82 28 71 31 Q73 22 60 25 Q47 22 49 31 Q38 28 41 37 Q32 37 35 46 Q30 46 30 53 Z" fill="url(#lul-hair)" />
          <circle cx="42" cy="31" r="4" fill="#ffffff" opacity="0.07" />
          <circle cx="60" cy="25" r="4.2" fill="#ffffff" opacity="0.07" />
          <circle cx="78" cy="31" r="4" fill="#ffffff" opacity="0.07" />
          <circle cx="34" cy="44" r="3.2" fill="#ffffff" opacity="0.06" />
          <circle cx="86" cy="44" r="3.2" fill="#ffffff" opacity="0.06" />
        </g>
      );
    case "afro":
      return (
        <g data-layer="hair">
          <path d="M26 48 Q19 9 60 7 Q101 9 94 48 Q95 63 83 67 Q90 45 80 37 Q86 27 60 25 Q34 27 40 37 Q30 45 37 67 Q25 63 26 48 Z" fill="url(#lul-hair)" />
          <circle cx="40" cy="19" r="3.2" fill="#000" opacity="0.10" />
          <circle cx="60" cy="11" r="3.2" fill="#000" opacity="0.10" />
          <circle cx="80" cy="19" r="3.2" fill="#000" opacity="0.10" />
          <circle cx="30" cy="40" r="3" fill="#000" opacity="0.08" />
          <circle cx="90" cy="40" r="3" fill="#000" opacity="0.08" />
        </g>
      );
    case "long":
      return (
        <g data-layer="hair">
          {/* long lengths falling past the shoulders */}
          <path d="M29 48 Q20 82 27 116 Q36 120 43 111 Q37 80 41 50 Z" fill="url(#lul-hair)" />
          <path d="M91 48 Q100 82 93 116 Q84 120 77 111 Q83 80 79 50 Z" fill="url(#lul-hair)" />
          {cap}
          {shine}
        </g>
      );
    case "bob":
      return (
        <g data-layer="hair">
          {/* chin-length bob framing the face */}
          <path d="M28 52 Q26 20 60 16 Q94 20 92 52 Q92 78 84 92 Q80 78 82 58 Q80 46 72 42 Q66 40 60 41 Q54 40 48 42 Q40 46 38 58 Q40 78 36 92 Q28 78 28 52 Z" fill="url(#lul-hair)" />
          {shine}
        </g>
      );
    case "ponytail":
      return (
        <g data-layer="hair">
          {/* high ponytail flowing behind on one side */}
          <path d="M82 26 Q108 32 103 64 Q100 86 87 79 Q98 54 80 43 Z" fill="url(#lul-hair)" />
          <path d="M79 30 Q88 25 92 33" stroke={o.hairShade} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.55" />
          {cap}
          {shine}
        </g>
      );
    case "pigtails":
      return (
        <g data-layer="hair">
          {/* two low pigtails */}
          <path d="M27 46 Q11 50 14 74 Q17 90 31 82 Q23 64 34 54 Z" fill="url(#lul-hair)" />
          <path d="M93 46 Q109 50 106 74 Q103 90 89 82 Q97 64 86 54 Z" fill="url(#lul-hair)" />
          {cap}
          <circle cx="31" cy="49" r="3" fill={o.hairShade} />
          <circle cx="89" cy="49" r="3" fill={o.hairShade} />
        </g>
      );
    case "bun":
      return (
        <g data-layer="hair">
          {cap}
          <circle cx="60" cy="12" r="9.5" fill="url(#lul-hair)" />
          <ellipse cx="60" cy="12" rx="9.5" ry="9.5" fill="#000" opacity="0.08" />
          <path d="M52 9 Q60 3 68 9" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.4" fill="none" />
        </g>
      );
    case "braids":
      return (
        <g data-layer="hair">
          {/* two braids down each side with rung shading */}
          <path d="M29 48 Q23 80 29 110 L41 110 Q39 80 40 50 Z" fill="url(#lul-hair)" />
          <path d="M91 48 Q97 80 91 110 L79 110 Q81 80 80 50 Z" fill="url(#lul-hair)" />
          {[60, 74, 88, 102].map((y) => (
            <g key={y}>
              <path d={`M29 ${y} Q35 ${y + 3} 41 ${y}`} stroke={o.hairShade} strokeWidth="1.3" fill="none" opacity="0.6" />
              <path d={`M79 ${y} Q85 ${y + 3} 91 ${y}`} stroke={o.hairShade} strokeWidth="1.3" fill="none" opacity="0.6" />
            </g>
          ))}
          {cap}
        </g>
      );
    default: // swept
      return (
        <g data-layer="hair">
          <path d="M30 55 Q28 17 60 14 Q92 17 90 55 Q86 41 74 39 Q68 31 57 33 Q46 33 40 40 Q34 42 30 55 Z" fill="url(#lul-hair)" />
          {shine}
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

        {/* ── TORSO (hoodie for boy, dress for girl) ──── */}
        <Torso o={o} />

        {/* Backpack straps sit over the top */}
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

          {/* Eyebrows — two short, well-separated strokes (never a monobrow) */}
          <path d="M45.5 52.5 Q49 50.8 52.5 52" stroke={o.hairShade} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M67.5 52 Q71 50.8 74.5 52.5" stroke={o.hairShade} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.9" />

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
