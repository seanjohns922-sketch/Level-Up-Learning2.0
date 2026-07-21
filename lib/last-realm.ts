// Tracks the realm the student most recently entered so the dashboard can offer
// "Continue <realm>" instead of a hard-coded Number Nexus link.
import { ACTIVE_STUDENT_KEY } from "@/data/progress";

const LAST_REALM_KEY_VERSION = "last_realm_v1";

function lastRealmKey() {
  if (typeof window === "undefined") return null;
  const studentId = localStorage.getItem(ACTIVE_STUDENT_KEY)?.trim();
  return studentId ? `lul:${studentId}:${LAST_REALM_KEY_VERSION}` : null;
}

export function setLastRealm(realmId: string) {
  if (typeof window === "undefined" || !realmId) return;
  try {
    const key = lastRealmKey();
    if (key) localStorage.setItem(key, realmId);
  } catch {
    /* ignore write failures (private mode, etc.) */
  }
}

export function getLastRealm(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const key = lastRealmKey();
    return key ? localStorage.getItem(key)?.trim() || null : null;
  } catch {
    return null;
  }
}

// Starpath is a demo/preview realm with no saved-progress resume, so we store the
// exact world route to send "Continue Learning" back to where the student was.
const LAST_STARPATH_ROUTE_KEY_VERSION = "last_starpath_route_v1";

function lastStarpathRouteKey() {
  if (typeof window === "undefined") return null;
  const studentId = localStorage.getItem(ACTIVE_STUDENT_KEY)?.trim();
  return studentId ? `lul:${studentId}:${LAST_STARPATH_ROUTE_KEY_VERSION}` : null;
}

export function setLastStarpathRoute(route: string) {
  if (typeof window === "undefined" || !route.startsWith("/")) return;
  try {
    const key = lastStarpathRouteKey();
    if (key) localStorage.setItem(key, route);
  } catch {
    /* ignore */
  }
}

export function getLastStarpathRoute(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const key = lastStarpathRouteKey();
    const value = key ? localStorage.getItem(key)?.trim() : null;
    return value && value.startsWith("/") ? value : null;
  } catch {
    return null;
  }
}
