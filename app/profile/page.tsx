"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readProgress } from "@/data/progress";
import { readProgramStore, getWeekProgress, isWeekComplete } from "@/lib/program-progress";
import { ChevronLeft, Zap, Flame, Clock, Target, Calendar, Lock, Sparkles, ChevronRight, BookOpen, Trophy, Users, Swords, Medal } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [progress, setProgress] = useState<ReturnType<typeof readProgress>>(null);
  const [store, setStore] = useState<ReturnType<typeof readProgramStore>>({});
  const [studentName, setStudentName] = useState("Adventurer");

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
  }, []);

  const year = progress?.year ?? "Year 1";
  const levelNum = parseInt(year.replace(/\D/g, ""), 10) || 1;

  const stats = useMemo(() => {
    let xp = 0;
    let completedLessons = 0;
    let weeksCompleted = 0;
    let quizCount = 0;
    let quizTotal = 0;
    let realmsUnlocked = 1; // Number Nexus always unlocked

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

    return { xp, completedLessons, accuracy, weeksCompleted, realmProgress, realmsUnlocked };
  }, [store, year, progress]);

  const levelTitle = levelNum <= 2 ? "Apprentice" : levelNum <= 4 ? "Processor" : "Master";
  const initials = studentName.charAt(0).toUpperCase();

  // Build recent activity
  const recentActivity = useMemo(() => {
    const items: { icon: string; text: string; color: string }[] = [];
    if (stats.completedLessons > 0) items.push({ icon: "✅", text: `Completed ${stats.completedLessons} lesson${stats.completedLessons > 1 ? "s" : ""}`, color: "text-emerald-400" });
    if (stats.accuracy > 0) items.push({ icon: "⭐", text: `Accuracy at ${stats.accuracy}%`, color: "text-amber-400" });
    if (stats.weeksCompleted > 0) items.push({ icon: "🏆", text: `${stats.weeksCompleted} week${stats.weeksCompleted > 1 ? "s" : ""} completed`, color: "text-sky-400" });
    if (stats.xp > 0) items.push({ icon: "⚡", text: `Earned ${stats.xp.toLocaleString()} XP total`, color: "text-amber-300" });
    if (items.length === 0) items.push({ icon: "🚀", text: "Start your first lesson to begin!", color: "text-white/60" });
    return items;
  }, [stats]);

  const REALMS = [
    { name: "Number Nexus", icon: "🔢", status: "active" as const },
    { name: "Reading Ridge", icon: "📖", status: "coming-soon" as const },
    { name: "Inkwell Wilds", icon: "✒️", status: "locked" as const },
    { name: "Measurelands", icon: "📐", status: "locked" as const },
    { name: "Statistica", icon: "📊", status: "locked" as const },
    { name: "Chance Hollow", icon: "🎲", status: "locked" as const },
    { name: "Pattern Peaks", icon: "🔷", status: "locked" as const },
    { name: "Chronorok", icon: "⏳", status: "locked" as const },
    { name: "Starpath Realm", icon: "⭐", status: "locked" as const },
    { name: "Runehaven Peaks", icon: "📜", status: "locked" as const },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-lg mx-auto px-5 pt-4 pb-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="h-8 w-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition"
            aria-label="Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-black text-white tracking-tight">Your Journey</h1>
        </div>

        {/* Identity card */}
        <div
          className="rounded-2xl bg-gradient-to-br from-emerald-900/40 to-teal-900/30 backdrop-blur-xl border border-emerald-500/15 p-5 mb-4 text-center"
          style={{ boxShadow: "0 0 30px rgba(16,185,129,0.08), 0 4px 20px rgba(0,0,0,0.2)" }}
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-3 text-2xl font-black text-white shadow-lg">
            {initials}
          </div>
          <h2 className="text-xl font-black text-white mb-0.5">{studentName}</h2>
          <p className="text-xs font-bold text-emerald-400/80 uppercase tracking-widest mb-2">
            Numbot {levelTitle} · Level {levelNum}
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/20 animate-[pulse_3s_ease-in-out_infinite]">
            <Zap className="h-3 w-3 text-amber-400" />
            <span className="text-xs font-extrabold text-amber-300">{stats.xp.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { icon: Flame, label: "Streak", value: "0d", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/15" },
            { icon: Calendar, label: "Active", value: "—", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/15" },
            { icon: Clock, label: "Time", value: "—", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/15" },
            { icon: Target, label: "Accuracy", value: `${stats.accuracy}%`, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/15" },
          ].map((m) => (
            <div key={m.label} className={`rounded-xl ${m.bg} border ${m.border} p-2.5 text-center cursor-pointer hover:scale-105 transition-transform duration-200`}>
              <m.icon className={`h-4 w-4 ${m.color} mx-auto mb-1`} />
              <div className={`text-sm font-black ${m.color}`}>{m.value}</div>
              <div className="text-[9px] font-bold text-white/30 uppercase tracking-wider">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Your Journey stats */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/8 p-4 mb-4">
          <h3 className="text-xs font-extrabold text-white/70 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            Your Journey
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Total XP", value: stats.xp.toLocaleString(), icon: "⚡" },
              { label: "Lessons Done", value: `${stats.completedLessons}`, icon: "📖" },
              { label: "Realms Unlocked", value: `${stats.realmsUnlocked}`, icon: "🌍" },
              { label: "Weeks Cleared", value: `${stats.weeksCompleted}`, icon: "🏅" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/5 border border-white/6 p-3 flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <div className="text-sm font-black text-white/90">{item.value}</div>
                  <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Realm breakdown */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/8 overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-white/6">
            <h3 className="text-xs font-extrabold text-white/70 uppercase tracking-widest">Realm Progress</h3>
          </div>
          <div className="divide-y divide-white/5">
            {REALMS.map((realm) => {
              const isActive = realm.status === "active";
              const isComingSoon = realm.status === "coming-soon";
              return (
                <div key={realm.name} className={`flex items-center gap-3 px-4 py-3 ${!isActive ? "opacity-40" : ""}`}>
                  <span className="text-lg">{realm.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-bold block truncate ${isActive ? "text-white/90" : "text-white/50"}`}>
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
                  <div className="flex-shrink-0">
                    {isActive ? (
                      <ChevronRight className="h-4 w-4 text-white/30" />
                    ) : isComingSoon ? (
                      <Sparkles className="h-3.5 w-3.5 text-amber-400/60" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-white/20" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/8 p-4 mb-4">
          <h3 className="text-xs font-extrabold text-white/70 uppercase tracking-widest mb-3 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-teal-400" />
            Recent Activity
          </h3>
          <div className="space-y-2.5">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-white/3 border border-white/5 px-3 py-2.5">
                <span className="text-base">{item.icon}</span>
                <span className={`text-sm font-semibold ${item.color}`}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon: Social */}
        <div className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/6 p-4 opacity-60">
          <h3 className="text-xs font-extrabold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-white/30" />
            Coming Soon
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Users, label: "Friends", color: "text-sky-500/40" },
              { icon: Swords, label: "Battles", color: "text-rose-500/40" },
              { icon: Medal, label: "Rankings", color: "text-amber-500/40" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/3 border border-white/5 p-3 text-center">
                <item.icon className={`h-5 w-5 ${item.color} mx-auto mb-1.5`} />
                <div className="text-[10px] font-bold text-white/25 uppercase tracking-wider">{item.label}</div>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-medium text-white/25 text-center mt-2.5">Unlock in a future update</p>
        </div>
      </div>
    </main>
  );
}
