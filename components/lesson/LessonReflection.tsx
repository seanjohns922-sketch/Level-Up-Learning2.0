"use client";

import { useEffect, useState, type ComponentType } from "react";
import { Frown, Meh, Smile, Zap, Star, Flame, Bot, Ruler, Orbit } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ACTIVE_STUDENT_KEY } from "@/data/progress";
import { calcXP } from "./LessonXPBar";
import { getRealmTheme } from "@/lib/useRealmTheme";

type Confidence = 1 | 2 | 3 | 4;
type ReflectionChoice =
  | "questions"
  | "understanding"
  | "speed"
  | "everything"
  | "not_sure";

const CONFIDENCE_OPTIONS: {
  value: Confidence;
  Icon: ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { value: 1, Icon: Frown, label: "Really hard" },
  { value: 2, Icon: Meh, label: "A bit tricky" },
  { value: 3, Icon: Smile, label: "Got it" },
  { value: 4, Icon: Zap, label: "Too easy!" },
];

type Props = {
  lessonId: string;
  lessonTitle: string;
  level: string;
  /** Numeric level: 0 = Ground/Prep … 6 = Year 6. Drives the junior/senior split. */
  levelNumber?: number;
  week: number;
  accuracy: number;
  questionsAnswered: number;
  correctAnswers: number;
  /** Best combo chain reached this lesson. */
  bestChain?: number;
  /** Optional per-lesson skill bullets ("Finding the shortest object", …).
   *  Falls back to a single "Today you practised <lessonTitle>" line. */
  practisedSkills?: string[];
  /** What the student unlocks / does next, e.g. "Lesson 2" or "This week's Quiz". */
  nextUpLabel?: string;
  realmId?: string;
  copy?: {
    reflectionTitle?: string;
    reflectionPrompt?: string;
    reflectionOptions?: string[];
  };
  onComplete: () => void;
};

function bandFromProps(levelNumber: number | undefined, level: string): "junior" | "senior" {
  if (typeof levelNumber === "number") return levelNumber <= 2 ? "junior" : "senior";
  const n = Number((level || "").replace(/\D/g, ""));
  if (!Number.isFinite(n) || n === 0) return "junior"; // Prep / Ground
  return n <= 2 ? "junior" : "senior";
}

function mascotForRealm(realmId?: string): {
  Icon: ComponentType<{ className?: string }>;
  name: string;
} {
  if (realmId === "measurement") return { Icon: Ruler, name: "Meazurex" };
  if (realmId === "space") return { Icon: Orbit, name: "Geospin" };
  return { Icon: Bot, name: "Numbot" };
}

async function persistReflection(args: {
  lessonId: string;
  lessonTitle: string;
  level: string;
  week: number;
  confidence: Confidence | null;
  reflectionChoice: ReflectionChoice | null;
  accuracy: number;
  questionsAnswered: number;
}) {
  const studentId =
    typeof window !== "undefined" ? localStorage.getItem(ACTIVE_STUDENT_KEY) : null;

  // Local backup so a reflection is never lost (offline / RPC failure).
  try {
    if (typeof window !== "undefined") {
      const key = `lul:lesson-reflection:${studentId ?? "anon"}:${args.lessonId}`;
      localStorage.setItem(
        key,
        JSON.stringify({ ...args, savedAt: new Date().toISOString() })
      );
    }
  } catch {
    /* non-fatal */
  }

  if (!studentId || args.confidence === null) return;
  try {
    await supabase.rpc("save_lesson_reflection", {
      p_student_id: studentId,
      p_lesson_id: args.lessonId,
      p_lesson_title: args.lessonTitle,
      p_level: args.level,
      p_week: args.week,
      p_confidence: args.confidence,
      p_hardest_part: args.reflectionChoice,
      p_lesson_accuracy: Math.round(args.accuracy),
      p_questions_answered: args.questionsAnswered,
    });
  } catch {
    // Best-effort — don't block the student if save fails
  }
}

