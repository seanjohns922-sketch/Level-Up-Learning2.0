// Tracks the realm the student most recently entered so the dashboard can offer
// "Continue <realm>" instead of a hard-coded Number Nexus link.
const LAST_REALM_KEY = "lul:last_realm";
const DEFAULT_REALM = "number-nexus";

export function setLastRealm(realmId: string) {
  if (typeof window === "undefined" || !realmId) return;
  try {
    localStorage.setItem(LAST_REALM_KEY, realmId);
  } catch {
    /* ignore write failures (private mode, etc.) */
  }
}

export function getLastRealm(): string {
  if (typeof window === "undefined") return DEFAULT_REALM;
  try {
    return localStorage.getItem(LAST_REALM_KEY)?.trim() || DEFAULT_REALM;
  } catch {
    return DEFAULT_REALM;
  }
}
