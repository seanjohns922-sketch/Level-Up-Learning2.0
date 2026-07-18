"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Lock, Shuffle, Sparkles, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import EconomyHeader from "@/components/economy/EconomyHeader";
import StudentAvatar, { type AvatarOutfit, type HairStyle } from "@/components/avatar/StudentAvatar";
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
  type AvatarLayerSlot,
  type EconomyItem,
  type EconomyState,
} from "@/lib/economy";
import { getActiveStudentProfile } from "@/lib/studentIdentity";

// ── Free base options (no XP — every student gets these) ────────────────────
const SKINS: Array<[string, string]> = [
  ["#f7d9bf", "#e2b58f"], ["#f1c8a6", "#d6a07a"], ["#e8b48a", "#c98d5f"], ["#d99e6f", "#b57544"],
  ["#c1854f", "#9c6432"], ["#a86a3c", "#834d26"], ["#8a5228", "#63381a"], ["#6b3d1d", "#4a2812"],
  ["#f4c2c2", "#dd9a9a"], ["#ffe0bd", "#eec39a"], ["#c68642", "#a3652c"], ["#5c3317", "#3f2110"],
];
const HAIRCOLORS: Array<[string, string]> = [
  ["#2e2422", "#161010"], ["#4a2e1c", "#2e1a0e"], ["#6b4423", "#432a13"], ["#8a5a2b", "#5c3a18"],
  ["#b5732e", "#8a5320"], ["#c9962f", "#9a6e1e"], ["#e0c084", "#c39f57"], ["#b0453b", "#7d2c25"],
  ["#9aa3ad", "#6b737c"], ["#4f6d9c", "#334b73"], ["#a1568f", "#753d68"], ["#3d8f7a", "#276055"],
];
const HAIRSTYLES: Array<[HairStyle, string]> = [
  ["swept", "Swept"], ["short", "Short"], ["tuft", "Tuft"], ["sidepart", "Side Part"],
  ["spiky", "Spiky"], ["curls", "Curls"], ["afro", "Afro"], ["buzz", "Buzz"],
  ["long", "Long"], ["ponytail", "Ponytail"], ["bun", "Top Knot"], ["pigtails", "Pigtails"], ["braids", "Braids"],
];
const OUTFITS: Array<[string, string, string]> = [
  ["#1d4ed8", "#93c5fd", "Blue"], ["#dc2626", "#fca5a5", "Red"], ["#166534", "#bbf7d0", "Green"],
  ["#0f766e", "#99f6e4", "Teal"], ["#d97706", "#fde68a", "Gold"], ["#7c3aed", "#ddd6fe", "Purple"],
  ["#334155", "#cbd5e1", "Slate"], ["#db2777", "#fbcfe8", "Pink"],
];

const LAYERS: Array<{ slot: AvatarLayerSlot; label: string }> = [
  { slot: "avatar_outfit", label: "Special outfits" },
  { slot: "avatar_hat", label: "Hats" },
  { slot: "avatar_glasses", label: "Glasses" },
  { slot: "avatar_cape", label: "Capes" },
  { slot: "avatar_backpack", label: "Backpacks" },
];

/** Outfit for a single item previewed over the free base look only. */
function layerPreview(base: AvatarOutfit, item: EconomyItem): AvatarOutfit {
  const layer = { ...(item.metadata as Record<string, unknown>) };
  delete layer.slot;
  return { ...base, ...layer } as AvatarOutfit;
}

function Thumb({ outfit }: { outfit: AvatarOutfit }) {
  return <StudentAvatar height={58} outfit={outfit} floatAnimation="none" glowColor="rgba(15,23,42,0.10)" />;
}

