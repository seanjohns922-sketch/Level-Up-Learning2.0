import { groundNumberReleaseItem } from "@/data/assessments/releases/groundNumber";
import { parsePrepNumberSubmission, initialPrepNumberResponse } from "@/data/assessments/candidates/prep-number/scoring";
export function groundNumberHasAnswer(question:{id?:string;type?:string;visual?:unknown}, value:string|null|undefined):boolean {
  if(value==='idk'||value==='__unknown__') return true;
  const item=groundNumberReleaseItem(question);
  const r=item ? parsePrepNumberSubmission(item,value??null)?.response : null;
  if(!item||!r) return false;
  const t=item.task;
  const values=(size:number)=>r.values?.length===size&&r.values.every(n=>Number.isSafeInteger(n)&&n>=0);
  switch(t.kind) {
    case 'numerals':return values(t.targets.length);
    case 'count':case 'combine':case 'missing':case 'supply_shortfall':return values(1);
    case 'conserve':return values(1)&&typeof r.reason==='string'&&t.reasons.includes(r.reason);
    case 'order':return values(t.cards.length);
    case 'pattern':return r.symbols?.length===t.blanks&&r.symbols.every(s=>t.palette.includes(s));
    case 'match':return Number.isInteger(r.choice)&&r.choice!>=0&&r.choice!<t.choices.length;
    case 'compare':return (r.choice===0||r.choice===1)&&r.pairs?.length===t.a&&r.pairs.some(n=>n>=0);
    default:return r.placements?.length===initialPrepNumberResponse(item).placements?.length&&r.placements?.every(Number.isSafeInteger)===true;
  }
}
