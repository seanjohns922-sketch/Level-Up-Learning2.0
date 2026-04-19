"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readProgress } from "@/data/progress";
import { readProgramStore, getWeekProgress, isWeekComplete } from "@/lib/program-progress";
import {
  ChevronLeft, Zap, Flame, Clock, Target, Calendar,
  Lock, ChevronRight, Users, Swords, Medal,
  TrendingUp, BookOpen, Trophy, Star,
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
      items.push({ icon: Target, text: `Accuracy at ${stats.accuracy}%`, color: "text-emerald-500" });
    if (stats.weeksCompleted > 0)
      items.push({ icon: Trophy, text: `${stats.weeksCompleted} week${stats.weeksCompleted !== 1 ? "s" : ""} mastered`, color: "text-amber-500" });
    if (items.length === 0)
      items.push({ icon: Star, text: "Start your first lesson!", color: "text-gray-400" });
    return items;
  }, [stats]);

  const levelTitle = levelNum <= 2 ? "Apprentice" : levelNum <= 4 ? "Processor" : "Master";
  const initials = studentName.charAt(0).toUpperCase();
  const { offset, daysInMonth, today, monthName } = useMemo(getMonthGrid, []);

  /* ── shared card shadow (subtle, real depth) ── */
  const cardShadow = "shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.04)]";

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F4FBF9] via-[#EEF7F4] to-[#E8F4EF] relative">
      {/* Soft ambient teal blooms */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-teal-300/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[480px] w-[480px] rounded-full bg-emerald-300/12 blur-3xl" />
      </div>

      <div className="relative w-full px-6 md:px-10 lg:px-16 xl:px-24 py-6">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className={`h-9 w-9 rounded-lg bg-white/80 backdrop-blur-sm border border-teal-100 flex items-center justify-center text-teal-700 hover:bg-white hover:border-teal-200 transition-all ${cardShadow}`}
              aria-label="Back"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">Your Journey</h1>
              <p className="text-[9px] font-bold text-teal-600/70 uppercase tracking-[0.18em]">Number Nexus · Progress</p>
            </div>
          </div>

          {/* Profile pill */}
          <div className={`flex items-center gap-3 rounded-2xl bg-white/85 backdrop-blur-sm border border-teal-100 px-4 py-2 ${cardShadow}`}>
            <div className="relative group cursor-pointer">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-sm font-black text-white shadow-sm">
                {initials}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-white border border-teal-100 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                <Lock className="h-2 w-2 text-gray-400" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 leading-tight">{studentName}</h2>
              <p className="text-[9px] font-bold text-teal-600/70 uppercase tracking-[0.12em]">
                Numbot {levelTitle} · Lvl {levelNum}
              </p>
            </div>
            <div className="ml-1.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              <Zap className="h-3 w-3 text-emerald-600" />
              <span className="text-xs font-extrabold text-emerald-700">{stats.xp.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── ROW 1: STAT CARDS — refined glass/mint with accent stripe ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { icon: Flame, value: "0", label: "Day Streak", accent: "from-rose-400 to-orange-400", iconColor: "text-rose-500", iconBg: "bg-rose-50" },
            { icon: Calendar, value: activeDays.size.toString(), label: "Days Active", accent: "from-teal-400 to-cyan-400", iconColor: "text-teal-600", iconBg: "bg-teal-50" },
            { icon: Clock, value: "--", label: "Time", accent: "from-emerald-400 to-teal-500", iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
            { icon: Target, value: `${stats.accuracy}%`, label: "Accuracy", accent: "from-emerald-500 to-green-500", iconColor: "text-emerald-700", iconBg: "bg-emerald-50" },
          ].map((c) => (
            <div
              key={c.label}
              className={`group relative rounded-2xl bg-white/90 backdrop-blur-sm border border-teal-100/70 p-4 cursor-pointer
                hover:-translate-y-0.5 hover:border-teal-200 transition-all duration-200 overflow-hidden ${cardShadow}`}
            >
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${c.accent}`} />
              <div className={`h-9 w-9 rounded-lg ${c.iconBg} flex items-center justify-center mb-2.5`}>
                <c.icon className={`h-4 w-4 ${c.iconColor}`} />
              </div>
              <div className="text-2xl font-black text-slate-900 leading-none">{c.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">{c.label}</div>
            </div>
          ))}
        </div>

        {/* ── ROW 2: Calendar (compact) + Level Progress + Daily Challenge ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4">

          {/* Calendar — 4/12 */}
          <div className={`lg:col-span-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-teal-100/70 p-4 ${cardShadow}`}>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-teal-600" />
                Activity
              </h3>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{monthName}</span>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAYS.map((d, i) => (
                <div key={i} className="text-center text-[8px] font-bold text-slate-300">{d}</div>
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
                    className={`flex items-center justify-center rounded-md aspect-square text-[9px] font-bold transition-all
                      ${isToday
                        ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-500/30"
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

            <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-teal-50">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-100 border border-emerald-300" />
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600" />
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Today</span>
              </div>
            </div>
          </div>

          {/* Level Progress — 5/12 */}
          <div className={`lg:col-span-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-teal-100/70 p-4 ${cardShadow}`}>
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              Level Progress
            </h4>
            <div className="flex items-center gap-5">
              <div className="relative h-[88px] w-[88px] flex-shrink-0">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#ECFDF5" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.5" fill="none"
                    stroke="url(#ringGrad)" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${stats.accuracy} ${100 - stats.accuracy}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-slate-900 leading-none">{stats.accuracy}%</span>
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Accuracy</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 flex-1 min-w-0">
                <div className="rounded-lg bg-teal-50/60 border border-teal-100 px-3 py-2">
                  <div className="text-xl font-black text-slate-900 leading-none">{stats.completedLessons}</div>
                  <div className="text-[9px] font-bold text-teal-700/70 uppercase tracking-wider mt-1">Lessons</div>
                </div>
                <div className="rounded-lg bg-emerald-50/60 border border-emerald-100 px-3 py-2">
                  <div className="text-xl font-black text-slate-900 leading-none">{stats.weeksCompleted}<span className="text-sm text-slate-400">/12</span></div>
                  <div className="text-[9px] font-bold text-emerald-700/70 uppercase tracking-wider mt-1">Weeks</div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Challenge — 3/12 */}
          <div className={`lg:col-span-3 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 p-4 text-white relative overflow-hidden ${cardShadow}`}>
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <div className="h-9 w-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center mb-2.5">
                <Zap className="h-4 w-4 text-amber-300" />
              </div>
              <h4 className="text-sm font-extrabold mb-0.5">Daily Challenge</h4>
              <p className="text-[11px] text-white/70 mb-3 leading-snug">Quick sprint for bonus XP</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-amber-300">+50 XP</span>
                <span className="text-[8px] font-bold text-white/50 uppercase tracking-wider">Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW: Your Wins (full width, slim) ── */}
        <div className={`rounded-2xl bg-white/90 backdrop-blur-sm border border-teal-100/70 p-4 mb-4 ${cardShadow}`}>
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            Your Wins
          </h4>
          <div className="flex flex-wrap gap-2">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-teal-50/50 rounded-lg px-3 py-2 border border-teal-100/60">
                <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                <span className="text-xs font-semibold text-slate-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── ROW 3: REALM PROGRESS ── */}
        <div className={`rounded-2xl bg-white border border-[#E5E7EB] p-4 mb-3 ${cardShadow}`}>
          <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-[#7C5CFC]" />
            Realm Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {REALMS.map((realm) => {
              const isActive = realm.status === "active";
              const isComingSoon = realm.status === "coming-soon";
              return (
                <div
                  key={realm.name}
                  className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 transition-all duration-200 border
                    ${isActive
                      ? "bg-[#F5F3FF] border-[#DDD6FE] hover:shadow-sm hover:-translate-y-0.5 cursor-pointer"
                      : "bg-[#F9FAFB] border-[#F3F4F6] opacity-55"
                    }
                  `}
                >
{isActive ? (
                    <div
                      className="h-10 w-10 rounded-lg flex-shrink-0 bg-cover bg-center shadow-sm ring-1 ring-black/10"
                      style={{
                        backgroundImage: `url('/images/number-nexus-tile.jpg')`,
                      }}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-200 text-gray-400">
                      <realm.icon className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-bold block truncate ${isActive ? "text-gray-800" : "text-gray-400"}`}>
                      {realm.name}
                    </span>
                    {isActive && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full bg-[#EDE9FE] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#7C5CFC] transition-all duration-700"
                            style={{ width: `${stats.realmProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-extrabold text-[#7C5CFC]">{stats.realmProgress}%</span>
                      </div>
                    )}
                  </div>
                  {!isActive && (
                    <div className="flex-shrink-0">
                      {isComingSoon
                        ? <span className="text-[8px] font-bold text-[#D4A017] uppercase tracking-wider">Soon</span>
                        : <Lock className="h-3.5 w-3.5 text-gray-300" />
                      }
                    </div>
                  )}
                  {isActive && <ChevronRight className="h-4 w-4 text-[#C4B5FD] flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BOTTOM: SOCIAL TEASER ── */}
        <div className={`rounded-xl bg-white border border-[#E5E7EB] px-6 py-3 flex items-center justify-center gap-8 ${cardShadow}`}>
          {[
            { icon: Users, label: "Friends", color: "text-[#3B82F6]" },
            { icon: Swords, label: "Battles", color: "text-[#EF4444]" },
            { icon: Medal, label: "Rankings", color: "text-[#D4A017]" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 opacity-40">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-3 pl-3 border-l border-gray-200">
            <Lock className="h-3 w-3 text-gray-300" />
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]">Coming Soon</span>
          </div>
        </div>

      </div>
    </main>
  );
}
