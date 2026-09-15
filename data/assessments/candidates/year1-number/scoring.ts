import { YEAR1_NUMBER_AUTHORING_VERSION, type YEAR1_NUMBER_CANDIDATE_SPECS } from "./authoring";

type Item=typeof YEAR1_NUMBER_CANDIDATE_SPECS.pretest[number];
export type Year1NumberResponse={
  values?:number[];
  models?:{tens:number;ones:number}[];
  parts?:[number,number];
  /** Destination of every original object; -1 means unallocated. */
  placements?:number[];
  /** Indices into the immutable wallet, not client-supplied denominations. */
  paidCoinIds?:number[];
  choice?:string;
  reason?:string;
  unit?:string[];
  symbols?:string[];
};
const integer=(n:unknown):n is number=>typeof n==="number" && Number.isSafeInteger(n);
const ints=(v:unknown):v is number[]=>Array.isArray(v) && Array.from(v).every(integer);
const equal=(a:unknown,b:readonly number[])=>ints(a) && a.length===b.length && a.every((n,i)=>n===b[i]);
const stringsEqual=(a:unknown,b:readonly string[])=>Array.isArray(a) && a.length===b.length && Array.from(a).every((s,i)=>s===b[i]);
function model(m:unknown,tens:number,ones:number):boolean {
  if(!m || typeof m!=="object") return false;
  const v=m as {tens?:unknown;ones?:unknown};
  return integer(v.tens) && integer(v.ones) && v.tens===tens && v.ones===ones;
}
function counts(r:Year1NumberResponse,total:number,bins:number):number[]|null {
  if(!ints(r.placements) || r.placements.length!==total || r.placements.some(n=>n<0 || n>=bins)) return null;
  return Array.from({length:bins},(_,bin)=>r.placements!.filter(n=>n===bin).length);
}

/** Candidate scorer only. No runtime resolver imports this until screen and
 * persistence review. Recomputes from raw model/response evidence. */
export function scoreYear1NumberResponse(item:Item,r:Year1NumberResponse):boolean {
  if(!r || typeof r!=="object") return false;
  const t=item.task;
  switch(t.kind) {
    case "build-tens": return r.models?.length===1 && model(r.models[0],Math.floor(t.target/10),t.target%10);
    case "order": return equal(r.values,[...t.cards].sort((a,b)=>a-b));
    case "number-line": return equal(r.values,[t.target]);
    case "two-partitions": return ints(r.parts) && r.parts.length===2 && r.parts.every(n=>n>0) && r.parts[0]+r.parts[1]===t.small && r.models?.length===1 && model(r.models[0],Math.floor(t.large/10)-1,t.large%10+10);
    case "count-tens": return equal(r.values,[t.groups*t.perGroup]);
    case "make-groups": {const c=counts(r,t.total,t.total);return c!==null && c.filter(n=>n>0).every(n=>n===t.groupSize) && equal(r.values,[t.total]);}
    case "add": return equal(r.values,[t.left+t.right]);
    case "subtract": return equal(r.values,[t.whole-t.removed]);
    case "missing-part": return equal(r.values,[t.whole-t.known]) && r.reason==="Take the known part from the whole.";
    case "addition-story": {const c=counts(r,t.initial+t.arrive,2);return c!==null && c[0]===t.initial && c[1]===t.arrive && equal(r.values,[t.initial+t.arrive]);}
    case "subtraction-story": {const c=counts(r,t.initial,2);return c!==null && c[0]===t.initial-t.leave && c[1]===t.leave && equal(r.values,[t.initial-t.leave]);}
    case "money": {
      if(!ints(r.paidCoinIds) || new Set(r.paidCoinIds).size!==r.paidCoinIds.length || r.paidCoinIds.some(i=>i<0 || i>=t.wallet.length)) return false;
      const paid=r.paidCoinIds.reduce((sum,i)=>sum+t.wallet[i],0);
      return paid===t.price && equal(r.values,[t.wallet.reduce((sum,n)=>sum+n,0)-t.price]);
    }
    case "share": {const c=counts(r,t.total,t.recipients);return c!==null && c.every(n=>n===t.total/t.recipients) && equal(r.values,[t.total/t.recipients]);}
    case "group": {const c=counts(r,t.total,t.total);return c!==null && c.filter(n=>n>0).every(n=>n===t.size) && equal(r.values,[t.total/t.size]);}
    case "unequal-share": return r.choice==="No" && r.reason==="Every tray must have the same number.";
    case "skip-two": return equal(r.values,[t.terms[0]!+6,t.terms[0]!+8]);
    case "create-tens": return equal(r.values,Array.from({length:t.stages},(_,i)=>t.start+i*10)) && r.models?.length===t.stages && Array.from(r.models).every((m,i)=>model(m,(t.start+i*10)/10,0));
    case "continue-pattern": return stringsEqual(r.unit,t.unit) && stringsEqual(r.symbols,t.unit);
    case "create-pattern": return stringsEqual(r.symbols,Array.from({length:t.repetitions},()=>t.unit).flat());
  }
}

export function scoreYear1NumberSubmission(item:Item,raw:string|null) {
  let response:Year1NumberResponse|null=null;
  try {
    const v=JSON.parse(raw ?? "null");
    if(v?.itemId===item.id && v.version===YEAR1_NUMBER_AUTHORING_VERSION && v.response && typeof v.response==="object" && !Array.isArray(v.response)) response=v.response;
  } catch { /* missing or malformed evidence is not an assessed zero */ }
  return {
    itemId:item.id,itemVersion:item.version,blueprintVersion:item.blueprintVersion,
    skillSlotId:item.slot.id,curriculumCodes:[item.slot.descriptor],form:item.form,
    scorerVersion:"year1-number-evidence-1",response,
    score:response===null ? null : scoreYear1NumberResponse(item,response) ? 1 : 0,
    maximumScore:1,status:response===null ? "not-assessed" : "answered",
  } as const;
}
