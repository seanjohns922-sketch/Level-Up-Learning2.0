"use client";

import type { CSSProperties } from "react";
import { ArrowUpRight, Lock } from "lucide-react";
import LegendCardArtwork from "@/components/legends/LegendCardArtwork";
import type { Legend } from "@/data/legends";
import { getReliqsColor } from "@/lib/reliqs-brand";
import styles from "./BinderCard.module.css";

export default function BinderCard({ legend, isUnlocked, isDemoPreview = false, onClick }: {
  legend: Legend;
  isUnlocked: boolean;
  isDemoPreview?: boolean;
  onClick: () => void;
}) {
  const names: Record<string, string> = {
    "number-nexus": "Number Nexus", measurelands: "Measurelands", starpath: "Starpath",
    "pattern-peaks": "Pattern Peaks", statistica: "Statistica", "chance-hollow": "Chance Hollow",
  };
  const color = getReliqsColor(legend.realmId);
  const unlockLabel = `Unlock by completing the ${legend.yearLabel} ${names[legend.realmId] ?? "realm"} program.`;
  return (
    <button
      type="button"
      onClick={isUnlocked ? onClick : undefined}
      disabled={!isUnlocked}
      className={styles.card}
      style={{ "--vault-accent": color } as CSSProperties}
      aria-label={isUnlocked ? `View ${legend.name}, ${legend.yearLabel}${isDemoPreview ? ", demo preview" : ""}` : `${legend.name}. ${unlockLabel}`}
      title={isUnlocked ? `View ${legend.name}` : unlockLabel}
    >
      <div className={styles.art}>
        <LegendCardArtwork
          src={legend.images.cardFront}
          alt={legend.name}
          loading="lazy"
          className="h-full w-full"
          style={{ filter: isUnlocked ? "none" : "grayscale(85%)", opacity: isUnlocked ? 1 : 0.35 }}
        />
        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="rounded-full border border-white/20 bg-black/70 p-3 text-white/75 backdrop-blur-md"><Lock aria-hidden="true" className="h-5 w-5" /></span>
          </div>
        )}
      </div>
      <div className="px-1 pb-1 pt-4 sm:px-2">
        <div className="flex items-center justify-between gap-1 text-[9px] font-bold uppercase tracking-wider text-white/55 sm:text-[10px]">
          <span>{legend.yearLabel}</span>
          <span>{isDemoPreview && isUnlocked ? "Preview" : isUnlocked ? "Collected" : "Locked"}</span>
        </div>
        <div className="mt-2 flex min-h-10 items-start justify-between gap-2">
          <span className="text-sm font-bold leading-snug text-white/90 sm:text-base">{legend.name}</span>
          {isUnlocked && <ArrowUpRight aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />}
        </div>
      </div>
    </button>
  );
}
