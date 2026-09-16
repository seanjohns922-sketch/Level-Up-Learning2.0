import {createUncalibratedItemStatistics} from '../assessmentItemStandard';
export const YEAR3_MEASUREMENT_FORMS=['pretest','posttest','start','mid','end'] as const;
export type Measurement3Visual={type:'measurement_year3_panel';task:'object'|'ruler'|'clock'|'scale'|'jug'|'angle'|'benchmark'|'duration'|'planks';description:string;values?:number[];labels?:string[];arts?:string[];unit?:string;hour?:number;minute?:number;start?:number;angle?:number;rotation?:number;compareArms?:boolean;quantity?:number;object?:'pencil'|'plank';};
export const YEAR3_MEASUREMENT_BLUEPRINT=[
 ['AC9M3M01','Choose a mass unit','easy'],['AC9M3M02','Read a centimetre ruler','easy'],['AC9M3M03','Convert hours to minutes','easy'],['AC9M3M04','Read five-minute time','easy'],['AC9M3M05','Compare with a right angle','easy'],
 ['AC9M3M01','Estimate length from a benchmark','moderate'],['AC9M3M02','Read a labelled mass scale','easy'],['AC9M3M03','Convert minutes to seconds','moderate'],['AC9M3M04','Read time to the minute','moderate'],['AC9M3M05','Relate a turn to right angles','moderate'],
 ['AC9M3M01','Estimate mass from a benchmark','moderate'],['AC9M3M02','Read a labelled measuring jug','moderate'],['AC9M3M03','Compare durations in hours and minutes','moderate'],['AC9M3M04','Match analogue and digital time','moderate'],['AC9M3M05','Compare angles with different arm lengths','moderate'],
 ['AC9M3M02','Find a length difference','moderate'],['AC9M3M01','Estimate capacity from a benchmark','challenging'],['AC9M3M02','Measure from a non-zero ruler mark','challenging'],['AC9M3M04','Read time near the next hour','challenging'],['AC9M3M03','Convert days to hours','moderate'],
] as const;
function make(form:typeof YEAR3_MEASUREMENT_FORMS[number],f:number){
 const items:{prompt:string;correctAnswer:string;visual:Measurement3Visual;options?:string[]}[]=[];
 const v=(task:Measurement3Visual['task'],description:string,extra:Partial<Measurement3Visual>={}):Measurement3Visual=>({type:'measurement_year3_panel',task,description,...extra});
 const add=(prompt:string,answer:string,visual:Measurement3Visual,options?:string[])=>items.push({prompt,correctAnswer:answer,visual,options});
 const hour=(h:number)=>(h-1)%12+1;
 const time=(h:number,m:number)=>`${hour(h)}:${String(m).padStart(2,'0')}`;
 const clock=(h:number,m:number)=>v('clock','Read the clock face.',{hour:hour(h),minute:m});
 const massObjects=[['full school bag','backpack'],['large pumpkin','pumpkin'],['watermelon','watermelon'],['chair','chair'],['full bucket','bucket']];const [massName,massArt]=massObjects[f];
 add(`Which unit measures the mass of this ${massName}?`,'Kilograms',v('object',`A ${massName}.`,{arts:[`week2-3d/${massArt}.png`]}),['Grams','Kilograms','Millilitres']);
 add('How long is the pencil in centimetres?',String(8+f),v('ruler','Read the pencil from end to end. The ruler is marked in centimetres.',{values:[8+f],start:0,object:'pencil'}));
 const hours=[2,3,4,2,3][f];add('How many minutes is this?',String(hours*60),v('duration','Convert the duration to minutes.',{values:[hours],unit:'hours',labels:['Duration']}));
 const h=hour(7+f),m=[25,35,20,40,25][f];add('What time does the clock show?',time(h,m),clock(h,m),[time(h,m),time(h,m+5),time(h+1,m)]);
 const comparisonAngle=[40,130,60,120,140][f];
 add('How does the shaded angle compare with a right angle?',comparisonAngle<90?'Less than a right angle':'Greater than a right angle',v('angle','Look at angle A, shaded purple.',{angle:comparisonAngle,rotation:f*15}),['Less than a right angle','Equal to a right angle','Greater than a right angle']);
 const desks=[3,4,2,3,4][f];add('About how many metres long is the row?',String(desks),v('benchmark','Each desk is about 1 metre long. The desks touch end to end.',{quantity:desks,values:[1],unit:'m',labels:['One desk'],arts:['everyday-3d/object-desk.png']}));
 const mass=[400,600,300,700,500][f];add('What mass does the scale show in grams?',String(mass),v('scale','Read the scale. Its numbered marks are in grams.',{values:[mass],unit:'g'}));
 const minutes=[3,4,2,3,4][f];add('How many seconds is this?',String(minutes*60),v('duration','Convert the duration to seconds.',{values:[minutes],unit:'minutes',labels:['Duration']}));
 const hm=hour(8+f),mm=[47,43,48,42,46][f];add('What time does the clock show?',time(hm,mm),clock(hm,mm),[time(hm,mm),time(hm,mm-5),time(hm+1,mm)]);
 add('How many right angles make this half turn?','2',v('angle','Follow the arrow from Start to Finish.',{angle:180,rotation:f*30}),['1','2','4']);
 const apples=[3,4,3,4,3][f],appleMass=[150,150,200,200,250][f];add('About how many grams do these apples weigh altogether?',String(apples*appleMass),v('benchmark',`One apple weighs about ${appleMass} grams. The apples are similar sizes.`,{quantity:apples,values:[appleMass],unit:'g',labels:['One apple'],arts:['week2-3d/apple.png']}));
 const water=[400,600,300,700,500][f];add('How much water is in the jug, in millilitres?',String(water),v('jug','Read the water level. The numbered marks show millilitres.',{values:[water],unit:'mL'}));
 const shorter=[45,35,40,25,50][f];add('How many minutes longer is activity A?',String(60-shorter),v('duration','Compare the two activity times.',{values:[1,shorter],labels:['Activity A: 1 hour',`Activity B: ${shorter} minutes`]}));
 const hd=hour(11+f),md=[13,17,12,18,14][f];add('Which digital time matches this clock?',time(hd,md),clock(hd,md),[time(hd,md),time(hd,md+5),time(hd+1,md)]);
 add('Which opening makes the larger angle?','Both are equal',v('angle','Compare the openings, labelled A and B.',{angle:[50,60,45,55,65][f],compareArms:true,rotation:f*10}),['A','B','Both are equal']);
 const a=[84,76,93,85,74][f],b=[57,48,65,58,46][f];add('How many centimetres longer is plank A?',String(a-b),v('planks','Compare the two timber plank lengths.',{values:[a,b],labels:['Plank A','Plank B'],unit:'cm',object:'plank'}));
 const cups=[3,4,3,4,3][f],cupSize=[250,200,200,250,150][f];add('About how many millilitres do these full cups hold altogether?',String(cups*cupSize),v('benchmark',`One cup holds about ${cupSize} millilitres. All cups are the same size.`,{quantity:cups,values:[cupSize],unit:'mL',labels:['One cup'],arts:['containers-3d/cup.png']}));
 const offset=[2,3,4,2,3][f],length=[9,8,9,8,9][f];add('How long is the pencil in centimetres?',String(length),v('ruler','Read the pencil from end to end. The ruler is marked in centimetres.',{values:[length],start:offset,object:'pencil'}));
 const hc=hour(4+f),mc=[57,56,58,57,56][f];add('What time does the clock show?',time(hc,mc),clock(hc,mc),[time(hc,mc),time(hc+1,mc),time(hc,mc-5)]);
 const days=[2,3,2,3,2][f];add('How many hours is this?',String(days*24),v('duration','Convert the duration to hours.',{values:[days],unit:'days',labels:['Duration']}));
 return items.map((q,i)=>{const[code,skill,difficulty]=YEAR3_MEASUREMENT_BLUEPRINT[i];return {...q,id:`y3-measurement-review-${form}-${String(i+1).padStart(2,'0')}`,version:'1.0.0-review.1',form,type:q.options?'mcq':'numeric',options:q.options?[...q.options.slice((f+i)%q.options.length),...q.options.slice(0,(f+i)%q.options.length)]:undefined,readAloudText:q.prompt,primaryDescriptorCode:code,curriculumCodes:[code],skillId:`y3-measurement-slot-${i+1}`,skillLabel:skill,structureKey:`y3-measurement-slot-${i+1}`,difficulty,statistics:createUncalibratedItemStatistics(difficulty),scoring:{kind:'exact',correctResponse:q.correctAnswer},inputMode:'numeric',strand:'Measurement'};});
}
export const YEAR3_MEASUREMENT_FIVE_FORMS=Object.fromEntries(YEAR3_MEASUREMENT_FORMS.map((f,i)=>[f,make(f,i)])) as Record<typeof YEAR3_MEASUREMENT_FORMS[number],ReturnType<typeof make>>;
