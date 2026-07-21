export type StarpathAccessResult =
  | { allowed: true; mode: "demo" }
  | {
      allowed: false;
      reason: "not-demo-mode" | "invalid-session" | "unsupported-access";
    };

export function resolveStarpathAccess(input: {
  demoFeatureEnabled: boolean;
  authorizedDemoSession: boolean;
}): StarpathAccessResult {
  if (!input.demoFeatureEnabled) {
    return { allowed: false, reason: "not-demo-mode" };
  }
  if (!input.authorizedDemoSession) {
    return { allowed: false, reason: "invalid-session" };
  }
  return { allowed: true, mode: "demo" };
}
