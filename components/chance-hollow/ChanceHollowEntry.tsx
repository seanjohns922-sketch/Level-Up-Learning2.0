"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readProgress } from "@/data/progress";
import { RealmDashboardError, RealmDashboardLoading } from "@/components/realms/dashboard";
import FocusLockGuard from "@/components/realms/FocusLockGuard";
import ChanceHollowMap, { CHANCE_HOLLOW_DASHBOARD_CONFIG } from "@/components/world/ChanceHollowMap";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { consumeRestoredRealmEntry } from "@/lib/realm-entry-handoff";
import { resolveRealmEntryRoute } from "@/lib/realm-entry";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { restoreStudentStateFromServer, StudentRestoreSupersededError } from "@/lib/student-progress-sync";
import { getActiveStudentIdentity, getActiveStudentProfile } from "@/lib/studentIdentity";

const SUPPORTED_LEVELS = new Set(["Year 3", "Year 4", "Year 5", "Year 6"]);

export default function ChanceHollowEntry({ requestedLevel }: { requestedLevel?: string }) {
  const router = useRouter();
  const previewMode = isDemoPreviewMode();
  const [progress, setProgress] = useState(() => readProgress("chance"));
  const [entryState, setEntryState] = useState<"loading" | "resolved" | "error">(
    previewMode ? "resolved" : "loading",
  );
  const [entryError, setEntryError] = useState<string | null>(null);
  const [entryAttempt, setEntryAttempt] = useState(0);

  const resolvedLevel = useMemo(() => {
    const candidate = previewMode ? requestedLevel : progress?.year;
    return (SUPPORTED_LEVELS.has(candidate ?? "") ? candidate : "Year 3") as RealmLevelId;
  }, [previewMode, progress?.year, requestedLevel]);

  useEffect(() => {
    if (previewMode) return;
    let cancelled = false;
    const identity = getActiveStudentIdentity();
    if (!identity.studentId) {
      router.replace("/login");
      return;
    }

    const resolveRestoredProgress = (restoredProgress = readProgress("chance"), introSeen = true) => {
      const profile = getActiveStudentProfile();
      const route = resolveRealmEntryRoute({
        realmId: "chance",
        progress: restoredProgress,
        fallbackYear: profile?.yearLevel ?? "Year 3",
        introSeen,
      });
      if (route !== "/chance-hollow") {
        router.replace(route);
        return;
      }
      setProgress(restoredProgress);
      setEntryState("resolved");
    };

    if (consumeRestoredRealmEntry(identity.studentId, "chance")) {
      queueMicrotask(() => { if (!cancelled) resolveRestoredProgress(); });
      return () => { cancelled = true; };
    }

    void restoreStudentStateFromServer(identity.studentId, "chance")
      .then((restored) => {
        if (!cancelled) resolveRestoredProgress(restored.progress, restored.introSeen);
      })
      .catch((error) => {
        if (cancelled || error instanceof StudentRestoreSupersededError) return;
        console.warn("[Chance Hollow] Could not resolve canonical realm entry", error);
        setEntryError("We could not load your saved Chance Hollow progress.");
        setEntryState("error");
      });

    return () => { cancelled = true; };
  }, [entryAttempt, previewMode, router]);

  if (entryState === "loading") return <RealmDashboardLoading config={CHANCE_HOLLOW_DASHBOARD_CONFIG} />;
  if (entryState === "error") {
    return (
      <RealmDashboardError
        config={CHANCE_HOLLOW_DASHBOARD_CONFIG}
        message={entryError ?? "We could not load Chance Hollow."}
        onRetry={() => {
          setEntryError(null);
          setEntryState("loading");
          setEntryAttempt((attempt) => attempt + 1);
        }}
      />
    );
  }

  return (
    <>
      <FocusLockGuard realmId="chance" />
      <ChanceHollowMap key={resolvedLevel} level={resolvedLevel} />
    </>
  );
}
