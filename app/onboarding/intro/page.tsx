"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveStudentProfile, markActiveStudentIntroSeen } from "@/lib/studentIdentity";
import { markStudentIntroSeen, restoreStudentStateFromServer } from "@/lib/student-progress-sync";
import IntroFilmFrame from "@/components/onboarding/IntroFilmFrame";

export default function IntroPage() {
  const router = useRouter();
  const [ended, setEnded] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [studentProfile] = useState(getActiveStudentProfile);
  const studentId = studentProfile?.studentId;

  useEffect(() => {
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
  }, [router, studentId]);

  const savingRef = useRef(false);
  const finish = useCallback(async () => {
    if (!studentId || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      await markStudentIntroSeen(studentId);
      markActiveStudentIntroSeen(studentId);
      router.push("/home");
    } catch (saveError) {
      console.warn("[Intro] Could not save canonical onboarding state", saveError);
      setError("We could not save your progress. Please try again.");
      savingRef.current = false;
      setSaving(false);
    }
  }, [router, studentId]);

  if (verifying || !studentId) {
    return <main className="fixed inset-0 z-50 grid place-items-center bg-black font-bold text-white">Loading your journey...</main>;
  }

  return (
    <main className="fixed inset-0 z-50 bg-black">
      <IntroFilmFrame
        studentId={studentId}
        name={studentProfile?.displayName}
        year={studentProfile?.yearLevel}
        onFinish={() => void finish()}
        onEnded={() => setEnded(true)}
        className="absolute inset-0 h-full w-full border-0"
      />
      <button
        type="button"
        onClick={() => void finish()}
        disabled={saving}
        className="absolute rounded-full border border-white/30 bg-black/50 px-5 py-2 text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur transition hover:bg-black/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C94DF2] disabled:opacity-60"
        style={{ top: "max(1rem, env(safe-area-inset-top))", right: "max(1rem, env(safe-area-inset-right))" }}
      >
        {saving ? "Saving..." : ended ? "Continue" : "Skip intro"}
      </button>
      {error ? (
        <p role="alert" className="absolute inset-x-4 bottom-6 mx-auto w-fit rounded-xl bg-black/80 px-4 py-2 font-bold text-rose-300">
          {error}
        </p>
      ) : null}
    </main>
  );
}
