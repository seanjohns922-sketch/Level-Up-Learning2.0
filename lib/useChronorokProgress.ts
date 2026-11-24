"use client";

import { useSyncExternalStore } from "react";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { chronorokForGrade } from "@/lib/chronorok";
import { useChronorok } from "@/lib/chronorok-cards";

/** Crystals counted by the server (lib/chronorok-cards), never a browser-maintained balance. */
export function useChronorokProgress() {
  const preview = useDemoPreviewMode();
  const { state, error } = useChronorok();
  // The signed-in student lives in this browser: read it after hydration so the server render matches.
  const mounted = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const profile = mounted ? getActiveStudentProfile() : null;
  const signedIn = Boolean(profile?.studentId) && !preview;
  const grade = preview ? "Year 5" : profile?.yearLevel ?? null;
  return {
    loading: !mounted || (!state && !error && (signedIn || preview)),
    error: error && !state ? "Your Chrono Crystals could not load. Please try again." : null,
    signedIn,
    grade,
    progress: state ? { learningDays: state.learningDays, crystals: state.crystals, open: state.open } : null,
    cards: state,
    preview,
    chronorok: chronorokForGrade(grade),
  };
}

const subscribeNothing = () => () => undefined;
