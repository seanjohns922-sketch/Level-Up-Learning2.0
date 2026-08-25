"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ACTIVE_STUDENT_KEY, isPlacementComplete } from "@/data/progress";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { restoreStudentStateFromServer, StudentRestoreSupersededError } from "@/lib/student-progress-sync";
import { resolveRealm3DAccess, type Realm3DAccessDecision } from "@/lib/world3d/access";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { isNumberNexusLevel } from "@/lib/number-nexus-visuals";
import { setLastRealm } from "@/lib/last-realm";
import { announceCanonicalWorldStateRestored } from "@/lib/world3d/canonical-bootstrap";

const NumberNexusLevel3World = dynamic(
  () => import("@/components/world3d/NumberNexusLevel3World"),
  {
    ssr: false,
    loading: () => (
      <div className="grid min-h-screen place-items-center bg-slate-950 font-semibold text-teal-200/70">
        Loading 3D world...
      </div>
    ),
  },
);

export default function NumberNexus3DEntry({ teacherPreview = false, requestedLevel }: { teacherPreview?: boolean; requestedLevel?: string }) {
  const router = useRouter();
  const storedPreviewMode = useDemoPreviewMode();
  const previewMode = teacherPreview || storedPreviewMode;
  const [entryState] = useState<{
    accessDecision: Realm3DAccessDecision;
    initialStatus: "loading" | "ready" | "disabled";
  }>(() => {
    const profile = getActiveStudentProfile();
    const accessDecision = resolveRealm3DAccess({
      realmId: "number",
      classId: profile?.classId,
      studentId: profile?.studentId,
      respectReducedMotion: true,
    });
    return {
      accessDecision,
      initialStatus: !accessDecision.canExplore3D ? "disabled" : "loading",
    };
  });
  const { accessDecision } = entryState;
  const [status, setStatus] = useState<"loading" | "ready" | "disabled" | "error">(entryState.initialStatus);
  const [resolvedLevel, setResolvedLevel] = useState<RealmLevelId>(isNumberNexusLevel(requestedLevel) ? requestedLevel : "Year 3");
  const displayStatus = previewMode && accessDecision.canExplore3D ? "ready" : status;

  useEffect(() => {
    if (!accessDecision.canExplore3D) {
      return;
    }
    if (previewMode) {
      return;
    }

    const studentId = window.localStorage.getItem(ACTIVE_STUDENT_KEY);
    if (!studentId) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    const restore = () => restoreStudentStateFromServer(studentId, "number")
      .then((restored) => {
        if (cancelled) return;
        if (!restored.progress || !isPlacementComplete(restored.progress)) {
          router.replace("/home");
          return;
        }
        if (!isNumberNexusLevel(restored.progress.year)) {
          setStatus("error");
          return;
        }
        setResolvedLevel(restored.progress.year);
        setStatus("ready");
        setLastRealm("number-nexus");
        announceCanonicalWorldStateRestored();
      })
      .catch((error) => {
        if (cancelled || error instanceof StudentRestoreSupersededError) return;
        console.warn("[World3D] Could not restore Number Nexus progress", error);
        setStatus("error");
      });
    void restore();
    const onFocus = () => { void restore(); };
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [accessDecision.canExplore3D, previewMode, requestedLevel, router]);

  if (displayStatus === "loading") {
    return <div className="grid min-h-screen place-items-center bg-slate-950 font-semibold text-teal-200/70">Loading saved progress...</div>;
  }

  if (displayStatus === "disabled") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-center text-white">
        <div>
          <h1 className="text-2xl font-black">3D world is not available</h1>
          <p className="mt-2 text-slate-300">
            {accessDecision?.reason === "webgl-unavailable"
              ? "This device or browser cannot run the 3D world right now."
              : accessDecision?.reason === "reduced-motion"
                ? "Reduced motion is enabled, so the standard world is used."
                : "Use the standard Number Nexus world to continue learning."}
          </p>
          <button type="button" onClick={() => router.push("/number-nexus")} className="mt-5 rounded-md bg-teal-500 px-5 py-3 font-bold text-slate-950">
            Open 2D World
          </button>
        </div>
      </main>
    );
  }

  if (displayStatus === "error") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-center text-white">
        <div>
          <h1 className="text-2xl font-black">3D world could not load</h1>
          <p className="mt-2 text-slate-300">Use the 2D world to continue learning.</p>
          <button type="button" onClick={() => router.push("/number-nexus")} className="mt-5 rounded-md bg-teal-500 px-5 py-3 font-bold text-slate-950">
            Open 2D World
          </button>
        </div>
      </main>
    );
  }

  return <NumberNexusLevel3World key={resolvedLevel} level={resolvedLevel} />;
}
