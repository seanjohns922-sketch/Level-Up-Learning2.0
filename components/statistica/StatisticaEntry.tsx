"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readProgress } from "@/data/progress";
import { RealmDashboardError, RealmDashboardLoading } from "@/components/realms/dashboard";
import FocusLockGuard from "@/components/realms/FocusLockGuard";
import StatisticaMap, { STATISTICA_DASHBOARD_CONFIG } from "@/components/world/StatisticaMap";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { consumeRestoredRealmEntry } from "@/lib/realm-entry-handoff";
import { resolveRealmEntryRoute } from "@/lib/realm-entry";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { restoreStudentStateFromServer, StudentRestoreSupersededError } from "@/lib/student-progress-sync";
import { getActiveStudentIdentity, getActiveStudentProfile } from "@/lib/studentIdentity";

const SUPPORTED_LEVELS = new Set(["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"]);

export default function StatisticaEntry({ requestedLevel }: { requestedLevel?: string }) {
  const router = useRouter();
  const previewMode = isDemoPreviewMode();
  const [progress, setProgress] = useState(() => readProgress("statistics"));
  const [entryState, setEntryState] = useState<"loading" | "resolved" | "error">(
    previewMode ? "resolved" : "loading",
  );
  const [entryError, setEntryError] = useState<string | null>(null);
  const [entryAttempt, setEntryAttempt] = useState(0);

  const resolvedLevel = useMemo(() => {
    const candidate = previewMode ? requestedLevel : progress?.year;
    return (SUPPORTED_LEVELS.has(candidate ?? "") ? candidate : "Year 1") as RealmLevelId;
  }, [previewMode, progress?.year, requestedLevel]);

  useEffect(() => {
    if (previewMode) return;

    let cancelled = false;
    const identity = getActiveStudentIdentity();
    if (!identity.studentId) {
      router.replace("/login");
      return;
    }

    const acceptRestoredProgress = () => {
      const restoredProgress = readProgress("statistics");
      const profile = getActiveStudentProfile();
      const route = resolveRealmEntryRoute({
        realmId: "statistics",
        progress: restoredProgress,
        fallbackYear: profile?.yearLevel ?? "Year 1",
        introSeen: true,
      });
      if (route !== "/statistica") {
        router.replace(route);
        return;
      }
      setProgress(restoredProgress);
      setEntryState("resolved");
    };

    if (consumeRestoredRealmEntry(identity.studentId, "statistics")) {
      queueMicrotask(() => {
        if (!cancelled) acceptRestoredProgress();
      });
      return () => { cancelled = true; };
    }

    void restoreStudentStateFromServer(identity.studentId, "statistics")
      .then((restored) => {
        if (cancelled) return;
        const profile = getActiveStudentProfile();
        const route = resolveRealmEntryRoute({
          realmId: "statistics",
          progress: restored.progress,
          fallbackYear: profile?.yearLevel ?? "Year 1",
          introSeen: restored.introSeen,
        });
        if (route !== "/statistica") {
          router.replace(route);
          return;
        }
        setProgress(restored.progress);
        setEntryState("resolved");
      })
      .catch((error) => {
        if (cancelled || error instanceof StudentRestoreSupersededError) return;
        console.warn("[Statistica] Could not resolve canonical realm entry", error);
        setEntryError("We could not load your saved Statistica progress.");
        setEntryState("error");
      });

    return () => { cancelled = true; };
  }, [entryAttempt, previewMode, router]);

  if (entryState === "loading") return <RealmDashboardLoading config={STATISTICA_DASHBOARD_CONFIG} />;
  if (entryState === "error") {
    return (
      <RealmDashboardError
        config={STATISTICA_DASHBOARD_CONFIG}
        message={entryError ?? "We could not load Statistica."}
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
      <FocusLockGuard realmId="statistics" />
      <StatisticaMap key={resolvedLevel} level={resolvedLevel} />
    </>
  );
}
