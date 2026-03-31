"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLegendForYear } from "@/data/legends";
import { readProgress, StudentProgress, writeProgress, ACTIVE_STUDENT_KEY } from "@/data/progress";
import { supabase } from "@/lib/supabase";
import LegendUnlockReveal from "@/components/LegendUnlockReveal";
import type { AssessmentResultProfile } from "@/data/assessments/analysis";
const PASS_THRESHOLD = 90;

function getLowestRecommendedWeek(profile: AssessmentResultProfile | null) {
  if (!profile?.recommendedWeeks?.length) return undefined;
  return Math.min(...profile.recommendedWeeks);
}

function getAssignedReviewWeek(profile: AssessmentResultProfile | null) {
  return profile?.assignedWeek ?? getLowestRecommendedWeek(profile);
}

function getStrandBadgeClass(strand?: string) {
  switch (strand) {
    case "fractions":
      return "bg-violet-100 text-violet-700 border-violet-200";
    case "patterns":
      return "bg-sky-100 text-sky-700 border-sky-200";
    case "multiplication_division":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "addition_subtraction":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-teal-100 text-teal-700 border-teal-200";
  }
}

function getStrandLabel(strand?: string) {
  switch (strand) {
    case "fractions":
      return "Fractions";
    case "patterns":
      return "Patterns";
    case "multiplication_division":
      return "Multiplication & Division";
    case "addition_subtraction":
      return "Addition & Subtraction";
    default:
      return "Number";
  }
}

export default function ResultsPageWrapper() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>}><ResultsPage /></Suspense>;
}

/* ── animated circular progress ring ── */
function ScoreRing({ percent, passed }: { percent: number; passed: boolean }) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const radius = 80;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercent / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercent(percent), 200);
    return () => clearTimeout(timer);
  }, [percent]);

  const ringColor = passed ? "hsl(var(--primary))" : "hsl(var(--accent))";

  return (
    <div className="relative flex items-center justify-center my-6">
      {/* glow behind */}
      <div
        className="absolute w-48 h-48 rounded-full blur-2xl opacity-30"
        style={{ background: ringColor }}
      />
      <svg width="200" height="200" className="relative z-10 -rotate-90">
        <circle
          cx="100" cy="100" r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
        />
        <circle
          cx="100" cy="100" r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute z-20 text-center">
        <div className="text-5xl font-extrabold font-display" style={{ color: ringColor }}>
          {percent}%
        </div>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
          Score
        </div>
      </div>
    </div>
  );
}

/* ── decorative floating shapes (deterministic to avoid hydration mismatch) ── */
const SHAPES = [
  { w: 32, h: 28, l: 12, t: 15, dur: 4.2, del: 0.3 },
  { w: 48, h: 44, l: 78, t: 8, dur: 5.1, del: 1.2 },
  { w: 24, h: 36, l: 45, t: 62, dur: 3.8, del: 0.7 },
  { w: 40, h: 30, l: 88, t: 35, dur: 6.0, del: 1.6 },
  { w: 28, h: 42, l: 22, t: 80, dur: 4.5, del: 0.5 },
  { w: 52, h: 38, l: 60, t: 50, dur: 5.5, del: 1.0 },
  { w: 36, h: 46, l: 35, t: 25, dur: 3.5, del: 1.4 },
  { w: 44, h: 34, l: 70, t: 72, dur: 6.5, del: 0.9 },
];

function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {SHAPES.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-10"
          style={{
            width: `${s.w}px`,
            height: `${s.h}px`,
            background: i % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))",
            left: `${s.l}%`,
            top: `${s.t}%`,
            animation: `floatShape ${s.dur}s ease-in-out infinite alternate`,
            animationDelay: `${s.del}s`,
          }}
        />
      ))}
    </div>
  );
}

function ResultsPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const year = sp.get("year") ?? "Year 3";
  const score = Number(sp.get("score") ?? "0");
  const total = Number(sp.get("total") ?? "0");
  const source = sp.get("source") ?? "pretest";
  const isPostTest = sp.get("posttest") === "1";

  const scorePercent = useMemo(() => {
    if (!total || total <= 0) return 0;
    return Math.round((score / total) * 100);
  }, [score, total]);

  const passedByPretest = scorePercent >= PASS_THRESHOLD;
  const passedByProgram = source === "program_complete";
  const passed = passedByPretest || passedByProgram;
  const displayPercent = passedByProgram ? 100 : scorePercent;

  const legend = useMemo(() => getLegendForYear(year), [year]);
  const storedPosttestProfile: AssessmentResultProfile | null = useMemo(() => {
    const progress = readProgress();
    return isPostTest ? progress?.lastPostTestProfile ?? null : null;
  }, [isPostTest, year, scorePercent, total]);

  const [showUnlock, setShowUnlock] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prev = readProgress();
    const prevUnlocked = prev?.unlockedLegends ?? [];
    const alreadyUnlocked = prevUnlocked.includes(legend.id);

    let next: StudentProgress;

    if (passed) {
      const unlocked = alreadyUnlocked ? prevUnlocked : [...prevUnlocked, legend.id];
      next = {
        ...prev,
        year,
        scorePercent: passedByProgram ? Math.max(prev?.scorePercent ?? 0, 90) : scorePercent,
        status: "PASSED",
        unlockedLegends: unlocked,
      };
    } else {
      next = {
        ...prev,
        year,
        scorePercent,
        status: "ASSIGNED_PROGRAM",
        assignedWeek: isPostTest ? getLowestRecommendedWeek(storedPosttestProfile) ?? 1 : 1,
        unlockedLegends: prevUnlocked,
      };
    }

    writeProgress(next);

    (async () => {
      try {
        if (isPostTest || passedByProgram) return;
        const studentId = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_STUDENT_KEY) : null;
        if (!studentId) return;
        const { error } = await supabase
          .from("progress")
          .upsert(
            {
              student_id: studentId,
              year,
              pretest_score: scorePercent,
              status: next.status === "PASSED" ? "PASSED" : "ASSIGNED_PROGRAM",
              week: next.assignedWeek ?? null,
            },
            { onConflict: "student_id,year" }
          );
        if (error) console.warn("[Results] DB pretest save error:", error);
      } catch (e) {
        console.warn("[Results] DB pretest save failed:", e);
      }
    })();

    if (passed && !alreadyUnlocked) {
      setJustUnlocked(true);
      setShowUnlock(true);
    } else {
      setJustUnlocked(false);
      setShowUnlock(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passed, year, scorePercent, legend.id, isPostTest, passedByProgram, storedPosttestProfile]);

  function goHome() { router.push("/home"); }
  function goProgram() {
    const qs = new URLSearchParams({ year, week: "1" }).toString();
    router.push(`/program?${qs}`);
  }
  function goRetryPostTest() {
    router.push(`/posttest?year=${encodeURIComponent(year)}`);
  }
  function goLegends() { router.push("/legends"); }

  // Emoji + message based on score
  const getMessage = () => {
    if (passed) return { emoji: "🏆", title: "Amazing Work!", sub: "You crushed it!" };
    if (scorePercent >= 70) return { emoji: "💪", title: "So Close!", sub: "A little more practice and you'll nail it." };
    if (scorePercent >= 50) return { emoji: "🌱", title: "Good Start!", sub: "Let's build your skills with a personalised program." };
    return { emoji: "🚀", title: "Let's Level Up!", sub: "Your adventure is just beginning." };
  };
  const msg = getMessage();
  const topStrengths = storedPosttestProfile?.strengths?.slice(0, 3) ?? [];
  const topWeakAreas = storedPosttestProfile?.weakAreas?.slice(0, 3) ?? [];
  const assignedReviewWeek = getAssignedReviewWeek(storedPosttestProfile);

  function goAssignedWeek() {
    const week = assignedReviewWeek ?? 1;
    const qs = new URLSearchParams({ year, week: String(week) }).toString();
    router.push(`/program?${qs}`);
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <FloatingShapes />

      <div
        className="relative z-10 w-full max-w-lg"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.6s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Hero card */}
        <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-border/50">
          {/* Top gradient band */}
          <div
            className="h-2"
            style={{
              background: passed
                ? "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))"
                : "linear-gradient(90deg, hsl(var(--accent)), hsl(42 95% 65%))",
            }}
          />

          <div className="p-8 pb-6 text-center">
            {/* Emoji badge */}
            <div
              className="text-5xl mb-2"
              style={{
                animation: "bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both",
              }}
            >
              {msg.emoji}
            </div>

            <h1 className="text-2xl font-extrabold font-display text-foreground mb-1">
              {msg.title}
            </h1>
            <p className="text-sm text-muted-foreground mb-2">{msg.sub}</p>
            <div className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
              {year} • {isPostTest ? "Post-Test" : source === "program_complete" ? "Program" : "Pre-Test"}
            </div>

            <ScoreRing percent={displayPercent} passed={passed} />

            {/* Score breakdown */}
            <div className="flex items-center justify-center gap-6 text-sm mb-6">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-foreground">{score}</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-extrabold text-foreground">{total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-extrabold" style={{ color: passed ? "hsl(var(--primary))" : "hsl(var(--accent))" }}>
                  {passed ? "PASS" : "GROW"}
                </div>
                <div className="text-xs text-muted-foreground">Status</div>
              </div>
            </div>
          </div>

          {/* Info section */}
          <div className="px-8 pb-6 space-y-3">
            {passed ? (
              <div className="rounded-2xl bg-primary-light p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">✨</span>
                  <span className="font-bold text-sm text-foreground">Legend Unlocked!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isPostTest
                    ? "You passed the post-test — your Legend is ready to collect!"
                    : passedByProgram
                    ? "You completed the 12-week program — your Legend awaits!"
                    : "You aced the pre-test — your Legend is ready to collect!"}
                </p>
              </div>
            ) : isPostTest ? (
              <div className="rounded-2xl p-4 border border-accent/30" style={{ background: "hsl(42 95% 97%)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">💪</span>
                  <span className="font-bold text-sm text-foreground">Almost there!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  You need 90% to pass. Review the suggested weeks and try again when you&apos;re ready.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl p-4 border border-accent/30" style={{ background: "hsl(42 95% 97%)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">📚</span>
                  <span className="font-bold text-sm text-foreground">Learning Path Ready</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  We&apos;ve crafted a personalised 12-week program just for you.
                </p>
              </div>
            )}

            {isPostTest && storedPosttestProfile ? (
              <>
                {topStrengths.length > 0 ? (
                  <div className="rounded-2xl bg-secondary p-4">
                    <div className="font-bold text-sm text-foreground mb-2">You did well with</div>
                    <div className="space-y-2">
                      {topStrengths.map((item) => (
                        <div key={item.skillId} className="text-xs text-secondary-foreground">
                          {item.skillLabel}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {topWeakAreas.length > 0 ? (
                  <div className="rounded-2xl p-4 border border-accent/30" style={{ background: "hsl(42 95% 97%)" }}>
                    <div className="font-bold text-sm text-foreground mb-2">Focus on these next</div>
                    <div className="space-y-2">
                      {topWeakAreas.map((item) => (
                        <div key={item.skillId} className="rounded-xl bg-background/70 border border-border/60 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${getStrandBadgeClass(item.strand)}`}>
                              {getStrandLabel(item.strand)}
                            </span>
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              Week{item.linkedWeeks.length > 1 ? "s" : ""} {item.linkedWeeks.join(", ")}
                            </span>
                          </div>
                          <div className="text-xs text-foreground">
                            {item.skillLabel}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {!passed && storedPosttestProfile.recommendedWeeks.length > 0 ? (
                  <div className="rounded-2xl bg-secondary p-4">
                    <div className="font-bold text-sm text-foreground mb-2">Start here</div>
                    <div className="space-y-2">
                      {storedPosttestProfile.recommendedWeeks.slice(0, 3).map((week, index) => (
                        <div key={week} className="text-xs text-secondary-foreground">
                          {index === 0 ? `Start with Week ${week}` : `Then revisit Week ${week}`}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}

            {/* What's next */}
            <div className="rounded-2xl bg-secondary p-4">
              <div className="font-bold text-sm text-foreground mb-2">What&apos;s next?</div>
              <div className="space-y-2">
                {(isPostTest && !passed
                  ? [
                      { icon: "🔁", text: "Review any week's lessons" },
                      { icon: "📝", text: "Retry the post-test when ready" },
                      { icon: "🏅", text: "Score 90%+ to unlock your Legend" },
                    ]
                  : [
                      { icon: "📖", text: "3 lessons every week" },
                      { icon: "🧪", text: "1 quiz to test your skills" },
                      { icon: "🏅", text: "Legends unlock with mastery" },
                    ]
                ).map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-xs text-secondary-foreground">
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-8 pb-8 space-y-3">
            {passed ? (
              <>
                <button
                  onClick={goLegends}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
                  style={{ boxShadow: "0 8px 24px -8px hsl(var(--primary) / 0.4)" }}
                >
                  🏅 View My Legends
                </button>
                <button
                  onClick={goHome}
                  className="w-full py-3 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-muted transition-all active:scale-[0.98]"
                >
                  Back to Home
                </button>
              </>
            ) : isPostTest ? (
              <>
                <button
                  onClick={goRetryPostTest}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
                  style={{ boxShadow: "0 8px 24px -8px hsl(var(--primary) / 0.4)" }}
                >
                  🔄 Retry Post-Test
                </button>
                <button
                  onClick={goAssignedWeek}
                  className="w-full py-4 rounded-2xl font-bold text-base hover:opacity-90 transition-all active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--accent)), hsl(42 95% 60%))",
                    boxShadow: "0 8px 24px -8px hsl(var(--accent) / 0.4)",
                  }}
                >
                  📖 Start Week {assignedReviewWeek ?? 1}
                </button>
                <button
                  onClick={goHome}
                  className="w-full py-3 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-muted transition-all active:scale-[0.98]"
                >
                  Back to Home
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={goProgram}
                  className="w-full py-4 rounded-2xl font-bold text-base text-foreground hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--accent)), hsl(42 95% 60%))",
                    boxShadow: "0 8px 24px -8px hsl(var(--accent) / 0.4)",
                  }}
                >
                  🚀 Start Week 1
                </button>
                <button
                  onClick={goHome}
                  className="w-full py-3 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-muted transition-all active:scale-[0.98]"
                >
                  Back to Home
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Legend Unlock overlay */}
      {showUnlock && justUnlocked && (
        <LegendUnlockReveal
          legend={legend}
          scorePercent={displayPercent}
          onContinue={() => setShowUnlock(false)}
          onViewLegends={() => { setShowUnlock(false); goLegends(); }}
        />
      )}

      <style jsx>{`
        @keyframes floatShape {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-20px) scale(1.1); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </main>
  );
}
