"use client";

import type { ProgressRealmScope } from "@/data/progress";
import { LIVE_REALM_IDS } from "@/lib/realms/realm-registry";
import { restoreStudentStateFromServer } from "@/lib/student-progress-sync";

export const WORLD3D_CANONICAL_RESTORED_EVENT = "level-up:world3d-canonical-restored";

export function announceCanonicalWorldStateRestored() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(WORLD3D_CANONICAL_RESTORED_EVENT));
}

export async function restoreCanonicalWorldState(studentId: string) {
  const restored = new Map<ProgressRealmScope, Awaited<ReturnType<typeof restoreStudentStateFromServer>>>();
  for (const realmId of LIVE_REALM_IDS) {
    restored.set(realmId, await restoreStudentStateFromServer(studentId, realmId));
  }
  announceCanonicalWorldStateRestored();
  return restored;
}
