"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readProgress } from "@/data/progress";
import { readProgramStore, getWeekProgress, isWeekComplete } from "@/lib/program-progress";
import {
  ChevronLeft, Zap, Flame, Clock, Target, Calendar,
  Lock, ChevronRight, Users, Swords, Medal,
  TrendingUp, BookOpen, Trophy, Sparkles, Star,
} from "lucide-react";

const REALMS = [
  { name: "Number Nexus", icon: BookOpen, status: "active" as const },
  { name: "Reading Ridge", icon: BookOpen, status: "coming-soon" as const },
  { name: "Inkwell Wilds", icon: BookOpen, status: "locked" as const },
  { name: "Measurelands", icon: BookOpen, status: "locked" as const },
  { name: "Statistica", icon: BookOpen, status: "locked" as const },
  { name: "Chance Hollow", icon: BookOpen, status: "locked" as const },
  { name: "Pattern Peaks", icon: BookOpen, status: "locked" as const },
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
      items.push({ icon: BookOpen, text: `Completed ${stats.completedLessons} lesson${stats.completedLessons !== 1 ? "s" : ""}`, color: "text-blue-500" });
    if (stats.accuracy > 0)
      items.push({ icon: Target, text: `Quiz accuracy at ${stats.accuracy}%`, color: "text-emerald-500" });
    if (stats.weeksCompleted > 0)
      items.push({ icon: Trophy, text: `${stats.weeksCompleted} week${stats.weeksCompleted !== 1 ? "s" : ""} mastered`, color: "text-amber-500" });
    if (items.length === 0)
      items.push({ icon: Star, text: "Start your first lesson!", color: "text-gray-400" });
    return items;
  }, [stats]);

  const levelTitle = levelNum <= 2 ? "Apprentice" : levelNum <= 4 ? "Processor" : "Master";
  const initials = studentName.charAt(0).toUpperCase();
  const { offset, daysInMonth, today, monthName } = useMemo(getMonthGrid, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f0f4ff] via-[#f8f6ff] to-[#f0f9ff]">
      <div className="w-full px-6 md:px-10 lg:px-16 xl:px-24 py-6">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Your Journey</h1>
              <p className="text-[10px] font-bold text-indigo-500/70 uppercase tracking-[0.2em]">Progress Dashboard</p>
            </div>
          </div>

          {/* Profile pill */}
          <div className="flex items-center gap-3 rounded-2xl bg-white border border-gray-200 px-5 py-2.5 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-md shadow-violet-500/25">
              {initials}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-gray-900">{studentName}</h2>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                Numbot {levelTitle} · Lvl {levelNum}
              </p>
            </div>
            <div className="ml-2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-extrabold text-amber-600">{stats.xp.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── ROW 1: STAT CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              icon: Flame, label: "Streak", value: "0 days",
              bg: "bg-gradient-to-br from-orange-400 to-red-500",
              shadow: "shadow-lg shadow-orange-500/25",
            },
            {
              icon: Calendar, label: "Days Active", value: `${activeDays.size}`,
              bg: "bg-gradient-to-br from-sky-400 to-blue-500",
              shadow: "shadow-lg shadow-sky-500/25",
            },
            {
              icon: Clock, label: "Time", value: "--",
              bg: "bg-gradient-to-br from-purple-400 to-indigo-500",
              shadow: "shadow-lg shadow-purple-500/25",
            },
            {
              icon: Target, label: "Accuracy", value: `${stats.accuracy}%`,
              bg: "bg-gradient-to-br from-emerald-400 to-teal-500",
              shadow: "shadow-lg shadow-emerald-500/25",
            },
          ].map((m) => (
            <div
              key={m.label}
              className={`rounded-2xl ${m.bg} ${m.shadow} p-5 cursor-pointer text-white
                hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-200`}
            >
              <m.icon className="h-7 w-7 mb-3 opacity-90" />
              <div className="text-3xl font-black leading-none">{m.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider mt-1.5 opacity-75">{m.label}</div>
            </div>
          ))}
        </div>

        {/* ── ROW 2: Activity Calendar + Widgets ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">

          {/* Calendar widget */}
          <div className="lg:col-span-1 rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Activity
              </h3>
              <span className="text-[10px] font-bold text-gray-400">{monthName}</span>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAYS.map((d, i) => (
                <div key={i} className="text-center text-[8px] font-bold text-gray-300">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === today;
                const isActive = activeDays.has(day);
                const isPast = day < today;
                return (
                  <div
                    key={day}
                    className={`flex items-center justify-center rounded-lg aspect-square text-[9px] font-bold transition-all
                      ${isToday
                        ? "bg-blue-500 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-300/40"
                        : isActive
                          ? "bg-emerald-100 text-emerald-600 border border-emerald-200"
                          : isPast
                            ? "text-gray-300"
                            : "text-gray-200"
                      }
                    `}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-200 border border-emerald-300" />
                <span className="text-[8px] font-bold text-gray-400">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-blue-500 shadow-sm" />
                <span className="text-[8px] font-bold text-gray-400">Today</span>
              </div>
            </div>
          </div>

          {/* Right: stacked widgets */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Daily Challenge */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center mb-3 shadow-md shadow-amber-500/20">
                <Zap className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-extrabold text-gray-800 mb-0.5">Daily Challenge</h4>
              <p className="text-xs text-gray-500 mb-3">Quick challenge for bonus XP</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-amber-600">+50 XP</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Coming Soon</span>
              </div>
            </div>

            {/* Learning Snapshot */}
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                Learning Snapshot
              </h4>
              <div className="flex items-center gap-5">
                {/* Accuracy ring */}
                <div className="relative h-20 w-20 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.5" fill="none"
                      stroke="url(#snapGrad)" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${stats.accuracy} ${100 - stats.accuracy}`}
                    />
                    <defs>
                      <linearGradient id="snapGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-gray-800 leading-none">{stats.accuracy}%</span>
                    <span className="text-[7px] font-bold text-gray-400 uppercase">Accuracy</span>
                  </div>
                </div>
                <div className="space-y-3 flex-1 min-w-0">
                  <div>
                    <div className="text-xl font-black text-gray-800 leading-none">{stats.completedLessons}</div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Lessons Done</div>
                  </div>
                  <div>
                    <div className="text-xl font-black text-gray-800 leading-none">{stats.weeksCompleted}/12</div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Weeks Cleared</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity — spans both columns on md */}
            <div className="md:col-span-2 rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
              <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                Recent Activity
              </h4>
              <div className="flex flex-wrap gap-3">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-xs font-semibold text-gray-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 3: REALM PROGRESS ── */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm mb-4">
          <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            Realm Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {REALMS.map((realm) => {
              const isActive = realm.status === "active";
              const isComingSoon = realm.status === "coming-soon";
              return (
                <div
                  key={realm.name}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 border
                    ${isActive
                      ? "bg-violet-50 border-violet-200/60 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                      : "bg-gray-50 border-gray-100 opacity-60"
                    }
                  `}
                >
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm
                    ${isActive
                      ? "bg-gradient-to-br from-violet-500 to-indigo-500 text-white"
                      : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <realm.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-bold block truncate ${isActive ? "text-gray-800" : "text-gray-500"}`}>
                      {realm.name}
                    </span>
                    {isActive && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 rounded-full bg-violet-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-700"
                            style={{ width: `${stats.realmProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-extrabold text-violet-600">{stats.realmProgress}%</span>
                      </div>
                    )}
                  </div>
                  {!isActive && (
                    <div className="flex-shrink-0">
                      {isComingSoon
                        ? <span className="text-[8px] font-bold text-amber-500 uppercase tracking-wider">Soon</span>
                        : <Lock className="h-3.5 w-3.5 text-gray-300" />
                      }
                    </div>
                  )}
                  {isActive && <ChevronRight className="h-4 w-4 text-violet-300 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BOTTOM: SOCIAL TEASER ── */}
        <div className="rounded-2xl bg-gray-50 border border-gray-200 px-6 py-3.5 flex items-center justify-center gap-8">
          {[
            { icon: Users, label: "Friends", color: "text-sky-400" },
            { icon: Swords, label: "Battles", color: "text-rose-400" },
            { icon: Medal, label: "Rankings", color: "text-amber-400" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 opacity-50">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-4 pl-4 border-l border-gray-200">
            <Lock className="h-3 w-3 text-gray-300" />
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Coming Soon</span>
          </div>
        </div>

      </div>
    </main>
  );
}
