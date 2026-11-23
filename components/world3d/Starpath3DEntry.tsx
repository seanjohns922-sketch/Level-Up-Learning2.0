"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ACTIVE_STUDENT_KEY, isPlacementComplete } from "@/data/progress";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { restoreStudentStateFromServer, StudentRestoreSupersededError } from "@/lib/student-progress-sync";
import World3DUnavailable from "@/components/world3d/World3DUnavailable";
import { realmOutside3DHref } from "@/lib/world3d/return-context";
import { getStarpathLevel, tryNormalizeStarpathLevel } from "@/lib/starpath-levels";
import { resolveRealm3DAccess, type Realm3DAccessDecision } from "@/lib/world3d/access";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { setLastRealm } from "@/lib/last-realm";
import { announceCanonicalWorldStateRestored } from "@/lib/world3d/canonical-bootstrap";

const StarpathLevel3World = dynamic(() => import("@/components/world3d/StarpathLevel3World"), {
  ssr: false,
  loading: () => <div className="grid min-h-screen place-items-center bg-[#0d1230] font-semibold text-cyan-100/80">Charting Starpath...</div>,
});

const STARPATH_3D_LEVELS: RealmLevelId[] = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

function resolvePreviewLevel(value: string | null): RealmLevelId {
  // Accepts both realm levels ("Year 4") and Starpath ids ("level-4", "ground").
  const id = tryNormalizeStarpathLevel(value === "Year 0" ? "prep" : value);
  return id ? (getStarpathLevel(id).yearLabel as RealmLevelId) : "Year 3";
}

export default function Starpath3DEntry({ teacherPreview = false }: { teacherPreview?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storedPreviewMode = useDemoPreviewMode();
  const previewMode = teacherPreview || storedPreviewMode;
  const requestedLevel = resolvePreviewLevel(searchParams.get("level"));
  const [entry] = useState<{ decision: Realm3DAccessDecision; status: "loading" | "ready" | "disabled" }>(() => {
    const profile = getActiveStudentProfile();
    const decision = resolveRealm3DAccess({ realmId: "space", classId: profile?.classId, studentId: profile?.studentId });
    return { decision, status: decision.canExplore3D ? "loading" : "disabled" };
  });
  const [status, setStatus] = useState(entry.status);
  const [resolvedLevel, setResolvedLevel] = useState<RealmLevelId>(requestedLevel);
  const displayStatus = previewMode && entry.decision.canExplore3D ? "ready" : status;

  useEffect(() => {
    if (!entry.decision.canExplore3D || previewMode) return;
    const studentId = window.localStorage.getItem(ACTIVE_STUDENT_KEY);
    if (!studentId) { router.replace("/login"); return; }
    let cancelled = false;
    const restore = () => restoreStudentStateFromServer(studentId, "space")
      .then((restored) => {
        if (cancelled) return;
        if (!restored.progress || !isPlacementComplete(restored.progress)) { router.replace("/home"); return; }
        if (!STARPATH_3D_LEVELS.includes(restored.progress.year as RealmLevelId)) { router.replace(realmOutside3DHref("space", restored.progress.year)); return; }
        setResolvedLevel(restored.progress.year as RealmLevelId);
        setStatus("ready");
        setLastRealm("starpath-realm");
        announceCanonicalWorldStateRestored();
      })
      .catch((error) => {
        if (cancelled || error instanceof StudentRestoreSupersededError) return;
        console.warn("[Starpath3D] Could not restore progress", error);
        setStatus("disabled");
      });
    void restore();
    const onFocus = () => { void restore(); };
    window.addEventListener("focus", onFocus);
    return () => { cancelled = true; window.removeEventListener("focus", onFocus); };
  }, [entry.decision.canExplore3D, previewMode, router]);

  if (displayStatus === "loading") return <div className="grid min-h-screen place-items-center bg-[#0d1230] font-semibold text-cyan-100/80">Loading saved progress...</div>;
  if (displayStatus === "disabled") return <World3DUnavailable place="Starpath" reason={entry.decision.reason} background="#0d1230" />;
  return <StarpathLevel3World level={resolvedLevel} />;
}
