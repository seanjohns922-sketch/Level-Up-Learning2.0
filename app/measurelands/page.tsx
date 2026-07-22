"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { readProgress } from "@/data/progress";
import { getActiveStudentIdentity, getActiveStudentProfile } from "@/lib/studentIdentity";
import { resolveRealmEntryRoute } from "@/lib/realm-entry";
import { restoreStudentStateFromServer, StudentRestoreSupersededError } from "@/lib/student-progress-sync";
import { consumeRestoredRealmEntry } from "@/lib/realm-entry-handoff";
import { RealmDashboardError, RealmDashboardLoading } from "@/components/realms/dashboard";
import { MEASURELANDS_DASHBOARD_CONFIG } from "@/components/world/MeasurelandsMap";

const MeasurelandsMap = dynamic(
  () => import("@/components/world/MeasurelandsMap"),
  {
    ssr: false,
    loading: () => <RealmDashboardLoading config={MEASURELANDS_DASHBOARD_CONFIG} />,
  }
);

const SUPPORTED_MEASURELANDS_YEARS = new Set(["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"]);
type SupportedMeasurelandsYear = "Prep" | "Year 1" | "Year 2" | "Year 3" | "Year 4" | "Year 5" | "Year 6";

export default function MeasurelandsPage() {
  const router = useRouter();
  const previewMode = isDemoPreviewMode();
  const [measurementProgress, setMeasurementProgress] = useState(() => readProgress("measurement"));
  const [entryState, setEntryState] = useState<"loading" | "resolved" | "error">(
    previewMode ? "resolved" : "loading",
  );
  const [entryError, setEntryError] = useState<string | null>(null);
  const [entryAttempt, setEntryAttempt] = useState(0);
  const progressYear = measurementProgress?.year;
  // Read the explicit ?level= choice from the Tower/realm picker up front (lazy
  // init) so the correct level renders on first paint with no Ground-Level flash.
  const [requestedYear] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return new URLSearchParams(window.location.search).get("level") ?? undefined;
  });
  const [requestedReview] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("review") === "1";
  });
  const resolvedYear = useMemo(() => {
    // A URL level may select Demo content or an explicit read-only review.
    // Live placement always comes from the canonical restored row.
    const requested = (previewMode || requestedReview) && SUPPORTED_MEASURELANDS_YEARS.has(requestedYear ?? "")
      ? requestedYear
      : undefined;
    const candidate = requested ?? progressYear;
    return SUPPORTED_MEASURELANDS_YEARS.has(candidate ?? "") ? (candidate as SupportedMeasurelandsYear) : "Prep";
  }, [previewMode, progressYear, requestedReview, requestedYear]);

  useEffect(() => {
    if (previewMode) return;

    let cancelled = false;
    const identity = getActiveStudentIdentity();
    if (!identity.studentId) {
      router.replace("/login");
      return;
    }

    // The realm carousel has already restored and resolved this exact entry.
    // Consume its short-lived handoff instead of repeating every secure RPC and
    // briefly sending the student back through the loading/error transition.
    if (consumeRestoredRealmEntry(identity.studentId, "measurement")) {
      const restoredProgress = readProgress("measurement");
      queueMicrotask(() => {
        if (cancelled) return;
        setMeasurementProgress(restoredProgress);
        setEntryState("resolved");
      });
      return () => {
        cancelled = true;
      };
    }

    void restoreStudentStateFromServer(identity.studentId, "measurement")
      .then((restored) => {
        if (cancelled) return;
        const profile = getActiveStudentProfile();
        const route = resolveRealmEntryRoute({
          realmId: "measurement",
          progress: restored.progress,
          fallbackYear: profile?.yearLevel ?? "Year 1",
          introSeen: restored.introSeen,
        });
        if (route !== "/measurelands") {
          router.replace(route);
          return;
        }
        setMeasurementProgress(restored.progress);
        setEntryState("resolved");
      })
      .catch((error) => {
        if (cancelled || error instanceof StudentRestoreSupersededError) return;
        console.warn("[Measurelands] Could not resolve realm entry", error);
        setEntryError("We could not load your Measurelands progress.");
        setEntryState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [entryAttempt, previewMode, router]);

  if (entryState === "loading") return <RealmDashboardLoading config={MEASURELANDS_DASHBOARD_CONFIG} />;

  if (entryState === "error") {
    return (
      <RealmDashboardError
        config={MEASURELANDS_DASHBOARD_CONFIG}
        message={entryError ?? "We could not load this realm."}
        onRetry={() => {
          setEntryError(null);
          setEntryState("loading");
          setEntryAttempt((attempt) => attempt + 1);
        }}
      />
    );
  }

  return <MeasurelandsMap key={resolvedYear} year={resolvedYear} />;
}
