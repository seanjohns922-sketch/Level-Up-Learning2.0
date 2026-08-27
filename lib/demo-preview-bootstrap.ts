"use client";

import { clearScopedProgress, writeProgress } from "@/data/progress";
import { activateDemoPreviewMode, DEMO_PREVIEW_SCOPE } from "@/lib/demo-mode";
import { resetDemoEconomyPreview } from "@/lib/economy";
import { clearScopedProgramStore } from "@/lib/program-progress";
import { markActiveStudentIntroSeen, setActiveStudentProfile } from "@/lib/studentIdentity";

export function bootstrapDemoPreview(displayName = "Demo Preview") {
  activateDemoPreviewMode();
  setActiveStudentProfile(DEMO_PREVIEW_SCOPE, null, {
    displayName,
    yearLevel: "Prep",
  });
  markActiveStudentIntroSeen(DEMO_PREVIEW_SCOPE);
  clearScopedProgress(DEMO_PREVIEW_SCOPE);
  clearScopedProgramStore(DEMO_PREVIEW_SCOPE);
  resetDemoEconomyPreview();
  writeProgress({
    year: "Prep",
    scorePercent: 0,
    status: "ASSIGNED_PROGRAM",
    placementComplete: true,
    assignedWeek: 1,
    requiredWeeks: [],
    optionalWeeks: [],
    unlockedLegends: [],
  });
}
