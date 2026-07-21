"use client";

import { DEMO_MODE } from "@/data/config";

export const DEMO_PREVIEW_STORAGE_KEY = "lul_demo_preview_mode_v1";
export const DEMO_PREVIEW_SCOPE = "demo-preview";

export function isDemoAccessFeatureEnabled() {
  return DEMO_MODE || process.env.NEXT_PUBLIC_DEMO_ACCESS_ENABLED === "true";
}

export function isDemoPreviewMode() {
  if (DEMO_MODE) return true;
  if (typeof window === "undefined") return false;
  return isDemoAccessFeatureEnabled() && window.localStorage.getItem(DEMO_PREVIEW_STORAGE_KEY) === "1";
}

export function activateDemoPreviewMode() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_PREVIEW_STORAGE_KEY, "1");
}

export function deactivateDemoPreviewMode() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEMO_PREVIEW_STORAGE_KEY);
  void fetch("/api/demo-access", { method: "DELETE", keepalive: true }).catch(() => undefined);
}
