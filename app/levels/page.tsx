"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LEVEL_CATALOG } from "@/lib/level-catalog";
import { tryNormalizeStarpathLevel } from "@/lib/starpath-levels";

// Retired: the Choose-Your-Path level picker. Realm-first navigation means the
// realm is the primary choice and each realm resolves its own level, so this
// route now just forwards to the Tower of Knowledge (the realm selector). Kept
// as a redirect so old bookmarks / links still resolve.
function LevelsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedLevel = searchParams.get("level");
  const selectedLevel = LEVEL_CATALOG.some((level) => level.id === requestedLevel)
    ? requestedLevel
    : tryNormalizeStarpathLevel(requestedLevel);

  useEffect(() => {
    router.replace(selectedLevel ? `/realms?level=${encodeURIComponent(selectedLevel)}` : "/realms");
  }, [router, selectedLevel]);

  return <main className="min-h-screen bg-black" />;
}

export default function LevelsRedirectPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black" />}>
      <LevelsRedirect />
    </Suspense>
  );
}
