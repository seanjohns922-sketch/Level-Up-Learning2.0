"use client";

// Direct-URL guard for Focus Mode. The carousel already blocks locked portals,
// but a student could paste a realm URL — so each live realm page mounts this to
// re-check the server-computed lock and bounce a blocked realm back to /realms.
// Renders nothing; teacher preview / demo surfaces are exempt (not a student).

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEMO_MODE } from "@/data/config";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { getStudentFocusLock, isRealmBlockedByFocus } from "@/lib/focus-lock";

export default function FocusLockGuard({ realmId }: { realmId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (DEMO_MODE || isDemoPreviewMode()) return;
    let cancelled = false;
    void getStudentFocusLock().then((lock) => {
      if (cancelled) return;
      if (isRealmBlockedByFocus(lock, realmId)) {
        router.replace("/realms");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [realmId, router]);

  return null;
}
