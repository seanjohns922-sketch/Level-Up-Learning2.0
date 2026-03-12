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
      <main className="min-h-screen relative flex items-center justify-center p-6">
        <div className="fixed inset-0 z-0">
          <img src="/images/tower-hub-bg.jpg" alt="" className="w-full h-full object-cover" style={{ filter: "blur(2px) brightness(1.1)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(rgba(10,20,30,0.45), rgba(10,20,30,0.65))" }} />
          {[...Array(12)].map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{ width: 3 + (i % 3), height: 3 + (i % 3), left: `${8 + (i * 7.7) % 84}%`, bottom: `${(i * 8.3) % 70}%`, background: i % 2 === 0 ? "rgba(255,200,80,0.5)" : "rgba(255,255,255,0.35)", animation: `floatUp ${7 + (i % 4) * 2}s linear infinite`, animationDelay: `${(i * 1.1) % 6}s` }} />
          ))}
        </div>
        <div className="relative z-10 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-10 w-full max-w-lg text-center">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-amber-50 flex items-center justify-center mb-5">
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12,2 15,10 22,10 16,15 18,22 12,18 6,22 8,15 2,10 9,10" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">Welcome to Level Up Learning</h1>
          <p className="text-gray-500 mb-8">Choose your level to begin your adventure.</p>
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
    <main className="min-h-screen relative">
      {/* Immersive realm background */}
      <div className="fixed inset-0 z-0">
        <img
          src="/images/number-nexus-home-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: "brightness(1.15) contrast(1.08)" }}
        />
        {/* Vertical gradient overlay — lighter in middle to reveal the world */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(rgba(5,20,35,0.85) 0%, rgba(5,20,35,0.55) 30%, rgba(5,20,35,0.45) 50%, rgba(5,20,35,0.70) 100%)" }}
        />
        {/* Teal glow behind Numbot (right side) */}
        <div
          className="absolute animate-pulse"
          style={{
            width: 400,
            height: 400,
            right: "8%",
            top: "20%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(31,209,181,0.22) 0%, transparent 70%)",
            filter: "blur(40px)",
            animationDuration: "4s",
          }}
        />
        {/* Circuit glow accents — left side */}
        <div
          className="absolute"
          style={{
            width: 300,
            height: "80%",
            left: 0,
            top: "10%",
            background: "linear-gradient(180deg, transparent, rgba(31,209,181,0.12) 50%, transparent)",
            filter: "blur(30px)",
            animation: "pulse 5s cubic-bezier(0.4,0,0.6,1) infinite",
          }}
        />
        {/* Circuit glow accents — right side */}
        <div
          className="absolute"
          style={{
            width: 300,
            height: "80%",
            right: 0,
            top: "10%",
            background: "linear-gradient(180deg, transparent, rgba(31,209,181,0.10) 50%, transparent)",
            filter: "blur(30px)",
            animation: "pulse 6s cubic-bezier(0.4,0,0.6,1) infinite 1s",
          }}
        />
        {/* Floating particles */}
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + (i % 4),
              height: 2 + (i % 4),
              left: `${5 + (i * 5.3) % 90}%`,
              bottom: `${(i * 7.1) % 60}%`,
              background: i % 3 === 0 ? "rgba(31,209,181,0.6)" : "rgba(255,255,255,0.4)",
              animation: `floatUp ${6 + (i % 5) * 2}s linear infinite`,
              animationDelay: `${(i * 0.8) % 8}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
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
