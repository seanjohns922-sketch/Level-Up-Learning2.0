"use client";

import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import { ACTIVE_STUDENT_KEY } from "@/data/progress";

// Every avatar instance gets a unique gradient-id prefix. Duplicate SVG ids
// across the many avatars on a page (e.g. wardrobe thumbnails) are invalid and
// make iOS Safari drop paint-server fills — the hair renders bald. Each layer
// reads its prefix from this context so nothing has to be threaded by hand.
const GradientIdContext = createContext("");
const useGradPrefix = () => useContext(GradientIdContext);

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
const Hands = () => {
  const p = useGradPrefix();
  return (
    <>
      <circle cx="24" cy="156" r="7.5" fill={`url(#${p}lul-skin)`} />
      <circle cx="96" cy="156" r="7.5" fill={`url(#${p}lul-skin)`} />
    </>
  );
};
function LongSleeves({ o, cuff }: { o: Outfit; cuff?: boolean }) {
  const p = useGradPrefix();
  return (
    <g>
      <path d="M22 100 Q14 112 18 150 Q24 158 32 154 Q34 128 34 108 Z" fill={`url(#${p}lul-shirt)`} />
      <path d="M98 100 Q106 112 102 150 Q96 158 88 154 Q86 128 86 108 Z" fill={`url(#${p}lul-shirt)`} />
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
  const p = useGradPrefix();
  return (
    <g>
      {/* bare skin forearms */}
      <path d="M26 112 Q19 126 23 150 Q28 158 34 154 Q35 132 36 116 Z" fill={`url(#${p}lul-skin)`} />
      <path d="M94 112 Q101 126 97 150 Q92 158 86 154 Q85 132 84 116 Z" fill={`url(#${p}lul-skin)`} />
      <Hands />
      {/* sleeve caps */}
      <path d="M28 99 Q41 97 40 114 Q33 119 25 115 Q23 103 28 99 Z" fill={`url(#${p}lul-shirt)`} />
      <path d="M92 99 Q79 97 80 114 Q87 119 95 115 Q97 103 92 99 Z" fill={`url(#${p}lul-shirt)`} />
    </g>
  );
}
const TORSO = "M32 100 Q60 92 88 100 L93 156 Q60 167 27 156 Z";
const crewNeck = (p: string) => <path d="M51 99 Q60 106 69 99 Q60 103 51 99 Z" fill={`url(#${p}lul-skin)`} />;

// ── Lower body (Bottom slot) ────────────────────────────────────────────────
function skinLegs(fromY: number, p: string) {
  return (
    <>
      <path d={`M45 ${fromY} L42 199 L53 199 L54 ${fromY} Z`} fill={`url(#${p}lul-skin)`} />
      <path d={`M75 ${fromY} L78 199 L67 199 L66 ${fromY} Z`} fill={`url(#${p}lul-skin)`} />
    </>
  );
}
function BottomLayer({ o, style }: { o: Outfit; style: BottomStyle }) {
  const p = useGradPrefix();
  const waistband = <path d="M38 148 Q60 154 82 148 L82 157 Q60 163 38 157 Z" fill="#000" opacity="0.28" />;
  switch (style) {
    case "shorts":
      return (
        <g data-layer="pants">
          {skinLegs(176, p)}
          <path d="M39 150 L36 178 L57 178 L58 162 Z" fill={`url(#${p}lul-pants)`} />
          <path d="M81 150 L84 178 L63 178 L62 162 Z" fill={`url(#${p}lul-pants)`} />
          {waistband}
        </g>
      );
    case "jeans":
      return (
        <g data-layer="pants">
          <path d="M39 150 L37 200 L55 200 L57 160 Z" fill={`url(#${p}lul-pants)`} />
          <path d="M81 150 L83 200 L65 200 L63 160 Z" fill={`url(#${p}lul-pants)`} />
          {waistband}
          <line x1="60" y1="158" x2="60" y2="200" stroke="#000" strokeOpacity="0.22" strokeWidth="1" />
          <path d="M39 196 L55 196" stroke="#fff" strokeOpacity="0.2" strokeWidth="2" />
          <path d="M65 196 L83 196" stroke="#fff" strokeOpacity="0.2" strokeWidth="2" />
        </g>
      );
    case "trackpants":
      return (
        <g data-layer="pants">
          <path d="M40 150 L34 200 L56 200 L58 168 Z" fill={`url(#${p}lul-pants)`} />
          <path d="M80 150 L86 200 L64 200 L62 168 Z" fill={`url(#${p}lul-pants)`} />
          {waistband}
          <path d="M41 152 L37 199" stroke={o.shirtTrim} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M79 152 L83 199" stroke={o.shirtTrim} strokeWidth="2.4" strokeLinecap="round" />
        </g>
      );
    case "skirt":
      return (
        <g data-layer="pants">
          {skinLegs(172, p)}
          <path d="M37 148 Q60 155 83 148 L93 184 Q60 195 27 184 Z" fill={`url(#${p}lul-pants)`} />
          <line x1="50" y1="156" x2="43" y2="181" stroke="#000" strokeOpacity="0.10" strokeWidth="1.4" />
          <line x1="60" y1="158" x2="60" y2="183" stroke="#000" strokeOpacity="0.10" strokeWidth="1.4" />
          <line x1="70" y1="156" x2="77" y2="181" stroke="#000" strokeOpacity="0.10" strokeWidth="1.4" />
          <path d="M27 184 Q60 195 93 184" stroke={shade(o.pants, 0.25)} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
      );
    case "leggings":
      return (
        <g data-layer="pants">
          <path d="M44 150 L42 200 L53 200 L54 168 Z" fill={`url(#${p}lul-pants)`} />
          <path d="M76 150 L78 200 L67 200 L66 168 Z" fill={`url(#${p}lul-pants)`} />
          {waistband}
        </g>
      );
    default: // joggers
      return (
        <g data-layer="pants">
          <path d="M40 150 L34 200 L56 200 L58 168 Z" fill={`url(#${p}lul-pants)`} />
          <path d="M80 150 L86 200 L64 200 L62 168 Z" fill={`url(#${p}lul-pants)`} />
          {waistband}
          <line x1="60" y1="158" x2="60" y2="200" stroke="#000" strokeOpacity="0.25" strokeWidth="1" />
        </g>
      );
  }
}

// ── Torso (Top slot). "dress" also renders its own skirt. ───────────────────
function TopLayer({ o }: { o: Outfit }) {
  const p = useGradPrefix();
  switch (o.top) {
    case "tshirt":
      return (
        <g data-layer="shirt">
          <ShortSleeves />
          <path d={TORSO} fill={`url(#${p}lul-shirt)`} />
          {crewNeck(p)}
          <path d="M51 99 Q60 105 69 99" stroke={o.shirtTrim} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M33 108 Q34 136 30 156" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2.6" fill="none" />
        </g>
      );
    case "jumper":
      return (
        <g data-layer="shirt">
          <LongSleeves o={o} cuff />
          <path d={TORSO} fill={`url(#${p}lul-shirt)`} />
          {crewNeck(p)}
          <path d="M50 100 Q60 108 70 100" stroke={o.shirtTrim} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M28 154 Q60 164 92 154 L92 160 Q60 170 28 160 Z" fill={o.shirtTrim} opacity="0.9" />
        </g>
      );
    case "polo":
      return (
        <g data-layer="shirt">
          <ShortSleeves />
          <path d={TORSO} fill={`url(#${p}lul-shirt)`} />
          {crewNeck(p)}
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
          <path d={TORSO} fill={`url(#${p}lul-shirt)`} />
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
          <path d="M24 102 Q16 114 20 150 Q26 158 33 154 Q35 128 35 110 Z" fill={`url(#${p}lul-shirt)`} />
          <path d="M96 102 Q104 114 100 150 Q94 158 87 154 Q85 128 85 110 Z" fill={`url(#${p}lul-shirt)`} />
          <Hands />
          <ellipse cx="33" cy="105" rx="9.5" ry="8.5" fill={`url(#${p}lul-shirt)`} />
          <ellipse cx="87" cy="105" rx="9.5" ry="8.5" fill={`url(#${p}lul-shirt)`} />
          <ellipse cx="33" cy="104" rx="9.5" ry="8.5" fill="#ffffff" opacity="0.08" />
          <ellipse cx="87" cy="104" rx="9.5" ry="8.5" fill="#ffffff" opacity="0.08" />
          <path d="M34 100 Q60 94 86 100 L82 150 Q60 156 38 150 Z" fill={`url(#${p}lul-shirt)`} />
          <path d="M49 99 Q60 111 71 99 Q66 104 60 104 Q54 104 49 99 Z" fill={o.shirtTrim} />
          <path d="M38 145 Q60 151 82 145 L82 152 Q60 158 38 152 Z" fill={o.shirtTrim} opacity="0.95" />
          <path d="M37 150 Q60 157 83 150 L94 187 Q60 198 26 187 Z" fill={`url(#${p}lul-shirt)`} />
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
          <path d={TORSO} fill={`url(#${p}lul-shirt)`} />
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
  const p = useGradPrefix();
  switch (o.shoeStyle) {
    case "boots":
      return (
        <g data-layer="shoes">
          {/* tall ankle boots, one per foot with a clear gap */}
          <path d="M34 181 Q46 179 57 182 L58 206 Q58 213 51 213 L38 213 Q33 213 33 207 L33 188 Q33 183 34 181 Z" fill={`url(#${p}lul-shoe)`} />
          <path d="M86 181 Q74 179 63 182 L62 206 Q62 213 69 213 L82 213 Q87 213 87 207 L87 188 Q87 183 86 181 Z" fill={`url(#${p}lul-shoe)`} />
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
          <path d="M32 195 Q32 190 40 190 L58 190 Q60 196 60 208 Q60 213 55 213 L34 213 Q30 213 30 208 Z" fill={`url(#${p}lul-shoe)`} />
          <path d="M88 195 Q88 190 80 190 L62 190 Q60 196 60 208 Q60 213 65 213 L86 213 Q90 213 90 208 Z" fill={`url(#${p}lul-shoe)`} />
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
          <path d="M37 200 Q35 208 41 210 L56 210 Q59 210 59 206 L58 200 Z" fill={`url(#${p}lul-skin)`} />
          <path d="M83 200 Q85 208 79 210 L64 210 Q61 210 61 206 L62 200 Z" fill={`url(#${p}lul-skin)`} />
          {/* thin soles */}
          <rect x="35" y="209" width="25" height="3.6" rx="1.8" fill={`url(#${p}lul-shoe)`} />
          <rect x="60" y="209" width="25" height="3.6" rx="1.8" fill={`url(#${p}lul-shoe)`} />
          {/* Y straps */}
          <path d="M40 203 L54 203" stroke={`url(#${p}lul-shoe)`} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M47 200 L48 208" stroke={`url(#${p}lul-shoe)`} strokeWidth="2" strokeLinecap="round" />
          <path d="M66 203 L80 203" stroke={`url(#${p}lul-shoe)`} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M73 200 L72 208" stroke={`url(#${p}lul-shoe)`} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    default: // sneakers
      return (
        <g data-layer="shoes">
          <path d="M30 206 Q30 198 42 198 L58 198 Q60 204 60 210 Q60 214 56 214 L32 214 Q28 214 28 210 Z" fill={`url(#${p}lul-shoe)`} />
          <path d="M90 206 Q90 198 78 198 L62 198 Q60 204 60 210 Q60 214 64 214 L88 214 Q92 214 92 210 Z" fill={`url(#${p}lul-shoe)`} />
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

// Hair silhouettes are designed to be *instantly* distinct at wardrobe
// thumbnail size. Every style has its own outer shape rather than the same
// dome + variations of a tuft. Head arc runs roughly cx=60, from y≈18 (crown)
// down to y≈62 (temples). Face reads at y≈52–74.
function HairLayer({ o }: { o: Outfit }) {
  const p = useGradPrefix();
  const dk = o.hairShade;
  const edge = { stroke: dk, strokeWidth: 0.9, strokeOpacity: 0.32, strokeLinejoin: "round" as const };
  const sh = (cx: number, cy: number, rx: number, ry: number, rot = -22) => (
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${p}lul-hair-sheen)`} transform={`rotate(${rot} ${cx} ${cy})`} />
  );

  switch (o.hairStyle) {
    // ── BALD — visible scalp, subtle sheen ─────────────────────────────────
    case "bald":
      return (
        <g data-layer="hair">
          <ellipse cx="54" cy="30" rx="16" ry="8" fill="#ffffff" opacity="0.14" transform="rotate(-18 54 30)" />
        </g>
      );

    // ── BUZZ — very close crop, hugs skull, stubble dots ───────────────────
    case "buzz":
      return (
        <g data-layer="hair">
          <path d="M33 50 Q33 22 60 22 Q87 22 87 50 Q80 44 60 44 Q40 44 33 50Z" fill={o.hair} opacity="0.85" {...edge} />
          <g fill={dk} opacity="0.35">
            {[38, 46, 54, 62, 70, 78].map((x) => <circle key={`s1-${x}`} cx={x} cy="30" r="0.7" />)}
            {[36, 44, 52, 60, 68, 76, 84].map((x) => <circle key={`s2-${x}`} cx={x} cy="38" r="0.7" />)}
          </g>
          {sh(50, 28, 14, 5)}
        </g>
      );

    // ── SHORT — neat rounded crop, high hairline, forehead visible ─────────
    case "short":
      return (
        <g data-layer="hair">
          <path d="M31 52 Q31 20 60 20 Q89 20 89 52 Q87 48 84 46 Q82 42 76 42 Q68 39 60 40 Q52 39 44 42 Q38 42 36 46 Q33 48 31 52Z" fill={`url(#${p}lul-hair)`} {...edge} />
          <path d="M36 46 Q60 40 84 46" stroke={dk} strokeWidth="0.9" strokeOpacity="0.35" fill="none" />
          {sh(46, 30, 18, 7)}
        </g>
      );

    // ── SWEPT — long side-swept fringe crossing the forehead ───────────────
    case "swept":
      return (
        <g data-layer="hair">
          <path d="M30 54 Q28 22 58 18 Q88 16 92 46 Q90 40 86 40 Q78 30 66 30 Q52 28 42 34 Q34 38 30 54Z" fill={`url(#${p}lul-hair)`} {...edge} />
          {/* the sweep: heavy fringe from right temple down to left brow */}
          <path d="M86 30 Q80 48 62 54 Q46 58 34 52 Q30 48 30 44 Q40 34 56 32 Q74 30 86 30Z" fill={`url(#${p}lul-hair-lock)`} {...edge} />
          <path d="M60 32 Q48 42 36 50" stroke={dk} strokeWidth="0.9" strokeOpacity="0.4" fill="none" />
          {sh(64, 34, 20, 6, -18)}
        </g>
      );

    // ── SIDEPART — clear parting line, hair swept both ways from part ──────
    case "sidepart":
      return (
        <g data-layer="hair">
          <path d="M31 52 Q31 20 60 20 Q89 20 89 52 Q84 46 76 44 Q66 40 60 40 Q54 40 46 44 Q38 46 31 52Z" fill={`url(#${p}lul-hair)`} {...edge} />
          {/* short side (student's right, viewer left) */}
          <path d="M31 52 Q31 30 46 22 Q40 32 40 44 Q35 46 31 52Z" fill={`url(#${p}lul-hair-lock)`} opacity="0.85" {...edge} />
          {/* long side (viewer right) sweeps across forehead */}
          <path d="M50 22 Q76 20 89 40 Q86 46 78 46 Q66 42 56 46 Q50 42 50 22Z" fill={`url(#${p}lul-hair-lock)`} {...edge} />
          {/* the part */}
          <path d="M48 22 Q48 32 50 44" stroke={dk} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" fill="none" />
          {sh(66, 30, 14, 5)}
        </g>
      );

    // ── TUFT — clean crop with a single cowlick sticking up centre-front ───
    case "tuft":
      return (
        <g data-layer="hair">
          <path d="M32 52 Q32 24 60 22 Q88 24 88 52 Q84 46 76 44 Q68 40 60 41 Q52 40 44 44 Q36 46 32 52Z" fill={`url(#${p}lul-hair)`} {...edge} />
          {/* the tuft */}
          <path d="M52 24 Q56 8 62 6 Q64 12 62 18 Q68 14 72 16 Q70 24 60 30 Q54 28 52 24Z" fill={`url(#${p}lul-hair-lock)`} {...edge} />
          {sh(46, 30, 14, 6)}
        </g>
      );

    // ── SPIKY — multiple prominent spikes across the crown ─────────────────
    case "spiky":
      return (
        <g data-layer="hair">
          <path d="M32 52 Q32 30 60 28 Q88 30 88 52 Q84 46 76 44 Q66 40 60 41 Q54 40 44 44 Q36 46 32 52Z" fill={`url(#${p}lul-hair)`} {...edge} />
          <g fill={`url(#${p}lul-hair-lock)`} stroke={dk} strokeOpacity="0.35" strokeWidth="0.7" strokeLinejoin="round">
            <path d="M34 32 L38 10 L44 30Z" />
            <path d="M42 30 L48 6 L54 30Z" />
            <path d="M52 30 L58 4 L64 30Z" />
            <path d="M62 30 L68 6 L74 30Z" />
            <path d="M72 30 L78 10 L84 32Z" />
          </g>
        </g>
      );

    // ── CURLS — bumpy scalloped surface all over the crown ─────────────────
    case "curls":
      return (
        <g data-layer="hair">
          <path d="M28 55 Q26 26 60 20 Q94 26 92 55 Q86 48 78 46 Q68 42 60 43 Q52 42 42 46 Q34 48 28 55Z" fill={`url(#${p}lul-hair)`} {...edge} />
          <g fill={`url(#${p}lul-hair-lock)`} stroke={dk} strokeOpacity="0.28" strokeWidth="0.7">
            {[[32, 42, 6], [38, 30, 7], [46, 22, 7], [54, 18, 7], [62, 17, 7], [70, 19, 7], [78, 24, 7], [85, 32, 7], [88, 42, 6], [42, 42, 6], [52, 38, 6], [64, 36, 6], [76, 40, 6]].map(([cx, cy, r]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
            ))}
          </g>
          <g fill="#ffffff" opacity="0.25"><circle cx="52" cy="16" r="1.8" /><circle cx="64" cy="15" r="2" /></g>
        </g>
      );

    // ── AFRO — huge round poof extending well beyond the head silhouette ───
    case "afro":
      return (
        <g data-layer="hair">
          <circle cx="60" cy="34" r="30" fill={`url(#${p}lul-hair)`} {...edge} />
          <path d="M32 44 Q60 40 88 44 Q82 46 76 46 Q68 42 60 43 Q52 42 44 46 Q38 46 32 44Z" fill={`url(#${p}lul-hair-lock)`} opacity="0.9" />
          <g fill={dk} opacity="0.25">
            {[[42, 20], [52, 12], [64, 10], [76, 16], [84, 26], [36, 32], [88, 38], [50, 22], [70, 20], [58, 26]].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.2" />
            ))}
          </g>
          <g fill="#ffffff" opacity="0.22"><circle cx="50" cy="16" r="2.4" /><circle cx="66" cy="14" r="2.6" /></g>
        </g>
      );

    // ── LONG — long straight hair falling well below the shoulders ─────────
    case "long":
      return (
        <g data-layer="hair">
          {/* back curtain behind body */}
          <path d="M22 46 Q16 90 26 140 L44 140 Q40 90 44 50Z" fill={`url(#${p}lul-hair)`} {...edge} />
          <path d="M98 46 Q104 90 94 140 L76 140 Q80 90 76 50Z" fill={`url(#${p}lul-hair)`} {...edge} />
          {/* crown + fringe */}
          <path d="M26 54 Q24 22 60 18 Q96 22 94 54 Q86 44 78 42 Q68 38 60 40 Q52 38 42 42 Q34 44 26 54Z" fill={`url(#${p}lul-hair)`} {...edge} />
          {/* soft parted fringe */}
          <path d="M40 40 Q54 36 60 42 Q66 36 80 40 Q74 48 60 48 Q46 48 40 40Z" fill={`url(#${p}lul-hair-lock)`} opacity="0.9" />
          <path d="M60 42 Q60 60 60 88" stroke={dk} strokeWidth="0.8" strokeOpacity="0.35" fill="none" />
          {sh(48, 28, 18, 7)}
        </g>
      );

    // ── BOB — chin-length straight bob framing the jaw ─────────────────────
    case "bob":
      return (
        <g data-layer="hair">
          <path d="M24 52 Q22 22 60 18 Q98 22 96 52 L98 88 Q92 96 84 92 L82 60 Q76 46 60 46 Q44 46 38 60 L36 92 Q28 96 22 88Z" fill={`url(#${p}lul-hair)`} {...edge} />
          <path d="M38 44 Q54 40 60 46 Q66 40 82 44 Q74 52 60 52 Q46 52 38 44Z" fill={`url(#${p}lul-hair-lock)`} opacity="0.9" />
          {sh(48, 28, 18, 7)}
        </g>
      );

    // ── PONYTAIL — hair pulled back tight, ponytail visible on left side ───
    case "ponytail":
      return (
        <g data-layer="hair">
          {/* the pony hanging behind on the viewer's left */}
          <path d="M20 34 Q6 46 8 74 Q12 92 22 92 Q24 76 22 60 Q26 46 34 40Z" fill={`url(#${p}lul-hair)`} {...edge} />
          <path d="M14 40 Q10 60 14 80" stroke={dk} strokeWidth="0.9" strokeOpacity="0.4" fill="none" />
          {/* slick-back crown */}
          <path d="M30 52 Q30 22 60 20 Q90 22 90 52 Q84 44 76 42 Q68 38 60 40 Q52 38 44 42 Q36 44 30 52Z" fill={`url(#${p}lul-hair)`} {...edge} />
          {/* hair tie */}
          <ellipse cx="30" cy="40" rx="5" ry="4" fill={shade(o.hair, -0.3)} {...edge} />
          {sh(52, 28, 18, 6)}
        </g>
      );

    // ── PIGTAILS — two visible pigtails hanging on both sides ──────────────
    case "pigtails":
      return (
        <g data-layer="hair">
          <path d="M18 44 Q10 60 14 84 Q20 92 28 88 Q26 74 26 62 Q28 52 32 46Z" fill={`url(#${p}lul-hair)`} {...edge} />
          <path d="M102 44 Q110 60 106 84 Q100 92 92 88 Q94 74 94 62 Q92 52 88 46Z" fill={`url(#${p}lul-hair)`} {...edge} />
          <path d="M26 54 Q26 20 60 18 Q94 20 94 54 Q86 46 78 44 Q68 40 60 41 Q52 40 42 44 Q34 46 26 54Z" fill={`url(#${p}lul-hair)`} {...edge} />
          <path d="M60 20 Q59 32 60 42" stroke={dk} strokeWidth="1.2" strokeOpacity="0.55" fill="none" />
          <ellipse cx="22" cy="48" rx="5" ry="4" fill={shade(o.hair, -0.3)} {...edge} />
          <ellipse cx="98" cy="48" rx="5" ry="4" fill={shade(o.hair, -0.3)} {...edge} />
          {sh(48, 30, 16, 6)}
        </g>
      );

    // ── BUN — prominent top-knot bun sitting above the head ────────────────
    case "bun":
      return (
        <g data-layer="hair">
          {/* the bun */}
          <ellipse cx="60" cy="8" rx="14" ry="12" fill={`url(#${p}lul-hair)`} {...edge} />
          <path d="M50 4 Q60 -2 70 4" stroke={dk} strokeWidth="0.9" strokeOpacity="0.45" fill="none" />
          <ellipse cx="60" cy="20" rx="10" ry="4" fill={shade(o.hair, -0.3)} {...edge} />
          {/* slicked-back crown */}
          <path d="M28 54 Q28 24 60 22 Q92 24 92 54 Q84 46 76 44 Q68 40 60 41 Q52 40 44 44 Q36 46 28 54Z" fill={`url(#${p}lul-hair)`} {...edge} />
          {sh(50, 32, 18, 6)}
        </g>
      );

    // ── BRAIDS — two long braids down the front of the chest ───────────────
    case "braids":
      return (
        <g data-layer="hair">
          <path d="M26 54 Q26 22 60 20 Q94 22 94 54 Q86 46 78 44 Q68 40 60 41 Q52 40 42 44 Q34 46 26 54Z" fill={`url(#${p}lul-hair)`} {...edge} />
          <path d="M60 22 Q59 34 60 44" stroke={dk} strokeWidth="1.4" strokeOpacity="0.5" fill="none" />
          {/* two braids hanging in front */}
          {[26, 94].map((cx) => (
            <g key={cx}>
              {[54, 66, 78, 90, 102, 114].map((cy, i) => (
                <ellipse
                  key={cy}
                  cx={cx + (i % 2 ? 2 : -2)}
                  cy={cy}
                  rx="6.5"
                  ry="6"
                  fill={`url(#${p}lul-hair-lock)`}
                  stroke={dk}
                  strokeOpacity="0.32"
                  strokeWidth="0.7"
                  transform={`rotate(${i % 2 ? 18 : -18} ${cx} ${cy})`}
                />
              ))}
              <path d={`M${cx - 3} 118 Q${cx} 124 ${cx + 3} 118`} fill={shade(o.hair, -0.3)} />
            </g>
          ))}
          {sh(48, 30, 16, 6)}
        </g>
      );

    default:
      return (
        <g data-layer="hair">
          <path d="M31 52 Q31 22 60 20 Q89 22 89 52 Q84 46 76 44 Q68 40 60 41 Q52 40 44 44 Q36 46 31 52Z" fill={`url(#${p}lul-hair)`} {...edge} />
          {sh(46, 30, 18, 7)}
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
  const p = useGradPrefix();
  switch (o.hat) {
    case "beanie":
      return (
        <g data-layer="hat">
          <path d="M24 42 C24 18 39 7 60 7 C81 7 96 19 96 42 C83 36 72 34 60 34 C47 34 36 36 24 42Z" fill={`url(#${p}lul-hat)`} />
          <rect x="23" y="37" width="74" height="13" rx="6.5" fill={`url(#${p}lul-hat)`} />
          <path d="M28 41 C47 37 73 37 92 41" stroke="#fff" strokeOpacity="0.2" strokeWidth="1.5" fill="none" />
          <circle cx="60" cy="6" r="5" fill={o.hatColor} />
          <circle cx="58.5" cy="4.5" r="1.7" fill="#fff" opacity="0.45" />
        </g>
      );
    case "cap":
      return (
        <g data-layer="hat">
          <path d="M24 42 C26 18 40 9 60 9 C80 9 94 20 96 42 C83 36 72 34 60 34 C47 34 36 36 24 42Z" fill={`url(#${p}lul-hat)`} />
          <path d="M55 39 C78 36 99 39 108 46 C95 51 76 50 55 46Z" fill={`url(#${p}lul-hat-brim)`} />
          <path d="M36 31 C50 24 69 24 83 31" stroke="#fff" strokeOpacity="0.2" strokeWidth="1.5" fill="none" />
          <path d="M60 10 V34" stroke="#000" strokeOpacity="0.12" strokeWidth="1.2" />
        </g>
      );
    case "explorer":
      return (
        <g data-layer="hat">
          <path d="M34 42 C35 17 46 9 60 9 C74 9 85 18 86 42Z" fill={`url(#${p}lul-hat)`} />
          <ellipse cx="60" cy="43" rx="42" ry="9" fill={`url(#${p}lul-hat-brim)`} />
          <path d="M35 35 H85" stroke={shade(o.hatColor, -0.35)} strokeWidth="6" opacity="0.72" />
          <ellipse cx="60" cy="43" rx="42" ry="9" fill="none" stroke="#000" strokeOpacity="0.16" strokeWidth="1" />
          <path d="M44 20 C53 15 67 15 76 20" stroke="#fff" strokeOpacity="0.18" strokeWidth="1.5" fill="none" />
        </g>
      );
    case "crown":
      return (
        <g data-layer="hat">
          <path d="M32 36 L39 12 L50 27 L60 8 L70 27 L81 12 L88 36Z" fill={`url(#${p}lul-crown)`} />
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
          <path d="M61 -3 C57 10 49 23 39 39 C51 43 70 43 82 38 C72 24 67 10 61 -3Z" fill={`url(#${p}lul-hat)`} />
          <path d="M34 39 C49 44 73 45 88 39 L91 47 C73 53 48 52 30 47Z" fill={`url(#${p}lul-hat-brim)`} />
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

  // Unique per-instance prefix for all SVG gradient ids (see GradientIdContext).
  const p = `a${useId().replace(/[^a-zA-Z0-9]/g, "")}-`;

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
        <GradientIdContext.Provider value={p}>
        <defs>
          <linearGradient id={`${p}lul-skin`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={o.skin} />
            <stop offset="100%" stopColor={o.skinShade} />
          </linearGradient>
          <linearGradient id={`${p}lul-shirt`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={o.shirt} />
            <stop offset="100%" stopColor={o.shirt} stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id={`${p}lul-hair`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={shade(o.hair, 0.36)} />
            <stop offset="45%" stopColor={o.hair} />
            <stop offset="100%" stopColor={o.hairShade} />
          </linearGradient>
          <linearGradient id={`${p}lul-hair-lock`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={shade(o.hair, 0.52)} />
            <stop offset="42%" stopColor={shade(o.hair, 0.18)} />
            <stop offset="100%" stopColor={o.hairShade} />
          </linearGradient>
          <radialGradient id={`${p}lul-hair-sheen`} cx="0.4" cy="0.28" r="0.5">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${p}lul-hat`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={shade(o.hatColor, 0.38)} />
            <stop offset="48%" stopColor={o.hatColor} />
            <stop offset="100%" stopColor={shade(o.hatColor, -0.28)} />
          </linearGradient>
          <linearGradient id={`${p}lul-hat-brim`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={shade(o.hatColor, 0.12)} />
            <stop offset="100%" stopColor={shade(o.hatColor, -0.38)} />
          </linearGradient>
          <linearGradient id={`${p}lul-crown`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff3a3" />
            <stop offset="50%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id={`${p}lul-pants`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={shade(o.pants, 0.12)} />
            <stop offset="100%" stopColor={shade(o.pants, -0.35)} />
          </linearGradient>
          <linearGradient id={`${p}lul-shoe`} x1="0" y1="0" x2="0" y2="1">
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
            fill={`url(#${p}lul-skin)`}
          />
          {/* Ears */}
          <ellipse cx="32" cy="58" rx="4" ry="6" fill={`url(#${p}lul-skin)`} />
          <ellipse cx="88" cy="58" rx="4" ry="6" fill={`url(#${p}lul-skin)`} />
          <ellipse cx="32" cy="59" rx="1.6" ry="3" fill={o.skinShade} opacity="0.6" />
          <ellipse cx="88" cy="59" rx="1.6" ry="3" fill={o.skinShade} opacity="0.6" />

          <FaceLayer o={o} />
        </g>

        {/* ── HAIR + HEADWEAR + EYEWEAR ────────────────── */}
        <HairLayer o={o} />
        <HatLayer o={o} />
        <GlassesLayer o={o} />
        </GradientIdContext.Provider>
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
