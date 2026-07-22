"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_OUTFIT,
  type AvatarOutfit,
} from "@/components/avatar/StudentAvatar";
import {
  fetchStudentEconomy,
  mergeAvatarOutfit,
  type EconomyState,
} from "@/lib/economy";
import { DEMO_PREVIEW_SCOPE, isDemoPreviewMode } from "@/lib/demo-mode";
import { getActiveStudentIdentity } from "@/lib/studentIdentity";

export const AVATAR_APPEARANCE_EVENT = "lul:avatar-appearance-updated";
const AVATAR_APPEARANCE_VERSION = 2;

export type CanonicalAvatarAppearance = Required<AvatarOutfit> & {
  petItemKey: string | null;
  titleItemKey: string | null;
  backgroundItemKey: string | null;
};

type CachedAvatarAppearance = {
  version: typeof AVATAR_APPEARANCE_VERSION;
  appearance: CanonicalAvatarAppearance;
};

function scopeFor(studentId?: string | null) {
  if (isDemoPreviewMode()) return DEMO_PREVIEW_SCOPE;
  return studentId?.trim() || getActiveStudentIdentity().studentId;
}

function cacheKey(scope: string) {
  return `lul:${scope}:avatar_appearance_v2`;
}

function legacyCacheKey(scope: string) {
  return `lul:${scope}:avatar_outfit_v1`;
}

function normalizeAppearance(
  outfit: AvatarOutfit,
  equipped: Record<string, string> = {},
): CanonicalAvatarAppearance {
  return {
    ...DEFAULT_OUTFIT,
    ...outfit,
    petItemKey: equipped.pet ?? null,
    titleItemKey: equipped.title ?? null,
    backgroundItemKey: equipped.background ?? null,
  };
}

export function appearanceFromEconomy(state: EconomyState): CanonicalAvatarAppearance {
  return normalizeAppearance(mergeAvatarOutfit(state), state.equipped);
}

export function readCachedAvatarAppearance(
  studentId?: string | null,
): CanonicalAvatarAppearance | null {
  if (typeof window === "undefined") return null;
  const scope = scopeFor(studentId);
  if (!scope) return null;

  try {
    const raw = window.localStorage.getItem(cacheKey(scope));
    if (raw) {
      const cached = JSON.parse(raw) as Partial<CachedAvatarAppearance>;
      if (cached.version === AVATAR_APPEARANCE_VERSION && cached.appearance) {
        return normalizeAppearance(cached.appearance, {
          pet: cached.appearance.petItemKey ?? "",
          title: cached.appearance.titleItemKey ?? "",
          background: cached.appearance.backgroundItemKey ?? "",
        });
      }
    }

    const legacy = window.localStorage.getItem(legacyCacheKey(scope));
    return legacy ? normalizeAppearance(JSON.parse(legacy) as AvatarOutfit) : null;
  } catch {
    return null;
  }
}

export function persistCanonicalAvatarAppearance(
  studentId: string,
  state: EconomyState,
): CanonicalAvatarAppearance {
  const appearance = appearanceFromEconomy(state);
  if (typeof window === "undefined") return appearance;
  const scope = scopeFor(studentId);
  if (!scope) return appearance;

  try {
    window.localStorage.setItem(
      cacheKey(scope),
      JSON.stringify({ version: AVATAR_APPEARANCE_VERSION, appearance } satisfies CachedAvatarAppearance),
    );
    window.localStorage.setItem(legacyCacheKey(scope), JSON.stringify(appearance));
    window.dispatchEvent(
      new CustomEvent(AVATAR_APPEARANCE_EVENT, { detail: { scope, appearance } }),
    );
  } catch {
    /* The server economy remains canonical when browser storage is unavailable. */
  }

  return appearance;
}

export function useCanonicalAvatarAppearance(studentId?: string | null) {
  const currentScope = scopeFor(studentId);
  const [resolved, setResolved] = useState<{
    scope: string | null;
    appearance: CanonicalAvatarAppearance;
  } | null>(null);

  useEffect(() => {
    const scope = scopeFor(studentId);
    if (!scope) {
      queueMicrotask(() => setResolved({ scope: null, appearance: normalizeAppearance({}) }));
      return;
    }

    let cancelled = false;
    const cached = readCachedAvatarAppearance(studentId);
    if (cached) queueMicrotask(() => setResolved({ scope, appearance: cached }));

    const handleAppearance = (event: Event) => {
      const detail = (event as CustomEvent<{
        scope?: string;
        appearance?: CanonicalAvatarAppearance;
      }>).detail;
      if (detail?.scope === scope && detail.appearance) {
        setResolved({ scope, appearance: detail.appearance });
      }
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === cacheKey(scope)) {
        const next = readCachedAvatarAppearance(studentId);
        if (next) setResolved({ scope, appearance: next });
      }
    };

    window.addEventListener(AVATAR_APPEARANCE_EVENT, handleAppearance);
    window.addEventListener("storage", handleStorage);

    void fetchStudentEconomy(scope)
      .then((state) => {
        if (!cancelled) {
          setResolved({
            scope,
            appearance: persistCanonicalAvatarAppearance(scope, state),
          });
        }
      })
      .catch(() => {
        if (!cancelled && !cached) {
          setResolved({ scope, appearance: normalizeAppearance({}) });
        }
      });

    return () => {
      cancelled = true;
      window.removeEventListener(AVATAR_APPEARANCE_EVENT, handleAppearance);
      window.removeEventListener("storage", handleStorage);
    };
  }, [studentId]);

  return resolved?.scope === currentScope ? resolved.appearance : null;
}
