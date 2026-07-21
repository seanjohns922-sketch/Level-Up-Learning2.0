"use client";

import type { CSSProperties, ReactNode } from "react";
import { ArrowLeft, User, Zap } from "lucide-react";
import DemoModeNavigationControls from "@/components/demo/DemoModeNavigationControls";

export default function RealmTopNavigation({
  realmName,
  realmMark,
  accent,
  text,
  navBackground,
  navBorder,
  realmChipBackground,
  realmChipBorder,
  globalXp,
  progressLabel,
  levelSelector,
  onBack,
  onProfile,
}: {
  realmName: string;
  realmMark: string;
  accent: string;
  text: string;
  navBackground: string;
  navBorder: string;
  realmChipBackground: string;
  realmChipBorder: string;
  globalXp: number | string | null;
  progressLabel: string;
  levelSelector: ReactNode;
  onBack: () => void;
  onProfile: () => void;
}) {
  const chip: CSSProperties = {
    minHeight: 34,
    padding: "0 11px",
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexShrink: 0,
    background: "rgba(8,11,24,0.48)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: text,
  };

  return (
    <header
      className="realm-top-navigation"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        minHeight: 54,
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "10px 14px",
        background: navBackground,
        borderBottom: `1px solid ${navBorder}`,
        backdropFilter: "blur(16px)",
      }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Return to the realm carousel"
        style={{ ...chip, cursor: "pointer", fontSize: 12, fontWeight: 700 }}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        <span className="realm-back-label">Back</span>
      </button>
      <div
        className="realm-name-chip"
        style={{ ...chip, background: realmChipBackground, border: `1px solid ${realmChipBorder}` }}
      >
        <span style={{ color: accent, fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", fontFamily: "ui-monospace,monospace", whiteSpace: "nowrap" }}>
          {realmMark} {realmName.toUpperCase()}
        </span>
      </div>
      {levelSelector}
      <div style={{ flex: 1, minWidth: 4 }} />
      <div style={chip} title="Global XP available in every realm">
        <Zap size={11} color={accent} aria-hidden="true" />
        <span style={{ color: text, fontSize: 9, fontWeight: 800, fontFamily: "ui-monospace,monospace", whiteSpace: "nowrap" }}>
          {globalXp == null ? "—" : globalXp} XP
        </span>
      </div>
      <div className="realm-progress-chip" style={chip}>
        <span style={{ color: accent, fontSize: 9, fontWeight: 800, fontFamily: "ui-monospace,monospace", whiteSpace: "nowrap" }}>
          {progressLabel}
        </span>
      </div>
      <DemoModeNavigationControls
        accent={accent}
        text={text}
        background={realmChipBackground}
        border={`1px solid ${realmChipBorder}`}
      />
      <button
        type="button"
        onClick={onProfile}
        aria-label="Open student profile"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: 34,
          height: 34,
          borderRadius: "50%",
          cursor: "pointer",
          background: realmChipBackground,
          border: `1px solid ${realmChipBorder}`,
        }}
      >
        <User size={16} color={accent} aria-hidden="true" />
      </button>
      <style jsx>{`
        @media (max-width: 760px) {
          .realm-top-navigation { gap: 5px !important; padding-inline: 8px !important; }
          .realm-back-label { display: none; }
          .realm-name-chip { padding-inline: 8px !important; }
          .realm-progress-chip { display: none !important; }
        }
      `}</style>
    </header>
  );
}
