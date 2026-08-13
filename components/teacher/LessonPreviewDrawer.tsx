"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { ExternalLink } from "lucide-react";
import type { Lesson } from "@/data/programs/year1";
import { DEFAULT_LESSON_XP } from "@/data/programs/genres";
import type { TeacherInsight } from "@/lib/teacher-insights";
import { buildLessonRoute } from "@/lib/lesson-routing";

export type LessonPreviewStudent = {
  id: string;
  display_name: string;
  status: "Not Started" | "In Progress" | "Completed";
  attempts?: number;
  timeSpent?: string;
  quizPercent?: number | null;
  quizPassed?: boolean | null;
  accuracy?: number | null;
  aiInsight?: TeacherInsight | null;
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
  realmId?: string;
  yearLabel?: string;
  isPlaceholder?: boolean;
  student?: LessonPreviewStudent | null;
  classStats?: LessonPreviewClassStats | null;
};

type PreviewStep = {
  id: string;
  label: string;
  detail: string;
};

const ESTIMATED_MINUTES = 8;

function statusTone(s: LessonPreviewStudent["status"]) {
  switch (s) {
    case "Completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "In Progress":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

function buildTeacherPreviewHref(baseHref: string, stepId?: string): string {
  const separator = baseHref.includes("?") ? "&" : "?";
  const stepParam = stepId ? `&preview_step=${encodeURIComponent(stepId)}` : "";
  return `${baseHref}${separator}teacher_preview=1${stepParam}`;
}

function cleanActivityLabel(value: string | null | undefined, index: number): string {
  const raw = value?.trim();
  if (!raw) return `Activity ${index + 1}`;

  const cleaned = raw
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return `Activity ${index + 1}`;

  return cleaned
    .split(" ")
    .map((word) => {
      const lower = word.toLowerCase();
      if (["and", "or", "the", "to", "of", "in", "with"].includes(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function activityDetail(config: Record<string, unknown> | undefined): string {
  if (!config) return "Production lesson activity";
  const rotationLabel = typeof config.rotationLabel === "string" ? config.rotationLabel : null;
  const title = typeof config.title === "string" ? config.title : null;
  const label = typeof config.label === "string" ? config.label : null;
  return rotationLabel ?? title ?? label ?? "Production lesson activity";
}

function getPreviewSteps(lesson: Lesson): PreviewStep[] {
  const steps: PreviewStep[] = [
    {
      id: "intro",
      label: "Teaching intro",
      detail: "Real student lesson entry screen and teaching context.",
    },
  ];

  const configuredActivities = lesson.activities?.slice(0, 3) ?? [];
  if (configuredActivities.length > 0) {
    configuredActivities.forEach((activity, index) => {
      const config = activity.config as Record<string, unknown> | undefined;
      const label = cleanActivityLabel(
        typeof config?.rotationLabel === "string"
          ? config.rotationLabel
          : typeof config?.title === "string"
            ? config.title
            : typeof config?.label === "string"
              ? config.label
              : null,
        index,
      );

      steps.push({
        id: `activity-${index + 1}`,
        label: label.startsWith("Activity") ? label : `Activity ${index + 1}: ${label}`,
        detail: activityDetail(config),
      });
    });
  } else {
    const ideas = lesson.activityIdeas?.slice(0, 3) ?? [];
    const count = Math.max(3, ideas.length);
    for (let index = 0; index < count; index += 1) {
      const idea = ideas[index];
      steps.push({
        id: `activity-${index + 1}`,
        label: `Activity ${index + 1}`,
        detail: idea ? cleanActivityLabel(idea, index) : "Production lesson activity",
      });
    }
  }

  return steps;
}

export default function LessonPreviewDrawer({
  open,
  onClose,
  lesson,
  weekTopic,
  weekNumber,
  strand,
  realm,
  yearLabel,
  realmId,
  isPlaceholder,
  student,
  classStats,
}: Props) {
  const [selectedStepId, setSelectedStepId] = useState("intro");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const steps = useMemo(() => (lesson ? getPreviewSteps(lesson) : []), [lesson]);

  if (!open || !lesson) return null;

  const configuredPreviewHref =
    lesson.config && typeof lesson.config.teacherPreviewHref === "string"
      ? lesson.config.teacherPreviewHref
      : null;
  const generatedPreviewHref =
    !isPlaceholder && yearLabel && weekNumber && realmId
      ? buildLessonRoute({
          yearLabel,
          week: weekNumber,
          lessonNumber: lesson.lesson,
          realmId,
        })
      : null;
  const previewHref = configuredPreviewHref ?? generatedPreviewHref;
  const fullPreviewHref = previewHref ? buildTeacherPreviewHref(previewHref) : null;
  const selectedStep = steps.find((step) => step.id === selectedStepId) ?? steps[0];
  const effectiveStepId = selectedStep?.id ?? "intro";
  const teacherPreviewHref = previewHref ? buildTeacherPreviewHref(previewHref, effectiveStepId) : null;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Lesson preview">
      <button
        aria-label="Close lesson preview"
        onClick={onClose}
        className="flex-1 bg-[#0F172A]/40 backdrop-blur-[2px]"
      />

      <aside className="w-full max-w-[680px] h-full bg-white shadow-2xl border-l border-[#E6E8EC] flex flex-col">
        <div className="px-5 py-4 border-b border-[#E6E8EC] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold text-teal-700 uppercase tracking-[0.14em]">
              {strand ?? "Lesson"}
              {realm ? ` · ${realm}` : ""}
            </div>
            <div className="text-base font-black text-[#0F172A] mt-0.5 truncate">
              {weekNumber ? `Week ${weekNumber} · L${lesson.lesson} - ` : ""}
              {lesson.title}
            </div>
            <div className="text-[11px] font-semibold text-[#64748B] mt-0.5">
              {yearLabel ? `${yearLabel} · ` : ""}
              {weekTopic ?? ""}
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-[#E6E8EC] text-[#64748B] hover:bg-[#F8FAFC] text-sm font-bold shrink-0"
            aria-label="Close"
          >
            x
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {isPlaceholder && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-800">
              Activity preview unavailable
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <Meta label="XP" value={`${DEFAULT_LESSON_XP}`} />
            <Meta label="Time" value={`~${ESTIMATED_MINUTES} min`} />
            <Meta label="Curriculum" value={(lesson.curriculum?.[0] ?? "-").toString()} />
          </div>

          <Section title="Learning goal">
            <p className="text-sm text-[#0F172A] leading-relaxed font-semibold">
              Students will <span className="lowercase">{lesson.title.replace(/\.$/, "")}</span>.
            </p>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">{lesson.focus}</p>
          </Section>

          <Section title="Real student activity preview">
            {teacherPreviewHref ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {steps.map((step) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setSelectedStepId(step.id)}
                      className={[
                        "min-h-[72px] rounded-lg border px-2.5 py-2 text-left transition-colors",
                        selectedStepId === step.id
                          ? "border-teal-400 bg-teal-50 text-teal-900"
                          : "border-[#E6E8EC] bg-white text-[#0F172A] hover:border-teal-200",
                      ].join(" ")}
                    >
                      <div className="text-[11px] font-black leading-tight">{step.label}</div>
                      <div className="mt-1 text-[10px] font-semibold leading-snug text-[#64748B]">{step.detail}</div>
                    </button>
                  ))}
                </div>

                <div className="rounded-xl border border-[#DDE7FF] bg-[#F7F9FF] overflow-hidden">
                  <div className="flex items-center justify-between gap-3 border-b border-[#DDE7FF] px-3 py-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-teal-700">
                        {selectedStep?.label ?? "Student preview"}
                      </div>
                      <div className="truncate text-xs font-semibold text-[#64748B]">
                        Production lesson renderer in demo review mode. No progress, XP, attempts or live-class writes are recorded.
                      </div>
                    </div>
                    {fullPreviewHref ? (
                      <button
                        type="button"
                        onClick={() => window.open(fullPreviewHref, "_blank", "noopener,noreferrer")}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#C7D2FE] bg-white px-2.5 py-1.5 text-[11px] font-black text-[#334155] hover:border-teal-300 hover:text-teal-700"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View larger
                      </button>
                    ) : null}
                  </div>
                  <div className="aspect-[4/3] w-full bg-[#0F172A]">
                    <iframe
                      key={teacherPreviewHref}
                      title={`Student preview - ${lesson.title}`}
                      src={teacherPreviewHref}
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      className="h-full w-full border-0 bg-white"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[#E6E8EC] bg-[#FAFBFC] px-4 py-5 text-center">
                <div className="text-sm font-black text-[#0F172A]">Activity preview unavailable</div>
                <div className="mt-1 text-xs font-semibold text-[#64748B]">
                  This lesson does not have a safe student preview route yet.
                </div>
              </div>
            )}
          </Section>

          {student && (
            <Section title={`${student.display_name} progress`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-extrabold uppercase tracking-wider ${statusTone(student.status)}`}>
                  {student.status}
                </span>
                {student.quizPercent != null && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-extrabold uppercase tracking-wider ${
                      student.quizPassed
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    Quiz {student.quizPercent}% {student.quizPassed ? "Pass" : "Fail"}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Meta label="Attempts" value={String(student.attempts ?? 0)} />
                <Meta label="Time spent" value={student.timeSpent ?? "n/a"} />
                <Meta label="Accuracy" value={student.accuracy != null ? `${student.accuracy}%` : "n/a"} />
              </div>
              {student.aiInsight ? (
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-[#E6E8EC] bg-white px-3 py-2.5">
                      <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#94A3B8]">Status</div>
                      <div className="mt-0.5 text-xs font-black text-[#0F172A]">{student.aiInsight.status}</div>
                    </div>
                    <div className="rounded-xl border border-[#E6E8EC] bg-white px-3 py-2.5">
                      <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#94A3B8]">Strongest Skill</div>
                      <div className="mt-0.5 text-xs font-black text-emerald-700">{student.aiInsight.strongestSkill}</div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5">
                    <div className="text-[9px] font-extrabold uppercase tracking-wider text-rose-400">Needs Support</div>
                    <div className="mt-0.5 text-xs font-bold text-rose-900">{student.aiInsight.needsSupport}</div>
                  </div>
                  <div className="rounded-xl bg-[#0F172A] px-3 py-2.5">
                    <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Teacher Action</div>
                    <div className="mt-1 text-xs font-bold text-white leading-relaxed">{student.aiInsight.teacherAction}</div>
                  </div>
                </div>
              ) : null}
            </Section>
          )}

          {classStats && (
            <Section title="Class progress on this lesson">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <Meta label="Done" value={`${classStats.completed}/${classStats.studentCount}`} />
                <Meta label="In progress" value={String(classStats.inProgress)} />
                <Meta label="Not started" value={String(classStats.notStarted)} />
              </div>
              {classStats.quizAvg != null && (
                <div className="text-xs text-[#64748B]">
                  Quiz accuracy on this lesson&apos;s questions:{" "}
                  <b
                    className={
                      (classStats.quizAttempts ?? 0) === 0
                        ? "text-[#94A3B8]"
                        : (classStats.quizAvg ?? 0) >= 80
                          ? "text-emerald-700"
                          : (classStats.quizAvg ?? 0) >= 60
                            ? "text-amber-700"
                            : "text-rose-700"
                    }
                  >
                    {(classStats.quizAttempts ?? 0) === 0 ? "-" : `${classStats.quizAvg}%`}
                  </b>{" "}
                  <span className="text-[#94A3B8]">
                    ({classStats.quizAttempts ?? 0} attempt{classStats.quizAttempts === 1 ? "" : "s"})
                  </span>
                </div>
              )}
            </Section>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[#E6E8EC] bg-[#FAFBFC] flex flex-wrap items-center justify-end gap-2">
          <button
            disabled
            title="Coming soon"
            className="px-3 py-1.5 rounded-lg bg-white border border-[#E6E8EC] text-[#64748B] text-xs font-bold cursor-not-allowed"
          >
            Recommend revisit
          </button>
          <button
            disabled={!fullPreviewHref}
            title={fullPreviewHref ? "Open the live lesson in teacher preview mode" : "Preview is unavailable for this lesson"}
            onClick={() => {
              if (!fullPreviewHref) return;
              window.open(fullPreviewHref, "_blank", "noopener,noreferrer");
            }}
            className={[
              "px-3 py-1.5 rounded-lg bg-white border border-[#E6E8EC] text-xs font-bold",
              fullPreviewHref
                ? "text-[#0F172A] hover:border-teal-300 hover:text-teal-700"
                : "text-[#64748B] cursor-not-allowed",
            ].join(" ")}
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
