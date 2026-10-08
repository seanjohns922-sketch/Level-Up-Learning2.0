"use client";
import { useEffect, useRef } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import Cave7Visual from "@/components/lesson/cave7/Cave7Visual";
import Year8MeasurementAssessmentVisual from "@/components/assessment/Year8MeasurementAssessmentVisual";
import { level8Question } from "@/data/activities/level8/questions";
import { LEVEL8_CURRICULUM } from "@/data/activities/level8/curriculum";
import { getRealmTheme } from "@/lib/useRealmTheme";
import type { Level8Realm } from "@/lib/level8-config";
import SpaceVisual from "./SpaceVisual";
import NumberVisual from "./NumberVisual";
import AlgebraVisual from "./AlgebraVisual";
import Investigation from "./Investigation";
export default function SkillGuide({
  realm,
  week,
  lesson,
  onContinue,
}: {
  realm: Level8Realm;
  week: number;
  lesson: number;
  onContinue: () => void;
}) {
  const plan = LEVEL8_CURRICULUM[realm][week - 1].lessons[lesson - 1];
  const q = level8Question(realm, week, lesson, 7007),
    theme = getRealmTheme(realm);
  return (
    <section
      className="rounded-2xl border bg-[#fffdf8] p-5 text-slate-900 sm:p-7"
      style={{ borderColor: theme.ctaFrom }}
    >
      <p className="text-sm font-bold uppercase tracking-wide">
        Learn the skill · Week {week} · Lesson {lesson}
      </p>
      <div className="mt-3 flex justify-between gap-3">
        <h2 className="text-2xl font-bold">{plan.title}</h2>
        <ReadAloudBtn text={plan.title} />
      </div>
      <div className="mt-5 grid items-start gap-6 lg:grid-cols-2">
        <div>
          <div className="flex justify-between gap-3">
            <p className="text-xl font-semibold">{q.prompt}</p>
            <ReadAloudBtn text={q.prompt} />
          </div>
          <div className="mt-4">
            {q.cave7Visual && (
              <Cave7Visual realm={realm} visual={q.cave7Visual} />
            )}
            {q.measurement8Visual && (
              <Year8MeasurementAssessmentVisual visual={q.measurement8Visual} />
            )}
            {q.space8Visual && <SpaceVisual visual={q.space8Visual} />}
            {q.number8Visual && <NumberVisual visual={q.number8Visual} />}
            {q.algebra8Visual && <AlgebraVisual visual={q.algebra8Visual} />}
          </div>
        </div>
        <div
          className="rounded-xl border bg-white p-5"
          style={{ borderColor: theme.ctaFrom }}
        >
          <div className="flex justify-between">
            <h3 className="font-bold">How to solve it</h3>
            <ReadAloudBtn text={q.steps.join(" ")} />
          </div>
          <ol className="mt-3 list-decimal space-y-3 pl-6">
            {q.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <div
            className="mt-4 flex items-center justify-between gap-3 rounded-lg p-3 font-bold"
            style={{ background: theme.surfaceTint }}
          >
            <p>
              Answer: {q.answer}
              {q.answerSpec?.unit ? ` ${q.answerSpec.unit}` : ""}
            </p>
            <ReadAloudBtn
              text={`Answer: ${q.answer} ${q.answerSpec?.unit ?? ""}`}
            />
          </div>
        </div>
      </div>
      <Investigation realm={realm} week={week} />
      <div className="mt-6 text-center">
        <button
          onClick={onContinue}
          className="rounded-xl px-8 py-3 font-bold text-white"
          style={{ background: theme.ctaGradientCss }}
        >
          Let’s practise →
        </button>
        <p className="mt-2 text-sm">
          Take your time. The practice timer starts after this guide.
        </p>
      </div>
    </section>
  );
}
export function SkillGuideDialog(props: {
  realm: Level8Realm;
  week: number;
  lesson: number;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        props.onClose();
      }}
      className="fixed inset-0 m-auto max-h-[90vh] w-[min(95vw,1100px)] overflow-y-auto rounded-2xl p-0 backdrop:bg-slate-950/85"
    >
      <SkillGuide {...props} onContinue={props.onClose} />
    </dialog>
  );
}
