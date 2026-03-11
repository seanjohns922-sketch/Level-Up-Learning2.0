"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Sparkles, ChevronRight, Zap, Clock, Mountain, Compass, Triangle, BarChart3, Dices, BookOpen, Feather, Languages } from "lucide-react";
import { getAllLegends } from "@/data/legends";
import { readProgress, type StudentProgress } from "@/data/progress";

type RealmDef = {
  id: string;
  name: string;
  legendLine: string;
  icon: React.ReactNode;
  totalLegends: number;
  status: "open" | "coming-soon" | "locked";
  route?: string;
  gradient: string;
  borderColor: string;
  iconBg: string;
};

const REALMS: RealmDef[] = [
  {
    id: "number-nexus",
    name: "Number Nexus",
    legendLine: "Numbots",
    icon: <Zap className="h-6 w-6" />,
    totalLegends: 7,
    status: "open",
    route: "/legends/number",
    gradient: "from-teal-500/15 to-emerald-500/10",
    borderColor: "border-teal-400/40",
    iconBg: "bg-teal-500/15 text-teal-500",
  },
  {
    id: "chronorok",
    name: "Chronorok",
    legendLine: "Time Legends",
    icon: <Clock className="h-6 w-6" />,
    totalLegends: 7,
    status: "coming-soon",
    gradient: "from-amber-500/10 to-orange-500/5",
    borderColor: "border-amber-400/30",
    iconBg: "bg-amber-500/10 text-amber-500",
  },
  {
    id: "measurelands",
    name: "Measurelands",
    legendLine: "Measure Titans",
    icon: <Mountain className="h-6 w-6" />,
    totalLegends: 7,
    status: "locked",
    gradient: "from-slate-500/5 to-slate-500/5",
    borderColor: "border-border",
    iconBg: "bg-muted text-muted-foreground",
  },
  {
    id: "starpath-realm",
    name: "Starpath Realm",
    legendLine: "Star Navigators",
    icon: <Compass className="h-6 w-6" />,
    totalLegends: 7,
    status: "locked",
    gradient: "from-slate-500/5 to-slate-500/5",
    borderColor: "border-border",
    iconBg: "bg-muted text-muted-foreground",
  },
  {
    id: "pattern-peaks",
    name: "Pattern Peaks",
    legendLine: "Pattern Weavers",
    icon: <Triangle className="h-6 w-6" />,
    totalLegends: 7,
    status: "locked",
    gradient: "from-slate-500/5 to-slate-500/5",
    borderColor: "border-border",
    iconBg: "bg-muted text-muted-foreground",
  },
  {
    id: "statistica",
    name: "Statistica",
    legendLine: "Data Guardians",
    icon: <BarChart3 className="h-6 w-6" />,
    totalLegends: 7,
    status: "locked",
    gradient: "from-slate-500/5 to-slate-500/5",
    borderColor: "border-border",
    iconBg: "bg-muted text-muted-foreground",
  },
  {
    id: "chance-hollow",
    name: "Chance Hollow",
    legendLine: "Fortune Seekers",
    icon: <Dices className="h-6 w-6" />,
    totalLegends: 7,
    status: "locked",
    gradient: "from-slate-500/5 to-slate-500/5",
    borderColor: "border-border",
    iconBg: "bg-muted text-muted-foreground",
  },
  {
    id: "reading-ridge",
    name: "Reading Ridge",
    legendLine: "Lore Keepers",
    icon: <BookOpen className="h-6 w-6" />,
    totalLegends: 7,
    status: "locked",
    gradient: "from-slate-500/5 to-slate-500/5",
    borderColor: "border-border",
    iconBg: "bg-muted text-muted-foreground",
  },
  {
    id: "inkwell-wilds",
    name: "Inkwell Wilds",
    legendLine: "Script Spirits",
    icon: <Feather className="h-6 w-6" />,
    totalLegends: 7,
    status: "locked",
    gradient: "from-slate-500/5 to-slate-500/5",
    borderColor: "border-border",
    iconBg: "bg-muted text-muted-foreground",
  },
  {
    id: "runehaven-peaks",
    name: "Runehaven Peaks",
    legendLine: "Rune Masters",
    icon: <Languages className="h-6 w-6" />,
    totalLegends: 7,
    status: "locked",
    gradient: "from-slate-500/5 to-slate-500/5",
    borderColor: "border-border",
    iconBg: "bg-muted text-muted-foreground",
  },
];

