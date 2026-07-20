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

function MeasurelandsLoading() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#07121a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "2px solid rgba(125,211,252,0.15)",
          borderTopColor: "#22d3ee",
          animation: "spin 0.9s linear infinite",
        }}
      />
      <p
        style={{
          color: "rgba(186,230,253,0.7)",
          fontSize: 11,
          fontFamily: "ui-monospace,monospace",
          letterSpacing: "0.2em",
          fontWeight: 700,
        }}
      >
        INITIALISING MEASURELANDS…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const MeasurelandsMap = dynamic(
  () => import("@/components/world/MeasurelandsMap"),
  {
    ssr: false,
    loading: () => <MeasurelandsLoading />,
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
  const resolvedYear = useMemo(() => {
    // The level the user actually clicked (?level=) is authoritative whenever it
    // is a supported Measurelands level — in both preview and normal mode.
    // Only fall back to the saved progress year when no valid level was chosen,
    // so clicking "Level 4 → Measurelands" never snaps back to Ground Level.
    const requested = SUPPORTED_MEASURELANDS_YEARS.has(requestedYear ?? "")
      ? requestedYear
      : undefined;
    const candidate = requested ?? progressYear;
    return SUPPORTED_MEASURELANDS_YEARS.has(candidate ?? "") ? (candidate as SupportedMeasurelandsYear) : "Prep";
  }, [progressYear, requestedYear]);

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

  if (entryState === "loading") return <MeasurelandsLoading />;

  if (entryState === "error") {
    return (
      <main className="min-h-screen bg-[#07121a] flex flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="text-base font-bold text-red-200">{entryError}</p>
        <button
          type="button"
          onClick={() => {
            setEntryError(null);
            setEntryState("loading");
            setEntryAttempt((attempt) => attempt + 1);
          }}
          className="rounded-lg bg-cyan-500 px-5 py-3 font-bold text-slate-950"
        >
          Try Again
        </button>
      </main>
    );
  }

  return <MeasurelandsMap key={resolvedYear} year={resolvedYear} />;
}
