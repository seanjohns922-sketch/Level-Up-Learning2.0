import frozen from './pattern-v1.json' with {type:'json'};
import type {AssessmentQuestion} from '../api';
import type {PPForm,PPItem} from '../revisions/level3PatternPeaksFiveForms';
export function releasedPatternQuestions(year:string,form:PPForm):AssessmentQuestion[]{
 const level=Number(year.replace('Year ',''));if(!Number.isInteger(level)||level<3||level>8)return [];
 const bank=(frozen as unknown as (Record<PPForm,PPItem[]>|null)[])[level]![form];
 return bank.map((item,index)=>({id:`y${level}-pattern-${form}-${String(index+1).padStart(2,'0')}-v1`,version:'1.0.0',type:'patternTask',prompt:item.prompt,visual:{type:'pattern_released',level,item},correctAnswer:'structured',skillId:`${item.code}-skill-${item.slot}`,skillLabel:item.skill,strand:'algebra',curriculumCodes:[item.code],linkedWeeks:level<=6?[item.week]:[],linkedLessons:[],difficultyBand:item.difficulty})) as unknown as AssessmentQuestion[];
}
