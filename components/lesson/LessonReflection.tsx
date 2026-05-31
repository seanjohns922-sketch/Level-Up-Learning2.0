"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ACTIVE_STUDENT_KEY } from "@/data/progress";

type Confidence = 1 | 2 | 3 | 4;
type HardestPart = "questions" | "understanding" | "not_sure";

const CONFIDENCE_OPTIONS: {
  value: Confidence;
  emoji: string;
  label: string;
}[] = [
  { value: 1, emoji: "😫", label: "Really hard" },
  { value: 2, emoji: "🤔", label: "A bit tricky" },
  { value: 3, emoji: "😊", label: "Got it" },
  { value: 4, emoji: "⚡", label: "Too easy!" },
];

const HARDEST_OPTIONS: {
  value: HardestPart;
  label: string;
}[] = [
  { value: "questions", label: "The questions were hard" },
  { value: "understanding", label: "I wasn't sure what to do" },
  { value: "not_sure", label: "Not sure" },
];

type Props = {
  lessonId: string;
  lessonTitle: string;
  level: string;
  week: number;
  accuracy: number;
  questionsAnswered: number;
  onComplete: () => void;
};

async function saveReflection({
  studentId,
  lessonId,
  lessonTitle,
  level,
  week,
  confidence,
  hardestPart,
  accuracy,
  questionsAnswered,
}: {
  studentId: string;
  lessonId: string;
  lessonTitle: string;
  level: string;
  week: number;
  confidence: Confidence;
  hardestPart: HardestPart | null;
  accuracy: number;
  questionsAnswered: number;
}) {
  try {
    await supabase.rpc("save_lesson_reflection", {
      p_student_id: studentId,
      p_lesson_id: lessonId,
      p_lesson_title: lessonTitle,
      p_level: level,
      p_week: week,
      p_confidence: confidence,
      p_hardest_part: hardestPart,
      p_lesson_accuracy: Math.round(accuracy),
      p_questions_answered: questionsAnswered,
    });
  } catch {
    // Best-effort — don't block the student if save fails
  }
}

export default function LessonReflection({
  lessonId,
  lessonTitle,
  level,
  week,
  accuracy,
  questionsAnswered,
  onComplete,
}: Props) {
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [step, setStep] = useState<"confidence" | "hardest">("confidence");
  const [saving, setSaving] = useState(false);

  async function handleConfidence(value: Confidence) {
    setConfidence(value);
    // High confidence — no follow-up, save and move on
    if (value >= 3) {
      await submit(value, null);
    } else {
      setStep("hardest");
    }
  }

  async function handleHardest(hardest: HardestPart) {
    if (confidence === null) return;
    await submit(confidence, hardest);
  }

  async function submit(conf: Confidence, hardest: HardestPart | null) {
    setSaving(true);
    const studentId =
      typeof window !== "undefined"
        ? localStorage.getItem(ACTIVE_STUDENT_KEY)
        : null;
    if (studentId) {
      await saveReflection({
        studentId,
        lessonId,
        lessonTitle,
        level,
        week,
        confidence: conf,
        hardestPart: hardest,
        accuracy,
        questionsAnswered,
      });
    }
    onComplete();
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl px-6 py-8 text-center"
      style={{
        background: "linear-gradient(135deg, #021716 0%, #042925 50%, #053b35 100%)",
        boxShadow: "inset 0 1px 0 rgba(94,234,212,0.18), inset 0 -10px 20px rgba(0,0,0,0.45)",
      }}
    >
      {/* Bezel */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-[2px]"
        style={{
          clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
          background: "linear-gradient(135deg, rgba(94,234,212,0.35) 0%, rgba(15,118,110,0.18) 50%, rgba(94,234,212,0.28) 100%)",
        }}
      />

      <div className="relative">
        {step === "confidence" ? (
          <>
            <div className="text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-teal-400/80">
              Quick check
            </div>
            <div className="mt-2 text-xl font-black text-white">
              How did that feel?
            </div>

            <div className="mt-6 grid grid-cols-4 gap-3">
              {CONFIDENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { if (!saving) handleConfidence(opt.value); }}
                  disabled={saving}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-teal-300/20 bg-white/5 px-2 py-4 transition-all hover:border-teal-300/50 hover:bg-white/10 active:scale-95 disabled:opacity-50"
                >
                  <span className="text-4xl leading-none">{opt.emoji}</span>
                  <span className="text-[11px] font-bold text-teal-100/80 leading-tight">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={onComplete}
              disabled={saving}
              className="mt-5 text-[11px] font-semibold text-teal-400/50 hover:text-teal-400/80 transition disabled:opacity-30"
            >
              Skip
            </button>
          </>
        ) : (
          <>
            <div className="text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-amber-400/80">
              One more thing
            </div>
            <div className="mt-2 text-xl font-black text-white">
              What was hardest?
            </div>

            <div className="mt-6 grid gap-3">
              {HARDEST_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { if (!saving) handleHardest(opt.value); }}
                  disabled={saving}
                  className="w-full rounded-2xl border border-teal-300/20 bg-white/5 px-5 py-3.5 text-sm font-bold text-teal-100 transition-all hover:border-teal-300/50 hover:bg-white/10 active:scale-[0.98] disabled:opacity-50 text-left"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => confidence !== null && submit(confidence, null)}
              disabled={saving}
              className="mt-5 text-[11px] font-semibold text-teal-400/50 hover:text-teal-400/80 transition disabled:opacity-30"
            >
              Skip
            </button>
          </>
        )}
      </div>
    </div>
  );
}
