import { getAllLegends, getEffectiveUnlockedLegendIds, type LegendRealmId } from "@/data/legends";
import { readProgress } from "@/data/progress";

/** How many RELIQS cards a learner holds in each realm, as shown in Hall of Legends.
 *  Progress is realm-scoped in storage, so each realm is read from its own record.
 *  Client-only: reads this browser's progress records. */

type ReliqRealm = { legendRealm: LegendRealmId; progressScope: Parameters<typeof readProgress>[0] | null; name: string };

const RELIQ_REALMS: ReliqRealm[] = [
  { legendRealm: "number-nexus", progressScope: "number", name: "Number Nexus" },
  { legendRealm: "measurelands", progressScope: "measurement", name: "Measurelands" },
  { legendRealm: "starpath", progressScope: "space", name: "Starpath" },
  { legendRealm: "pattern-peaks", progressScope: "pattern", name: "Pattern Peaks" },
  // Statistica cards are not awarded from progress yet (Hall of Legends shows 0 outside Demo).
  { legendRealm: "statistica", progressScope: null, name: "Statistica" },
  { legendRealm: "chance-hollow", progressScope: "chance", name: "Chance Hollow" },
];

export type CollectedReliqs = { legendRealm: LegendRealmId; name: string; collected: number; total: number };

export function collectedReliqsByRealm(demoPreview: boolean): CollectedReliqs[] {
  return RELIQ_REALMS.map(({ legendRealm, progressScope, name }) => {
    const all = getAllLegends(legendRealm);
    if (demoPreview) return { legendRealm, name, collected: all.length, total: all.length };
    if (!progressScope) return { legendRealm, name, collected: 0, total: all.length };
    const progress = readProgress(progressScope);
    const unlocked = new Set(getEffectiveUnlockedLegendIds(progress?.year, progress?.unlockedLegends, legendRealm));
    return { legendRealm, name, collected: all.filter((legend) => unlocked.has(legend.id)).length, total: all.length };
  });
}
