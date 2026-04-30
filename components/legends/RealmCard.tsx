"use client";

import { Lock, Sparkles, ChevronRight } from "lucide-react";
import type { RealmDef } from "@/app/legends/page";

export default function RealmCard({
  realm,
  collected,
  onClick,
}: {
  realm: RealmDef;
  collected: number;
  onClick?: () => void;
}) {
  const isOpen = realm.status === "open";
  const isComingSoon = realm.status === "coming-soon";
  const isLocked = realm.status === "locked";

  return (
    <button
      onClick={isOpen ? onClick : undefined}
      disabled={!isOpen}
      className={`relative w-full rounded-2xl text-left p-4 transition-all duration-300 overflow-hidden group ${
        isOpen ? "hover:-translate-y-1 cursor-pointer" : "cursor-default"
      }`}
      style={{
        background: isLocked
          ? "rgba(255,255,255,0.08)"
          : isComingSoon
          ? "rgba(255,255,255,0.12)"
          : "rgba(255,255,255,0.15)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1.5px solid ${realm.borderGlow}`,
        boxShadow: isOpen
          ? `0 0 20px ${realm.glowColor}, 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)`
          : isComingSoon
          ? `0 0 16px ${realm.glowColor}, 0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)`
          : "0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
        opacity: isLocked ? 0.7 : 1,
      }}
    >
      {/* Shine sweep on hover */}
      {isOpen && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000" />
        </div>
      )}

      <div className="flex items-start gap-3.5">
        {/* Icon */}
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: isLocked
              ? "rgba(255,255,255,0.08)"
              : isComingSoon
              ? "rgba(245,180,50,0.15)"
              : "rgba(45,212,160,0.15)",
            color: isLocked
              ? "rgba(255,255,255,0.4)"
              : isComingSoon
              ? "rgb(245,180,50)"
              : "rgb(45,212,160)",
            border: `1px solid ${
              isLocked
                ? "rgba(255,255,255,0.1)"
                : isComingSoon
                ? "rgba(245,180,50,0.3)"
                : "rgba(45,212,160,0.3)"
            }`,
          }}
        >
          {isLocked ? <Lock className="h-4 w-4" /> : realm.icon}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="font-extrabold text-base leading-tight"
            style={{
              color: isLocked ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.95)",
              textShadow: isLocked ? "none" : "0 1px 3px rgba(0,0,0,0.3)",
            }}
          >
            {realm.name}
          </h3>
          <p
            className="text-sm mt-0.5"
            style={{ color: isLocked ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)" }}
          >
            {isLocked ? "Future Realm" : isComingSoon ? `Coming Soon: ${realm.legendLine}` : realm.legendLine}
          </p>

          <div className="mt-2.5">
            {isOpen && (
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-bold"
                  style={{ color: "rgb(45,212,160)", textShadow: "0 0 8px rgba(45,212,160,0.3)" }}
                >
                  {collected} / {realm.totalLegends} collected
                </span>
                <ChevronRight className="h-4 w-4 text-white/70 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </div>
            )}
            {isComingSoon && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full"
                style={{
                  background: "rgba(245,180,50,0.15)",
                  color: "rgb(245,200,80)",
                  border: "1px solid rgba(245,180,50,0.3)",
                }}
              >
                <Sparkles className="h-3 w-3" /> Coming Soon
              </span>
            )}
            {isLocked && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>
                <Lock className="h-3 w-3" /> Unlock in future updates
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
