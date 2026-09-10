"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ACTIVE_STUDENT_KEY, isPlacementComplete } from "@/data/progress";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { setLastRealm } from "@/lib/last-realm";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { restoreStudentStateFromServer, StudentRestoreSupersededError } from "@/lib/student-progress-sync";
import { resolveRealm3DAccess, type Realm3DAccessDecision } from "@/lib/world3d/access";
import { announceCanonicalWorldStateRestored } from "@/lib/world3d/canonical-bootstrap";

const ChanceHollowLevel3World = dynamic(() => import("@/components/world3d/ChanceHollowLevel3World"), {
  ssr: false,
  loading: () => <div className="grid min-h-screen place-items-center bg-[#211728] font-semibold text-rose-100/80">Opening Chance Hollow...</div>,
});

const CHANCE_HOLLOW_3D_LEVELS: RealmLevelId[] = ["Year 3", "Year 4", "Year 5"];

function resolvePreviewLevel(value: string | null): RealmLevelId {
  if (value === "Level 5" || value === "Year 5") return "Year 5";
  if (value === "Level 4" || value === "Year 4") return "Year 4";
  return "Year 3";
}

function isAvailable3DLevel(value: string | null) {
  return value === null || value === "Level 3" || value === "Year 3" || value === "Level 4" || value === "Year 4" || value === "Level 5" || value === "Year 5";
}

export default function ChanceHollow3DEntry({ teacherPreview = false }: { teacherPreview?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storedPreviewMode = useDemoPreviewMode();
  const previewMode = teacherPreview || storedPreviewMode;
  const requestedLevel = searchParams.get("level");
  const [resolvedLevel, setResolvedLevel] = useState<RealmLevelId>(() => resolvePreviewLevel(requestedLevel));
  const [entry] = useState<{ decision: Realm3DAccessDecision; status: "loading" | "ready" | "disabled" }>(() => {
    const profile = getActiveStudentProfile();
    const decision = resolveRealm3DAccess({ realmId: "chance", classId: profile?.classId, studentId: profile?.studentId, respectReducedMotion: true });
    return { decision, status: decision.canExplore3D ? "loading" : "disabled" };
  });
  const [status, setStatus] = useState(entry.status);
  const displayStatus = previewMode && entry.decision.canExplore3D ? "ready" : status;

  useEffect(() => {
    if (previewMode && isAvailable3DLevel(requestedLevel)) {
      setResolvedLevel(resolvePreviewLevel(requestedLevel));
    }
  }, [previewMode, requestedLevel]);

  useEffect(() => {
    if (!previewMode || isAvailable3DLevel(requestedLevel)) return;
    router.replace(`/chance-hollow?level=${encodeURIComponent(requestedLevel ?? "Year 3")}${teacherPreview ? "&teacher_preview=1" : ""}`);
  }, [previewMode, requestedLevel, router, teacherPreview]);

  useEffect(() => {
    if (!entry.decision.canExplore3D || previewMode) return;
    const studentId = window.localStorage.getItem(ACTIVE_STUDENT_KEY);
    if (!studentId) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    const restore = () => restoreStudentStateFromServer(studentId, "chance")
      .then((restored) => {
        if (cancelled) return;
        if (!restored.progress || !isPlacementComplete(restored.progress)) {
          router.replace("/home");
          return;
        }
        if (!CHANCE_HOLLOW_3D_LEVELS.includes(restored.progress.year as RealmLevelId)) {
          router.replace(`/chance-hollow?level=${encodeURIComponent(restored.progress.year)}`);
          return;
        }
        setResolvedLevel(restored.progress.year as RealmLevelId);
        setStatus("ready");
        setLastRealm("chance-hollow");
        announceCanonicalWorldStateRestored();
      })
      .catch((error) => {
        if (cancelled || error instanceof StudentRestoreSupersededError) return;
        console.warn("[ChanceHollow3D] Could not restore progress", error);
        setStatus("disabled");
      });
    void restore();
    const onFocus = () => { void restore(); };
    window.addEventListener("focus", onFocus);
    return () => { cancelled = true; window.removeEventListener("focus", onFocus); };
  }, [entry.decision.canExplore3D, previewMode, router]);

  if (!isAvailable3DLevel(requestedLevel)) return <div className="grid min-h-screen place-items-center bg-[#211728] font-semibold text-rose-100/80">Opening Chance Hollow...</div>;
  if (displayStatus === "loading") return <div className="grid min-h-screen place-items-center bg-[#211728] font-semibold text-rose-100/80">Loading saved progress...</div>;
  if (displayStatus === "disabled") return <main className="grid min-h-screen place-items-center bg-[#211728] p-6 text-center text-white"><div><h1 className="text-2xl font-black">Chance Hollow 3D is not available</h1><p className="mt-2 text-rose-100/70">The standard Chance Hollow world is ready to use.</p><button type="button" onClick={() => router.push("/chance-hollow?level=Year%203")} className="mt-5 rounded-md bg-rose-300 px-5 py-3 font-bold text-stone-950">Open 2D World</button></div></main>;
  return <ChanceHollowLevel3World level={resolvedLevel} />;
}
