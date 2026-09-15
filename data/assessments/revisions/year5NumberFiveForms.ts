import { YEAR5_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS as benchmark } from '../year5NumberNexusIndependentBanks';
import { createUncalibratedItemStatistics } from '../assessmentItemStandard';
export const NUMBER_LEVEL5_FORMS = ['pretest','posttest','start','mid','end'] as const;
export type NumberLevel5Form = typeof NUMBER_LEVEL5_FORMS[number];
export const NUMBER_LEVEL5_FORM_LABELS = {pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
type Base = typeof benchmark[number];
export type NumberLevel5ReviewItem = Omit<Base,'form'|'sourcePool'> & {form:NumberLevel5Form;sourcePool:'assessment_review';readAloudText:string;showFractionModels?:boolean};
type Example = {prompt:string;correctAnswer:string;visual:Record<string,unknown>;type:string;options?:string[]};
const numeric = (prompt:string,answer:number,visual:Record<string,unknown>):Example => ({prompt,correctAnswer:String(answer),visual,type:'numeric'});
const calculation = (expression:string) => ({type:'number_y5_calculation',expression});
const profiles = [
 {decimal:'4.307',digit:7,whole:4,pairs:24,divisible:316,fractions:['5/8','3/4','9/8'],marker:9,percent:25,fdp:[4,5],subtract:[7,1],add:[1,3],multiply:[584,37],check:[57,18],division:[1487,12],passengers:437,estimate:[77,42],tickets:[7,49],budget:[950,8,68,126],seats:[16,64,111],algorithm:126,multiple:6,sequenceStart:42},
 {decimal:'6.305',digit:5,whole:6,pairs:40,divisible:356,fractions:['7/8','3/4','11/8'],marker:11,percent:75,fdp:[3,5],subtract:[7,2],add:[2,1],multiply:[684,37],check:[67,18],division:[1587,12],passengers:487,estimate:[87,42],tickets:[6,49],budget:[1050,9,68,132],seats:[18,64,113],algorithm:135,multiple:7,sequenceStart:49},
 {decimal:'7.306',digit:6,whole:7,pairs:56,divisible:396,fractions:['3/8','1/4','9/8'],marker:13,percent:50,fdp:[2,5],subtract:[5,1],add:[1,1],multiply:[784,37],check:[77,18],division:[1687,12],passengers:537,estimate:[97,42],tickets:[8,49],budget:[1150,8,78,138],seats:[17,64,115],algorithm:144,multiple:8,sequenceStart:56},
 {decimal:'8.309',digit:9,whole:8,pairs:88,divisible:436,fractions:['1/8','1/4','11/8'],marker:15,percent:20,fdp:[1,5],subtract:[7,3],add:[2,3],multiply:[884,37],check:[87,18],division:[1787,12],passengers:587,estimate:[67,42],tickets:[9,49],budget:[1250,9,78,144],seats:[19,64,117],algorithm:153,multiple:9,sequenceStart:63},
 {decimal:'9.308',digit:8,whole:9,pairs:104,divisible:476,fractions:['5/8','3/4','13/8'],marker:10,percent:80,fdp:[7,10],subtract:[5,2],add:[1,5],multiply:[984,37],check:[97,18],division:[1887,12],passengers:637,estimate:[57,42],tickets:[5,49],budget:[1350,8,88,146],seats:[15,64,119],algorithm:162,multiple:12,sequenceStart:84},
] as const;
const labels = ['Read thousandths','Order decimals','Find factor pairs','Test divisibility','Order related fractions','Locate improper fractions','Read percentages','Connect fractions and percentages','Subtract related fractions','Add related fractions','Multiply larger numbers','Multiply two-digit numbers','Find a remainder','Interpret a remainder','Estimate a product','Estimate a financial total','Calculate budget remaining','Solve a capacity problem','Follow a divisibility algorithm','Continue a multiple pattern'];
const difficulty = ['moderate','moderate','moderate','moderate','moderate','moderate','easy','moderate','moderate','moderate','challenging','moderate','moderate','challenging','moderate','moderate','challenging','challenging','moderate','moderate'] as const;
function make(form:NumberLevel5Form,f:number):NumberLevel5ReviewItem[] {
 const p=profiles[f];
 const decimals=[`${p.whole}.5`,`${p.whole}.059`,`${p.whole}.095`,`${p.whole}.509`];
 const fractions=[p.fractions[2],p.fractions[0],p.fractions[1]];
 const fractionValue=(s:string)=>{const [n,d]=s.split('/').map(Number);return n/d;};
 const choices=[String(p.divisible-2),String(p.divisible),String(p.divisible+2)];
 const examples:Example[]=[
  numeric(`What value does the digit ${p.digit} have?`,p.digit/1000,{type:'number_y5_decimal_chart',value:p.decimal,focus:'thousandths'}),
  {prompt:'Order the decimals from smallest to largest.',type:'number_order',options:decimals,correctAnswer:[...decimals].sort((a,b)=>Number(a)-Number(b)).join('||'),visual:{type:'number_y5_decimal_set',values:decimals}},
  numeric(`How many factor pairs does ${p.pairs} have?`,4,{type:'number_y5_factor_card',number:p.pairs}),
  {prompt:'Which number is divisible by 4?',type:'mcq',options:choices,correctAnswer:String(p.divisible),visual:{type:'number_y5_divisibility_target',test:'Divisible by 4',number:'?'}},
  {prompt:'Order the fractions from smallest to largest.',type:'fraction_order',options:fractions,correctAnswer:[...fractions].sort((a,b)=>fractionValue(a)-fractionValue(b)).join(','),visual:{type:'number_y5_fraction_set',values:fractions}},
  numeric('The marker is ?/8. Enter the numerator.',p.marker,{type:'number_y5_number_line',min:0,max:2,divisions:16,marker:p.marker}),
  numeric('What percentage of the grid is shaded?',p.percent,{type:'number_y5_percent_grid',shaded:p.percent}),
  numeric('Write this fraction as a percentage. Enter the number only.',p.fdp[0]/p.fdp[1]*100,{type:'number_y5_fdp',fraction:`${p.fdp[0]}/${p.fdp[1]}`,percent:null}),
  numeric('Subtract. Enter the missing numerator.',p.subtract[0]-p.subtract[1]*2,{type:'number_y5_fraction_equation',expression:`${p.subtract[0]}/8 − ${p.subtract[1]}/4 = ?/8`}),
  numeric('Add. Enter the missing numerator.',p.add[0]*2+p.add[1],{type:'number_y5_fraction_equation',expression:`${p.add[0]}/3 + ${p.add[1]}/6 = ?/6`}),
  numeric('Calculate the product.',p.multiply[0]*p.multiply[1],calculation(`${p.multiply[0]} × ${p.multiply[1]}`)),
  numeric('Calculate the product.',p.check[0]*p.check[1],calculation(`${p.check[0]} × ${p.check[1]}`)),
  numeric('What remainder is left?',p.division[0]%p.division[1],{type:'number_y5_division',dividend:p.division[0],divisor:p.division[1]}),
  numeric('What is the smallest number of buses needed for everyone?',Math.ceil(p.passengers/48),{type:'number_y5_model',context:'buses',rows:[['Passengers',String(p.passengers)],['Passenger seats in EACH bus','48']]}),
  numeric('Round each factor to the nearest ten. Estimate the product.',Math.round(p.estimate[0]/10)*10*40,{type:'number_y5_estimate',expression:`${p.estimate[0]} × ${p.estimate[1]}`}),
  numeric('Round the ticket price to the nearest ten dollars. Estimate the total.',p.tickets[0]*50,{type:'number_y5_receipt',rows:[['Number of tickets',String(p.tickets[0])],['Price for ONE ticket',`$${p.tickets[1]} each`]]}),
  numeric('After paying for meals and room hire, how many dollars remain?',p.budget[0]-p.budget[1]*p.budget[2]-p.budget[3],{type:'number_y5_budget',budget:p.budget[0],purchases:[{label:'Meal packs',quantity:p.budget[1],price:p.budget[2]},{label:'Room hire',quantity:1,price:p.budget[3]}]}),
  numeric('How many seats are occupied?',p.seats[0]*p.seats[1]-p.seats[2],{type:'number_y5_model',context:'seats',rows:[['Sections',String(p.seats[0])],['Seats in EACH section',String(p.seats[1])],['Empty seats ALTOGETHER',String(p.seats[2])]]}),
  numeric('Follow the steps. What number comes out?',p.algorithm/3,{type:'number_y5_decision',start:p.algorithm,divisor:3}),
  numeric('What number comes next?',p.sequenceStart+p.multiple*4,{type:'number_y5_sequence',values:[p.sequenceStart,p.sequenceStart+p.multiple,p.sequenceStart+p.multiple*2,p.sequenceStart+p.multiple*3,'?']}),
 ];
 return examples.map((e,i)=>{
  const base=benchmark[i];const id=`y5-number-review-${form}-${String(i+1).padStart(2,'0')}-v3`;
  const options=e.type==='mcq'?e.options!.slice((f+i)%3).concat(e.options!.slice(0,(f+i)%3)):e.options;
  const visual={...e.visual,reviewPresentation:true};
  const cognitiveCategory=[13,16,17].includes(i)?'transfer':[3,18].includes(i)?'reasoning':'application';
  return {...base,...e,options,visual,id,version:'3.0.0-review.1',form,sourcePool:'assessment_review',bankId:`number-level5-${form}-review-v3`,answer:e.correctAnswer,
   skillId:`number-y5-review-slot-${i+1}`,skillLabel:labels[i],contextKey:id,structureKey:`number-level5-slot-${i+1}`,difficulty:difficulty[i],statistics:createUncalibratedItemStatistics(difficulty[i]),cognitiveCategory,
   requiresReasoning:cognitiveCategory==='reasoning'||cognitiveCategory==='transfer',isTransfer:cognitiveCategory==='transfer',misconceptionDiagnosis:e.type==='mcq',responseMode:e.type==='mcq'?'selected_response':['number_order','fraction_order'].includes(e.type)?'manipulated_response':'constructed_response',selectedAnswerPosition:e.type==='mcq'?options!.indexOf(e.correctAnswer)+1:undefined,
   scoring:{kind:'exact',correctResponse:e.correctAnswer},renderer:{type:e.type,payload:{prompt:e.prompt,visual,options}},showFractionModels:false,readAloudText:spoken(e),
  } as NumberLevel5ReviewItem;
 });
}
function spoken(e:Example):string {
 const v=e.visual;
 const extra=v.type==='number_y5_budget'?`Money available: ${v.budget} dollars. ${(v.purchases as Array<{label:string;quantity:number;price:number}>).map(p=>`${p.label}: quantity ${p.quantity}, ${p.price} dollars each.`).join(' ')}`
 :Array.isArray(v.rows)?(v.rows as string[][]).map(r=>r.join(': ')).join('. ')
 :v.type==='number_y5_percent_grid'?'A ten by ten grid is shown. Count the shaded squares.'
 :v.type==='number_y5_decision'?`Start at ${v.start}. Is it divisible by 3? If yes, divide by 3. If no, add 1.`
 :v.type==='number_y5_number_line'?`The line runs from ${v.min} to ${v.max} with ${v.divisions} equal intervals. The marker is ${v.marker} intervals from zero.`
 :v.type==='number_y5_division'?`${v.dividend} divided by ${v.divisor}.`
 :v.expression?String(v.expression):v.value?String(v.value):v.fraction?String(v.fraction):Array.isArray(v.values)?v.values.join(', '):'';
 return `${e.prompt} ${extra}`.trim();
}
export const NUMBER_LEVEL5_FIVE_FORMS=Object.fromEntries(NUMBER_LEVEL5_FORMS.map((form,f)=>[form,make(form,f)])) as Record<NumberLevel5Form,NumberLevel5ReviewItem[]>;
