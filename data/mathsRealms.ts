// ── Central maths realm registry ────────────────────────────────────────────
// ONE source of truth for the maths realms used by the Gem Vault, Realm Gems
// and future Realm Collections. Only "live" realms are selectable for learning;
// "coming_soon" realms are previewed as premium placeholders and must never
// route into unfinished content.
//
// NOTE: This is intentionally maths-only and independent of:
//   - data/programs/genres.ts (the Tower's all-subject genre list), and
//   - app/legends/page.tsx (Hall of Legends — deliberately left untouched).
// When a realm flips from "coming_soon" to "live", update realm-registry.ts only
// and the Gem system picks it up without further code changes.

import {
  REALM_REGISTRY,
  tryCanonicalRealmId,
  type CanonicalRealmId,
  type RealmLifecycle,
} from "@/lib/realms/realm-registry";

export type RealmStatus = RealmLifecycle;

export type MathsRealm = {
  /** Stable id — matches student_realm_progress.realm_id / economy realm_id for live realms. */
  realmId: CanonicalRealmId;
  portalId: string;
  slug: string;
  name: string;
  shortName: string;
  strand: string;
  status: RealmStatus;
  isSelectable: boolean;
  /** Number of Legends in this realm's collection (Prep→Y6 = 7 for live realms). */
  legendCount: number;
  legendCollectionName: string;
  /** lucide-react icon name. */
  iconKey: string;
  themeKey: string;
  displayOrder: number;
};

export const MATHS_REALMS: MathsRealm[] = Object.values(REALM_REGISTRY)
  .map((realm) => ({ ...realm }))
  .sort((a, b) => a.displayOrder - b.displayOrder);

/** Realms that are live and selectable for learning right now. */
export const LIVE_REALMS = MATHS_REALMS.filter((r) => r.status === "live");

/** Look up a realm by id. */
export function getMathsRealm(realmId: string): MathsRealm | undefined {
  const canonical = tryCanonicalRealmId(realmId);
  return canonical ? MATHS_REALMS.find((r) => r.realmId === canonical) : undefined;
}

/** A realm may be entered for learning only when it is live. */
export function isRealmSelectable(realmId: string): boolean {
  return getMathsRealm(realmId)?.isSelectable ?? false;
}

/** Ids of live realms — the set that "across all live realms" milestones use. */
export function getLiveRealmIds(): string[] {
  return LIVE_REALMS.map((r) => r.realmId);
}
