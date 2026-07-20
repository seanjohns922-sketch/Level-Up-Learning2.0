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

// ── Image-hair mode ─────────────────────────────────────────────────────────
// Premium illustrated hairstyles ship as transparent hair-only PNGs in
// public/avatars/hair/hair_<style>.png and are overlaid on the SVG head, which
// still provides the (customisable) skin tone + face beneath. A style only
// renders from its image once that asset is confirmed hair-only and calibrated —
// flip it to true in IMAGE_HAIR_READY. Until then it falls back to the SVG
// HairLayer, so nothing breaks while assets are still being produced.
const IMAGE_HAIR_READY: Partial<Record<HairStyle, boolean>> = {
  long: true,
  short: true,
  swept: true,
  sidepart: true,
  tuft: true,
  spiky: true,
  curls: true,
  bob: true,
  ponytail: true,
  braids: true,
  pigtails: true,
  bun: true,
  // bald stays SVG by design (bare scalp + shine).
};
// Where a hair PNG sits over the SVG head. viewBox is 120 wide; the head spans
// x≈32–88 with the crown at y≈18 and chin at y≈90. The source art is a square
// canvas with the head centred, so the image roughly fills the width. Tuned on
// the first calibrated asset (hair_long).
const HAIR_IMAGE_BOX = { x: -1, y: -4, w: 122, h: 122 };

function HairImageLayer({ style }: { style: HairStyle }) {
  const { x, y, w, h } = HAIR_IMAGE_BOX;
  return (
    <image
      href={`/avatars/hair/hair_${style}.png`}
      x={x}
      y={y}
      width={w}
      height={h}
      preserveAspectRatio="xMidYMid meet"
      data-layer="hair-image"
    />
  );
}

// Hairstyles: simple, clean, premium (Nintendo / Animal Crossing feel). Each is
// a few clean vector shapes with a RAISED hairline (~30% more forehead than the
// old low "helmet" line) so the face reads open and the eyes are the focal point.
// Distinct silhouette + personality per style; readable at thumbnail size.
// Head arc: cx=60, crown y≈18, temples y≈62, eyes y≈60. Spiky is the benchmark.
const HAIR_FRONT = "Q92 46 86 46 Q88 41 80 42 Q71 38 62 39 Q52 37 45 39 Q38 38 40 44 Q34 45 35 50 Q30 51 28 56 Z";
const HAIR_FRONT_W = "Q95 45 88 45 Q86 40 78 41 Q68 37 60 38 Q50 36 43 39 Q36 39 38 44 Q30 46 24 53 Z";

