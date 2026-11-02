'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import { MathFormattedText } from '@/components/FractionText';
import { getRealmTheme } from '@/lib/useRealmTheme';
import { stopSpeaking } from '@/lib/speak';
import type { LowerLessonGuide as GuideData } from '@/data/lesson-guides/lower-level';
import GuideVisual from '@/components/lesson/GuideVisual';
import { GUIDE_TIMER_TEXT, guideAction, lowerGuideSpeech } from '@/data/lesson-guides/guide-speech';

export function LessonHelpDialog({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); stopSpeaking(); };
  }, []);
  return <dialog ref={ref} aria-label="Learn the skill" onCancel={event => { event.preventDefault(); onClose(); }} className="fixed inset-0 m-auto max-h-[92dvh] w-[min(96vw,1080px)] overflow-y-auto rounded-2xl border-0 p-0 text-slate-900 backdrop:bg-slate-950/80">{children}</dialog>;
}

export function LessonHelpButton({ realm, onClick, label = "Learn the skill · open guide" }: { realm: string; onClick: () => void; label?: string }) {
  const theme = getRealmTheme(realm);
  return <button type="button" onClick={onClick} className="mb-3 min-h-12 w-full rounded-xl border px-4 py-3 font-bold text-white focus-visible:outline focus-visible:outline-offset-4" style={{ background: theme.ctaGradientCss, borderColor: theme.borderRing }}>{label}</button>;
}

export default function LowerLessonGuide({ guide, title, realm, onContinue, review = false }: {
  guide: GuideData; title: string; realm: string; onContinue: () => void; review?: boolean;
}) {
  useEffect(() => () => stopSpeaking(), []);
  // Focus the way on without scrolling a tall guide past its picture.
  const continueButton = useRef<HTMLButtonElement>(null);
  useEffect(() => continueButton.current?.focus({ preventScroll: true }), []);
  // Picture-led guides: a chosen step lights up its part of the picture. null is the finished picture.
  const picture = guide.visual?.kind === 'scene';
  const [step, setStep] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearInterval(timer.current), []);
  const chooseStep = (next: number) => { window.clearInterval(timer.current); setStep(current => current === next ? null : next); };
  const showMe = () => {
    window.clearInterval(timer.current);
    let next = 1; setStep(next);
    timer.current = window.setInterval(() => {
      next += 1;
      if (next > guide.steps.length) { window.clearInterval(timer.current); setStep(null); } else setStep(next);
    }, 2200);
  };
  const theme = getRealmTheme(realm);
  const action = guideAction(review);
  const timerText = GUIDE_TIMER_TEXT;
  const said = lowerGuideSpeech(guide, review);
  return <section data-lower-lesson-guide className="rounded-2xl border-2 bg-[#fffdf5] p-5 text-slate-900 sm:p-8" style={{ borderColor: theme.borderRing }}>
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-sm font-bold uppercase tracking-widest">Learn the skill</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">{title}</h2></div>
      <ReadAloudBtn text={said.whole.join(" ")} parts={said.whole} label="Read whole guide" />
    </div>
    <div className="my-5 flex items-start justify-between gap-4"><p className="text-lg leading-relaxed">{guide.idea}</p><ReadAloudBtn text={said.idea} /></div>
    <div className="grid gap-5 md:grid-cols-2">
      <div className="min-w-0 rounded-xl border bg-white p-3 sm:p-5" style={{ borderColor: theme.borderRing }}>
        <div className="flex items-center justify-between gap-3"><h3 className="font-bold">Worked example</h3><ReadAloudBtn text={said.example} label="Read example" /></div>
        {guide.visual && <div className="mt-4"><GuideVisual visual={guide.visual} step={step} /></div>}
        <div className={`${guide.visual ? "mt-3 mb-2" : "my-6"} text-xl font-bold leading-loose sm:text-2xl`}><MathFormattedText text={guide.example} /></div>
      </div>
      <div><div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-bold">How to solve it</h3>{picture && <button type="button" onClick={showMe} className="min-h-10 rounded-full px-4 py-2 text-sm font-bold text-white focus-visible:outline focus-visible:outline-offset-2" style={{ background: theme.ctaGradientCss }}>▶ Show me</button>}</div><ol className="space-y-3">{guide.steps.map((text, i) => <li key={text} className="flex items-start gap-3">
        {picture
          ? <button type="button" aria-pressed={step === i + 1} onClick={() => chooseStep(i + 1)} className="flex min-h-12 flex-1 items-start gap-3 rounded-xl border-2 bg-white p-2 text-left transition-shadow focus-visible:outline focus-visible:outline-offset-2" style={{ borderColor: step === i + 1 ? theme.ctaFrom : theme.borderRing, boxShadow: step === i + 1 ? '0 0 0 3px #ffd95a' : undefined }}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-white" style={{ background: theme.ctaGradientCss }}>{i + 1}</span>
              <span className="flex-1 leading-relaxed"><MathFormattedText text={text} /></span>
            </button>
          : <><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-white" style={{ background: theme.ctaGradientCss }}>{i + 1}</span>
              <p className="flex-1 leading-relaxed"><MathFormattedText text={text} /></p></>}
        <ReadAloudBtn text={said.steps[i]} />
      </li>)}</ol></div>
    </div>
    <div className="mt-5 flex items-start justify-between gap-4 rounded-xl border bg-white p-4" style={{ borderColor: theme.borderRing }}><p><strong>Tip: </strong>{guide.tip}</p><ReadAloudBtn text={said.tip} /></div>
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3"><button ref={continueButton} type="button" onClick={onContinue} className="min-h-12 rounded-xl px-7 py-3 font-bold text-white focus-visible:outline focus-visible:outline-offset-4" style={{ background: theme.ctaGradientCss }}>{action} →</button><ReadAloudBtn text={said.instructions} label="Read instructions" /></div>
    <p className="mt-3 text-center text-sm text-slate-600">{timerText}</p>
  </section>;
}
