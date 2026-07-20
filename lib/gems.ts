"use client";

import { supabase } from "@/lib/supabase";
import { isDemoPreviewMode } from "@/lib/demo-mode";

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

const DEMO_FAVOURITE_GEM_STORAGE_KEY = "lul:demo-preview:favourite_gem_v1";

function readDemoFavouriteGemId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DEMO_FAVOURITE_GEM_STORAGE_KEY);
}

function buildDemoGemVault(definitions: GemDefinition[]): GemVault {
  const activeDefinitions = definitions.filter((definition) => definition.is_active !== false);
  const earnedAt = new Date().toISOString();
  const storedFavourite = readDemoFavouriteGemId();
  const favouriteGemId = activeDefinitions.some((definition) => definition.id === storedFavourite)
    ? storedFavourite
    : activeDefinitions[0]?.id ?? null;

  return {
    definitions: activeDefinitions.map((definition) => ({
      ...definition,
      current: Math.max(Number(definition.current ?? 0), Number(definition.target ?? 1)),
    })),
    owned: activeDefinitions.map((definition) => ({
      gem_id: definition.id,
      slug: definition.slug,
      earned_at: earnedAt,
      source_type: "demo_preview",
    })),
    favourite_gem_id: favouriteGemId,
    totals: { demo_preview: { complete: true } },
  };
}

export async function fetchGemVault(studentId: string): Promise<GemVault> {
  if (isDemoPreviewMode()) return fetchDemoGemVault();
  const { data, error } = await supabase.rpc("get_gem_vault_secure", { p_student_id: studentId });
  if (error) throw error;
  return normalizeVault(data);
}

/** Ownership-free catalogue (Demo preview / no student): all locked, zero progress. */
export async function fetchGemCatalog(): Promise<GemVault> {
  const { data, error } = await supabase.rpc("get_gem_catalog_secure");
  if (error) throw error;
  return { definitions: Array.isArray(data) ? (data as GemDefinition[]) : [], owned: [], favourite_gem_id: null, totals: {} };
}

/** Complete, non-persistent reward showcase used only by Demo Preview mode. */
export async function fetchDemoGemVault(): Promise<GemVault> {
  const catalog = await fetchGemCatalog();
  return buildDemoGemVault(catalog.definitions);
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
  if (isDemoPreviewMode()) {
    return { newly_awarded: [], vault: await fetchDemoGemVault() };
  }
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
  if (isDemoPreviewMode()) {
    if (typeof window !== "undefined") {
      if (gemId) window.localStorage.setItem(DEMO_FAVOURITE_GEM_STORAGE_KEY, gemId);
      else window.localStorage.removeItem(DEMO_FAVOURITE_GEM_STORAGE_KEY);
    }
    return fetchDemoGemVault();
  }
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
