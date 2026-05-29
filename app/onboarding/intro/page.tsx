"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveStudentProfile, hasActiveStudentSeenIntro, markActiveStudentIntroSeen } from "@/lib/studentIdentity";

export default function IntroPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);
  const studentProfile = getActiveStudentProfile();

  useEffect(() => {
    if (studentProfile?.studentId && hasActiveStudentSeenIntro(studentProfile.studentId)) {
      router.replace("/home");
    }
  }, [router, studentProfile?.studentId]);

  function finish() {
    markActiveStudentIntroSeen(studentProfile?.studentId);
    router.push("/home");
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
          onClick={finish}
          className="px-8 py-3 rounded-2xl bg-[#9fd7b1] text-[#1f3b2a] font-black text-lg hover:bg-[#8fcea4] transition shadow-sm"
        >
          {ended ? "Continue" : "Skip"}
        </button>
      </div>
    </main>
  );
}