function HairLayer({ o }: { o: Outfit }) {
  const p = useGradPrefix();
  const dk = o.hairShade;
  const hair = `url(#${p}lul-hair)`;
  const sep = (d: string) => <path d={d} stroke={dk} strokeWidth={1.2} strokeLinecap="round" opacity={0.3} fill="none" />;
  const sh = (cx: number, cy: number, rx: number, ry: number) => (
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${p}lul-hair-sheen)`} transform={`rotate(-18 ${cx} ${cy})`} />
  );

  switch (o.hairStyle) {
    case "bald": // clean scalp with a soft sheen
      return (
        <g data-layer="hair">
          <ellipse cx="52" cy="30" rx="15" ry="9" fill="#ffffff" opacity="0.13" transform="rotate(-18 52 30)" />
        </g>
      );
    case "buzz": // minimal, clean, tight to the scalp
      return (
        <g data-layer="hair">
          <path d="M31 54 Q30 24 60 20 Q90 24 89 54 Q87 47 81 47 Q88 42 79 43 Q70 39 61 40 Q51 38 45 40 Q37 40 41 45 Q34 46 33 50 Q31 51 31 54 Z" fill={hair} opacity="0.95" />
          <g fill={dk} opacity="0.26">
            {[38, 48, 58, 68, 78].map((x) => <circle key={x} cx={x} cy="31" r="0.9" />)}
            {[43, 53, 63, 73, 83].map((x) => <circle key={`a${x}`} cx={x} cy="39" r="0.9" />)}
          </g>
          {sh(46, 28, 14, 7)}
        </g>
      );
    case "short": // neat, friendly, classic
      return (
        <g data-layer="hair">
          <path d={`M28 56 Q22 8 60 3 Q98 8 92 56 ${HAIR_FRONT}`} fill={hair} />
          {sh(45, 20, 18, 10)}
        </g>
      );
    case "swept": // confident, modern, smooth
      return (
        <g data-layer="hair">
          <path d="M27 56 Q20 6 58 4 Q104 2 108 40 Q109 54 93 60 Q97 45 87 44 Q90 40 82 41 Q66 36 50 42 Q44 40 41 45 Q35 46 36 50 Q30 51 27 56 Z" fill={hair} />
          {sep("M54 14 Q80 18 100 44")}
          {sep("M47 20 Q74 24 94 48")}
          {sh(44, 20, 20, 10)}
        </g>
      );
    case "sidepart": // smart, organised, classic
      return (
        <g data-layer="hair">
          <path d="M28 56 Q24 10 50 6 Q54 4 66 4 Q98 6 94 56 Q92 46 84 46 Q88 41 79 42 Q69 38 59 40 Q55 36 51 38 Q50 32 47 33 Q46 40 44 46 Q35 46 36 50 Q30 51 28 56 Z" fill={hair} />
          <path d="M49 18 Q46 32 45 46" stroke={dk} strokeWidth="1.8" strokeLinecap="round" opacity="0.42" fill="none" />
          {sep("M55 12 Q74 16 90 38")}
          {sh(66, 16, 14, 7)}
        </g>
      );
    case "tuft": // playful, energetic
      return (
        <g data-layer="hair">
          <path d="M29 55 Q24 12 60 8 Q96 12 91 55 Q89 47 82 47 Q86 42 78 43 Q69 39 61 40 Q51 38 45 40 Q38 40 41 45 Q34 46 35 50 Q31 51 29 55 Z" fill={hair} />
          <path d="M51 18 Q47 -1 67 1 Q77 3 73 13 Q70 4 61 8 Q68 11 65 18 Q58 11 51 18 Z" fill={hair} />
          {sh(45, 24, 13, 7)}
        </g>
      );
    case "spiky": // bold, fun, high energy — the quality benchmark
      return (
        <g data-layer="hair">
          <path d="M29 54 Q27 28 35 24 L38 9 L46 22 L50 5 L58 20 L62 4 L70 20 L78 6 L82 24 Q91 28 91 54 Q89 46 82 46 Q86 42 78 43 Q69 39 61 40 Q51 38 45 40 Q38 40 41 45 Q33 46 35 50 Q30 50 29 54 Z" fill={hair} />
          {sh(45, 20, 15, 8)}
        </g>
      );
    case "curls": // soft, happy, rounded
      return (
        <g data-layer="hair">
          <path d="M24 58 Q20 20 60 16 Q100 20 96 58 Q94 47 86 47 Q70 41 60 43 Q50 41 34 47 Q26 47 24 58 Z" fill={hair} />
          <g fill={hair}>
            <circle cx="29" cy="32" r="11" /><circle cx="27" cy="45" r="9" /><circle cx="40" cy="20" r="11" /><circle cx="54" cy="15" r="11" /><circle cx="70" cy="15" r="11" /><circle cx="84" cy="20" r="11" /><circle cx="93" cy="33" r="10" /><circle cx="94" cy="45" r="9" />
          </g>
          <g fill={dk} opacity="0.28">
            <circle cx="37" cy="28" r="3.6" /><circle cx="52" cy="21" r="3.8" /><circle cx="66" cy="19" r="3.8" /><circle cx="80" cy="23" r="3.6" /><circle cx="31" cy="39" r="3.2" />
          </g>
          <g fill="#ffffff" opacity="0.16">
            <circle cx="44" cy="16" r="2.8" /><circle cx="60" cy="12" r="3" /><circle cx="76" cy="16" r="2.8" />
          </g>
          {sh(43, 24, 15, 8)}
        </g>
      );
    case "afro": // full, balanced, cloud-like silhouette
      return (
        <g data-layer="hair">
          <path d="M18 54 Q6 40 12 22 Q14 4 34 7 Q42 -1 58 2 Q66 -1 84 6 Q106 5 108 22 Q114 40 100 54 Q98 44 88 44 Q94 30 60 28 Q26 30 32 44 Q22 44 18 54 Z" fill={hair} />
          <g fill="#ffffff" opacity="0.09">
            <circle cx="32" cy="18" r="6" /><circle cx="50" cy="9" r="6.4" /><circle cx="72" cy="9" r="6.4" /><circle cx="90" cy="20" r="6" /><circle cx="60" cy="5" r="6.2" />
          </g>
          <g fill={dk} opacity="0.18">
            <circle cx="40" cy="18" r="3" /><circle cx="60" cy="22" r="3" /><circle cx="80" cy="18" r="3" />
          </g>
          {sh(42, 20, 18, 10)}
        </g>
      );
    case "long": // soft, layered, face-framing
      return (
        <g data-layer="hair">
          <path d="M24 50 Q16 74 20 106 Q24 128 34 130 Q40 130 38 120 Q33 100 42 84 Q40 62 40 50 Z" fill={dk} opacity="0.4" />
          <path d="M96 50 Q104 74 100 106 Q96 128 86 130 Q80 130 82 120 Q87 100 78 84 Q80 62 80 50 Z" fill={dk} opacity="0.4" />
          <path d="M21 50 Q13 74 17 106 Q21 126 33 128 Q39 128 37 118 Q32 100 44 84 Q40 60 40 48 Z" fill={hair} />
          <path d="M99 50 Q107 74 103 106 Q99 126 87 128 Q81 128 83 118 Q88 100 76 84 Q80 60 80 48 Z" fill={hair} />
          <path d={`M22 54 Q16 6 60 2 Q104 6 98 54 ${HAIR_FRONT_W}`} fill={hair} />
          {sep("M30 56 Q24 96 34 124")}
          {sep("M90 56 Q96 96 86 124")}
          {sh(45, 20, 18, 10)}
        </g>
      );
    case "bob": // rounded, simple, modern
      return (
        <g data-layer="hair">
          <path d="M23 54 Q20 8 60 4 Q100 8 97 54 Q99 82 87 100 Q79 103 79 92 Q85 74 83 58 Q84 46 60 43 Q36 46 37 58 Q35 74 41 92 Q41 103 33 100 Q21 82 23 54 Z" fill={hair} />
          {sep("M30 58 Q28 80 34 96")}
          {sep("M90 58 Q92 80 86 96")}
          {sh(44, 22, 17, 9)}
        </g>
      );
    case "ponytail": // clean, active
      return (
        <g data-layer="hair">
          <path d="M84 22 Q113 26 113 54 Q111 80 92 80 Q99 74 100 64 Q92 76 86 72 Q98 64 98 50 Q98 40 82 40 Z" fill={hair} />
          <path d="M83 40 Q97 42 97 52 Q97 64 90 74 Q95 64 92 52 Q90 44 82 44 Z" fill={dk} opacity="0.4" />
          {sep("M92 32 Q104 46 98 68")}
          <path d={`M26 54 Q22 8 60 4 Q98 8 94 48 ${HAIR_FRONT}`} fill={hair} />
          {sh(45, 20, 17, 9)}
        </g>
      );
    case "pigtails": // two clean round bunches + centre part
      return (
        <g data-layer="hair">
          <g fill={hair}>
            <circle cx="18" cy="66" r="14" /><circle cx="102" cy="66" r="14" />
          </g>
          <path d="M12 58 Q6 66 10 76 Q6 66 14 60 Z" fill={dk} opacity="0.32" />
          <path d="M108 58 Q114 66 110 76 Q114 66 106 60 Z" fill={dk} opacity="0.32" />
          <path d="M25 54 Q21 8 60 4 Q99 8 95 54 Q92 45 85 45 Q88 40 78 41 Q68 37 60 39 Q51 37 43 40 Q35 40 38 45 Q30 46 25 54 Z" fill={hair} />
          <path d="M60 6 Q60 20 60 30" stroke={dk} strokeWidth="1.4" opacity="0.38" fill="none" />
          {sh(44, 20, 15, 8)}
        </g>
      );
    case "bun": // sleek "top knot" with a round knot on top
      return (
        <g data-layer="hair">
          <ellipse cx="60" cy="11" rx="13" ry="11" fill={dk} opacity="0.4" />
          <circle cx="60" cy="10" r="10.5" fill={hair} />
          <path d="M51 5 Q60 0 69 5" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1.8" fill="none" />
          <path d="M25 54 Q22 10 60 6 Q98 10 95 54 Q92 45 85 45 Q88 40 78 41 Q68 37 60 39 Q51 37 43 40 Q35 40 38 45 Q30 46 25 54 Z" fill={hair} />
          {sh(44, 22, 15, 8)}
        </g>
      );
    case "braids": // two clear plaits + centre part
      return (
        <g data-layer="hair">
          {[
            [18, 30],
            [102, 90],
          ].map(([xo, xi], side) => {
            const cx = (xo + xi) / 2;
            return (
              <g key={side}>
                {[56, 68, 80, 92].map((y, i) => (
                  <g key={y}>
                    <ellipse cx={cx} cy={y} rx="9" ry="8" fill={hair} transform={`rotate(${i % 2 === 0 ? -18 : 18} ${cx} ${y})`} />
                    <ellipse cx={cx} cy={y + 3} rx="8" ry="3.6" fill={dk} opacity="0.26" />
                  </g>
                ))}
                <path d={`M${cx - 4} 98 Q${cx} 108 ${cx + 4} 98`} fill={hair} />
              </g>
            );
          })}
          <path d="M25 54 Q21 8 60 4 Q99 8 95 54 Q92 45 85 45 Q88 40 78 41 Q68 37 60 39 Q51 37 43 40 Q35 40 38 45 Q30 46 25 54 Z" fill={hair} />
          <path d="M60 6 Q60 20 60 30" stroke={dk} strokeWidth="1.4" opacity="0.38" fill="none" />
          {sh(44, 20, 15, 8)}
        </g>
      );
    default:
      return (
        <g data-layer="hair">
          <path d={`M28 56 Q22 8 60 3 Q98 8 92 56 ${HAIR_FRONT}`} fill={hair} />
          {sh(45, 20, 18, 10)}
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
        {IMAGE_HAIR_READY[o.hairStyle] ? <HairImageLayer style={o.hairStyle} /> : <HairLayer o={o} />}
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
