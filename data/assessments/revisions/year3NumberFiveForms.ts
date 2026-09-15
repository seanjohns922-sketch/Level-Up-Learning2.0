/** Fixed author-review forms. Student banks remain version-pinned until release. */
import {buildLevel3PosttestFormB} from '../level3Blueprint';
import type {Question} from '../posttests';
export const NUMBER_LEVEL3_FORMS=['pretest','posttest','start','mid','end'] as const;
export type NumberLevel3Form=typeof NUMBER_LEVEL3_FORMS[number];
export const NUMBER_LEVEL3_FORM_LABELS={pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
export type Level3Visual =
 | {kind:'place';parts:number[]}
 | {kind:'cards';values:number[]}
 | {kind:'round';value:number;step:number}
 | {kind:'estimate';amounts:number[];unit:string}
 | {kind:'equation';expression:string}
 | {kind:'money';dollars:number;twenties:number;targetCoin?:number}
 | {kind:'story';stages:Array<{label:string;value:number}>;unit:string}
 | {kind:'groups';groups:number;size:number}
 | {kind:'array';rows:number;columns:number}
 | {kind:'algorithm';start:number;extra:number}
 | {kind:'fractionChoices';models:Array<{numerator:number;denominator:number}>}
 | {kind:'completeWhole';filled:number;denominator:number}
 | {kind:'fractionOrder';values:string[]}
 | {kind:'numberLine';numerator:number;denominator:number};
export type NumberLevel3ReviewItem=Question & {version:string;form:NumberLevel3Form;primaryDescriptorCode:string;curriculumCodes:string[];difficulty:'accessible'|'moderate'|'challenging';visual:Level3Visual;skillLabel:string};
const profiles={
 pretest:{place:[10000,3000,400,20,6],order:[13406,13640,13460,13064],round:4342,estimate:[246,172],add:[48,19],double:[37,38],near:[103,98],difference:[87,124],dollars:4,twenties:2,coinDollars:2,coinTwenties:3,story:[236,78,27],tickets:[420,176,85],groups:[5,7],array:[4,6],factor:[5,35],algorithm:[14,3],fractionShift:0,filled:3,fractions:['7/10','1/10','4/10'],point:3},
 posttest:{place:[20000,5000,600,40,8],order:[25608,25860,25680,25086],round:6742,estimate:[346,172],add:[57,19],double:[46,47],near:[104,99],difference:[96,132],dollars:6,twenties:2,coinDollars:3,coinTwenties:3,story:[245,67,29],tickets:[450,186,95],groups:[5,6],array:[4,5],factor:[5,40],algorithm:[18,3],fractionShift:3,filled:4,fractions:['8/10','2/10','5/10'],point:7},
 start:{place:[30000,2000,500,60,7],order:[32506,32650,32560,32056],round:5243,estimate:[446,273],add:[66,19],double:[28,29],near:[102,97],difference:[78,115],dollars:5,twenties:2,coinDollars:4,coinTwenties:3,story:[254,68,27],tickets:[430,187,85],groups:[5,8],array:[4,7],factor:[5,45],algorithm:[22,3],fractionShift:2,filled:6,fractions:['9/10','3/10','6/10'],point:4},
 mid:{place:[40000,7000,300,80,6],order:[47308,47830,47380,47038],round:7541,estimate:[346,272],add:[75,19],double:[38,39],near:[105,99],difference:[89,126],dollars:7,twenties:2,coinDollars:2,coinTwenties:4,story:[263,59,28],tickets:[440,178,95],groups:[5,9],array:[4,8],factor:[5,30],algorithm:[26,3],fractionShift:1,filled:7,fractions:['8/10','1/10','5/10'],point:6},
 end:{place:[50000,4000,700,20,9],order:[54702,54720,54270,54027],round:8643,estimate:[246,373],add:[68,19],double:[47,48],near:[101,96],difference:[97,134],dollars:8,twenties:2,coinDollars:3,coinTwenties:4,story:[272,59,38],tickets:[460,197,85],groups:[5,4],array:[4,9],factor:[5,50],algorithm:[30,3],fractionShift:4,filled:8,fractions:['9/10','2/10','6/10'],point:8},
} as const;
const specs=[
 ['AC9M3N01','Represent numbers beyond 10,000','accessible'],['AC9M3N01','Order five-digit numbers','moderate'],
 ['AC9M3N05','Round to estimate','accessible'],['AC9M3N05','Estimate a combined collection','moderate'],
 ['AC9M3N03','Add using compensation','moderate'],['AC9M3N03','Add using near doubles','moderate'],
 ['AC9M3N03','Subtract by counting on','moderate'],['AC9M3N03','Find a difference across 100','moderate'],
 ['AC9M3M06','Represent dollars and cents','accessible'],['AC9M3M06','Represent equivalent coin values','challenging'],
 ['AC9M3N06','Model an increase then decrease','challenging'],['AC9M3N06','Model two decreases','challenging'],
 ['AC9M3N04','Solve an equal-group problem','moderate'],['AC9M3N04','Connect an array to multiplication','moderate'],
 ['AC9M3A03','Find an unknown multiplication factor','moderate'],['AC9M3N07','Follow steps and a decision','challenging'],
 ['AC9M3N02','Recognise a unit fraction','accessible'],['AC9M3N02','Complete a whole with tenths','moderate'],
 ['AC9M3N02','Order multiples of one-tenth','moderate'],['AC9M3N02','Locate tenths on a number line','moderate'],
] as const;
const num=(prompt:string,answer:number,visual:Level3Visual):Question & {visual:Level3Visual}=>({id:'',type:'numeric',prompt,correctAnswer:String(answer),options:[],visual});
const fmt=(n:number)=>n.toLocaleString('en-AU');
function make(form:NumberLevel3Form):NumberLevel3ReviewItem[]{
 const p=profiles[form]; const benchmark=buildLevel3PosttestFormB().questions;
 const ds=[2,3,4,5,10];
 const models=ds.map(denominator=>({denominator,numerator:1}));
 const labels=['A','B','C','D','E'];
 const correctArray=`4 × ${p.array[1]} = ${4*p.array[1]}`;
 const options=[`4 + ${p.array[1]} = ${4+p.array[1]}`,correctArray,`3 × ${p.array[1]} = ${3*p.array[1]}`,`4 × ${p.array[1]-1} = ${4*(p.array[1]-1)}`];
 const rotate=p.fractionShift%4;const rotated=[...options.slice(rotate),...options.slice(0,rotate)];
 const q:Question[]=[
 num('What number does this place-value chart show?',p.place.reduce<number>((a,b)=>a+b,0),{kind:'place',parts:[...p.place]}),
 {id:'',type:'number_order',prompt:'Order these numbers from smallest to largest.',correctAnswer:[...p.order].sort((a,b)=>a-b).map(fmt).join('||'),options:p.order.map(fmt),visual:{kind:'cards',values:[...p.order]}},
 num(`Round ${fmt(p.round)} to the nearest 100.`,Math.round(p.round/100)*100,{kind:'round',value:p.round,step:100}),
 num('Round each collection to the nearest hundred. About how many cards altogether?',p.estimate.reduce<number>((s,n)=>s+Math.round(n/100)*100,0),{kind:'estimate',amounts:[...p.estimate],unit:'cards'}),
 num(`What is ${p.add[0]} + ${p.add[1]}?`,p.add[0]+p.add[1],{kind:'equation',expression:`${p.add[0]} + ${p.add[1]} = ?`}),
 num(`What is ${p.double[0]} + ${p.double[1]}?`,p.double[0]+p.double[1],{kind:'equation',expression:`${p.double[0]} + ${p.double[1]} = ?`}),
 num(`What is ${p.near[0]} − ${p.near[1]}?`,p.near[0]-p.near[1],{kind:'equation',expression:`${p.near[0]} − ${p.near[1]} = ?`}),
 num(`What is the difference between ${p.difference[0]} and ${p.difference[1]}?`,p.difference[1]-p.difference[0],{kind:'equation',expression:`${p.difference[1]} − ${p.difference[0]} = ?`}),
 num('Write the total amount below in cents.',p.dollars*100+40,{kind:'money',dollars:p.dollars,twenties:p.twenties}),
 num('How many 10-cent coins have the same total value?',p.coinDollars*10+p.coinTwenties*2,{kind:'money',dollars:p.coinDollars,twenties:p.coinTwenties,targetCoin:10}),
 num('More cans arrive, then damaged cans are removed. How many usable cans remain?',p.story[0]+p.story[1]-p.story[2],{kind:'story',unit:'cans',stages:[{label:'At first',value:p.story[0]},{label:'More arrive',value:p.story[1]},{label:'Damaged and removed',value:p.story[2]}]}),
 num('Tickets sell in the morning and afternoon. How many remain unsold?',p.tickets[0]-p.tickets[1]-p.tickets[2],{kind:'story',unit:'tickets',stages:[{label:'At first',value:p.tickets[0]},{label:'Sold in morning',value:p.tickets[1]},{label:'Sold in afternoon',value:p.tickets[2]}]}),
 num(`Each bag holds ${p.groups[1]} oranges. How many oranges altogether?`,p.groups[0]*p.groups[1],{kind:'groups',groups:p.groups[0],size:p.groups[1]}),
 {id:'',type:'mcq',prompt:'Which multiplication sentence matches this array?',correctAnswer:correctArray,options:rotated,visual:{kind:'array',rows:p.array[0],columns:p.array[1]}},
 num('What number makes this multiplication correct?',p.factor[1]/p.factor[0],{kind:'equation',expression:`${p.factor[0]} × ? = ${p.factor[1]}`}),
 num('Follow the steps and decision. What is the final number?',p.algorithm[0]/2+p.algorithm[1],{kind:'algorithm',start:p.algorithm[0],extra:p.algorithm[1]}),
 {id:'',type:'mcq',prompt:`Which model shows 1/${ds[p.fractionShift]} of a whole?`,correctAnswer:labels[p.fractionShift],options:labels,visual:{kind:'fractionChoices',models}},
 num('How many more tenths are needed to complete the whole?',10-p.filled,{kind:'completeWhole',filled:p.filled,denominator:10}),
 {id:'',type:'fraction_order',prompt:'Order these fractions from smallest to largest.',correctAnswer:[...p.fractions].sort((a,b)=>Number(a.split('/')[0])-Number(b.split('/')[0])).join(','),options:[...p.fractions],visual:{kind:'fractionOrder',values:[...p.fractions]}},
 {id:'',type:'fraction_number_line',prompt:`Mark ${p.point}/10 on the number line.`,correctAnswer:`${p.point}/10`,options:[],visual:{kind:'numberLine',numerator:p.point,denominator:10}},
 ];
 return q.map((item,index)=>({...item,linkedWeeks:benchmark[index].linkedWeeks,linkedLessons:benchmark[index].linkedLessons,skillId:`number-y3-slot-${index+1}`,id:`y3-number-review-${form}-${String(index+1).padStart(2,'0')}-v3`,version:'3.0.0-review.1',form,primaryDescriptorCode:specs[index][0],curriculumCodes:[specs[index][0],...([4,5].includes(index)?['AC9M3A02']:index===7?['AC9M3A01']:index===14?['AC9M3N04']:[])],skillLabel:specs[index][1],difficulty:specs[index][2]} as NumberLevel3ReviewItem));
}
export const NUMBER_LEVEL3_FIVE_FORMS=Object.fromEntries(NUMBER_LEVEL3_FORMS.map(f=>[f,make(f)])) as Record<NumberLevel3Form,NumberLevel3ReviewItem[]>;

/** Speak the information visible in diagrams as well as the question, without a solution. */
export function level3SpokenPrompt(q:NumberLevel3ReviewItem):string {
 const v=q.visual;
 const information=v.kind==='place'?v.parts.map((n,i)=>`${n/10**(4-i)} ${['ten thousands','thousands','hundreds','tens','ones'][i]}`).join(', ')
 :v.kind==='estimate'?v.amounts.map((n,i)=>`Collection ${i+1}: ${n} ${v.unit}`).join('. ')
 :v.kind==='money'?`${Math.floor(v.dollars/2)} two-dollar coins${v.dollars%2 ? ", one one-dollar coin" : ""}, and ${v.twenties} twenty-cent coins.`
 :v.kind==='story'?v.stages.map(s=>`${s.label}: ${s.value} ${v.unit}`).join('. ')
 :v.kind==='groups'?`${v.groups} bags, ${v.size} oranges in each.`
 :v.kind==='array'?`${v.rows} rows with ${v.columns} counters in each row.`
 :v.kind==='algorithm'?`Start at ${v.start}. Is the number even? If yes, halve it. If no, add five. Then add ${v.extra}.`
 :v.kind==='completeWhole'?`${v.filled} tenths are already shaded.`
 :v.kind==='equation'?v.expression.replace('×',' times ').replace('−',' minus ').replace('+',' plus ').replace('=',' equals ').replace('?','the missing number')
 :v.kind==='fractionChoices'?v.models.map((m,i)=>`Model ${'ABCDE'[i]}: ${m.numerator} of ${m.denominator} equal parts shaded.`).join(' '):'';
 return `${q.prompt} ${information}`.trim();
}
