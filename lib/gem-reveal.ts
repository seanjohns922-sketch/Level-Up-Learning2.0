"use client";

// Tiny cross-page reveal queue. Any code can award gems and enqueue the newly
// earned ones; a mounted <GemRevealHost/> shows the premium reveal. The gem is
// always persisted server-side BEFORE it reaches the queue.
import { evaluateGems, type GemDefinition, type GemVault } from "@/lib/gems";

let queue: GemDefinition[] = [];
const listeners = new Set<() => void>();

export function subscribeReveal(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
export function getRevealQueue(): GemDefinition[] {
  return queue;
}
export function enqueueReveal(gems: GemDefinition[]): void {
  if (!gems || gems.length === 0) return;
  queue = [...queue, ...gems];
  listeners.forEach((l) => l());
}
export function clearReveal(): void {
  queue = [];
  listeners.forEach((l) => l());
}

/**
 * Evaluate milestones, persist any newly-earned gems, and queue them for the
 * reveal. Returns the fresh vault (or null on failure). Never throws.
 */
export async function awardAndReveal(
  studentId: string,
  trigger: string,
  triggerId?: string,
): Promise<GemVault | null> {
  try {
    const { newly_awarded, vault } = await evaluateGems(studentId, trigger, triggerId);
    enqueueReveal(newly_awarded);
    return vault;
  } catch {
    return null;
  }
}
