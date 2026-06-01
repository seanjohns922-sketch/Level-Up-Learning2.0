"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ACTIVE_STUDENT_KEY, isPlacementComplete, readProgress } from "@/data/progress";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { getPlacementEntryYear, hasActiveStudentSeenIntro } from "@/lib/studentIdentity";
import { restoreStudentStateFromServer } from "@/lib/student-progress-sync";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function routeUser() {
      if (typeof window !== "undefined") {
        if (isDemoPreviewMode()) {
          if (!cancelled) router.replace("/levels");
          return;
        }
        const activeStudentId = window.localStorage.getItem(ACTIVE_STUDENT_KEY)?.trim();
        let progress = readProgress();
        let introSeen = hasActiveStudentSeenIntro(activeStudentId);
        let introSeenSource: "localStorage" | "students_table" = "localStorage";
        let progressSource: "localStorage" | "progress_snapshot" | "none" = progress ? "localStorage" : "none";
        let restoredRowsSummary: unknown[] = [];
        if (activeStudentId) {
          try {
            const restored = await restoreStudentStateFromServer(activeStudentId);
            if (restored.progress) {
              progress = restored.progress;
              progressSource = "progress_snapshot";
            }
            introSeen = restored.introSeen;
            introSeenSource = "students_table";
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
            console.warn("[RootRoute] Could not restore student progress", error);
          }
        }
        if (activeStudentId || progress) {
          if (cancelled) return;
          let dest: string;
          if (!introSeen) {
            dest = "/home";
          } else if (!isPlacementComplete(progress)) {
            dest = `/pretest?year=${encodeURIComponent(progress?.year ?? getPlacementEntryYear())}`;
          } else {
            dest = "/levels";
          }
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
          if (!introSeen) {
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
