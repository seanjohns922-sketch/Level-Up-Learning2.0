"use client";
import { useEffect, useRef } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import Cave7Visual from "@/components/lesson/cave7/Cave7Visual";
import Year8MeasurementAssessmentVisual from "@/components/assessment/Year8MeasurementAssessmentVisual";
import { level8TeachingGuide } from "@/data/activities/level8/teaching";
import { MathFormattedText } from "@/components/FractionText";
import { LEVEL8_CURRICULUM } from "@/data/activities/level8/curriculum";
import { getRealmTheme } from "@/lib/useRealmTheme";
import type { Level8Realm } from "@/lib/level8-config";
import SpaceVisual from "./SpaceVisual";
import NumberVisual from "./NumberVisual";
import AlgebraVisual from "./AlgebraVisual";
import ChanceVisual from "./ChanceVisual";
import Investigation from "./Investigation";
import SkillGuideChoices from "../SkillGuideChoices";
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
  const teaching = level8TeachingGuide(realm, week, lesson);
  const q = teaching.example,
    theme = getRealmTheme(realm),
    // Realm tints are tuned for dark screens; the guide card is light, so mix the realm colour into white.
    lightTint = `color-mix(in srgb, ${theme.ctaFrom} 12%, white)`;
  const hasVisual = Boolean(q.cave7Visual || q.measurement8Visual || q.space8Visual || q.number8Visual || q.algebra8Visual || q.chance8Visual);
  const unit = q.answerSpec?.unit;
  const isClock = q.answerSpec?.kind === 'list' && q.answerSpec.labels?.[0] === 'Hours (24-hour time)';
  const raw = String(q.answer).trim(), negative = /^-/.test(raw);
  const answer = (isClock ? raw.split(',').map(part => part.trim().padStart(2, '0')).join(':')
    : unit === '$' ? `${negative ? '-' : ''}$${/^-?\d+\.\d$/.test(raw) ? `${raw.replace(/^-/, '')}0` : raw.replace(/^-/, '')}`
    : `${raw}${unit ? (unit === '%' || unit.startsWith('°') ? unit : ` ${unit}`) : ''}`)
    .replace(/(^|[\s(,])-(?=[\d$])/g, '$1−');
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
      <div className="mt-4 flex items-start justify-between gap-3 rounded-xl p-4" style={{background: lightTint}}>
        <div><h3 className="font-bold">The key idea</h3><p className="mt-2 leading-relaxed"><MathFormattedText text={teaching.idea} /></p></div>
        <ReadAloudBtn text={`The key idea. ${teaching.idea}`} />
      </div>
      <div className={`mt-5 grid items-start gap-6 ${hasVisual ? "lg:grid-cols-2" : ""}`}>
        <div>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide">Worked example</h3>
          <div className="flex justify-between gap-3">
            <p className="text-xl font-semibold"><MathFormattedText text={q.prompt} /></p>
            <ReadAloudBtn text={q.prompt} />
          </div>
          <SkillGuideChoices options={q.options} />
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
            {q.chance8Visual && <ChanceVisual visual={q.chance8Visual} />}
          </div>
        </div>
        <div
          className="rounded-xl border bg-white p-5"
          style={{ borderColor: theme.ctaFrom }}
        >
          <div className="flex justify-between">
            <h3 className="font-bold">How to solve it</h3>
            <ReadAloudBtn text={teaching.steps.map((step, i) => `Step ${i + 1}. ${step}`).join(" ")} />
          </div>
          <ol className="mt-3 list-decimal space-y-3 pl-6">
            {teaching.steps.map((step, i) => (
              <li key={i}><MathFormattedText text={step} /></li>
            ))}
          </ol>
          <div
            className="mt-4 flex items-center justify-between gap-3 rounded-lg p-3 font-bold"
            style={{ background: lightTint }}
          >
            <p>
              Answer: <MathFormattedText text={answer} />
            </p>
            <ReadAloudBtn
              text={`Answer: ${answer}`}
            />
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-start justify-between gap-3 rounded-xl border p-4" style={{borderColor: theme.ctaFrom}}>
        <div><h3 className="font-bold">Check and use it again</h3><p className="mt-2 leading-relaxed"><MathFormattedText text={teaching.check} /></p></div>
        <ReadAloudBtn text={`Check and use it again. ${teaching.check}`} />
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
