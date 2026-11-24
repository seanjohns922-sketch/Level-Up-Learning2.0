"use client";

import { supabase } from "@/lib/supabase";
import { saveFriendWorld, visitedFriendId } from "@/lib/friends";
import { getActiveStudentIdentity } from "@/lib/studentIdentity";

/** Keeps a learner's built world on their account, not just in this browser.
 * The browser copy stays as an instant cache; edits are sent to the account a
 * moment later (one save for a burst of edits), and opening the world loads the
 * account copy so it follows the learner to any device. */

export type ServerWorldLayout = { placements: unknown[]; groundTiles: unknown[]; revision: number; updatedAt: string };

const SAVE_DELAY_MS = 1500;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const pending = new Map<string, () => { placements: unknown[]; groundTiles: unknown[] }>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const savedListeners = new Set<(scope: string) => void>();

/** Called after a world is saved to the account (so friends in it can load the change straight away). */
export function onWorldSaved(listener: (scope: string) => void) {
  savedListeners.add(listener);
  return () => { savedListeners.delete(listener); };
}
const announceSaved = (scope: string) => savedListeners.forEach((listener) => listener(scope));

/** Only real learner accounts sync (your own world, or a friend's you're helping build); demo preview and guests stay in the browser. */
export function isSyncedWorldScope(scope: string) {
  const friendId = visitedFriendId(scope);
  return friendId ? UUID.test(friendId) : UUID.test(scope);
}

export async function fetchServerWorldLayout(studentId: string): Promise<ServerWorldLayout | null> {
  const { data, error } = await supabase.rpc("get_student_world_layout_secure", { p_student_id: studentId });
  if (error) throw error;
  if (!data || typeof data !== "object") return null;
  const layout = data as ServerWorldLayout;
  return Array.isArray(layout.placements) && Array.isArray(layout.groundTiles) ? layout : null;
}

async function send(scope: string) {
  const read = pending.get(scope);
  pending.delete(scope);
  timers.delete(scope);
  if (!read) return;
  const { placements, groundTiles } = read();
  // Helping build a friend's world saves to theirs (the server checks you're allowed), never to yours.
  const friendId = visitedFriendId(scope), me = getActiveStudentIdentity().studentId;
  if (friendId) {
    if (!me) return;
    await saveFriendWorld(me, friendId, { placements, groundTiles })
      .then(() => announceSaved(scope))
      .catch((error) => console.warn("[central-world] your friend's world could not be saved", error));
    return;
  }
  const { error } = await supabase.rpc("save_student_world_layout_secure", {
    p_student_id: scope,
    p_placements: placements,
    p_ground_tiles: groundTiles,
  });
  // The browser copy is still there; the next edit or visit retries the save.
  if (error) console.warn("[central-world] world layout could not be saved to the account", error);
  else announceSaved(scope);
}

/** Schedules a save; `read` is called when it is sent, so it always sends the latest layout. */
export function scheduleWorldLayoutSave(studentId: string, read: () => { placements: unknown[]; groundTiles: unknown[] }) {
  if (!isSyncedWorldScope(studentId)) return;
  pending.set(studentId, read);
  const existing = timers.get(studentId);
  if (existing) clearTimeout(existing);
  timers.set(studentId, setTimeout(() => void send(studentId), SAVE_DELAY_MS));
}

export function hasPendingWorldLayoutSave(studentId: string) {
  return pending.has(studentId);
}

/** Sends any waiting save straight away (when the learner leaves the page). */
export function flushWorldLayoutSaves() {
  for (const [studentId, timer] of timers) {
    clearTimeout(timer);
    void send(studentId);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushWorldLayoutSaves);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushWorldLayoutSaves();
  });
}
