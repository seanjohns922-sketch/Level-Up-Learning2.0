"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clearScopedProgress, readProgress, writeProgress, StudentProgress } from "@/data/progress";
import { clearScopedProgramStore } from "@/lib/program-progress";
import { getProgramForYear } from "@/data/programs";
import { DEMO_MODE } from "@/data/config";

function clearProgress() {
  if (typeof window === "undefined") return;
  clearScopedProgress();
  clearScopedProgramStore();
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("lul_week_")) localStorage.removeItem(key);
    });
  } catch {
    // ignore
  }
}

export default function LevelsPage() {
  const router = useRouter();

  const levels = useMemo(
    () => [
      { id: "Prep", label: "Prep", icon: "sprout" },
      { id: "Year 1", label: "Level 1", icon: "numbers" },
      { id: "Year 2", label: "Level 2", icon: "tiles" },
      { id: "Year 3", label: "Level 3", icon: "bolt" },
      { id: "Year 4", label: "Level 4", icon: "rocket" },
      { id: "Year 5", label: "Level 5", icon: "trophy" },
      { id: "Year 6", label: "Level 6", icon: "crown" },
    ],
    []
  );

  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  useEffect(() => {
    if (!selectedYear && progress?.year) setSelectedYear(progress.year);
  }, [progress, selectedYear]);

  const hasProgressForSelected =
    progress && selectedYear && progress.year === selectedYear;

  const savedWeek =
    progress?.status === "ASSIGNED_PROGRAM"
      ? Math.max(1, Math.min(12, progress.assignedWeek ?? 1))
      : null;

  const programWeek = useMemo(() => {
    if (!selectedYear) return null;
    const program = getProgramForYear(selectedYear);
    if (!program.length) return null;
    const week = savedWeek ?? 1;
    return program.find((w) => w.week === week) ?? null;
  }, [selectedYear, savedWeek]);

  function startPretest(forYear: string) {
    const qs = new URLSearchParams({ year: forYear }).toString();
    router.push(`/pretest?${qs}`);
  }

  function continueProgram() {
    if (!progress) return;
    if (progress.status === "ASSIGNED_PROGRAM") {
      const year = encodeURIComponent(progress.year);
      const week = progress.assignedWeek ?? 1;
      router.push(`/program?year=${year}&week=${week}`);
      return;
    }
    router.push("/legends");
  }

  function goLegends() {
    router.push("/legends");
  }

  function goHome() {
    router.push("/home");
  }

  function nextYear(year: string) {
    const ids = levels.map((l) => l.id);
    const idx = ids.indexOf(year);
    if (idx === -1) return ids[0];
    return ids[Math.min(ids.length - 1, idx + 1)];
  }

  function resetMvp() {
    clearProgress();
    setProgress(null);
    setSelectedYear(null);
  }

  const primaryCta = useMemo(() => {
    if (!selectedYear) {
      return { label: "Start Pre-Test", onClick: () => {}, disabled: true };
    }

    if (DEMO_MODE) {
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
      const ny = nextYear(progress.year);
      return {
        label: ny === progress.year ? "Year Passed" : `Start ${ny} Pre-Test`,
        onClick: () => {
          if (ny === progress.year) return;
          startPretest(ny);
        },
        disabled: ny === progress.year,
      };
    }

    return {
      label: `Start ${selectedYear} Pre-Test`,
      onClick: () => startPretest(selectedYear),
      disabled: false,
    };
  }, [selectedYear, hasProgressForSelected, progress, levels]);

  const showLegendsButton = !!progress;
  const unlockedYear = progress?.year ?? "Year 1";
  const hasAssignedProgram =
    progress?.status === "ASSIGNED_PROGRAM" ||
    typeof progress?.assignedWeek === "number" ||
    !!(progress as any)?.assignedProgram ||
    !!(progress as any)?.currentProgram;

  return (
    <main className="min-h-screen relative px-6 py-10">
      <div className="fixed inset-0 z-0">
        <img src="/images/levels-bg.jpg" alt="" className="w-full h-full object-cover" style={{ objectPosition: "center 30%" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/30" />
      </div>
      <div className="relative z-10 min-h-screen flex flex-col md:flex-row items-stretch px-4 md:px-8 py-8 gap-6">
        {/* Left column — hero text */}
        <div className="md:w-[38%] flex flex-col justify-center items-start px-4 md:px-8">
          <button
            onClick={goHome}
            className="text-sm text-white/80 hover:text-white hover:underline mb-8"
            type="button"
          >
            ← Back to Dashboard
          </button>
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

          <div className="mt-8 flex items-center gap-3">
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
            <button
              onClick={resetMvp}
              className="px-5 py-2.5 rounded-2xl text-sm font-bold transition"
              style={{
                background: "rgba(255,255,255,0.65)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Right column — level menu panel */}
        <div className="md:w-[62%] flex flex-col justify-center">
          <div className="relative w-full max-w-sm ml-auto mr-auto md:mr-8">
            <div
              className="absolute inset-0 -m-6 pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, rgba(120,160,255,0.18), transparent 70%)",
              }}
            />
            <div
              className="relative rounded-[20px] p-6"
              style={{
                background: "rgba(0,0,0,0.32)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <h2
                className="text-white text-xl font-bold tracking-wide mb-4"
                style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
              >
                Choose Level
              </h2>

              <div className="flex flex-col gap-2.5">
                {levels.map((level) => {
                  const isSelected = selectedYear === level.id;
                  const isUnlocked = DEMO_MODE || !hasAssignedProgram || level.id === unlockedYear;
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
                        !isUnlocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                      ].join(" ")}
                      style={{
                        borderRadius: "12px",
                        padding: "14px 18px",
                        height: "52px",
                        transition: "all 0.18s ease",
                        border: isSelected
                          ? "1px solid rgba(120,160,255,0.6)"
                          : "1px solid rgba(255,255,255,0.12)",
                        ...(isSelected
                          ? {
                              background: "linear-gradient(135deg, #5E8BFF, #4F7DF3)",
                              boxShadow: "0 0 0 1px rgba(120,160,255,0.4), 0 8px 24px rgba(80,120,255,0.45)",
                            }
                          : {
                              background: "rgba(255,255,255,0.08)",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                            }),
                      }}
                      onMouseEnter={(e) => {
                        if (!isUnlocked || isSelected) return;
                        e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isUnlocked || isSelected) return;
                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <span
                        className={`text-base font-semibold tracking-wide ${
                          isSelected ? "text-white" : "text-white/90"
                        }`}
                      >
                        {level.label}
                      </span>
                      {!isUnlocked ? (
                        <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/50" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="4" y="11" width="16" height="9" rx="2" />
                          <path d="M8 11V7a4 4 0 018 0v4" />
                        </svg>
                      ) : isSelected ? (
                        <span className="text-white/90 text-sm font-bold">✓</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 pt-5 border-t border-white/10">
                <button
                  onClick={primaryCta.onClick}
                  disabled={primaryCta.disabled}
                  className={[
                    "w-full font-bold text-base",
                    primaryCta.disabled ? "cursor-not-allowed" : "text-white cursor-pointer",
                  ].join(" ")}
                  style={{
                    borderRadius: "14px",
                    padding: "18px",
                    transition: "all 0.18s ease",
                    ...(primaryCta.disabled
                      ? {
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "rgba(255,255,255,0.4)",
                        }
                      : {
                          background: "linear-gradient(135deg, #6E97FF, #4F7DF3)",
                          border: "none",
                          boxShadow: "0 10px 28px rgba(80,120,255,0.5), inset 0 1px 0 rgba(255,255,255,0.25)",
                        }),
                  }}
                  onMouseEnter={(e) => {
                    if (primaryCta.disabled) return;
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 14px 36px rgba(80,120,255,0.6), inset 0 1px 0 rgba(255,255,255,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    if (primaryCta.disabled) return;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 10px 28px rgba(80,120,255,0.5), inset 0 1px 0 rgba(255,255,255,0.25)";
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
