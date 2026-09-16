import {createUncalibratedItemStatistics} from '../assessmentItemStandard';
import type {MeasurelandsAnswerFormat} from '../measurelandsPresentation';
export const YEAR4_MEASUREMENT_FORMS=['pretest','posttest','start','mid','end'] as const;
export type Measurement4Visual={type:'measurement_year4_panel';task:'interval'|'ruler'|'perimeter'|'duration'|'angle'|'scale'|'area'|'timeline'|'jug'|'thermometer';description:string;values:number[];labels?:string[];unit?:string;start?:number;rotation?:number;compareArms?:boolean;lShape?:boolean;halfCells?:boolean;areaCells?:Array<[number,number,'full'|'ne'|'nw'|'se'|'sw']>;};
export const YEAR4_MEASUREMENT_BLUEPRINT=[
 ['AC9M4M01','Read intervals on a scale','easy'],['AC9M4M01','Read partial centimetres','moderate'],['AC9M4M02','Measure a rectangle perimeter','easy'],['AC9M4M03','Convert hours and minutes','easy'],['AC9M4M04','Identify an obtuse angle','easy'],
 ['AC9M4M01','Read an unlabelled mass mark','moderate'],['AC9M4M02','Measure area using square units','easy'],['AC9M4M03','Find elapsed time across an hour','moderate'],['AC9M4M04','Recognise a straight angle','easy'],['AC9M4M01','Read partial litre capacity','moderate'],
 ['AC9M4M02','Measure an L-shaped perimeter','challenging'],['AC9M4M03','Find a finishing time','moderate'],['AC9M4M04','Compare angles with unequal arms','moderate'],['AC9M4M01','Read a thermometer','moderate'],['AC9M4M02','Compare areas on equal grids','moderate'],
 ['AC9M4M03','Find elapsed time across noon','challenging'],['AC9M4M04','Identify a reflex angle','moderate'],['AC9M4M01','Measure from a non-zero ruler mark','challenging'],['AC9M4M02','Measure irregular area using whole and half squares','challenging'],['AC9M4M03','Find a finish time after two activities','challenging'],
] as const;
const time=(n:number)=>`${Math.floor(n/60)%12||12}:${String(n%60).padStart(2,'0')} ${n<720?'am':'pm'}`;
const hhmm=(n:number)=>String(Math.floor(n/60)*100+n%60).padStart(4,'0');
function make(form:typeof YEAR4_MEASUREMENT_FORMS[number],f:number){
 const items:{prompt:string;correctAnswer:string;visual:Measurement4Visual;options?:string[];answerFormat?:MeasurelandsAnswerFormat}[]=[];
 const v=(task:Measurement4Visual['task'],description:string,values:number[],extra:Partial<Measurement4Visual>={}):Measurement4Visual=>({type:'measurement_year4_panel',task,description,values,...extra});
 const add=(prompt:string,answer:string,visual:Measurement4Visual,unit?:string,options?:string[],isTime=false)=>items.push({prompt,correctAnswer:answer,visual,options,answerFormat:options?undefined:isTime?{kind:'time',storage:'hhmm',mode:'12h_meridiem',ariaLabel:'Enter the hour and two-digit minutes, then choose AM or PM'}:{kind:'number',unit,ariaLabel:`Answer${unit?' in '+unit:''}`}});
 const step=[20,25,50,20,25][f];add('How many millilitres does each small interval show?',String(step),v('interval','The marks are equally spaced.',[step*4,4],{unit:'mL'}),'mL');
 const pencil=[11.4,12.6,10.7,11.8,12.3][f];add('How long is the pencil in centimetres?',String(pencil),v('ruler','Read both ends of the pencil. The ruler shows centimetres and millimetres.',[pencil],{start:0}),'cm');
 const w=[7,6,8,7,9][f],h=[3,4,3,4,3][f];add('What is the perimeter of this garden, in metres?',String(2*(w+h)),v('perimeter','Find the distance around the whole garden.',[w,h],{unit:'m'}),'m');
 const mins=[135,150,165,195,210][f];add('How many minutes is this altogether?',String(mins),v('duration','Convert the whole duration to minutes.',[mins],{labels:[`${Math.floor(mins/60)} hours ${mins%60} minutes`]}),'minutes');
 add('What type of angle is shaded?','Obtuse',v('angle','Look at the purple angle A.',[[115,125,135,120,140][f]],{rotation:f*12}),undefined,['Acute','Right','Obtuse','Straight']);
 const mass=[450,650,350,750,550][f];add('What mass does the scale show in grams?',String(mass),v('scale','Read the mass of the book on the scale.',[mass]),'g');
 const aw=[5,6,7,5,6][f],ah=[4,3,3,5,4][f];add('What is the area in square centimetres?',String(aw*ah),v('area','Each small square has an area of 1 square centimetre.',[aw,ah]),'cm²');
 const begin=[855,935,975,875,915][f],elapsed=[50,45,50,55,55][f];add('How many minutes does the activity last?',String(elapsed),v('timeline','The activity starts and finishes on the same afternoon.',[begin,begin+elapsed],{labels:[`Start: ${time(begin)}`,`Finish: ${time(begin+elapsed)}`]}),'minutes');
 add('What type of angle does the purple arc show?','Straight',v('angle','Look at angle A. The arc shows the turn between the arms.',[180],{rotation:f*18}),undefined,['Right','Straight','Reflex','Full revolution']);
 const capacity=[1.25,1.75,0.75,1.25,1.75][f];add('How much water is in the jug, in litres?',String(capacity),v('jug','Read the water level on the litre scale.',[capacity]),'L');
 const lw=[7,8,9,8,7][f],lh=[6,7,6,6,7][f];add('What is the perimeter of the garden, in metres?',String(2*(lw+lh)),v('perimeter','Find the distance around all six sides.',[lw,lh,3,2],{lShape:true,unit:'m'}),'m');
 const start=[1085,1105,1095,1115,1075][f],duration=[50,50,45,45,55][f];add('What time does the activity finish?',hhmm(start+duration),v('timeline','Enter the hour and two-digit minutes. Choose AM or PM.',[start,duration],{labels:[`Start: ${time(start)}`,`Lasts: ${duration} minutes`]}),undefined,undefined,true);
 add('Which shaded angle is larger?','Both are equal',v('angle','Compare angles A and B. Look at the openings.',[[110,120,130,115,125][f]],{compareArms:true,rotation:f*10}),undefined,['A','B','Both are equal']);
 const temperature=[18,23,27,16,32][f];add('What temperature is shown in degrees Celsius?',String(temperature),v('thermometer','Read the top of the red column.',[temperature]),'°C');
 const cols=[6,7,8,6,7][f];add('How much larger is area A, in square centimetres?',String(cols),v('area','Every small square is 1 square centimetre. Both grids use the same-sized squares.',[cols,4,cols,3],{labels:['A','B']}),'cm²');
 const noon=[700,690,695,685,705][f],end=[785,785,780,780,790][f];add('How many minutes pass from start to finish?',String(end-noon),v('timeline','The activity starts before noon and finishes after noon on the same day.',[noon,end],{labels:[`Start: ${time(noon)}`,`Finish: ${time(end)}`]}),'minutes');
 add('What type of angle is shaded?','Reflex',v('angle','Look at the large purple angle A.',[[230,250,240,220,260][f]],{rotation:f*10}),undefined,['Acute','Obtuse','Straight','Reflex']);
 const offset=[2.3,3.2,2.4,3.1,2.6][f],length=[8.4,8.5,9.3,8.6,9.2][f];add('How long is the pencil in centimetres?',String(length),v('ruler','Measure from one pencil end to the other. The ruler shows centimetres and millimetres.',[length],{start:offset}),'cm');
 const gridW=[5,6,7,6,5][f];
 const areaCells:NonNullable<Measurement4Visual['areaCells']>=[];
 for(let r=0;r<4;r++)for(let c=0;c<gridW;c++){
  let part:NonNullable<Measurement4Visual['areaCells']>[number][2]='full';
  if(r===0||r===3){if(c===0||c===gridW-1)continue;if(c===1)part=r===0?'se':'ne';if(c===gridW-2)part=r===0?'sw':'nw';}
  if(r===1&&c===0)part='se';if(r===1&&c===gridW-1)part='sw';
  if(f>=3){part=({full:'full',ne:'se',nw:'sw',se:'ne',sw:'nw'} as const)[part];areaCells.push([c,3-r,part]);}else areaCells.push([c,r,part]);
 }
 add('What is the shaded area in square centimetres?',String(4*gridW-7),v('area','Each grid square is 1 square centimetre.',[gridW,4],{areaCells}),'cm²');
 const trip=[635,625,645,615,655][f],travel=[80,85,75,95,70][f],breakM=[25,30,25,30,25][f];add('What time does the break finish?',hhmm(trip+travel+breakM),v('timeline','The trip is followed straight away by the break. Enter hours, minutes and AM or PM.',[trip,travel,breakM],{labels:[`Trip starts: ${time(trip)}`,`Trip lasts: ${travel} minutes`,`Break lasts: ${breakM} minutes`]}),undefined,undefined,true);
 return items.map((q,i)=>{const[code,skill,difficulty]=YEAR4_MEASUREMENT_BLUEPRINT[i];return {...q,id:`y4-measurement-review-${form}-${String(i+1).padStart(2,'0')}`,version:'1.0.0-review.1',form,type:q.options?'mcq':'numeric',options:q.options?[...q.options.slice((f+i)%q.options.length),...q.options.slice(0,(f+i)%q.options.length)]:undefined,readAloudText:q.prompt,primaryDescriptorCode:code,curriculumCodes:[code],skillId:`y4-measurement-slot-${i+1}`,skillLabel:skill,structureKey:`y4-measurement-slot-${i+1}`,difficulty,statistics:createUncalibratedItemStatistics(difficulty),scoring:{kind:'exact',correctResponse:q.correctAnswer},inputMode:'decimal' as const,strand:'Measurement'};});
}
export const YEAR4_MEASUREMENT_FIVE_FORMS=Object.fromEntries(YEAR4_MEASUREMENT_FORMS.map((f,i)=>[f,make(f,i)])) as Record<typeof YEAR4_MEASUREMENT_FORMS[number],ReturnType<typeof make>>;
