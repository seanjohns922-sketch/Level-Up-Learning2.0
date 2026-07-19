"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Lock, Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";
import EconomyHeader from "@/components/economy/EconomyHeader";
import StudentAvatar, { type AvatarOutfit, type BodyType, type BottomStyle, type FaceType, type HairStyle, type ShoeStyle, type TopStyle } from "@/components/avatar/StudentAvatar";
import {
  economyErrorMessage,
  equipEconomyItem,
  fetchStudentEconomy,
  getExplorerRank,
  mergeAvatarOutfit,
  persistAvatarToStorage,
  RARITY_STYLES,
  saveAvatarBase,
  unequipEconomySlot,
  type EconomyItem,
  type EconomyState,
} from "@/lib/economy";
import { getActiveStudentProfile } from "@/lib/studentIdentity";

// ── Every option on this page is FREE. No XP, no unlocking. ─────────────────
const BODIES: Array<{ value: BodyType; label: string; patch: Partial<AvatarOutfit> }> = [
  { value: "neutral", label: "Boy", patch: { body: "neutral", top: "hoodie", bottom: "joggers", hairStyle: "short" } },
  { value: "dress", label: "Girl", patch: { body: "dress", top: "dress", hairStyle: "ponytail" } },
];
const TOP_STYLES: Array<[TopStyle, string]> = [
  ["hoodie", "Hoodie"], ["tshirt", "T-Shirt"], ["jumper", "Jumper"],
  ["polo", "Polo"], ["jacket", "Jacket"], ["dress", "Dress"],
];
const BOTTOM_STYLES: Array<[BottomStyle, string]> = [
  ["joggers", "Joggers"], ["jeans", "Jeans"], ["shorts", "Shorts"],
  ["trackpants", "Track Pants"], ["skirt", "Skirt"], ["leggings", "Leggings"],
];
const SHOE_STYLES: Array<[ShoeStyle, string]> = [
  ["sneakers", "Sneakers"], ["boots", "Boots"], ["hightops", "High-Tops"], ["sandals", "Sandals"],
];
const FACES: Array<[FaceType, string]> = [
  ["smile", "Smile"], ["bigSmile", "Big Smile"], ["happy", "Happy Eyes"],
  ["determined", "Determined"], ["freckles", "Freckles"], ["rosy", "Rosy Cheeks"],
];
const SKINS: Array<[string, string]> = [
  ["#ffe0bd", "#eec39a"], ["#f7d9bf", "#e2b58f"], ["#f4c2c2", "#dd9a9a"], ["#f1c8a6", "#d6a07a"],
  ["#e8b48a", "#c98d5f"], ["#d99e6f", "#b57544"], ["#c68642", "#a3652c"], ["#c1854f", "#9c6432"],
  ["#a86a3c", "#834d26"], ["#8a5228", "#63381a"], ["#6b3d1d", "#4a2812"], ["#5c3317", "#3f2110"],
  ["#7a4a24", "#54331a"], ["#3f2412", "#2a170b"],
];
const HAIRSTYLES: Array<[HairStyle, string]> = [
  ["short", "Short"], ["swept", "Swept"], ["sidepart", "Side Part"], ["tuft", "Tuft"],
  ["spiky", "Spiky"], ["curls", "Curly"], ["afro", "Afro"], ["buzz", "Buzz"],
  ["long", "Long"], ["bob", "Bob"], ["ponytail", "Ponytail"], ["pigtails", "Pigtails"],
  ["bun", "Top Knot"], ["braids", "Braids"],
];
const HAIRCOLORS: Array<[string, string, string]> = [
  ["#2e2422", "#161010", "Black"], ["#4a2e1c", "#2e1a0e", "Brown"], ["#6b4423", "#432a13", "Chestnut"],
  ["#8a5a2b", "#5c3a18", "Dark Blonde"], ["#b5732e", "#8a5320", "Auburn"], ["#c9962f", "#9a6e1e", "Blonde"],
  ["#e0c084", "#c39f57", "Light Blonde"], ["#b0453b", "#7d2c25", "Red"], ["#d98a5b", "#b5623a", "Ginger"],
  ["#9aa3ad", "#6b737c", "Grey"], ["#e8ecef", "#c3c9cf", "White"],
  ["#4f6d9c", "#334b73", "Blue"], ["#7c5cc4", "#553a91", "Purple"], ["#c76aa6", "#98457a", "Pink"],
  ["#3d8f7a", "#276055", "Green"], ["#3aa5b8", "#26788a", "Teal"], ["#c94f6d", "#932c47", "Cherry"],
];
// Clothing — top (with trim), bottoms and shoes are all free colours.
const TOPS: Array<[string, string, string]> = [
  ["#1d4ed8", "#93c5fd", "Blue"], ["#2563eb", "#bfdbfe", "Sky Blue"], ["#dc2626", "#fca5a5", "Red"],
  ["#e11d48", "#fda4af", "Rose"], ["#166534", "#bbf7d0", "Green"], ["#15803d", "#86efac", "Grass"],
  ["#0f766e", "#99f6e4", "Teal"], ["#0891b2", "#a5f3fc", "Cyan"], ["#d97706", "#fde68a", "Gold"],
  ["#ea580c", "#fdba74", "Orange"], ["#7c3aed", "#ddd6fe", "Purple"], ["#9333ea", "#e9d5ff", "Violet"],
  ["#db2777", "#fbcfe8", "Pink"], ["#4f46e5", "#c7d2fe", "Indigo"], ["#334155", "#cbd5e1", "Slate"],
  ["#111827", "#6b7280", "Black"], ["#f1f5f9", "#cbd5e1", "White"], ["#7c5b21", "#e7c98a", "Brown"],
];
const BOTTOMS: Array<[string, string]> = [
  ["#111827", "Black"], ["#1e293b", "Charcoal"], ["#334155", "Slate"], ["#3f3f46", "Grey"],
  ["#1e3a8a", "Navy"], ["#2563eb", "Denim"], ["#4d7c0f", "Olive"], ["#7c5b21", "Khaki"],
  ["#6b3f2a", "Brown"], ["#7f1d1d", "Maroon"], ["#5b21b6", "Purple"], ["#0f766e", "Teal"],
  ["#be185d", "Pink"], ["#e2e8f0", "White"],
];
const SHOES: Array<[string, string]> = [
  ["#f8fafc", "White"], ["#111827", "Black"], ["#dc2626", "Red"], ["#2563eb", "Blue"],
  ["#16a34a", "Green"], ["#db2777", "Pink"], ["#d97706", "Gold"], ["#7c3aed", "Purple"],
  ["#0891b2", "Cyan"], ["#ea580c", "Orange"], ["#64748b", "Grey"], ["#7c5b21", "Brown"],
  ["#0f766e", "Teal"], ["#e11d48", "Rose"],
];

