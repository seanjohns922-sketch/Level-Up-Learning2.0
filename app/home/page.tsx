"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clearScopedProgress, readProgress, StudentProgress } from "@/data/progress";
import { getProgramForYear } from "@/data/programs";
import { clearScopedProgramStore, readProgramStore, getWeekProgress, isWeekComplete, type ProgramProgressStore } from "@/lib/program-progress";
import { getLegendForYear } from "@/data/legends";
import { supabase } from "@/lib/supabase";
import HeroHeader from "@/components/home/HeroHeader";
import StatTiles from "@/components/home/StatTiles";
import MissionCard from "@/components/home/MissionCard";
import RealmCard from "@/components/home/RealmCard";
import TowerProgress from "@/components/home/TowerProgress";
import WeekCard from "@/components/home/WeekCard";
import QuickLinks from "@/components/home/QuickLinks";
import { getHomeBg, getHomeBgFilter, getVignetteStyle } from "@/lib/levelBand";

export default function StudentHomePage() {
  const router = useRouter();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [store, setStore] = useState<ProgramProgressStore>({});
  const [studentName, setStudentName] = useState<string>("");

  useEffect(() => {
    setProgress(readProgress());
    setStore(readProgramStore());
    // Try to get student name from localStorage
    try {
      const active = localStorage.getItem("lul_active_student_v1");
      if (active) {
        const parsed = JSON.parse(active);
        if (parsed?.display_name) setStudentName(parsed.display_name);
        else if (typeof parsed === "string") setStudentName("");
      }
    } catch { /* ignore */ }
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

  // Basic XP calculation (lessons done * 40 XP + quizzes)
  const totalXP = useMemo(() => {
    let xp = 0;
    for (let w = 1; w <= 12; w++) {
      const wwp = getWeekProgress(store, year, w);
      xp += wwp.lessonsCompleted.filter(Boolean).length * 40;
      if (wwp.quizScore !== undefined) xp += Math.round((wwp.quizScore / 100) * 60);
    }
    return xp;
  }, [store, year]);

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
      <main className="min-h-screen relative flex items-end justify-center p-6 pb-10">
        <div className="fixed inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/dashboard-bg.jpg" alt="" className="w-full h-full object-cover" style={{ objectPosition: "center 40%" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
        </div>
        <div
          className="relative z-10 rounded-3xl p-8 w-full max-w-md text-center"
          style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 20px 40px rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.05)" }}
        >
          <div className="mx-auto mb-4 -mt-16" style={{ filter: "drop-shadow(0 0 12px rgba(255,210,120,0.4)) drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="Level Up Learning mascot" className="h-24 w-auto mx-auto object-contain" />
          </div>
          <p className="text-sm font-semibold text-amber-800 uppercase tracking-widest mb-1">Welcome to the</p>
          <h1 className="text-3xl font-black text-gray-800 mb-2 uppercase tracking-wide">Tower of Knowledge</h1>
          <p className="text-gray-700 mb-8">Choose your level to begin your adventure.</p>
          <button
            onClick={goLevels}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary text-primary-foreground font-extrabold text-lg hover:brightness-110 transition"
            style={{ boxShadow: "0 6px 14px rgba(30,160,90,0.35)" }}
            type="button"
          >
            Choose Level →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative">
      {/* Realm-specific background */}
      <div className="fixed inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getHomeBg(levelNum)}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: getHomeBgFilter(levelNum) }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: getVignetteStyle(levelNum) }}
        />
        {/* Extra overlay for card readability */}
        <div className="absolute inset-0 bg-black/15" />
      </div>

      <div className="relative z-10">
        <HeroHeader
          levelNum={levelNum}
          week={week}
          lessonsDone={lessonsDone}
          overallPercent={overallPercent}
          onBack={() => router.push("/login")}
          onLogout={handleLogout}
          studentName={studentName}
          legendAvatar={legend.images.avatar}
        />

        <div className="-mt-12 relative z-10 pb-12 px-5">
          <div className="max-w-2xl mx-auto grid gap-3.5">
            {/* Stat tiles */}
            <StatTiles
              xp={totalXP}
              levelNum={levelNum}
              streakDays={0}
              accuracy={progress?.scorePercent ?? 0}
            />

            {/* Course progress / continue learning */}
            <WeekCard
              week={week}
              lessonsDone={lessonsDone}
              topic={programWeek?.topic}
              lessons={programWeek?.lessons ?? []}
              onContinue={continueWeek}
            />

            {/* Mission / challenge */}
            <MissionCard legend={legend} week={week} lessonsDone={lessonsDone} />

            {/* Realm + Tower progress row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
              onTowerMap={() => router.push("/tower-map")}
              scorePercent={progress?.scorePercent ?? 0}
              week={week}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
