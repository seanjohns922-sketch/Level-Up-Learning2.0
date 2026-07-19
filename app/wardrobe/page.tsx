"use client";

import { useEffect, useMemo, useState } from "react";
import * as Icons from "lucide-react";
import { Check, Lock, Shuffle, Sparkles, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import EconomyHeader from "@/components/economy/EconomyHeader";
import StudentAvatar, { type AvatarOutfit, type BodyType, type FaceType, type HairStyle } from "@/components/avatar/StudentAvatar";
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

// ── Free base options (no XP — every student gets these) ────────────────────
const BODIES: Array<{ value: BodyType; label: string; hairStyle: HairStyle }> = [
  { value: "neutral", label: "Boy", hairStyle: "short" },
  { value: "dress", label: "Girl", hairStyle: "ponytail" },
];
const FACES: Array<[FaceType, string]> = [
  ["smile", "Smile"], ["bigSmile", "Big Smile"], ["happy", "Happy Eyes"],
  ["determined", "Determined"], ["freckles", "Freckles"], ["rosy", "Rosy Cheeks"],
];
const SKINS: Array<[string, string]> = [
  ["#f7d9bf", "#e2b58f"], ["#f1c8a6", "#d6a07a"], ["#e8b48a", "#c98d5f"], ["#d99e6f", "#b57544"],
  ["#c1854f", "#9c6432"], ["#a86a3c", "#834d26"], ["#8a5228", "#63381a"], ["#6b3d1d", "#4a2812"],
  ["#f4c2c2", "#dd9a9a"], ["#ffe0bd", "#eec39a"], ["#c68642", "#a3652c"], ["#5c3317", "#3f2110"],
];
const HAIRCOLORS: Array<[string, string, string]> = [
  ["#2e2422", "#161010", "Black"], ["#4a2e1c", "#2e1a0e", "Brown"], ["#6b4423", "#432a13", "Chestnut"],
  ["#8a5a2b", "#5c3a18", "Dark Blonde"], ["#b5732e", "#8a5320", "Auburn"], ["#c9962f", "#9a6e1e", "Blonde"],
  ["#e0c084", "#c39f57", "Light Blonde"], ["#b0453b", "#7d2c25", "Red"], ["#9aa3ad", "#6b737c", "Grey"],
];
const HAIRSTYLES: Array<[HairStyle, string]> = [
  ["short", "Short"], ["swept", "Swept"], ["sidepart", "Side Part"], ["tuft", "Tuft"],
  ["spiky", "Spiky"], ["curls", "Curly"], ["afro", "Afro"], ["buzz", "Buzz"],
  ["long", "Long"], ["bob", "Bob"], ["ponytail", "Ponytail"], ["pigtails", "Pigtails"],
  ["bun", "Top Knot"], ["braids", "Braids"],
];
const OUTFITS: Array<[string, string, string]> = [
  ["#1d4ed8", "#93c5fd", "Blue"], ["#dc2626", "#fca5a5", "Red"], ["#166534", "#bbf7d0", "Green"],
  ["#0f766e", "#99f6e4", "Teal"], ["#d97706", "#fde68a", "Gold"], ["#7c3aed", "#ddd6fe", "Purple"],
  ["#334155", "#cbd5e1", "Slate"], ["#db2777", "#fbcfe8", "Pink"],
];

// ── Config-driven equipment slots (the item sections) ───────────────────────
// Slot ids match the resolved economy slot: metadata.slot ?? category.
const ITEM_SLOTS: Array<{ slot: string; label: string }> = [
  { slot: "avatar_outfit", label: "Special Outfits" },
  { slot: "avatar_hat", label: "Head" },
  { slot: "avatar_glasses", label: "Face Accessories" },
  { slot: "avatar_cape", label: "Capes" },
  { slot: "avatar_backpack", label: "Back Packs" },
  { slot: "pet", label: "Pets" },
  { slot: "trail", label: "Trails" },
  { slot: "title", label: "Titles" },
  { slot: "background", label: "Home Background" },
];

type Filter = { id: string; label: string; test: (item: EconomyItem, owned: boolean) => boolean };
const FILTERS: Filter[] = [
  { id: "all", label: "All", test: () => true },
  { id: "owned", label: "Owned", test: (_i, owned) => owned },
  { id: "unowned", label: "Locked", test: (_i, owned) => !owned },
  { id: "common", label: "Common", test: (i) => i.rarity === "common" },
  { id: "rare", label: "Rare", test: (i) => i.rarity === "rare" },
  { id: "epic", label: "Epic", test: (i) => i.rarity === "epic" },
  { id: "legendary", label: "Legendary", test: (i) => i.rarity === "legendary" },
  { id: "number", label: "Number Nexus", test: (i) => i.realm_id === "number" },
  { id: "measurement", label: "Measurelands", test: (i) => i.realm_id === "measurement" },
];

const isAvatarSlot = (slot: string) => slot.startsWith("avatar_");
function resolveSlot(item: EconomyItem): string {
  return (item.metadata as { slot?: string })?.slot ?? item.category;
}
/** Outfit for a single avatar item previewed over the free base look only. */
function layerPreview(base: AvatarOutfit, item: EconomyItem): AvatarOutfit {
  const layer = { ...(item.metadata as Record<string, unknown>) };
  delete layer.slot;
  return { ...base, ...layer } as AvatarOutfit;
}
function ItemIcon({ item, size = 30 }: { item: EconomyItem; size?: number }) {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>)[item.icon] ?? Icons.Sparkles;
  return <Icon size={size} strokeWidth={1.7} />;
}
function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

