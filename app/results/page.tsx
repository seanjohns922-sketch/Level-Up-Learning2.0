"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLegendForYear } from "@/data/legends";
import { readProgress, StudentProgress, writeProgress, ACTIVE_STUDENT_KEY } from "@/data/progress";
import { supabase } from "@/lib/supabase";
import LegendUnlockReveal from "@/components/LegendUnlockReveal";
const PASS_THRESHOLD = 90;

export default function ResultsPageWrapper() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading…</p></div>}><ResultsPage /></Suspense>;
}

function ResultsPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const year = sp.get("year") ?? "Year 3";
  const score = Number(sp.get("score") ?? "0");
  const total = Number(sp.get("total") ?? "0");
  const source = sp.get("source") ?? "pretest"; // "pretest" | "program_complete"

  const scorePercent = useMemo(() => {
    if (!total || total <= 0) return 0;
    return Math.round((score / total) * 100);
  }, [score, total]);

  const passedByPretest = scorePercent >= PASS_THRESHOLD;
  const passedByProgram = source === "program_complete";
  const passed = passedByPretest || passedByProgram;

  const legend = useMemo(() => getLegendForYear(year), [year]);

  const [showUnlock, setShowUnlock] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  useEffect(() => {
    const prev = readProgress();
    const prevUnlocked = prev?.unlockedLegends ?? [];
    const alreadyUnlocked = prevUnlocked.includes(legend.id);

    let next: StudentProgress;

    if (passed) {
      const unlocked = alreadyUnlocked ? prevUnlocked : [...prevUnlocked, legend.id];

      next = {
        year,
        scorePercent: passedByProgram ? Math.max(prev?.scorePercent ?? 0, 90) : scorePercent,
        status: "PASSED",
        unlockedLegends: unlocked,
      };
    } else {
      next = {
        year,
        scorePercent,
        status: "ASSIGNED_PROGRAM",
        assignedWeek: 1,
        unlockedLegends: prevUnlocked,
      };
    }

    writeProgress(next);

    // Persist pretest score to DB
    (async () => {
      try {
        const studentId = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_STUDENT_KEY) : null;
        if (!studentId) return;
        // Upsert progress row with pretest_score
        const { error } = await supabase
          .from("progress")
          .upsert(
            {
              student_id: studentId,
              year,
              pretest_score: scorePercent,
              status: next.status === "PASSED" ? "PASSED" : "ASSIGNED_PROGRAM",
              week: next.assignedWeek ?? null,
            },
            { onConflict: "student_id,year" }
          );
        if (error) console.warn("[Results] DB pretest save error:", error);
        else console.log("[Results] Pretest score saved to DB:", scorePercent);
      } catch (e) {
        console.warn("[Results] DB pretest save failed:", e);
      }
    })();

    if (passed && !alreadyUnlocked) {
      setJustUnlocked(true);
      setShowUnlock(true);
    } else {
      setJustUnlocked(false);
      setShowUnlock(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passed, year, scorePercent, legend.id]);

  function goHome() {
    router.push("/home");
  }

  function goProgram() {
    const qs = new URLSearchParams({ year, week: "1" }).toString();
    router.push(`/program?${qs}`);
  }

  function goLegends() {
    router.push("/legends");
  }

  return (
    <main className="min-h-screen bg-[#fbf7f1] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl text-center relative overflow-hidden border border-white/70">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
          {year} Results
        </h1>

        <div className="text-7xl font-extrabold text-indigo-700 mb-6">
          {passedByProgram ? "100%" : `${scorePercent}%`}
        </div>

        {passed ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left mb-5">
            <div className="font-bold text-emerald-800 mb-1">Legend Eligible</div>
            <div className="text-sm text-emerald-900">
              {passedByProgram
                ? "You completed the 12-week program."
                : "You passed the pre-test."}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-left mb-5">
            <div className="font-bold text-gray-800 mb-1">Learning Path Assigned</div>
            <div className="text-sm text-gray-700">
              We've created a personalised 12-week program to strengthen your skills.
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-left mb-7">
          <div className="font-bold text-gray-800 mb-2">What happens next?</div>
          <div className="text-sm text-gray-700 space-y-1">
            <div>- 3 lessons per week</div>
            <div>- 1 quiz each week</div>
            <div>- Legends unlock with mastery (pre-test pass OR program completion)</div>
          </div>
        </div>

        {passed ? (
          <div className="grid gap-3">
            <button
              onClick={goHome}
              className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-600 transition"
            >
              Back to Home
            </button>
            <button
              onClick={goLegends}
              className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition"
            >
              View My Legends
            </button>
          </div>
        ) : (
          <button
            onClick={goProgram}
            className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition"
          >
            Start Week 1
          </button>
        )}

        <p className="text-xs text-gray-400 mt-4">
          MVP mode: progress saved locally on this device
        </p>

        {/* Unlock Modal */}
        {showUnlock && justUnlocked ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 border border-gray-200 overflow-hidden">
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {confetti.map((c) => (
                  <span
                    key={c.i}
                    className="absolute top-[-20px] rounded-sm"
                    style={{
                      left: `${c.left}%`,
                      width: `${c.size}px`,
                      height: `${c.size * 1.6}px`,
                      transform: `rotate(${c.rot}deg)`,
                      animation: `lul_confetti_fall ${c.dur}s ease-in ${c.delay}s forwards`,
                      background: c.color,
                      zIndex: 1,
                    }}
                  />
                ))}
              </div>

              <div className="relative text-center" style={{ zIndex: 2 }}>
                <div className="text-sm font-bold tracking-widest text-indigo-700 mb-2">
                  LEGEND UNLOCKED
                </div>

                <div className="text-3xl font-extrabold text-gray-800 mb-2">
                  {legend.name}
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  {legend.strand} - {legend.yearLabel}
                </div>

                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-left mb-5">
                  <div className="font-bold text-indigo-900 mb-1">Added to your collection</div>
                  <div className="text-sm text-indigo-900">{legend.description}</div>
                </div>

                <div className="grid gap-3">
                  <button
                    onClick={() => {
                      setShowUnlock(false);
                      goLegends();
                    }}
                    className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
                  >
                    View My Legends
                  </button>

                  <button
                    onClick={() => setShowUnlock(false)}
                    className="w-full py-3 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
