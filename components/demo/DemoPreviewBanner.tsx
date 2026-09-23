"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { deactivateDemoPreviewMode, useDemoPreviewMode } from "@/lib/demo-mode";
import { clearScopedProgress } from "@/data/progress";
import { clearScopedProgramStore } from "@/lib/program-progress";
import { resetDemoEconomyPreview } from "@/lib/economy";
import { clearActiveStudentSession } from "@/lib/studentIdentity";

export default function DemoPreviewBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = useDemoPreviewMode();
  const isStarpathProgram = pathname === "/program" && searchParams.get("realm_id") === "space";
  // These routes carry their own Preview / Demo Review / Exit controls (realm top bar or 3D world HUD).
  const usesRealmNavigation = ["/measurelands", "/number-nexus", "/starpath", "/world"].some(
    (route) => pathname.startsWith(route),
  );

  if (!active || usesRealmNavigation) return null;

  const reviewingAssessment = pathname === "/pretest" || pathname === "/posttest" || pathname.startsWith("/demo-review/");
  function exitDemoMode() {
    if (reviewingAssessment) {
      const strand = searchParams.get("strand");
      const realm = pathname.includes("statistica-") ? "statistics" : pathname.includes("measurement-") ? "measurement" : pathname.includes("number") ? "number" : searchParams.get("realm_id") ?? (strand === "algebra" ? "pattern" : strand === "probability" ? "chance" : strand) ?? "number";
      const year = pathname === "/demo-review/statistica-level6" ? "Year 6" : pathname === "/demo-review/statistica-level5" ? "Year 5" : pathname === "/demo-review/statistica-level4" ? "Year 4" : pathname === "/demo-review/statistica-level3" ? "Year 3" : pathname === "/demo-review/statistica-level2" ? "Year 2" : pathname === "/demo-review/statistica-level1" ? "Year 1" : pathname === "/demo-review/measurement-level8" ? "Year 8" : pathname === "/demo-review/measurement-level7" ? "Year 7" : pathname === "/demo-review/measurement-level6" ? "Year 6" : pathname === "/demo-review/measurement-level5" ? "Year 5" : pathname === "/demo-review/measurement-level4" ? "Year 4" : pathname === "/demo-review/measurement-level3" ? "Year 3" : pathname === "/demo-review/measurement-level2" ? "Year 2" : pathname === "/demo-review/measurement-level1" ? "Year 1" : /^\/demo-review\/number-level-[1-8]$/.test(pathname) ? `Year ${pathname.slice(-1)}` : searchParams.get("year") ?? searchParams.get("level") ?? "Prep";
      router.push(`/demo-review?${new URLSearchParams({realm,year}).toString()}`);
      return;
    }
    clearScopedProgress("demo-preview");
    clearScopedProgramStore("demo-preview");
    resetDemoEconomyPreview();
    clearActiveStudentSession();
    deactivateDemoPreviewMode();
    router.replace("/login");
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[90] flex justify-center px-3 sm:top-4">
      <div className={`pointer-events-auto inline-flex max-w-[calc(100vw-1.5rem)] items-center gap-2 border border-amber-300/55 bg-amber-50/95 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-950 shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md sm:max-w-none sm:px-3.5 ${isStarpathProgram ? "rounded-lg" : "rounded-full"}`}>
        <div className="whitespace-nowrap">Demo Mode</div>
        <button
          type="button"
          onClick={exitDemoMode}
          className={`${isStarpathProgram ? "rounded-md" : "rounded-full"} bg-amber-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-50 transition hover:brightness-110`}
        >
          {reviewingAssessment ? "Back to Review" : "Exit"}
        </button>
      </div>
    </div>
  );
}
