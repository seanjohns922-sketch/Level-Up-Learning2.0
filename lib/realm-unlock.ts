import { levelIndexForYear } from "@/lib/level-catalog";
import { formatStudentLevelLabel, normalizeWorkingLevelLabel } from "@/lib/studentLevelLabel";
import {
  getRealmDefinition,
  tryCanonicalRealmId,
} from "@/lib/realms/realm-registry";

/**
 * Realm unlocking.
 *
 * Every realm has a curriculum floor: Number, Measurelands and Starpath start
 * at Ground, Statistica at Level 1, Pattern Peaks and Chance Hollow at Level 3.
 * A realm below a learner's reach must read as "not yet", never as a broken
 * screen, and unlocking only ever offers that realm's entry pre-test — the
 * child still starts at week 1 of its first level if the pre-test says so.
 *
 * The signal is the learner's highest working level across ALL realms, not the
 * level in the realm being opened (which is unset before they start). A Level 3
 * learner in Number may therefore try Chance Hollow, because reaching Level 3
 * anywhere is evidence they can attempt its entry test.
 */

export type RealmUnlockState =
  | { unlocked: true }
  | { unlocked: false; requiredLevel: string; requiredLevelLabel: string };

/** The first curriculum level a realm teaches (its floor). */
export function realmFloorLevel(realmId: string): string | null {
  const canonical = tryCanonicalRealmId(realmId);
  if (!canonical) return null;
  return getRealmDefinition(canonical).levelLabels[0] ?? null;
}

/**
 * Highest curriculum level reached across every realm, as a LEVEL_CATALOG
 * index. Returns -1 when nothing is placed yet.
 */
export function highestLevelIndex(levels: Iterable<string | null | undefined>) {
  let highest = -1;
  for (const level of levels) {
    const normalised = normalizeWorkingLevelLabel(level ?? undefined);
    if (!normalised) continue;
    highest = Math.max(highest, levelIndexForYear(normalised));
  }
  return highest;
}

/**
 * Whether a realm is open to a learner.
 *
 * `reachedLevels` is every working level the learner holds, in any realm. A
 * learner with no placements at all still gets the realms whose floor is
 * Ground, so a new Prep child is never locked out of everything.
 */
export function realmUnlockState(realmId: string, reachedLevels: Iterable<string | null | undefined>): RealmUnlockState {
  const floor = realmFloorLevel(realmId);
  if (!floor) return { unlocked: true };

  const floorIndex = levelIndexForYear(floor);
  if (floorIndex <= 0) return { unlocked: true };

  const reachedIndex = highestLevelIndex(reachedLevels);
  if (reachedIndex >= floorIndex) return { unlocked: true };

  return {
    unlocked: false,
    requiredLevel: floor,
    requiredLevelLabel: formatStudentLevelLabel(floor),
  };
}

/** Short child-facing reason shown on a locked realm card. */
export function realmUnlockLabel(state: RealmUnlockState) {
  return state.unlocked ? null : `Unlocks at ${state.requiredLevelLabel}`;
}

/**
 * The level a learner enters a realm at: their own reach, clamped into the
 * levels that realm actually teaches. This is what stops a Prep learner being
 * sent to a pre-test that does not exist.
 */
export function realmEntryLevel(realmId: string, preferredLevel: string | null | undefined): string | null {
  const canonical = tryCanonicalRealmId(realmId);
  if (!canonical) return preferredLevel ?? null;

  const levels = getRealmDefinition(canonical).levelLabels;
  if (levels.length === 0) return preferredLevel ?? null;

  const normalised = normalizeWorkingLevelLabel(preferredLevel ?? undefined);
  if (normalised && levels.includes(normalised)) return normalised;

  const preferredIndex = normalised ? levelIndexForYear(normalised) : -1;
  const firstIndex = levelIndexForYear(levels[0]!);
  const lastIndex = levelIndexForYear(levels[levels.length - 1]!);

  if (preferredIndex < firstIndex) return levels[0]!;
  if (preferredIndex > lastIndex) return levels[levels.length - 1]!;
  return levels[0]!;
}
