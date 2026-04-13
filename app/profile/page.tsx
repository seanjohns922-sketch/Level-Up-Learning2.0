"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readProgress } from "@/data/progress";
import { readProgramStore, getWeekProgress, isWeekComplete } from "@/lib/program-progress";
import { ChevronLeft, Zap, Flame, Clock, Target, Calendar, Lock, Sparkles, ChevronRight, Users, Swords, Medal } from "lucide-react";

const REALMS = [
  { name: "Number Nexus", icon: "🔢", status: "active" as const },
  { name: "Reading Ridge", icon: "📖", status: "coming-soon" as const },
  { name: "Inkwell Wilds", icon: "✒️", status: "locked" as const },
  { name: "Measurelands", icon: "📐", status: "locked" as const },
  { name: "Statistica", icon: "📊", status: "locked" as const },
  { name: "Chance Hollow", icon: "🎲", status: "locked" as const },
  { name: "Pattern Peaks", icon: "🔷", status: "locked" as const },
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

  const levelTitle = levelNum <= 2 ? "Apprentice" : levelNum <= 4 ? "Processor" : "Master";
  const initials = studentName.charAt(0).toUpperCase();
  const { offset, daysInMonth, today, monthName } = useMemo(getMonthGrid, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="w-full px-6 md:px-10 lg:px-16 xl:px-24 pt-5 pb-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="h-9 w-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition"
              aria-label="Back"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Your Journey</h1>
              <p className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest">Progress Dashboard</p>
            </div>
          </div>

          {/* Identity pill */}
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-900/30 to-teal-900/20 border border-emerald-500/15 px-5 py-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-base font-black text-white shadow-md">
              {initials}
            </div>
            <div>
              <h2 className="text-sm font-black text-white">{studentName}</h2>
              <p className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-widest">
                Numbot {levelTitle} · Lvl {levelNum}
              </p>
            </div>
            <div className="ml-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/20 animate-[pulse_3s_ease-in-out_infinite]">
              <Zap className="h-3 w-3 text-amber-400" />
              <span className="text-[11px] font-extrabold text-amber-300">{stats.xp.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── Stats Row (full width) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Flame, label: "Current Streak", value: "0 days", color: "text-rose-400", bg: "from-rose-500/15 to-pink-500/10", border: "border-rose-500/15", glow: "shadow-[0_0_20px_rgba(244,63,94,0.08)]" },
            { icon: Calendar, label: "Days Active", value: "—", color: "text-sky-400", bg: "from-sky-500/15 to-blue-500/10", border: "border-sky-500/15", glow: "shadow-[0_0_20px_rgba(14,165,233,0.08)]" },
            { icon: Clock, label: "Time This Week", value: "—", color: "text-purple-400", bg: "from-purple-500/15 to-violet-500/10", border: "border-purple-500/15", glow: "shadow-[0_0_20px_rgba(168,85,247,0.08)]" },
            { icon: Target, label: "Accuracy", value: `${stats.accuracy}%`, color: "text-emerald-400", bg: "from-emerald-500/15 to-teal-500/10", border: "border-emerald-500/15", glow: "shadow-[0_0_20px_rgba(16,185,129,0.08)]" },
          ].map((m) => (
            <div
              key={m.label}
              className={`rounded-2xl bg-gradient-to-br ${m.bg} border ${m.border} ${m.glow} p-5 hover:scale-[1.02] transition-transform duration-200 cursor-pointer`}
            >
              <div className={`h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center mb-3 ${m.color}`}>
                <m.icon className="h-4.5 w-4.5" />
              </div>
              <div className={`text-2xl font-black ${m.color} leading-none`}>{m.value}</div>
              <div className="text-[10px] font-bold text-white/35 uppercase tracking-wider mt-1">{m.label}</div>
            </div>
          ))}
        </div>

        {/* ── Main Grid: Calendar + Realms ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">

          {/* Activity Calendar — hero panel */}
          <div
            className="lg:col-span-3 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/8 p-6"
            style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.15)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-extrabold text-white/80 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-400" />
                Monthly Activity
              </h3>
              <span className="text-xs font-bold text-white/40">{monthName}</span>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {DAYS.map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-white/30">{d}</div>
              ))}
            </div>

            {/* Date grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: offset }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === today;
                const isActive = activeDays.has(day);
                const isPast = day < today;
                return (
                  <div
                    key={day}
                    className={`flex items-center justify-center rounded-xl aspect-square text-xs font-bold transition-all duration-200
                      ${isToday
                        ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] ring-2 ring-emerald-400/30"
                        : isActive
                          ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/20"
                          : isPast
                            ? "text-white/15"
                            : "text-white/10"
                      }
                    `}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mt-4 pt-3 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/25 border border-emerald-500/20" />
                <span className="text-[10px] font-bold text-white/35">Attempted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                <span className="text-[10px] font-bold text-white/35">Today</span>
              </div>
              <div className="ml-auto text-[10px] font-bold text-white/25">
                Max streak: 0 days 🔥
              </div>
            </div>
          </div>

          {/* Realm Progress — tall panel */}
          <div
            className="lg:col-span-2 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/8 p-6 flex flex-col"
            style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.15)" }}
          >
            <h3 className="text-sm font-extrabold text-white/80 mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Realm Progress
            </h3>
            <div className="space-y-1 flex-1">
              {REALMS.map((realm) => {
                const isActive = realm.status === "active";
                const isComingSoon = realm.status === "coming-soon";
                return (
                  <div
                    key={realm.name}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200
                      ${isActive ? "bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer" : "opacity-35"}
                    `}
                  >
                    <span className="text-base">{realm.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-bold block truncate ${isActive ? "text-white/85" : "text-white/50"}`}>
                        {realm.name}
                      </span>
                      {isActive && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                              style={{ width: `${stats.realmProgress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-extrabold text-emerald-400">{stats.realmProgress}%</span>
                        </div>
                      )}
                    </div>
                    {!isActive && (
                      <div className="flex-shrink-0">
                        {isComingSoon ? (
                          <Sparkles className="h-3.5 w-3.5 text-amber-400/50" />
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-white/15" />
                        )}
                      </div>
                    )}
                    {isActive && <ChevronRight className="h-4 w-4 text-white/20 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Coming Soon Bar (full width) ── */}
        <div className="rounded-2xl bg-white/[0.025] border border-white/6 px-6 py-4 flex items-center justify-center gap-8 opacity-50">
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
          <div className="flex items-center gap-1.5 ml-4 pl-4 border-l border-white/8">
            <Lock className="h-3 w-3 text-white/20" />
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Coming Soon</span>
          </div>
        </div>

      </div>
    </main>
  );
}
