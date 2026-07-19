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
  | "spiky";
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

function HairLayer({ o }: { o: Outfit }) {
  // Hair FRAMES the face: it comes down the sides past the temples and the
  // fringe sits close to the brows (~y51), so there is no bald/receding
  // forehead. Dimension comes from a soft highlight blob, not scratchy lines.
  const s = o.hairShade;
  const gloss = <ellipse cx="46" cy="30" rx="15" ry="7.5" fill="#ffffff" opacity="0.1" transform="rotate(-14 46 30)" />;
  // A full head of hair: crown at y11, down both sides to ~y60, soft fringe ~y45.
  const crown = "M27 60 Q24 18 60 11 Q96 18 93 60 Q91 50 84 49 Q86 46 77 46 Q68 43 60 45 Q52 43 43 46 Q34 46 36 49 Q29 50 27 60 Z";

  switch (o.hairStyle) {
    case "buzz":
      return (
        <g data-layer="hair">
          <path d="M29 57 Q27 22 60 17 Q93 22 91 57 Q89 50 82 49 Q84 47 76 47 Q68 45 60 46 Q52 45 44 47 Q36 47 38 49 Q31 50 29 57 Z" fill="url(#lul-hair)" opacity="0.92" />
          <g fill={s} opacity="0.26">
            {[40, 50, 60, 70, 80].map((x) => <circle key={x} cx={x} cy="30" r="0.9" />)}
            {[35, 45, 55, 65, 75, 85].map((x) => <circle key={`a${x}`} cx={x} cy="38" r="0.9" />)}
            {[38, 50, 60, 72, 82].map((x) => <circle key={`b${x}`} cx={x} cy="46" r="0.8" />)}
          </g>
        </g>
      );
    case "short":
      return (
        <g data-layer="hair">
          <path d={crown} fill="url(#lul-hair)" />
          {gloss}
        </g>
      );
    case "sidepart":
      return (
        <g data-layer="hair">
          {/* full cap, fringe combed over to the right with a short side part */}
          <path d="M27 60 Q24 17 60 11 Q96 18 93 60 Q91 50 84 49 Q87 45 77 46 Q58 40 44 47 Q37 48 35 51 Q29 51 27 60 Z" fill="url(#lul-hair)" />
          <path d="M47 43 Q48 49 45 53" stroke={s} strokeWidth="1.6" strokeLinecap="round" opacity="0.35" fill="none" />
          {gloss}
        </g>
      );
    case "tuft":
      return (
        <g data-layer="hair">
          <path d={crown} fill="url(#lul-hair)" />
          <path d="M53 13 Q55 -1 68 9 Q62 8 59 14 Q64 14 65 19 Q58 15 53 13 Z" fill="url(#lul-hair)" />
          {gloss}
        </g>
      );
    case "spiky":
      return (
        <g data-layer="hair">
          {/* full base cap so the spikes do not look receding */}
          <path d="M28 58 Q26 32 60 28 Q94 32 92 58 Q90 50 84 49 Q86 46 77 47 Q68 44 60 46 Q52 44 43 47 Q34 46 36 49 Q30 50 28 58 Z" fill="url(#lul-hair)" />
          <path d="M30 36 L35 15 L43 32 L49 11 L56 30 L60 8 L64 30 L71 11 L77 32 L85 15 L90 36 Q60 26 30 36 Z" fill="url(#lul-hair)" />
          {gloss}
        </g>
      );
    case "curls":
      return (
        <g data-layer="hair">
          {/* full bumpy curl mass that frames the whole head */}
          <path d="M25 56 Q19 50 23 42 Q19 33 28 29 Q24 19 37 18 Q37 8 49 12 Q53 3 60 7 Q67 3 71 12 Q83 8 83 18 Q96 19 92 29 Q101 33 97 42 Q101 50 95 56 Q93 49 86 48 Q90 39 80 40 Q86 29 60 27 Q34 29 40 40 Q30 39 34 48 Q27 49 25 56 Z" fill="url(#lul-hair)" />
          <g fill="#ffffff" opacity="0.1">
            <circle cx="40" cy="24" r="4.4" /><circle cx="56" cy="17" r="4.8" /><circle cx="72" cy="21" r="4.4" />
            <circle cx="31" cy="37" r="3.8" /><circle cx="88" cy="36" r="3.8" /><circle cx="49" cy="30" r="3.6" /><circle cx="68" cy="31" r="3.6" />
          </g>
          <g fill={s} opacity="0.22">
            <circle cx="48" cy="22" r="2" /><circle cx="64" cy="20" r="2" /><circle cx="60" cy="30" r="2" />
          </g>
        </g>
      );
    case "afro":
      return (
        <g data-layer="hair">
          <path d="M24 50 Q15 42 19 30 Q17 17 30 14 Q34 5 46 8 Q52 1 60 5 Q68 1 74 8 Q86 5 90 14 Q103 17 101 30 Q105 42 96 50 Q98 62 85 66 Q88 47 80 39 Q86 29 60 27 Q34 29 40 39 Q32 47 35 66 Q22 62 24 50 Z" fill="url(#lul-hair)" />
          <g fill="#ffffff" opacity="0.09">
            <circle cx="34" cy="22" r="5" /><circle cx="50" cy="13" r="5.2" /><circle cx="70" cy="13" r="5.2" /><circle cx="86" cy="22" r="5" />
            <circle cx="25" cy="40" r="4.4" /><circle cx="95" cy="40" r="4.4" /><circle cx="60" cy="11" r="5.2" />
          </g>
          <g fill={s} opacity="0.18">
            <circle cx="42" cy="20" r="2.4" /><circle cx="60" cy="22" r="2.4" /><circle cx="78" cy="20" r="2.4" />
          </g>
        </g>
      );
    case "long":
      return (
        <g data-layer="hair">
          {/* long side lengths falling past the shoulders */}
          <path d="M26 50 Q13 82 19 112 Q22 122 33 118 Q28 98 40 66 Z" fill="url(#lul-hair)" />
          <path d="M94 50 Q107 82 101 112 Q98 122 87 118 Q92 98 80 66 Z" fill="url(#lul-hair)" />
          {/* full crown + fringe */}
          <path d="M25 60 Q22 14 60 9 Q98 14 95 60 Q92 50 84 49 Q86 46 77 47 Q66 43 60 45 Q54 43 43 47 Q34 46 36 49 Q28 50 25 60 Z" fill="url(#lul-hair)" />
          {gloss}
        </g>
      );
    case "bob":
      return (
        <g data-layer="hair">
          {/* chin-length bob with inward-curling tips + a full fringe */}
          <path d="M25 54 Q23 14 60 9 Q97 14 95 54 Q96 79 86 97 Q80 99 79 92 Q85 74 83 58 Q84 47 74 45 Q66 42 60 44 Q54 42 46 45 Q36 47 37 58 Q35 74 41 92 Q40 99 34 97 Q24 79 25 54 Z" fill="url(#lul-hair)" />
          {gloss}
        </g>
      );
    case "ponytail":
      return (
        <g data-layer="hair">
          {/* pulled-back tail with tie */}
          <path d="M84 24 Q108 30 106 58 Q105 82 88 80 Q101 68 98 50 Q101 40 82 40 Z" fill="url(#lul-hair)" />
          {/* full pulled-back crown with a touch of fringe */}
          <path d="M27 58 Q24 14 60 9 Q96 14 92 47 Q90 48 84 47 Q86 45 78 45 Q68 42 60 44 Q52 42 43 46 Q34 46 36 49 Q29 50 27 58 Z" fill="url(#lul-hair)" />
          <path d="M80 45 Q86 48 85 53 Q80 51 77 50 Z" fill={s} />
          {gloss}
        </g>
      );
    case "pigtails":
      return (
        <g data-layer="hair">
          {/* two low bunches with wavy tips + ties */}
          <path d="M25 48 Q9 52 12 74 Q14 90 27 85 Q19 78 25 72 Q17 86 29 81 Q30 66 34 56 Z" fill="url(#lul-hair)" />
          <path d="M95 48 Q111 52 108 74 Q106 90 93 85 Q101 78 95 72 Q103 86 91 81 Q90 66 86 56 Z" fill="url(#lul-hair)" />
          <path d={crown} fill="url(#lul-hair)" />
          <path d="M60 12 Q60 24 60 34" stroke={s} strokeWidth="1.4" opacity="0.45" fill="none" />
          <circle cx="29" cy="52" r="3" fill={s} />
          <circle cx="91" cy="52" r="3" fill={s} />
        </g>
      );
    case "bun":
      return (
        <g data-layer="hair">
          {/* smooth pulled-up crown */}
          <path d="M27 58 Q24 15 60 9 Q96 15 93 58 Q91 50 84 49 Q86 47 78 47 Q68 44 60 46 Q52 44 42 47 Q34 47 36 49 Q29 50 27 58 Z" fill="url(#lul-hair)" />
          <circle cx="60" cy="9" r="10.5" fill="url(#lul-hair)" />
          <path d="M52 6 Q60 1 68 6" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1.6" fill="none" />
          {gloss}
        </g>
      );
    case "braids":
      return (
        <g data-layer="hair">
          {[
            [24, 30],
            [96, 90],
          ].map(([xOuter, xInner], side) => {
            const cx = (xOuter + xInner) / 2;
            return (
              <g key={side}>
                {[58, 70, 82, 94, 106].map((y, i) => (
                  <ellipse key={y} cx={cx} cy={y} rx="7.5" ry="7" fill="url(#lul-hair)" transform={`rotate(${i % 2 === 0 ? -18 : 18} ${cx} ${y})`} />
                ))}
                <path d={`M${cx - 4} 112 Q${cx} 120 ${cx + 4} 112`} fill="url(#lul-hair)" />
              </g>
            );
          })}
          <path d={crown} fill="url(#lul-hair)" />
          <path d="M60 12 Q60 24 60 34" stroke={s} strokeWidth="1.4" opacity="0.45" fill="none" />
        </g>
      );
    default: // swept
      return (
        <g data-layer="hair">
          {/* full cap with the fringe swept across to one side */}
          <path d="M26 60 Q22 15 53 10 Q82 6 94 31 Q98 45 94 60 Q92 50 84 49 Q87 45 78 46 Q63 41 47 48 Q40 51 37 53 Q40 45 45 41 Q34 43 30 51 Q27 53 26 60 Z" fill="url(#lul-hair)" />
          {gloss}
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

  // Source viewBox is 120 × 220 — keep aspect when scaling by height.
  const width = Math.round((height * 120) / 220);

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
