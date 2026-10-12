import ReadAloudBtn from '@/components/ReadAloudBtn';
import {MathFormattedText} from '@/components/FractionText';
export default function SkillGuideChoices({options}:{options?:string[]}) {
  if (!options || options.length < 2) return null;
  return <div className="mt-3 rounded-lg border p-3">
    <div className="flex items-center justify-between gap-3">
      <h3 className="font-bold">Choices to compare</h3>
      <ReadAloudBtn text={`Choices. ${options.join('. ')}`} />
    </div>
    <ul className="mt-2 list-disc space-y-1 pl-5">
      {options.map(option => <li key={option}><MathFormattedText text={option} /></li>)}
    </ul>
  </div>;
}
