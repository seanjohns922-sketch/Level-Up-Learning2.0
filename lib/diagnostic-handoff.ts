const DIAGNOSTIC_PAUSE_KEY = "lul_paused_diagnostic_sitting_v1";

export function pauseDiagnosticHandoff(sittingId: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(DIAGNOSTIC_PAUSE_KEY, sittingId);
}

export function isDiagnosticHandoffPaused(sittingId: string) {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(DIAGNOSTIC_PAUSE_KEY) === sittingId;
}

export function clearDiagnosticHandoffPause() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(DIAGNOSTIC_PAUSE_KEY);
}
