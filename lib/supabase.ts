"use client";

import { createClient } from "@supabase/supabase-js";
import { STUDENT_SESSION_TOKEN_KEY } from "@/lib/studentIdentity";

const supabaseUrl = "https://dqncplrxjxvjqbmwcyia.supabase.co";
const supabaseAnonKey = "sb_publishable_cvaUEdcS16I8T3EqAydiaA_ES8XRgOo";
const supabaseProjectRef = "dqncplrxjxvjqbmwcyia";
const supabaseAuthStorageKey = `sb-${supabaseProjectRef}-auth-token`;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (input, init = {}) => {
      const headers = new Headers(init.headers);
      const requestUrl =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      // Student RPCs need this header, but Supabase Auth requests must remain
      // independent of stale or unavailable student browser storage.
      if (typeof window !== "undefined" && !requestUrl.includes("/auth/v1/")) {
        try {
          const studentSession = window.localStorage.getItem(STUDENT_SESSION_TOKEN_KEY)?.trim();
          if (studentSession) headers.set("x-student-session", studentSession);
        } catch {
          // Allow public login requests to continue when storage is unavailable.
        }
      }
      return fetch(input, { ...init, headers });
    },
  },
  auth: {
    storageKey: supabaseAuthStorageKey,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function isInvalidRefreshTokenError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /invalid refresh token|refresh token not found/i.test(message);
}

export function isOpaqueAuthError(error: unknown) {
  const message =
    typeof error === "string"
      ? error.trim()
      : error instanceof Error
        ? error.message.trim()
        : error && typeof error === "object" && "message" in error &&
            typeof error.message === "string"
          ? error.message.trim()
          : "";
  return !message || message === "{}" || message === "[object Object]";
}

export function getAuthErrorMessage(error: unknown, fallback: string) {
  const message =
    typeof error === "string"
      ? error.trim()
      : error instanceof Error
        ? error.message.trim()
        : error && typeof error === "object" && "message" in error &&
            typeof error.message === "string"
          ? error.message.trim()
          : "";

  if (!message || message === "{}" || message === "[object Object]") {
    return fallback;
  }
  if (/invalid login credentials/i.test(message)) {
    return "Email or password is incorrect.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Verify your email before logging in.";
  }
  if (/failed to fetch|network request failed/i.test(message)) {
    return "The login service could not be reached. Check your connection and try again.";
  }
  return message;
}

export function clearSupabaseAuthStorage() {
  if (typeof window === "undefined") return;

  const keysToRemove = new Set<string>([
    supabaseAuthStorageKey,
    "supabase.auth.token",
  ]);

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key && /^sb-.+-auth-token$/.test(key)) {
      keysToRemove.add(key);
    }
  }

  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
}

export function recoverInvalidRefreshToken(error: unknown) {
  if (!isInvalidRefreshTokenError(error)) return false;
  clearSupabaseAuthStorage();
  return true;
}

export function recoverAuthSessionError(error: unknown) {
  if (!isInvalidRefreshTokenError(error) && !isOpaqueAuthError(error)) return false;
  clearSupabaseAuthStorage();
  return true;
}
