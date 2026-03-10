"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clearScopedProgress, readProgress, StudentProgress } from "@/data/progress";
import { getProgramForYear } from "@/data/programs";
import { clearScopedProgramStore, readProgramStore, getWeekProgress, isWeekComplete, type ProgramProgressStore } from "@/lib/program-progress";
import { getLegendForYear } from "@/data/legends";
import { supabase } from "@/lib/supabase";
import HeroHeader from "@/components/home/HeroHeader";
import MissionCard from "@/components/home/MissionCard";
import RealmCard from "@/components/home/RealmCard";
import TowerProgress from "@/components/home/TowerProgress";
import WeekCard from "@/components/home/WeekCard";
import QuickLinks from "@/components/home/QuickLinks";

export default function StudentHomePage() {
  const router = useRouter();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [store, setStore] = useState<ProgramProgressStore>({});

  useEffect(() => {
    setProgress(readProgress());
    setStore(readProgramStore());
  }, []);

  const year = progress?.year ?? "Year 1";
  const week = progress?.assignedWeek ?? 1;
  const curriculumYear = useMemo(() => {
    const selected = getProgramForYear(year);
    return selected.length > 0 ? year : "Year 1";
  }, [year]);
  const program = useMemo(() => getProgramForYear(curriculumYear), [curriculumYear]);
  const programWeek = useMemo(() => program.find((w) => w.week === week) ?? null, [program, week]);
  const wp = getWeekProgress(store, year, week);
  const lessonsDone = wp.lessonsCompleted.filter(Boolean).length;
  const overallPercent = Math.round((week / 12) * 100);
  const levelNum = parseInt(year.replace(/\D/g, ""), 10) || 1;
  const legend = getLegendForYear(year);

  // Count total completed weeks
  const completedWeeks = useMemo(() => {
    let count = 0;
    for (let w = 1; w <= 12; w++) {
      if (isWeekComplete(getWeekProgress(store, year, w))) count++;
    }
    return count;
  }, [year, store]);

  const fogCleared = Math.round((completedWeeks / 12) * 100);

  function goLevels() { router.push("/levels"); }
  function goLegends() { router.push("/legends"); }
  function continueWeek() {
    router.push(`/program?year=${encodeURIComponent(year)}&week=${week}`);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    clearScopedProgress();
    clearScopedProgramStore();
    localStorage.removeItem("lul_active_student_v1");
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("lul_week_")) localStorage.removeItem(key);
      });
    } catch { /* ignore */ }
    router.push("/login");
  }

  if (!progress) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card rounded-3xl shadow-xl p-10 w-full max-w-lg text-center">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-primary-light flex items-center justify-center mb-5">
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12,2 15,10 22,10 16,15 18,22 12,18 6,22 8,15 2,10 9,10" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-foreground mb-2">Welcome to Level Up Learning</h1>
          <p className="text-muted-foreground mb-8">Choose your level to begin your adventure.</p>
          <button
            onClick={goLevels}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary text-primary-foreground font-extrabold text-lg shadow-lg hover:brightness-110 transition"
            type="button"
          >
            Choose Level →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <HeroHeader
        levelNum={levelNum}
        week={week}
        lessonsDone={lessonsDone}
        overallPercent={overallPercent}
        onBack={() => router.push("/login")}
        onLogout={handleLogout}
      />

      <div className="-mt-14 relative z-10 pb-12 px-5">
        <div className="max-w-2xl mx-auto grid gap-4">
          {/* Mission card */}
          <MissionCard legend={legend} week={week} lessonsDone={lessonsDone} />

          {/* Current week + Continue */}
          <WeekCard
            week={week}
            lessonsDone={lessonsDone}
            topic={programWeek?.topic}
            lessons={programWeek?.lessons ?? []}
            onContinue={continueWeek}
          />

          {/* Realm + Tower progress row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RealmCard />
            <TowerProgress
              towerStrength={overallPercent}
              fogCleared={fogCleared}
              legendName={legend.name}
              legendAvatar={legend.images.avatar}
            />
          </div>

          {/* Quick links */}
          <QuickLinks
            onLessons={continueWeek}
            onLegends={goLegends}
            onLevels={goLevels}
            onTowerMap={() => router.push("/program?year=" + encodeURIComponent(year) + "&week=" + week)}
            scorePercent={progress?.scorePercent ?? 0}
            week={week}
          />
        </div>
      </div>
    </main>
  );
}
