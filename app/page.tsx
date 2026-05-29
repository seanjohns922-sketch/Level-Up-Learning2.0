"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ACTIVE_STUDENT_KEY, isPlacementComplete, readProgress } from "@/data/progress";
import { getPlacementEntryYear, hasActiveStudentSeenIntro } from "@/lib/studentIdentity";
import { restoreStudentStateFromServer } from "@/lib/student-progress-sync";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function routeUser() {
      if (typeof window !== "undefined") {
        const activeStudentId = window.localStorage.getItem(ACTIVE_STUDENT_KEY)?.trim();
        let progress = readProgress();
        if (activeStudentId) {
          try {
            const restored = await restoreStudentStateFromServer(activeStudentId);
            if (restored.progress) progress = restored.progress;
          } catch (error) {
            console.warn("[RootRoute] Could not restore student progress", error);
          }
        }
        if (activeStudentId || progress) {
          if (cancelled) return;
          if (!hasActiveStudentSeenIntro(activeStudentId)) {
            router.replace("/home");
          } else if (!isPlacementComplete(progress)) {
            router.replace(`/pretest?year=${encodeURIComponent(progress?.year ?? getPlacementEntryYear())}`);
          } else {
            router.replace("/levels");
          }
          return;
        }
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (cancelled) return;
        if (error) throw error;

        if (data.session?.user) {
          router.replace("/teacher/dashboard");
          return;
        }
      } catch {
        // Fall through to login for anonymous visitors or failed session recovery.
      }

      if (!cancelled) router.replace("/login");
    }

    void routeUser();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fbf7f1]">
      <p className="text-gray-400">Loading…</p>
    </main>
  );
}
