"use client";

import { useSyncExternalStore } from "react";
import { DEMO_MODE } from "@/data/config";

export const DEMO_PREVIEW_STORAGE_KEY = "lul_demo_preview_mode_v1";
export const DEMO_PREVIEW_SCOPE = "demo-preview";
const ACTIVE_STUDENT_KEY = "lul_active_student_v1";
const DEMO_PREVIEW_CHANGE_EVENT = "lul:demo-preview-change";

function subscribeDemoPreviewMode(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(DEMO_PREVIEW_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(DEMO_PREVIEW_CHANGE_EVENT, onStoreChange);
  };
}

export function isDemoAccessFeatureEnabled() {
  return DEMO_MODE || process.env.NEXT_PUBLIC_DEMO_ACCESS_ENABLED === "true";
}

export function isDemoPreviewMode() {
  if (DEMO_MODE) return true;
  if (typeof window === "undefined") return false;
  const activeStudent = window.localStorage.getItem(ACTIVE_STUDENT_KEY)?.trim();
  if (new URLSearchParams(window.location.search).get("teacher_preview") === "1") {
    // A URL flag must never turn a real student's canonical journey into an
    // unrestricted preview. Teacher previews run without a real student scope.
    return !activeStudent || activeStudent === DEMO_PREVIEW_SCOPE;
  }
  return isDemoAccessFeatureEnabled() &&
    window.localStorage.getItem(DEMO_PREVIEW_STORAGE_KEY) === "1" &&
    activeStudent === DEMO_PREVIEW_SCOPE;
}

export function useDemoPreviewMode() {
  return useSyncExternalStore(subscribeDemoPreviewMode, isDemoPreviewMode, () => DEMO_MODE);
}

export function activateDemoPreviewMode() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_PREVIEW_STORAGE_KEY, "1");
  window.dispatchEvent(new Event(DEMO_PREVIEW_CHANGE_EVENT));
}

export function deactivateDemoPreviewMode() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEMO_PREVIEW_STORAGE_KEY);
  window.dispatchEvent(new Event(DEMO_PREVIEW_CHANGE_EVENT));
  void fetch("/api/demo-access", { method: "DELETE", keepalive: true }).catch(() => undefined);
}
