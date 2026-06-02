"use client";

import { ACTIVE_STUDENT_KEY } from "@/data/progress";
import { DEMO_PREVIEW_SCOPE, isDemoPreviewMode } from "@/lib/demo-mode";

const LEGACY_BEST_CHAIN_KEYS = [
  "lul_best_nexus_chain_v1",
  "bestChain",
  "levelup:bestChain",
  "numberNexusBestChain",
] as const;

function slugifyWorkingLevel(workingLevel: string) {
  return workingLevel
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getBestChainScope() {
  if (typeof window === "undefined") return "server";
  if (isDemoPreviewMode()) return DEMO_PREVIEW_SCOPE;
  const activeStudentId = window.localStorage.getItem(ACTIVE_STUDENT_KEY)?.trim();
  return activeStudentId || "anon";
}

export function getBestChainStorageKey(realmId: string, workingLevel: string) {
  return `lul:best_chain:${getBestChainScope()}:${realmId}:${slugifyWorkingLevel(workingLevel)}`;
}

export function readBestChain(realmId: string, workingLevel: string) {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(getBestChainStorageKey(realmId, workingLevel));
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

export function writeBestChain(realmId: string, workingLevel: string, chain: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getBestChainStorageKey(realmId, workingLevel), String(chain));
  } catch {
    // ignore storage write failures
  }
}

export function clearLegacyBestChainStorage() {
  if (typeof window === "undefined") return;
  for (const key of LEGACY_BEST_CHAIN_KEYS) {
    window.localStorage.removeItem(key);
  }
}
