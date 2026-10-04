'use client';
import ReadAloudBtn from '@/components/ReadAloudBtn';

export const DECIMAL_EXAMPLES={
 division:{question:'3.6 ÷ 0.4 = ?',meaning:'How many groups of 0.4 fit into 3.6?',rows:[['Use tenths','3.6 is 36 tenths.','0.4 is 4 tenths.'],['Count the groups','36 ÷ 4 = 9 groups.'],['Answer','3.6 ÷ 0.4 = 9']],steps:['Multiply both numbers by 10: 3.6 becomes 36; 0.4 becomes 4.','Both amounts are now counted in tenths. The number of groups stays the same.','36 ÷ 4 = 9. Check: 9 × 0.4 = 3.6.'],caution:'For division, multiply BOTH numbers by the same amount.'},
 multiplication:{question:'0.6 × 0.4 = ?',meaning:'What is four tenths of six tenths?',rows:[['Use the whole-number fact','6 × 4 = 24'],['Put the decimal back','Tenths × tenths gives hundredths.','24 hundredths is 0.24.'],['Answer','0.6 × 0.4 = 0.24']],steps:['Start with the whole-number fact: 6 × 4 = 24.','Each original number is divided by 10, so divide 24 by 100.','24 ÷ 100 = 0.24. This is less than 0.6 because we only take part of it.'],caution:'For multiplication, account for BOTH decimal places: 24 becomes 0.24, not 2.4.'}
} as const;
export type DecimalExampleMode=keyof typeof DECIMAL_EXAMPLES;
export default function Number7DecimalExample({mode,onModeChange}:{mode:DecimalExampleMode;onModeChange:(mode:DecimalExampleMode)=>void}){
 const example=DECIMAL_EXAMPLES[mode];
 const speech=[mode,example.question,example.meaning,...example.rows.flat()].join('. ');
 return <div>
  <div className="mb-4 flex flex-wrap items-center gap-2">
   {(['division','multiplication'] as const).map(value=><button type="button" key={value} aria-pressed={mode===value} onClick={()=>onModeChange(value)} className={`min-h-11 rounded-lg border border-teal-700 px-4 py-2 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 ${mode===value?'bg-teal-800 text-white':'bg-white text-teal-900'}`}>{value==='division'?'Division':'Multiplication'}</button>)}
   <ReadAloudBtn text={speech} label="Read example"/>
  </div>
  <p className="text-2xl font-bold">{example.question}</p>
  <p className="mt-2 text-base">{example.meaning}</p>
  <div className="mt-4 space-y-3">{example.rows.map(([label,...lines])=><div key={label} className="rounded-lg bg-teal-50 p-3"><h4 className="text-sm font-bold text-teal-900">{label}</h4>{lines.map(line=><p key={line} className="mt-1 text-lg font-semibold">{line}</p>)}</div>)}</div>
 </div>;
}
