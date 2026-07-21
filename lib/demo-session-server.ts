import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { resolveStarpathAccess, type StarpathAccessResult } from "@/lib/starpath-access";

export const DEMO_SESSION_COOKIE = "lul_demo_session_v1";
export const DEMO_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

function demoSessionSecret() {
  return process.env.DEMO_ACCESS_SECRET?.trim() || process.env.DEMO_ACCESS_CODE?.trim() || null;
}

function signatureForTimestamp(timestamp: string, secret: string) {
  return createHmac("sha256", secret).update(`level-up-demo:${timestamp}`).digest("base64url");
}

export function createDemoSessionToken(now = Date.now()) {
  const secret = demoSessionSecret();
  if (!secret) throw new Error("Demo session secret is not configured");
  const timestamp = String(now);
  return `${timestamp}.${signatureForTimestamp(timestamp, secret)}`;
}

export function verifyDemoSessionToken(token: string | undefined, now = Date.now()) {
  const secret = demoSessionSecret();
  if (!secret || !token) return false;
  const [timestamp, suppliedSignature, extra] = token.split(".");
  if (!timestamp || !suppliedSignature || extra) return false;

  const issuedAt = Number(timestamp);
  const maxAgeMs = DEMO_SESSION_MAX_AGE_SECONDS * 1000;
  if (!Number.isFinite(issuedAt) || issuedAt > now + 30_000 || now - issuedAt > maxAgeMs) return false;

  const expected = Buffer.from(signatureForTimestamp(timestamp, secret));
  const supplied = Buffer.from(suppliedSignature);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export async function getServerStarpathAccess(): Promise<StarpathAccessResult> {
  const staticDemoMode = process.env.NEXT_PUBLIC_ADMIN_MODE === "true";
  const demoFeatureEnabled = staticDemoMode || process.env.NEXT_PUBLIC_DEMO_ACCESS_ENABLED === "true";
  if (staticDemoMode) {
    return resolveStarpathAccess({ demoFeatureEnabled: true, authorizedDemoSession: true });
  }

  const cookieStore = await cookies();
  const authorizedDemoSession = verifyDemoSessionToken(
    cookieStore.get(DEMO_SESSION_COOKIE)?.value,
  );
  return resolveStarpathAccess({ demoFeatureEnabled, authorizedDemoSession });
}
