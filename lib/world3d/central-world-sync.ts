"use client";

import { supabase } from "@/lib/supabase";

/** Keeps a learner's built world on their account, not just in this browser.
 * The browser copy stays as an instant cache; edits are sent to the account a
 * moment later (one save for a burst of edits), and opening the world loads the
 * account copy so it follows the learner to any device. */

export type ServerWorldLayout = { placements: unknown[]; groundTiles: unknown[]; revision: number; updatedAt: string };

const SAVE_DELAY_MS = 1500;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const pending = new Map<string, () => { placements: unknown[]; groundTiles: unknown[] }>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

/** Only real learner accounts sync; demo preview and guests stay in the browser. */
export function isSyncedWorldScope(scope: string) {
  return UUID.test(scope);
}

export async function fetchServerWorldLayout(studentId: string): Promise<ServerWorldLayout | null> {
  const { data, error } = await supabase.rpc("get_student_world_layout_secure", { p_student_id: studentId });
  if (error) throw error;
  if (!data || typeof data !== "object") return null;
  const layout = data as ServerWorldLayout;
  return Array.isArray(layout.placements) && Array.isArray(layout.groundTiles) ? layout : null;
}

async function send(studentId: string) {
  const read = pending.get(studentId);
  pending.delete(studentId);
  timers.delete(studentId);
  if (!read) return;
  const { placements, groundTiles } = read();
  const { error } = await supabase.rpc("save_student_world_layout_secure", {
    p_student_id: studentId,
    p_placements: placements,
    p_ground_tiles: groundTiles,
  });
  // The browser copy is still there; the next edit or visit retries the save.
  if (error) console.warn("[central-world] world layout could not be saved to the account", error);
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