function Thumb({ outfit, height = 58 }: { outfit: AvatarOutfit; height?: number }) {
  return <StudentAvatar height={height} outfit={outfit} floatAnimation="none" alive={false} glowColor="rgba(15,23,42,0.10)" />;
}

// Reusable panel + control classes
const PANEL = "rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]";
const FREE_PILL = <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">Free</span>;
const optBase = "relative rounded-xl border-2 bg-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500";
const ring = (on: boolean) => (on ? "border-teal-600 ring-2 ring-teal-500/40" : "border-slate-200");

function SectionHeading({ title, badge }: { title: string; badge?: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
      {title} {badge}
    </h2>
  );
}

export default function ExplorerOutfitPage() {
  const router = useRouter();
  const student = useMemo(() => getActiveStudentProfile(), []);
  const [state, setState] = useState<EconomyState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [celebrate, setCelebrate] = useState(0);
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
  const owned = useMemo(() => new Set(state?.inventory.map((e) => e.item_key) ?? []), [state?.inventory]);
  const itemsBySlot = useMemo(() => {
    const map = new Map<string, EconomyItem[]>();
    for (const item of state?.items ?? []) {
      const slot = resolveSlot(item);
      const list = map.get(slot) ?? [];
      list.push(item);
      map.set(slot, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.sort_order - b.sort_order);
    return map;
  }, [state?.items]);

  const equippedTitle = useMemo(() => {
    const key = state?.equipped.title;
    return key ? state?.items.find((i) => i.item_key === key)?.name ?? null : null;
  }, [state?.equipped.title, state?.items]);
  const equippedPet = useMemo(() => {
    const key = state?.equipped.pet;
    return key ? state?.items.find((i) => i.item_key === key) ?? null : null;
  }, [state?.equipped.pet, state?.items]);
  const previewBackground = useMemo(() => {
    const key = state?.equipped.background;
    const item = key ? state?.items.find((i) => i.item_key === key) : undefined;
    return (item?.metadata as { image?: string } | undefined)?.image ?? null;
  }, [state?.equipped.background, state?.items]);

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

  async function equip(item: EconomyItem) {
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

  async function clearSlot(slot: string) {
    if (!student?.studentId || busy || !state?.equipped[slot]) return;
    setBusy(true);
    setMessage(null);
    try {
      commit(await unequipEconomySlot(student.studentId, slot));
    } catch (error) {
      setMessage(economyErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function surprise() {
    if (!student?.studentId || !state || busy) return;
    const b = pick(BODIES), s = pick(SKINS), c = pick(HAIRCOLORS), o = pick(OUTFITS), f = pick(FACES), h = pick(HAIRSTYLES);
    await updateBase({
      body: b.value, face: f[0], skin: s[0], skinShade: s[1], hair: c[0], hairShade: c[1],
      hairStyle: h[0], shirt: o[0], shirtTrim: o[1],
    }, true);
    // Equip a random owned item (or leave empty) for each visible avatar slot.
    setBusy(true);
    try {
      let next = state;
      for (const { slot } of ITEM_SLOTS) {
        if (!isAvatarSlot(slot)) continue;
        const ownedItems = (itemsBySlot.get(slot) ?? []).filter((i) => owned.has(i.item_key));
        if (ownedItems.length === 0) continue;
        // ~40% chance to leave the slot empty for variety.
        if (Math.random() < 0.4) continue;
        next = await equipEconomyItem(student.studentId, pick(ownedItems).item_key);
      }
      commit(next);
      bump();
    } catch (error) {
      setMessage(economyErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  const dotCls = (on: boolean) => `${optBase} h-9 w-9 rounded-full ${ring(on)}`;

  return (
    <main className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_-10%,#e7eefc,transparent),linear-gradient(#eef2f6,#e6ebf1)] text-slate-900">
      <EconomyHeader xp={state?.wallet.xp_balance} essence={state?.wallet.essence} rankLevel={getExplorerRank(state?.wallet.xp_earned ?? 0).level} />
      <div className="mx-auto max-w-[1180px] px-4 py-6 md:px-6">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">My Home</p>
          <h1 className="text-3xl font-black md:text-4xl">Explorer Outfit</h1>
          <p className="mt-1 text-sm text-slate-600">Get your explorer ready for the next adventure. Skin, hair, face and colours are free — everything else is earned through learning.</p>
        </div>
        {message || sessionMessage ? (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900" role="status">{message ?? sessionMessage}</div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          {/* Live preview */}
          <aside className="h-fit lg:sticky lg:top-20">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div
                className="relative flex min-h-[360px] items-center justify-center bg-cover bg-center p-6"
                style={previewBackground
                  ? { backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.12), rgba(15,23,42,0.34)), url('${previewBackground}')` }
                  : { background: "radial-gradient(ellipse 70% 60% at 50% 38%, #eef2f6, #d3dce6)" }}
              >
                <StudentAvatar height={300} outfit={merged} celebrateSignal={celebrate} glowColor="rgba(15,23,42,0.16)" />
                {equippedPet ? (
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-black text-slate-700 shadow-sm">
                    <ItemIcon item={equippedPet} size={16} /> {equippedPet.name}
                  </div>
                ) : null}
              </div>
              <div className="border-t border-slate-200 px-4 pt-3">
                <p className="text-lg font-black leading-tight">{firstName}</p>
                <p className="text-xs font-bold text-teal-700">{equippedTitle ?? "Explorer"}</p>
              </div>
              <div className="flex gap-2 p-3">
                <button type="button" onClick={surprise} disabled={!state || busy} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-extrabold text-slate-700 transition hover:border-teal-500 hover:bg-teal-50 disabled:opacity-50">
                  <Shuffle className="h-4 w-4" /> Surprise me
                </button>
                <button type="button" onClick={() => router.push("/marketplace")} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-extrabold text-white transition hover:bg-slate-800">
                  <Zap className="h-4 w-4" /> Get more
                </button>
              </div>
            </div>
          </aside>

          {/* Controls */}
          <div className="flex flex-col gap-4">
            {/* Character */}
            <section className={PANEL}>
              <SectionHeading title="Character" badge={FREE_PILL} />
              <div className="flex flex-wrap gap-3">
                {BODIES.map(({ value, label, hairStyle }) => {
                  const on = (base.body ?? "neutral") === value;
                  return (
                    <button key={value} type="button" aria-label={label} title={label} onClick={() => updateBase({ body: value, hairStyle }, true)} className={`${optBase} flex h-[112px] w-[92px] flex-col items-center overflow-hidden pt-1 ${ring(on)}`}>
                      {on ? <Check className="absolute right-1.5 top-1.5 h-4 w-4 text-teal-600" /> : null}
                      <Thumb outfit={{ ...merged, body: value, hairStyle }} height={78} />
                      <span className="mt-auto w-full truncate px-1 pb-1.5 text-center text-[11px] font-black text-slate-600">{label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Face */}
            <section className={PANEL}>
              <SectionHeading title="Face" badge={FREE_PILL} />
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
              <SectionHeading title="Skin tone" badge={FREE_PILL} />
              <div className="flex flex-wrap gap-2.5">
                {SKINS.map((s, i) => (
                  <button key={i} type="button" aria-label={`Skin tone ${i + 1}`} onClick={() => updateBase({ skin: s[0], skinShade: s[1] })} className={dotCls(base.skin === s[0])} style={{ background: `linear-gradient(160deg, ${s[0]}, ${s[1]})` }} />
                ))}
              </div>
            </section>

            {/* Hairstyle */}
            <section className={PANEL}>
              <SectionHeading title="Hairstyle" badge={FREE_PILL} />
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
              <SectionHeading title="Hair colour" badge={FREE_PILL} />
              <div className="flex flex-wrap gap-2.5">
                {HAIRCOLORS.map((c, i) => (
                  <button key={i} type="button" aria-label={c[2]} title={c[2]} onClick={() => updateBase({ hair: c[0], hairShade: c[1] })} className={dotCls(base.hair === c[0])} style={{ background: `linear-gradient(160deg, ${c[0]}, ${c[1]})` }} />
                ))}
              </div>
            </section>

            {/* Outfit colour */}
            <section className={PANEL}>
              <SectionHeading title="Outfit colour" badge={FREE_PILL} />
              <div className="flex flex-wrap gap-2.5">
                {OUTFITS.map(([shirt, trim, label]) => (
                  <button key={label} type="button" aria-label={label} title={label} onClick={() => updateBase({ shirt, shirtTrim: trim })} className={`${optBase} h-11 w-11 ${ring(base.shirt === shirt)}`} style={{ background: `linear-gradient(150deg, ${shirt}, ${trim})` }} />
                ))}
              </div>
            </section>

            {/* Earned gear — filters + config-driven slot sections */}
            <div className="sticky top-16 z-10 -mx-1 flex flex-wrap gap-1.5 rounded-xl bg-white/70 p-1.5 backdrop-blur">
              {FILTERS.map((f) => (
                <button key={f.id} type="button" onClick={() => setFilter(f.id)} className={`rounded-md px-2.5 py-1.5 text-[11px] font-black transition ${filter === f.id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                  {f.label}
                </button>
              ))}
            </div>

            {ITEM_SLOTS.map(({ slot, label }) => {
              const all = itemsBySlot.get(slot) ?? [];
              const activeFilter = FILTERS.find((f) => f.id === filter) ?? FILTERS[0];
              const items = all.filter((item) => activeFilter.test(item, owned.has(item.item_key)));
              if (all.length === 0) return null;
              const equippedKey = state?.equipped[slot];
              const avatar = isAvatarSlot(slot);
              const isBg = slot === "background";
              return (
                <section key={slot} className={PANEL}>
                  <SectionHeading title={label} />
                  {items.length === 0 ? (
                    <p className="text-xs font-semibold text-slate-400">Nothing here matches “{activeFilter.label}”.</p>
                  ) : (
                    <div className={`grid gap-2.5 ${isBg ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-3 sm:grid-cols-4 xl:grid-cols-5"}`}>
                      {/* None / take-off tile */}
                      <button type="button" onClick={() => clearSlot(slot)} className={`${optBase} flex ${isBg ? "h-24" : "h-[112px]"} flex-col items-center justify-center gap-1 ${ring(!equippedKey)}`}>
                        <span className="text-[11px] font-black text-slate-500">None</span>
                      </button>
                      {items.map((item) => {
                        const isOwned = owned.has(item.item_key);
                        const isOn = equippedKey === item.item_key;
                        const rarity = RARITY_STYLES[item.rarity];
                        const bgImage = isBg ? (item.metadata as { image?: string })?.image : undefined;
                        return (
                          <button key={item.item_key} type="button" title={item.name} onClick={() => equip(item)} disabled={busy} className={`${optBase} flex ${isBg ? "h-24" : "h-[112px]"} flex-col items-center overflow-hidden pt-1 disabled:opacity-60 ${ring(isOn)}`}>
                            {isOn ? <Check className="absolute right-1 top-1 z-10 h-4 w-4 rounded-full bg-white text-teal-600" /> : null}
                            {!isOwned ? (
                              <span className="absolute right-1 top-1 z-10 flex items-center gap-0.5 rounded bg-slate-900/85 px-1 py-0.5 text-[9px] font-black text-white"><Lock className="h-2.5 w-2.5" />{item.price}</span>
                            ) : null}
                            <span className="absolute left-1 top-1 z-10 rounded px-1 py-0.5 text-[8px] font-black uppercase" style={{ color: rarity.color, background: rarity.background }}>{rarity.label}</span>
                            {isBg && bgImage ? (
                              <span className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${bgImage}')`, opacity: isOwned ? 1 : 0.5 }} />
                            ) : avatar ? (
                              <div className={`mt-1.5 ${!isOwned ? "opacity-45" : ""}`}><Thumb outfit={layerPreview(base, item)} height={64} /></div>
                            ) : (
                              <div className={`mt-3 flex h-[52px] items-center justify-center ${!isOwned ? "opacity-45" : ""}`} style={{ color: item.accent }}><ItemIcon item={item} size={34} /></div>
                            )}
                            <span className={`mt-auto w-full truncate px-1 pb-1 text-center text-[9px] font-bold ${isBg ? "relative z-10 rounded bg-white/85 py-0.5" : ""}`} style={{ color: rarity.color }}>{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}

            <p className="flex items-center gap-2 px-1 pb-2 text-xs text-slate-500"><Sparkles className="h-3.5 w-3.5" /> Everything is cosmetic. Locked gear is unlocked with XP in the Marketplace.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
