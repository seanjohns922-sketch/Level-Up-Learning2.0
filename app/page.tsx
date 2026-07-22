"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ACTIVE_STUDENT_KEY, isPlacementComplete } from "@/data/progress";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { clearActiveStudentSession, getPlacementEntryYear, hasActiveStudentSeenIntro } from "@/lib/studentIdentity";
import { restoreStudentStateFromServer, StudentRestoreSupersededError } from "@/lib/student-progress-sync";
import { supabase } from "@/lib/supabase";
import { resolveStudentDestination } from "@/lib/student-destination";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function routeUser() {
      if (typeof window !== "undefined") {
        if (isDemoPreviewMode()) {
          if (!cancelled) router.replace("/realms");
          return;
        }
        const activeStudentId = window.localStorage.getItem(ACTIVE_STUDENT_KEY)?.trim();
        let progress = null;
        let introSeen = false;
        const introSeenSource = "students_table";
        let progressSource: "progress_snapshot" | "none" = "none";
        let restoredRowsSummary: unknown[] = [];
        if (activeStudentId) {
          try {
            const restored = await restoreStudentStateFromServer(activeStudentId, "number");
            if (cancelled) return;
            if (restored.progress) {
              progress = restored.progress;
              progressSource = "progress_snapshot";
            }
            introSeen = restored.introSeen;
            restoredRowsSummary = restored.rows.map((row) => ({
              year: row.year,
              status: row.status,
              week: row.week,
              placement_complete: row.placement_complete,
              assigned_week: row.assigned_week,
              has_seen_intro: row.has_seen_intro,
              pretest_score: row.pretest_score,
            }));
          } catch (error) {
            if (cancelled || error instanceof StudentRestoreSupersededError) return;
            console.warn("[RootRoute] Could not restore student progress", error);
            clearActiveStudentSession();
            router.replace("/login?error=progress_restore");
            return;
          }
        }
        if (activeStudentId) {
          if (cancelled) return;
          if (!progress) {
            clearActiveStudentSession();
            router.replace("/login?error=progress_missing");
            return;
          }
          const dest = resolveStudentDestination({
            progress,
            introSeen,
            fallbackYear: progress?.year ?? getPlacementEntryYear(),
          });
          console.log("[RootRouteDebug]", {
            student_id: activeStudentId ?? null,
            localStorage: {
              introSeenForStudent: hasActiveStudentSeenIntro(activeStudentId),
              progress: progress
                ? {
                    status: progress.status ?? null,
                    year: progress.year ?? null,
                    week: progress.assignedWeek ?? null,
                    placementComplete: progress.placementComplete ?? null,
                  }
                : null,
            },
            progress_snapshot_rows: restoredRowsSummary,
            resolved: {
              hasSeenIntro: introSeen,
              hasSeenIntroSource: introSeenSource,
              placementComplete: isPlacementComplete(progress),
              placementCompleteSource: progressSource === "progress_snapshot" ? "progress_snapshot.placement_complete" : progressSource,
              progressStatus: progress?.status ?? null,
              progressStatusSource: progressSource,
              progressYear: progress?.year ?? null,
              progressYearSource: progressSource === "progress_snapshot" ? "progress_snapshot.year" : progressSource,
              progressWeek: progress?.assignedWeek ?? null,
              progressWeekSource: progressSource === "progress_snapshot" ? "progress_snapshot.assigned_week/week" : progressSource,
            },
            route: dest,
          });
          router.replace(dest);
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
