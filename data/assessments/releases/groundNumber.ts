import { GROUND_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS as legacy } from "../groundNumberNexusIndependentPosttest";
import frozen from "./groundNumberV3.json" with { type: "json" };
import type { PrepNumberCandidate } from "../candidates/prep-number/types";
import type { DesignedForm } from "../design/assessmentContract";
import type { Question } from "../posttests";

export function groundNumberReleaseItem(question: {id?:string;type?:string;visual?:unknown}): PrepNumberCandidate | null {
  if(question.type!=="prepNumberTask" || !question.visual || typeof question.visual!=="object") return null;
  const item=(question.visual as {item?:PrepNumberCandidate}).item;
  return item && item.id===question.id ? item : null;
}
export const GROUND_NUMBER_V3_FORMS = Object.fromEntries(Object.entries(frozen).map(([form,items])=>[form,
  items.map((source,index)=>{
    const short=form==="pretest"?"pre":form==="posttest"?"post":form.replace("diagnostic-","");
    const id=`y0-number-${short}-${String(index+1).padStart(2,"0")}-v3`;
    const item={...structuredClone(source),id} as PrepNumberCandidate;
    const linked = legacy.filter(q=>q.curriculumCodes?.includes(item.slot.descriptor));
    return {
      linkedWeeks:[...new Set(linked.flatMap(q=>q.linkedWeeks??[]))],
      linkedLessons:[...new Set(linked.flatMap(q=>q.linkedLessons??[]))],
      id,version:"3.0.0",type:"prepNumberTask",prompt:item.prompt,
      correctAnswer:"Use the recorded task rules; more than one valid model may be possible.",
      skillId:item.slot.id,skillLabel:item.slot.evidence,
      curriculumCodes:[item.slot.descriptor],strand:"Number and Algebra",difficultyBand:"ground-number",
      visual:{type:"prep_number_task",item},
      bankId:`number-nexus-ground-${form}-v3`,
    };
  }),
])) as Record<DesignedForm,Array<Question & {version:string;bankId:string}>>;
