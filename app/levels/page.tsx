"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isPlacementComplete, readProgress, writeProgress, StudentProgress } from "@/data/progress";
import { getEffectiveUnlockedLegendIds, getLegendForYear } from "@/data/legends";
import { getRecommendedAssignedWeek, readProgramStore } from "@/lib/program-progress";
import { getProgramForYear } from "@/data/programs";
import { DEMO_MODE } from "@/data/config";
import { clearActiveStudentSession } from "@/lib/studentIdentity";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { supabase } from "@/lib/supabase";

export default function LevelsPage() {
  const router = useRouter();

  const levels = useMemo(
    () => [
      { id: "Prep", label: "Ground Level", icon: "sprout" },
      { id: "Year 1", label: "Level 1", icon: "numbers" },
      { id: "Year 2", label: "Level 2", icon: "tiles" },
      { id: "Year 3", label: "Level 3", icon: "bolt" },
      { id: "Year 4", label: "Level 4", icon: "rocket" },
      { id: "Year 5", label: "Level 5", icon: "trophy" },
      { id: "Year 6", label: "Level 6", icon: "crown" },
    ],
    []
  );

  const [progress] = useState<StudentProgress | null>(() => readProgress());
  const [selectedYear, setSelectedYear] = useState<string | null>(() => readProgress()?.year ?? null);
  const previewMode = typeof window !== "undefined" && isDemoPreviewMode();

  useEffect(() => {
    if (!previewMode && !isPlacementComplete(progress)) {
      router.replace("/home");
    }
  }, [previewMode, progress, router]);

  const hasProgressForSelected =
    progress && selectedYear && progress.year === selectedYear;

  const savedWeek =
    progress?.status === "ASSIGNED_PROGRAM"
      ? getRecommendedAssignedWeek(
          readProgramStore(),
          progress.year,
          progress.assignedWeek,
          progress.requiredWeeks
        )
      : null;


  function continueProgram() {
    if (!progress) return;
    router.push(`/realms?level=${encodeURIComponent(progress.year)}`);
  }

  function goLegends() {
    router.push("/legends");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    clearActiveStudentSession();
    router.push("/login");
  }

  const primaryCta = (() => {
    if (!selectedYear) {
      return { label: "Start Pre-Test", onClick: () => {}, disabled: true };
    }

    if (DEMO_MODE || previewMode) {
      const selectedProgram = getProgramForYear(selectedYear);
      const fallbackYear = "Year 1";
      const targetYear = selectedProgram.length > 0 ? selectedYear : fallbackYear;
      return {
        label: `Enter the Tower`,
        onClick: () => {
          const existing = readProgress();
          if (!existing || existing.year !== targetYear) {
            writeProgress({
              year: targetYear,
              scorePercent: 0,
              status: "ASSIGNED_PROGRAM",
              assignedWeek: 1,
              unlockedLegends: existing?.unlockedLegends ?? [],
            });
          }
          router.push(`/realms?level=${encodeURIComponent(targetYear)}`);
        },
        disabled: false,
      };
    }

    if (hasProgressForSelected && progress?.status === "ASSIGNED_PROGRAM") {
      return {
        label: `Continue Week ${savedWeek ?? 1}`,
        onClick: continueProgram,
        disabled: false,
      };
    }

    if (hasProgressForSelected && progress?.status === "PASSED") {
      return {
        label: "Enter the Tower",
        onClick: continueProgram,
        disabled: false,
      };
    }

    return {
      label: `Enter ${selectedYear}`,
      onClick: () => router.push(`/realms?level=${encodeURIComponent(selectedYear)}`),
      disabled: false,
    };
  })();

  const showLegendsButton = !!progress;
  const unlockedYear = progress?.year ?? "Year 1";
  const unlockedYearIndex = levels.findIndex((level) => level.id === unlockedYear);
  const passedLegendIds = new Set(getEffectiveUnlockedLegendIds(progress?.year, progress?.unlockedLegends).filter(Boolean));

  return (
    <main className="min-h-screen relative px-6 py-10">
      <div className="fixed inset-0 z-0">
        <img src="/images/levels-bg.jpg" alt="" className="w-full h-full object-cover" style={{ objectPosition: "center 30%" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/30" />
      </div>
      <div className="relative z-10 min-h-screen flex flex-col md:flex-row items-stretch px-4 md:px-8 py-8 gap-6">
        {/* Left column — anchored to tower (top: peak, middle: body, bottom: base) */}
        <div className="md:w-[38%] flex flex-col items-start px-4 md:px-8 min-h-[calc(100vh-4rem)]">
          {/* TOP — aligns with tower peak / panel header */}
          <div className="w-full pt-4 md:pt-[8vh] lg:pt-[10vh]">
            <button
              onClick={handleLogout}
              className="text-sm text-white/80 hover:text-white hover:underline"
              type="button"
            >
              ← Log out
            </button>
          </div>

          {/* MIDDLE — centered to tower body */}
          <div className="w-full flex-1 flex flex-col justify-center">
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-wide leading-tight"
              style={{
                fontFamily: "'Quicksand', 'Nunito', sans-serif",
                textShadow: "0 10px 30px rgba(0,0,0,0.35), 0 0 60px rgba(255,210,80,0.25)",
              }}
            >
              Choose Your Path
            </h1>
            <p
              className="text-amber-100/90 mt-4 text-lg font-medium tracking-wide max-w-xs"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
            >
              Select a learning level to begin your journey.
            </p>
          </div>

          {/* BOTTOM — anchored to tower base / bridge */}
          <div className="w-full pb-4 md:pb-[8vh] lg:pb-[10vh] flex items-center gap-3">
            <button
              onClick={() => router.push("/tower")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black text-[#1a0e00] transition hover:brightness-105"
              style={{
                background: "linear-gradient(135deg, #fff8e8, #e8c878 60%, #c8a030)",
                boxShadow: "0 4px 16px rgba(200,160,48,0.35)",
              }}
            >
              🏰 Tower of Knowledge
            </button>
            {showLegendsButton ? (
              <button
                onClick={goLegends}
                className="px-5 py-2.5 rounded-2xl text-sm font-bold transition"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                }}
              >
                My Legends
              </button>
            ) : null}
          </div>
        </div>

        {/* Right column — slim fantasy menu */}
        <div className="md:w-[62%] flex flex-col justify-start md:items-end">
          <div className="relative w-full max-w-[280px] md:mr-4 lg:mr-10 mt-4 md:mt-[8vh] lg:mt-[10vh]">
            <div
              className="absolute inset-0 -m-5 pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, rgba(180,140,80,0.10), transparent 75%)",
              }}
            />
            <div
              className="relative rounded-[18px] p-4"
              style={{
                background: "linear-gradient(180deg, rgba(20,18,22,0.42), rgba(15,13,18,0.55))",
                backdropFilter: "blur(10px) saturate(120%)",
                WebkitBackdropFilter: "blur(10px) saturate(120%)",
                border: "1px solid rgba(200,170,110,0.18)",
                boxShadow: "0 18px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,220,160,0.06)",
              }}
            >
              <h2
                className="text-white/90 text-[11px] font-bold tracking-[0.22em] uppercase mb-3 px-1"
                style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif" }}
              >
                Choose Level
              </h2>

              <div className="flex flex-col gap-1.5">
                {levels.map((level) => {
                  const isSelected = selectedYear === level.id;
                  const levelIndex = levels.findIndex((item) => item.id === level.id);
                  const currentLevelLegendId = getLegendForYear(level.id).id;
                  const isPreviouslyPassed = passedLegendIds.has(currentLevelLegendId) && levelIndex < unlockedYearIndex;
                  const isUnlocked = DEMO_MODE || previewMode || level.id === unlockedYear || isPreviouslyPassed;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => {
                        if (!isUnlocked) return;
                        setSelectedYear(level.id);
                      }}
                      className={[
                        "relative w-full text-left flex items-center justify-between",
                        !isUnlocked ? "opacity-45 cursor-not-allowed" : "cursor-pointer",
                      ].join(" ")}
                      style={{
                        borderRadius: "10px",
                        padding: "10px 14px",
                        height: "42px",
                        transition: "all 0.18s ease",
                        ...(isSelected
                          ? {
                              background: "linear-gradient(180deg, #2a2620, #1a1714)",
                              border: "1px solid rgba(212,175,110,0.55)",
                              boxShadow:
                                "0 0 0 1px rgba(212,175,110,0.18), inset 0 1px 0 rgba(255,220,160,0.08), 0 6px 18px rgba(0,0,0,0.35)",
                            }
                          : {
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                            }),
                      }}
                      onMouseEnter={(e) => {
                        if (!isUnlocked || isSelected) return;
                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.borderColor = "rgba(212,175,110,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isUnlocked || isSelected) return;
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      }}
                    >
                      <span
                        className={`text-sm font-semibold tracking-wide ${
                          isSelected ? "text-amber-50" : "text-white/75"
                        }`}
                      >
                        {level.label}
                      </span>
                      {!isUnlocked ? (
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white/40" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="4" y="11" width="16" height="9" rx="2" />
                          <path d="M8 11V7a4 4 0 018 0v4" />
                        </svg>
                      ) : isSelected ? (
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: "#d4af6e", boxShadow: "0 0 6px rgba(212,175,110,0.7)" }}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={primaryCta.onClick}
                  disabled={primaryCta.disabled}
                  className={[
                    "w-full font-bold text-sm tracking-wide",
                    primaryCta.disabled ? "cursor-not-allowed" : "cursor-pointer",
                  ].join(" ")}
                  style={{
                    borderRadius: "12px",
                    padding: "14px",
                    transition: "all 0.18s ease",
                    ...(primaryCta.disabled
                      ? {
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.35)",
                        }
                      : {
                          background:
                            "linear-gradient(180deg, #3a3128 0%, #241e18 100%)",
                          border: "1px solid rgba(212,175,110,0.5)",
                          color: "#f5e6c8",
                          boxShadow:
                            "0 10px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,220,160,0.18), 0 0 0 1px rgba(212,175,110,0.15)",
                        }),
                  }}
                  onMouseEnter={(e) => {
                    if (primaryCta.disabled) return;
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 14px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,220,160,0.25), 0 0 0 1px rgba(212,175,110,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    if (primaryCta.disabled) return;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,220,160,0.18), 0 0 0 1px rgba(212,175,110,0.15)";
                  }}
                >
                  {primaryCta.label}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
