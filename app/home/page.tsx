"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { isPlacementComplete, readProgress } from "@/data/progress";
import { clearActiveStudentSession, getActiveStudentProfile, getPlacementEntryYear, hasActiveStudentSeenIntro, markActiveStudentIntroSeen } from "@/lib/studentIdentity";
import { supabase } from "@/lib/supabase";

export default function StudentHomePage() {
  const router = useRouter();
  const progress = useMemo(() => readProgress(), []);
  const studentProfile = useMemo(() => getActiveStudentProfile(), []);
  const placementYear = useMemo(() => progress?.year ?? getPlacementEntryYear(), [progress?.year]);

  useEffect(() => {
    if (isPlacementComplete(progress)) {
      router.replace("/levels");
      return;
    }

    if (studentProfile?.studentId && hasActiveStudentSeenIntro(studentProfile.studentId)) {
      router.replace(`/pretest?year=${encodeURIComponent(placementYear)}`);
    }
  }, [placementYear, progress, router, studentProfile?.studentId]);

  async function handleLogout() {
    await supabase.auth.signOut();
    clearActiveStudentSession();
    router.push("/login");
  }

  function beginJourney() {
    markActiveStudentIntroSeen(studentProfile?.studentId);
    router.push(`/pretest?year=${encodeURIComponent(placementYear)}`);
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
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3 uppercase tracking-wide">Tower of Knowledge</h1>
        <p className="text-gray-700 max-w-2xl mx-auto mb-8">
          {studentProfile?.displayName ? `${studentProfile.displayName}, ` : ""}your journey starts with a short skill check.
          We&apos;ll use your pre-test to place you at the right level, unlock the correct learning path, and guide you into the Tower.
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
          Begin Your Journey
        </button>
      </div>
    </main>
  );
}
