"use client";

/**
 * A sound that's on unless it's been muted on this device (Rex, the Battle Arena), remembered in local
 * storage. Built for useSyncExternalStore: `on` reads it, `subscribe` hears it change, in this tab or another.
 */
export function makeSoundSwitch(storageKey: string) {
  const event = `${storageKey}:change`;
  const on = () => {
    try { return window.localStorage.getItem(storageKey) !== "1"; } catch { return true; }
  };
  const setMuted = (muted: boolean) => {
    try { window.localStorage.setItem(storageKey, muted ? "1" : "0"); } catch { /* the choice just isn't remembered */ }
    window.dispatchEvent(new Event(event));
  };
  const subscribe = (onChange: () => void) => {
    window.addEventListener(event, onChange);
    window.addEventListener("storage", onChange);
    return () => { window.removeEventListener(event, onChange); window.removeEventListener("storage", onChange); };
  };
  return { on, setMuted, subscribe };
}
