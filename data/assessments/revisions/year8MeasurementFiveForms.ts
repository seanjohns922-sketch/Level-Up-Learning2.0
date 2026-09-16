import {createUncalibratedItemStatistics} from '../assessmentItemStandard';
import type {MeasurelandsAnswerFormat} from '../measurelandsPresentation';
export const YEAR8_MEASUREMENT_FORMS=['pretest','posttest','start','mid','end'] as const;
export type Measurement8Visual={type:'measurement_year8_panel';task:'composite'|'prism'|'circle'|'timezone'|'rate'|'rightTriangle'|'model'|'house'|'diagonal';values:number[];description:string;labels?:string[];unit?:string;variant?:string;unknown?:'height'|'hypotenuse';rows?:{label:string;offset:number;detail:string}[]};
const slots=[
 [1,'Area of a composite shape','easy'],[2,'Prism capacity in litres','easy'],[3,'Circle area from radius','easy'],[4,'Convert between time zones','easy'],[5,'Calculate a rate','easy'],[6,'Find a hypotenuse','easy'],[7,'Interpret a map scale','moderate'],
 [1,'Perimeter of an L-shaped region','moderate'],[2,'Triangular prism capacity','moderate'],[3,'Circumference from diameter','moderate'],[4,'Convert 12-hour time across a half-hour zone','moderate'],[5,'Rate with mixed time units','moderate'],[6,'Find a shorter side using Pythagoras','moderate'],[7,'Plan material quantities and round appropriately','moderate'],
 [1,'Combine rectangular and triangular areas','moderate'],[2,'Use capacity to find filling time','moderate'],[3,'Perimeter of a semicircle','moderate'],[4,'Find elapsed flight time across zones','challenging'],[5,'Compare consumption rates','moderate'],[6,'Apply Pythagoras to a ladder','moderate'],[7,'Review a constant-rate model','challenging'],
 [1,'Perimeter with an inward notch','challenging'],[2,'Find remaining prism capacity','challenging'],[3,'Area of a circular ring','challenging'],[4,'Coordinate a meeting across three zones','challenging'],[5,'Convert a compound rate','moderate'],[6,'Find a rectangular diagonal','moderate'],[7,'Plan a journey using scale and speed','challenging'],[3,'Infer area from circumference','challenging'],[4,'Find arrival day and local time','challenging'],
] as const;
export const YEAR8_MEASUREMENT_BLUEPRINT=slots.map(([n,skill,difficulty])=>[`AC9M8M0${n}`,skill,difficulty] as const);
const round=(n:number)=>Number(n.toFixed(2));
export function measurement8Clock(minutes:number){const m=((minutes%1440)+1440)%1440;return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;}
export function measurement8DayTime(minutes:number){return `${['Monday','Tuesday','Wednesday','Thursday'][Math.floor(minutes/1440)]} ${measurement8Clock(minutes)}`;}
function make(form:typeof YEAR8_MEASUREMENT_FORMS[number],f:number){
 const items:{prompt:string;correctAnswer:string;visual:Measurement8Visual;options?:string[];answerFormat?:MeasurelandsAnswerFormat}[]=[];
 const v=(task:Measurement8Visual['task'],description:string,values:number[],extra:Partial<Measurement8Visual>={}):Measurement8Visual=>({type:'measurement_year8_panel',task,description,values,...extra});
 const add=(prompt:string,answer:number|string,visual:Measurement8Visual,unit?:string,options?:string[])=>items.push({prompt,correctAnswer:String(answer),visual,options,answerFormat:options?undefined:{kind:'number',unit,ariaLabel:`Answer${unit?' in '+unit:''}`}});
 const time=(prompt:string,minutes:number,visual:Measurement8Visual)=>{add(prompt,measurement8Clock(minutes).replace(':',''),visual);items[items.length-1].answerFormat={kind:'time',mode:'24h',storage:'hhmm',ariaLabel:'Local time in 24-hour time'};};
 const w=12+2*f,h=9+f,cw=4+f,ch=3+f;
 add('What is the area of this L-shaped garden?',w*h-cw*ch,v('composite','All corners are right angles. Find the area inside the outline.',[w,h,cw,ch],{unit:'m'}),'m²');
 const l=40+10*f,b=25+5*f,z=20+5*f;
 add('What is the capacity of this rectangular tank in litres?',l*b*z/1000,v('prism','The dimensions are measured inside the tank. 1000 cm³ equals 1 litre.',[l,b,z],{unit:'cm'}),'L');
 const r=3+f;
 add('What is the area of this circular garden?',round(3.14*r*r),v('circle','Use 3.14 for pi. Give your answer to two decimal places.',[r],{variant:'radius',unit:'m'}),'m²');
 const perth=9*60+15+15*f;
 time('What is the time in Brisbane at this instant?',perth+120,v('timezone','Use the stated UTC offsets. Enter Brisbane time using 24-hour time.',[perth,8,10],{rows:[{label:'Perth',offset:8,detail:measurement8Clock(perth)},{label:'Brisbane',offset:10,detail:'Time: ?'}]}));
 const distance=150+30*f;
 add('What is the coach’s average speed?',distance/3,v('rate','Use the total distance and total travel time.',[distance,3],{variant:'coach',labels:[`Distance: ${distance} km`,'Travel time: 3 hours']}),'km/h');
 const scale=2+f;
 add('What is the length of the hypotenuse marked x?',5*scale,v('rightTriangle','The square marker shows the right angle.',[3*scale,4*scale,5*scale],{unknown:'hypotenuse',unit:'cm'}),'cm');
 const mapScale=25000+5000*f,mapLength=4+f,actual=round(mapScale*mapLength/100000),mapAnswer=`${actual} km, after converting the scaled centimetres to kilometres.`;
 add('Which calculation result correctly interprets this map scale?',mapAnswer,v('model','The marked route is straight. The map scale applies to every length.',[mapScale,mapLength],{variant:'map',labels:[`Map scale: 1 : ${mapScale}`,`Route on map: ${mapLength} cm`]}),undefined,[mapAnswer,`${round(mapScale*mapLength/1000)} km, because 1000 centimetres equals 1 kilometre.`,`${mapLength} km, because centimetres on any map are kilometres on the ground.`]);
 const pw=14+2*f,ph=10+f,pcw=5+f,pch=4+f;
 add('What is the perimeter of this L-shaped courtyard?',2*(pw+ph),v('composite','Include every edge around the courtyard.',[pw,ph,pcw,pch],{unit:'m'}),'m');
 const tb=20+4*f,th=15+3*f,tl=40+5*f;
 add('How many millilitres can this triangular-prism container hold?',tb*th*tl/2,v('prism','The shaded end is a right-angled triangle. All dimensions are internal. 1 cm³ equals 1 mL.',[tb,th,tl],{variant:'triangular',unit:'cm'}),'mL');
 const diameter=14+2*f;
 add('How much edging is needed to go once around this circular pond?',round(3.14*diameter),v('circle','The marked line is the diameter. Use 3.14 for pi. Round to two decimal places.',[diameter],{variant:'diameter',unit:'m'}),'m');
 const adelaide=16*60+45+15*f;
 time('What is the time in Perth at this instant?',adelaide-90,v('timezone','Use these fixed offsets for this question. Convert to Perth time and enter it in 24-hour time.',[adelaide,9.5,8],{rows:[{label:'Adelaide',offset:9.5,detail:`${Math.floor(adelaide/60)-12}:${String(adelaide%60).padStart(2,'0')} pm`},{label:'Perth',offset:8,detail:'Time: ?'}]}));
 const km=60+15*f;
 add('What is the train’s average speed in kilometres per hour?',km/1.5,v('rate','Convert the travel time to hours before finding the rate.',[km,90],{variant:'train',labels:[`Distance: ${km} km`,'Travel time: 90 minutes']}),'km/h');
 const t=f+1;
 add('What is the length of the side marked x?',12*t,v('rightTriangle','The longest side is opposite the right angle.',[5*t,12*t,13*t],{unknown:'height',unit:'m'}),'m');
 const wallArea=97+10*f,coverage=8+f,pots=Math.ceil(wallArea*2/coverage),paintAnswer=`${pots} one-litre pots: allow for two coats and round up to have enough paint.`;
 add('Which plan buys enough paint with the fewest one-litre pots?',paintAnswer,v('model','Assume the stated coverage is achieved for each coat, with no wastage. Paint is sold only in full one-litre pots.',[wallArea,coverage,2],{variant:'paint',labels:[`Wall area: ${wallArea} m²`,`Coverage per litre, per coat: ${coverage} m²`,'Coats needed: 2']}),undefined,[paintAnswer,`${Math.floor(wallArea*2/coverage)} pots: round down after allowing for two coats.`,`${Math.ceil(wallArea/coverage)} pots: calculate the paint for one coat only.`]);
 const houseW=10+2*f,wallH=6+f,roofH=4+f;
 add('What is the total area of this wall and triangular gable?',houseW*wallH+houseW*roofH/2,v('house','The gable sits on top of the rectangular wall. The dashed line is its perpendicular height.',[houseW,wallH,roofH],{unit:'m'}),'m²');
 const poolL=4+f;
 add('How many minutes will the empty rectangular pool take to fill?',poolL*3*1000/100,v('prism','Use the inside dimensions. The water enters at a constant rate. 1 m³ equals 1000 litres.',[poolL,3,1,100],{unit:'m',labels:['Flow rate: 100 litres per minute']}),'minutes');
 const semiD=10+2*f;
 add('What is the perimeter of this semicircular garden?',round(3.14*semiD/2+semiD),v('circle','Include both the curved boundary and the straight edge. Use 3.14 for pi. Round to two decimal places.',[semiD],{variant:'semicircle',unit:'m'}),'m');
 const departure=20*60+10+20*f,duration=520+10*f,arrival=departure+duration+60;
 add('How many minutes does this flight take?',duration,v('timezone','These are local departure and arrival times. Use the UTC offsets to find the elapsed time.',[departure,arrival,9,10],{rows:[{label:'Tokyo departure',offset:9,detail:measurement8DayTime(departure)},{label:'Brisbane arrival',offset:10,detail:measurement8DayTime(arrival)}]}),'minutes');
 const litresA=7+f,litresB=15+2*f;
 add('How many fewer litres does car B use than car A over 500 km?',litresA*5-litresB*2,v('rate','Assume each car keeps the stated fuel-consumption rate over the whole journey.',[litresA,100,litresB,250,500],{variant:'fuel',labels:[`Car A: ${litresA} litres per 100 km`,`Car B: ${litresB} litres per 250 km`,'Distance to compare: 500 km']}),'L');
 const ladderScale=1+f/4;
 add('How high up the wall does the ladder reach?',4*ladderScale,v('rightTriangle','The wall is vertical and the ground is horizontal. The ladder rests against the wall.',[3*ladderScale,4*ladderScale,5*ladderScale],{variant:'ladder',unknown:'height',unit:'m'}),'m');
 const flow=60+10*f;
 add('How should the predicted filling time be reviewed?','The model underestimates the time because the flow rate decreases.',v('model','A model assumes the initial flow rate stays constant. In reality, after 10 minutes the flow rate halves and remains at that lower rate.',[flow,flow*30,10],{variant:'water',labels:[`Tank capacity: ${flow*30} L`,`Initial flow rate: ${flow} L/min`,'Model prediction: 30 minutes']}),undefined,['The model underestimates the time because the flow rate decreases.','The model overestimates the time because less water enters each minute.','The model stays correct because the capacity is unchanged.']);
 const uw=18+2*f,uh=12+f,notchW=6+2*f,notchH=4+f;
 add('What is the perimeter of this courtyard with an inward notch?',2*(uw+uh)+2*notchH,v('composite','Trace the entire boundary, including the three edges of the notch. All corners are right angles.',[uw,uh,notchW,notchH],{variant:'notch',unit:'m'}),'m');
 const tankL=60+10*f;
 add('How many more litres can be added before this tank is full?',tankL*40*50/1000*.75,v('prism','The tank is one-quarter full. Use the inside dimensions. 1000 cm³ equals 1 litre.',[tankL,40,50],{unit:'cm',labels:['Water already in tank: one-quarter of its capacity']}),'L');
 const outer=8+f,inner=5+f;
 add('What is the area of the shaded circular path?',round(3.14*(outer*outer-inner*inner)),v('circle','The circles have the same centre. Use 3.14 for pi. Round to two decimal places.',[outer,inner],{variant:'ring',unit:'m'}),'m²');
 const delhiStart=9*60+30*f,meeting=delhiStart+270;
 time('What is the earliest Brisbane time when all three teams can start a 30-minute meeting?',meeting,v('timezone','Every team must attend the whole meeting within its local availability window. All windows refer to Tuesday. Use the fixed offsets shown and enter 24-hour time.',[delhiStart,17*60,9*60,17*60,30],{rows:[{label:'Brisbane',offset:10,detail:'Available 09:00–17:00'},{label:'Perth',offset:8,detail:'Available 09:00–17:00'},{label:'Delhi',offset:5.5,detail:`Available ${measurement8Clock(delhiStart)}–17:00`}]}));
 const ml=750+250*f;
 add('What is this tap’s flow rate in litres per minute?',ml*60/1000,v('rate','Convert both the volume unit and the time unit.',[ml],{variant:'water',labels:[`Water flow: ${ml} millilitres per second`]}),'L/min');
 const roomW=9+3*f,roomH=12+4*f;
 add('How long is the diagonal cable across this rectangular floor?',15+5*f,v('diagonal','The cable runs straight between opposite corners. All floor corners are right angles.',[roomW,roomH],{unit:'m'}),'m');
 const leg1=3+f,leg2=4+f,speed=4+f,rest=15+5*f,needed=Math.ceil((leg1+leg2)/speed*60+rest),journeyAnswer=`${needed} minutes, including walking both sections and the rest break.`;
 add('Which plan allows enough whole minutes for this walk?',journeyAnswer,v('model','Follow both marked route sections. Walk at the constant speed shown, then take the stated rest break. Round the total UP to a whole minute.',[leg1,leg2,100000,speed,rest],{variant:'mapRoute',labels:['Map scale: 1 : 100000',`Map sections: ${leg1} cm and ${leg2} cm`,`Walking speed: ${speed} km/h`,`Rest break: ${rest} minutes`]}),undefined,[journeyAnswer,`${Math.ceil((leg1+leg2)/speed*60)} minutes, counting only the walking time.`,`${Math.ceil(leg1/speed*60+rest)} minutes, counting the first section and the rest break.`]);
 const inferredR=5+f,circumference=round(2*3.14*inferredR);
 add('What is the area of this circle?',round(3.14*inferredR*inferredR),v('circle','Use the circumference to find the radius, then the area. Use 3.14 for pi. Round to two decimal places.',[inferredR],{variant:'unknownRadius',unit:'cm',labels:[`Circumference: ${circumference} cm`]}),'cm²');
 const leave=18*60+20*f,flight=660+10*f,land=leave+flight+17*60;
 add('On what day and at what local time does the flight arrive in Tokyo?',measurement8DayTime(land),v('timezone','Use only the fixed UTC offsets shown. The flight duration is elapsed time. Include any change of day.',[leave,flight,-8,9],{rows:[{label:'Los Angeles departure',offset:-8,detail:measurement8DayTime(leave)},{label:'Tokyo arrival',offset:9,detail:'Day and time: ?'}],labels:[`Flight duration: ${Math.floor(flight/60)} hours ${flight%60} minutes`]}),undefined,[measurement8DayTime(land),measurement8DayTime(leave+flight),measurement8DayTime(land-1440)]);
 return items.map((q,i)=>{const[code,skill,difficulty]=YEAR8_MEASUREMENT_BLUEPRINT[i];return {...q,id:`y8-measurement-review-${form}-${String(i+1).padStart(2,'0')}`,version:'1.0.0-review.1',form,type:q.options?'mcq':'numeric',options:q.options?[...q.options.slice((f+i)%q.options.length),...q.options.slice(0,(f+i)%q.options.length)]:undefined,readAloudText:q.prompt,primaryDescriptorCode:code,curriculumCodes:[code],skillId:`y8-measurement-slot-${i+1}`,skillLabel:skill,structureKey:`y8-measurement-slot-${i+1}`,difficulty,statistics:createUncalibratedItemStatistics(difficulty),scoring:{kind:'exact',correctResponse:q.correctAnswer},inputMode:'decimal' as const,strand:'Measurement'};});
}
export const YEAR8_MEASUREMENT_FIVE_FORMS=Object.fromEntries(YEAR8_MEASUREMENT_FORMS.map((form,f)=>[form,make(form,f)])) as Record<typeof YEAR8_MEASUREMENT_FORMS[number],ReturnType<typeof make>>;
