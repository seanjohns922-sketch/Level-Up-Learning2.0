"use client";

import { useEffect, useRef, useState } from "react";
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
  | "spiky"
  | "bald";
export type HatStyle = "none" | "beanie" | "cap" | "explorer" | "crown" | "wizard";
export type GlassesStyle = "none" | "round" | "shades" | "visor";
export type CapeStyle = "none" | "hero" | "royal";
export type BackpackStyle = "none" | "explorer" | "rocket";
/** Base body silhouette. "neutral" = trousers look, "dress" = flared skirt look. */
export type BodyType = "neutral" | "dress";
/** Free face expression (eyes + mouth, plus freckles / rosy cheeks add-ons). */
export type FaceType = "smile" | "bigSmile" | "happy" | "determined" | "freckles" | "rosy";
/** Clothing garment shapes (each occupies one equipment slot). */
export type TopStyle = "hoodie" | "tshirt" | "jumper" | "polo" | "jacket" | "dress";
export type BottomStyle = "joggers" | "shorts" | "jeans" | "trackpants" | "skirt" | "leggings";
export type ShoeStyle = "sneakers" | "boots" | "sandals" | "hightops";

export type AvatarOutfit = {
  body?: BodyType;
  face?: FaceType;
  top?: TopStyle;
  bottom?: BottomStyle;
  shoeStyle?: ShoeStyle;
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
  face: "smile",
  top: "hoodie",
  bottom: "joggers",
  shoeStyle: "sneakers",
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

// Lighten (amt > 0) or darken (amt < 0) a hex colour, so shading keeps the
// chosen colour's identity instead of washing to white / crushing to black.
function shade(hex: string, amt: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (full.length !== 6) return hex;
  const to = (v: number) => Math.max(0, Math.min(255, amt >= 0 ? Math.round(v + (255 - v) * amt) : Math.round(v * (1 + amt))));
  const r = to(parseInt(full.slice(0, 2), 16));
  const g = to(parseInt(full.slice(2, 4), 16));
  const b = to(parseInt(full.slice(4, 6), 16));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

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

// ── Shared arm treatments ───────────────────────────────────────────────────
const Hands = () => (
  <>
    <circle cx="24" cy="156" r="7.5" fill="url(#lul-skin)" />
    <circle cx="96" cy="156" r="7.5" fill="url(#lul-skin)" />
  </>
);
function LongSleeves({ o, cuff }: { o: Outfit; cuff?: boolean }) {
  return (
    <g>
      <path d="M22 100 Q14 112 18 150 Q24 158 32 154 Q34 128 34 108 Z" fill="url(#lul-shirt)" />
      <path d="M98 100 Q106 112 102 150 Q96 158 88 154 Q86 128 86 108 Z" fill="url(#lul-shirt)" />
      {cuff ? (
        <>
          <path d="M18 147 Q25 153 32 149 L31 156 Q24 161 18 154 Z" fill={o.shirtTrim} />
          <path d="M102 147 Q95 153 88 149 L89 156 Q96 161 102 154 Z" fill={o.shirtTrim} />
        </>
      ) : null}
      <Hands />
    </g>
  );
}
function ShortSleeves() {
  return (
    <g>
      {/* bare skin forearms */}
      <path d="M26 112 Q19 126 23 150 Q28 158 34 154 Q35 132 36 116 Z" fill="url(#lul-skin)" />
      <path d="M94 112 Q101 126 97 150 Q92 158 86 154 Q85 132 84 116 Z" fill="url(#lul-skin)" />
      <Hands />
      {/* sleeve caps */}
      <path d="M28 99 Q41 97 40 114 Q33 119 25 115 Q23 103 28 99 Z" fill="url(#lul-shirt)" />
      <path d="M92 99 Q79 97 80 114 Q87 119 95 115 Q97 103 92 99 Z" fill="url(#lul-shirt)" />
    </g>
  );
}
const TORSO = "M32 100 Q60 92 88 100 L93 156 Q60 167 27 156 Z";
const crewNeck = <path d="M51 99 Q60 106 69 99 Q60 103 51 99 Z" fill="url(#lul-skin)" />;

// ── Lower body (Bottom slot) ────────────────────────────────────────────────
function skinLegs(fromY: number) {
  return (
    <>
      <path d={`M45 ${fromY} L42 199 L53 199 L54 ${fromY} Z`} fill="url(#lul-skin)" />
      <path d={`M75 ${fromY} L78 199 L67 199 L66 ${fromY} Z`} fill="url(#lul-skin)" />
    </>
  );
}
function BottomLayer({ o, style }: { o: Outfit; style: BottomStyle }) {
  const waistband = <path d="M38 148 Q60 154 82 148 L82 157 Q60 163 38 157 Z" fill="#000" opacity="0.28" />;
  switch (style) {
    case "shorts":
      return (
        <g data-layer="pants">
          {skinLegs(176)}
          <path d="M39 150 L36 178 L57 178 L58 162 Z" fill="url(#lul-pants)" />
          <path d="M81 150 L84 178 L63 178 L62 162 Z" fill="url(#lul-pants)" />
          {waistband}
        </g>
      );
    case "jeans":
      return (
        <g data-layer="pants">
          <path d="M39 150 L37 200 L55 200 L57 160 Z" fill="url(#lul-pants)" />
          <path d="M81 150 L83 200 L65 200 L63 160 Z" fill="url(#lul-pants)" />
          {waistband}
          <line x1="60" y1="158" x2="60" y2="200" stroke="#000" strokeOpacity="0.22" strokeWidth="1" />
          <path d="M39 196 L55 196" stroke="#fff" strokeOpacity="0.2" strokeWidth="2" />
          <path d="M65 196 L83 196" stroke="#fff" strokeOpacity="0.2" strokeWidth="2" />
        </g>
      );
    case "trackpants":
      return (
        <g data-layer="pants">
          <path d="M40 150 L34 200 L56 200 L58 168 Z" fill="url(#lul-pants)" />
          <path d="M80 150 L86 200 L64 200 L62 168 Z" fill="url(#lul-pants)" />
          {waistband}
          <path d="M41 152 L37 199" stroke={o.shirtTrim} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M79 152 L83 199" stroke={o.shirtTrim} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      );
    case "skirt":
      return (
        <g data-layer="pants">
          {skinLegs(172)}
          <path d="M37 148 Q60 155 83 148 L93 184 Q60 195 27 184 Z" fill="url(#lul-pants)" />
          <line x1="50" y1="156" x2="43" y2="181" stroke="#000" strokeOpacity="0.10" strokeWidth="1.4" />
          <line x1="60" y1="158" x2="60" y2="183" stroke="#000" strokeOpacity="0.10" strokeWidth="1.4" />
          <line x1="70" y1="156" x2="77" y2="181" stroke="#000" strokeOpacity="0.10" strokeWidth="1.4" />
          <path d="M27 184 Q60 195 93 184" stroke={shade(o.pants, 0.25)} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
      );
    case "leggings":
      return (
        <g data-layer="pants">
          <path d="M44 150 L42 200 L53 200 L54 168 Z" fill="url(#lul-pants)" />
          <path d="M76 150 L78 200 L67 200 L66 168 Z" fill="url(#lul-pants)" />
          {waistband}
        </g>
      );
    default: // joggers
      return (
        <g data-layer="pants">
          <path d="M40 150 L34 200 L56 200 L58 168 Z" fill="url(#lul-pants)" />
          <path d="M80 150 L86 200 L64 200 L62 168 Z" fill="url(#lul-pants)" />
          {waistband}
          <line x1="60" y1="158" x2="60" y2="200" stroke="#000" strokeOpacity="0.25" strokeWidth="1" />
        </g>
      );
  }
}

// ── Torso (Top slot). "dress" also renders its own skirt. ───────────────────
function TopLayer({ o }: { o: Outfit }) {
  switch (o.top) {
    case "tshirt":
      return (
        <g data-layer="shirt">
          <ShortSleeves />
          <path d={TORSO} fill="url(#lul-shirt)" />
          {crewNeck}
          <path d="M51 99 Q60 105 69 99" stroke={o.shirtTrim} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M33 108 Q34 136 30 156" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2.6" fill="none" />
        </g>
      );
    case "jumper":
      return (
        <g data-layer="shirt">
          <LongSleeves o={o} cuff />
          <path d={TORSO} fill="url(#lul-shirt)" />
          {crewNeck}
          <path d="M50 100 Q60 108 70 100" stroke={o.shirtTrim} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M28 154 Q60 164 92 154 L92 160 Q60 170 28 160 Z" fill={o.shirtTrim} opacity="0.9" />
        </g>
      );
    case "polo":
      return (
        <g data-layer="shirt">
          <ShortSleeves />
          <path d={TORSO} fill="url(#lul-shirt)" />
          {crewNeck}
          <path d="M52 99 L59 108 L61 100 Z" fill={o.shirtTrim} />
          <path d="M68 99 L61 108 L59 100 Z" fill={o.shirtTrim} />
          <line x1="61" y1="106" x2="61" y2="122" stroke={o.shirtTrim} strokeWidth="1.4" />
          <circle cx="61" cy="112" r="1.1" fill={o.shirtTrim} />
          <circle cx="61" cy="118" r="1.1" fill={o.shirtTrim} />
        </g>
      );
    case "jacket":
      return (
        <g data-layer="shirt">
          <LongSleeves o={o} />
          <path d={TORSO} fill="url(#lul-shirt)" />
          {/* lapels */}
          <path d="M49 100 L60 114 L51 118 Z" fill={shade(o.shirt, -0.18)} />
          <path d="M71 100 L60 114 L69 118 Z" fill={shade(o.shirt, -0.18)} />
          {/* zip */}
          <line x1="60" y1="112" x2="60" y2="158" stroke={shade(o.shirt, -0.28)} strokeWidth="1.8" />
          <circle cx="60" cy="132" r="1.6" fill={o.shirtTrim} />
          {/* chest pockets */}
          <rect x="39" y="130" width="13" height="11" rx="2" fill={shade(o.shirt, -0.16)} />
          <rect x="68" y="130" width="13" height="11" rx="2" fill={shade(o.shirt, -0.16)} />
          <path d="M33 108 Q34 136 30 156" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2.6" fill="none" />
        </g>
      );
    case "dress":
      return (
        <g data-layer="dress">
          <path d="M24 102 Q16 114 20 150 Q26 158 33 154 Q35 128 35 110 Z" fill="url(#lul-shirt)" />
          <path d="M96 102 Q104 114 100 150 Q94 158 87 154 Q85 128 85 110 Z" fill="url(#lul-shirt)" />
          <Hands />
          <ellipse cx="33" cy="105" rx="9.5" ry="8.5" fill="url(#lul-shirt)" />
          <ellipse cx="87" cy="105" rx="9.5" ry="8.5" fill="url(#lul-shirt)" />
          <ellipse cx="33" cy="104" rx="9.5" ry="8.5" fill="#ffffff" opacity="0.08" />
          <ellipse cx="87" cy="104" rx="9.5" ry="8.5" fill="#ffffff" opacity="0.08" />
          <path d="M34 100 Q60 94 86 100 L82 150 Q60 156 38 150 Z" fill="url(#lul-shirt)" />
          <path d="M49 99 Q60 111 71 99 Q66 104 60 104 Q54 104 49 99 Z" fill={o.shirtTrim} />
          <path d="M38 145 Q60 151 82 145 L82 152 Q60 158 38 152 Z" fill={o.shirtTrim} opacity="0.95" />
          <path d="M37 150 Q60 157 83 150 L94 187 Q60 198 26 187 Z" fill="url(#lul-shirt)" />
          <line x1="50" y1="156" x2="43" y2="184" stroke="#000" strokeOpacity="0.10" strokeWidth="1.4" />
          <line x1="60" y1="158" x2="60" y2="185" stroke="#000" strokeOpacity="0.10" strokeWidth="1.4" />
          <line x1="70" y1="156" x2="77" y2="184" stroke="#000" strokeOpacity="0.10" strokeWidth="1.4" />
          <path d="M26 187 Q60 198 94 187" stroke={o.shirtTrim} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M37 110 Q35 130 34 150" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2.5" fill="none" />
        </g>
      );
    default: // hoodie
      return (
        <g data-layer="shirt">
          <LongSleeves o={o} />
          <path d={TORSO} fill="url(#lul-shirt)" />
          <path d="M34 100 Q40 82 60 80 Q80 82 86 100 Q72 92 60 92 Q48 92 34 100 Z" fill={o.shirt} opacity="0.95" />
          <path d="M42 128 L78 128 Q80 142 60 144 Q40 142 42 128 Z" fill="#000" opacity="0.18" />
          <line x1="54" y1="100" x2="52" y2="118" stroke={o.shirtTrim} strokeWidth="1.4" strokeLinecap="round" />
          <line x1="66" y1="100" x2="68" y2="118" stroke={o.shirtTrim} strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="52" cy="119" r="1.4" fill={o.shirtTrim} />
          <circle cx="68" cy="119" r="1.4" fill={o.shirtTrim} />
          <path d="M32 108 Q34 138 30 156" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="3" fill="none" />
        </g>
      );
  }
}

// ── Shoes (Shoe slot) ───────────────────────────────────────────────────────
function ShoeLayer({ o }: { o: Outfit }) {
  switch (o.shoeStyle) {
    case "boots":
      return (
        <g data-layer="shoes">
          {/* tall ankle boots, one per foot with a clear gap */}
          <path d="M34 181 Q46 179 57 182 L58 206 Q58 213 51 213 L38 213 Q33 213 33 207 L33 188 Q33 183 34 181 Z" fill="url(#lul-shoe)" />
          <path d="M86 181 Q74 179 63 182 L62 206 Q62 213 69 213 L82 213 Q87 213 87 207 L87 188 Q87 183 86 181 Z" fill="url(#lul-shoe)" />
          {/* folded cuffs */}
          <path d="M34 186 Q46 190 57 186" stroke={shade(o.shoes, 0.34)} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M63 186 Q74 190 86 186" stroke={shade(o.shoes, 0.34)} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          {/* laces */}
          <path d="M39 194 L52 196 M39 199 L52 201" stroke={shade(o.shoes, 0.42)} strokeWidth="1.3" />
          <path d="M81 194 L68 196 M81 199 L68 201" stroke={shade(o.shoes, 0.42)} strokeWidth="1.3" />
          {/* soles */}
          <rect x="31" y="210" width="28" height="4.5" rx="2" fill="#2e2016" />
          <rect x="61" y="210" width="28" height="4.5" rx="2" fill="#2e2016" />
        </g>
      );
    case "hightops":
      return (
        <g data-layer="shoes">
          <path d="M32 195 Q32 190 40 190 L58 190 Q60 196 60 208 Q60 213 55 213 L34 213 Q30 213 30 208 Z" fill="url(#lul-shoe)" />
          <path d="M88 195 Q88 190 80 190 L62 190 Q60 196 60 208 Q60 213 65 213 L86 213 Q90 213 90 208 Z" fill="url(#lul-shoe)" />
          <rect x="28" y="210" width="32" height="4.5" rx="2" fill="#f8fafc" />
          <rect x="60" y="210" width="32" height="4.5" rx="2" fill="#f8fafc" />
          <path d="M40 198 L54 200 M40 203 L54 205" stroke="#f8fafc" strokeWidth="1.3" />
          <path d="M80 198 L66 200 M80 203 L66 205" stroke="#f8fafc" strokeWidth="1.3" />
        </g>
      );
    case "sandals":
      return (
        <g data-layer="shoes">
          {/* bare feet */}
          <path d="M37 200 Q35 208 41 210 L56 210 Q59 210 59 206 L58 200 Z" fill="url(#lul-skin)" />
          <path d="M83 200 Q85 208 79 210 L64 210 Q61 210 61 206 L62 200 Z" fill="url(#lul-skin)" />
          {/* thin soles */}
          <rect x="35" y="209" width="25" height="3.6" rx="1.8" fill="url(#lul-shoe)" />
          <rect x="60" y="209" width="25" height="3.6" rx="1.8" fill="url(#lul-shoe)" />
          {/* Y straps */}
          <path d="M40 203 L54 203" stroke="url(#lul-shoe)" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M47 200 L48 208" stroke="url(#lul-shoe)" strokeWidth="2" strokeLinecap="round" />
          <path d="M66 203 L80 203" stroke="url(#lul-shoe)" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M73 200 L72 208" stroke="url(#lul-shoe)" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    default: // sneakers
      return (
        <g data-layer="shoes">
          <path d="M30 206 Q30 198 42 198 L58 198 Q60 204 60 210 Q60 214 56 214 L32 214 Q28 214 28 210 Z" fill="url(#lul-shoe)" />
          <path d="M90 206 Q90 198 78 198 L62 198 Q60 204 60 210 Q60 214 64 214 L88 214 Q92 214 92 210 Z" fill="url(#lul-shoe)" />
          <rect x="28" y="210" width="32" height="4" rx="2" fill="#f8fafc" />
          <rect x="60" y="210" width="32" height="4" rx="2" fill="#f8fafc" />
          <path d="M34 205 Q44 202 56 205" stroke={o.shirt} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7" />
          <path d="M64 205 Q76 202 86 205" stroke={o.shirt} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.7" />
        </g>
      );
  }
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

// Raised hairlines leave the upper forehead open while keeping sideburns near
// the ears. The asymmetry prevents the old flat helmet/sticker appearance.
const HAIR_FRONT = "Q92 45 85 48 Q81 42 73 43 Q66 38 58 40 Q49 37 42 42 Q36 42 38 47 Q31 48 27 56 Z";
const HAIR_FRONT_L = "Q97 44 88 48 Q83 41 75 42 Q66 37 58 39 Q48 36 40 42 Q33 43 35 48 Q27 49 22 54 Z";

function HairLayer({ o }: { o: Outfit }) {
  // Each style: real VOLUME above the skull, sides that FRAME the temples/ears,
  // the shared raised+swept hairline, and a glossy 3-tone read (gradient roots
  // + a white sheen band). Colour comes from the gradient so any hair colour
  // works. dk = hairShade for interior shadows and strand separators.
  const dk = o.hairShade;
  const sep = (d: string) => <path d={d} stroke={dk} strokeWidth="1.3" strokeLinecap="round" opacity="0.32" fill="none" />;
  const sh = (cx: number, cy: number, rx: number, ry: number) => (
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#lul-hair-sheen)" transform={`rotate(-18 ${cx} ${cy})`} />
  );

  switch (o.hairStyle) {
    case "bald": // no hair — just a soft scalp highlight so it reads intentional
      return (
        <g data-layer="hair">
          <ellipse cx="52" cy="32" rx="14" ry="9" fill="#ffffff" opacity="0.12" transform="rotate(-18 52 32)" />
        </g>
      );
    case "buzz": // tight to the scalp, stippled, smallest silhouette
      return (
        <g data-layer="hair">
          <path d="M30 54 Q28 23 60 20 Q92 23 90 54 Q86 45 79 46 Q70 41 61 42 Q51 40 42 44 Q35 45 30 54 Z" fill="url(#lul-hair)" opacity="0.95" />
          <g fill={dk} opacity="0.28">
            {[38, 48, 58, 68, 78].map((x) => <circle key={x} cx={x} cy="33" r="0.9" />)}
            {[34, 44, 54, 64, 74, 84].map((x) => <circle key={`a${x}`} cx={x} cy="41" r="0.9" />)}
            {[40, 52, 60, 68, 80].map((x) => <circle key={`b${x}`} cx={x} cy="48" r="0.8" />)}
          </g>
          {sh(46, 30, 15, 8)}
        </g>
      );
    case "short": // compact, tidy and clearly layered at thumbnail size
      return (
        <g data-layer="hair">
          <path d={`M27 56 Q22 12 58 7 Q91 5 94 35 Q96 47 92 45 ${HAIR_FRONT}`} fill="url(#lul-hair)" />
          <path d="M31 37 Q35 14 57 10 Q75 7 88 20 Q71 15 58 25 Q47 18 31 37Z" fill="url(#lul-hair-lock)" opacity="0.82" />
          {sep("M39 19 Q50 24 58 39")}
          {sep("M56 12 Q68 21 76 40")}
          {sh(44, 20, 18, 9)}
        </g>
      );
    case "swept": // broad directional locks with a lifted forehead
      return (
        <g data-layer="hair">
          <path d="M25 56 Q20 11 56 7 Q92 1 105 30 Q112 47 96 56 Q92 48 85 48 Q80 42 72 43 Q63 38 55 41 Q45 37 39 43 Q31 46 25 56Z" fill="url(#lul-hair)" />
          <path d="M31 38 Q40 11 67 8 Q88 6 103 29 Q78 16 53 37 Q43 31 31 38Z" fill="url(#lul-hair-lock)" opacity="0.88" />
          <path d="M43 39 Q58 14 91 15 Q74 23 62 42Z" fill={dk} opacity="0.18" />
          {sep("M51 14 Q77 17 99 37")}
          {sep("M42 23 Q66 24 88 44")}
          {sh(43, 19, 20, 9)}
        </g>
      );
    case "sidepart": // deep part on the left + combed-over lift on the big side
      return (
        <g data-layer="hair">
          <path d="M27 56 Q23 13 51 9 Q57 5 68 7 Q96 9 93 56 Q89 46 82 47 Q75 41 67 42 Q58 38 50 42 Q45 39 43 47 Q34 48 27 56Z" fill="url(#lul-hair)" />
          <path d="M50 41 Q51 14 69 9 Q89 10 94 31 Q77 19 56 42Z" fill="url(#lul-hair-lock)" opacity="0.9" />
          <path d="M50 15 Q47 29 47 43" stroke={dk} strokeWidth="2.2" strokeLinecap="round" opacity="0.55" fill="none" />
          {sep("M58 14 Q76 18 89 35")}
          {sep("M58 23 Q73 27 84 43")}
          {sh(68, 16, 14, 7)}
        </g>
      );
    case "tuft": // compact crop + a bold playful front flick
      return (
        <g data-layer="hair">
          <path d="M28 55 Q25 17 60 12 Q94 16 92 55 Q88 46 80 47 Q70 41 61 42 Q50 39 42 44 Q34 47 28 55Z" fill="url(#lul-hair)" />
          <path d="M44 30 Q43 7 58 7 Q67 -1 78 6 Q69 8 71 17 Q66 11 61 14 Q67 20 61 27 Q54 18 44 30Z" fill="url(#lul-hair-lock)" />
          {sep("M51 11 Q55 20 57 29")}
          {sh(45, 24, 14, 7)}
        </g>
      );
    case "spiky": // tall energetic chunky spikes rising from a raised hairline
      return (
        <g data-layer="hair">
          <path d="M28 55 Q27 31 34 25 L37 9 46 22 50 4 58 21 63 3 70 21 80 7 82 25 Q91 31 92 55 Q88 46 81 47 Q72 40 63 42 Q52 38 43 43 Q34 46 28 55Z" fill="url(#lul-hair)" />
          <path d="M36 28 47 13 51 29 63 10 68 29 79 16 82 35 Q62 24 42 36Z" fill="url(#lul-hair-lock)" opacity="0.72" />
          {sh(45, 19, 15, 8)}
        </g>
      );
    case "curls": // bumpy defined curls all around, wrapping the temples
      return (
        <g data-layer="hair">
          <path d="M23 57 Q19 22 60 17 Q101 22 97 57 Q91 46 84 47 Q72 40 60 42 Q48 40 35 47 Q28 47 23 57Z" fill="url(#lul-hair)" />
          <g fill="url(#lul-hair)">
            <circle cx="28" cy="34" r="11" /><circle cx="26" cy="46" r="9" /><circle cx="38" cy="22" r="11" />
            <circle cx="52" cy="17" r="11" /><circle cx="68" cy="17" r="11" /><circle cx="82" cy="22" r="11" /><circle cx="92" cy="34" r="10" /><circle cx="94" cy="46" r="9" />
          </g>
          <g fill={dk} opacity="0.32">
            <circle cx="36" cy="30" r="4" /><circle cx="50" cy="22" r="4" /><circle cx="64" cy="20" r="4.2" /><circle cx="78" cy="24" r="4" /><circle cx="86" cy="36" r="3.6" /><circle cx="30" cy="40" r="3.4" /><circle cx="60" cy="34" r="3.6" />
          </g>
          <g fill="#ffffff" opacity="0.18">
            <circle cx="42" cy="18" r="3" /><circle cx="58" cy="13" r="3.4" /><circle cx="74" cy="17" r="3" />
          </g>
          {sh(44, 26, 16, 9)}
        </g>
      );
    case "afro": // huge soft round cloud, far bigger than the head
      return (
        <g data-layer="hair">
          <path d="M18 54 Q7 40 13 24 Q15 6 34 9 Q42 2 58 5 Q66 2 84 9 Q105 7 107 24 Q114 40 101 54 Q97 44 88 45 Q82 39 73 41 Q61 36 50 40 Q40 38 32 45 Q22 44 18 54Z" fill="url(#lul-hair)" />
          <g fill="#ffffff" opacity="0.09">
            <circle cx="32" cy="20" r="6" /><circle cx="50" cy="11" r="6.4" /><circle cx="72" cy="11" r="6.4" /><circle cx="90" cy="22" r="6" /><circle cx="60" cy="7" r="6.2" /><circle cx="20" cy="38" r="5" />
          </g>
          <g fill={dk} opacity="0.2">
            <circle cx="40" cy="20" r="3" /><circle cx="60" cy="24" r="3" /><circle cx="80" cy="20" r="3" /><circle cx="28" cy="36" r="2.6" /><circle cx="92" cy="36" r="2.6" />
          </g>
          {sh(42, 22, 18, 10)}
        </g>
      );
    case "long": // crown volume + long layered locks framing past the jaw
      return (
        <g data-layer="hair">
          <path d="M26 52 Q18 74 22 104 Q26 128 36 130 Q42 130 40 120 Q34 100 42 84 Z" fill={dk} opacity="0.45" />
          <path d="M94 52 Q102 74 98 104 Q94 128 84 130 Q78 130 80 120 Q86 100 78 84 Z" fill={dk} opacity="0.45" />
          <path d="M22 46 Q12 70 18 104 Q22 128 34 130 Q41 130 39 119 Q33 100 44 84 Q40 60 40 48 Z" fill="url(#lul-hair)" />
          <path d="M98 46 Q108 70 102 104 Q98 128 86 130 Q79 130 81 119 Q87 100 76 84 Q80 60 80 48 Z" fill="url(#lul-hair)" />
          <path d={`M22 54 Q16 8 60 4 Q104 8 98 54 ${HAIR_FRONT_L}`} fill="url(#lul-hair)" />
          {sep("M30 58 Q24 96 34 126")}
          {sep("M90 58 Q96 96 86 126")}
          {sh(46, 22, 18, 11)}
        </g>
      );
    case "bob": // rounded bob, wide at the jaw, inward-curl ends, full fringe
      return (
        <g data-layer="hair">
          <path d="M22 54 Q20 10 60 6 Q100 10 98 54 Q100 84 88 102 Q80 104 80 93 Q86 74 84 58 Q84 46 60 43 Q36 46 36 58 Q34 74 40 93 Q40 104 32 102 Q20 84 22 54 Z" fill={dk} opacity="0.45" />
          <path d="M23 55 Q20 9 60 5 Q100 9 97 55 Q99 84 87 102 Q79 105 79 93 Q85 74 83 58 Q84 47 76 46 Q68 43 60 45 Q52 43 44 46 Q36 47 37 58 Q35 74 41 93 Q41 105 33 102 Q21 84 23 55 Z" fill="url(#lul-hair)" />
          {sep("M30 60 Q28 82 34 98")}
          {sep("M90 60 Q92 82 86 98")}
          {sh(44, 24, 17, 10)}
        </g>
      );
    case "ponytail": // sleek pulled-back crown + a big bouncy side ponytail
      return (
        <g data-layer="hair">
          <path d="M84 24 Q113 28 113 56 Q111 82 92 82 Q99 76 100 66 Q92 78 86 74 Q98 66 98 52 Q98 42 82 42 Z" fill="url(#lul-hair)" />
          <path d="M83 42 Q97 44 97 54 Q97 66 90 76 Q95 66 92 54 Q90 46 82 46 Z" fill={dk} opacity="0.4" />
          {sep("M92 34 Q104 48 98 70")}
          <path d="M25 56 Q22 10 60 6 Q98 10 94 50 Q92 48 84 48 Q86 44 78 45 Q68 42 58 44 Q49 41 42 44 Q35 44 37 48 Q28 49 25 56 Z" fill="url(#lul-hair)" />
          {sh(44, 22, 17, 10)}
        </g>
      );
    case "pigtails": // two big round bunches to the sides + centre part
      return (
        <g data-layer="hair">
          <g fill="url(#lul-hair)">
            <circle cx="18" cy="68" r="14" /><circle cx="102" cy="68" r="14" />
          </g>
          <path d="M12 60 Q6 68 10 78 Q6 68 14 62 Z" fill={dk} opacity="0.35" />
          <path d="M108 60 Q114 68 110 78 Q114 68 106 62 Z" fill={dk} opacity="0.35" />
          {sep("M12 64 Q18 72 24 76")}
          {sep("M108 64 Q102 72 96 76")}
          <path d="M24 56 Q21 10 60 6 Q99 10 96 56 Q93 48 85 48 Q87 44 78 45 Q68 42 58 44 Q49 41 42 44 Q34 45 37 48 Q28 49 24 56 Z" fill="url(#lul-hair)" />
          <path d="M60 8 Q60 22 60 32" stroke={dk} strokeWidth="1.5" opacity="0.4" fill="none" />
          {sh(44, 22, 16, 9)}
        </g>
      );
    case "bun": // sleek up-do + a round bun adding height on top
      return (
        <g data-layer="hair">
          <ellipse cx="60" cy="12" rx="14" ry="12" fill={dk} opacity="0.4" />
          <circle cx="60" cy="11" r="11" fill="url(#lul-hair)" />
          <path d="M51 6 Q60 1 69 6" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.8" fill="none" />
          <path d="M51 15 Q60 19 69 15" stroke={dk} strokeWidth="1.5" opacity="0.35" fill="none" />
          <path d="M25 56 Q22 12 60 8 Q98 12 95 56 Q92 48 84 48 Q86 44 78 45 Q68 42 58 44 Q49 41 42 44 Q35 44 37 48 Q28 49 25 56 Z" fill="url(#lul-hair)" />
          {sep("M40 28 Q60 20 80 28")}
          {sh(44, 26, 16, 9)}
        </g>
      );
    case "braids": // centre part + two thick plaited braids down the front
      return (
        <g data-layer="hair">
          {[
            [18, 30],
            [102, 90],
          ].map(([xOuter, xInner], side) => {
            const cx = (xOuter + xInner) / 2;
            return (
              <g key={side}>
                {[58, 72, 86, 100].map((y, i) => (
                  <g key={y}>
                    <ellipse cx={cx} cy={y} rx="9" ry="8.5" fill="url(#lul-hair)" transform={`rotate(${i % 2 === 0 ? -20 : 20} ${cx} ${y})`} />
                    <ellipse cx={cx} cy={y + 3} rx="8" ry="4" fill={dk} opacity="0.28" />
                  </g>
                ))}
                <path d={`M${cx - 4} 108 Q${cx} 118 ${cx + 4} 108`} fill="url(#lul-hair)" />
              </g>
            );
          })}
          <path d="M24 56 Q21 10 60 6 Q99 10 96 56 Q93 48 85 48 Q87 44 78 45 Q68 42 58 44 Q49 41 42 44 Q34 45 37 48 Q28 49 24 56 Z" fill="url(#lul-hair)" />
          <path d="M60 8 Q60 22 60 32" stroke={dk} strokeWidth="1.5" opacity="0.4" fill="none" />
          {sh(44, 22, 16, 9)}
        </g>
      );
    default: // fallback → short
      return (
        <g data-layer="hair">
          <path d={`M27 58 Q22 10 60 5 Q98 10 93 58 ${HAIR_FRONT}`} fill="url(#lul-hair)" />
          {sh(46, 24, 19, 11)}
        </g>
      );
  }
}

// Free face expressions — eyes + mouth, with freckles / rosy-cheek add-ons.
// Eyes live in a `.lul-eyes` group so the idle blink animation can scale them.
function FaceLayer({ o }: { o: Outfit }) {
  const openEyes = (
    <g className="lul-eyes">
      <ellipse cx="49" cy="60" rx="3.6" ry="4.6" fill="#ffffff" />
      <ellipse cx="71" cy="60" rx="3.6" ry="4.6" fill="#ffffff" />
      <ellipse cx="49" cy="61" rx="2.4" ry="3.2" fill="#2c1810" />
      <ellipse cx="71" cy="61" rx="2.4" ry="3.2" fill="#2c1810" />
      <circle cx="50" cy="59.5" r="1.1" fill="#ffffff" />
      <circle cx="72" cy="59.5" r="1.1" fill="#ffffff" />
      <circle cx="48.2" cy="62.4" r="0.5" fill="#ffffff" opacity="0.8" />
      <circle cx="70.2" cy="62.4" r="0.5" fill="#ffffff" opacity="0.8" />
    </g>
  );
  const happyEyes = (
    <g>
      <path d="M45 61 Q49 56 53 61" stroke="#2c1810" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M67 61 Q71 56 75 61" stroke="#2c1810" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
  );
  const determinedEyes = (
    <g className="lul-eyes">
      <ellipse cx="49" cy="61" rx="3.4" ry="3.8" fill="#ffffff" />
      <ellipse cx="71" cy="61" rx="3.4" ry="3.8" fill="#ffffff" />
      <ellipse cx="49" cy="62" rx="2.3" ry="2.8" fill="#2c1810" />
      <ellipse cx="71" cy="62" rx="2.3" ry="2.8" fill="#2c1810" />
      {/* focused lids */}
      <path d="M45 57.5 L53.5 59" stroke={o.hairShade} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M75 57.5 L66.5 59" stroke={o.hairShade} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
  const smallSmile = <path d="M52 74 Q60 80 68 74" stroke="#3d2613" strokeWidth="1.8" strokeLinecap="round" fill="none" />;
  const bigSmile = (
    <g>
      <path d="M50 73 Q60 84 70 73 Q60 78 50 73 Z" fill="#7a3b2e" />
      <path d="M53 74.5 Q60 78 67 74.5 Q60 80 53 74.5 Z" fill="#ffffff" />
    </g>
  );

  const eyes = o.face === "happy" ? happyEyes : o.face === "determined" ? determinedEyes : openEyes;
  const mouth = o.face === "bigSmile" ? bigSmile : smallSmile;
  const cheekOpacity = o.face === "rosy" ? 0.9 : 0.55;
  const cheekR = o.face === "rosy" ? 5.6 : 4.5;

  return (
    <g data-layer="face">
      {/* Cheeks */}
      <ellipse cx="44" cy="68" rx={cheekR} ry={o.face === "rosy" ? 3.4 : 2.6} fill="#f4a8a8" opacity={cheekOpacity} />
      <ellipse cx="76" cy="68" rx={cheekR} ry={o.face === "rosy" ? 3.4 : 2.6} fill="#f4a8a8" opacity={cheekOpacity} />

      {/* Eyebrows — two short, well-separated strokes (never a monobrow) */}
      {o.face === "determined" ? null : (
        <>
          <path d="M45.5 52.5 Q49 50.8 52.5 52" stroke={o.hairShade} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M67.5 52 Q71 50.8 74.5 52.5" stroke={o.hairShade} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.9" />
        </>
      )}

      {eyes}

      {/* Nose hint */}
      <path d="M60 64 Q61 68 60 70" stroke={o.skinShade} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />

      {mouth}

      {/* Freckles */}
      {o.face === "freckles" ? (
        <g fill={o.skinShade} opacity="0.55">
          <circle cx="42" cy="66" r="0.8" />
          <circle cx="46" cy="68" r="0.8" />
          <circle cx="45" cy="64" r="0.7" />
          <circle cx="78" cy="66" r="0.8" />
          <circle cx="74" cy="68" r="0.8" />
          <circle cx="75" cy="64" r="0.7" />
        </g>
      ) : null}
    </g>
  );
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
  /** Crop to the head and shoulders for hairstyle and face selectors. */
  framing?: "full" | "head";
  /** Idle life: blink + breathe. On by default; pass false for tiny thumbnails. */
  alive?: boolean;
  /** Bump this number to play a one-shot "celebrate" pop (e.g. after equipping). */
  celebrateSignal?: number;
};

export default function StudentAvatar({
  height = 196,
  outfit,
  glowColor = "rgba(255,255,255,0.18)",
  floatAnimation = "lul-avatar-float 4.6s ease-in-out infinite",
  framing = "full",
  alive = true,
  celebrateSignal = 0,
}: StudentAvatarProps) {
  // Pull saved outfit on mount (avoids SSR hydration mismatch).
  const [stored, setStored] = useState<AvatarOutfit>({});
  useEffect(() => {
    // localStorage is only readable after mount (avoids SSR hydration mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStored(readOutfitFromStorage());
  }, []);

  // One-shot celebrate pop when celebrateSignal changes (skips the first render).
  const wrapRef = useRef<HTMLDivElement>(null);
  const firstSignal = useRef(true);
  useEffect(() => {
    if (firstSignal.current) {
      firstSignal.current = false;
      return;
    }
    if (typeof window === "undefined" || !wrapRef.current?.animate) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    wrapRef.current.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.12) rotate(-1.5deg)", offset: 0.35 },
        { transform: "scale(0.97) rotate(1deg)", offset: 0.7 },
        { transform: "scale(1)" },
      ],
      { duration: 540, easing: "cubic-bezier(.34,1.56,.64,1)" },
    );
  }, [celebrateSignal]);

  const o: Required<AvatarOutfit> = {
    ...DEFAULT_OUTFIT,
    ...stored,
    ...(outfit ?? {}),
  };
  // Back-compat: pre-slot avatars stored body:"dress" with no `top` — render a dress.
  if (o.body === "dress" && outfit?.top === undefined && stored.top === undefined) {
    o.top = "dress";
  }
  // A dress occupies the Bottom slot too — show slim leggings beneath the skirt.
  const bottomStyle: BottomStyle = o.top === "dress" ? "leggings" : o.bottom;

  const sourceHeight = framing === "head" ? 106 : 220;
  const width = Math.round((height * 120) / sourceHeight);

  return (
    <div
      ref={wrapRef}
      className={`lul-student-avatar${alive ? " lul-alive" : ""}`}
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
        viewBox={`0 0 120 ${sourceHeight}`}
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
            <stop offset="0%" stopColor={shade(o.hair, 0.36)} />
            <stop offset="45%" stopColor={o.hair} />
            <stop offset="100%" stopColor={o.hairShade} />
          </linearGradient>
          <linearGradient id="lul-hair-lock" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={shade(o.hair, 0.52)} />
            <stop offset="42%" stopColor={shade(o.hair, 0.18)} />
            <stop offset="100%" stopColor={o.hairShade} />
          </linearGradient>
          <radialGradient id="lul-hair-sheen" cx="0.4" cy="0.28" r="0.5">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lul-pants" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={shade(o.pants, 0.12)} />
            <stop offset="100%" stopColor={shade(o.pants, -0.35)} />
          </linearGradient>
          <linearGradient id="lul-shoe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={shade(o.shoes, 0.42)} />
            <stop offset="100%" stopColor={o.shoes} />
          </linearGradient>
        </defs>

        {/* ── BEHIND-BODY cosmetic layers ──────────────── */}
        <CapeLayer o={o} />
        <BackpackPack o={o} />

        {/* ── LOWER BODY (Bottom slot) ─────────────────── */}
        <BottomLayer o={o} style={bottomStyle} />

        {/* ── SHOES (Shoe slot) — over the pant hem so boots read ── */}
        <ShoeLayer o={o} />

        {/* ── TORSO (Top slot) ─────────────────────────── */}
        <TopLayer o={o} />

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

          <FaceLayer o={o} />
        </g>

        {/* ── HAIR + HEADWEAR + EYEWEAR ────────────────── */}
        <HairLayer o={o} />
        <HatLayer o={o} />
        <GlassesLayer o={o} />
      </svg>

      {framing === "full" ? (
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
      ) : null}

      <style>{`
        @keyframes lul-avatar-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-4px) scale(1.012); }
        }
        @keyframes lul-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          95%           { transform: scaleY(0.08); }
        }
        .lul-alive .lul-eyes {
          transform-box: fill-box;
          transform-origin: center;
          animation: lul-blink 5.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .lul-student-avatar { animation: none !important; }
          .lul-alive .lul-eyes { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
