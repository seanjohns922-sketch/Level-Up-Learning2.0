import frozen from './chance-v1.json' with {type:'json'};
import type {AssessmentQuestion} from '../api';
import type {CHForm,CHItem} from '../revisions/level3ChanceHollowFiveForms';
export function releasedChanceQuestions(year:string,form:CHForm):AssessmentQuestion[]{
 const level=Number(year.replace('Year ',''));if(!Number.isInteger(level)||level<3||level>8)return [];
 const bank=(frozen as unknown as (Record<CHForm,CHItem[]>|null)[])[level]![form];
 return bank.map((item,index)=>({id:`y${level}-chance-${form}-${String(index+1).padStart(2,'0')}-v1`,version:'1.0.0',type:'chanceTask',prompt:item.prompt,visual:{type:'chance_released',level,item},correctAnswer:'structured',reviewFeedback:item.explanation,skillId:`${item.code}-skill-${item.slot}`,skillLabel:item.skill,strand:'probability',curriculumCodes:[item.code],linkedWeeks:level<=6?[item.week]:[],linkedLessons:[],difficultyBand:item.slot<=6?'accessible':item.slot<=20?'moderate':'challenging'})) as unknown as AssessmentQuestion[];
}
