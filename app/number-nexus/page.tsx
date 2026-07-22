"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ACTIVE_STUDENT_KEY, isPlacementComplete, readProgress, updateProgress, writeProgress } from "@/data/progress";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { LEVEL_CATALOG } from "@/lib/level-catalog";
import { buildDefaultStudentProgress } from "@/lib/student-destination";
import { enterReviewMode, exitReviewMode } from "@/lib/review-mode";
import { restoreStudentStateFromServer } from "@/lib/student-progress-sync";

const NumberNexusMap = dynamic(
  () => import("@/components/world/NumberNexusMap"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#020810",
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
            border: "2px solid rgba(94,234,212,0.15)",
            borderTopColor: "#14b8a6",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <p
          style={{
            color: "rgba(94,234,212,0.5)",
            fontSize: 11,
            fontFamily: "ui-monospace,monospace",
            letterSpacing: "0.2em",
            fontWeight: 700,
          }}
        >
          INITIALISING NUMBER NEXUS…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    ),
  }
);

export default function NumberNexusPage() {
  const router = useRouter();
  const [canonicalStatus, setCanonicalStatus] = useState<"loading" | "ready" | "error">(
    isDemoPreviewMode() ? "ready" : "loading",
  );

  useEffect(() => {
    const preview = isDemoPreviewMode();
    if (preview) return;
    const studentId = window.localStorage.getItem(ACTIVE_STUDENT_KEY);
    if (!studentId) {
      Promise.resolve().then(() => setCanonicalStatus("error"));
      return;
    }
    let cancelled = false;
    void restoreStudentStateFromServer(studentId, "number")
      .then((restored) => {
        if (!restored.progress) throw new Error("Canonical Number Nexus progress was not found");
        if (!cancelled) setCanonicalStatus("ready");
      })
      .catch((error) => {
        console.error("[NumberNexus] Canonical progression bootstrap failed", error);
        if (!cancelled) setCanonicalStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (canonicalStatus !== "ready") return;
    const params = new URLSearchParams(window.location.search);
    const requestedLevel = params.get("level");
    const isReview = params.get("review") === "1";
    const validLevel = !!requestedLevel && LEVEL_CATALOG.some((lvl) => lvl.id === requestedLevel);
    const progress = readProgress();
    const preview = isDemoPreviewMode();

    if (isReview && validLevel) {
      // Read-only review of an earlier level — set the flag (robust on refresh)
      // and persist nothing.
      enterReviewMode("number-nexus", requestedLevel!);
    } else {
      exitReviewMode();
      // Demo Preview can explore any level locally. Real student placement is
      // server-owned and must not be overwritten by a URL selection.
      if (
        preview &&
        validLevel &&
        progress?.year !== requestedLevel
      ) {
        if (progress) updateProgress({ year: requestedLevel! });
        else writeProgress(buildDefaultStudentProgress(requestedLevel!));
      }
    }

    if (preview) return;
    if (!isReview && !isPlacementComplete(readProgress())) {
      router.replace("/home");
    }
  }, [canonicalStatus, router]);

  if (canonicalStatus === "loading") {
    return <div className="grid min-h-screen place-items-center bg-[#020810] font-semibold text-teal-200/70">Loading saved progress...</div>;
  }
  if (canonicalStatus === "error") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#020810] px-6 text-center text-white">
        <div>
          <h1 className="text-2xl font-black">Saved progress could not be loaded</h1>
          <p className="mt-2 text-slate-300">Return to the Tower and try entering Number Nexus again.</p>
          <button type="button" onClick={() => router.push("/home")} className="mt-5 rounded-md bg-teal-600 px-5 py-3 font-bold text-white">
            Return to Tower
          </button>
        </div>
      </main>
    );
  }

  return <NumberNexusMap />;
}
