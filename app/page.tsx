"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readProgress, STORAGE_KEY, StudentProgress } from "@/data/progress";
import { getProgramForYear } from "@/data/programs";

function clearProgress() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export default function Home() {
  const router = useRouter();

  const yearLevels = useMemo(
    () => ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"],
    []
  );

  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  // If we have saved progress, default-select that year (nice UX)
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

  function nextYear(year: string) {
    const idx = yearLevels.indexOf(year);
    if (idx === -1) return yearLevels[0];
    return yearLevels[Math.min(yearLevels.length - 1, idx + 1)];
  }

  function resetMvp() {
    clearProgress();
    setProgress(null);
    setSelectedYear(null);
  }

  // Decide primary CTA
  const primaryCta = useMemo(() => {
    if (!selectedYear) {
      return { label: "Start Pre-Test", onClick: () => {}, disabled: true };
    }

    // If selected year has assigned program -> continue
    if (hasProgressForSelected && progress?.status === "ASSIGNED_PROGRAM") {
      return {
        label: `Continue Week ${savedWeek ?? 1}`,
        onClick: continueProgram,
        disabled: false,
      };
    }

    // If selected year is passed -> start next year pretest
    if (hasProgressForSelected && progress?.status === "PASSED") {
      const ny = nextYear(progress.year);
      return {
        label: ny === progress.year ? "Year Passed ✅" : `Start ${ny} Pre-Test`,
        onClick: () => {
          if (ny === progress.year) return;
          startPretest(ny);
        },
        disabled: ny === progress.year,
      };
    }

    // Otherwise no progress for selected -> start pretest for selected
    return {
      label: `Start ${selectedYear} Pre-Test`,
      onClick: () => startPretest(selectedYear),
      disabled: false,
    };
  }, [selectedYear, hasProgressForSelected, progress, yearLevels]);

  const showLegendsButton = !!progress; // show once there is any progress

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Level Up Learning
        </h1>
        <p className="text-gray-500 mb-6">Choose your year level to begin</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {yearLevels.map((year) => {
            const isSelected = selectedYear === year;
            return (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={[
                  "py-3 rounded-xl font-semibold transition border",
                  isSelected
                    ? "bg-indigo-700 text-white border-indigo-900"
                    : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700",
                ].join(" ")}
              >
                {year}
              </button>
            );
          })}
        </div>

        {/* Status card */}
        {hasProgressForSelected ? (
          <div className="text-left rounded-xl border border-gray-200 p-4 mb-4">
            <div className="font-bold text-gray-800 mb-1">
              Saved Progress for {progress!.year}
            </div>
            <div className="text-sm text-gray-600">
              Pre-test:{" "}
              <span className="font-semibold">{progress!.scorePercent}%</span>
              {" • "}
              Status:{" "}
              <span className="font-semibold">
                {progress!.status === "PASSED" ? "Passed" : "12-week program"}
              </span>
              {progress!.status === "ASSIGNED_PROGRAM" ? (
                <>
                  {" • "}Week {savedWeek ?? 1}
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Week plan preview */}
        {programWeek ? (
          <div className="text-left rounded-xl border border-gray-200 bg-white p-4 mb-4">
            <div className="text-xs font-bold text-gray-500 mb-1">
              Week {programWeek.week} Plan
            </div>
            <div className="text-base font-extrabold text-gray-800 mb-2">
              {programWeek.topic}
            </div>
            <div className="grid gap-2">
              {programWeek.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="text-sm text-gray-700 flex items-center gap-2"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                    {lesson.lesson}
                  </span>
                  <span>{lesson.title}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Primary CTA */}
        <button
          onClick={primaryCta.onClick}
          disabled={primaryCta.disabled}
          className={[
            "w-full py-3 rounded-xl font-bold transition",
            primaryCta.disabled
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600",
          ].join(" ")}
        >
          {primaryCta.label}
        </button>

        {/* Secondary actions */}
        <div className="mt-4 flex gap-3">
          {showLegendsButton ? (
            <button
              onClick={goLegends}
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
            >
              My Legends
            </button>
          ) : (
            <button
              disabled
              className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-400 font-bold cursor-not-allowed"
            >
              My Legends
            </button>
          )}

          <button
            onClick={resetMvp}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition"
          >
            Reset
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          MVP mode: progress saved locally on this device
        </p>
      </div>
    </main>
  );
}
