"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dqncplrxjxvjqbmwcyia.supabase.co";
const supabaseAnonKey = "sb_publishable_cvaUEdcS16I8T3EqAydiaA_ES8XRgOo";
const supabaseProjectRef = "dqncplrxjxvjqbmwcyia";
const supabaseAuthStorageKey = `sb-${supabaseProjectRef}-auth-token`;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
