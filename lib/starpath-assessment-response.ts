const PREFIX = "__starpath_evidence__:";
export function encodeStarpathResponse(questionId: string, correct: boolean, response: string): string {
  return PREFIX + JSON.stringify({questionId, correct, response});
}
export function decodeStarpathResponse(value: unknown): {questionId:string;correct:boolean;response:string} | null {
  if(typeof value !== "string" || !value.startsWith(PREFIX))return null;
  try {const v=JSON.parse(value.slice(PREFIX.length));return typeof v.questionId==="string"&&typeof v.correct==="boolean"&&typeof v.response==="string"?v:null;}catch{return null;}
}
