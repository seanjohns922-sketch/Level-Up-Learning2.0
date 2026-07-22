"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveStudentProfile, markActiveStudentIntroSeen } from "@/lib/studentIdentity";
import { markStudentIntroSeen, restoreStudentStateFromServer } from "@/lib/student-progress-sync";

export default function IntroPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const studentProfile = getActiveStudentProfile();

  useEffect(() => {
    const studentId = studentProfile?.studentId;
    if (!studentId) {
      router.replace("/login?error=session_missing");
      return;
    }
    let cancelled = false;
    void restoreStudentStateFromServer(studentId, "number")
      .then((restored) => {
        if (cancelled) return;
        if (restored.introSeen) router.replace("/home");
        else setVerifying(false);
      })
      .catch((restoreError) => {
        console.warn("[Intro] Could not verify canonical onboarding state", restoreError);
        if (!cancelled) {
          setError("We could not load your saved journey. Please try again.");
          setVerifying(false);
        }
      });
    return () => { cancelled = true; };
  }, [router, studentProfile?.studentId]);

  async function finish() {
    const studentId = studentProfile?.studentId;
    if (!studentId || saving) return;
    setSaving(true);
    setError("");
    try {
      await markStudentIntroSeen(studentId);
      markActiveStudentIntroSeen(studentId);
      router.push("/home");
    } catch (saveError) {
      console.warn("[Intro] Could not save canonical onboarding state", saveError);
      setError("We could not save your progress. Please try again.");
      setSaving(false);
    }
  }

  if (verifying) {
    return <main className="fixed inset-0 z-50 grid place-items-center bg-black font-bold text-white">Loading your journey...</main>;
  }

  return (
    <main className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <video
        ref={videoRef}
        src="/videos/intro.mp4"
        autoPlay
        playsInline
        controls
        onEnded={() => setEnded(true)}
        className="w-full max-w-3xl max-h-[70vh] rounded-2xl"
      />
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={() => void finish()}
          disabled={saving}
          className="px-8 py-3 rounded-2xl bg-[#9fd7b1] text-[#1f3b2a] font-black text-lg hover:bg-[#8fcea4] transition shadow-sm"
        >
          {saving ? "Saving..." : ended ? "Continue" : "Skip"}
        </button>
      </div>
      {error ? <p className="mt-4 font-bold text-rose-300">{error}</p> : null}
    </main>
  );
}
