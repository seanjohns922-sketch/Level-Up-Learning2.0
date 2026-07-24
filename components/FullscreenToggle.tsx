"use client";

import { useEffect, useState } from "react";

function isFullscreenActive() {
  if (typeof document === "undefined") return false;
  return Boolean(document.fullscreenElement);
}

export function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    setIsSupported(typeof document.documentElement.requestFullscreen === "function");
    const syncFullscreenState = () => setIsFullscreen(isFullscreenActive());
    const frame = window.requestAnimationFrame(syncFullscreenState);
    document.addEventListener("fullscreenchange", syncFullscreenState);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, []);

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
      className="fullscreen-toggle fixed bottom-4 right-4 z-[100] rounded-2xl border border-white/20 bg-slate-950/80 px-4 py-2 text-sm font-black text-white shadow-xl backdrop-blur transition hover:bg-slate-900"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
      title={isFullscreen ? "Exit full screen" : "Enter full screen"}
    >
      {isFullscreen ? "Exit Full Screen" : "Full Screen"}
    </button>
  );
}
