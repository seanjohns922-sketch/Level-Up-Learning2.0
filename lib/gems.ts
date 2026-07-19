"use client";

import { supabase } from "@/lib/supabase";

export type GemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

/** A gem definition as returned by get_gem_vault_secure (with live progress). */
export type GemDefinition = {
  id: string;
  slug: string;
  name: string;
  description: string;
  rarity: GemRarity;
  /** UI tab grouping: lessons | perfect | quizzes_tests | streaks_xp | explorer | realm */
  category: string;
  milestone_type: string;
  threshold: number;
  realm_id: string | null;
  asset_key: string;
  silhouette_asset_key: string;
  display_order: number;
  is_active: boolean;
  active_for_completion: boolean;
  /** Student's current progress toward this gem's target. */
  current: number;
  /** Value needed to earn the gem (== threshold, except all_live_legends). */
  target: number;
};

export type OwnedGem = {
  gem_id: string;
  slug: string;
  earned_at: string;
  source_type: string;
};

export type GemVault = {
  definitions: GemDefinition[];
  owned: OwnedGem[];
  favourite_gem_id: string | null;
  totals: Record<string, number | Record<string, unknown>>;
};

export type GemEvaluation = {
  newly_awarded: GemDefinition[];
  vault: GemVault;
};

function normalizeVault(data: unknown): GemVault {
  const row = (data ?? {}) as Partial<GemVault>;
  return {
    definitions: Array.isArray(row.definitions) ? (row.definitions as GemDefinition[]) : [],
    owned: Array.isArray(row.owned) ? (row.owned as OwnedGem[]) : [],
    favourite_gem_id: (row.favourite_gem_id as string | null) ?? null,
    totals: (row.totals as GemVault["totals"]) ?? {},
  };
}

export async function fetchGemVault(studentId: string): Promise<GemVault> {
  const { data, error } = await supabase.rpc("get_gem_vault_secure", { p_student_id: studentId });
  if (error) throw error;
  return normalizeVault(data);
}

/**
 * Re-evaluate milestones and award any newly-satisfied gems. Safe to call after
 * any completion event (lesson, quiz, test, XP) or on Gem Vault load — the
 * server derives everything from canonical data, so this can never cheat.
 */
export async function evaluateGems(
  studentId: string,
  trigger = "manual",
  triggerId?: string,
): Promise<GemEvaluation> {
  const { data, error } = await supabase.rpc("evaluate_gems_secure", {
    p_student_id: studentId,
    p_trigger: trigger,
    p_trigger_id: triggerId ?? null,
  });
  if (error) throw error;
  const row = (data ?? {}) as { newly_awarded?: GemDefinition[]; vault?: unknown };
  return {
    newly_awarded: Array.isArray(row.newly_awarded) ? row.newly_awarded : [],
    vault: normalizeVault(row.vault),
  };
}

/** Choose the favourite displayed gem (must be owned) or pass null to clear. */
export async function setFavouriteGem(studentId: string, gemId: string | null): Promise<GemVault> {
  const { data, error } = await supabase.rpc("set_favourite_gem_secure", {
    p_student_id: studentId,
    p_gem_id: gemId,
  });
  if (error) throw error;
  return normalizeVault(data);
}

export const RARITY_LABEL: Record<GemRarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};
