"use client";

import { useEffect, useState } from "react";
import type { Lesson } from "@/data/programs/year1";
import { DEFAULT_LESSON_XP } from "@/data/programs/genres";

export type LessonPreviewStudent = {
  id: string;
  display_name: string;
  status: "Not Started" | "In Progress" | "Completed";
  attempts?: number;
  timeSpent?: string;
  quizPercent?: number | null;
  quizPassed?: boolean | null;
  accuracy?: number | null;
};

export type LessonPreviewClassStats = {
  studentCount: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  quizAvg?: number | null;
  quizAttempts?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  weekTopic?: string;
  weekNumber?: number;
  strand?: string;
  realm?: string;
  yearLabel?: string;
  isPlaceholder?: boolean;
  /** Student-specific context (used in StrandStudentsPanel detail view). */
  student?: LessonPreviewStudent | null;
  /** Class-wide context (used in CurriculumExplorer). */
  classStats?: LessonPreviewClassStats | null;
};

const ESTIMATED_MINUTES = 8;

function describeActivity(idea: string): string {
  const i = idea.toLowerCase();
  if (i.includes("flash") || i.includes("flip"))   return "Quick recognition rounds — students see and respond fast.";
  if (i.includes("hunt") || i.includes("walk"))    return "Find-and-tap activity — students locate target numbers in a scene.";
  if (i.includes("group") || i.includes("set"))    return "Make equal groups using counters and sets.";
  if (i.includes("skip"))                          return "Skip-count along a number line in steps of 2s, 5s or 10s.";
  if (i.includes("ladder") || i.includes("line"))  return "Place values on a number line or ladder.";
  if (i.includes("part") || i.includes("ppp"))     return "Part–part–whole bar model — split a total into parts.";
  if (i.includes("dice") || i.includes("place"))   return "Roll and build numbers on a place-value mat.";
  if (i.includes("bar"))                           return "Bar model comparison — visualise the relationship.";
  if (i.includes("story") || i.includes("word"))   return "Word problem — choose the operation and solve.";
  if (i.includes("fact"))                          return "Fact family practice — write the four related facts.";
  if (i.includes("match") || i.includes("pair"))   return "Drag and match pairs that mean the same thing.";
  if (i.includes("array"))                         return "Build an array of rows × columns to find the total.";
  if (i.includes("share") || i.includes("deal"))   return "Share fairly into groups (division as sharing).";
  if (i.includes("count"))                         return "Count objects accurately and record the total.";
  return "Interactive practice activity tied to the lesson focus.";
}

