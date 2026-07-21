"use client";

import { Check, Eye, Lock } from "lucide-react";
import type { RealmDashboardLevelOption } from "./types";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

export default function RealmLevelSelector({
  levels,
  selectedLevel,
  accent,
  onSelect,
}: {
  levels: RealmDashboardLevelOption[];
  selectedLevel: RealmLevelId;
  accent: string;
  onSelect: (level: RealmLevelId) => void;
}) {
  return (
    <nav
      aria-label="Choose realm level"
      className="realm-level-strip"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        minWidth: 0,
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      {levels.map((level, index) => {
        const locked = level.state === "locked";
        const selected = level.id === selectedLevel;
        const reviewing = level.state === "reviewing";
        const shortLabel = index === 0 ? "GROUND" : `LV ${index}`;

        return (
          <button
            key={level.id}
            type="button"
            disabled={locked}
            onClick={() => !locked && onSelect(level.id)}
            aria-current={selected ? "page" : undefined}
            aria-label={`${level.label}${locked ? ", locked" : reviewing ? ", review mode" : ""}`}
            title={level.label}
            style={{
              height: 28,
              minWidth: index === 0 ? 70 : 46,
              padding: "0 9px",
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              flexShrink: 0,
              cursor: locked ? "not-allowed" : "pointer",
              opacity: locked ? 0.42 : 1,
              background: reviewing
                ? "rgba(245,158,11,0.16)"
                : selected
                  ? `${accent}22`
                  : "rgba(255,255,255,0.045)",
              border: reviewing
                ? "1px solid rgba(245,158,11,0.48)"
                : `1px solid ${selected ? `${accent}88` : "rgba(255,255,255,0.1)"}`,
              color: reviewing ? "#fbbf24" : selected ? accent : "rgba(255,247,237,0.68)",
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.12em",
              fontFamily: "ui-monospace,monospace",
              whiteSpace: "nowrap",
              boxShadow: selected ? `0 0 14px ${accent}22` : "none",
              transition: "border-color 160ms ease, background 160ms ease, color 160ms ease",
            }}
          >
            {shortLabel}
            {locked ? <Lock size={9} aria-hidden="true" /> : null}
            {reviewing ? <Eye size={10} aria-hidden="true" /> : null}
            {level.state === "current" && selected ? <Check size={10} aria-hidden="true" /> : null}
          </button>
        );
      })}
    </nav>
  );
}
