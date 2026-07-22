"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { StudentProgress } from "@/data/progress";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { clearActiveStudentSession, getActiveStudentProfile, getPlacementEntryYear, markActiveStudentIntroSeen } from "@/lib/studentIdentity";
import { markStudentIntroSeen, restoreStudentStateFromServer, StudentRestoreSupersededError } from "@/lib/student-progress-sync";
import { supabase } from "@/lib/supabase";
import { resolveStudentDestination } from "@/lib/student-destination";

export default function StudentHomePage() {
  const router = useRouter();
  const studentProfile = useMemo(() => getActiveStudentProfile(), []);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [restoreState, setRestoreState] = useState<"loading" | "ready" | "error">("loading");
  const [restoreError, setRestoreError] = useState("");
  const placementYear = progress?.year ?? getPlacementEntryYear();
  const isGroundLevel = placementYear === "Prep";

  useEffect(() => {
    if (isDemoPreviewMode()) {
      router.replace("/realms");
      return;
    }
    const studentId = studentProfile?.studentId;
    if (!studentId) {
      router.replace("/login?error=session_missing");
      return;
    }

    let cancelled = false;
    async function restore() {
      setRestoreState("loading");
      try {
        const restored = await restoreStudentStateFromServer(studentId!, "number");
        if (cancelled) return;
        if (!restored.progress) {
          setRestoreError("Your learning placement is not ready. Ask your teacher to check your starting level.");
          setRestoreState("error");
          return;
        }
        setProgress(restored.progress);
        setRestoreState("ready");
        if (restored.introSeen) {
          router.replace(resolveStudentDestination({
            progress: restored.progress,
            introSeen: true,
            fallbackYear: restored.progress.year,
          }));
        }
      } catch (error) {
        if (cancelled || error instanceof StudentRestoreSupersededError) return;
        console.warn("[Home] Could not restore canonical progress", error);
        setRestoreError("We could not load your saved progress. Check your connection and try again.");
        setRestoreState("error");
      }
    }
    void restore();
    return () => { cancelled = true; };
  }, [router, studentProfile?.studentId]);

  async function handleLogout() {
    clearActiveStudentSession();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function beginJourney() {
    const studentId = studentProfile?.studentId;
    if (!studentId || !progress || restoreState !== "ready") return;
    try {
      await markStudentIntroSeen(studentId);
      markActiveStudentIntroSeen(studentId);
      router.push(resolveStudentDestination({
        progress,
        introSeen: true,
        fallbackYear: progress.year,
      }));
    } catch (error) {
      console.warn("[Home] Could not persist intro state", error);
      setRestoreError("We could not save that you watched the intro. Please try again.");
      setRestoreState("error");
    }
  }

  if (restoreState !== "ready") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fbf7f1] p-6">
        <div className="max-w-md text-center">
          <p className="font-bold text-slate-800">{restoreState === "loading" ? "Loading your journey..." : restoreError}</p>
          {restoreState === "error" ? (
            <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">Retry</button>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative flex items-end justify-center p-6 pb-10">
      <div className="fixed inset-0 z-0">
        <img src="/images/dashboard-bg.jpg" alt="" className="w-full h-full object-cover" style={{ objectPosition: "center 40%" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
      </div>

      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={handleLogout}
          className="rounded-2xl border border-white/20 bg-black/30 px-4 py-2 text-sm font-bold text-white backdrop-blur-md hover:bg-black/40 transition"
          type="button"
        >
          Log out
        </button>
      </div>

      <div
        className="relative z-10 rounded-3xl p-8 w-full max-w-3xl text-center"
        style={{ background: "rgba(255,255,255,0.88)", border: "1px solid rgba(255,255,255,0.45)", boxShadow: "0 20px 40px rgba(0,0,0,0.18), 0 6px 12px rgba(0,0,0,0.06)" }}
      >
        <p className="text-sm font-semibold text-amber-800 uppercase tracking-widest mb-2">Welcome to the</p>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 uppercase tracking-wide">
          Tower of Knowledge
        </h1>
        <p className="text-gray-700 max-w-2xl mx-auto mb-8">
          {isGroundLevel
            ? `${studentProfile?.displayName ? `${studentProfile.displayName}, ` : ""}watch the intro, then choose your first Ground Level adventure in Number Nexus or Measurelands.`
            : `${studentProfile?.displayName ? `${studentProfile.displayName}, ` : ""}your journey starts with a short skill check. We&apos;ll use your pre-test to place you at the right level, unlock the correct learning path, and guide you into the Tower.`}
        </p>

        <div className="rounded-[28px] border border-dashed border-teal-300/90 bg-teal-50/70 p-5 md:p-6 mb-8">
          <div className="aspect-video w-full overflow-hidden rounded-[22px] border border-slate-700/60 bg-slate-950 shadow-[0_12px_28px_rgba(2,23,22,0.18)]">
            <video
              className="h-full w-full object-cover"
              controls
              playsInline
              preload="metadata"
            >
              <source src="/videos/tower-intro.mp4" type="video/mp4" />
              Your browser does not support the intro video.
            </video>
          </div>
        </div>

        <button
          onClick={beginJourney}
          className="w-full max-w-md mx-auto py-4 rounded-2xl bg-gradient-to-r from-primary to-primary text-primary-foreground font-extrabold text-lg hover:brightness-110 transition"
          style={{ boxShadow: "0 6px 14px rgba(30,160,90,0.35)" }}
          type="button"
        >
          {isGroundLevel ? "Start Adventure" : "Begin Your Journey"}
        </button>
      </div>
    </main>
  );
}
