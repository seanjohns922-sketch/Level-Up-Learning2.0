"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { readProgress } from "@/data/progress";
import { getActiveStudentProfile, hasActiveStudentSeenIntro } from "@/lib/studentIdentity";

const MeasurelandsMap = dynamic(
  () => import("@/components/world/MeasurelandsMap"),
  {
    ssr: false,
    loading: () => (
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
    ),
  }
);

const SUPPORTED_MEASURELANDS_YEARS = new Set(["Prep", "Year 1", "Year 2", "Year 3", "Year 4"]);
type SupportedMeasurelandsYear = "Prep" | "Year 1" | "Year 2" | "Year 3" | "Year 4";

export default function MeasurelandsPage() {
  const router = useRouter();
  const previewMode = isDemoPreviewMode();
  const progressYear = readProgress()?.year;
  const [requestedYear, setRequestedYear] = useState<string | undefined>(undefined);
  const resolvedYear = useMemo(() => {
    const candidate = previewMode ? requestedYear ?? progressYear : progressYear ?? requestedYear;
    return SUPPORTED_MEASURELANDS_YEARS.has(candidate ?? "") ? (candidate as SupportedMeasurelandsYear) : "Prep";
  }, [previewMode, progressYear, requestedYear]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRequestedYear(params.get("level") ?? undefined);
  }, []);

  useEffect(() => {
    if (previewMode) return;

    const progress = readProgress();
    const studentProfile = getActiveStudentProfile();
    const introSeen = studentProfile?.studentId
      ? hasActiveStudentSeenIntro(studentProfile.studentId)
      : false;

    if (!introSeen) {
      router.replace("/home");
      return;
    }

    if (!SUPPORTED_MEASURELANDS_YEARS.has(progress?.year ?? "")) {
      router.replace(`/realms?level=${encodeURIComponent(progress?.year ?? "Prep")}`);
    }
  }, [previewMode, router]);

  return <MeasurelandsMap key={resolvedYear} year={resolvedYear} />;
}
