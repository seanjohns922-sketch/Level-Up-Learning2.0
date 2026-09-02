"use client";

import { setLastRealm } from "@/lib/last-realm";
import { getRealmAvailability, resolveRealmEntryRoute } from "@/lib/realm-entry";
import { markRealmEntryRestored } from "@/lib/realm-entry-handoff";
import { getRealmDefinition, type CanonicalRealmId } from "@/lib/realms/realm-registry";
import { exitReviewMode } from "@/lib/review-mode";
import { getActiveStudentIdentity, getActiveStudentProfile } from "@/lib/studentIdentity";
import { restoreStudentStateFromServer } from "@/lib/student-progress-sync";
import { resolveRealm3DAccess } from "@/lib/world3d/access";
import { announceCanonicalWorldStateRestored } from "@/lib/world3d/canonical-bootstrap";

export type TowerRealmEntryResult =
  | { status: "ready"; route: string }
  | { status: "unavailable"; message: string };

function appendPreview(route: string, preview: boolean) {
  if (!preview) return route;
  const separator = route.includes("?") ? "&" : "?";
  return `${route}${separator}teacher_preview=1`;
}

function adaptCanonicalRouteToAvailable3DWorld(route: string, realmId: CanonicalRealmId) {
  if (realmId === "number" && route === "/number-nexus") return "/world/number-nexus";
  if (realmId === "measurement" && route === "/measurelands") return "/world/measurelands";
  if (realmId === "space" && route === "/starpath") return "/world/starpath";
  if (realmId === "statistics" && route === "/statistica") return "/world/statistica";
  return route;
}

export async function resolveTowerRealmEntry(args: {
  realmId: CanonicalRealmId;
  teacherPreview: boolean;
}): Promise<TowerRealmEntryResult> {
  const realm = getRealmDefinition(args.realmId);
  if (args.teacherPreview && args.realmId === "pattern") {
    setLastRealm(realm.portalId);
    exitReviewMode();
    return {
      status: "ready",
      route: "/pattern-peaks?teacher_preview=1&level=Year%206",
    };
  }
  const availability = getRealmAvailability(realm.portalId);
  if (!availability?.enabled || realm.status !== "live" || !realm.isSelectable) {
    return { status: "unavailable", message: `${realm.name} is coming soon.` };
  }

  setLastRealm(realm.portalId);
  exitReviewMode();

  if (args.teacherPreview) {
    const previewRoute = adaptCanonicalRouteToAvailable3DWorld(availability.route, args.realmId);
    return { status: "ready", route: appendPreview(previewRoute, true) };
  }

  const identity = getActiveStudentIdentity();
  if (!identity.studentId) return { status: "ready", route: "/login" };

  const restored = await restoreStudentStateFromServer(identity.studentId, availability.progressRealmId);
  announceCanonicalWorldStateRestored();
  const profile = getActiveStudentProfile();
  const canonicalRoute = resolveRealmEntryRoute({
    realmId: availability.progressRealmId,
    progress: restored.progress,
    fallbackYear: profile?.yearLevel ?? "Year 1",
    introSeen: restored.introSeen,
  });
  if (canonicalRoute === availability.route) {
    markRealmEntryRestored(identity.studentId, availability.progressRealmId);
  }
  return {
    status: "ready",
    route: resolveRealm3DAccess({ realmId: args.realmId, classId: profile?.classId, studentId: identity.studentId, respectReducedMotion: true }).canExplore3D
      ? adaptCanonicalRouteToAvailable3DWorld(canonicalRoute, args.realmId)
      : canonicalRoute,
  };
}
