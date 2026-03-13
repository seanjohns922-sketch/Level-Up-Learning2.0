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
        label: `Open ${targetYear} Program`,
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
          router.push("/home");
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
        <img src="/images/tower-plaza-bg.jpg" alt="" className="w-full h-full object-cover" style={{ filter: "blur(0.5px) saturate(1.15) brightness(1.12)", objectPosition: "center 20%" }} />
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.08)" }} />

        {/* Golden light rays from tower center */}
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "35%",
            width: "140vw",
            height: "140vw",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        >
          {[...Array(8)].map((_, i) => {
            const angle = i * 45;
            return (
              <div
                key={`ray${i}`}
                className="absolute"
                style={{
                  left: "50%",
                  top: "50%",
                  width: "4px",
                  height: "50%",
                  transformOrigin: "bottom center",
                  transform: `translateX(-50%) rotate(${angle}deg)`,
                  background: `linear-gradient(to top, rgba(255,210,80,0.3), rgba(255,230,130,0.08) 60%, transparent)`,
                  filter: "blur(8px)",
                  animation: `rayPulse ${4 + (i % 3)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            );
          })}
        </div>

        {/* Radial glow from tower */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            top: "35%",
            width: "60vw",
            height: "60vw",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(255,210,80,0.15) 0%, rgba(255,180,50,0.05) 40%, transparent 70%)",
            animation: "rayPulse 5s ease-in-out infinite",
          }}
        />

        {/* Dense magic particles — 75 total */}
        {[...Array(75)].map((_, i) => {
          const isCentered = i < 25;
          const left = isCentered
            ? 30 + Math.sin(i * 1.7) * 20
            : (i * 5.3 + 3) % 96;
          const bottom = (i * 4.1 + 2) % 90;
          const size = 2 + (i % 6) * 0.7;
          const duration = 6 + (i % 8) * 2;
          const delay = (i * 0.4) % 14;
          const drift = (i % 3 === 0) ? `${(i % 2 === 0 ? 1 : -1) * (8 + i % 15)}px` : "0px";
          const colors = [
            "rgba(255,210,80,0.55)",
            "rgba(255,255,255,0.4)",
            "rgba(255,230,130,0.45)",
            "rgba(255,200,60,0.3)",
            "rgba(255,255,220,0.5)",
            "rgba(255,180,50,0.35)",
            "rgba(255,240,160,0.45)",
          ];
          const color = colors[i % colors.length];
          const opacity = 0.2 + (i % 6) * 0.08;

          return (
            <div
              key={`p${i}`}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                left: `${left}%`,
                bottom: `${bottom}%`,
                background: color,
                opacity,
                boxShadow: i % 3 === 0 ? `0 0 ${3 + i % 5}px ${color}` : "none",
                animation: `floatUp ${duration}s linear infinite`,
                animationDelay: `${delay}s`,
                ["--drift" as any]: drift,
              }}
            />
          );
        })}

        {/* Sparkle layer — larger, pulsing */}
        {[...Array(16)].map((_, i) => {
          const left = 20 + (i * 3.9) % 60;
          const bottom = 8 + (i * 6.1) % 65;
          const size = 3 + (i % 4) * 1.5;
          return (
            <div
              key={`s${i}`}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                left: `${left}%`,
                bottom: `${bottom}%`,
                background: "rgba(255,240,180,0.55)",
                boxShadow: `0 0 ${5 + i % 5}px rgba(255,210,100,0.35)`,
                animation: `floatUp ${9 + (i % 5) * 2.5}s linear infinite, pulseGlow ${2 + (i % 3)}s ease-in-out infinite`,
                animationDelay: `${(i * 1.2) % 10}s`,
                opacity: 0.4 + (i % 4) * 0.15,
              }}
            />
          );
        })}
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
                  backdropFilter: "blur(10px)",
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
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Right column — level grid */}
        <div className="md:w-[62%] flex flex-col justify-center">
          {/* Subtle glow behind grid */}
          <div className="relative max-w-md ml-auto mr-auto md:mr-8">
            <div
              className="absolute inset-0 -m-8 pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, rgba(255,255,255,0.12), transparent 70%)",
              }}
            />
            <div className="relative grid grid-cols-2 gap-4">
              {levels.map((level, idx) => {
                const isSelected = selectedYear === level.id;
                const isUnlocked = DEMO_MODE || !hasAssignedProgram || level.id === unlockedYear;
                const isLastOdd = idx === levels.length - 1 && levels.length % 2 === 1;
                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => {
                      if (!isUnlocked) return;
                      setSelectedYear(level.id);
                    }}
                    className={[
                      "relative text-center transition-all duration-200",
                      !isUnlocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                      isLastOdd ? "col-span-2 max-w-[calc(50%-0.5rem)] mx-auto" : "",
                    ].join(" ")}
                    style={{
                      borderRadius: "16px",
                      padding: "14px 24px",
                      transform: isSelected ? "translateY(-2px)" : undefined,
                      border: isSelected ? "2px solid rgba(100,150,255,0.5)" : "1.5px solid rgba(200,190,170,0.5)",
                      ...(isSelected ? {
                        background: "linear-gradient(135deg, #5E8BFF, #4F7DF3)",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 0 0 2px rgba(80,120,255,0.3), 0 6px 14px rgba(80,120,255,0.25), 0 12px 32px rgba(80,120,255,0.2), inset 0 1px 0 rgba(255,255,255,0.25)",
                      } : {
                        background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(245,240,230,0.9) 100%)",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 6px 14px rgba(0,0,0,0.12), 0 12px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
                      }),
                    }}
                    onMouseEnter={(e) => {
                      if (!isUnlocked) return;
                      e.currentTarget.style.transform = "translateY(-4px)";
                      if (!isSelected) {
                        e.currentTarget.style.boxShadow = "0 8px 18px rgba(0,0,0,0.16), 0 16px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isUnlocked) return;
                      e.currentTarget.style.transform = isSelected ? "translateY(-2px)" : "translateY(0)";
                      if (!isSelected) {
                        e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.12), 0 12px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7)";
                      }
                    }}
                  >
                    <span className={`text-base font-bold tracking-wide ${isSelected ? "text-white" : "text-slate-700"}`}>
                      {level.label}
                    </span>
                    {!isUnlocked ? (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400/60">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="4" y="11" width="16" height="9" rx="2" />
                          <path d="M8 11V7a4 4 0 018 0v4" />
                        </svg>
                      </div>
                    ) : null}
                  </button>
                );
              })}
              {/* CTA button spanning full grid width */}
              <button
                onClick={primaryCta.onClick}
                disabled={primaryCta.disabled}
                className={[
                  "col-span-2 py-3.5 font-bold text-base transition-all duration-200",
                  primaryCta.disabled
                    ? "cursor-not-allowed"
                    : "text-white cursor-pointer",
                ].join(" ")}
                style={{
                  borderRadius: "16px",
                  ...(primaryCta.disabled ? {
                    background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(245,240,230,0.9) 100%)",
                    border: "1.5px solid rgba(200,190,170,0.5)",
                    color: "rgba(100,116,139,0.6)",
                    boxShadow: "0 6px 14px rgba(0,0,0,0.12), 0 12px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
                  } : {
                    background: "linear-gradient(135deg, #5E8BFF, #4F7DF3)",
                    border: "2px solid rgba(100,150,255,0.5)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 0 0 2px rgba(80,120,255,0.3), 0 6px 14px rgba(80,120,255,0.25), 0 12px 32px rgba(80,120,255,0.2), inset 0 1px 0 rgba(255,255,255,0.25)",
                  }),
                }}
                onMouseEnter={(e) => {
                  if (!primaryCta.disabled) e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {primaryCta.label}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
