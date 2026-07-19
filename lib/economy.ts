"use client";

import { supabase } from "@/lib/supabase";
import { EXPLORER_XP_LEVEL_BASE, getExplorerRankTitle } from "@/data/explorer-ranks";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import type { AvatarOutfit } from "@/components/avatar/StudentAvatar";

/** Equip slots that make up a layered avatar (base look + these stack on top). */
export const AVATAR_LAYER_SLOTS = [
  "avatar_outfit",
  "avatar_hat",
  "avatar_glasses",
  "avatar_cape",
  "avatar_backpack",
] as const;
export type AvatarLayerSlot = (typeof AVATAR_LAYER_SLOTS)[number];

/** Fields a student can freely set on their base look (no XP). */
export const AVATAR_BASE_KEYS = [
  "body",
  "face",
  "skin",
  "skinShade",
  "hair",
  "hairShade",
  "hairStyle",
  "shirt",
  "shirtTrim",
  "pants",
  "shoes",
] as const;

export type EconomyCategory =
  | "avatar"
  | "pet"
  | "home"
  | "background"
  | "decoration"
  | "collectible"
  | "trail"
  | "emote"
  | "nameplate"
  | "title"
  | "victory_effect";

export type EconomyRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type EconomyItem = {
  item_key: string;
  name: string;
  description: string;
  category: EconomyCategory;
  realm_id: "number" | "measurement" | null;
  rarity: EconomyRarity;
  price: number | null;
  icon: string;
  accent: string;
  purchasable: boolean;
  discoverable: boolean;
  active: boolean;
  sort_order: number;
  metadata: Record<string, unknown>;
};

export type EconomyState = {
  wallet: { xp_earned: number; xp_spent: number; xp_balance: number; essence: number };
  items: EconomyItem[];
  inventory: Array<{ item_key: string; acquired_at: string; acquisition_type: string }>;
  equipped: Record<string, string>;
  /** Free base look (skin tone, hairstyle, hair + clothing colour). */
  avatarBase: AvatarOutfit;
};

export type ExplorerRank = {
  level: number;
  title: string;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
};

export const EMPTY_ECONOMY: EconomyState = {
  wallet: { xp_earned: 0, xp_spent: 0, xp_balance: 0, essence: 0 },
  items: [],
  inventory: [],
  equipped: {},
  avatarBase: {},
};

function normalizeEconomyState(value: unknown): EconomyState {
  if (!value || typeof value !== "object") return EMPTY_ECONOMY;
  const row = value as Partial<EconomyState> & { avatar_base?: AvatarOutfit };
  const base = row.avatar_base ?? row.avatarBase;
  return {
    wallet: {
      xp_earned: Number(row.wallet?.xp_earned ?? 0),
      xp_spent: Number(row.wallet?.xp_spent ?? 0),
      xp_balance: Number(row.wallet?.xp_balance ?? 0),
      essence: Number(row.wallet?.essence ?? 0),
    },
    items: Array.isArray(row.items) ? row.items : [],
    inventory: Array.isArray(row.inventory) ? row.inventory : [],
    equipped: row.equipped && typeof row.equipped === "object" ? row.equipped : {},
    avatarBase: base && typeof base === "object" ? base : {},
  };
}

// ── Demo Preview economy ────────────────────────────────────────────────────
// Demo Preview mode has no real student wallet, so the economy is synthesised
// client-side: the full catalogue, everything owned, effectively unlimited XP.
// Equipped layers and the free avatar base persist to localStorage so the demo
// keeps its look across pages. Every mutator below short-circuits here.
const DEMO_BASE_STORAGE_KEY = "lul:demo-preview:avatar_base_v1";
const DEMO_EQUIPPED_STORAGE_KEY = "lul:demo-preview:equipped_v1";
const DEMO_WALLET = { xp_earned: 999999, xp_spent: 0, xp_balance: 999999, essence: 999 };

function readDemoJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeDemoJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function demoSlotFor(item: EconomyItem | undefined): string | null {
  if (!item) return null;
  return (item.metadata as { slot?: string })?.slot ?? item.category;
}

/** Full active catalogue (no student context). Used to build the demo economy. */
export async function fetchEconomyCatalog(): Promise<EconomyItem[]> {
  const { data, error } = await supabase.rpc("get_economy_catalog_secure");
  if (error) throw error;
  return Array.isArray(data) ? (data as EconomyItem[]) : [];
}

function buildDemoEconomyState(items: EconomyItem[]): EconomyState {
  const now = new Date().toISOString();
  return {
    wallet: { ...DEMO_WALLET },
    items,
    inventory: items.map((item) => ({ item_key: item.item_key, acquired_at: now, acquisition_type: "demo" })),
    equipped: readDemoJson<Record<string, string>>(DEMO_EQUIPPED_STORAGE_KEY, {}),
    avatarBase: readDemoJson<AvatarOutfit>(DEMO_BASE_STORAGE_KEY, {}),
  };
}

export async function fetchDemoEconomy(): Promise<EconomyState> {
  return buildDemoEconomyState(await fetchEconomyCatalog());
}

/**
 * Compose the rendered avatar from the free base look plus every equipped
 * avatar layer (outfit, hat, glasses, cape, backpack). Later layers win, so an
 * equipped outfit overrides the base clothing colour while the hat/cape/etc.
 * stack independently.
 */
