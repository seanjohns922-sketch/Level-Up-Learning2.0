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
        <img src="/images/tower-plaza-bg.jpg" alt="" className="w-full h-full object-cover" style={{ filter: "blur(2px)" }} />
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.05)" }} />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{ width: 3 + (i % 3), height: 3 + (i % 3), left: `${6 + (i * 9.1) % 88}%`, bottom: `${(i * 9.7) % 65}%`, background: i % 2 === 0 ? "rgba(255,200,80,0.5)" : "rgba(255,255,255,0.3)", animation: `floatUp ${8 + (i % 4) * 2}s linear infinite`, animationDelay: `${(i * 1.3) % 7}s` }} />
        ))}
      </div>
      <div className="max-w-5xl mx-auto relative z-10">
        <button
          onClick={goHome}
          className="text-sm text-white/80 hover:text-white hover:underline mb-6"
          type="button"
        >
          Back to Dashboard
        </button>

        <div className="text-center mb-8">
          <h1
            className="text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg"
            style={{ fontFamily: "'Nunito', 'Avenir Next', 'Trebuchet MS', sans-serif" }}
          >
            Level Up Learning
          </h1>
          <p className="text-white/70 mt-2 text-lg">Choose your level</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
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
                  "relative rounded-3xl border p-6 text-left shadow-sm transition backdrop-blur-md",
                  !isUnlocked ? "opacity-60 cursor-not-allowed" : "",
                  isSelected
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-500"
                    : "bg-white/80 border-white/30 text-gray-800 hover:shadow-md hover:bg-white/90",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "h-10 w-10 rounded-2xl flex items-center justify-center",
                      isSelected ? "bg-white/20" : "bg-[#eef2f6]",
                    ].join(" ")}
                  >
                    {level.icon === "sprout" ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20v-6" />
                        <path d="M7 11c3 0 5-2 5-5-3 0-5 2-5 5z" />
                        <path d="M17 11c-3 0-5-2-5-5 3 0 5 2 5 5z" />
                      </svg>
                    ) : null}
                    {level.icon === "numbers" ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="4" />
                        <path d="M7 10h4M7 14h4M13 10h4M13 14h4" />
                      </svg>
                    ) : null}
                    {level.icon === "tiles" ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z" />
                      </svg>
                    ) : null}
                    {level.icon === "bolt" ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
                      </svg>
                    ) : null}
                    {level.icon === "rocket" ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 19l4-2 2 2-2 4-4-4z" />
                        <path d="M14 3l7 7-8 8-7-7 8-8z" />
                      </svg>
                    ) : null}
                    {level.icon === "trophy" ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 21h8M12 17v4M7 4h10l-1 6H8L7 4z" />
                      </svg>
                    ) : null}
                    {level.icon === "crown" ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 7l4 4 5-6 5 6 4-4-2 10H5L3 7z" />
                      </svg>
                    ) : null}
                  </div>
                  <div className="text-lg font-bold">
                    {level.label}
                  </div>
                </div>
                {!isUnlocked ? (
                  <div className="absolute right-4 top-4 text-gray-400">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="4" y="11" width="16" height="9" rx="2" />
                      <path d="M8 11V7a4 4 0 018 0v4" />
                    </svg>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto mt-8">
          <button
            onClick={primaryCta.onClick}
            disabled={primaryCta.disabled}
            className={[
              "w-full py-4 rounded-2xl font-black text-xl transition",
              primaryCta.disabled
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700",
            ].join(" ")}
          >
            {primaryCta.label}
          </button>
        </div>

        <div className="max-w-3xl mx-auto mt-6 flex items-center justify-center gap-3">
          {showLegendsButton ? (
            <button
              onClick={goLegends}
              className="px-6 py-3 rounded-2xl bg-white border border-amber-100 text-gray-900 font-bold hover:shadow-md transition"
            >
              My Legends
            </button>
          ) : (
            <button
              disabled
              className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-400 font-bold cursor-not-allowed"
            >
              My Legends
            </button>
          )}
          <button
            onClick={resetMvp}
            className="px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold hover:shadow-md transition"
          >
            Reset
          </button>
        </div>
      </div>
    </main>
  );
}