/* ── confetti for the celebration ── */
function Confetti({ colors }: { colors: string[] }) {
  const pieces = Array.from({ length: 34 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const left = (i * 47) % 100;
        const delay = (i % 9) * 0.16;
        const dur = 2.4 + (i % 5) * 0.5;
        const size = 5 + (i % 4) * 3;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              top: "-20px",
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: colors[i % colors.length],
              borderRadius: i % 2 === 0 ? "2px" : "50%",
              animation: `reflectionConfetti ${dur}s linear ${delay}s infinite`,
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes reflectionConfetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120%) rotate(540deg); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

function StatChips({
  xp,
  chain,
  accuracy,
  accuracyBorder,
  accuracyBg,
  accuracyValue,
  accuracyLabel,
}: {
  xp: number;
  chain: number;
  accuracy: number;
  accuracyBorder: string;
  accuracyBg: string;
  accuracyValue: string;
  accuracyLabel: string;
}) {
  return (
    <div className="mt-5 grid grid-cols-3 gap-3">
      <div className="rounded-2xl border border-amber-300/25 bg-amber-400/10 px-2 py-3">
        <div className="text-2xl font-black text-amber-200">+{xp}</div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300/70">XP Earned</div>
      </div>
      <div className="rounded-2xl border border-orange-300/25 bg-orange-400/10 px-2 py-3">
        <div className="flex items-center justify-center gap-1 text-2xl font-black text-orange-200">
          <Flame className="h-5 w-5" /> {chain}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-orange-300/70">Best Chain</div>
      </div>
      <div
        className="rounded-2xl border px-2 py-3"
        style={{ borderColor: accuracyBorder, background: accuracyBg }}
      >
        <div className="text-2xl font-black" style={{ color: accuracyValue }}>
          {Math.round(accuracy)}%
        </div>
        <div
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: accuracyLabel }}
        >
          Accuracy
        </div>
      </div>
    </div>
  );
}

