"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RealmCarousel from "@/components/realms/RealmCarousel";
import { isPlacementComplete } from "@/data/progress";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { getActiveStudentIdentity } from "@/lib/studentIdentity";
import { restoreStudentStateFromServer, StudentRestoreSupersededError } from "@/lib/student-progress-sync";

function GuardedRealmsPage() {
  const router = useRouter();
  const preview = useDemoPreviewMode();
  const [restoreState, setRestoreState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (preview) {
      router.replace("/world/tower?teacher_preview=1");
      return;
    }
    const studentId = getActiveStudentIdentity().studentId;
    if (!studentId) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    void Promise.all([
      restoreStudentStateFromServer(studentId, "number"),
      restoreStudentStateFromServer(studentId, "measurement"),
      restoreStudentStateFromServer(studentId, "space"),
    ]).then(([numberState]) => {
      if (cancelled) return;
      if (!numberState.progress) {
        setRestoreState("error");
        return;
      }
      if (!isPlacementComplete(numberState.progress)) {
        router.replace("/home");
        return;
      }
      setRestoreState("ready");
    }).catch((error) => {
      if (cancelled || error instanceof StudentRestoreSupersededError) return;
      console.warn("[Realms] Canonical restore failed", error);
      setRestoreState("error");
    });
    return () => { cancelled = true; };
  }, [preview, router]);

  if (preview) return <div className="grid min-h-screen place-items-center bg-[#211815] font-bold text-amber-100">Returning to the 3D Tower...</div>;

  if (restoreState === "loading") return <div className="grid min-h-screen place-items-center bg-black font-bold text-white/70">Loading your realms...</div>;
  if (restoreState === "error") return (
    <main className="grid min-h-screen place-items-center bg-black p-6 text-center text-white">
      <div><p className="font-bold">We could not load your saved realm progress.</p><button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-teal-500 px-5 py-3 font-bold text-black">Retry</button></div>
    </main>
  );
  return <RealmCarousel />;
}

export default function RealmsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <GuardedRealmsPage />
    </Suspense>
  );
}
