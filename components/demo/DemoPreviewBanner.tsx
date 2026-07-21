"use client";

import { usePathname, useRouter } from "next/navigation";
import { deactivateDemoPreviewMode, isDemoPreviewMode } from "@/lib/demo-mode";
import { clearScopedProgress } from "@/data/progress";
import { clearScopedProgramStore } from "@/lib/program-progress";
import { clearActiveStudentSession } from "@/lib/studentIdentity";

export default function DemoPreviewBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const active = isDemoPreviewMode();
  const usesRealmNavigation = ["/measurelands", "/number-nexus", "/starpath"].some(
    (route) => pathname.startsWith(route),
  );

  if (!active || usesRealmNavigation) return null;

  function exitDemoMode() {
    clearScopedProgress("demo-preview");
    clearScopedProgramStore("demo-preview");
    clearActiveStudentSession();
    deactivateDemoPreviewMode();
    router.replace("/login");
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[90] flex justify-center px-3 sm:top-4">
      <div className="pointer-events-auto inline-flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full border border-amber-300/55 bg-amber-50/95 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-950 shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md sm:max-w-none sm:px-3.5">
        <div className="whitespace-nowrap">Demo Mode</div>
        <button
          type="button"
          onClick={exitDemoMode}
          className="rounded-full bg-amber-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-50 transition hover:brightness-110"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