export default function LessonReflection({
  lessonId,
  lessonTitle,
  level,
  levelNumber,
  week,
  accuracy,
  questionsAnswered,
  correctAnswers,
  bestChain = 0,
  realmId,
  copy,
  onComplete,
}: Props) {
  // practisedSkills / nextUpLabel now live on the Coach Review screen; the
  // Reflection is celebration + confidence only (no performance recap).
  const band = bandFromProps(levelNumber, level);
  const mascot = mascotForRealm(realmId);
  const theme = getRealmTheme(realmId);
  const xp = calcXP(correctAnswers);
  const stars = accuracy >= 85 ? 3 : accuracy >= 60 ? 2 : 1;

  const statChipProps = theme.isMeasurement
    ? {
        accuracyBorder: "rgba(214,184,108,0.30)",
        accuracyBg: "rgba(214,184,108,0.10)",
        accuracyValue: "#e8c97e",
        accuracyLabel: "rgba(214,184,108,0.75)",
      }
    : {
        accuracyBorder: "rgba(94,234,212,0.25)",
        accuracyBg: "rgba(45,212,191,0.10)",
        accuracyValue: "#99f6e4",
        accuracyLabel: "rgba(94,234,212,0.70)",
      };

  const buttonHoverClass = theme.isMeasurement
    ? "hover:border-[#e8c97e]/60 hover:bg-white/10"
    : "hover:border-teal-300/50 hover:bg-white/10";
  const optionBorderColor = theme.isMeasurement ? "rgba(214,184,108,0.25)" : "rgba(94,234,212,0.20)";
  const optionTextColor = theme.isMeasurement ? "#f5e6c4" : "rgba(204,251,241,0.85)";

  const [saving, setSaving] = useState(false);

  // Celebration chime for juniors (best-effort; respects autoplay rules).
  useEffect(() => {
    if (band !== "junior" || typeof window === "undefined") return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.18, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.4);
      });
    } catch {
      /* audio blocked — fine */
    }
  }, [band]);

  async function finishWith(conf: Confidence | null, choice: ReflectionChoice | null) {
    setSaving(true);
    await persistReflection({
      lessonId,
      lessonTitle,
      level,
      week,
      confidence: conf,
      reflectionChoice: choice,
      accuracy,
      questionsAnswered,
    });
    onComplete();
  }

  // ── Junior: visual celebration ──
  if (band === "junior") {
    return (
      <div
        className="relative overflow-hidden rounded-3xl px-6 py-8 text-center"
        style={{
          background: theme.cardSurface,
          boxShadow: theme.cardInsetShadow,
        }}
      >
        <Confetti colors={theme.confetti} />
        <div className="relative">
          <div className="flex animate-bounce justify-center" aria-hidden>
            <mascot.Icon className="h-16 w-16 text-white" />
          </div>
          <div
            className="mt-1 text-[11px] font-mono font-bold uppercase tracking-[0.22em]"
            style={{ color: theme.accentTextSoft }}
          >
            {mascot.name} is proud of you!
          </div>
          <div className="mt-2 text-2xl font-black text-white">{copy?.reflectionTitle ?? "Amazing work!"}</div>

          <div className="mt-4 flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <Star
                key={i}
                className="h-8 w-8"
                style={{
                  opacity: i < stars ? 1 : 0.2,
                  color: theme.accentText,
                  fill: i < stars ? theme.accentText : "transparent",
                }}
              />
            ))}
          </div>

          <StatChips xp={xp} chain={bestChain} accuracy={accuracy} {...statChipProps} />

          {copy?.reflectionPrompt ? (
            <div className="mt-6">
              <div className="text-base font-bold text-white">{copy.reflectionPrompt}</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {(copy.reflectionOptions ?? ["I made a discovery!"]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => finishWith(null, null)}
                    disabled={saving}
                    className="min-h-12 rounded-xl border border-cyan-200/25 bg-white/10 px-3 py-2 text-sm font-black text-white transition hover:bg-white/15 disabled:opacity-60"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={() => finishWith(null, null)}
              disabled={saving}
              className="mt-6 w-full rounded-2xl px-6 py-4 text-base font-extrabold text-white transition active:scale-[0.98] disabled:opacity-60"
              style={{ background: theme.ctaGradientCss, boxShadow: theme.ctaShadow }}
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Senior: deeper reflection ──
  return (
    <div
      className="relative overflow-hidden rounded-3xl px-6 py-8 text-center"
      style={{
        background: theme.cardSurface,
        boxShadow: theme.cardInsetShadow,
      }}
    >
      <div className="relative">
        <div
          className="text-[11px] font-mono font-bold uppercase tracking-[0.22em]"
          style={{ color: theme.accentTextSoft }}
        >
          Lesson complete
        </div>
        <div className="mt-1 text-2xl font-black text-white">Nice work!</div>
        <div className="mt-1 text-sm" style={{ color: optionTextColor }}>{lessonTitle}</div>

        <StatChips xp={xp} chain={bestChain} accuracy={accuracy} {...statChipProps} />

        <div className="mt-7 text-base font-bold text-white">
          How confident do you feel now?
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {CONFIDENCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                if (!saving) finishWith(opt.value, null);
              }}
              disabled={saving}
              className={`flex flex-col items-center gap-2 rounded-2xl border bg-white/5 px-2 py-4 transition-all ${buttonHoverClass} active:scale-95 disabled:opacity-50`}
              style={{ borderColor: optionBorderColor }}
            >
              <opt.Icon className="h-9 w-9" />
              <span
                className="text-[11px] font-bold leading-tight"
                style={{ color: optionTextColor }}
              >
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => finishWith(null, null)}
          disabled={saving}
          className="mt-5 text-[11px] font-semibold text-white/50 transition hover:text-white/80 disabled:opacity-30"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
