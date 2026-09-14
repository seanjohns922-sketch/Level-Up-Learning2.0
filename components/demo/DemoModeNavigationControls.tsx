"use client";

import { useRouter } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { clearScopedProgress } from "@/data/progress";
import { deactivateDemoPreviewMode, isDemoPreviewMode } from "@/lib/demo-mode";
import { resetDemoEconomyPreview } from "@/lib/economy";
import { clearScopedProgramStore } from "@/lib/program-progress";
import { clearActiveStudentSession } from "@/lib/studentIdentity";

export default function DemoModeNavigationControls({
  accent,
  text,
  background = "rgba(255,255,255,0.055)",
  border,
  accentText = "#fff",
  size = "compact",
}: {
  accent: string;
  text: string;
  background?: string;
  border?: string;
  accentText?: string;
  size?: "compact" | "hud";
}) {
  const router = useRouter();
  if (!isDemoPreviewMode()) return null;

  function exitDemoMode() {
    clearScopedProgress("demo-preview");
    clearScopedProgramStore("demo-preview");
    resetDemoEconomyPreview();
    clearActiveStudentSession();
    deactivateDemoPreviewMode();
    router.replace("/login");
  }

  const hud = size === "hud";
  const base = {
    minHeight: hud ? 40 : 30,
    borderRadius: hud ? 5 : 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap" as const,
    fontFamily: hud ? "inherit" : "ui-monospace,monospace",
    fontSize: hud ? 11 : 8,
    fontWeight: 900,
    letterSpacing: hud ? "0.05em" : "0.08em",
    textTransform: hud ? ("uppercase" as const) : undefined,
  };

  return (
    <div className="realm-demo-controls" style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span
        className="realm-demo-mode-pill"
        title="Preview Mode"
        style={{ ...base, padding: "0 9px", color: text, background, border: border ?? `1px solid ${accent}44` }}
      >
        <span className="realm-demo-long-label">Preview Mode</span>
        <span className="realm-demo-short-label">Preview</span>
      </span>
      <button
        type="button"
        onClick={() => router.push("/demo-review")}
        title="Open Demo Review"
        aria-label="Open Demo Review"
        style={{ ...base, width: hud ? 40 : 30, padding: 0, cursor: "pointer", color: text, background, border: border ?? `1px solid ${accent}44` }}
      >
        <ClipboardCheck size={hud ? 17 : 14} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={exitDemoMode}
        title="Exit Preview Mode"
        style={{ ...base, padding: "0 10px", cursor: "pointer", color: accentText, background: accent, border: `1px solid ${accent}` }}
      >
        <span className="realm-demo-long-label">Exit Preview</span>
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