export function mergeAvatarOutfit(state: EconomyState): AvatarOutfit {
  const out: Record<string, unknown> = { ...(state.avatarBase ?? {}) };
  const byKey = new Map(state.items.map((i) => [i.item_key, i]));
  for (const slot of AVATAR_LAYER_SLOTS) {
    const key = state.equipped[slot];
    if (!key) continue;
    const meta = byKey.get(key)?.metadata;
    if (!meta || typeof meta !== "object") continue;
    for (const [k, v] of Object.entries(meta)) {
      if (k !== "slot") out[k] = v;
    }
  }
  return out as AvatarOutfit;
}

export async function fetchStudentEconomy(studentId: string) {
  if (isDemoPreviewMode()) return fetchDemoEconomy();
  const { data, error } = await supabase.rpc("get_student_economy_secure", { p_student_id: studentId });
  if (error) throw error;
  return normalizeEconomyState(data);
}

export function getExplorerRank(lifetimeXp: number): ExplorerRank {
  const safeXp = Math.max(0, Math.floor(lifetimeXp));
  const level = Math.floor(Math.sqrt(safeXp / EXPLORER_XP_LEVEL_BASE)) + 1;
  const currentLevelXp = Math.pow(level - 1, 2) * EXPLORER_XP_LEVEL_BASE;
  const nextLevelXp = Math.pow(level, 2) * EXPLORER_XP_LEVEL_BASE;
  return {
    level,
    title: getExplorerRankTitle(level),
    currentXp: safeXp,
    nextLevelXp,
    progressPercent: Math.round(((safeXp - currentLevelXp) / Math.max(1, nextLevelXp - currentLevelXp)) * 100),
  };
}

export async function fetchGlobalXp(studentId: string) {
  const { data, error } = await supabase.rpc("get_student_global_xp_secure", { p_student_id: studentId });
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  return {
    balance: Math.max(0, Number(row?.xp_balance ?? 0)),
    lifetime: Math.max(0, Number(row?.xp_earned ?? 0)),
  };
}

export async function purchaseEconomyItem(studentId: string, itemKey: string) {
  // Demo owns everything already — treat a "buy" as a no-op refresh.
  if (isDemoPreviewMode()) return fetchDemoEconomy();
  const { data, error } = await supabase.rpc("purchase_economy_item_secure", {
    p_student_id: studentId,
    p_item_key: itemKey,
    p_purchase_key: crypto.randomUUID(),
  });
  if (error) throw error;
  return normalizeEconomyState(data);
}

export async function equipEconomyItem(studentId: string, itemKey: string) {
  if (isDemoPreviewMode()) {
    const items = await fetchEconomyCatalog();
    const slot = demoSlotFor(items.find((item) => item.item_key === itemKey));
    if (slot) {
      const equipped = readDemoJson<Record<string, string>>(DEMO_EQUIPPED_STORAGE_KEY, {});
      equipped[slot] = itemKey;
      writeDemoJson(DEMO_EQUIPPED_STORAGE_KEY, equipped);
    }
    return buildDemoEconomyState(items);
  }
  const { data, error } = await supabase.rpc("equip_economy_item_secure", {
    p_student_id: studentId,
    p_item_key: itemKey,
  });
  if (error) throw error;
  return normalizeEconomyState(data);
}

/**
 * Mirror the composed avatar into localStorage so every StudentAvatar that
 * reads its outfit from storage (world maps, dashboards) matches My Home.
 * Overwrites fully, so unequipped layers are cleared.
 */
export function persistAvatarToStorage(studentId: string, state: EconomyState) {
  if (typeof window === "undefined" || !studentId) return;
  try {
    window.localStorage.setItem(
      `lul:${studentId}:avatar_outfit_v1`,
      JSON.stringify(mergeAvatarOutfit(state)),
    );
  } catch {
    /* ignore */
  }
}

export async function unequipEconomySlot(studentId: string, slot: string) {
  if (isDemoPreviewMode()) {
    const equipped = readDemoJson<Record<string, string>>(DEMO_EQUIPPED_STORAGE_KEY, {});
    delete equipped[slot];
    writeDemoJson(DEMO_EQUIPPED_STORAGE_KEY, equipped);
    return fetchDemoEconomy();
  }
  const { data, error } = await supabase.rpc("unequip_economy_slot_secure", {
    p_student_id: studentId,
    p_slot: slot,
  });
  if (error) throw error;
  return normalizeEconomyState(data);
}

export async function saveAvatarBase(studentId: string, base: AvatarOutfit) {
  if (isDemoPreviewMode()) {
    writeDemoJson(DEMO_BASE_STORAGE_KEY, base);
    return fetchDemoEconomy();
  }
  const { data, error } = await supabase.rpc("set_student_avatar_base_secure", {
    p_student_id: studentId,
    p_base: base,
  });
  if (error) throw error;
  return normalizeEconomyState(data);
}

export function economyErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (/not enough xp/i.test(message)) return "Keep learning to earn enough XP for this item.";
  if (/already owned/i.test(message)) return "You already own this item.";
  if (/invalid|session|permission|authorized/i.test(message)) return "Your student session has expired. Please log in again.";
  if (/function .* does not exist|schema cache/i.test(message)) return "The Marketplace is being prepared. Please try again after the latest update.";
  return "That action could not be completed. Please try again.";
}

export const RARITY_STYLES: Record<EconomyRarity, { label: string; color: string; background: string }> = {
  common: { label: "Common", color: "#475569", background: "#f1f5f9" },
  uncommon: { label: "Uncommon", color: "#047857", background: "#d1fae5" },
  rare: { label: "Rare", color: "#0369a1", background: "#e0f2fe" },
  epic: { label: "Epic", color: "#7e22ce", background: "#f3e8ff" },
  legendary: { label: "Legendary", color: "#b45309", background: "#fef3c7" },
};
