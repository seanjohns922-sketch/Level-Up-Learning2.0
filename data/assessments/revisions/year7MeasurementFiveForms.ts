import {createUncalibratedItemStatistics} from '../assessmentItemStandard';
import type {MeasurelandsAnswerFormat} from '../measurelandsPresentation';
export const YEAR7_MEASUREMENT_FORMS=['pretest','posttest','start','mid','end'] as const;
export type Measurement7Visual={type:'measurement_year7_panel';task:'triangle'|'parallelogram'|'rectPrism'|'triPrism'|'circle'|'parallel'|'triangleAngles'|'quadAngles'|'ratio'|'pairTriangles'|'pairPrisms';values:number[];description:string;labels?:string[];unit?:string;unknown?:'height'|'length';relation?:'corresponding'|'alternate'|'cointerior';circleMeasure?:'radius'|'diameter';};
export const YEAR7_MEASUREMENT_BLUEPRINT=[
 ['AC9M7M01','Find a triangular area','easy'],['AC9M7M02','Find a rectangular prism volume','easy'],['AC9M7M03','Relate radius and diameter','easy'],['AC9M7M04','Use corresponding angles','easy'],['AC9M7M05','Find an unknown triangle angle','easy'],
 ['AC9M7M06','Scale a drink recipe','moderate'],['AC9M7M01','Use perpendicular height for a parallelogram','moderate'],['AC9M7M02','Find a triangular prism volume','moderate'],['AC9M7M03','Calculate circumference from diameter','moderate'],['AC9M7M04','Explain alternate angles','moderate'],
 ['AC9M7M05','Use equal angles in an isosceles triangle','moderate'],['AC9M7M06','Divide a mixture in a given ratio','moderate'],['AC9M7M01','Find a triangle height from area','moderate'],['AC9M7M02','Find a prism length from volume','moderate'],['AC9M7M03','Identify the exact circumference relationship','moderate'],
 ['AC9M7M01','Combine two triangular areas','challenging'],['AC9M7M02','Compare rectangular and triangular prism volumes','challenging'],['AC9M7M04','Explain co-interior angle calculation','challenging'],['AC9M7M05','Use a quadrilateral angle sum','challenging'],['AC9M7M06','Choose and justify a feasible ratio plan','challenging'],
] as const;
function make(form:typeof YEAR7_MEASUREMENT_FORMS[number],f:number){
 const items:{prompt:string;correctAnswer:string;visual:Measurement7Visual;options?:string[];answerFormat?:MeasurelandsAnswerFormat}[]=[];
 const v=(task:Measurement7Visual['task'],description:string,values:number[],extra:Partial<Measurement7Visual>={}):Measurement7Visual=>({type:'measurement_year7_panel',task,description,values,...extra});
 const add=(prompt:string,answer:string|number,visual:Measurement7Visual,unit?:string,options?:string[])=>items.push({prompt,correctAnswer:String(answer),visual,options,answerFormat:options?undefined:{kind:'number',unit,ariaLabel:`Answer${unit?' in '+unit:''}`}});
 const b=12+f*2,h=7+f;
 add('What is the area of the triangular shade sail?',b*h/2,v('triangle','The dashed line shows the perpendicular height.',[b,h],{unit:'m'}),'m²');
 const l=8+f,w=4+f,z=3+f;
 add('What is the volume of this rectangular storage box?',l*w*z,v('rectPrism','Use the three labelled dimensions.',[l,w,z],{unit:'cm'}),'cm³');
 const r=[6,8,9,11,13][f];
 add('What is the diameter of this circle?',r*2,v('circle','The marked line runs from the centre to the edge.',[r],{circleMeasure:'radius',unit:'cm'}),'cm');
 const a=[55,125,70,120,75][f];
 add('What is the size of the angle marked x?',a,v('parallel','The two marked lines are parallel.',[a],{relation:'corresponding'}),'°');
 const ta=[45,50,55,60,40][f],tb=[65,75,70,55,80][f];
 add('What is the size of the missing angle in this triangle?',180-ta-tb,v('triangleAngles','Find the angle marked x.',[ta,tb,180-ta-tb]),'°');
 const parts=3+f,concentrate=250+f*50;
 add('How many millilitres of water are needed for this drink?',concentrate*parts,v('ratio','Keep the recipe in the same ratio.',[1,parts,concentrate],{labels:[`Concentrate : water = 1 : ${parts}`,`Concentrate available: ${concentrate} mL`],unit:'mL'}),'mL');
 const pb=13+f*2,ph=6+f;
 add('What is the area of this parallelogram garden?',pb*ph,v('parallelogram','Use the perpendicular height, marked by the dashed line.',[pb,ph],{unit:'m'}),'m²');
 const tbase=6+f*2,th=4+f,depth=9+f;
 add('What is the volume of this triangular prism?',tbase*th*depth/2,v('triPrism','The shaded end is a right-angled triangle. The prism has the same cross-section throughout.',[tbase,th,depth],{unit:'cm'}),'cm³');
 const d=[12,16,18,24,28][f];
 add('What is the circumference of the circular sign?',Number((d*3.14).toFixed(2)),v('circle','Use 3.14 for pi. Give your answer to two decimal places.',[d],{circleMeasure:'diameter',unit:'cm'}),'cm');
 const alt=[50,115,75,125,70][f],altAnswer=`${alt}°, because alternate angles are equal.`;
 add('Which answer gives the size of x and the correct reason?',altAnswer,v('parallel','The two marked lines are parallel.',[alt],{relation:'alternate'}),undefined,[altAnswer,`${180-alt}°, because alternate angles add to 180°.`,`${alt}°, because all angles on parallel lines are equal.`]);
 const apex=[40,50,60,70,80][f],base=(180-apex)/2;
 add('What is the size of x in this isosceles triangle?',base,v('triangleAngles','The matching ticks show equal sides.',[base,base,apex],{labels:['isosceles']}),'°');
 const first=2+f,second=3+f,total=(first+second)*(200+f*50);
 add('How many millilitres of blue paint are needed?',(200+f*50)*first,v('ratio','Make the full amount of paint in the stated ratio.',[first,second,total],{labels:[`Blue : yellow = ${first} : ${second}`,`Total paint needed: ${total} mL`],unit:'mL'}),'mL');
 const hb=14+f*2,hh=8+f;
 add('What is the perpendicular height of this triangle?',hh,v('triangle','The area and base length are given. Find the dashed height.',[hb,hh],{unknown:'height',unit:'cm',labels:[`Area: ${hb*hh/2} cm²`]}),'cm');
 const pl=12+f,pw=5+f,pheight=4+f;
 add('What is the missing length of this rectangular prism?',pl,v('rectPrism','The volume and two dimensions are given.',[pl,pw,pheight],{unknown:'length',unit:'cm',labels:[`Volume: ${pl*pw*pheight} cm³`]}),'cm');
 const symbolicRadius=f%2===1;
 add('Which expression gives the exact circumference of this circle?',symbolicRadius?'2 × π × r':'π × d',v('circle',symbolicRadius?'The line from the centre to the edge is labelled r.':'The full width through the centre is labelled d.',[10+f*2],{circleMeasure:symbolicRadius?'radius':'diameter',labels:['symbolic']}),undefined,symbolicRadius?['2 × π × r','π × r','r ÷ π']:['π × d','2 × π × d','d ÷ π']);
 const ab=16+f*2,ah=9+f,bb=10+f*2,bh=7+f;
 add('What is the total area of the two triangular shade sails?',(ab*ah+bb*bh)/2,v('pairTriangles','The two sails do not overlap. Find their combined area.',[ab,ah,bb,bh],{unit:'m'}),'m²');
 const al=10+f,aw=6+f,az=5+f,bt=8+f*2,btH=4+f,bd=8+f;
 add('How many cubic centimetres greater is box A’s volume than box B’s?',al*aw*az-bt*btH*bd/2,v('pairPrisms','Box A is a rectangular prism. Box B is a triangular prism with a right-angled end.',[al,aw,az,bt,btH,bd],{unit:'cm'}),'cm³');
 const co=[65,70,55,75,60][f],coAnswer=`${180-co}°, because co-interior angles add to 180°.`;
 add('Which answer gives the size of x and explains why?',coAnswer,v('parallel','The two marked lines are parallel.',[co],{relation:'cointerior'}),undefined,[coAnswer,`${co}°, because co-interior angles are equal.`,`${180-co}°, because vertically opposite angles add to 180°.`]);
 const qa=60+f*5,qb=50+f*5;
 add('What is the size of the missing angle in this quadrilateral?',180-qa,v('quadAngles','Find the angle marked x.',[qa,qb,180-qb,180-qa]),'°');
 const blue=2+f,yellow=3+f,scale=100+f*25,availableBlue=blue*scale,availableYellow=yellow*(scale+50);
 const plan=`${(blue+yellow)*scale} mL, using all the blue paint and keeping the ${blue}:${yellow} ratio.`;
 add('Which plan makes the most green paint without changing the colour?',plan,v('ratio','Mix only blue and yellow paint. Keep the stated ratio and do not use more paint than is available.',[blue,yellow,availableBlue,availableYellow],{labels:[`Blue : yellow = ${blue} : ${yellow}`,`Available: ${availableBlue} mL blue and ${availableYellow} mL yellow`],unit:'mL'}),undefined,[plan,`${availableBlue+availableYellow} mL, because you should mix all the paint available.`,`${(blue+yellow)*(scale+50)} mL, using all the yellow paint even if more blue is needed.`]);
 return items.map((q,i)=>{const[code,skill,difficulty]=YEAR7_MEASUREMENT_BLUEPRINT[i];return {...q,id:`y7-measurement-review-${form}-${String(i+1).padStart(2,'0')}`,version:'1.0.0-review.1',form,type:q.options?'mcq':'numeric',options:q.options?[...q.options.slice((f+i)%q.options.length),...q.options.slice(0,(f+i)%q.options.length)]:undefined,readAloudText:q.prompt,primaryDescriptorCode:code,curriculumCodes:[code],skillId:`y7-measurement-slot-${i+1}`,skillLabel:skill,structureKey:`y7-measurement-slot-${i+1}`,difficulty,statistics:createUncalibratedItemStatistics(difficulty),scoring:{kind:'exact',correctResponse:q.correctAnswer},inputMode:'decimal' as const,strand:'Measurement'};});
}
export const YEAR7_MEASUREMENT_FIVE_FORMS=Object.fromEntries(YEAR7_MEASUREMENT_FORMS.map((f,i)=>[f,make(f,i)])) as Record<typeof YEAR7_MEASUREMENT_FORMS[number],ReturnType<typeof make>>;
