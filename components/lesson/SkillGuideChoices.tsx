import ReadAloudBtn from '@/components/ReadAloudBtn';
import {MathFormattedText} from '@/components/FractionText';
/** The worked example's answer choices, shown as the same lettered cards students meet in practice. */
export default function SkillGuideChoices({options}:{options?:string[]}) {
  if (!options || options.length < 2) return null;
  return <div className="mt-3">
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-sm font-bold uppercase tracking-wide">Choices</h3>
      <ReadAloudBtn text={`Choices. ${options.map((o, i) => `${String.fromCharCode(65 + i)}: ${o}`).join('. ')}`} />
    </div>
    <ul className="mt-2 grid gap-2 sm:grid-cols-2">
      {options.map((option, i) => <li key={option} className="flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 shadow-sm">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-800 text-sm font-bold text-white">{String.fromCharCode(65 + i)}</span>
        <span className="font-semibold"><MathFormattedText text={option} /></span>
      </li>)}
    </ul>
  </div>;
}
