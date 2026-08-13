"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { StudentProgress } from "@/data/progress";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { clearActiveStudentSession, getActiveStudentProfile, getPlacementEntryYear, markActiveStudentIntroSeen } from "@/lib/studentIdentity";
import { markStudentIntroSeen, restoreStudentStateFromServer, StudentRestoreSupersededError } from "@/lib/student-progress-sync";
import { supabase } from "@/lib/supabase";
import { buildGroundFirstLessonRoute, resolveStudentDestination } from "@/lib/student-destination";
import ReadAloudBtn from "@/components/ReadAloudBtn";

function StudentHomeBackdrop() {
  return (
    <div className="fixed inset-0 z-0">
      <Image
        src="/images/dashboard-bg-lcp.webp"
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: "center 40%" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
    </div>
  );
}

export default function StudentHomePage() {
  const router = useRouter();
  const studentProfile = useMemo(() => getActiveStudentProfile(), []);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [restoreState, setRestoreState] = useState<"loading" | "ready" | "error">("loading");
  const [restoreError, setRestoreError] = useState("");
  const placementYear = progress?.year ?? getPlacementEntryYear();
  const isGroundLevel = placementYear === "Prep";
  const studentNamePrefix = studentProfile?.displayName ? `${studentProfile.displayName}, ` : "";
  const welcomeMessage = isGroundLevel
    ? `${studentNamePrefix}watch the welcome video, then begin Ground Level Week 1 in Number Nexus.`
    : `${studentNamePrefix}your journey starts with a short skill check. We'll use your pre-test to place you at the right level, unlock the correct learning path, and guide you into the Tower.`;

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
      router.push(isGroundLevel
        ? buildGroundFirstLessonRoute()
        : resolveStudentDestination({
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
      <main className="relative flex min-h-screen items-end justify-center p-6 pb-10">
        <StudentHomeBackdrop />
        <div className="relative z-10 w-full max-w-3xl rounded-3xl border border-white/45 bg-white/90 p-8 text-center shadow-[0_20px_40px_rgba(0,0,0,0.18)] backdrop-blur-sm">
          {restoreState === "loading" ? (
            <div aria-busy="true" aria-label="Loading your journey">
              <div className="mx-auto h-4 w-28 animate-pulse rounded bg-amber-800/15" />
              <div className="mx-auto mt-4 h-12 w-full max-w-lg animate-pulse rounded-lg bg-slate-200" />
              <div className="mx-auto mt-5 h-4 w-full max-w-xl animate-pulse rounded bg-slate-100" />
              <div className="mx-auto mt-3 h-4 w-4/5 max-w-lg animate-pulse rounded bg-slate-100" />
              <div className="mt-8 aspect-video w-full animate-pulse rounded-[22px] bg-slate-900/80" />
              <div className="mx-auto mt-8 h-14 w-full max-w-md animate-pulse rounded-2xl bg-emerald-700/30" />
              <span className="sr-only">Loading your journey</span>
            </div>
          ) : (
            <p className="font-bold text-slate-800">{restoreError}</p>
          )}
          {restoreState === "error" ? (
            <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">Retry</button>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative flex items-end justify-center p-6 pb-10">
      <StudentHomeBackdrop />

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
        <div className="mb-8 flex items-start justify-center gap-2">
          <p className="max-w-2xl text-gray-700">{welcomeMessage}</p>
          <ReadAloudBtn
            text={`Welcome to the Tower of Knowledge. ${welcomeMessage}`}
            speechKey="student-welcome"
            label="Read"
            className="shrink-0 border-slate-300 bg-white text-slate-600"
          />
        </div>

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
