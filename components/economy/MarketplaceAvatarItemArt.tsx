import type { ReactNode } from "react";
import type { EconomyItem } from "@/lib/economy";

type ItemMeta = Record<string, unknown>;

function value(meta: ItemMeta, key: string, fallback: string) {
  return typeof meta[key] === "string" ? meta[key] : fallback;
}

function TopArt({ meta }: { meta: ItemMeta }) {
  const shirt = value(meta, "shirt", "#0f766e");
  const trim = value(meta, "shirtTrim", "#99f6e4");
  const style = value(meta, "top", "tshirt");
  const isJacket = style === "jacket";
  const isHoodie = style === "hoodie" || meta.slot === "avatar_outfit";
  return (
    <>
      {isHoodie ? <path d="M60 29 Q80 11 100 29 L94 40 Q80 29 66 40 Z" fill={trim} opacity="0.82" /> : null}
      <path d="M57 27 71 20 Q80 27 89 20L103 27 121 45 108 59 99 51 103 105H57L61 51 52 59 39 45Z" fill={shirt} stroke="#0f172a" strokeOpacity="0.34" strokeWidth="3" strokeLinejoin="round" />
      <path d="M71 21 Q80 35 89 21" fill="none" stroke={trim} strokeWidth="5" strokeLinecap="round" />
      {isJacket ? <><path d="M80 31V104" stroke={trim} strokeWidth="4" /><path d="m65 44 15 13 15-13" fill="none" stroke={trim} strokeWidth="3" /></> : null}
      {style === "polo" ? <path d="m70 24 10 15 10-15" fill={trim} opacity="0.9" /> : null}
      {isHoodie ? <><path d="M68 78Q80 87 92 78V94H68Z" fill={trim} opacity="0.32" /><path d="M76 34v19M84 34v19" stroke={trim} strokeWidth="2" /></> : null}
      {style === "jumper" ? <path d="M59 70h42" stroke={trim} strokeWidth="4" strokeDasharray="7 5" opacity="0.8" /> : null}
    </>
  );
}

function BottomArt({ meta }: { meta: ItemMeta }) {
  const pants = value(meta, "pants", "#334155");
  const style = value(meta, "bottom", "joggers");
  if (style === "skirt") {
    return <><path d="M57 28h46l12 68Q80 111 45 96Z" fill={pants} stroke="#0f172a" strokeOpacity="0.35" strokeWidth="3" /><path d="M57 33h46" stroke="#fff" strokeOpacity="0.45" strokeWidth="4" /></>;
  }
  const hem = style === "shorts" ? 75 : 108;
  return <><path d={`M54 27h52l8 ${hem - 27}H88l-8-28-8 28H46Z`} fill={pants} stroke="#0f172a" strokeOpacity="0.35" strokeWidth="3" strokeLinejoin="round" /><path d="M55 34h50" stroke="#fff" strokeOpacity="0.36" strokeWidth="4" />{style === "trackpants" ? <><path d={`M57 39 52 ${hem - 4}`} stroke="#f8fafc" strokeOpacity="0.7" strokeWidth="3" /><path d={`m103 39 5 ${hem - 4}`} stroke="#f8fafc" strokeOpacity="0.7" strokeWidth="3" /></> : null}</>;
}

function FootwearArt({ meta }: { meta: ItemMeta }) {
  const shoes = value(meta, "shoes", "#0e7490");
  const style = value(meta, "shoeStyle", "sneakers");
  const high = style === "boots" || style === "hightops";
  return <><path d={`M25 ${high ? 43 : 58}h34v21l14 8q5 4 2 12H20q-6-17 5-26Z`} fill={shoes} stroke="#0f172a" strokeOpacity="0.4" strokeWidth="3" /><path d={`M101 ${high ? 43 : 58}h34l5 15q11 9 5 26H90q-3-8 2-12l14-8Z`} fill={shoes} stroke="#0f172a" strokeOpacity="0.4" strokeWidth="3" /><path d="M24 78h48M93 78h48" stroke="#fff" strokeOpacity="0.75" strokeWidth="4" />{style === "sandals" ? <><path d="M29 61h27M106 61h27" stroke="#fef3c7" strokeWidth="6" /><path d="m38 59 12 17m74-17-12 17" stroke="#fef3c7" strokeWidth="5" /></> : null}</>;
}

