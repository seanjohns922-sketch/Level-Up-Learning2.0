"use client";

import type { Realm3DAccessReason } from "@/lib/world3d/access";

/** Shown when the 3D world cannot open. There is no other world to fall back to. */
export default function World3DUnavailable({ place, reason, background }: { place: string; reason?: Realm3DAccessReason; background: string }) {
  const noWebgl = reason === "webgl-unavailable";
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center text-white" style={{ background }}>
      <div className="max-w-md">
        <h1 className="text-2xl font-black">{noWebgl ? `${place} can't open on this device` : `${place} could not load`}</h1>
        <p className="mt-2 text-white/70">
          {noWebgl ? "This browser can't show 3D worlds. Try Chrome or Safari, or ask your teacher for help." : "Check your internet connection, then try again."}
        </p>
        <button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-md bg-white px-5 py-3 font-black text-stone-900">
          Try again
        </button>
      </div>
    </main>
  );
}
