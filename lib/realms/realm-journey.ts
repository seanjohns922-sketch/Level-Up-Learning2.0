import {
  getRealmDefinition,
  type CanonicalRealmId,
} from "@/lib/realms/realm-registry";

export function isSharedWeeklyProgramRealm(realmId: CanonicalRealmId) {
  const realm = getRealmDefinition(realmId);
  return realm.totalWeeks != null && realm.lessonsPerWeek != null && realm.hasWeeklyQuiz;
}

export function requireSharedWeeklyProgramRealm(value: string): CanonicalRealmId {
  const realm = getRealmDefinition(value);
  if (!isSharedWeeklyProgramRealm(realm.realmId)) {
    throw new Error(`${realm.name} does not have a complete shared weekly-program contract`);
  }
  return realm.realmId;
}

export function buildRealmProgramHref(input: {
  realmId: CanonicalRealmId;
  year: string;
  week?: number;
  preview?: boolean;
  extra?: Record<string, string | number | undefined | null>;
}) {
  requireSharedWeeklyProgramRealm(input.realmId);
  const params = new URLSearchParams({
    year: input.year,
    week: String(input.week ?? 1),
    legacy: "1",
  });
  if (input.realmId !== "number") params.set("realm_id", input.realmId);
  if (input.preview) params.set("teacher_preview", "1");
  Object.entries(input.extra ?? {}).forEach(([key, value]) => {
    if (value != null && value !== "") params.set(key, String(value));
  });
  return `/program?${params.toString()}`;
}
