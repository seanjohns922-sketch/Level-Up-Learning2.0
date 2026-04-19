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

const NAV_ITEMS = [
  { icon: Home, label: "Dashboard", route: "/profile", active: true },
  { icon: Map, label: "Tower Map", route: "/tower-map" },
  { icon: BookOpen, label: "Lessons", route: "/home" },
  { icon: BarChart3, label: "Stats", route: "/realm-stats" },
  { icon: Trophy, label: "Legends", route: "/legends" },
  { icon: Star, label: "Realms", route: "/realms" },
  { icon: Settings, label: "Settings", route: "/profile" },
];

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
    <main className="min-h-screen bg-[#F4F7F6] p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto flex gap-5">

        {/* ─── LEFT SIDEBAR ─── */}
        <aside className="hidden lg:flex flex-col w-[200px] flex-shrink-0 rounded-3xl bg-gradient-to-b from-teal-600 to-emerald-700 p-5 shadow-[0_8px_30px_rgba(13,148,136,0.18)] sticky top-6 h-[calc(100vh-3rem)]">
          {/* Logo tile */}
          <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-8 mx-auto shadow-inner">
            <BookOpen className="h-7 w-7 text-white" />
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-1 flex-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.route)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all
                  ${item.active
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white transition-all mt-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </aside>

        {/* ─── MAIN CONTENT ─── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ─── TOP BAR ─── */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="lg:hidden h-10 w-10 rounded-xl bg-white border border-teal-100 flex items-center justify-center text-teal-700 hover:bg-teal-50 transition-all shadow-sm"
                aria-label="Back"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="hidden md:flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 border border-slate-200/70 shadow-sm w-full max-w-md">
                <span className="text-sm text-slate-400">Search your journey…</span>
              </div>
            </div>

            {/* Profile pill */}
            <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200/70 px-3 py-2 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-sm font-black text-white shadow-sm">
                {initials}
              </div>
              <div className="hidden sm:block pr-1">
                <h2 className="text-sm font-extrabold text-slate-900 leading-tight">{studentName}</h2>
                <p className="text-[10px] font-bold text-slate-500">Numbot {levelTitle} · Lvl {levelNum}</p>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                <Zap className="h-3 w-3 text-emerald-600" />
                <span className="text-xs font-extrabold text-emerald-700">{stats.xp.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* ─── HERO WELCOME BANNER ─── */}
          <div className="relative rounded-3xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 p-6 md:p-8 overflow-hidden shadow-[0_10px_40px_rgba(13,148,136,0.2)]">
            <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-emerald-300/20 blur-2xl pointer-events-none" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white/70 uppercase tracking-[0.18em] mb-2">
                  {new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                  Welcome back, {studentName}!
                </h1>
                <p className="text-sm text-white/80 mt-1.5 max-w-md">
                  Your Number Nexus journey continues. {stats.realmProgress}% through Level {levelNum}.
                </p>
                <button
                  onClick={() => router.push("/home")}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-teal-700 text-sm font-extrabold hover:bg-teal-50 transition-all active:scale-95 shadow-md"
                >
                  Continue Lessons <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              {/* Decorative big number */}
              <div className="hidden md:flex items-center justify-center h-28 w-28 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/20 flex-shrink-0">
                <Trophy className="h-12 w-12 text-amber-300" />
              </div>
            </div>
          </div>

          {/* ─── STATS SECTION ─── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-slate-900">Your Stats</h3>
              <button className="text-xs font-bold text-teal-600 hover:text-teal-700">See all</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Flame, value: "0", label: "Day Streak", iconBg: "bg-rose-100", iconColor: "text-rose-500" },
                { icon: Calendar, value: activeDays.size.toString(), label: "Days Active", iconBg: "bg-teal-100", iconColor: "text-teal-600" },
                { icon: Clock, value: "--", label: "Time", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
                { icon: Target, value: `${stats.accuracy}%`, label: "Accuracy", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
              ].map((c) => (
                <div
                  key={c.label}
                  className="rounded-2xl bg-white border border-slate-200/70 p-4 hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-sm"
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
                    <BookOpen className="h-4 w-4 text-teal-600" />
                    Enrolled Realms
                  </h3>
                  <button className="text-xs font-bold text-teal-600 hover:text-teal-700">See all</button>
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
                            ? "bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200 hover:border-teal-400 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                            : "bg-slate-50 border-slate-200/70 opacity-60"
                          }`}
                      >
                        {isActive ? (
                          <div
                            className="h-12 w-12 rounded-xl mb-3 bg-cover bg-center shadow-sm ring-1 ring-teal-700/10"
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
                              <div className="flex-1 h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all duration-700"
                                  style={{ width: `${stats.realmProgress}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-extrabold text-emerald-700">{stats.realmProgress}%</span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push("/home"); }}
                              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-br from-teal-600 to-emerald-700 text-white text-[11px] font-extrabold hover:shadow-md transition-all active:scale-95"
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

              {/* Your Wins */}
              <div className="rounded-2xl bg-white border border-slate-200/70 p-5 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Your Wins
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-teal-50/60 rounded-xl px-3 py-2 border border-teal-100">
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
                    <Calendar className="h-4 w-4 text-teal-600" />
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
                            ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm"
                            : isActive
                              ? "bg-emerald-100 text-emerald-700 font-extrabold"
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
              <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 p-5 text-white relative overflow-hidden shadow-md">
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
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Level Progress
                </h4>
                <div className="flex items-center gap-3">
                  <div className="relative h-[68px] w-[68px] flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                      <defs>
                        <linearGradient id="ringGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#14b8a6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#ECFDF5" strokeWidth="3" />
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

          {/* ─── BOTTOM SOCIAL TEASER ─── */}
          <div className="rounded-2xl bg-white border border-slate-200/70 px-6 py-3 flex items-center justify-center gap-8 shadow-sm">
            {[
              { icon: Users, label: "Friends", color: "text-teal-600" },
              { icon: Swords, label: "Battles", color: "text-rose-500" },
              { icon: Medal, label: "Rankings", color: "text-amber-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 opacity-40">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 ml-3 pl-3 border-l border-slate-200">
              <Lock className="h-3 w-3 text-slate-300" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">Coming Soon</span>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
