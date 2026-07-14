"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isPlacementComplete, readProgress, updateProgress, writeProgress } from "@/data/progress";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { LEVEL_CATALOG } from "@/lib/level-catalog";
import { buildDefaultStudentProgress } from "@/lib/student-destination";

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

  useEffect(() => {
    // The Levels drawer carries the chosen level via ?level=. Persist it into
    // Number Nexus's (number-scoped) progress so the map renders that level.
    const requestedLevel = new URLSearchParams(window.location.search).get("level");
    const progress = readProgress();
    const preview = isDemoPreviewMode();
    if (
      requestedLevel &&
      LEVEL_CATALOG.some((lvl) => lvl.id === requestedLevel) &&
      (preview || isPlacementComplete(progress)) &&
      progress?.year !== requestedLevel
    ) {
      if (progress) updateProgress({ year: requestedLevel });
      else writeProgress(buildDefaultStudentProgress(requestedLevel));
    }

    if (preview) return;
    if (!isPlacementComplete(readProgress())) {
      router.replace("/home");
    }
  }, [router]);

  return <NumberNexusMap />;
}
