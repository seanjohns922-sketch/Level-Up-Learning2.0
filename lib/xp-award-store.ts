"use client";

/** What the last lesson or quiz save actually banked, so finish screens show the
 *  real XP (or "already earned" on a replay) instead of a made-up number. */

export type XpAwardKind = "lesson" | "quiz";
export type XpAward = { kind: XpAwardKind; status: "saving" | "done" | "failed"; xp: number; at: number };

let current: XpAward | null = null;
const listeners = new Set<() => void>();

function emit(next: XpAward) {
  current = next;
  listeners.forEach((listener) => listener());
}

export function xpAwardSaving(kind: XpAwardKind) {
  emit({ kind, status: "saving", xp: 0, at: Date.now() });
}
export function xpAwardDone(kind: XpAwardKind, xp: number) {
  emit({ kind, status: "done", xp, at: Date.now() });
}
export function xpAwardFailed(kind: XpAwardKind) {
  emit({ kind, status: "failed", xp: 0, at: Date.now() });
}

export function subscribeXpAward(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function getXpAward() {
  return current;
}
