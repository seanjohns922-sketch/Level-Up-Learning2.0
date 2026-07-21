"use client";

import { useRouter } from "next/navigation";
import { clearScopedProgress } from "@/data/progress";
import { deactivateDemoPreviewMode, isDemoPreviewMode } from "@/lib/demo-mode";
import { clearScopedProgramStore } from "@/lib/program-progress";
import { clearActiveStudentSession } from "@/lib/studentIdentity";

export default function DemoModeNavigationControls({
  accent,
  text,
  background = "rgba(255,255,255,0.055)",
  border,
}: {
  accent: string;
  text: string;
  background?: string;
  border?: string;
}) {
  const router = useRouter();
  if (!isDemoPreviewMode()) return null;

  function exitDemoMode() {
    clearScopedProgress("demo-preview");
    clearScopedProgramStore("demo-preview");
    clearActiveStudentSession();
    deactivateDemoPreviewMode();
    router.replace("/login");
  }

  const base = {
    minHeight: 30,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap" as const,
    fontFamily: "ui-monospace,monospace",
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: "0.08em",
  };

  return (
    <div className="realm-demo-controls" style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span
        title="Demo Mode"
        style={{ ...base, padding: "0 9px", color: text, background, border: border ?? `1px solid ${accent}44` }}
      >
        <span className="realm-demo-long-label">Demo Mode</span>
        <span className="realm-demo-short-label">Demo</span>
      </span>
      <button
        type="button"
        onClick={exitDemoMode}
        title="Exit Demo Mode"
        style={{ ...base, padding: "0 10px", cursor: "pointer", color: "#fff", background: accent, border: `1px solid ${accent}` }}
      >
        <span className="realm-demo-long-label">Exit Demo</span>
        <span className="realm-demo-short-label">Exit</span>
      </button>
      <style jsx>{`
        .realm-demo-short-label { display: none; }
        @media (max-width: 860px) {
          .realm-demo-long-label { display: none; }
          .realm-demo-short-label { display: inline; }
        }
      `}</style>
    </div>
  );
}
