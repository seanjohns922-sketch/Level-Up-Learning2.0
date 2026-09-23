import frozen from './statistica-v3.json' with {type:'json'};
import type {AssessmentQuestion} from '../api';
import type {StatisticaForm,StatsItem} from '../revisions/level1StatisticaFiveForms';
import {statsExpected} from '@/lib/statistica-level1-review';
export function releasedStatisticaQuestions(year:string,form:StatisticaForm):AssessmentQuestion[]{
 const level=Number(year.replace('Year ',''));
 if(!Number.isInteger(level)||level<1||level>8)return [];
 const bank=(frozen as unknown as (Record<StatisticaForm,StatsItem[]>|null)[])[level]![form];
 return bank.map((item,index)=>({id:`y${level}-statistica-${form}-${String(index+1).padStart(2,'0')}-v3`,version:'3.0.0',type:'statisticaTask',prompt:item.prompt,visual:{type:'statistica_released',level,item},correctAnswer:statsExpected(item)??'',skillId:`${item.code}-skill-${item.slot}`,skillLabel:item.skillLabel,strand:'statistics',curriculumCodes:[item.code],linkedWeeks:level<=6?[item.week]:[],linkedLessons:[],difficultyBand:item.difficulty})) as unknown as AssessmentQuestion[];
}
