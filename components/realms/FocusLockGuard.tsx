"use client";

// Direct-URL guard for realm locks (Placements > Realm access). The world and the
// carousel already block locked realms, but a student could paste a realm URL, so
// each live realm page mounts this to re-check and bounce a locked realm to /realms.
// Renders nothing; teacher preview / demo surfaces are exempt (not a student).

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEMO_MODE } from "@/data/config";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { getStudentRealmLocks, isRealmLocked } from "@/lib/realm-locks";

export default function FocusLockGuard({ realmId }: { realmId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (DEMO_MODE || isDemoPreviewMode()) return;
    let cancelled = false;
    void getStudentRealmLocks().then((locks) => {
      if (cancelled) return;
      if (isRealmLocked(locks, realmId)) {
        router.replace("/realms");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [realmId, router]);

  return null;
}
