import { getRealmDefinition, REALM_REGISTRY } from "./realms/realm-registry";

export const NUMBER_PROGRAM_WEEK_COUNT = REALM_REGISTRY.number.totalWeeks;
export const MEASURELANDS_PROGRAM_WEEK_COUNT = REALM_REGISTRY.measurement.totalWeeks;
export const STARPATH_PROGRAM_WEEK_COUNT = REALM_REGISTRY.space.totalWeeks;

export function getProgramWeekCount(realmId?: string | null): number {
  // Missing realm_id remains the legacy Number Nexus route contract. Any
  // supplied value must resolve explicitly and can never fall back to Number.
  if (realmId == null || realmId.trim() === "") return NUMBER_PROGRAM_WEEK_COUNT;
  const realm = getRealmDefinition(realmId);
  if (realm.totalWeeks == null) {
    throw new Error(`${realm.name} does not have a configured program length`);
  }
  return realm.totalWeeks;
}

export function getProgramWeeks(realmId?: string | null): number[] {
  return Array.from({ length: getProgramWeekCount(realmId) }, (_, index) => index + 1);
}

export function getLastProgramWeek(realmId?: string | null): number {
  return getProgramWeekCount(realmId);
}
