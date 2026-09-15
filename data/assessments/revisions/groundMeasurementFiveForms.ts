import { createUncalibratedItemStatistics } from '../assessmentItemStandard';

export const GROUND_MEASUREMENT_FORMS = ['pretest','posttest','start','mid','end'] as const;
export type GroundMeasurementForm = typeof GROUND_MEASUREMENT_FORMS[number];
export const GROUND_MEASUREMENT_LABELS = {pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
export type GroundMeasurementVisual = {
 type:'measurement_ground_panel'; task:'length'|'height'|'align'|'mass'|'capacity'|'duration'|'daypart'|'weekday'|'routine';
 labels:string[]; values?:number[]; objects?:string[]; equal?:boolean; source?:number; remainder?:boolean;
 target?:string; scene?:string; art?:string; activityArts?:string[]; days?:string[]; context?:string; description:string;
};
export const GROUND_MEASUREMENT_BLUEPRINT = [
 ['AC9MFM01','Compare lengths from aligned ends','easy'],
 ['AC9MFM01','Identify the shorter object','easy'],
 ['AC9MFM01','Compare heights from a common baseline','easy'],
 ['AC9MFM01','Choose a fair direct length comparison','challenging'],
 ['AC9MFM01','Identify the heavier object on a balance','moderate'],
 ['AC9MFM01','Identify the lighter object on a balance','moderate'],
 ['AC9MFM01','Recognise equal masses on a level balance','moderate'],
 ['AC9MFM01','Use balance evidence rather than object size','challenging'],
 ['AC9MFM01','Compare capacity using a direct pouring test','moderate'],
 ['AC9MFM01','Identify the smaller capacity from pouring evidence','moderate'],
 ['AC9MFM01','Recognise equal capacity from an exact fill','moderate'],
 ['AC9MFM01','Compare durations with a common start','moderate'],
 ['AC9MFM01','Identify the event that finishes sooner','moderate'],
 ['AC9MFM02','Connect a morning scene with a familiar event','easy'],
 ['AC9MFM02','Connect a night scene with a familiar event','easy'],
 ['AC9MFM02','Identify the next weekday','moderate'],
 ['AC9MFM02','Identify the previous weekday','moderate'],
 ['AC9MFM02','Continue the weekly cycle after Sunday','moderate'],
 ['AC9MFM02','Sequence morning, lunchtime and afternoon','moderate'],
 ['AC9MFM02','Sequence three pictured daily events','challenging'],
] as const;
const weekdays=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const colours=['Red','Blue','Green','Purple','Orange'];
const children=['Mia','Noah','Ava','Leo','Zoe'];
const objects=[['Stone','Sponge'],['Tin','Box'],['Book','Ball'],['Block','Cup'],['Apple','Bag']];
const tasks=[['Drawing','Building a sandcastle'],['Painting','Reading'],['Washing hands','Brushing teeth'],['Putting on shoes','Drawing'],['Reading','Eating lunch']];
const taskArts=[['duration-3d/drawing.png','duration-3d/sandcastle.png'],['routine-3d/routine-art.png','duration-3d/reading.png'],['duration-3d/wash-hands.png','duration-3d/brush-teeth.png'],['duration-3d/shoes.png','duration-3d/drawing.png'],['duration-3d/reading.png','duration-3d/lunch.png']];
const routineExamples=[['Breakfast','Lunch','Bedtime'],['Get dressed','Eat lunch','Go to bed'],['Pack school bag','Have lunch','Put on pyjamas'],['Morning story','Lunch picnic','Bedtime story'],['Morning play','Lunch break','Night-time rest']];
function make(form:GroundMeasurementForm,f:number){
 const items:Array<{prompt:string;answer:string;options:string[];visual:GroundMeasurementVisual;type:'mcq'|'number_order'}>=[];
 const pair=[colours[f],colours[(f+2)%5]];
 const leftLong=f%2===0;
 const visual=(task:GroundMeasurementVisual['task'],description:string,extra:Partial<GroundMeasurementVisual>={}):GroundMeasurementVisual=>({type:'measurement_ground_panel',task,labels:pair,description,...extra});
 function add(prompt:string,answer:string,options:string[],v:GroundMeasurementVisual,type:'mcq'|'number_order'='mcq'){items.push({prompt,answer,options,visual:v,type});}
 const lengths=leftLong?[250,160]:[160,250];
 add('Which ribbon is longer?',pair[leftLong?0:1],[...pair,'Same length'],visual('length',`Both ribbons start at the same line. ${pair[0]} and ${pair[1]} ribbons.`,{values:lengths,objects:['ribbon','ribbon']}));
 const pencilLengths=leftLong?[135,225]:[225,135];
 add('Which pencil is shorter?',pair[leftLong?0:1],[...pair,'Same length'],visual('length',`Two pencils with their left ends lined up.`,{values:pencilLengths,objects:['pencil','pencil']}));
 add('Which tower is taller?',pair[leftLong?0:1],[...pair,'Same height'],visual('height','Two towers stand on the same floor.',{values:lengths.map(n=>n*.65),objects:['tower','tower']}));
 add('How can we compare these lengths fairly?','Line up one end',['Line up one end','Leave a gap','Count the colours'],visual('align','Two ribbons start at different places. Choose how to compare their lengths.',{values:[220,160],objects:['ribbon','ribbon']}));
 const names=objects[f],heavy=f%2,heights=heavy===0?[125,75]:[75,125];
 add('Which object is heavier?',names[heavy],[...names,'Same mass'],visual('mass',`A balance holds a ${names[0].toLowerCase()} and a ${names[1].toLowerCase()}. The ${names[heavy].toLowerCase()} pan is lower.`,{labels:names,values:heights,objects:names}));
 add('Which object is lighter?',names[1-heavy],[...names,'Same mass'],visual('mass',`A balance holds a ${names[0].toLowerCase()} and a ${names[1].toLowerCase()}. The ${names[1-heavy].toLowerCase()} pan is higher.`,{labels:names,values:heights,objects:names}));
 add('What does this level balance show?','Same mass',[`${names[0]} is heavier`,`${names[1]} is heavier`,'Same mass'],visual('mass','The balance is level. Both pans are at the same height.',{labels:names,values:[100,100],objects:names,equal:true}));
 add('How can you tell the smaller object is heavier?','Its pan is lower',['It looks bigger','Its pan is lower','Its colour is darker'],visual('mass',`A small ${names[0].toLowerCase()} and a larger ${names[1].toLowerCase()} are on a balance. The small object's pan is lower.`,{labels:names,values:[125,75],objects:names,scene:'size-trap'}));
 const source=f%2;
 for(const [task,prompt] of [[8,'Which container holds more?'],[9,'Which container holds less?'],[10,'What does this pouring test show?']] as const){
  const equal=task===10;
  add(prompt,equal?'Same capacity':pair[task===8?source:1-source],[...pair,'Same capacity'],visual('capacity',`At first, ${pair[source]} is full and ${pair[1-source]} is empty. Pour from ${pair[source]} until ${pair[1-source]} is full. ${equal?'The first container is now empty.':'Some water remains in the first container.'}`,{source,remainder:!equal,equal,objects:['container','container']}));
 }
 const events=tasks[f];
 const morningArt=['timeofday-3d/wakeup.png','timeofday-3d/breakfast.png','routine-3d/routine-wakeup.png','routine-3d/routine-breakfast.png','timeofday-3d/morning.png'][f];
 const nightArt=['routine-3d/routine-bed.png','timeofday-3d/reading-bed.png','timeofday-3d/sleeping.png','routine-3d/routine-bed.png','timeofday-3d/reading-bed.png'][f];
 const morningScene=['wakes up','eats breakfast','wakes up','eats breakfast','wakes up'][f];
 const nightScene=['sleeps in bed','reads in bed','sleeps in bed','sleeps in bed','reads in bed'][f];
 add('Which activity lasts longer?',events[leftLong?0:1],[...events,'Same time'],visual('duration','Both activities start together. Each strip ends when that activity finishes.',{labels:events,values:lengths,objects:events,activityArts:taskArts[f]}));
 add('Which activity finishes sooner?',events[leftLong?1:0],[...events,'Same time'],visual('duration','Both activities start together. Each strip ends when that activity finishes.',{labels:events,values:lengths,objects:events,activityArts:taskArts[f]}));
 add('What time of day is shown?','Morning',['Morning','Afternoon','Night'],visual('daypart',`${children[f]} ${morningScene} beside a window with sunlight.`,{target:'morning',context:children[f],scene:`${children[f]} ${morningScene}.`,art:morningArt}));
 add('What time of day is shown?','Night',['Morning','Lunchtime','Night'],visual('daypart',`${children[f]} ${nightScene} beside a window with the moon and stars.`,{target:'night',context:children[f],scene:`${children[f]} ${nightScene}.`,art:nightArt}));
 const day=f;
 add('Which day comes next?',weekdays[day+1],[weekdays[day+1],weekdays[(day+6)%7],weekdays[(day+2)%7]],visual('weekday',`Today is ${weekdays[day]}. Which day is tomorrow?`,{days:[weekdays[day],'?'],context:`${children[f]}'s class day`}));
 add('Which day was yesterday?',weekdays[day],[weekdays[day],weekdays[day+1],weekdays[(day+2)%7]],visual('weekday',`Today is ${weekdays[day+1]}. Which day was yesterday?`,{days:['?',weekdays[day+1]],context:`${children[f]}'s activity day`}));
 add('Which day comes after Sunday?','Monday',['Monday','Saturday','Tuesday'],visual('weekday',`${children[f]} waters the garden on Sunday. Which day comes next?`,{days:['Sunday','?'],context:`${children[f]}'s garden roster`}));
 add('Put these times of day in order.','Morning||Lunchtime||Afternoon',['Morning','Lunchtime','Afternoon'],visual('routine',`Plan ${children[f]}'s day, starting with morning.`,{labels:['Morning','Lunchtime','Afternoon'],objects:['sunrise','lunch','sun'],scene:'dayparts',context:`${children[f]}'s day`}), 'number_order');
 const routine=routineExamples[f];
 add('Put these events in order, from morning to night.',routine.join('||'),routine,visual('routine',`The pictures show ${routine[0]} in the morning, ${routine[1]} at lunchtime and ${routine[2]} at night.`,{labels:routine,objects:['sunrise','lunch','moon'],scene:'events',context:`${children[f]}'s daily events`}), 'number_order');
 return items.map((q,i)=>{
  const [code,skillLabel,difficulty]=GROUND_MEASUREMENT_BLUEPRINT[i];
  const shift=(f+i)%q.options.length;
  const options=[...q.options.slice(shift),...q.options.slice(0,shift)];
  // An ordering item must never open with the correct order already laid out.
  if(q.type==='number_order'&&options.join('||')===q.answer)options.reverse();
  return {id:`ground-measurement-review-${form}-${String(i+1).padStart(2,'0')}-v1`,version:'1.0.0-review.1',form,bankId:`ground-measurement-${form}-review-v1`,sourcePool:'assessment_review',realmId:'measurement',yearLevel:0,strand:'Measurement',type:q.type,prompt:q.prompt,readAloudText:`${q.prompt} ${q.visual.description}`,options,correctAnswer:q.answer,answer:q.answer,visual:q.visual,primaryDescriptorCode:code,curriculumCodes:[code],skillId:`ground-measurement-slot-${i+1}`,skillLabel,structureKey:`ground-measurement-slot-${i+1}`,difficulty,statistics:createUncalibratedItemStatistics(difficulty),showFractionModels:false,scoring:{kind:'exact',correctResponse:q.answer}};
 });
}
export const GROUND_MEASUREMENT_FIVE_FORMS=Object.fromEntries(GROUND_MEASUREMENT_FORMS.map((f,i)=>[f,make(f,i)])) as Record<GroundMeasurementForm,ReturnType<typeof make>>;
