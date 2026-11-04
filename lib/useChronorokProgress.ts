"use client";

import { useEffect, useState } from "react";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { fetchStudentActivityDaily } from "@/lib/student-activity";
import { chronorokForGrade, chronorokProgress } from "@/lib/chronorok";

/** Uses saved learning activity, never a browser-maintained reward balance. */
export function useChronorokProgress() {
  const preview = useDemoPreviewMode();
  const [state, setState] = useState<{ loading: boolean; error: string | null; signedIn: boolean; grade: string | null; progress: ReturnType<typeof chronorokProgress> | null }>({ loading: true, error: null, signedIn: false, grade: null, progress: null });
  useEffect(() => {
    let cancelled = false;
    const profile = getActiveStudentProfile();
    if (preview) {
      queueMicrotask(() => { if (!cancelled) setState({ loading: false, error: null, signedIn: false, grade: "Year 3", progress: { learningDays: 63, crystals: 63, open: true } }); });
    } else if (!profile?.studentId) {
      queueMicrotask(() => { if (!cancelled) setState({ loading: false, error: null, signedIn: false, grade: null, progress: null }); });
    } else {
      void fetchStudentActivityDaily(profile.studentId).then(rows => {
        if (!cancelled) setState({ loading: false, error: null, signedIn: true, grade: profile.yearLevel ?? null, progress: chronorokProgress(rows) });
      }).catch(() => {
        if (!cancelled) setState({ loading: false, error: "Your Chrono Crystals could not load. Please try again.", signedIn: true, grade: profile.yearLevel ?? null, progress: null });
      });
    }
    return () => { cancelled = true; };
  }, [preview]);
  return { ...state, preview, chronorok: chronorokForGrade(state.grade) };
}
