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
    <main className="min-h-screen bg-[#F7F8FA]">
      <div className="w-full px-6 md:px-10 lg:px-16 xl:px-24 py-6">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className={`h-9 w-9 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all ${cardShadow}`}
              aria-label="Back"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-lg font-black text-gray-900 tracking-tight leading-tight">Your Journey</h1>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.18em]">Progress Dashboard</p>
            </div>
          </div>

          {/* Profile pill */}
          <div className={`flex items-center gap-3 rounded-2xl bg-white border border-[#E5E7EB] px-4 py-2 ${cardShadow}`}>
            <div className="relative group cursor-pointer">
              <div className="h-9 w-9 rounded-lg bg-[#7C5CFC] flex items-center justify-center text-sm font-black text-white">
                {initials}
              </div>
              {/* Subtle "customise" hint on hover */}
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                <Lock className="h-2 w-2 text-gray-400" />
              </div>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-gray-900 leading-tight">{studentName}</h2>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.12em]">
                Numbot {levelTitle} · Lvl {levelNum}
              </p>
            </div>
            <div className="ml-1.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF8ED] border border-[#F5DEB3]">
              <Zap className="h-3 w-3 text-[#D4A017]" />
              <span className="text-xs font-extrabold text-[#B8860B]">{stats.xp.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── ROW 1: STAT CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {/* Streak — the HERO card, only one with gradient */}
          <div
            className="rounded-2xl bg-gradient-to-br from-[#FF6A5A] to-[#E84D3D] p-4 cursor-pointer text-white
              hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200
              shadow-[0_6px_20px_rgba(232,77,61,0.25)]"
          >
            <Flame className="h-6 w-6 mb-2" />
            <div className="text-3xl font-black leading-none">0</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80">Day Streak</div>
          </div>

          {/* Days Active — solid calm blue */}
          <div
            className={`rounded-xl bg-[#3B82F6] p-4 cursor-pointer text-white
              hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200
              shadow-[0_4px_14px_rgba(59,130,246,0.2)]`}
          >
            <Calendar className="h-6 w-6 mb-2 opacity-90" />
            <div className="text-3xl font-black leading-none">{activeDays.size}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-75">Days Active</div>
          </div>

          {/* Time — solid muted purple */}
          <div
            className={`rounded-xl bg-[#7C5CFC] p-4 cursor-pointer text-white
              hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200
              shadow-[0_4px_14px_rgba(124,92,252,0.2)]`}
          >
            <Clock className="h-6 w-6 mb-2 opacity-90" />
            <div className="text-3xl font-black leading-none">--</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-75">Time</div>
          </div>

          {/* Accuracy — solid green */}
          <div
            className={`rounded-xl bg-[#22C55E] p-4 cursor-pointer text-white
              hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200
              shadow-[0_4px_14px_rgba(34,197,94,0.2)]`}
          >
            <Target className="h-6 w-6 mb-2 opacity-90" />
            <div className="text-3xl font-black leading-none">{stats.accuracy}%</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-75">Accuracy</div>
          </div>
        </div>

        {/* ── ROW 2: Activity Calendar + Widgets ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">

          {/* Calendar widget */}
          <div className={`lg:col-span-1 rounded-2xl bg-white border border-[#E5E7EB] p-4 ${cardShadow}`}>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#3B82F6]" />
                Activity
              </h3>
              <span className="text-[10px] font-bold text-gray-400">{monthName}</span>
            </div>

            <div className="grid grid-cols-7 gap-0.5 mb-0.5">
              {DAYS.map((d, i) => (
                <div key={i} className="text-center text-[8px] font-bold text-gray-300">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}
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
                        ? "bg-[#3B82F6] text-white shadow-sm"
                        : isActive
                          ? "bg-[#DCFCE7] text-[#16A34A] font-extrabold"
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

            <div className="flex items-center gap-4 mt-2.5 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#DCFCE7] border border-[#86EFAC]" />
                <span className="text-[8px] font-bold text-gray-400">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                <span className="text-[8px] font-bold text-gray-400">Today</span>
              </div>
            </div>
          </div>

          {/* Right: stacked widgets */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Daily Challenge */}
            <div className={`rounded-xl bg-white border border-[#E5E7EB] p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${cardShadow}`}>
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#EF8E00] text-white flex items-center justify-center mb-2.5 shadow-sm">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <h4 className="text-sm font-extrabold text-gray-800 mb-0.5">Daily Challenge</h4>
              <p className="text-xs text-gray-400 mb-2.5">Quick challenge for bonus XP</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-[#D4A017]">+50 XP</span>
                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">Coming Soon</span>
              </div>
            </div>

            {/* Level Progress */}
            <div className={`rounded-2xl bg-white border border-[#E5E7EB] p-4 ${cardShadow}`}>
              <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-[#22C55E]" />
                Level Progress
              </h4>
              <div className="flex items-center gap-4">
                {/* Accuracy ring */}
                <div className="relative h-[72px] w-[72px] flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F3F4F6" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.5" fill="none"
                      stroke="#22C55E" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${stats.accuracy} ${100 - stats.accuracy}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-black text-gray-800 leading-none">{stats.accuracy}%</span>
                    <span className="text-[7px] font-bold text-gray-400 uppercase">Accuracy</span>
                  </div>
                </div>
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div>
                    <div className="text-lg font-black text-gray-800 leading-none">{stats.completedLessons}</div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Lessons Done</div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-gray-800 leading-none">{stats.weeksCompleted}/12</div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Weeks Cleared</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Wins — spans both columns on md */}
            <div className={`md:col-span-2 rounded-xl bg-white border border-[#E5E7EB] p-4 ${cardShadow}`}>
              <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Star className="h-3.5 w-3.5 text-[#D4A017]" />
                Your Wins
              </h4>
              <div className="flex flex-wrap gap-2">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#F9FAFB] rounded-lg px-3 py-2 border border-[#F3F4F6]">
                    <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                    <span className="text-xs font-semibold text-gray-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
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
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isActive
                      ? "bg-[#7C5CFC] text-white"
                      : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <realm.icon className="h-4 w-4" />
                  </div>
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
