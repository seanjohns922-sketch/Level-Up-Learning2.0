"use client";

import type { ProgressRealmScope } from "@/data/progress";
import { LIVE_REALM_IDS } from "@/lib/realms/realm-registry";
import { restoreStudentStateFromServer } from "@/lib/student-progress-sync";

export const WORLD3D_CANONICAL_RESTORED_EVENT = "level-up:world3d-canonical-restored";

export function announceCanonicalWorldStateRestored() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(WORLD3D_CANONICAL_RESTORED_EVENT));
}

export async function restoreCanonicalWorldState(studentId: string) {
  // Each restore checks the active student after its reads and synchronously
  // merges only its realm's cache entries. Independent network reads can overlap;
  // the world-ready event still waits for every realm to finish successfully.
  const entries = await Promise.all(LIVE_REALM_IDS.map(async (realmId) =>
    [realmId, await restoreStudentStateFromServer(studentId, realmId)] as const,
  ));
  const restored = new Map<ProgressRealmScope, Awaited<ReturnType<typeof restoreStudentStateFromServer>>>(entries);
  announceCanonicalWorldStateRestored();
  return restored;
}