function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}
function Thumb({ outfit, height = 58 }: { outfit: AvatarOutfit; height?: number }) {
  return <StudentAvatar height={height} outfit={outfit} floatAnimation="none" alive={false} glowColor="rgba(15,23,42,0.10)" />;
}
/** Preview a single earnable garment over the free base look. */
function layerPreview(base: AvatarOutfit, item: EconomyItem): AvatarOutfit {
  const layer = { ...(item.metadata as Record<string, unknown>) };
  delete layer.slot;
  return { ...base, ...layer } as AvatarOutfit;
}

const PANEL = "rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]";
const optBase = "relative rounded-xl border-2 bg-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500";
const ring = (on: boolean) => (on ? "border-teal-600 ring-2 ring-teal-500/40" : "border-slate-200");

function Heading({ title }: { title: string }) {
  return <h2 className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500">{title}</h2>;
}

export default function ExplorerOutfitPage() {
  const router = useRouter();
  const student = useMemo(() => getActiveStudentProfile(), []);
  const [state, setState] = useState<EconomyState | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(0);
  const [busy, setBusy] = useState(false);
  const sessionMessage = student?.studentId ? null : "Log in as a student to open your Explorer Outfit.";
  const firstName = student?.displayName?.trim().split(/\s+/)[0] ?? "Explorer";

  useEffect(() => {
    if (!student?.studentId) return;
    fetchStudentEconomy(student.studentId)
      .then((next) => {
        setState(next);
        persistAvatarToStorage(student.studentId, next);
      })
      .catch((error) => setMessage(economyErrorMessage(error)));
  }, [student?.studentId]);

  const base: AvatarOutfit = state?.avatarBase ?? {};
  const merged = state ? mergeAvatarOutfit(state) : {};
  // Effective top (honours the legacy body:"dress" avatars); a dress owns Bottom.
  const effTop: TopStyle = base.top ?? (base.body === "dress" ? "dress" : "hoodie");
  const isDress = effTop === "dress";
  const owned = useMemo(() => new Set(state?.inventory.map((e) => e.item_key) ?? []), [state?.inventory]);
  const itemsBySlot = useMemo(() => {
    const map = new Map<string, EconomyItem[]>();
    for (const item of state?.items ?? []) {
      const slot = (item.metadata as { slot?: string })?.slot ?? item.category;
      const list = map.get(slot) ?? [];
      list.push(item);
      map.set(slot, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.sort_order - b.sort_order);
    return map;
  }, [state?.items]);

  const bump = () => setCelebrate((c) => c + 1);
  function commit(next: EconomyState) {
    setState(next);
    if (student?.studentId) persistAvatarToStorage(student.studentId, next);
  }
  async function updateBase(patch: Partial<AvatarOutfit>, celebrateChange = false) {
    if (!student?.studentId || !state) return;
    const nextBase = { ...base, ...patch };
    setState({ ...state, avatarBase: nextBase }); // optimistic
    if (celebrateChange) bump();
    try {
      commit(await saveAvatarBase(student.studentId, nextBase));
    } catch (error) {
      setMessage(economyErrorMessage(error));
    }
  }
  // Equip an earned garment (locked → Marketplace to buy it first).
  async function equipItem(item: EconomyItem) {
    if (!student?.studentId || busy) return;
    if (!owned.has(item.item_key)) {
      router.push("/marketplace");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      commit(await equipEconomyItem(student.studentId, item.item_key));
      bump();
    } catch (error) {
      setMessage(economyErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  // Pick a free garment style; take off any equipped premium in that slot first.
  async function pickFreeStyle(patch: Partial<AvatarOutfit>, equipSlot: string) {
    if (!student?.studentId || busy) return;
    if (state?.equipped[equipSlot]) {
      setBusy(true);
      try {
        commit(await unequipEconomySlot(student.studentId, equipSlot));
      } catch (error) {
        setMessage(economyErrorMessage(error));
      } finally {
        setBusy(false);
      }
    }
    await updateBase(patch, true);
  }

  function surprise() {
    const s = pick(SKINS), c = pick(HAIRCOLORS), h = pick(HAIRSTYLES), f = pick(FACES),
      t = pick(TOPS), bo = pick(BOTTOMS), sh = pick(SHOES),
      topStyle = pick(TOP_STYLES)[0], bottomStyle = pick(BOTTOM_STYLES)[0], shoeStyle = pick(SHOE_STYLES)[0];
    void updateBase({
      face: f[0], skin: s[0], skinShade: s[1], hair: c[0], hairShade: c[1], hairStyle: h[0],
      top: topStyle, bottom: bottomStyle, shoeStyle,
      shirt: t[0], shirtTrim: t[1], pants: bo[0], shoes: sh[0],
    }, true);
  }

  const dotCls = (on: boolean) => `${optBase} h-9 w-9 rounded-full ${ring(on)}`;
  const swatchCls = (on: boolean) => `${optBase} h-11 w-11 ${ring(on)}`;

  // Earned garments for a slot, shown after the free styles (locked → Marketplace).
  function premiumCards(equipSlot: string) {
    const items = itemsBySlot.get(equipSlot) ?? [];
    const equippedKey = state?.equipped[equipSlot];
    return items.map((item) => {
      const isOwned = owned.has(item.item_key);
      const isOn = equippedKey === item.item_key;
      const rarity = RARITY_STYLES[item.rarity];
      return (
        <button key={item.item_key} type="button" title={item.name} onClick={() => equipItem(item)} disabled={busy} className={`${optBase} flex h-[84px] w-16 flex-col items-center overflow-hidden pt-1 disabled:opacity-60 ${ring(isOn)}`}>
          {isOn ? <Check className="absolute right-1 top-1 z-10 h-3.5 w-3.5 rounded-full bg-white text-teal-600" /> : null}
          {!isOwned ? (
            <span className="absolute right-1 top-1 z-10 flex items-center gap-0.5 rounded bg-slate-900/85 px-1 py-0.5 text-[8px] font-black text-white"><Lock className="h-2.5 w-2.5" />{item.price}</span>
          ) : null}
          <span className="absolute left-1 top-1 z-10 rounded px-1 py-0.5 text-[7px] font-black uppercase" style={{ color: rarity.color, background: rarity.background }}>{rarity.label}</span>
          <div className={!isOwned ? "opacity-45" : ""}><Thumb outfit={layerPreview(base, item)} /></div>
          <span className="mt-auto w-full truncate px-1 pb-1 text-center text-[9px] font-bold" style={{ color: rarity.color }}>{item.name}</span>
        </button>
      );
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_-10%,#e7eefc,transparent),linear-gradient(#eef2f6,#e6ebf1)] text-slate-900">
      <EconomyHeader xp={state?.wallet.xp_balance} essence={state?.wallet.essence} rankLevel={getExplorerRank(state?.wallet.xp_earned ?? 0).level} />
      <div className="mx-auto max-w-[1180px] px-4 py-6 md:px-6">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">My Home</p>
          <h1 className="text-3xl font-black md:text-4xl">Explorer Outfit</h1>
          <p className="mt-1 text-sm text-slate-600">Get your explorer ready for the next adventure. Everything here is free — mix and match as much as you like.</p>
        </div>
        {message || sessionMessage ? (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900" role="status">{message ?? sessionMessage}</div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          {/* Live preview */}
          <aside className="h-fit lg:sticky lg:top-20">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex min-h-[360px] items-center justify-center bg-[radial-gradient(ellipse_70%_60%_at_50%_38%,#eef2f6,#d3dce6)] p-6">
                <StudentAvatar height={300} outfit={merged} celebrateSignal={celebrate} glowColor="rgba(15,23,42,0.16)" />
              </div>
              <div className="border-t border-slate-200 px-4 pt-3">
                <p className="text-lg font-black leading-tight">{firstName}</p>
                <p className="text-xs font-bold text-teal-700">Explorer</p>
              </div>
              <div className="p-3">
                <button type="button" onClick={surprise} disabled={!state} className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-50">
                  <Shuffle className="h-4 w-4" /> Surprise me
                </button>
              </div>
            </div>
          </aside>

          {/* Free customisation */}
          <div className="flex flex-col gap-4">
            {/* Character */}
            <section className={PANEL}>
              <Heading title="Character" />
              <div className="flex flex-wrap gap-3">
                {BODIES.map(({ value, label, patch }) => {
                  const on = (base.body ?? "neutral") === value;
                  return (
                    <button key={value} type="button" aria-label={label} title={label} onClick={() => updateBase(patch, true)} className={`${optBase} flex h-[112px] w-[92px] flex-col items-center overflow-hidden pt-1 ${ring(on)}`}>
                      {on ? <Check className="absolute right-1.5 top-1.5 h-4 w-4 text-teal-600" /> : null}
                      <Thumb outfit={{ ...merged, ...patch }} height={78} />
                      <span className="mt-auto w-full truncate px-1 pb-1.5 text-center text-[11px] font-black text-slate-600">{label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Face */}
            <section className={PANEL}>
              <Heading title="Face" />
              <div className="flex flex-wrap gap-2.5">
                {FACES.map(([value, label]) => {
                  const on = (base.face ?? "smile") === value;
                  return (
                    <button key={value} type="button" aria-label={label} title={label} onClick={() => updateBase({ face: value }, true)} className={`${optBase} flex h-[84px] w-16 flex-col items-center overflow-hidden pt-1 ${ring(on)}`}>
                      <Thumb outfit={{ ...merged, face: value }} />
                      <span className="mt-auto w-full truncate px-1 pb-1 text-center text-[9px] font-bold text-slate-500">{label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Skin tone */}
            <section className={PANEL}>
              <Heading title="Skin tone" />
              <div className="flex flex-wrap gap-2.5">
                {SKINS.map((s, i) => (
                  <button key={i} type="button" aria-label={`Skin tone ${i + 1}`} onClick={() => updateBase({ skin: s[0], skinShade: s[1] })} className={dotCls(base.skin === s[0])} style={{ background: `linear-gradient(160deg, ${s[0]}, ${s[1]})` }} />
                ))}
              </div>
            </section>

            {/* Hairstyle */}
            <section className={PANEL}>
              <Heading title="Hairstyle" />
              <div className="flex flex-wrap gap-2.5">
                {HAIRSTYLES.map(([value, label]) => {
                  const on = (base.hairStyle ?? "swept") === value;
                  return (
                    <button key={value} type="button" aria-label={label} title={label} onClick={() => updateBase({ hairStyle: value }, true)} className={`${optBase} flex h-[84px] w-16 flex-col items-center overflow-hidden pt-1 ${ring(on)}`}>
                      <Thumb outfit={{ ...merged, hairStyle: value }} />
                      <span className="mt-auto w-full truncate px-1 pb-1 text-center text-[9px] font-bold text-slate-500">{label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Hair colour */}
            <section className={PANEL}>
              <Heading title="Hair colour" />
              <div className="flex flex-wrap gap-2.5">
                {HAIRCOLORS.map((c, i) => (
                  <button key={i} type="button" aria-label={c[2]} title={c[2]} onClick={() => updateBase({ hair: c[0], hairShade: c[1] })} className={dotCls(base.hair === c[0])} style={{ background: `linear-gradient(160deg, ${c[0]}, ${c[1]})` }} />
                ))}
              </div>
            </section>

            {/* Top */}
            <section className={PANEL}>
              <Heading title="Top" />
              <div className="mb-3 flex flex-wrap gap-2.5">
                {TOP_STYLES.map(([value, label]) => {
                  const on = !state?.equipped.top && effTop === value;
                  return (
                    <button key={value} type="button" aria-label={label} title={label} onClick={() => pickFreeStyle({ top: value }, "top")} disabled={busy} className={`${optBase} flex h-[84px] w-16 flex-col items-center overflow-hidden pt-1 disabled:opacity-60 ${ring(on)}`}>
                      <Thumb outfit={{ ...merged, top: value }} />
                      <span className="mt-auto w-full truncate px-1 pb-1 text-center text-[9px] font-bold text-slate-500">{label}</span>
                    </button>
                  );
                })}
                {premiumCards("top")}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {TOPS.map(([shirt, trim, label]) => (
                  <button key={label} type="button" aria-label={label} title={label} onClick={() => updateBase({ shirt, shirtTrim: trim })} className={swatchCls(base.shirt === shirt)} style={{ background: `linear-gradient(150deg, ${shirt}, ${trim})` }} />
                ))}
              </div>
            </section>

            {/* Bottoms — disabled while a dress is worn (it covers both slots) */}
            <section className={`${PANEL} ${isDress ? "opacity-55" : ""}`}>
              <Heading title="Bottoms" />
              {isDress ? (
                <p className="text-xs font-semibold text-slate-400">Your dress covers this — pick a different Top to choose bottoms.</p>
              ) : (
                <>
                  <div className="mb-3 flex flex-wrap gap-2.5">
                    {BOTTOM_STYLES.map(([value, label]) => {
                      const on = !state?.equipped.bottom && (base.bottom ?? "joggers") === value;
                      return (
                        <button key={value} type="button" aria-label={label} title={label} onClick={() => pickFreeStyle({ bottom: value }, "bottom")} disabled={busy} className={`${optBase} flex h-[84px] w-16 flex-col items-center overflow-hidden pt-1 disabled:opacity-60 ${ring(on)}`}>
                          <Thumb outfit={{ ...merged, bottom: value }} />
                          <span className="mt-auto w-full truncate px-1 pb-1 text-center text-[9px] font-bold text-slate-500">{label}</span>
                        </button>
                      );
                    })}
                    {premiumCards("bottom")}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {BOTTOMS.map(([pants, label]) => (
                      <button key={label} type="button" aria-label={label} title={label} onClick={() => updateBase({ pants })} className={swatchCls(base.pants === pants)} style={{ background: `linear-gradient(150deg, ${pants}, #000)` }} />
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* Shoes */}
            <section className={PANEL}>
              <Heading title="Shoes" />
              <div className="mb-3 flex flex-wrap gap-2.5">
                {SHOE_STYLES.map(([value, label]) => {
                  const on = !state?.equipped.footwear && (base.shoeStyle ?? "sneakers") === value;
                  return (
                    <button key={value} type="button" aria-label={label} title={label} onClick={() => pickFreeStyle({ shoeStyle: value }, "footwear")} disabled={busy} className={`${optBase} flex h-[84px] w-16 flex-col items-center overflow-hidden pt-1 disabled:opacity-60 ${ring(on)}`}>
                      <Thumb outfit={{ ...merged, shoeStyle: value }} />
                      <span className="mt-auto w-full truncate px-1 pb-1 text-center text-[9px] font-bold text-slate-500">{label}</span>
                    </button>
                  );
                })}
                {premiumCards("footwear")}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {SHOES.map(([shoes, label]) => (
                  <button key={label} type="button" aria-label={label} title={label} onClick={() => updateBase({ shoes })} className={swatchCls(base.shoes === shoes)} style={{ background: `linear-gradient(150deg, #fff, ${shoes})` }} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
