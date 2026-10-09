"use client";

import { useSyncExternalStore } from "react";

function isFullscreenActive() {
  if (typeof document === "undefined") return false;
  return Boolean(document.fullscreenElement);
}

function subscribeFullscreen(listener: () => void) {
  document.addEventListener("fullscreenchange", listener);
  return () => document.removeEventListener("fullscreenchange", listener);
}

function isFullscreenSupported() {
  return typeof document !== "undefined" && typeof document.documentElement.requestFullscreen === "function";
}

function serverFullscreenSnapshot() { return false; }

export function FullscreenToggle({ inline = false }: { inline?: boolean } = {}) {
  const isFullscreen = useSyncExternalStore(subscribeFullscreen, isFullscreenActive, serverFullscreenSnapshot);
  const isSupported = useSyncExternalStore(subscribeFullscreen, isFullscreenSupported, serverFullscreenSnapshot);

  async function toggleFullscreen() {
    if (!isSupported || typeof document === "undefined") return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.warn("[FullscreenToggle] Fullscreen toggle failed", error);
    }
  }

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      data-inline={inline ? "true" : undefined}
      className={`fullscreen-toggle ${inline ? "rounded-lg px-2.5 py-1.5 text-xs" : "fixed bottom-4 right-4 z-[100] rounded-2xl px-4 py-2 text-sm"} border border-white/20 bg-slate-950/80 font-black text-white shadow-xl backdrop-blur transition hover:bg-slate-900`}
      style={inline ? undefined : { bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
      title={isFullscreen ? "Exit full screen" : "Enter full screen"}
    >
      {isFullscreen ? "Exit Full Screen" : "Full Screen"}
    </button>
  );
}