function statusTone(s: LessonPreviewStudent["status"]) {
  switch (s) {
    case "Completed":   return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "In Progress": return "bg-amber-50 text-amber-700 border-amber-200";
    default:            return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

export default function LessonPreviewDrawer({
  open, onClose, lesson, weekTopic, weekNumber, strand, realm, yearLabel,
  isPlaceholder, student, classStats,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !lesson) return null;

  const ideas = (lesson.activityIdeas?.length ? lesson.activityIdeas : ["Activity 1", "Activity 2", "Activity 3"]).slice(0, 3);
  while (ideas.length < 3) ideas.push("Mixed practice");

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Lesson preview">
      {/* Backdrop */}
      <button
        aria-label="Close lesson preview"
        onClick={onClose}
        className="flex-1 bg-[#0F172A]/40 backdrop-blur-[2px]"
      />

      {/* Drawer */}
      <aside className="w-full max-w-[560px] h-full bg-white shadow-2xl border-l border-[#E6E8EC] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E6E8EC] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold text-teal-700 uppercase tracking-[0.14em]">
              {strand ?? "Lesson"}{realm ? ` · ${realm}` : ""}
            </div>
            <div className="text-base font-black text-[#0F172A] mt-0.5 truncate">
              {weekNumber ? `Week ${weekNumber} · L${lesson.lesson} — ` : ""}{lesson.title}
            </div>
            <div className="text-[11px] font-semibold text-[#64748B] mt-0.5">
              {yearLabel ? `${yearLabel} · ` : ""}{weekTopic ?? ""}
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-[#E6E8EC] text-[#64748B] hover:bg-[#F8FAFC] text-sm font-bold shrink-0"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {isPlaceholder && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-800">
              Curriculum content for this strand is coming soon. The preview below is a placeholder.
            </div>
          )}

          {/* Meta tiles */}
          <div className="grid grid-cols-3 gap-2">
            <Meta label="XP" value={`${DEFAULT_LESSON_XP}`} />
            <Meta label="Time" value={`~${ESTIMATED_MINUTES} min`} />
            <Meta label="Curriculum" value={(lesson.curriculum?.[0] ?? "—").toString()} />
          </div>

          {/* Learning goal */}
          <Section title="Learning goal">
            <p className="text-sm text-[#0F172A] leading-relaxed font-semibold">
              Students will <span className="lowercase">{lesson.title.replace(/\.$/, "")}</span>.
            </p>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">{lesson.focus}</p>
          </Section>

          {/* What the student will see */}
          <Section title="What the student will see">
            <ul className="space-y-1.5 text-xs text-[#0F172A]">
              <Bullet>Lesson intro screen with the title <b>“{lesson.title}”</b> and a short motivation.</Bullet>
              <Bullet>An optional intro video/animation introducing the concept.</Bullet>
              <Bullet>An <b>8-minute timed practice</b> rotating through 3 activity types.</Bullet>
              <Bullet>Difficulty ramps over the session: Easy → Medium → Hard.</Bullet>
              <Bullet>Instant feedback after every answer with XP and progress updates.</Bullet>
            </ul>
          </Section>

          {/* Activity breakdown */}
          <Section title="Activity breakdown (3 rotations)">
            <div className="space-y-2">
              {ideas.map((idea, i) => (
                <div key={i} className="rounded-xl border border-[#E6E8EC] bg-[#FAFBFC] p-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-teal-50 text-teal-700 text-[11px] font-black">
                      {i + 1}
                    </span>
                    <span className="text-sm font-bold text-[#0F172A]">{idea}</span>
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-1 leading-relaxed pl-8">
                    {describeActivity(idea)}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Student-specific progress */}
          {student && (
            <Section title={`${student.display_name}'s progress`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-extrabold uppercase tracking-wider ${statusTone(student.status)}`}>
                  {student.status}
                </span>
                {student.quizPercent != null && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-extrabold uppercase tracking-wider ${
                    student.quizPassed ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    Quiz {student.quizPercent}% {student.quizPassed ? "Pass" : "Fail"}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Meta label="Attempts" value={String(student.attempts ?? 0)} />
                <Meta label="Time spent" value={student.timeSpent ?? "n/a"} />
                <Meta label="Accuracy" value={student.accuracy != null ? `${student.accuracy}%` : "n/a"} />
              </div>
            </Section>
          )}

          {/* Class-wide stats */}
          {classStats && (
            <Section title="Class progress on this lesson">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <Meta label="Done" value={`${classStats.completed}/${classStats.studentCount}`} />
                <Meta label="In progress" value={String(classStats.inProgress)} />
                <Meta label="Not started" value={String(classStats.notStarted)} />
              </div>
              {classStats.quizAvg != null && (
                <div className="text-xs text-[#64748B]">
                  Quiz accuracy on this lesson's questions:{" "}
                  <b className={
                    (classStats.quizAttempts ?? 0) === 0 ? "text-[#94A3B8]" :
                    (classStats.quizAvg ?? 0) >= 80 ? "text-emerald-700" :
                    (classStats.quizAvg ?? 0) >= 60 ? "text-amber-700" : "text-rose-700"
                  }>
                    {(classStats.quizAttempts ?? 0) === 0 ? "—" : `${classStats.quizAvg}%`}
                  </b>{" "}
                  <span className="text-[#94A3B8]">({classStats.quizAttempts ?? 0} attempt{classStats.quizAttempts === 1 ? "" : "s"})</span>
                </div>
              )}
            </Section>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-[#E6E8EC] bg-[#FAFBFC] flex flex-wrap items-center justify-end gap-2">
          <button
            disabled
            title="Coming soon"
            className="px-3 py-1.5 rounded-lg bg-white border border-[#E6E8EC] text-[#64748B] text-xs font-bold cursor-not-allowed"
          >
            Recommend revisit
          </button>
          <button
            disabled
            title="Coming soon"
            className="px-3 py-1.5 rounded-lg bg-white border border-[#E6E8EC] text-[#64748B] text-xs font-bold cursor-not-allowed"
          >
            Preview student view
          </button>
          <button
            disabled
            title="Coming soon"
            className="px-3 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-bold opacity-50 cursor-not-allowed"
          >
            Assign lesson
          </button>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-[0.12em] mb-2">{title}</div>
      {children}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#E6E8EC] bg-white px-2.5 py-2">
      <div className="text-[9px] font-extrabold text-[#94A3B8] uppercase tracking-wider">{label}</div>
      <div className="text-xs font-black text-[#0F172A] mt-0.5 truncate">{value}</div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}