function RealmCard({ realm, collected, onClick }: { realm: RealmDef; collected: number; onClick?: () => void }) {
  const isOpen = realm.status === "open";
  const isComingSoon = realm.status === "coming-soon";
  const isLocked = realm.status === "locked";

  return (
    <button
      onClick={isOpen ? onClick : undefined}
      disabled={!isOpen}
      className={`relative w-full rounded-2xl border-2 text-left p-5 transition-all duration-300 overflow-hidden group ${
        isOpen
          ? `bg-gradient-to-br ${realm.gradient} ${realm.borderColor} hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-500/10 cursor-pointer`
          : isComingSoon
          ? `bg-gradient-to-br ${realm.gradient} ${realm.borderColor} opacity-80 cursor-default`
          : "bg-card border-border opacity-50 cursor-default"
      }`}
    >
      {/* Shine on hover for open realms */}
      {isOpen && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000" />
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${realm.iconBg}`}>
          {isLocked ? <Lock className="h-5 w-5" /> : realm.icon}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-extrabold text-lg leading-tight ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
            {realm.name}
          </h3>
          <p className={`text-sm mt-0.5 ${isLocked ? "text-muted-foreground/60" : "text-muted-foreground"}`}>
            {isLocked ? "Future Realm" : isComingSoon ? `Coming Soon: ${realm.legendLine}` : `${realm.legendLine}`}
          </p>

          <div className="mt-3">
            {isOpen && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary">
                  {collected} / {realm.totalLegends} collected
                </span>
                <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            )}
            {isComingSoon && (
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-amber-500/15 text-amber-600">
                <Sparkles className="h-3 w-3" /> Coming Soon
              </span>
            )}
            {isLocked && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground/60">
                <Lock className="h-3 w-3" /> Unlock in future updates
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function LegendsPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<StudentProgress | null>(null);

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  const unlockedIds = progress?.unlockedLegends ?? [];

  const numbotCollected = useMemo(() => {
    const all = getAllLegends();
    return all.filter((l) => unlockedIds.includes(l.id)).length;
  }, [unlockedIds]);

  const totalCollected = numbotCollected; // Only numbots for now
  const totalLegends = REALMS.reduce((sum, r) => sum + r.totalLegends, 0);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-card">
        <div className="absolute inset-0 pointer-events-none">
          {["⭐", "🏆", "✨", "🎖️", "💎", "🌟"].map((emoji, i) => (
            <span
              key={i}
              className="absolute text-2xl opacity-10"
              style={{
                top: `${12 + i * 14}%`,
                left: `${8 + i * 16}%`,
                transform: `rotate(${i * 25 - 50}deg)`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <div className="relative max-w-3xl mx-auto px-6 pt-6 pb-10">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push("/home")}
              className="text-sm font-bold text-primary hover:text-primary/80 transition flex items-center gap-1"
            >
              ← Home
            </button>
            <div className="text-sm font-bold text-muted-foreground bg-card px-4 py-1.5 rounded-full border border-border shadow-sm">
              My Legends
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Level Up Legends
          </h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-lg">
            Unlock powerful legends across the realms of knowledge.
          </p>

          {/* Overall progress */}
          <div className="mt-6 max-w-sm">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-bold text-foreground">{totalCollected} / {totalLegends} total legends</span>
              <span className="font-bold text-accent">{Math.round((totalCollected / totalLegends) * 100)}%</span>
            </div>
            <div className="h-3 rounded-full bg-card border border-border overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-accent transition-all duration-700"
                style={{ width: `${(totalCollected / totalLegends) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 40" fill="none" preserveAspectRatio="none" style={{ height: 40 }}>
          <path d="M0 40V20C240 0 480 0 720 20C960 40 1200 40 1440 20V40H0Z" fill="hsl(var(--background))" />
        </svg>
      </div>

      {/* Realm Grid */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {REALMS.map((realm) => (
            <RealmCard
              key={realm.id}
              realm={realm}
              collected={realm.id === "number-nexus" ? numbotCollected : 0}
              onClick={realm.route ? () => router.push(realm.route!) : undefined}
            />
          ))}
        </div>

        {/* Tip */}
        <div className="mt-10 rounded-2xl border-2 border-accent/20 bg-accent/5 p-5 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div>
            <div className="font-bold text-foreground mb-0.5">How to unlock Legends</div>
            <div className="text-sm text-muted-foreground">
              Complete lessons in each realm to collect powerful legends. Pass the pre-test or finish the full 12-week program to unlock a Legend!
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