export default function WardrobePage() {
  const router = useRouter();
  const student = useMemo(() => getActiveStudentProfile(), []);
  const [state, setState] = useState<EconomyState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const sessionMessage = student?.studentId ? null : "Log in as a student to open the Avatar Studio.";

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
      const slot = (item.metadata as Record<string, unknown>)?.slot as string | undefined;
      if (slot && slot.startsWith("avatar_")) {
        const list = map.get(slot) ?? [];
        list.push(item);
        map.set(slot, list);
      }
    }
    return map;
  }, [state?.items]);

  function commit(next: EconomyState) {
    setState(next);
    if (student?.studentId) persistAvatarToStorage(student.studentId, next);
  }

  async function updateBase(patch: Partial<AvatarOutfit>) {
    if (!student?.studentId || !state) return;
    const nextBase = { ...base, ...patch };
    setState({ ...state, avatarBase: nextBase }); // optimistic
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
    } catch (error) {
      setMessage(economyErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function clearSlot(slot: AvatarLayerSlot) {
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

  function surprise() {
    const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
    const s = pick(SKINS), c = pick(HAIRCOLORS), o = pick(OUTFITS);
    void updateBase({
      skin: s[0], skinShade: s[1], hair: c[0], hairShade: c[1],
      hairStyle: pick(HAIRSTYLES)[0], shirt: o[0], shirtTrim: o[1],
    });
  }

  const optBase =
    "relative rounded-xl border-2 bg-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500";
  const dotCls = (on: boolean) => `${optBase} h-9 w-9 rounded-full ${on ? "border-teal-600 ring-2 ring-teal-500/40" : "border-slate-200"}`;

  return (
    <main className="min-h-screen bg-[#eef2f6] text-slate-900">
      <EconomyHeader xp={state?.wallet.xp_balance} essence={state?.wallet.essence} rankLevel={getExplorerRank(state?.wallet.xp_earned ?? 0).level} />
      <div className="mx-auto max-w-[1120px] px-4 py-6 md:px-6">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">My Home</p>
          <h1 className="text-3xl font-black md:text-4xl">Avatar Studio</h1>
          <p className="mt-1 text-sm text-slate-600">Pick a look. Skin, hair and colours are free — hats, capes and special outfits are unlocked in the Marketplace.</p>
        </div>
        {message || sessionMessage ? (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900" role="status">{message ?? sessionMessage}</div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          {/* Live preview */}
          <aside className="h-fit lg:sticky lg:top-20">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex min-h-[340px] items-center justify-center rounded-t-2xl bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,#eef2f6,#d3dce6)] p-6">
                <StudentAvatar height={300} outfit={merged} glowColor="rgba(15,23,42,0.12)" />
              </div>
              <div className="flex gap-2 border-t border-slate-200 p-3">
                <button type="button" onClick={surprise} disabled={!state} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-extrabold text-slate-700 hover:border-teal-500 disabled:opacity-50">
                  <Shuffle className="h-4 w-4" /> Surprise me
                </button>
                <button type="button" onClick={() => router.push("/marketplace")} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-extrabold text-white hover:bg-slate-800">
                  <Zap className="h-4 w-4" /> Get more
                </button>
              </div>
            </div>
          </aside>

          {/* Controls */}
          <div className="flex flex-col gap-4">
            {/* Skin tone */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Skin tone <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">Free</span></h2>
              <div className="flex flex-wrap gap-2.5">
                {SKINS.map((s, i) => (
                  <button key={i} type="button" aria-label={`Skin tone ${i + 1}`} onClick={() => updateBase({ skin: s[0], skinShade: s[1] })} className={dotCls(base.skin === s[0])} style={{ background: `linear-gradient(160deg, ${s[0]}, ${s[1]})` }} />
                ))}
              </div>
            </section>

            {/* Hairstyle */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Hairstyle <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">Free</span></h2>
              <div className="flex flex-wrap gap-2.5">
                {HAIRSTYLES.map(([value, label]) => {
                  const on = (base.hairStyle ?? "swept") === value;
                  return (
                    <button key={value} type="button" aria-label={label} title={label} onClick={() => updateBase({ hairStyle: value })} className={`${optBase} flex h-[84px] w-16 flex-col items-center overflow-hidden pt-1 ${on ? "border-teal-600 ring-2 ring-teal-500/40" : "border-slate-200"}`}>
                      <Thumb outfit={{ ...merged, hairStyle: value }} />
                      <span className="mt-auto w-full truncate px-1 pb-1 text-center text-[9px] font-bold text-slate-500">{label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Hair colour */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Hair colour <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">Free</span></h2>
              <div className="flex flex-wrap gap-2.5">
                {HAIRCOLORS.map((c, i) => (
                  <button key={i} type="button" aria-label={`Hair colour ${i + 1}`} onClick={() => updateBase({ hair: c[0], hairShade: c[1] })} className={dotCls(base.hair === c[0])} style={{ background: `linear-gradient(160deg, ${c[0]}, ${c[1]})` }} />
                ))}
              </div>
            </section>

            {/* Outfit colour */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Outfit colour <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">Free</span></h2>
              <div className="flex flex-wrap gap-2.5">
                {OUTFITS.map(([shirt, trim, label]) => (
                  <button key={label} type="button" aria-label={label} title={label} onClick={() => updateBase({ shirt, shirtTrim: trim })} className={`${optBase} h-11 w-11 ${base.shirt === shirt ? "border-teal-600 ring-2 ring-teal-500/40" : "border-slate-200"}`} style={{ background: `linear-gradient(150deg, ${shirt}, ${trim})` }} />
                ))}
              </div>
            </section>

            {/* Premium layers */}
            {LAYERS.map(({ slot, label }) => {
              const items = itemsBySlot.get(slot) ?? [];
              if (items.length === 0) return null;
              const equippedKey = state?.equipped[slot];
              return (
                <section key={slot} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</h2>
                  <div className="flex flex-wrap gap-2.5">
                    <button type="button" onClick={() => clearSlot(slot)} className={`${optBase} flex h-[84px] w-16 flex-col items-center justify-center ${!equippedKey ? "border-teal-600 ring-2 ring-teal-500/40" : "border-slate-200"}`}>
                      <span className="text-[11px] font-black text-slate-500">None</span>
                    </button>
                    {items.map((item) => {
                      const isOwned = owned.has(item.item_key);
                      const isOn = equippedKey === item.item_key;
                      const rarity = RARITY_STYLES[item.rarity];
                      return (
                        <button key={item.item_key} type="button" title={item.name} onClick={() => equip(item)} disabled={busy} className={`${optBase} flex h-[84px] w-16 flex-col items-center overflow-hidden pt-1 disabled:opacity-60 ${isOn ? "border-teal-600 ring-2 ring-teal-500/40" : "border-slate-200"}`}>
                          {isOn ? <Check className="absolute right-1 top-1 h-3.5 w-3.5 text-teal-600" /> : null}
                          {!isOwned ? (
                            <span className="absolute right-1 top-1 flex items-center gap-0.5 rounded bg-slate-900/80 px-1 py-0.5 text-[8px] font-black text-white"><Lock className="h-2.5 w-2.5" />{item.price}</span>
                          ) : null}
                          <div className={!isOwned ? "opacity-45" : ""}><Thumb outfit={layerPreview(base, item)} /></div>
                          <span className="mt-auto w-full truncate px-1 pb-1 text-center text-[9px] font-bold" style={{ color: rarity.color }}>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            <p className="flex items-center gap-2 px-1 pb-2 text-xs text-slate-500"><Sparkles className="h-3.5 w-3.5" /> Everything is cosmetic. Locked pieces are unlocked with XP in the Marketplace.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
