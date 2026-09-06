"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ACTIVE_STUDENT_KEY, isPlacementComplete } from "@/data/progress";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { setLastRealm } from "@/lib/last-realm";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { restoreStudentStateFromServer, StudentRestoreSupersededError } from "@/lib/student-progress-sync";
import { resolveRealm3DAccess, type Realm3DAccessDecision } from "@/lib/world3d/access";
import { announceCanonicalWorldStateRestored } from "@/lib/world3d/canonical-bootstrap";

const PatternPeaksLevel3World = dynamic(() => import("@/components/world3d/PatternPeaksLevel3World"), {
  ssr: false,
  loading: () => <div className="grid min-h-screen place-items-center bg-[#17242d] font-semibold text-emerald-100/80">Opening Pattern Peaks...</div>,
});

const PATTERN_PEAKS_3D_LEVELS: RealmLevelId[] = ["Year 3", "Year 4", "Year 5", "Year 6"];

function resolvePreviewLevel(value: string | null): RealmLevelId {
  if (value === "Level 3" || value === "Year 3") return "Year 3";
  if (value === "Level 4" || value === "Year 4") return "Year 4";
  if (value === "Level 5" || value === "Year 5") return "Year 5";
  if (value === "Level 6" || value === "Year 6") return "Year 6";
  return "Year 3";
}

export default function PatternPeaks3DEntry({ teacherPreview = false }: { teacherPreview?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storedPreviewMode = useDemoPreviewMode();
  const previewMode = teacherPreview || storedPreviewMode;
  const requestedLevel = resolvePreviewLevel(searchParams.get("level"));
  const [entry] = useState<{ decision: Realm3DAccessDecision; status: "loading" | "ready" | "disabled" }>(() => {
    const profile = getActiveStudentProfile();
    const decision = resolveRealm3DAccess({ realmId: "pattern", classId: profile?.classId, studentId: profile?.studentId, respectReducedMotion: true });
    return { decision, status: decision.canExplore3D ? "loading" : "disabled" };
  });
  const [status, setStatus] = useState(entry.status);
  const [resolvedLevel, setResolvedLevel] = useState<RealmLevelId>(requestedLevel);
  const displayStatus = previewMode && entry.decision.canExplore3D ? "ready" : status;
  const has3DLevel = PATTERN_PEAKS_3D_LEVELS.includes(resolvedLevel);

  useEffect(() => {
    if (!previewMode || has3DLevel) return;
    router.replace(`/pattern-peaks?level=${encodeURIComponent(resolvedLevel)}${teacherPreview ? "&teacher_preview=1" : ""}`);
  }, [has3DLevel, previewMode, resolvedLevel, router, teacherPreview]);

  useEffect(() => {
    if (!entry.decision.canExplore3D || previewMode) return;
    const studentId = window.localStorage.getItem(ACTIVE_STUDENT_KEY);
    if (!studentId) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    const restore = () => restoreStudentStateFromServer(studentId, "pattern")
      .then((restored) => {
        if (cancelled) return;
        if (!restored.progress || !isPlacementComplete(restored.progress)) {
          router.replace("/home");
          return;
        }
        if (!PATTERN_PEAKS_3D_LEVELS.includes(restored.progress.year as RealmLevelId)) {
          router.replace(`/pattern-peaks?level=${encodeURIComponent(restored.progress.year)}`);
          return;
        }
        setResolvedLevel("Year 3");
        setStatus("ready");
        setLastRealm("pattern-peaks");
        announceCanonicalWorldStateRestored();
      })
      .catch((error) => {
        if (cancelled || error instanceof StudentRestoreSupersededError) return;
        console.warn("[PatternPeaks3D] Could not restore progress", error);
        setStatus("disabled");
      });
    void restore();
    const onFocus = () => { void restore(); };
    window.addEventListener("focus", onFocus);
    return () => { cancelled = true; window.removeEventListener("focus", onFocus); };
  }, [entry.decision.canExplore3D, previewMode, router]);

  if (displayStatus === "loading") return <div className="grid min-h-screen place-items-center bg-[#17242d] font-semibold text-emerald-100/80">Loading saved progress...</div>;
  if (!has3DLevel) return <div className="grid min-h-screen place-items-center bg-[#17242d] font-semibold text-emerald-100/80">Opening Pattern Peaks...</div>;
  if (displayStatus === "disabled") return <main className="grid min-h-screen place-items-center bg-[#17242d] p-6 text-center text-white"><div><h1 className="text-2xl font-black">Pattern Peaks 3D is not available</h1><p className="mt-2 text-emerald-100/70">The standard Pattern Peaks world is ready to use.</p><button type="button" onClick={() => router.push("/pattern-peaks")} className="mt-5 rounded-md bg-emerald-300 px-5 py-3 font-bold text-stone-950">Open 2D World</button></div></main>;
  return <PatternPeaksLevel3World level={resolvedLevel} />;
}
