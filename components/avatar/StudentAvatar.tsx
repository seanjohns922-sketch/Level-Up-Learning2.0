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

function HairLayer({ o }: { o: Outfit }) {
  const dk = o.hairShade;
  const edge = { stroke: dk, strokeWidth: 0.9, strokeOpacity: 0.28, strokeLinejoin: "round" as const };
  const lock = (d: string, opacity = 1) => <path d={d} fill="url(#lul-hair-lock)" opacity={opacity} {...edge} />;
  const sep = (d: string) => <path d={d} stroke={dk} strokeWidth="1.15" strokeLinecap="round" opacity="0.3" fill="none" />;
  const sh = (cx: number, cy: number, rx: number, ry: number) => (
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#lul-hair-sheen)" transform={`rotate(-22 ${cx} ${cy})`} />
  );
  const crop = (
    <path
      d={`M27 55 C25 29 36 12 55 8 C75 4 91 15 94 35 C95 44 93 50 91 53 ${HAIR_FRONT}`}
      fill="url(#lul-hair)"
      {...edge}
    />
  );
  const centrePart = <path d="M60 8 C58 20 58 31 59 40" stroke={dk} strokeWidth="1.35" opacity="0.38" fill="none" />;

  switch (o.hairStyle) {
    case "bald":
      return (
        <g data-layer="hair">
          <ellipse cx="52" cy="32" rx="14" ry="9" fill="#ffffff" opacity="0.12" transform="rotate(-18 52 32)" />
        </g>
      );
    case "buzz":
      return (
        <g data-layer="hair">
          <path d="M30 52 C29 29 41 21 59 20 C78 20 90 31 90 52 C85 45 78 44 70 44 C59 41 49 42 40 46 C36 47 33 49 30 52Z" fill="url(#lul-hair)" {...edge} />
          <g fill={dk} opacity="0.28">
            {[38, 47, 56, 65, 74, 82].map((x) => <circle key={x} cx={x} cy="32" r="0.8" />)}
            {[34, 43, 52, 61, 70, 79, 86].map((x) => <circle key={`a${x}`} cx={x} cy="40" r="0.8" />)}
          </g>
          {sh(47, 29, 14, 7)}
        </g>
      );
    case "short":
      return (
        <g data-layer="hair">
          {crop}
          {lock("M29 38 C31 20 42 11 55 10 C49 18 47 28 44 39 C39 35 34 35 29 38Z", 0.92)}
          {lock("M40 39 C43 17 56 7 70 10 C62 18 59 29 55 40 C50 37 45 37 40 39Z", 0.9)}
          {lock("M53 40 C60 17 76 11 88 22 C78 22 70 31 66 43 C62 40 58 39 53 40Z", 0.78)}
          {sep("M42 16 C51 20 55 27 55 38")}
          {sh(43, 19, 16, 8)}
        </g>
      );
    case "swept":
      return (
        <g data-layer="hair">
          <path d="M25 55 C22 28 34 11 54 7 C78 1 99 12 104 30 C108 43 103 52 94 56 C92 48 86 45 80 45 C71 40 64 39 55 42 C46 38 37 43 25 55Z" fill="url(#lul-hair)" {...edge} />
          {lock("M29 39 C35 17 49 7 66 7 C57 15 50 25 45 38 C39 35 34 36 29 39Z", 0.9)}
          {lock("M39 40 C49 14 68 5 88 13 C75 18 64 28 57 41 C51 38 45 38 39 40Z", 0.96)}
          {lock("M55 42 C67 18 87 15 101 28 C88 27 76 34 69 44 C64 42 60 41 55 42Z", 0.8)}
          {sep("M50 13 C68 15 84 23 97 36")}
          {sep("M41 23 C58 24 73 31 84 42")}
          {sh(42, 17, 18, 8)}
        </g>
      );
    case "sidepart":
      return (
        <g data-layer="hair">
          {crop}
          {lock("M27 46 C28 24 37 13 50 10 C47 20 46 31 47 43 C40 41 33 42 27 46Z", 0.72)}
          {lock("M49 42 C51 17 65 7 80 12 C91 16 95 26 94 38 C84 25 69 22 56 43Z", 0.98)}
          {lock("M57 40 C65 19 80 17 91 27 C80 27 70 33 66 43Z", 0.72)}
          <path d="M50 11 C47 22 47 33 48 43" stroke={dk} strokeWidth="1.8" strokeLinecap="round" opacity="0.5" fill="none" />
          {sep("M59 14 C74 17 85 24 92 35")}
          {sh(66, 15, 13, 6)}
        </g>
      );
    case "tuft":
      return (
        <g data-layer="hair">
          <path d="M28 54 C27 31 39 16 58 13 C78 11 91 25 92 54 C85 46 77 43 67 43 C55 40 44 42 35 48 C32 49 30 52 28 54Z" fill="url(#lul-hair)" {...edge} />
          {lock("M38 39 C39 20 49 12 59 13 C54 20 53 29 52 40Z", 0.8)}
          {lock("M48 34 C48 13 58 3 69 5 C66 10 68 14 77 13 C73 22 65 29 57 38Z")}
          {lock("M58 40 C66 22 79 18 88 28 C79 29 72 35 68 43Z", 0.72)}
          {sh(44, 21, 13, 6)}
        </g>
      );
    case "spiky":
      return (
        <g data-layer="hair">
          <path d="M28 54 C27 34 31 28 36 24 C35 17 37 11 39 6 C44 12 47 17 48 22 C50 13 54 7 58 2 C61 10 64 15 65 21 C68 13 73 8 78 5 C80 14 82 20 82 26 C89 31 92 40 92 54 C85 46 77 43 67 43 C56 40 44 42 35 48 C32 50 30 52 28 54Z" fill="url(#lul-hair)" {...edge} />
          {lock("M36 30 C40 22 44 17 48 13 C48 22 50 29 53 35 C56 24 61 16 66 11 C66 22 69 29 72 35 C75 28 79 23 82 20 C83 29 85 35 88 41 C68 33 51 34 36 43Z", 0.68)}
          {sh(44, 18, 13, 7)}
        </g>
      );
    case "curls":
      return (
        <g data-layer="hair">
          <path d="M24 55 C20 31 31 16 50 12 C72 6 94 18 97 43 C98 49 96 53 94 57 C88 48 80 45 72 45 C63 41 53 41 45 45 C36 43 29 48 24 55Z" fill="url(#lul-hair)" {...edge} />
          <g fill="url(#lul-hair-lock)" stroke={dk} strokeOpacity="0.2" strokeWidth="0.7">
            {[[29, 35, 8], [34, 22, 9], [47, 15, 9], [61, 13, 9], [75, 17, 9], [87, 25, 9], [92, 38, 8], [83, 40, 8], [68, 35, 8], [54, 34, 8], [40, 39, 8], [29, 47, 7]].map(([cx, cy, r]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />)}
          </g>
          <g fill="#fff" opacity="0.2"><circle cx="43" cy="13" r="2.5" /><circle cx="58" cy="11" r="2.8" /><circle cx="31" cy="27" r="2" /></g>
        </g>
      );
    case "afro":
      return (
        <g data-layer="hair">
          <path d="M18 54 C10 50 8 42 13 35 C8 26 14 17 23 16 C25 7 35 3 43 7 C49 0 61 0 67 6 C75 1 87 5 89 13 C100 13 107 22 103 31 C112 38 108 49 101 54 C96 47 90 44 84 45 C75 39 68 40 60 42 C51 39 43 40 35 45 C28 44 22 48 18 54Z" fill="url(#lul-hair)" {...edge} />
          {lock("M22 36 C26 15 42 7 58 9 C43 17 37 29 36 43 C31 40 27 38 22 36Z", 0.62)}
          {lock("M42 40 C45 13 67 6 85 18 C69 18 58 27 55 41Z", 0.7)}
          <g fill="#fff" opacity="0.12"><circle cx="34" cy="15" r="3" /><circle cx="52" cy="8" r="3.3" /><circle cx="74" cy="10" r="2.8" /></g>
        </g>
      );
    case "long":
      return (
        <g data-layer="hair">
          <path d="M22 47 C14 65 15 99 25 124 C29 133 39 132 39 121 C33 97 39 75 43 55Z" fill="url(#lul-hair)" {...edge} />
          <path d="M98 47 C106 65 105 99 95 124 C91 133 81 132 81 121 C87 97 81 75 77 55Z" fill="url(#lul-hair)" {...edge} />
          <path d="M22 53 C20 24 35 7 58 6 C82 5 99 22 98 53 C91 45 84 42 76 43 C69 39 64 37 60 39 C55 37 49 39 43 43 C34 42 28 46 22 53Z" fill="url(#lul-hair)" {...edge} />
          {lock("M23 45 C28 18 43 8 58 7 C48 18 43 32 42 51 C34 47 29 45 23 45Z", 0.72)}
          {lock("M60 39 C65 16 82 11 94 28 C83 26 74 33 70 45Z", 0.8)}
          {sep("M31 55 C25 82 27 105 34 124")}
          {sep("M89 55 C95 82 93 105 86 124")}
          {sh(43, 18, 16, 8)}
        </g>
      );
    case "bob":
      return (
        <g data-layer="hair">
          <path d="M22 53 C20 24 36 8 59 7 C82 7 99 23 98 53 C101 72 96 94 87 101 C80 105 77 98 80 88 C84 72 82 55 76 48 C67 43 54 42 44 48 C37 56 36 72 40 88 C43 98 40 105 33 101 C24 94 19 72 22 53Z" fill="url(#lul-hair)" {...edge} />
          {lock("M23 45 C28 19 43 9 58 8 C49 18 44 30 43 47 C35 44 29 44 23 45Z", 0.72)}
          {lock("M57 43 C63 18 82 13 94 30 C81 27 71 34 67 45Z", 0.78)}
          {sep("M29 57 C27 74 30 90 35 99")}
          {sep("M91 57 C93 74 90 90 85 99")}
          {sh(43, 18, 15, 7)}
        </g>
      );
    case "ponytail":
      return (
        <g data-layer="hair">
          <path d="M84 25 C105 23 114 38 111 56 C109 72 99 82 89 78 C97 70 99 62 96 54 C94 47 89 43 83 42Z" fill="url(#lul-hair)" {...edge} />
          <path d="M25 54 C24 28 38 11 59 8 C80 8 94 24 95 51 C88 45 82 43 75 44 C67 40 58 39 49 43 C40 41 32 46 25 54Z" fill="url(#lul-hair)" {...edge} />
          {lock("M28 43 C34 20 48 11 61 9 C52 20 48 31 48 43 C41 41 35 41 28 43Z", 0.65)}
          {sep("M91 32 C104 43 104 61 94 74")}
          {sh(43, 19, 15, 7)}
        </g>
      );
    case "pigtails":
      return (
        <g data-layer="hair">
          <path d="M24 55 C12 56 7 66 11 77 C15 87 27 88 33 79 C38 70 33 59 24 55Z" fill="url(#lul-hair)" {...edge} />
          <path d="M96 55 C108 56 113 66 109 77 C105 87 93 88 87 79 C82 70 87 59 96 55Z" fill="url(#lul-hair)" {...edge} />
          <path d="M24 54 C23 26 39 9 59 8 C81 8 97 26 96 54 C89 46 82 43 74 44 C68 40 63 39 60 40 C56 39 50 40 44 44 C36 43 30 47 24 54Z" fill="url(#lul-hair)" {...edge} />
          {centrePart}
          {lock("M26 44 C32 21 45 11 58 9 C50 20 47 31 47 43 C39 41 32 42 26 44Z", 0.64)}
          {sh(42, 18, 14, 7)}
        </g>
      );
    case "bun":
      return (
        <g data-layer="hair">
          <ellipse cx="60" cy="9" rx="13" ry="11" fill="url(#lul-hair)" {...edge} />
          {lock("M49 10 C52 1 64 -2 71 5 C65 5 58 9 54 15Z", 0.74)}
          <path d="M25 54 C24 27 39 11 59 9 C80 10 95 27 95 54 C88 46 81 43 73 44 C64 40 55 40 46 44 C37 43 30 47 25 54Z" fill="url(#lul-hair)" {...edge} />
          {lock("M28 43 C34 21 47 12 59 10 C51 20 48 31 48 43 C41 41 34 42 28 43Z", 0.64)}
          {sh(42, 21, 14, 7)}
        </g>
      );
    case "braids":
      return (
        <g data-layer="hair">
          {[24, 96].map((cx) => (
            <g key={cx}>
              {[58, 70, 82, 94, 106].map((cy, index) => (
                <ellipse key={cy} cx={cx} cy={cy} rx="7.5" ry="7" fill="url(#lul-hair-lock)" stroke={dk} strokeOpacity="0.24" strokeWidth="0.7" transform={`rotate(${index % 2 ? 18 : -18} ${cx} ${cy})`} />
              ))}
            </g>
          ))}
          <path d="M24 54 C23 26 39 9 59 8 C81 8 97 26 96 54 C89 46 82 43 74 44 C68 40 63 39 60 40 C56 39 50 40 44 44 C36 43 30 47 24 54Z" fill="url(#lul-hair)" {...edge} />
          {centrePart}
          {lock("M26 44 C32 21 45 11 58 9 C50 20 47 31 47 43 C39 41 32 42 26 44Z", 0.64)}
          {sh(42, 18, 14, 7)}
        </g>
      );
    default:
      return (
        <g data-layer="hair">
          {crop}
          {lock("M34 39 C38 17 52 8 67 10 C58 19 54 30 52 40Z", 0.82)}
          {sh(44, 20, 16, 8)}
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
          <path d="M24 42 C24 18 39 7 60 7 C81 7 96 19 96 42 C83 36 72 34 60 34 C47 34 36 36 24 42Z" fill="url(#lul-hat)" />
          <rect x="23" y="37" width="74" height="13" rx="6.5" fill="url(#lul-hat)" />
          <path d="M28 41 C47 37 73 37 92 41" stroke="#fff" strokeOpacity="0.2" strokeWidth="1.5" fill="none" />
          <circle cx="60" cy="6" r="5" fill={o.hatColor} />
          <circle cx="58.5" cy="4.5" r="1.7" fill="#fff" opacity="0.45" />
        </g>
      );
    case "cap":
      return (
        <g data-layer="hat">
          <path d="M24 42 C26 18 40 9 60 9 C80 9 94 20 96 42 C83 36 72 34 60 34 C47 34 36 36 24 42Z" fill="url(#lul-hat)" />
          <path d="M55 39 C78 36 99 39 108 46 C95 51 76 50 55 46Z" fill="url(#lul-hat-brim)" />
          <path d="M36 31 C50 24 69 24 83 31" stroke="#fff" strokeOpacity="0.2" strokeWidth="1.5" fill="none" />
          <path d="M60 10 V34" stroke="#000" strokeOpacity="0.12" strokeWidth="1.2" />
        </g>
      );
    case "explorer":
      return (
        <g data-layer="hat">
          <path d="M34 42 C35 17 46 9 60 9 C74 9 85 18 86 42Z" fill="url(#lul-hat)" />
          <ellipse cx="60" cy="43" rx="42" ry="9" fill="url(#lul-hat-brim)" />
          <path d="M35 35 H85" stroke={shade(o.hatColor, -0.35)} strokeWidth="6" opacity="0.72" />
          <ellipse cx="60" cy="43" rx="42" ry="9" fill="none" stroke="#000" strokeOpacity="0.16" strokeWidth="1" />
          <path d="M44 20 C53 15 67 15 76 20" stroke="#fff" strokeOpacity="0.18" strokeWidth="1.5" fill="none" />
        </g>
      );
    case "crown":
      return (
        <g data-layer="hat">
          <path d="M32 36 L39 12 L50 27 L60 8 L70 27 L81 12 L88 36Z" fill="url(#lul-crown)" />
          <rect x="31" y="33" width="58" height="9" rx="4" fill="#f59e0b" />
          <path d="M36 36 H84" stroke="#fff" strokeOpacity="0.32" strokeWidth="1.5" />
          <circle cx="60" cy="19" r="2.2" fill="#ef4444" />
          <circle cx="46" cy="23" r="1.6" fill="#38bdf8" />
          <circle cx="74" cy="23" r="1.6" fill="#38bdf8" />
        </g>
      );
    case "wizard":
      return (
        <g data-layer="hat">
          <path d="M61 -3 C57 10 49 23 39 39 C51 43 70 43 82 38 C72 24 67 10 61 -3Z" fill="url(#lul-hat)" />
          <path d="M34 39 C49 44 73 45 88 39 L91 47 C73 53 48 52 30 47Z" fill="url(#lul-hat-brim)" />
          <path d="M52 15 C58 12 64 13 69 17" stroke="#fff" strokeOpacity="0.18" strokeWidth="1.5" fill="none" />
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
          <linearGradient id="lul-hat" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={shade(o.hatColor, 0.38)} />
            <stop offset="48%" stopColor={o.hatColor} />
            <stop offset="100%" stopColor={shade(o.hatColor, -0.28)} />
          </linearGradient>
          <linearGradient id="lul-hat-brim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={shade(o.hatColor, 0.12)} />
            <stop offset="100%" stopColor={shade(o.hatColor, -0.38)} />
          </linearGradient>
          <linearGradient id="lul-crown" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff3a3" />
            <stop offset="50%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
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
