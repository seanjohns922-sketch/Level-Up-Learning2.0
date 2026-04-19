"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readProgress } from "@/data/progress";
import { readProgramStore, getWeekProgress, isWeekComplete } from "@/lib/program-progress";
import {
  ChevronLeft, Zap, Flame, Clock, Target, Calendar,
  Lock, ChevronRight, Users, Swords, Medal,
  TrendingUp, BookOpen, Trophy, Star, Settings, LogOut, Sparkles,
} from "lucide-react";

const REALMS = [
  { name: "Number Nexus", icon: BookOpen, status: "active" as const },
  { name: "Reading Ridge", icon: BookOpen, status: "coming-soon" as const },
  { name: "Inkwell Wilds", icon: BookOpen, status: "locked" as const },
  { name: "Measurelands", icon: BookOpen, status: "locked" as const },
  { name: "Statistica", icon: BookOpen, status: "locked" as const },
  { name: "Chance Hollow", icon: BookOpen, status: "locked" as const },
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
      items.push({ icon: BookOpen, text: `Completed ${stats.completedLessons} lesson${stats.completedLessons !== 1 ? "s" : ""}`, color: "text-teal-600" });
    if (stats.accuracy > 0)
      items.push({ icon: Target, text: `Accuracy at ${stats.accuracy}%`, color: "text-emerald-600" });
    if (stats.weeksCompleted > 0)
      items.push({ icon: Trophy, text: `${stats.weeksCompleted} week${stats.weeksCompleted !== 1 ? "s" : ""} mastered`, color: "text-amber-500" });
    if (items.length === 0)
      items.push({ icon: Star, text: "Start your first lesson!", color: "text-slate-400" });
    return items;
  }, [stats]);

  const levelTitle = levelNum <= 2 ? "Apprentice" : levelNum <= 4 ? "Processor" : "Master";
  const initials = studentName.charAt(0).toUpperCase();
  const { offset, daysInMonth, today, monthName } = useMemo(getMonthGrid, []);

  return (
    <main className="min-h-screen bg-[#F5EFE0] p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto">

        {/* ─── MAIN CONTENT ─── */}
        <div className="space-y-5">

          {/* ─── TOP BAR ─── */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
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

            {/* Profile pill + Settings + Logout */}
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

          {/* ─── HERO WELCOME BANNER ─── */}
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

          {/* ─── HERO WELCOME BANNER ─── */}
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-indigo-800 p-6 md:p-8 overflow-hidden shadow-[0_10px_40px_rgba(30,27,75,0.25)]">
            <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-amber-300/90 uppercase tracking-[0.18em] mb-2">
                  {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                  Welcome back, {studentName}!
                </h1>
                <p className="text-sm text-white/70 mt-1.5 max-w-md">
                  Your Number Nexus journey continues. {stats.realmProgress}% through Level {levelNum}.
                </p>
                <button
                  onClick={() => router.push("/home")}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-900 text-sm font-extrabold hover:bg-amber-300 transition-all active:scale-95 shadow-md shadow-amber-500/20"
                >
                  Continue Lessons <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              {/* Decorative big number */}
              <div className="hidden md:flex items-center justify-center h-28 w-28 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/15 flex-shrink-0">
                <Trophy className="h-12 w-12 text-amber-300" />
              </div>
            </div>
          </div>

          {/* ─── STATS SECTION ─── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-slate-900">Your Stats</h3>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">See all</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Flame, value: "0", label: "Day Streak", iconBg: "bg-rose-100", iconColor: "text-rose-500" },
                { icon: Calendar, value: activeDays.size.toString(), label: "Days Active", iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
                { icon: Clock, value: "--", label: "Time", iconBg: "bg-sky-100", iconColor: "text-sky-600" },
                { icon: Target, value: `${stats.accuracy}%`, label: "Accuracy", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
              ].map((c) => (
                <div
                  key={c.label}
                  className="rounded-2xl bg-white border border-slate-200/70 p-4 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-10 w-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
                      <c.icon className={`h-5 w-5 ${c.iconColor}`} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 leading-none">{c.value}</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">{c.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ─── BOTTOM ROW: REALMS (left) + RIGHT RAIL (calendar + wins + daily) ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* LEFT: Realm progress (spans 2) */}
            <div className="lg:col-span-2 space-y-5">
              {/* Realm progress card */}
              <div className="rounded-2xl bg-white border border-slate-200/70 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                    Enrolled Realms
                  </h3>
                  <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">See all</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {REALMS.slice(0, 4).map((realm) => {
                    const isActive = realm.status === "active";
                    const isComingSoon = realm.status === "coming-soon";
                    return (
                      <div
                        key={realm.name}
                        onClick={() => isActive && router.push("/realms")}
                        className={`relative rounded-2xl p-4 transition-all duration-200 border overflow-hidden
                          ${isActive
                            ? "bg-gradient-to-br from-indigo-50 to-amber-50/40 border-indigo-200 hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                            : "bg-slate-50 border-slate-200/70 opacity-60"
                          }`}
                      >
                        {isActive ? (
                          <div
                            className="h-12 w-12 rounded-xl mb-3 bg-cover bg-center shadow-sm ring-1 ring-indigo-700/10"
                            style={{ backgroundImage: `url('/images/number-nexus-tile.jpg')` }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl mb-3 bg-slate-200 flex items-center justify-center">
                            <realm.icon className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                        <div className={`text-sm font-extrabold ${isActive ? "text-slate-900" : "text-slate-400"}`}>
                          {realm.name}
                        </div>
                        {isActive ? (
                          <>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 h-1.5 rounded-full bg-indigo-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all duration-700"
                                  style={{ width: `${stats.realmProgress}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-extrabold text-indigo-700">{stats.realmProgress}%</span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push("/home"); }}
                              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-extrabold hover:bg-slate-800 transition-all active:scale-95"
                            >
                              View
                            </button>
                          </>
                        ) : (
                          <div className="mt-2 inline-flex items-center gap-1.5">
                            {isComingSoon
                              ? <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Coming Soon</span>
                              : <><Lock className="h-3 w-3 text-slate-400" /><span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Locked</span></>
                            }
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Your Wins + inline Social teaser */}
              <div className="rounded-2xl bg-white border border-slate-200/70 p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    Your Wins
                  </h3>
                  <div className="flex items-center gap-4">
                    {[
                      { icon: Users, label: "Friends", color: "text-indigo-500" },
                      { icon: Swords, label: "Battles", color: "text-rose-400" },
                      { icon: Medal, label: "Rankings", color: "text-amber-500" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-1.5 opacity-50">
                        <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                      <Lock className="h-3 w-3 text-slate-300" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">Coming Soon</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200/70">
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                      <span className="text-xs font-semibold text-slate-700">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT RAIL: Calendar + Daily Challenge */}
            <div className="space-y-5">
              {/* Calendar */}
              <div className="rounded-2xl bg-white border border-slate-200/70 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    Activity
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{monthName}</span>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {DAYS.map((d, i) => (
                    <div key={i} className="text-center text-[9px] font-bold text-slate-400">{d}</div>
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
                            ? "bg-slate-900 text-white shadow-sm"
                            : isActive
                              ? "bg-amber-100 text-amber-700 font-extrabold"
                              : isPast
                                ? "text-slate-300"
                                : "text-slate-200"
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
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-900 p-5 text-white relative overflow-hidden shadow-md">
                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-3">
                    <Zap className="h-5 w-5 text-amber-300" />
                  </div>
                  <h4 className="text-base font-extrabold mb-1">Daily Challenge</h4>
                  <p className="text-xs text-white/80 mb-4 leading-snug">A quick sprint for bonus XP</p>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-amber-300">+50 XP</span>
                    <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider px-2 py-1 rounded-full bg-white/10">Soon</span>
                  </div>
                </div>
              </div>

              {/* Level Progress mini */}
              <div className="rounded-2xl bg-white border border-slate-200/70 p-4 shadow-sm">
                <h4 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  Level Progress
                </h4>
                <div className="flex items-center gap-3">
                  <div className="relative h-[68px] w-[68px] flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                      <defs>
                        <linearGradient id="ringGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#4338ca" />
                        </linearGradient>
                      </defs>
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#EEF2FF" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15.5" fill="none"
                        stroke="url(#ringGrad2)" strokeWidth="3" strokeLinecap="round"
                        strokeDasharray={`${stats.accuracy} ${100 - stats.accuracy}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-black text-slate-900 leading-none">{stats.accuracy}%</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-500">Lessons</span>
                      <span className="font-extrabold text-slate-900">{stats.completedLessons}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-500">Weeks</span>
                      <span className="font-extrabold text-slate-900">{stats.weeksCompleted}/12</span>
                    </div>
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
