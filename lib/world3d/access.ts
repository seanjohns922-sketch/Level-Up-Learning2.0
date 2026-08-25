"use client";

import { isDemoPreviewMode } from "@/lib/demo-mode";
import type { CanonicalRealmId } from "@/lib/realms/realm-registry";

export type Realm3DAccessReason =
  | "allowed"
  | "global-disabled"
  | "unsupported-realm"
  | "school-not-enabled"
  | "class-not-enabled"
  | "student-not-enabled"
  | "webgl-unavailable"
  | "reduced-motion";

export type Realm3DAccessDecision = {
  canExplore3D: boolean;
  reason: Realm3DAccessReason;
  source: "dev" | "demo" | "platform" | "school" | "student" | "device";
};

export type Realm3DAccessInput = {
  realmId: CanonicalRealmId;
  schoolId?: string | null;
  classId?: string | null;
  studentId?: string | null;
  respectReducedMotion?: boolean;
};

const SUPPORTED_REALMS = new Set<CanonicalRealmId>(["number", "measurement", "space"]);
function parseAllowList(value: string | undefined) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export function canBrowserRunRealm3D(options: { respectReducedMotion?: boolean } = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return { ok: true as const };
  if (options.respectReducedMotion && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return { ok: false as const, reason: "reduced-motion" as const };
  }
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

  const device = canBrowserRunRealm3D({ respectReducedMotion: input.respectReducedMotion });
  if (!device.ok) {
    return { canExplore3D: false, reason: device.reason, source: "device" };
  }

  if (process.env.NODE_ENV !== "production") {
    return { canExplore3D: true, reason: "allowed", source: "dev" };
  }

  if (process.env.NEXT_PUBLIC_ENABLE_REALM_3D === "0") {
    return { canExplore3D: false, reason: "global-disabled", source: "platform" };
  }

  if (isDemoPreviewMode()) {
    return { canExplore3D: true, reason: "allowed", source: "demo" };
  }

  const schoolAllowList = parseAllowList(process.env.NEXT_PUBLIC_REALM_3D_SCHOOL_ALLOWLIST);
  if (schoolAllowList.size > 0 && (!input.schoolId || !schoolAllowList.has(input.schoolId))) {
    return { canExplore3D: false, reason: "school-not-enabled", source: "school" };
  }

  const classAllowList = parseAllowList(process.env.NEXT_PUBLIC_REALM_3D_CLASS_ALLOWLIST);
  if (classAllowList.size > 0 && (!input.classId || !classAllowList.has(input.classId))) {
    return { canExplore3D: false, reason: "class-not-enabled", source: "school" };
  }

  const studentAllowList = parseAllowList(process.env.NEXT_PUBLIC_REALM_3D_STUDENT_ALLOWLIST);
  if (studentAllowList.size > 0 && (!input.studentId || !studentAllowList.has(input.studentId))) {
    return { canExplore3D: false, reason: "student-not-enabled", source: "student" };
  }

  return { canExplore3D: true, reason: "allowed", source: "platform" };
}

export function resolvePostLoginExperience(input: Realm3DAccessInput & { fallbackHref: string }) {
  if (process.env.NEXT_PUBLIC_REALM_3D_DEFAULT === "0") return input.fallbackHref;
  return resolveRealm3DAccess(input).canExplore3D ? "/world" : input.fallbackHref;
}
