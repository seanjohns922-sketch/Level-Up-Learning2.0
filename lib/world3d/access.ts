"use client";

import type { CanonicalRealmId } from "@/lib/realms/realm-registry";

/**
 * The 3D world is the only student world. The 2D realm maps are retired, so the
 * only thing that can stop a student exploring is a device that cannot draw 3D.
 */
export type Realm3DAccessReason = "allowed" | "unsupported-realm" | "webgl-unavailable";

export type Realm3DAccessDecision = {
  canExplore3D: boolean;
  reason: Realm3DAccessReason;
  source: "platform" | "device";
};

export type Realm3DAccessInput = {
  realmId: CanonicalRealmId;
  schoolId?: string | null;
  classId?: string | null;
  studentId?: string | null;
};

const SUPPORTED_REALMS = new Set<CanonicalRealmId>(["number", "measurement", "space", "pattern", "statistics", "chance"]);

export function canBrowserRunRealm3D() {
  if (typeof window === "undefined" || typeof document === "undefined") return { ok: true as const };
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    return gl ? { ok: true as const } : { ok: false as const, reason: "webgl-unavailable" as const };
  } catch {
    return { ok: false as const, reason: "webgl-unavailable" as const };
  }
}

export function resolveRealm3DAccess(input: Realm3DAccessInput): Realm3DAccessDecision {
  if (!SUPPORTED_REALMS.has(input.realmId)) {
    return { canExplore3D: false, reason: "unsupported-realm", source: "platform" };
  }
  const device = canBrowserRunRealm3D();
  if (!device.ok) return { canExplore3D: false, reason: device.reason, source: "device" };
  return { canExplore3D: true, reason: "allowed", source: "platform" };
}
