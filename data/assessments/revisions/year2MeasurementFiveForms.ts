import {createUncalibratedItemStatistics} from '../assessmentItemStandard';
import type {Measurement1Visual} from './year1MeasurementFiveForms';
export const YEAR2_MEASUREMENT_FORMS=['pretest','posttest','start','mid','end'] as const;
export type Measurement2Visual={type:'measurement_year2_panel';task:'clock'|'calendar'|'fraction'|'turn'|'precision';description:string;hour?:number;minute?:number;month?:number;dates?:number[];parts?:number;shaded?:number;unequal?:boolean;steps?:number;showEnd?:boolean;object?:'sandwich'|'ribbon'|'paper';variant?:number};
export const YEAR2_MEASUREMENT_BLUEPRINT=[
 ['AC9M2M01','Use equal length units','easy'],['AC9M2M02','Recognise quarters','easy'],['AC9M2M03','Count days between events','moderate'],['AC9M2M04','Read the hour','easy'],['AC9M2M05','Identify a quarter turn','easy'],
 ['AC9M2M01','Compare lengths in the same units','moderate'],['AC9M2M02','Recognise eighths','moderate'],['AC9M2M03','Find a later date','moderate'],['AC9M2M04','Read half past','moderate'],['AC9M2M05','Apply a half turn','moderate'],
 ['AC9M2M01','Compare masses in equal cubes','moderate'],['AC9M2M01','Compare capacities in equal cups','moderate'],['AC9M2M02','Check equal halves','moderate'],['AC9M2M03','Find a date two weeks later','challenging'],['AC9M2M04','Read quarter past','moderate'],
 ['AC9M2M05','Identify a three-quarter turn','moderate'],['AC9M2M01','Use smaller units for a gap','challenging'],['AC9M2M03','Find a weekday from a date','easy'],['AC9M2M04','Read quarter to','challenging'],['AC9M2M05','Identify a full turn','moderate'],
] as const;
function make(form:typeof YEAR2_MEASUREMENT_FORMS[number],f:number){
 const items:{prompt:string;correctAnswer:string;options?:string[];visual:Measurement1Visual|Measurement2Visual}[]=[];
 const add=(prompt:string,correctAnswer:string,visual:Measurement1Visual|Measurement2Visual,options?:string[])=>items.push({prompt,correctAnswer,visual,options});
 const old=(task:Measurement1Visual['task'],labels:string[],description:string,extra:Partial<Measurement1Visual>={}):Measurement1Visual=>({type:'measurement_year1_panel',task,labels,description,...extra});
 const v=(task:Measurement2Visual['task'],description:string,extra:Partial<Measurement2Visual>={}):Measurement2Visual=>({type:'measurement_year2_panel',task,description,variant:f,...extra});
 const clock=(hour:number,minute:number)=>v('clock','Read the clock face.',{hour,minute});
 const hour=(n:number)=>(n-1)%12+1;
 const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
 const month=[3,5,8,10,4][f],start=5+f;
 const fair=f%3,variants=(['gap','gap','overlap'] as ('fair'|'gap'|'overlap')[]);variants[fair]='fair';variants[(fair+1)%3]='gap';variants[(fair+2)%3]='overlap';
 add('Which row measures the strip correctly?','ABC'[fair],old('fair',['A','B','C'],'Use equal blocks, touching end to end.',{values:[6,6,6],unit:'blocks',variants}),['A','B','C']);
 add('What fraction of the sandwich is shaded?','One quarter',v('fraction','The sandwich is cut into equal pieces.',{parts:4,shaded:1,object:'sandwich'}),['One half','One quarter','One eighth']);
 add('How many days pass from planting to checking?',String(5+f%2),v('calendar',`Planting: ${start} ${months[month]}. Checking: ${start+5+f%2} ${months[month]}.`,{month,dates:[start,start+5+f%2]}));
 const h=hour(3+f);add('What time does the clock show?',`${h} o'clock`,clock(h,0),[`${h} o'clock`,`${hour(h+1)} o'clock`,`Half past ${h}`]);
 add('How much did the pointer turn?','Quarter turn',v('turn','Follow the clockwise arrow from Start to Finish.',{steps:1,showEnd:true}),['Quarter turn','Half turn','Full turn']);
 const lengths=[7+f,4+f];add('How many blocks longer is ribbon A?',String(lengths[0]-lengths[1]),old('units',['Ribbon A','Ribbon B'],'Both ribbons use the same-sized blocks.',{values:lengths,unit:'blocks'}));
 add('What fraction of the ribbon is shaded?','One eighth',v('fraction','The ribbon is cut into equal pieces.',{parts:8,shaded:1,object:'ribbon'}),['One quarter','One half','One eighth']);
 const later=start+8;add(`What date is four days after ${later} ${months[month]}?`,String(later+4),v('calendar',`The marked date is ${later} ${months[month]}. Enter the day number.`,{month,dates:[later]}));
 const hh=hour(6+f);add('What time does the clock show?',`Half past ${hh}`,clock(hh,30),[`Half past ${hh}`,`${hh} o'clock`,`Half past ${hour(hh+1)}`]);
 const directions=['Up','Right','Down','Left'];const facing=f%4;add('The pointer makes a half turn. Where will it point?',directions[(facing+2)%4],v('turn',`Start facing ${directions[facing].toLowerCase()}. Make a half turn clockwise.`,{steps:2,showEnd:false}),[directions[(facing+1)%4],directions[(facing+2)%4],directions[(facing+3)%4]]);
 const mass=[12+f,8+f%2];add('How many cubes heavier is the book?',String(mass[0]-mass[1]),old('objects',['Book','Apple'],'Each object balances with these equal cubes.',{values:mass,unit:'equal cubes',arts:['week2-3d/book.png','week2-3d/apple.png']}));
 const caps=[5+f,9+f,7+f];add('How many more cups fit in B than A?',String(caps[1]-caps[0]),old('capacity',['A','B','C'],'Each container is filled using the same cup.',{values:caps,unit:'cups',arts:['containers/jug.png','containers/bucket.png','containers/bottle.png']}));
 add('Are these two pieces halves?','No, the pieces are not equal',v('fraction','Look at the two pieces of paper.',{parts:2,shaded:1,unequal:true,object:'paper'}),['Yes, there are two pieces','No, the pieces are not equal','Yes, both pieces are paper']);
 const twoWeeks=3+f;add(`What date is two weeks after ${twoWeeks} ${months[month]}?`,String(twoWeeks+14),v('calendar',`Start at ${twoWeeks} ${months[month]}. Enter the day number.`,{month,dates:[twoWeeks]}));
 const hp=hour(8+f);add('What time does the clock show?',`Quarter past ${hp}`,clock(hp,15),[`Quarter past ${hp}`,`Quarter to ${hp}`,`Half past ${hp}`]);
 add('How much did the pointer turn?','Three-quarter turn',v('turn','Follow the clockwise arrow from Start to Finish.',{steps:3,showEnd:true}),['Quarter turn','Half turn','Three-quarter turn']);
 add('Which blocks measure the ribbon more accurately?','Small blocks',v('precision','The ribbon ends between two large blocks. Compare the large and small blocks.',{parts:4+f}),['Large blocks','Small blocks','Either size gives the same detail']);
 const date=11+f;const weekdays=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];const day=new Date(Date.UTC(2026,month,date)).getUTCDay();add(`Which day is ${date} ${months[month]}?`,weekdays[day],v('calendar',`Find ${date} ${months[month]} on the calendar.`,{month,dates:[date]}),[weekdays[day],weekdays[(day+1)%7],weekdays[(day+6)%7]]);
 const ht=hour(4+f);add('What time does the clock show?',`Quarter to ${hour(ht+1)}`,clock(ht,45),[`Quarter to ${hour(ht+1)}`,`Quarter to ${ht}`,`Quarter past ${ht}`]);
 add('How much did the pointer turn?','Full turn',v('turn','Follow the clockwise arrow back to Start.',{steps:4,showEnd:true}),['Half turn','Three-quarter turn','Full turn']);
 return items.map((q,i)=>{const [code,skill,difficulty]=YEAR2_MEASUREMENT_BLUEPRINT[i];return {...q,id:`y2-measurement-review-${form}-${String(i+1).padStart(2,'0')}`,version:'1.0.0-review.1',form,type:q.options?'mcq':'numeric',options:q.options?[...q.options.slice((f+i)%q.options.length),...q.options.slice(0,(f+i)%q.options.length)]:undefined,readAloudText:q.prompt,primaryDescriptorCode:code,curriculumCodes:[code],skillId:`y2-measurement-slot-${i+1}`,skillLabel:skill,structureKey:`y2-measurement-slot-${i+1}`,difficulty,statistics:createUncalibratedItemStatistics(difficulty),scoring:{kind:'exact',correctResponse:q.correctAnswer},inputMode:'numeric',strand:'Measurement'};});
}
export const YEAR2_MEASUREMENT_FIVE_FORMS=Object.fromEntries(YEAR2_MEASUREMENT_FORMS.map((f,i)=>[f,make(f,i)])) as Record<typeof YEAR2_MEASUREMENT_FORMS[number],ReturnType<typeof make>>;
