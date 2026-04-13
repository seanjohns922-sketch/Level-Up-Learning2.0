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
];

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function getMonthGrid() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday start
  const monthName = now.toLocaleString("default", { month: "short" });
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
    // Load active days from localStorage
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
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex flex-col">
      <div className="max-w-lg mx-auto w-full px-4 pt-3 pb-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => router.back()}
            className="h-7 w-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition"
            aria-label="Back"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <h1 className="text-base font-black text-white tracking-tight">Your Journey</h1>
        </div>

        {/* Identity row — compact horizontal */}
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-900/30 to-teal-900/20 border border-emerald-500/15 px-4 py-3 mb-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-lg font-black text-white shadow-md flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-black text-white truncate">{studentName}</h2>
            <p className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">
              Numbot {levelTitle} · Level {levelNum}
            </p>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/20 animate-[pulse_3s_ease-in-out_infinite]">
            <Zap className="h-3 w-3 text-amber-400" />
            <span className="text-[11px] font-extrabold text-amber-300">{stats.xp.toLocaleString()}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {[
            { icon: Flame, label: "Streak", value: "0d", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/15" },
            { icon: Calendar, label: "Active", value: "—", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/15" },
            { icon: Clock, label: "Time", value: "—", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/15" },
            { icon: Target, label: "Accuracy", value: `${stats.accuracy}%`, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/15" },
          ].map((m) => (
            <div key={m.label} className={`rounded-xl ${m.bg} border ${m.border} p-2 text-center hover:scale-105 transition-transform duration-200`}>
              <m.icon className={`h-3.5 w-3.5 ${m.color} mx-auto mb-0.5`} />
              <div className={`text-xs font-black ${m.color}`}>{m.value}</div>
              <div className="text-[8px] font-bold text-white/30 uppercase tracking-wider">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Two-column: Calendar + Realm progress */}
        <div className="grid grid-cols-2 gap-2.5 mb-3 flex-1 min-h-0">
          {/* Monthly Activity Calendar */}
          <div className="rounded-2xl bg-white/5 border border-white/8 p-3 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest">Activity</h3>
              <span className="text-[10px] font-bold text-white/40">{monthName}</span>
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-px mb-1">
              {DAYS.map((d, i) => (
                <div key={i} className="text-center text-[8px] font-bold text-white/25">{d}</div>
              ))}
            </div>
            {/* Date grid */}
            <div className="grid grid-cols-7 gap-px flex-1">
              {Array.from({ length: offset }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === today;
                const isActive = activeDays.has(day);
                return (
                  <div
                    key={day}
                    className={`flex items-center justify-center rounded-full text-[9px] font-bold aspect-square transition-colors
                      ${isToday ? "bg-emerald-500 text-white ring-1 ring-emerald-400/50" : ""}
                      ${isActive && !isToday ? "bg-emerald-500/30 text-emerald-300" : ""}
                      ${!isActive && !isToday ? "text-white/20" : ""}
                    `}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3 mt-1.5 pt-1.5 border-t border-white/5">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500/30" />
                <span className="text-[8px] font-bold text-white/30">Active</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[8px] font-bold text-white/30">Today</span>
              </div>
            </div>
          </div>

          {/* Realm Progress — compact */}
          <div className="rounded-2xl bg-white/5 border border-white/8 p-3 flex flex-col">
            <h3 className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest mb-2">Realms</h3>
            <div className="space-y-1.5 flex-1">
              {REALMS.map((realm) => {
                const isActive = realm.status === "active";
                const isComingSoon = realm.status === "coming-soon";
                return (
                  <div key={realm.name} className={`flex items-center gap-2 ${!isActive ? "opacity-35" : ""}`}>
                    <span className="text-sm">{realm.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[11px] font-bold block truncate ${isActive ? "text-white/85" : "text-white/50"}`}>
                        {realm.name}
                      </span>
                      {isActive && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                              style={{ width: `${stats.realmProgress}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-extrabold text-emerald-400">{stats.realmProgress}%</span>
                        </div>
                      )}
                    </div>
                    {!isActive && (
                      <div className="flex-shrink-0">
                        {isComingSoon ? (
                          <Sparkles className="h-3 w-3 text-amber-400/50" />
                        ) : (
                          <Lock className="h-3 w-3 text-white/15" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coming Soon — compact footer */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/6 px-4 py-2.5 flex items-center gap-4 opacity-50">
          <Lock className="h-3.5 w-3.5 text-white/25 flex-shrink-0" />
          <div className="flex items-center gap-3 flex-1">
            {[
              { icon: Users, label: "Friends", color: "text-sky-500/40" },
              { icon: Swords, label: "Battles", color: "text-rose-500/40" },
              { icon: Medal, label: "Rankings", color: "text-amber-500/40" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                <span className="text-[9px] font-bold text-white/25 uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>
          <span className="text-[8px] font-bold text-white/20 uppercase tracking-wider whitespace-nowrap">Soon</span>
        </div>
      </div>
    </main>
  );
}
