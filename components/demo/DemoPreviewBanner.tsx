"use client";

import { usePathname, useRouter } from "next/navigation";
import { deactivateDemoPreviewMode, isDemoPreviewMode } from "@/lib/demo-mode";
import { clearScopedProgress } from "@/data/progress";
import { clearScopedProgramStore } from "@/lib/program-progress";
import { clearActiveStudentSession } from "@/lib/studentIdentity";

export default function DemoPreviewBanner() {
  const router = useRouter();
  usePathname();
  const active = isDemoPreviewMode();

  if (!active) return null;

  function exitDemoMode() {
    clearScopedProgress("demo-preview");
    clearScopedProgramStore("demo-preview");
    clearActiveStudentSession();
    deactivateDemoPreviewMode();
    router.replace("/login");
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[90] px-3 pt-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-2xl border border-amber-300/50 bg-amber-50/95 px-4 py-3 text-sm text-amber-950 shadow-[0_12px_32px_rgba(0,0,0,0.18)] backdrop-blur-md">
        <div className="font-bold">Demo Preview Mode — progress may not save</div>
        <button
          type="button"
          onClick={exitDemoMode}
          className="rounded-xl bg-amber-900 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-amber-50 transition hover:brightness-110"
        >
          Exit Demo Mode
        </button>
      </div>
    </div>
  );
}
