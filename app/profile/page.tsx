"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readProgress } from "@/data/progress";
import { readProgramStore, getWeekProgress, isWeekComplete } from "@/lib/program-progress";
import {
  ChevronLeft, Zap, Flame, Clock, Target, Calendar,
  Lock, ChevronRight, Users, Swords, Medal,
  TrendingUp, BookOpen, Trophy, Star, Settings, LogOut,
} from "lucide-react";

const REALMS = [
  { name: "Number Nexus", icon: BookOpen, status: "active" as const },
  { name: "Reading Ridge", icon: BookOpen, status: "coming-soon" as const },
  { name: "Inkwell Wilds", icon: BookOpen, status: "locked" as const },
  { name: "Measurelands", icon: BookOpen, status: "locked" as const },
];

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function getMonthGrid() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const monthName = now.toLocaleString("default", { month: "long" });
  return { offset, daysInMonth, today, monthName, year };
}

// ─── Tower of Knowledge palette ───
// parchment #F5EFE0 / cream #FBF7EC / ink-navy #1C2541 / antique gold #C9A24B / burgundy #8B2E2E

export default function ProfilePage() {
  const router = useRouter();
  const [progress, setProgress] = useState<ReturnType<typeof readProgress>>(null);
  const [store, setStore] = useState<ReturnType<typeof readProgramStore>>({});
  const [studentName, setStudentName] = useState("Adventurer");
  const [activeDays, setActiveDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    setProgress(readProgress());
    setStore(readProgramStore());
    try {
      const active = localStorage.getItem("lul_active_student_v1");
      if (active) {
        const parsed = JSON.parse(active);
        if (parsed?.display_name) setStudentName(parsed.display_name);
        else if (typeof active === "string" && active.length < 40) setStudentName(active);
      }
    } catch { /* ignore */ }
    try {
      const raw = localStorage.getItem("lul_active_days");
      if (raw) setActiveDays(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
  }, []);

  const year = progress?.year ?? "Year 1";
  const levelNum = parseInt(year.replace(/\D/g, ""), 10) || 1;

  const stats = useMemo(() => {
    let xp = 0;
    let completedLessons = 0;
    let weeksCompleted = 0;
    let quizCount = 0;
    let quizTotal = 0;

    for (let w = 1; w <= 12; w++) {
      const wp = getWeekProgress(store, year, w);
      const done = wp.lessonsCompleted.filter(Boolean).length;
      completedLessons += done;
      xp += done * 40;
      if (wp.quizScore !== undefined) {
        xp += Math.round((wp.quizScore / 100) * 60);
        quizCount++;
        quizTotal += wp.quizScore;
      }
      if (isWeekComplete(wp)) weeksCompleted++;
    }

    const accuracy = quizCount > 0 ? Math.round(quizTotal / quizCount) : (progress?.scorePercent ?? 0);
    const realmProgress = Math.round((weeksCompleted / 12) * 100);

    return { xp, completedLessons, accuracy, weeksCompleted, realmProgress };
  }, [store, year, progress]);

  const recentActivity = useMemo(() => {
    const items: { icon: typeof Star; text: string; color: string }[] = [];
    if (stats.completedLessons > 0)
      items.push({ icon: BookOpen, text: `Completed ${stats.completedLessons} lesson${stats.completedLessons !== 1 ? "s" : ""}`, color: "text-[#8A6D2A]" });
    if (stats.accuracy > 0)
      items.push({ icon: Target, text: `Accuracy at ${stats.accuracy}%`, color: "text-[#2A5A3E]" });
    if (stats.weeksCompleted > 0)
      items.push({ icon: Trophy, text: `${stats.weeksCompleted} week${stats.weeksCompleted !== 1 ? "s" : ""} mastered`, color: "text-[#C9A24B]" });
    if (items.length === 0)
      items.push({ icon: Star, text: "Start your first lesson!", color: "text-[#1C2541]/40" });
    return items;
  }, [stats]);

  const levelTitle = levelNum <= 2 ? "Apprentice" : levelNum <= 4 ? "Processor" : "Master";
  const initials = studentName.charAt(0).toUpperCase();
  const { offset, daysInMonth, today, monthName } = useMemo(getMonthGrid, []);

  return (
    <main className="min-h-screen bg-[#F5EFE0] p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto space-y-5">

        {/* ─── TOP BAR: search left, profile + settings + logout right ─── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => router.back()}
              className="lg:hidden h-10 w-10 rounded-xl bg-[#FBF7EC] border border-[#E8DEC4] flex items-center justify-center text-[#1C2541] hover:bg-[#F1E8D0] transition-all shadow-sm"
              aria-label="Back"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-[#FBF7EC] rounded-2xl px-4 py-2.5 border border-[#E8DEC4] shadow-sm w-full max-w-md">
              <span className="text-sm text-[#1C2541]/40">Search your journey…</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 rounded-2xl bg-[#FBF7EC] border border-[#E8DEC4] px-3 py-2 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1C2541] to-[#2A3A6B] flex items-center justify-center text-sm font-black text-[#F5EFE0] shadow-sm ring-1 ring-[#C9A24B]/30">
                {initials}
              </div>
              <div className="hidden sm:block pr-1">
                <h2 className="text-sm font-extrabold text-[#1C2541] leading-tight">{studentName}</h2>
                <p className="text-[10px] font-bold text-[#1C2541]/60">Numbot {levelTitle} · Lvl {levelNum}</p>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C9A24B]/15 border border-[#C9A24B]/40">
                <Zap className="h-3 w-3 text-[#8A6D2A]" />
                <span className="text-xs font-extrabold text-[#8A6D2A]">{stats.xp.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/profile")}
              className="h-11 w-11 rounded-2xl bg-[#FBF7EC] border border-[#E8DEC4] flex items-center justify-center text-[#1C2541]/70 hover:text-[#1C2541] hover:bg-[#F1E8D0] transition-all shadow-sm"
              aria-label="Settings"
              title="Settings"
            >
              <Settings className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={() => router.push("/login")}
              className="h-11 w-11 rounded-2xl bg-[#FBF7EC] border border-[#E8DEC4] flex items-center justify-center text-[#1C2541]/70 hover:text-[#8B2E2E] hover:bg-[#F8E8E0] transition-all shadow-sm"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        {/* ─── HERO BANNER ─── */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0F1830] via-[#1C2541] to-[#2A3A6B] p-6 md:p-8 overflow-hidden shadow-[0_10px_40px_rgba(28,37,65,0.3)] border border-[#C9A24B]/20">
          <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-[#C9A24B]/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-[#C9A24B]/10 blur-2xl pointer-events-none" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-[#C9A24B] uppercase tracking-[0.18em] mb-2">
                {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-[#F5EFE0] leading-tight">
                Welcome back, {studentName}!
              </h1>
              <p className="text-sm text-[#F5EFE0]/70 mt-1.5 max-w-md">
                Your Number Nexus journey continues. {stats.realmProgress}% through Level {levelNum}.
              </p>
              <button
                onClick={() => router.push("/home")}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A24B] text-[#1C2541] text-sm font-extrabold hover:bg-[#D4B05A] transition-all active:scale-95 shadow-md shadow-[#C9A24B]/30"
              >
                Continue Lessons <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="hidden md:flex items-center justify-center h-28 w-28 rounded-3xl bg-[#C9A24B]/10 backdrop-blur-sm border border-[#C9A24B]/30 flex-shrink-0">
              <Trophy className="h-12 w-12 text-[#C9A24B]" />
            </div>
          </div>
        </div>

        {/* ─── STATS ─── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-extrabold text-[#1C2541]">Your Stats</h3>
            <button className="text-xs font-bold text-[#8A6D2A] hover:text-[#1C2541]">See all</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Flame, value: "0", label: "Day Streak", iconBg: "bg-[#8B2E2E]/10", iconColor: "text-[#8B2E2E]" },
              { icon: Calendar, value: activeDays.size.toString(), label: "Days Active", iconBg: "bg-[#1C2541]/10", iconColor: "text-[#1C2541]" },
              { icon: Clock, value: "--", label: "Time", iconBg: "bg-[#C9A24B]/15", iconColor: "text-[#8A6D2A]" },
              { icon: Target, value: `${stats.accuracy}%`, label: "Accuracy", iconBg: "bg-[#2A5A3E]/10", iconColor: "text-[#2A5A3E]" },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-2xl bg-[#FBF7EC] border border-[#E8DEC4] p-4 hover:border-[#C9A24B] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-10 w-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
                    <c.icon className={`h-5 w-5 ${c.iconColor}`} />
                  </div>
                </div>
                <div className="text-2xl font-black text-[#1C2541] leading-none">{c.value}</div>
                <div className="text-[11px] font-bold text-[#1C2541]/55 uppercase tracking-wider mt-1.5">{c.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── REALMS + WINS (left) + RIGHT RAIL ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <div className="lg:col-span-2 space-y-5">
            {/* Enrolled Realms */}
            <div className="rounded-2xl bg-[#FBF7EC] border border-[#E8DEC4] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-[#1C2541] flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#8A6D2A]" />
                  Enrolled Realms
                </h3>
                <button className="text-xs font-bold text-[#8A6D2A] hover:text-[#1C2541]">See all</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REALMS.map((realm) => {
                  const isActive = realm.status === "active";
                  const isComingSoon = realm.status === "coming-soon";
                  return (
                    <div
                      key={realm.name}
                      onClick={() => isActive && router.push("/realms")}
                      className={`relative rounded-2xl p-4 transition-all duration-200 border overflow-hidden
                        ${isActive
                          ? "bg-gradient-to-br from-[#F5EFE0] to-[#FBF7EC] border-[#C9A24B]/40 hover:border-[#C9A24B] hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                          : "bg-[#F5EFE0]/50 border-[#E8DEC4] opacity-60"
                        }`}
                    >
                      {isActive ? (
                        <div
                          className="h-12 w-12 rounded-xl mb-3 bg-cover bg-center shadow-sm ring-1 ring-[#1C2541]/10"
                          style={{ backgroundImage: `url('/images/number-nexus-tile.jpg')` }}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-xl mb-3 bg-[#E8DEC4] flex items-center justify-center">
                          <realm.icon className="h-5 w-5 text-[#1C2541]/40" />
                        </div>
                      )}
                      <div className={`text-sm font-extrabold ${isActive ? "text-[#1C2541]" : "text-[#1C2541]/40"}`}>
                        {realm.name}
                      </div>
                      {isActive ? (
                        <>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 rounded-full bg-[#E8DEC4] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#C9A24B] to-[#8A6D2A] transition-all duration-700"
                                style={{ width: `${stats.realmProgress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-extrabold text-[#8A6D2A]">{stats.realmProgress}%</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push("/home"); }}
                            className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1C2541] text-[#F5EFE0] text-[11px] font-extrabold hover:bg-[#2A3A6B] transition-all active:scale-95"
                          >
                            View
                          </button>
                        </>
                      ) : (
                        <div className="mt-2 inline-flex items-center gap-1.5">
                          {isComingSoon
                            ? <span className="text-[9px] font-bold text-[#8A6D2A] uppercase tracking-wider">Coming Soon</span>
                            : <><Lock className="h-3 w-3 text-[#1C2541]/40" /><span className="text-[9px] font-bold text-[#1C2541]/40 uppercase tracking-wider">Locked</span></>
                          }
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Your Wins */}
            <div className="rounded-2xl bg-[#FBF7EC] border border-[#E8DEC4] p-5 shadow-sm">
              <h3 className="text-base font-extrabold text-[#1C2541] mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-[#C9A24B]" />
                Your Wins
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#F5EFE0] rounded-xl px-3 py-2 border border-[#E8DEC4]">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-xs font-semibold text-[#1C2541]/80">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coming Soon — social teaser, sits below Your Wins, aligned with Level Progress */}
            <div className="rounded-2xl bg-[#FBF7EC] border border-[#E8DEC4] px-6 py-4 flex flex-wrap items-center justify-center gap-6 shadow-sm">
              {[
                { icon: Users, label: "Friends", color: "text-[#1C2541]" },
                { icon: Swords, label: "Battles", color: "text-[#8B2E2E]" },
                { icon: Medal, label: "Rankings", color: "text-[#C9A24B]" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 opacity-50">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span className="text-[10px] font-bold text-[#1C2541]/60 uppercase tracking-wider">{item.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 pl-3 border-l border-[#E8DEC4]">
                <Lock className="h-3 w-3 text-[#1C2541]/30" />
                <span className="text-[9px] font-bold text-[#1C2541]/45 uppercase tracking-[0.15em]">Coming Soon</span>
              </div>
            </div>
          </div>

          {/* RIGHT RAIL */}
          <div className="space-y-5">
            {/* Calendar */}
            <div className="rounded-2xl bg-[#FBF7EC] border border-[#E8DEC4] p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-[#1C2541] flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#8A6D2A]" />
                  Activity
                </h3>
                <span className="text-[10px] font-bold text-[#1C2541]/55 uppercase tracking-wider">{monthName}</span>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS.map((d, i) => (
                  <div key={i} className="text-center text-[9px] font-bold text-[#1C2541]/40">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} className="aspect-square" />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === today;
                  const isActive = activeDays.has(day);
                  const isPast = day < today;
                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-center rounded-md aspect-square text-[10px] font-bold transition-all
                        ${isToday
                          ? "bg-[#1C2541] text-[#C9A24B] shadow-sm ring-1 ring-[#C9A24B]/40"
                          : isActive
                            ? "bg-[#C9A24B]/25 text-[#8A6D2A] font-extrabold"
                            : isPast
                              ? "text-[#1C2541]/25"
                              : "text-[#1C2541]/15"
                        }
                      `}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Challenge */}
            <div className="rounded-2xl bg-gradient-to-br from-[#0F1830] via-[#1C2541] to-[#2A3A6B] p-5 text-[#F5EFE0] relative overflow-hidden shadow-md border border-[#C9A24B]/20">
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-[#C9A24B]/20 blur-2xl" />
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-[#C9A24B]/15 backdrop-blur-sm flex items-center justify-center mb-3 ring-1 ring-[#C9A24B]/30">
                  <Zap className="h-5 w-5 text-[#C9A24B]" />
                </div>
                <h4 className="text-base font-extrabold mb-1">Daily Challenge</h4>
                <p className="text-xs text-[#F5EFE0]/70 mb-4 leading-snug">A quick sprint for bonus XP</p>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-[#C9A24B]">+50 XP</span>
                  <span className="text-[9px] font-bold text-[#F5EFE0]/60 uppercase tracking-wider px-2 py-1 rounded-full bg-[#F5EFE0]/10">Soon</span>
                </div>
              </div>
            </div>

            {/* Level Progress mini */}
            <div className="rounded-2xl bg-[#FBF7EC] border border-[#E8DEC4] p-4 shadow-sm">
              <h4 className="text-sm font-extrabold text-[#1C2541] mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#8A6D2A]" />
                Level Progress
              </h4>
              <div className="flex items-center gap-3">
                <div className="relative h-[68px] w-[68px] flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <defs>
                      <linearGradient id="ringGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#C9A24B" />
                        <stop offset="100%" stopColor="#8A6D2A" />
                      </linearGradient>
                    </defs>
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E8DEC4" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.5" fill="none"
                      stroke="url(#ringGrad2)" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${stats.accuracy} ${100 - stats.accuracy}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-black text-[#1C2541] leading-none">{stats.accuracy}%</span>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#1C2541]/55">Lessons</span>
                    <span className="font-extrabold text-[#1C2541]">{stats.completedLessons}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#1C2541]/55">Weeks</span>
                    <span className="font-extrabold text-[#1C2541]">{stats.weeksCompleted}/12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