function HatArt({ meta }: { meta: ItemMeta }) {
  const color = value(meta, "hatColor", "#0e7490");
  const style = value(meta, "hat", "cap");
  if (style === "crown") return <path d="M42 90 34 35l30 22 16-38 16 38 30-22-8 55Z" fill={color} stroke="#92400e" strokeWidth="4" strokeLinejoin="round" />;
  if (style === "wizard") return <><path d="m54 83 25-67 31 67Z" fill={color} stroke="#312e81" strokeWidth="4" /><path d="M31 85q49-18 98 0-49 24-98 0Z" fill={color} stroke="#312e81" strokeWidth="4" /><path d="m78 42 5 9 10 2-7 7 1 10-9-5-9 5 2-10-8-7 10-2Z" fill="#fde68a" /></>;
  if (style === "explorer") return <><path d="M50 74q5-44 30-44t30 44Z" fill={color} stroke="#713f12" strokeWidth="4" /><ellipse cx="80" cy="78" rx="56" ry="16" fill={color} stroke="#713f12" strokeWidth="4" /><path d="M52 65h56" stroke="#fde68a" strokeWidth="7" /></>;
  if (style === "beanie") return <><path d="M45 78q0-50 35-50t35 50Z" fill={color} stroke="#7f1d1d" strokeWidth="4" /><circle cx="80" cy="24" r="13" fill={color} /><path d="M42 76h76v18H42Z" fill={color} stroke="#7f1d1d" strokeWidth="4" /></>;
  return <><path d="M43 75q3-42 39-42 32 0 38 32H77L63 78Z" fill={color} stroke="#164e63" strokeWidth="4" /><path d="M76 64h54q7 0 8 10H74Z" fill={color} stroke="#164e63" strokeWidth="4" /></>;
}

function GlassesArt({ meta }: { meta: ItemMeta }) {
  const color = value(meta, "glassesColor", "#0f172a");
  const style = value(meta, "glasses", "round");
  if (style === "visor") return <path d="M27 50q53-24 106 0l-13 39q-40 16-80 0Z" fill={color} stroke="#67e8f9" strokeWidth="5" />;
  if (style === "shades") return <><path d="M26 48h49l-5 39q-36 12-44-39Zm59 0h49q-8 51-44 39Z" fill={color} /><path d="M72 57h16" stroke={color} strokeWidth="7" /></>;
  return <><circle cx="52" cy="66" r="27" fill="none" stroke={color} strokeWidth="8" /><circle cx="108" cy="66" r="27" fill="none" stroke={color} strokeWidth="8" /><path d="M78 61h4M25 57 9 51m126 6 16-6" stroke={color} strokeWidth="7" strokeLinecap="round" /></>;
}

function CapeArt({ meta }: { meta: ItemMeta }) {
  const color = value(meta, "capeColor", "#dc2626");
  return <><path d="M52 22q28 17 56 0l17 91q-45 18-90 0Z" fill={color} stroke="#450a0a" strokeOpacity="0.65" strokeWidth="4" /><path d="M55 24q25 15 50 0" stroke="#fde68a" strokeWidth="7" /><path d="M80 38v72" stroke="#fff" strokeOpacity="0.18" strokeWidth="4" /></>;
}

function BackpackArt({ meta }: { meta: ItemMeta }) {
  const color = value(meta, "backpackColor", "#a16207");
  const rocket = meta.backpack === "rocket";
  return <><rect x="44" y="28" width="72" height="82" rx="22" fill={color} stroke="#0f172a" strokeOpacity="0.48" strokeWidth="4" /><path d="M57 31q23-24 46 0M52 73h56v26H52Z" fill="none" stroke="#fde68a" strokeWidth="6" />{rocket ? <><path d="M45 63 28 77v33h17Zm70 0 17 14v33h-17Z" fill="#cbd5e1" stroke="#475569" strokeWidth="3" /><path d="m34 111 8 15 8-15m60 0 8 15 8-15" fill="#fb923c" /></> : <circle cx="80" cy="86" r="8" fill="#fde68a" />}</>;
}

function OutfitArt({ meta }: { meta: ItemMeta }) {
  return <><g transform="translate(0 -18) scale(1 .78)"><TopArt meta={meta} /></g><g transform="translate(0 68) scale(1 .55)"><BottomArt meta={meta} /></g><g transform="translate(28 119) scale(.65 .45)"><FootwearArt meta={meta} /></g></>;
}

export default function MarketplaceAvatarItemArt({ item }: { item: EconomyItem }) {
  const meta = item.metadata ?? {};
  const slot = value(meta, "slot", "");
  let artwork: ReactNode;
  if (slot === "top") artwork = <TopArt meta={meta} />;
  else if (slot === "bottom") artwork = <BottomArt meta={meta} />;
  else if (slot === "footwear") artwork = <FootwearArt meta={meta} />;
  else if (slot === "avatar_hat") artwork = <HatArt meta={meta} />;
  else if (slot === "avatar_glasses") artwork = <GlassesArt meta={meta} />;
  else if (slot === "avatar_cape") artwork = <CapeArt meta={meta} />;
  else if (slot === "avatar_backpack") artwork = <BackpackArt meta={meta} />;
  else artwork = <OutfitArt meta={meta} />;

  return <svg viewBox="0 0 160 140" className="h-full w-full" role="img" aria-label={`${item.name} product artwork`}>{artwork}</svg>;
}
