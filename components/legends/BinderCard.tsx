"use client";

import { Lock } from "lucide-react";
import type { Legend } from "@/data/legends";

export default function BinderCard({
  legend,
  isUnlocked,
  onClick,
}: {
  legend: Legend;
  isUnlocked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={isUnlocked ? onClick : undefined}
      disabled={!isUnlocked}
      className="group relative w-full"
      title={
        isUnlocked
          ? `View ${legend.name}`
          : `Unlock by completing the ${legend.yearLabel} Number program.`
      }
    >
      <div
        className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-300 aspect-[2/3] ${
          isUnlocked
            ? "border-teal-400/40 shadow-lg shadow-teal-200/30 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-teal-300/30 hover:border-teal-400/60 cursor-pointer"
            : "border-border bg-muted/40 opacity-70 cursor-default"
        }`}
      >
        {/* Card artwork */}
        <div className="absolute inset-0">
          <img
            src={legend.images.cardFront}
            alt={legend.name}
            className={`h-full w-full object-cover transition-all duration-300 ${
              isUnlocked ? "" : "blur-[4px] grayscale opacity-40"
            }`}
          />
        </div>

        {/* Unlocked glow overlay */}
        {isUnlocked && (
          <div className="absolute inset-0 bg-gradient-to-t from-teal-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}

        {/* Lock overlay for locked cards */}
        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/30">
            <div className="p-3 rounded-full bg-muted/80 border border-border shadow-sm">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          {isUnlocked ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/90 text-[8px] font-extrabold text-white shadow backdrop-blur-sm">
              ✦ UNLOCKED
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-muted/80 text-[8px] font-extrabold text-muted-foreground shadow backdrop-blur-sm border border-border/50">
              <Lock className="h-2 w-2" /> LOCKED
            </span>
          )}
        </div>

        {/* Bottom label */}
        <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
          <p className="text-[9px] font-bold text-white/70 tracking-wider">
            {legend.yearLabel.toUpperCase()}
          </p>
          <p
            className={`text-xs font-extrabold leading-tight ${
              isUnlocked ? "text-white" : "text-white/50"
            }`}
          >
            {legend.name}
          </p>
        </div>
      </div>
    </button>
  );
}
