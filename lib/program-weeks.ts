import { LEVEL8_WEEK_COUNTS, isLevel8Realm } from "./level8-config";
import { getRealmDefinition, REALM_REGISTRY } from "./realms/realm-registry";
import { CAVE7_WEEK_COUNTS, cave7Realm } from "./cave7-config";

export const NUMBER_PROGRAM_WEEK_COUNT = REALM_REGISTRY.number.totalWeeks;
export const MEASURELANDS_PROGRAM_WEEK_COUNT = REALM_REGISTRY.measurement.totalWeeks;
export const STARPATH_PROGRAM_WEEK_COUNT = REALM_REGISTRY.space.totalWeeks;

/**
 * Weeks in a realm's programme. Levels 7 and 8 have their own lengths per realm; every
 * earlier year keeps the realm's registered length.
 */
export function getProgramWeekCount(realmId?: string | null, year?: string | null): number {
  if (year === "Year 8") {
    const realm = realmId == null || realmId.trim() === "" ? "number" : realmId;
    if (isLevel8Realm(realm)) return LEVEL8_WEEK_COUNTS[realm];
  }
  if (year === "Year 7") {
    const realm = realmId == null || realmId.trim() === "" ? "number" : realmId;
    if (cave7Realm(realm)) return CAVE7_WEEK_COUNTS[realm];
  }
  // Missing realm_id remains the legacy Number Nexus route contract. Any
  // supplied value must resolve explicitly and can never fall back to Number.
  if (realmId == null || realmId.trim() === "") return NUMBER_PROGRAM_WEEK_COUNT;
  const realm = getRealmDefinition(realmId);
  if (realm.totalWeeks == null) {
    throw new Error(`${realm.name} does not have a configured program length`);
  }
  return realm.totalWeeks;
}

export function getProgramWeeks(realmId?: string | null, year?: string | null): number[] {
  return Array.from({ length: getProgramWeekCount(realmId, year) }, (_, index) => index + 1);
}

export function getLastProgramWeek(realmId?: string | null, year?: string | null): number {
  return getProgramWeekCount(realmId, year);
}
