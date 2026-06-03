"use client";

import { ACTIVE_STUDENT_KEY } from "@/data/progress";
import { DEMO_PREVIEW_SCOPE, isDemoPreviewMode } from "@/lib/demo-mode";

const LEGEND_UNLOCK_VIDEO_STORAGE_KEY = "lul_legend_unlock_video_seen_v1";

function getLegendVideoScope() {
  if (typeof window === "undefined") return "server";
  if (isDemoPreviewMode()) return DEMO_PREVIEW_SCOPE;
  const active = window.localStorage.getItem(ACTIVE_STUDENT_KEY);
  if (active && active.trim()) return active.trim();
  const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";
  return isDemo ? "demo" : "anon";
}

function getScopedLegendVideoKey(scope = getLegendVideoScope()) {
  return `lul:${scope}:${LEGEND_UNLOCK_VIDEO_STORAGE_KEY}`;
}

function readSeenLegendVideoIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(getScopedLegendVideoKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

function writeSeenLegendVideoIds(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getScopedLegendVideoKey(), JSON.stringify(Array.from(new Set(ids))));
}

export function hasSeenLegendUnlockVideo(legendId: string) {
  return readSeenLegendVideoIds().includes(legendId);
}

export function markLegendUnlockVideoSeen(legendId: string) {
  if (!legendId) return;
  const seen = readSeenLegendVideoIds();
  if (seen.includes(legendId)) return;
  writeSeenLegendVideoIds([...seen, legendId]);
}
