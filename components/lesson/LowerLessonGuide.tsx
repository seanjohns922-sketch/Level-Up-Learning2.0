'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import { MathFormattedText } from '@/components/FractionText';
import { getRealmTheme } from '@/lib/useRealmTheme';
import { stopSpeaking } from '@/lib/speak';
import type { LowerLessonGuide as GuideData } from '@/data/lesson-guides/lower-level';

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

/** Read symbols in examples as words. */
function spoken(text: string) {
  const words: [string, string][] = [['●', ' dot '], ['★', ' star '], ['▲', ' triangle '], ['■', ' square '], ['⊘', ' crossed out '], ['²', ' squared '], ['<', ' less than '], ['>', ' greater than '], ['→', ', gives '], ['−', ' minus ']];
  return words.reduce((t, [symbol, word]) => t.replaceAll(symbol, word), text).replace(/\s+/g, ' ').trim();
}

export default function LowerLessonGuide({ guide, title, realm, onContinue, review = false }: {
  guide: GuideData; title: string; realm: string; onContinue: () => void; review?: boolean;
}) {
  useEffect(() => () => stopSpeaking(), []);
  const theme = getRealmTheme(realm);
  const action = review ? 'Back to practice' : 'Let’s practise';
  const timerText = 'Read at your own pace. Your practice timer is paused.';
  const exampleSpeech = spoken(guide.example);
  const speech = `Learn the skill. ${title}. ${guide.idea} Worked example. ${exampleSpeech}. How to solve it. ${guide.steps.map((s, i) => `Step ${i + 1}. ${spoken(s)}`).join(' ')} Tip. ${guide.tip} ${timerText} Choose ${action} when ready.`;
  return <section data-lower-lesson-guide className="rounded-2xl border-2 bg-[#fffdf5] p-5 text-slate-900 sm:p-8" style={{ borderColor: theme.borderRing }}>
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-sm font-bold uppercase tracking-widest">Learn the skill</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">{title}</h2></div>
      <ReadAloudBtn text={speech} label="Read whole guide" />
    </div>
    <div className="my-5 flex items-start justify-between gap-4"><p className="text-lg leading-relaxed">{guide.idea}</p><ReadAloudBtn text={guide.idea} /></div>
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-xl border bg-white p-5" style={{ borderColor: theme.borderRing }}>
        <div className="flex items-center justify-between gap-3"><h3 className="font-bold">Worked example</h3><ReadAloudBtn text={`Worked example. ${exampleSpeech}`} label="Read example" /></div>
        <div className="my-6 text-xl font-bold leading-loose sm:text-2xl"><MathFormattedText text={guide.example} /></div>
      </div>
      <div><h3 className="mb-3 font-bold">How to solve it</h3><ol className="space-y-3">{guide.steps.map((step, i) => <li key={step} className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-white" style={{ background: theme.ctaGradientCss }}>{i + 1}</span>
        <p className="flex-1 leading-relaxed"><MathFormattedText text={step} /></p><ReadAloudBtn text={`Step ${i + 1}. ${spoken(step)}`} />
      </li>)}</ol></div>
    </div>
    <div className="mt-5 flex items-start justify-between gap-4 rounded-xl border bg-white p-4" style={{ borderColor: theme.borderRing }}><p><strong>Tip: </strong>{guide.tip}</p><ReadAloudBtn text={`Tip. ${guide.tip}`} /></div>
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3"><button autoFocus type="button" onClick={onContinue} className="min-h-12 rounded-xl px-7 py-3 font-bold text-white focus-visible:outline focus-visible:outline-offset-4" style={{ background: theme.ctaGradientCss }}>{action} →</button><ReadAloudBtn text={`${timerText} Choose ${action} when ready.`} label="Read instructions" /></div>
    <p className="mt-3 text-center text-sm text-slate-600">{timerText}</p>
  </section>;
}
