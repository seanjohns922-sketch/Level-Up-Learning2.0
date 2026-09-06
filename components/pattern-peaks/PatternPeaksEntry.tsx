"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readProgress } from "@/data/progress";
import { RealmDashboardError, RealmDashboardLoading } from "@/components/realms/dashboard";
import FocusLockGuard from "@/components/realms/FocusLockGuard";
import PatternPeaksMap, { PATTERN_PEAKS_DASHBOARD_CONFIG } from "@/components/world/PatternPeaksMap";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { consumeRestoredRealmEntry } from "@/lib/realm-entry-handoff";
import { resolveRealmEntryRoute } from "@/lib/realm-entry";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { restoreStudentStateFromServer, StudentRestoreSupersededError } from "@/lib/student-progress-sync";
import { getActiveStudentIdentity, getActiveStudentProfile } from "@/lib/studentIdentity";

const SUPPORTED_LEVELS = new Set(["Year 3", "Year 4", "Year 5", "Year 6"]);

export default function PatternPeaksEntry({ requestedLevel }: { requestedLevel?: string }) {
  const router = useRouter();
  const previewMode = isDemoPreviewMode();
  const [progress, setProgress] = useState(() => readProgress("pattern"));
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

    const resolveRestoredProgress = (restoredProgress = readProgress("pattern"), introSeen = true) => {
      const profile = getActiveStudentProfile();
      const route = resolveRealmEntryRoute({
        realmId: "pattern",
        progress: restoredProgress,
        fallbackYear: profile?.yearLevel ?? "Year 3",
        introSeen,
      });
      if (route !== "/pattern-peaks") {
        router.replace(route);
        return;
      }
      setProgress(restoredProgress);
      setEntryState("resolved");
    };

    if (consumeRestoredRealmEntry(identity.studentId, "pattern")) {
      queueMicrotask(() => { if (!cancelled) resolveRestoredProgress(); });
      return () => { cancelled = true; };
    }

    void restoreStudentStateFromServer(identity.studentId, "pattern")
      .then((restored) => {
        if (!cancelled) resolveRestoredProgress(restored.progress, restored.introSeen);
      })
      .catch((error) => {
        if (cancelled || error instanceof StudentRestoreSupersededError) return;
        console.warn("[Pattern Peaks] Could not resolve canonical realm entry", error);
        setEntryError("We could not load your saved Pattern Peaks progress.");
        setEntryState("error");
      });

    return () => { cancelled = true; };
  }, [entryAttempt, previewMode, router]);

  if (entryState === "loading") return <RealmDashboardLoading config={PATTERN_PEAKS_DASHBOARD_CONFIG} />;
  if (entryState === "error") {
    return (
      <RealmDashboardError
        config={PATTERN_PEAKS_DASHBOARD_CONFIG}
        message={entryError ?? "We could not load Pattern Peaks."}
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
      <FocusLockGuard realmId="pattern" />
      <PatternPeaksMap key={resolvedLevel} level={resolvedLevel} />
    </>
  );
}
