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

const StatisticaLevel3World = dynamic(() => import("@/components/world3d/StatisticaLevel3World"), {
  ssr: false,
  loading: () => <div className="grid min-h-screen place-items-center bg-[#12312a] font-semibold text-amber-100/80">Opening Statistica...</div>,
});

const STATISTICA_3D_LEVELS: RealmLevelId[] = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

function resolvePreviewLevel(value: string | null): RealmLevelId {
  if (value === "Level 1" || value === "Year 1") return "Year 1";
  if (value === "Level 2" || value === "Year 2") return "Year 2";
  if (value === "Level 3" || value === "Year 3") return "Year 3";
  if (value === "Level 4" || value === "Year 4") return "Year 4";
  if (value === "Level 5" || value === "Year 5") return "Year 5";
  if (value === "Level 6" || value === "Year 6") return "Year 6";
  return "Year 1";
}

export default function Statistica3DEntry({ teacherPreview = false }: { teacherPreview?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storedPreviewMode = useDemoPreviewMode();
  const previewMode = teacherPreview || storedPreviewMode;
  const requestedLevel = resolvePreviewLevel(searchParams.get("level"));
  const [entry] = useState<{ decision: Realm3DAccessDecision; status: "loading" | "ready" | "disabled" }>(() => {
    const profile = getActiveStudentProfile();
    const decision = resolveRealm3DAccess({ realmId: "statistics", classId: profile?.classId, studentId: profile?.studentId, respectReducedMotion: true });
    return { decision, status: decision.canExplore3D ? "loading" : "disabled" };
  });
  const [status, setStatus] = useState(entry.status);
  const [resolvedLevel, setResolvedLevel] = useState<RealmLevelId>(requestedLevel);
  const displayStatus = previewMode && entry.decision.canExplore3D ? "ready" : status;
  const has3DLevel = STATISTICA_3D_LEVELS.includes(resolvedLevel);

  useEffect(() => {
    if (!previewMode || has3DLevel) return;
    router.replace(`/statistica?level=${encodeURIComponent(resolvedLevel)}${teacherPreview ? "&teacher_preview=1" : ""}`);
  }, [has3DLevel, previewMode, resolvedLevel, router, teacherPreview]);

  useEffect(() => {
    if (!entry.decision.canExplore3D || previewMode) return;
    const studentId = window.localStorage.getItem(ACTIVE_STUDENT_KEY);
    if (!studentId) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    const restore = () => restoreStudentStateFromServer(studentId, "statistics")
      .then((restored) => {
        if (cancelled) return;
        if (!restored.progress || !isPlacementComplete(restored.progress)) {
          router.replace("/home");
          return;
        }
        if (!STATISTICA_3D_LEVELS.includes(restored.progress.year as RealmLevelId)) {
          router.replace(`/statistica?level=${encodeURIComponent(restored.progress.year)}`);
          return;
        }
        setResolvedLevel(restored.progress.year as RealmLevelId);
        setStatus("ready");
        setLastRealm("statistica");
        announceCanonicalWorldStateRestored();
      })
      .catch((error) => {
        if (cancelled || error instanceof StudentRestoreSupersededError) return;
        console.warn("[Statistica3D] Could not restore progress", error);
        setStatus("disabled");
      });
    void restore();
    const onFocus = () => { void restore(); };
    window.addEventListener("focus", onFocus);
    return () => { cancelled = true; window.removeEventListener("focus", onFocus); };
  }, [entry.decision.canExplore3D, previewMode, router]);

  if (displayStatus === "loading") return <div className="grid min-h-screen place-items-center bg-[#12312a] font-semibold text-amber-100/80">Loading saved progress...</div>;
  if (!has3DLevel) return <div className="grid min-h-screen place-items-center bg-[#12312a] font-semibold text-amber-100/80">Opening Statistica...</div>;
  if (displayStatus === "disabled") return <main className="grid min-h-screen place-items-center bg-[#12312a] p-6 text-center text-white"><div><h1 className="text-2xl font-black">Statistica 3D is not available</h1><p className="mt-2 text-amber-100/70">The standard Statistica world is ready to use.</p><button type="button" onClick={() => router.push("/statistica")} className="mt-5 rounded-md bg-amber-300 px-5 py-3 font-bold text-stone-950">Open 2D World</button></div></main>;
  return <StatisticaLevel3World level={resolvedLevel} />;
}
