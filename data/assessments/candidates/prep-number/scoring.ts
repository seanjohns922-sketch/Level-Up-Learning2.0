import { PREP_NUMBER_CANDIDATE_VERSION, type PrepNumberCandidate, type PrepNumberResponse, type PrepNumberSubmission } from "./types";

export const PREP_NUMBER_SCORER_VERSION = "prep-number-evidence-1";
const whole = (v: unknown): v is number => typeof v === "number" && Number.isSafeInteger(v);
const numbers = (v: unknown): v is number[] => Array.isArray(v) && Array.from(v).every(whole);
const equal = (a: unknown, b: readonly number[]) => numbers(a) && a.length === b.length && a.every((v,i) => v === b[i]);
function allocation(r: PrepNumberResponse, objects: number, bins: number, allowSupply = false): number[] | null {
  if (!numbers(r.placements) || r.placements.length !== objects || r.placements.some(p => p < (allowSupply ? -1 : 0) || p >= bins)) return null;
  return Array.from({length:bins}, (_,b)=>r.placements!.filter(p=>p===b).length);
}

/** Always re-score raw evidence; no trust in a saved/client correctness boolean. */
export function scorePrepNumberResponse(item: PrepNumberCandidate, r: PrepNumberResponse): boolean {
  if (!r || typeof r !== "object") return false;
  const t = item.task;
  switch (t.kind) {
    case "numerals": return equal(r.values, t.targets);
    case "count": return equal(r.values, [t.count]);
    case "combine": return equal(r.values, [t.parts[0]+t.parts[1]]);
    case "missing": return equal(r.values, [t.whole-t.part]);
    case "add": {
      const counts = allocation(r,t.start+t.supply,1,true);
      return counts !== null && counts[0] === t.start+t.change && r.placements!.slice(0,t.start).every(p=>p===0);
    }
    case "remove": { const counts = allocation(r,t.start,2); return counts !== null && counts[1]===t.change; }
    case "share": { const counts = allocation(r,t.total,t.recipients); return counts !== null && counts.every(n=>n===t.total/t.recipients); }
    case "pattern": return Array.isArray(r.symbols) && r.symbols.length===t.blanks && Array.from(r.symbols).every((s,i)=>s===t.source[(t.copy ? i : t.source.length+i)%t.source.length]);
    case "order": return equal(r.values,[...t.cards].sort((a,b)=>a-b));
    case "compare": {
      if (!numbers(r.pairs) || r.pairs.length!==t.a || r.pairs.some(p=>p< -1 || p>=t.b)) return false;
      const paired = r.pairs.filter(p=>p>=0);
      return new Set(paired).size===paired.length && paired.length===Math.min(t.a,t.b) && r.choice===(t.a>t.b ? 0 : 1);
    }
    case "partition": {
      const counts = allocation(r,t.total,2);
      return counts !== null && counts.every(n=>n>0) && (!t.previous || !equal([...counts].sort((a,b)=>a-b),[...t.previous].sort((a,b)=>a-b)));
    }
    case "match": return whole(r.choice) && r.choice>=0 && r.choice<t.choices.length && t.choices[r.choice]===t.count;
    case "group": {
      // Free grouping surface supports up to one group per object. Empty groups
      // ignored: no pre-filled number of groups reveals the answer.
      const counts = allocation(r,t.total,t.total);
      return counts !== null && counts.filter(n=>n>0).every(n=>n===t.size);
    }
    case "build": { const counts = allocation(r,t.supply,1,true); return counts !== null && counts[0]===t.target; }
    case "conserve": return equal(r.values,[t.count]) && r.reason==="Nothing was added or taken away.";
    case "provide": { const counts = allocation(r,t.supply,t.recipients,true); return counts !== null && counts.every(n=>n===1); }
  }
}

export function scorePrepNumberSubmission(item: PrepNumberCandidate, submission: PrepNumberSubmission | null) {
  const valid = submission?.itemId===item.id && submission.version===item.version;
  return {
    itemId: item.id, itemVersion: item.version, skillSlotId: item.slot.id,
    curriculumCodes: [item.slot.descriptor], blueprintVersion: item.blueprintVersion,
    form: item.form, scorerVersion: PREP_NUMBER_SCORER_VERSION,
    score: valid ? (scorePrepNumberResponse(item,submission.response) ? 1 : 0) : null,
    maximumScore: 1, response: valid ? submission.response : null,
    status: valid ? "answered" : "not-assessed",
  } as const;
}

export function parsePrepNumberSubmission(item: PrepNumberCandidate, value: string | null): PrepNumberSubmission | null {
  try {
    const parsed = JSON.parse(value ?? "null");
    return parsed && parsed.itemId===item.id && parsed.version===PREP_NUMBER_CANDIDATE_VERSION && parsed.response && typeof parsed.response==="object" && !Array.isArray(parsed.response) ? parsed : null;
  } catch { return null; }
}

export function initialPrepNumberResponse(item: PrepNumberCandidate): PrepNumberResponse {
  const t = item.task;
  switch (t.kind) {
    case "add": return {placements:[...Array<number>(t.start).fill(0),...Array<number>(t.supply).fill(-1)]};
    case "remove": return {placements:Array<number>(t.start).fill(0)};
    case "share": return {placements:t.initial ? t.initial.flatMap((n,b)=>Array<number>(n).fill(b)) : Array<number>(t.total).fill(-1)};
    case "group": case "partition": return {placements:Array<number>(t.total).fill(-1)};
    case "build": case "provide": return {placements:Array<number>(t.supply).fill(-1)};
    case "compare": return {pairs:Array<number>(t.a).fill(-1)};
    default: return {};
  }
}
