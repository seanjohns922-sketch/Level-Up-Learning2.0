'use client';
import {MathFormattedText} from '@/components/FractionText';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {getRealmTheme} from '@/lib/useRealmTheme';

export const FRACTION_EXAMPLES={
 addition:{question:'2/3 + 1/4 = ?',fractions:[[2,3,8],[1,4,3]],calculation:'8/12 + 3/12 = 11/12',answer:'11/12',steps:['Make equal-sized parts: use twelfths.','2/3 becomes 8/12. 1/4 becomes 3/12.','Add 8 + 3. Keep 12 as the denominator.'],speech:'Addition. Two thirds plus one quarter. Two thirds equals eight twelfths: eight of twelve equal parts are shaded. One quarter equals three twelfths: three of twelve equal parts are shaded. Eight twelfths plus three twelfths equals eleven twelfths. Eleven twelfths is already simplified.'},
 subtraction:{question:'3/4 − 1/6 = ?',fractions:[[3,4,9],[1,6,2]],calculation:'9/12 − 2/12 = 7/12',answer:'7/12',steps:['Make equal-sized parts: use twelfths.','3/4 becomes 9/12. 1/6 becomes 2/12.','Subtract 9 − 2. Keep 12 as the denominator.'],speech:'Subtraction. Three quarters minus one sixth. Three quarters equals nine twelfths: nine of twelve equal parts are shaded. One sixth equals two twelfths: two of twelve equal parts are shaded. Nine twelfths minus two twelfths equals seven twelfths. Seven twelfths is already simplified.'}
} as const;
export type FractionExampleMode=keyof typeof FRACTION_EXAMPLES;

export default function Number7FractionExample({mode,onModeChange}:{mode:FractionExampleMode;onModeChange:(mode:FractionExampleMode)=>void}) {
 const example=FRACTION_EXAMPLES[mode],theme=getRealmTheme('number');
 const ink=`color-mix(in srgb, ${theme.ctaFrom} 45%, black)`;
 return <div>
  <div className="mb-4 flex flex-wrap items-center gap-2">
   {(['addition','subtraction'] as const).map(value=><button key={value} type="button" aria-pressed={value===mode} onClick={()=>onModeChange(value)} className="min-h-11 rounded-lg border px-4 py-2 font-bold focus-visible:outline-2 focus-visible:outline-offset-2" style={{background:value===mode?ink:'white',color:value===mode?'white':ink,borderColor:theme.borderRing}}>{value==='addition'?'Addition':'Subtraction'}</button>)}
   <ReadAloudBtn text={example.speech} label="Read example"/>
  </div>
  <div className="space-y-4">
   <div><p className="text-sm font-bold" style={{color:ink}}>One question</p><p className="mt-1 text-2xl font-bold"><MathFormattedText text={example.question}/></p></div>
   <div><p className="mb-2 text-sm font-bold" style={{color:ink}}>Match the denominators</p>
    {example.fractions.map(([n,d,shaded])=><div key={d} className="mb-3">
     <p className="mb-2 text-lg font-bold"><MathFormattedText text={`${n}/${d} = ${shaded}/12`}/></p>
     <div aria-hidden="true" className="grid h-6 grid-cols-12 overflow-hidden rounded border" style={{borderColor:theme.ctaFrom}}>{Array.from({length:12},(_,i)=><span key={i} className="border-r last:border-r-0" style={{borderColor:i<shaded?'#ffffff':theme.ctaFrom,background:i<shaded?theme.ctaFrom:'white'}}/>)}</div>
    </div>)}
   </div>
   <div><p className="text-sm font-bold" style={{color:ink}}>{mode==='addition'?'Add':'Subtract'}</p><p className="mt-1 text-xl font-bold"><MathFormattedText text={example.calculation}/></p><p className="mt-2 text-sm"><MathFormattedText text={`${example.answer} is already simplified.`}/></p></div>
  </div>
 </div>;
}
