import frozen from './starpath-v9.json' with {type:'json'};
import type {AssessmentQuestion} from '../api';
import type {GroundStarpathForm} from '../revisions/groundStarpathFiveForms';
import {expectedReleasedStarpath,type StarpathReleaseVisual} from '@/lib/starpath-release-response';
export const STARPATH_RELEASE_VERSION=1;
export function releasedStarpathQuestions(year:string,form:GroundStarpathForm):AssessmentQuestion[]{
 const level=['Prep','Foundation','Year 0','Ground'].includes(year)?0:Number(year.replace('Year ',''));
 if(!Number.isInteger(level)||level<0||level>8)return [];
 const bank=frozen[level][form];
 return bank.map((item,index)=>{
  const visual={type:'starpath_released',level,item} as StarpathReleaseVisual;
  return {id:`y${level}-starpath-${form}-${String(index+1).padStart(2,'0')}-v9`,version:'9.0.0',type:'starpathTask',prompt:item.prompt,visual,correctAnswer:expectedReleasedStarpath(visual),skillId:item.primaryDescriptorCode,skillLabel:item.skillLabel,strand:'space',curriculumCodes:[item.primaryDescriptorCode],linkedWeeks:'linkedWeeks' in item?item.linkedWeeks:[],linkedLessons:[],difficultyBand:item.difficulty};
 }) as unknown as AssessmentQuestion[];
}
