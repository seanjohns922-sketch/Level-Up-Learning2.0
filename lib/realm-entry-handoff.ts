"use client";

import type { ProgressRealmScope } from "@/data/progress";

const HANDOFF_KEY = "levelup.realm-entry-handoff.v1";
const HANDOFF_MAX_AGE_MS = 30_000;

type RealmEntryHandoff = {
  studentId: string;
  realmId: ProgressRealmScope;
  createdAt: number;
};

export function markRealmEntryRestored(studentId: string, realmId: ProgressRealmScope) {
  if (typeof window === "undefined") return;
  const handoff: RealmEntryHandoff = { studentId, realmId, createdAt: Date.now() };
  window.sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(handoff));
}

export function consumeRestoredRealmEntry(studentId: string, realmId: ProgressRealmScope) {
  if (typeof window === "undefined") return false;

  const raw = window.sessionStorage.getItem(HANDOFF_KEY);
  window.sessionStorage.removeItem(HANDOFF_KEY);
  if (!raw) return false;

  try {
    const handoff = JSON.parse(raw) as Partial<RealmEntryHandoff>;
    return handoff.studentId === studentId
      && handoff.realmId === realmId
      && typeof handoff.createdAt === "number"
      && Date.now() - handoff.createdAt <= HANDOFF_MAX_AGE_MS;
  } catch {
    return false;
  }
}
