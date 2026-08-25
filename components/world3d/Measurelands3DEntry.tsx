"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ACTIVE_STUDENT_KEY, isPlacementComplete } from "@/data/progress";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { restoreStudentStateFromServer, StudentRestoreSupersededError } from "@/lib/student-progress-sync";
import { resolveRealm3DAccess, type Realm3DAccessDecision } from "@/lib/world3d/access";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { setLastRealm } from "@/lib/last-realm";
import { announceCanonicalWorldStateRestored } from "@/lib/world3d/canonical-bootstrap";

const MeasurelandsLevel3World = dynamic(() => import("@/components/world3d/MeasurelandsLevel3World"), {
  ssr: false,
  loading: () => <div className="grid min-h-screen place-items-center bg-[#211812] font-semibold text-amber-200/80">Loading Measurelands...</div>,
});

const MEASURELANDS_3D_LEVELS: RealmLevelId[] = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

function resolvePreviewLevel(value: string | null): RealmLevelId {
  if (value === "Ground" || value === "Year 0") return "Prep";
  return MEASURELANDS_3D_LEVELS.includes(value as RealmLevelId) ? value as RealmLevelId : "Year 3";
}

export default function Measurelands3DEntry({ teacherPreview = false }: { teacherPreview?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storedPreviewMode = useDemoPreviewMode();
  const previewMode = teacherPreview || storedPreviewMode;
  const requestedLevel = resolvePreviewLevel(searchParams.get("level"));
  const [entry] = useState<{ decision: Realm3DAccessDecision; status: "loading" | "ready" | "disabled" }>(() => {
    const profile = getActiveStudentProfile();
    const decision = resolveRealm3DAccess({ realmId: "measurement", classId: profile?.classId, studentId: profile?.studentId, respectReducedMotion: true });
    return { decision, status: decision.canExplore3D ? "loading" : "disabled" };
  });
  const [status, setStatus] = useState(entry.status);
  const [resolvedLevel, setResolvedLevel] = useState<RealmLevelId>(requestedLevel);
  const displayStatus = previewMode && entry.decision.canExplore3D ? "ready" : status;

  useEffect(() => {
    if (!entry.decision.canExplore3D || previewMode) return;
    const studentId = window.localStorage.getItem(ACTIVE_STUDENT_KEY);
    if (!studentId) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    const restore = () => restoreStudentStateFromServer(studentId, "measurement")
      .then((restored) => {
        if (cancelled) return;
        if (!restored.progress || !isPlacementComplete(restored.progress)) {
          router.replace("/home");
          return;
        }
        if (!MEASURELANDS_3D_LEVELS.includes(restored.progress.year as RealmLevelId)) {
          router.replace("/measurelands");
          return;
        }
        setResolvedLevel(restored.progress.year as RealmLevelId);
        setStatus("ready");
        setLastRealm("measurelands");
        announceCanonicalWorldStateRestored();
      })
      .catch((error) => {
        if (cancelled || error instanceof StudentRestoreSupersededError) return;
        console.warn("[Measurelands3D] Could not restore progress", error);
        setStatus("disabled");
      });
    void restore();
    const onFocus = () => { void restore(); };
    window.addEventListener("focus", onFocus);
    return () => { cancelled = true; window.removeEventListener("focus", onFocus); };
  }, [entry.decision.canExplore3D, previewMode, router]);

  if (displayStatus === "loading") return <div className="grid min-h-screen place-items-center bg-[#211812] font-semibold text-amber-200/80">Loading saved progress...</div>;
  if (displayStatus === "disabled") {
    return <main className="grid min-h-screen place-items-center bg-[#211812] p-6 text-center text-white"><div><h1 className="text-2xl font-black">Measurelands 3D is not available</h1><p className="mt-2 text-amber-100/70">The standard Measurelands world is ready to use.</p><button type="button" onClick={() => router.push("/measurelands")} className="mt-5 rounded-md bg-amber-400 px-5 py-3 font-bold text-stone-950">Open 2D World</button></div></main>;
  }
  return <MeasurelandsLevel3World level={resolvedLevel} />;
}
