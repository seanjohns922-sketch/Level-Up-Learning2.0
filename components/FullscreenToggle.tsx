"use client";

import { Maximize2, Minimize2 } from "lucide-react";
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

/**
 * Full screen on and off. Pages put it in their own top bar (`inline`, or the
 * compact `icon` look); the floating bottom-right copy in the root layout only
 * shows on pages that have no top-bar button. Hidden where the browser can't
 * go full screen (iPhone Safari).
 */
export function FullscreenToggle({ inline = false, icon = false, className, style }: { inline?: boolean; icon?: boolean; className?: string; style?: React.CSSProperties } = {}) {
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

  const label = isFullscreen ? "Exit full screen" : "Full screen";
  if (icon) {
    return (
      <button type="button" onClick={toggleFullscreen} data-inline="true" aria-label={label} title={label} style={style}
        className={`fullscreen-toggle inline-flex items-center justify-center ${className ?? "h-10 w-10 rounded-full border border-white/20 bg-slate-950/70 text-white transition hover:bg-slate-900"}`}>
        {isFullscreen ? <Minimize2 size={17} aria-hidden="true" /> : <Maximize2 size={17} aria-hidden="true" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      data-inline={inline ? "true" : undefined}
      className={className ? `fullscreen-toggle ${className}` : `fullscreen-toggle ${inline ? "rounded-lg px-2.5 py-1.5 text-xs" : "fixed bottom-4 right-4 z-[100] rounded-2xl px-4 py-2 text-sm"} border border-white/20 bg-slate-950/80 font-black text-white shadow-xl backdrop-blur transition hover:bg-slate-900`}
      style={inline ? undefined : { bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
      title={isFullscreen ? "Exit full screen" : "Enter full screen"}
    >
      {isFullscreen ? "Exit Full Screen" : "Full Screen"}
    </button>
  );
}
