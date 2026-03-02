"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLegendForYear } from "@/data/legends";
import { getProgramForYear } from "@/data/programs";
import { DEV_MODE } from "@/data/config";
import { readProgress, StudentProgress, updateProgress, writeProgress } from "@/data/progress";

type WeekProgress = {
  lessonsCompleted: boolean[];
  quizCompleted: boolean;
  quizScore?: number;
};

type ProgramProgressStore = Record<string, WeekProgress>;

const PROGRAM_STORE_KEY = "lul_program_progress_v1";

function makeKey(year: string, week: string) {
  return `${year}|${week}`;
}

function readProgramStore(): ProgramProgressStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROGRAM_STORE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgramProgressStore;
  } catch {
    return {};
  }
}

function getWeekProgress(store: ProgramProgressStore, year: string, week: string): WeekProgress {
  const key = makeKey(year, week);
  return (
    store[key] ?? {
      lessonsCompleted: [false, false, false],
      quizCompleted: false,
    }
  );
}

function isWeekComplete(p: WeekProgress) {
  const lessonsDone = p.lessonsCompleted.filter(Boolean).length === 3;
  const quizPassed = (p.quizScore ?? 0) >= 80;
  return quizPassed || (lessonsDone && p.quizCompleted);
}

export default function ProgramPageWrapper() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading…</p></div>}><ProgramPage /></Suspense>;
}

function ProgramPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const year = sp.get("year") ?? "Year 3";
  const weekNum = Number(sp.get("week") ?? "1");
  const week = String(weekNum);

  const [store, setStore] = useState<ProgramProgressStore>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setStore(readProgramStore());
    setIsClient(true);
  }, []);

  // gating: week N accessible only if week N-1 complete
  const prevWeekNum = Math.max(1, weekNum - 1);
  const prevProgress = getWeekProgress(store, year, String(prevWeekNum));
  const canAccessThisWeek = DEV_MODE ? true : weekNum === 1 ? true : isWeekComplete(prevProgress);

  // last allowed week
  const lastAllowedWeek = useMemo(() => {
    if (DEV_MODE) return 12;
    let allowed = 1;
    for (let w = 2; w <= 12; w++) {
      const p = getWeekProgress(store, year, String(w - 1));
      if (isWeekComplete(p)) allowed = w;
      else break;
    }
    return allowed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const progress = getWeekProgress(store, year, week);

  const items = useMemo(() => {
    const program = getProgramForYear(year);
    const weekPlan = program.find((w) => w.week === weekNum);
    const lessons = weekPlan?.lessons ?? [];

    return [
      { type: "lesson" as const, n: 1, title: lessons[0]?.title ?? "Lesson 1" },
      { type: "lesson" as const, n: 2, title: lessons[1]?.title ?? "Lesson 2" },
      { type: "lesson" as const, n: 3, title: lessons[2]?.title ?? "Lesson 3" },
      { type: "quiz" as const, n: 1, title: "Weekly Quiz" },
    ];
  }, [year, weekNum]);

  function openItem(item: (typeof items)[number]) {
    if (!canAccessThisWeek) return;
    if (
      item.type === "lesson" &&
      year === "Year 1" &&
      (weekNum >= 1 && weekNum <= 12)
    ) {
      const qs = new URLSearchParams({
        year,
        week,
        lessonId: `y1-w${weekNum}-l${item.n}`,
      }).toString();
      router.push(`/lesson?${qs}`);
      return;
    }
    const qs = new URLSearchParams({
      year,
      week,
      type: item.type,
      n: String(item.n),
    }).toString();
    router.push(`/session?${qs}`);
  }

  function goToWeek(targetWeek: number) {
    if (!DEV_MODE && targetWeek > lastAllowedWeek) {
      router.push(`/program?year=${encodeURIComponent(year)}&week=${lastAllowedWeek}`);
      return;
    }
    router.push(`/program?year=${encodeURIComponent(year)}&week=${targetWeek}`);
  }

  function nextWeek() {
    goToWeek(Math.min(12, weekNum + 1));
  }

  function prevWeek() {
    goToWeek(Math.max(1, weekNum - 1));
  }

  const lessonsDoneCount = progress.lessonsCompleted.filter(Boolean).length;
  const weekComplete = isWeekComplete(progress);

  useEffect(() => {
    const student = readProgress();
    if (!student || student.status !== "ASSIGNED_PROGRAM") return;

    const savedWeek = student.assignedWeek ?? 1;
    let nextWeek = savedWeek;

    if (weekNum > savedWeek) nextWeek = weekNum;
    if (weekComplete) nextWeek = Math.max(nextWeek, Math.min(12, weekNum + 1));

    if (nextWeek !== savedWeek) updateProgress({ assignedWeek: nextWeek });
  }, [weekComplete, weekNum]);

  function finishProgram() {
    const legend = getLegendForYear(year);
    const student = readProgress();

    const unlocked = student?.unlockedLegends ?? [];
    const nextUnlocked = unlocked.includes(legend.id) ? unlocked : [...unlocked, legend.id];

    // route to results with source=program_complete so it triggers unlock UI
    const qs = new URLSearchParams({
      year,
      score: "90",
      total: "100",
      source: "program_complete",
    }).toString();

    // Save "PASSED" + unlock into student progress
    const nextStudent: StudentProgress = {
      year,
      scorePercent: Math.max(student?.scorePercent ?? 0, 90),
      status: "PASSED",
      unlockedLegends: nextUnlocked,
    };

    writeProgress(nextStudent);
    router.push(`/results?${qs}`);
  }

  if (!canAccessThisWeek) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl text-center">
          <h1 className="text-2xl font-extrabold text-gray-800 mb-2">
            Week {weekNum} Locked
          </h1>
          <p className="text-gray-600 mb-6">
            Complete Week {weekNum - 1} first (3 lessons + quiz) to unlock this week.
          </p>

          <button
            onClick={() => goToWeek(lastAllowedWeek)}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
          >
            Go to Week {lastAllowedWeek}
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full mt-3 py-3 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  // compute a simple XP / progress summary to show in the hero
  const lessonXp = lessonsDoneCount * 10;
  const quizXp = progress.quizCompleted ? 20 : 0;
  const xp = lessonXp + quizXp;
  const totalXp = 3 * 10 + 20; // 50
  const percent = Math.round((xp / totalXp) * 100);

  return (
    <main className="min-h-screen bg-[#fbf7f1]">
      {DEV_MODE && process.env.NODE_ENV === "development" ? (
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-red-600 text-white font-extrabold rounded-xl shadow-lg z-50">
          DEV MODE
        </div>
      ) : null}
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-b-3xl overflow-hidden pt-6 pb-10 mb-6">
          <div className="flex items-center justify-between px-4">
            <button
              onClick={() => router.push("/home")}
              className="text-white/90 text-sm px-3 py-2 rounded-full bg-white/10"
            >
              Back
            </button>

            <div className="flex items-center gap-3">
              <div className="flex gap-2 items-center">
                <button
                  onClick={prevWeek}
                  aria-label="Previous week"
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
                >
                  &larr;
                </button>
                <button
                  onClick={nextWeek}
                  aria-label="Next week"
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
                >
                  &rarr;
                </button>
              </div>

              <div className="text-sm text-white/90">{year} - 12-Week Program</div>
            </div>
          </div>

          <div className="text-center mt-6 px-4">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1 rounded-full text-sm font-semibold">
              Level 1 - 12-Week Program
            </div>
            <h1 className="text-4xl font-extrabold mt-3">Week {weekNum}</h1>
            <div className="text-sm text-white/90 mt-1">
              {isClient
                ? weekComplete
                  ? "Completed"
                  : `${lessonsDoneCount}/3 lessons - ${progress.quizCompleted ? "quiz done" : "quiz pending"}`
                : "0/3 lessons - quiz pending"}
            </div>

            <div className="mt-5 flex justify-center">
              <div className="bg-white/80 rounded-full px-4 py-3 w-full max-w-md">
                <div className="bg-white/60 rounded-full h-3 w-full overflow-hidden">
                  <div className="bg-emerald-700 h-3" style={{ width: `${percent}%` }} />
                </div>
                <div className="text-xs text-emerald-900 mt-2 text-center">{xp} / {totalXp} XP</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 border border-white/70">
          {DEV_MODE && process.env.NODE_ENV === "development" ? (
            <div className="mb-6 rounded-2xl border border-yellow-300 bg-yellow-50 p-4">
              <div className="font-bold text-yellow-800 mb-2">
                DEV MODE - Jump to any week
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      router.push(`/program?year=${encodeURIComponent(year)}&week=${i + 1}`)
                    }
                    className="px-3 py-2 rounded-lg bg-white border border-yellow-400 font-bold hover:bg-yellow-100"
                  >
                    Week {i + 1}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="space-y-4">
            {items.map((item) => {
              const completed =
                item.type === "lesson"
                  ? progress.lessonsCompleted[item.n - 1]
                  : progress.quizCompleted;

              return (
                <button
                  key={`${item.type}-${item.n}`}
                  onClick={() => openItem(item)}
                  className={[
                    "w-full text-left p-5 rounded-3xl border transition flex items-center gap-4",
                    completed ? "border-gray-200 bg-white" : "border-gray-100 bg-white",
                  ].join(" ")}
                >
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center bg-white/70">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center"> 
                      {item.type === "quiz" ? "Quiz" : "Lesson"}
                    </div>
                  </div>

                  <div className="flex-1">
                  <div className="text-xs text-gray-500">{item.type === "lesson" ? `Lesson ${item.n}` : "Quiz"}</div>
                  <div className="font-extrabold text-lg text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{item.type === "lesson" ? "10 XP" : "20 XP"}</div>
                  </div>

                  <div className="ml-auto">
                    {completed ? (
                      <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center">OK</div>
                    ) : (
                      <div className="text-xs font-bold px-3 py-1 rounded-full border">START</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Finish Program CTA */}
          {weekNum === 12 && weekComplete ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left">
              <div className="font-bold text-emerald-900 mb-2">Program Complete</div>
              <div className="text-sm text-emerald-900 mb-4">You've completed all 12 weeks. Finish to unlock your Legend.</div>
              <button
                onClick={finishProgram}
                className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition"
              >
                Finish Program - Unlock Legend
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
