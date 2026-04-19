"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readProgress } from "@/data/progress";
import { readProgramStore, getWeekProgress, isWeekComplete } from "@/lib/program-progress";
import {
  ChevronLeft, Zap, Flame, Clock, Target, Calendar,
  Lock, ChevronRight, Users, Swords, Medal,
  TrendingUp, BookOpen, Trophy, Star, Settings, LogOut, Search,
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

// ─── Clean Dashboard System ───
// bg #F7F8FA / card #FFFFFF / border #E6E8EC
// text #0F172A / muted #64748B
// accent teal #0EA5A4 / reward gold #F59E0B

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
      items.push({ icon: BookOpen, text: `Completed ${stats.completedLessons} lesson${stats.completedLessons !== 1 ? "s" : ""}`, color: "text-[#0EA5A4]" });
    if (stats.accuracy > 0)
      items.push({ icon: Target, text: `Accuracy at ${stats.accuracy}%`, color: "text-[#0EA5A4]" });
    if (stats.weeksCompleted > 0)
      items.push({ icon: Trophy, text: `${stats.weeksCompleted} week${stats.weeksCompleted !== 1 ? "s" : ""} mastered`, color: "text-[#F59E0B]" });
    if (items.length === 0)
      items.push({ icon: Star, text: "Start your first lesson!", color: "text-[#94A3B8]" });
    return items;
  }, [stats]);

  const levelTitle = levelNum <= 2 ? "Apprentice" : levelNum <= 4 ? "Processor" : "Master";
  const initials = studentName.charAt(0).toUpperCase();
  const { offset, daysInMonth, today, monthName } = useMemo(getMonthGrid, []);

  return (
    <main className="min-h-screen bg-[#F7F8FA] p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto space-y-5">

        {/* ─── TOP BAR ─── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => router.back()}
              className="lg:hidden h-10 w-10 rounded-xl bg-white border border-[#E6E8EC] flex items-center justify-center text-[#0F172A] hover:bg-[#F1F5F9] transition-all"
              aria-label="Back"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-[#E6E8EC] w-full max-w-md">
              <Search className="h-4 w-4 text-[#94A3B8]" />
              <span className="text-sm text-[#94A3B8]">Search your journey…</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 rounded-xl bg-white border border-[#E6E8EC] px-3 py-2">
              <div className="h-10 w-10 rounded-lg bg-[#0F172A] flex items-center justify-center text-sm font-black text-white">
                {initials}
              </div>
              <div className="hidden sm:block pr-1">
                <h2 className="text-sm font-bold text-[#0F172A] leading-tight">{studentName}</h2>
                <p className="text-[10px] font-semibold text-[#64748B]">Numbot {levelTitle} · Lvl {levelNum}</p>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FEF3C7] border border-[#FDE68A]">
                <Zap className="h-3 w-3 text-[#F59E0B]" />
                <span className="text-xs font-extrabold text-[#B45309]">{stats.xp.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/profile")}
              className="h-11 w-11 rounded-xl bg-white border border-[#E6E8EC] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all"
              aria-label="Settings"
              title="Settings"
            >
              <Settings className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={() => router.push("/login")}
              className="h-11 w-11 rounded-xl bg-white border border-[#E6E8EC] flex items-center justify-center text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-all"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        {/* ─── HERO BANNER ─── */}
        <div className="relative rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-6 md:p-8 overflow-hidden border border-[#1E293B]">
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-[#0EA5A4]/10 blur-3xl pointer-events-none" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.18em] mb-2">
                {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                Welcome back, {studentName}!
              </h1>
              <p className="text-sm text-[#CBD5E1] mt-1.5 max-w-md">
                Your Number Nexus journey continues. {stats.realmProgress}% through Level {levelNum}.
              </p>
              <button
                onClick={() => router.push("/home")}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F59E0B] text-[#0F172A] text-sm font-extrabold hover:bg-[#FBBF24] transition-all active:scale-95"
              >
                Continue Lessons <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="hidden md:flex items-center justify-center h-24 w-24 rounded-2xl bg-white/[0.03] border border-[#F59E0B]/30 flex-shrink-0">
              <Trophy className="h-10 w-10 text-[#F59E0B]" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* ─── STATS ─── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#0F172A]">Your Stats</h3>
            <button className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A]">See all</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Flame, value: "0", label: "Day Streak", accent: "#F59E0B" },
              { icon: Calendar, value: activeDays.size.toString(), label: "Days Active", accent: "#0EA5A4" },
              { icon: Clock, value: "--", label: "Time", accent: "#0EA5A4" },
              { icon: Target, value: `${stats.accuracy}%`, label: "Accuracy", accent: "#0EA5A4" },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-xl bg-white border border-[#E6E8EC] p-4 hover:border-[#CBD5E1] transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-[#F1F5F9] flex items-center justify-center">
                    <c.icon className="h-5 w-5" style={{ color: c.accent }} />
                  </div>
                </div>
                <div className="text-2xl font-black text-[#0F172A] leading-none">{c.value}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="h-0.5 w-5 rounded-full" style={{ backgroundColor: c.accent }} />
                  <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">{c.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── REALMS + WINS (left) + RIGHT RAIL ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <div className="lg:col-span-2 space-y-5">
            {/* Enrolled Realms */}
            <div className="rounded-xl bg-white border border-[#E6E8EC] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#0EA5A4]" />
                  Enrolled Realms
                </h3>
                <button className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A]">See all</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REALMS.map((realm) => {
                  const isActive = realm.status === "active";
                  const isComingSoon = realm.status === "coming-soon";
                  return (
                    <div
                      key={realm.name}
                      onClick={() => isActive && router.push("/realms")}
                      className={`relative rounded-xl p-4 transition-all duration-200 border overflow-hidden
                        ${isActive
                          ? "bg-white border-[#E6E8EC] hover:border-[#0EA5A4] hover:-translate-y-0.5 cursor-pointer"
                          : "bg-[#F7F8FA] border-[#E6E8EC] opacity-70"
                        }`}
                    >
                      {isActive ? (
                        <div
                          className="h-12 w-12 rounded-lg mb-3 bg-cover bg-center border border-[#E6E8EC]"
                          style={{ backgroundImage: `url('/images/number-nexus-tile.jpg')` }}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg mb-3 bg-[#F1F5F9] border border-[#E6E8EC] flex items-center justify-center">
                          <realm.icon className="h-5 w-5 text-[#94A3B8]" />
                        </div>
                      )}
                      <div className={`text-sm font-bold ${isActive ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>
                        {realm.name}
                      </div>
                      {isActive ? (
                        <>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#0EA5A4] transition-all duration-700"
                                style={{ width: `${stats.realmProgress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-extrabold text-[#0EA5A4]">{stats.realmProgress}%</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push("/home"); }}
                            className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#0F172A] text-white text-[11px] font-bold hover:bg-[#1E293B] transition-all active:scale-95"
                          >
                            View
                          </button>
                        </>
                      ) : (
                        <div className="mt-2 inline-flex items-center gap-1.5">
                          {isComingSoon
                            ? <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider">Coming Soon</span>
                            : <><Lock className="h-3 w-3 text-[#94A3B8]" /><span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider">Locked</span></>
                          }
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Your Wins */}
            <div className="rounded-xl bg-white border border-[#E6E8EC] p-5">
              <h3 className="text-base font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-[#F59E0B]" />
                Your Wins
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#F7F8FA] rounded-lg px-3 py-2 border border-[#E6E8EC]">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-xs font-semibold text-[#0F172A]">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coming Soon — social teaser */}
            <div className="rounded-xl bg-white border border-[#E6E8EC] px-6 py-4 flex flex-wrap items-center justify-center gap-6">
              {[
                { icon: Users, label: "Friends" },
                { icon: Swords, label: "Battles" },
                { icon: Medal, label: "Rankings" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 opacity-60">
                  <item.icon className="h-4 w-4 text-[#64748B]" />
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{item.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 pl-3 border-l border-[#E6E8EC]">
                <Lock className="h-3 w-3 text-[#94A3B8]" />
                <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-[0.15em]">Coming Soon</span>
              </div>
            </div>
          </div>

          {/* RIGHT RAIL */}
          <div className="space-y-5">
            {/* Calendar */}
            <div className="rounded-xl bg-white border border-[#E6E8EC] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#0EA5A4]" />
                  Activity
                </h3>
                <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">{monthName}</span>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS.map((d, i) => (
                  <div key={i} className="text-center text-[9px] font-bold text-[#94A3B8]">{d}</div>
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
                          ? "bg-[#0F172A] text-white"
                          : isActive
                            ? "bg-[#CCFBF1] text-[#0F766E] font-extrabold"
                            : isPast
                              ? "text-[#64748B]"
                              : "text-[#CBD5E1]"
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
            <div className="rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-5 text-white relative overflow-hidden border border-[#1E293B]">
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-[#0EA5A4]/15 blur-2xl" />
              <div className="relative">
                <div className="h-10 w-10 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center mb-3">
                  <Zap className="h-5 w-5 text-[#F59E0B]" />
                </div>
                <h4 className="text-base font-bold mb-1">Daily Challenge</h4>
                <p className="text-xs text-[#CBD5E1] mb-4 leading-snug">A quick sprint for bonus XP</p>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-[#F59E0B]">+50 XP</span>
                  <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider px-2 py-1 rounded-full bg-white/[0.06]">Soon</span>
                </div>
              </div>
            </div>

            {/* Level Progress mini */}
            <div className="rounded-xl bg-white border border-[#E6E8EC] p-4">
              <h4 className="text-sm font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#0EA5A4]" />
                Level Progress
              </h4>
              <div className="flex items-center gap-3">
                <div className="relative h-[68px] w-[68px] flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.5" fill="none"
                      stroke="#0EA5A4" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${stats.accuracy} ${100 - stats.accuracy}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-black text-[#0F172A] leading-none">{stats.accuracy}%</span>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#64748B]">Lessons</span>
                    <span className="font-extrabold text-[#0F172A]">{stats.completedLessons}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#64748B]">Weeks</span>
                    <span className="font-extrabold text-[#0F172A]">{stats.weeksCompleted}/12</span>
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
