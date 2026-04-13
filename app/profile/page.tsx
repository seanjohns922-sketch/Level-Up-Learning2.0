"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readProgress } from "@/data/progress";
import { readProgramStore, getWeekProgress, isWeekComplete } from "@/lib/program-progress";
import {
  ChevronLeft, Zap, Flame, Clock, Target, Calendar,
  Lock, ChevronRight, Users, Swords, Medal, Play,
  TrendingUp, BookOpen, Trophy, Sparkles, Star,
} from "lucide-react";

/* ── helpers ── */

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

/* ── page ── */

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
    let currentWeek = 1;
    let currentLesson = 1;

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
      if (isWeekComplete(wp)) {
        weeksCompleted++;
      } else if (currentWeek === 1 || w <= currentWeek) {
        currentWeek = w;
        currentLesson = done + 1;
      }
    }

    const accuracy = quizCount > 0 ? Math.round(quizTotal / quizCount) : (progress?.scorePercent ?? 0);
    const realmProgress = Math.round((weeksCompleted / 12) * 100);

    return { xp, completedLessons, accuracy, weeksCompleted, realmProgress, currentWeek, currentLesson: Math.min(currentLesson, 3) };
  }, [store, year, progress]);

  const recentActivity = useMemo(() => {
    const items: { icon: typeof Star; text: string; color: string }[] = [];
    if (stats.completedLessons > 0)
      items.push({ icon: BookOpen, text: `Completed ${stats.completedLessons} lesson${stats.completedLessons !== 1 ? "s" : ""}`, color: "text-sky-400" });
    if (stats.accuracy > 0)
      items.push({ icon: Target, text: `Quiz accuracy at ${stats.accuracy}%`, color: "text-emerald-400" });
    if (stats.weeksCompleted > 0)
      items.push({ icon: Trophy, text: `${stats.weeksCompleted} week${stats.weeksCompleted !== 1 ? "s" : ""} mastered`, color: "text-amber-400" });
    if (items.length === 0)
      items.push({ icon: Star, text: "Start your first lesson to begin tracking", color: "text-white/50" });
    return items;
  }, [stats]);

  const levelTitle = levelNum <= 2 ? "Apprentice" : levelNum <= 4 ? "Processor" : "Master";
  const initials = studentName.charAt(0).toUpperCase();
  const { offset, daysInMonth, today, monthName } = useMemo(getMonthGrid, []);
  const lessonsThisWeek = getWeekProgress(store, year, stats.currentWeek).lessonsCompleted.filter(Boolean).length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f1a2e] via-[#132240] to-[#0d1525]">
      <div className="w-full px-6 md:px-10 lg:px-16 xl:px-24 py-6">

        {/* ── ROW 1: Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="h-10 w-10 rounded-xl bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white/70 hover:bg-white/[0.14] transition-all duration-200"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Your Journey</h1>
              <p className="text-[10px] font-bold text-sky-400/60 uppercase tracking-[0.2em]">Progress Dashboard</p>
            </div>
          </div>

          {/* Profile pill */}
          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/[0.08] px-5 py-2.5 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-violet-500/20">
              {initials}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">{studentName}</h2>
              <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.15em]">
                Numbot {levelTitle} · Lvl {levelNum}
              </p>
            </div>
            <div className="ml-2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/20">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-extrabold text-amber-300">{stats.xp.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── ROW 2: Stats Widgets ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            {
              icon: Flame, label: "Current Streak", value: "0 days",
              gradient: "from-orange-500/20 to-red-500/10",
              border: "border-orange-500/20",
              iconBg: "bg-gradient-to-br from-orange-500 to-red-500",
              valueColor: "text-orange-300",
            },
            {
              icon: Calendar, label: "Days Active", value: `${activeDays.size}`,
              gradient: "from-sky-500/20 to-blue-500/10",
              border: "border-sky-500/20",
              iconBg: "bg-gradient-to-br from-sky-500 to-blue-500",
              valueColor: "text-sky-300",
            },
            {
              icon: Clock, label: "Time This Week", value: "--",
              gradient: "from-purple-500/20 to-violet-500/10",
              border: "border-purple-500/20",
              iconBg: "bg-gradient-to-br from-purple-500 to-violet-500",
              valueColor: "text-purple-300",
            },
            {
              icon: Target, label: "Accuracy", value: `${stats.accuracy}%`,
              gradient: "from-emerald-500/20 to-green-500/10",
              border: "border-emerald-500/20",
              iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
              valueColor: "text-emerald-300",
            },
          ].map((m) => (
            <div
              key={m.label}
              className={`rounded-2xl bg-gradient-to-br ${m.gradient} border ${m.border} p-5 cursor-pointer
                hover:scale-[1.03] hover:shadow-lg transition-all duration-200`}
            >
              <div className={`h-10 w-10 rounded-xl ${m.iconBg} text-white flex items-center justify-center mb-3 shadow-md`}>
                <m.icon className="h-5 w-5" />
              </div>
              <div className={`text-2xl font-black ${m.valueColor} leading-none`}>{m.value}</div>
              <div className="text-[10px] font-bold text-white/35 uppercase tracking-wider mt-1.5">{m.label}</div>
            </div>
          ))}
        </div>

        {/* ── ROW 3: Continue Learning + Calendar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">

          {/* Continue Learning — hero card */}
          <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-indigo-600/30 via-violet-600/20 to-purple-600/10 border border-indigo-500/20 p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-indigo-300/60 uppercase tracking-[0.2em]">Number Nexus</span>
                <span className="text-white/20">·</span>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Week {stats.currentWeek}</span>
              </div>
              <h3 className="text-lg font-black text-white mb-1">Continue Learning</h3>
              <p className="text-sm text-white/50 mb-4">Pick up where you left off — Lesson {stats.currentLesson} of 3</p>

              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-2.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-700"
                    style={{ width: `${Math.round((lessonsThisWeek / 3) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-extrabold text-indigo-300">{lessonsThisWeek}/3</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/home")}
              className="flex items-center justify-center gap-2 w-full sm:w-auto sm:px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-extrabold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-200"
            >
              <Play className="h-4 w-4" fill="currentColor" />
              Continue
            </button>
          </div>

          {/* Calendar widget — compact */}
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold text-white/70 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-sky-400" />
                Monthly Activity
              </h3>
              <span className="text-[10px] font-bold text-white/30">{monthName}</span>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAYS.map((d, i) => (
                <div key={i} className="text-center text-[8px] font-bold text-white/25">{d}</div>
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
                        ? "bg-sky-500 text-white shadow-[0_0_8px_rgba(14,165,233,0.4)] ring-1 ring-sky-400/30"
                        : isActive
                          ? "bg-sky-500/20 text-sky-300 border border-sky-500/20"
                          : isPast
                            ? "text-white/15"
                            : "text-white/8"
                      }
                    `}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-white/5">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-sky-500/20 border border-sky-500/20" />
                <span className="text-[8px] font-bold text-white/30">Active</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_4px_rgba(14,165,233,0.4)]" />
                <span className="text-[8px] font-bold text-white/30">Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 4: Daily Challenge + Learning Snapshot + Recent Activity ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

          {/* Daily Challenge */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/15 p-5 cursor-pointer hover:scale-[1.02] transition-all duration-200">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center mb-3 shadow-md shadow-amber-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-extrabold text-white mb-0.5">Daily Challenge</h4>
            <p className="text-xs text-white/40 mb-3">Complete a quick challenge for bonus XP</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-amber-300">+50 XP</span>
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider ml-auto">Coming Soon</span>
            </div>
          </div>

          {/* Learning Snapshot */}
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5 backdrop-blur-sm">
            <h4 className="text-xs font-extrabold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              Learning Snapshot
            </h4>
            <div className="flex items-center gap-5">
              {/* Accuracy ring */}
              <div className="relative h-20 w-20 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
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
                  <span className="text-base font-black text-emerald-300 leading-none">{stats.accuracy}%</span>
                  <span className="text-[7px] font-bold text-white/30 uppercase">Accuracy</span>
                </div>
              </div>
              <div className="space-y-2.5 flex-1 min-w-0">
                <div>
                  <div className="text-lg font-black text-white leading-none">{stats.completedLessons}</div>
                  <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Lessons Done</div>
                </div>
                <div>
                  <div className="text-lg font-black text-white leading-none">{stats.weeksCompleted}/12</div>
                  <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Weeks Cleared</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5 backdrop-blur-sm">
            <h4 className="text-xs font-extrabold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              Recent Activity
            </h4>
            <div className="space-y-2.5">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                  </div>
                  <span className="text-xs font-semibold text-white/55 truncate">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 5: Realm Progress ── */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5 backdrop-blur-sm mb-4">
          <h3 className="text-xs font-extrabold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            Realm Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {REALMS.map((realm) => {
              const isActive = realm.status === "active";
              const isComingSoon = realm.status === "coming-soon";
              return (
                <div
                  key={realm.name}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200
                    ${isActive ? "bg-white/[0.04] hover:bg-white/[0.08] cursor-pointer" : "opacity-40"}
                  `}
                >
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0
                    ${isActive
                      ? "bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20"
                      : "bg-white/[0.04] border border-white/[0.06]"
                    }`}
                  >
                    <realm.icon className={`h-4 w-4 ${isActive ? "text-violet-400" : "text-white/25"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-bold block truncate ${isActive ? "text-white/80" : "text-white/40"}`}>
                      {realm.name}
                    </span>
                    {isActive && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-700"
                            style={{ width: `${stats.realmProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-extrabold text-violet-400">{stats.realmProgress}%</span>
                      </div>
                    )}
                  </div>
                  {!isActive && (
                    <div className="flex-shrink-0">
                      {isComingSoon
                        ? <span className="text-[8px] font-bold text-amber-400/50 uppercase tracking-wider">Soon</span>
                        : <Lock className="h-3.5 w-3.5 text-white/15" />
                      }
                    </div>
                  )}
                  {isActive && <ChevronRight className="h-4 w-4 text-white/15 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── ROW 6: Social Teaser ── */}
        <div className="rounded-2xl bg-white/[0.025] border border-white/[0.06] px-6 py-3.5 flex items-center justify-center gap-8 opacity-50">
          {[
            { icon: Users, label: "Friends", color: "text-sky-500/50" },
            { icon: Swords, label: "Battles", color: "text-rose-500/50" },
            { icon: Medal, label: "Rankings", color: "text-amber-500/50" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{item.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-4 pl-4 border-l border-white/[0.08]">
            <Lock className="h-3 w-3 text-white/20" />
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Coming Soon</span>
          </div>
        </div>

      </div>
    </main>
  );
}
