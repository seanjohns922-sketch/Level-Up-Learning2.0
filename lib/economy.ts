"use client";

import { supabase } from "@/lib/supabase";
import { EXPLORER_XP_LEVEL_BASE, getExplorerRankTitle } from "@/data/explorer-ranks";

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
};

function normalizeEconomyState(value: unknown): EconomyState {
  if (!value || typeof value !== "object") return EMPTY_ECONOMY;
  const row = value as Partial<EconomyState>;
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
  };
}

export async function fetchStudentEconomy(studentId: string) {
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
  const { data, error } = await supabase.rpc("purchase_economy_item_secure", {
    p_student_id: studentId,
    p_item_key: itemKey,
    p_purchase_key: crypto.randomUUID(),
  });
  if (error) throw error;
  return normalizeEconomyState(data);
}

export async function equipEconomyItem(studentId: string, itemKey: string) {
  const { data, error } = await supabase.rpc("equip_economy_item_secure", {
    p_student_id: studentId,
    p_item_key: itemKey,
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
