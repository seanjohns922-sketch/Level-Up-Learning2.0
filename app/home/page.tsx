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
      <main className="min-h-screen relative flex items-end justify-center p-6 pb-10">
        <div className="fixed inset-0 z-0">
          <img src="/images/tower-hub-bg.jpg" alt="" className="w-full h-full object-cover" style={{ objectPosition: "center 30%" }} />
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.08)" }} />
          {[...Array(12)].map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{ width: 3 + (i % 3), height: 3 + (i % 3), left: `${8 + (i * 7.7) % 84}%`, bottom: `${(i * 8.3) % 70}%`, background: i % 2 === 0 ? "rgba(255,200,80,0.5)" : "rgba(255,255,255,0.35)", animation: `floatUp ${7 + (i % 4) * 2}s linear infinite`, animationDelay: `${(i * 1.1) % 6}s` }} />
          ))}
        </div>
        <div
          className="relative z-10 bg-white/30 backdrop-blur-md rounded-3xl p-8 w-full max-w-md text-center"
          style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.10), 0 6px 12px rgba(0,0,0,0.05)" }}
        >
          {/* Level Up Learning Mascot */}
          <div
            className="mx-auto mb-4 -mt-16"
            style={{
              filter: "drop-shadow(0 0 12px rgba(255,210,120,0.4)) drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="Level Up Learning mascot"
              className="h-24 w-auto mx-auto object-contain"
            />
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
      {/* Immersive realm background */}
      <div className="fixed inset-0 z-0">
        <img
          src="/images/number-nexus-home-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: "brightness(1.3) contrast(1.12) saturate(1.15)" }}
        />
      {/* Subtle vignette — edges only, world stays bright */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: "inset 0 0 120px 40px rgba(5,20,35,0.35), inset 0 -60px 80px -20px rgba(5,20,35,0.25)" }}
        />
        {/* Bright teal glow behind Numbot (right side) */}
        <div
          className="absolute animate-pulse"
          style={{
            width: 500,
            height: 500,
            right: "5%",
            top: "15%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(31,209,181,0.45) 0%, rgba(16,185,160,0.15) 40%, transparent 70%)",
            filter: "blur(30px)",
            animationDuration: "3s",
          }}
        />
        {/* Bright circuit glow accents — left side */}
        <div
          className="absolute"
          style={{
            width: 350,
            height: "80%",
            left: 0,
            top: "10%",
            background: "linear-gradient(180deg, transparent, rgba(31,209,181,0.25) 50%, transparent)",
            filter: "blur(25px)",
            animation: "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
          }}
        />
        {/* Bright circuit glow accents — right side */}
        <div
          className="absolute"
          style={{
            width: 350,
            height: "80%",
            right: 0,
            top: "10%",
            background: "linear-gradient(180deg, transparent, rgba(31,209,181,0.20) 50%, transparent)",
            filter: "blur(25px)",
            animation: "pulse 5s cubic-bezier(0.4,0,0.6,1) infinite 1s",
          }}
        />
        {/* Central energy glow */}
        <div
          className="absolute animate-pulse"
          style={{
            width: 600,
            height: 300,
            left: "50%",
            top: "30%",
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(56,230,200,0.2) 0%, transparent 70%)",
            filter: "blur(40px)",
            animationDuration: "5s",
          }}
        />
        {/* Floating particles — dense magical dust */}
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + (i % 5),
              height: 2 + (i % 5),
              left: `${3 + (i * 4.7) % 94}%`,
              bottom: `${(i * 5.3) % 80}%`,
              background: i % 4 === 0 ? "rgba(31,209,181,0.7)" : i % 4 === 1 ? "rgba(56,230,200,0.5)" : i % 4 === 2 ? "rgba(255,255,255,0.5)" : "rgba(255,220,100,0.4)",
              animation: `floatUp ${5 + (i % 6) * 2}s linear infinite`,
              animationDelay: `${(i * 0.6) % 10}s`,
              opacity: 0.3 + (i % 4) * 0.15,
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
