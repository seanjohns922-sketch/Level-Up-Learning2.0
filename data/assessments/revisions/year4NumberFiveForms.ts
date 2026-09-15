import {YEAR4_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS as benchmark} from '../year4NumberNexusIndependentBanks';
import {createUncalibratedItemStatistics} from '../assessmentItemStandard';
export const NUMBER_LEVEL4_FORMS=['pretest','posttest','start','mid','end'] as const;
export type NumberLevel4Form=typeof NUMBER_LEVEL4_FORMS[number];
export const NUMBER_LEVEL4_FORM_LABELS={pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
type Base=typeof benchmark[number];
export type NumberLevel4ReviewItem=Omit<Base,'form'|'sourcePool'> & {form:NumberLevel4Form;sourcePool:'assessment_review';readAloudText:string};
type Example={prompt:string;correctAnswer:string;visual:Record<string,unknown>;type?:string;options?:string[]};
const numeric=(prompt:string,answer:number,visual:Record<string,unknown>):Example=>({prompt,correctAnswer:String(answer),visual,type:'numeric',options:[]});
const equation=(expression:string)=>({type:'number_y4_equation',expression});
const profiles=[
 {decimal:'4.06',digit:6,compare:['4.7','4.53'],odd:[24,33,45,56,68,79],fraction:[1,8],fifth:7,quarter:0,line:1,scale:42,top:2578,multiply:37,quotient:107,round:746,estimate:[3,48],budget:[350,5,53],tickets:[6,28,14],vans:[8,14,17],event:[450,6,37,3,29],algorithm:4,sequence:[7,8]},
 {decimal:'6.08',digit:8,compare:['5.6','5.42'],odd:[26,35,47,58,62,71],fraction:[5,8],fifth:12,quarter:4,line:2,scale:53,top:3578,multiply:47,quotient:108,round:846,estimate:[4,48],budget:[400,5,63],tickets:[7,28,14],vans:[9,14,17],event:[500,6,47,3,29],algorithm:5,sequence:[8,9]},
 {decimal:'7.04',digit:4,compare:['6.8','6.64'],odd:[28,37,49,52,64,73],fraction:[7,8],fifth:17,quarter:8,line:3,scale:64,top:4578,multiply:57,quotient:109,round:946,estimate:[5,48],budget:[450,5,73],tickets:[8,28,14],vans:[7,14,17],event:[550,6,57,3,29],algorithm:6,sequence:[6,7]},
 {decimal:'8.07',digit:7,compare:['7.5','7.34'],odd:[22,39,41,54,66,75],fraction:[3,8],fifth:18,quarter:12,line:4,scale:75,top:5578,multiply:67,quotient:106,round:646,estimate:[6,48],budget:[500,5,83],tickets:[9,28,14],vans:[6,14,17],event:[600,6,67,3,29],algorithm:7,sequence:[9,6]},
 {decimal:'9.03',digit:3,compare:['8.9','8.72'],odd:[24,31,43,56,68,77],fraction:[6,8],fifth:22,quarter:16,line:5,scale:86,top:6578,multiply:77,quotient:104,round:546,estimate:[7,48],budget:[550,5,93],tickets:[5,28,14],vans:[5,14,17],event:[650,6,77,3,29],algorithm:8,sequence:[5,8]},
] as const;
// Each form tests the same parity inference, with a new four-digit example.
function make(form:NumberLevel4Form,f:number):NumberLevel4ReviewItem[]{
 const p=profiles[f];const factor=3;
 const parity=1235+f*202;
 const correctCompare=`${p.compare[0]} is greater than ${p.compare[1]}`;
 const correctRule=`${parity} × ${parity+2} is odd: both factors are odd.`;
 const check=`${p.quotient} × 8 = ${p.quotient*8}`;
 const start=p.sequence[0],step=p.sequence[1];
 const sequenceAnswer=[`Start at ${start}.`,'Record the current number.',`Add ${step}.`,'Repeat steps 2 and 3.'];
 const examples:Example[]=[
 numeric(`What value does the digit ${p.digit} have?`,p.digit/100,{type:'number_y4_decimal_chart',value:p.decimal,focus:'hundredths'}),
 {prompt:'Choose the true decimal comparison.',correctAnswer:correctCompare,type:'mcq',options:[correctCompare,`${p.compare[1]} is greater because it has more digits.`,'The numbers are equal.'],visual:{type:'number_y4_decimal_compare',left:p.compare[0],right:p.compare[1]}},
 numeric('How many numbers are odd?',3,{type:'number_y4_number_set',values:[...p.odd]}),
 {prompt:'Without multiplying, choose the correct conclusion and reason.',type:'mcq',correctAnswer:correctRule,options:[correctRule,`${parity} × ${parity+2} is even: every product is even.`,`${parity} × ${parity+2} is even: two odd numbers always make even.`],visual:equation(`${parity} × ${parity+2}`)},
 numeric('Complete the equivalent fraction. Enter the missing numerator.',p.fraction[0]*factor,{type:'number_y4_fraction_equivalence',left:[...p.fraction],right:[null,8*factor]}),
 numeric('Write this fraction as a decimal.',p.fifth/25,{type:'number_y4_fraction_decimal',numerator:p.fifth,denominator:25,reported:'?',contextLabel:['Ribbon','Track','Water','Ribbon','Track'][f]}),
 numeric('Continue counting by quarters. Enter the missing numerator.',p.quarter+3,{type:'number_y4_fraction_sequence',values:[`${p.quarter}/4`,`${p.quarter+1}/4`,`${p.quarter+2}/4`,'?/4'],answerDenominator:4}),
 numeric('What decimal is marked on the line?',p.line+0.25,{type:'number_y4_number_line',min:p.line,max:p.line+1,divisions:4,marker:1}),
 numeric('Find the scaled product.',p.scale*100,equation(`${p.scale} × 100`)),
 numeric('Find the sum.',p.top+1696,{type:'number_y4_vertical_calculation',top:p.top,bottom:1696,operation:'+'}),
 numeric('Work out the multiplication.',p.multiply*8,equation(`${p.multiply} × 8`)),
 {prompt:'Select the multiplication that checks this division.',type:'mcq',correctAnswer:check,options:[check,`${p.quotient} + 8 = ${p.quotient+8}`,`${p.quotient*8} × 8 = ${p.quotient*64}`],visual:equation(`${p.quotient*8} ÷ 8 = ${p.quotient}`)},
 numeric(`Round ${p.round} to the nearest hundred.`,Math.round(p.round/100)*100,{type:'number_y4_rounding',value:p.round,benchmark:100}),
 numeric('Round the price to the nearest ten dollars. Estimate the total cost.',p.estimate[0]*50,{type:'number_y4_receipt',rows:[['Items',String(p.estimate[0])],['Price each',`$${p.estimate[1]}`]]}),
 numeric('How many dollars remain in the budget?',p.budget[0]-p.budget[1]*p.budget[2],{type:'number_y4_budget',budget:p.budget[0],items:[{label:'Supplies',quantity:p.budget[1],price:p.budget[2]}]}),
 numeric('What is the total cost in dollars?',p.tickets[0]*p.tickets[1]+p.tickets[2],{type:'number_y4_budget',budget:null,items:[{label:'Tickets',quantity:p.tickets[0],price:p.tickets[1]},{label:'Booking fee',quantity:1,price:p.tickets[2]}]}),
 numeric('How many students are travelling?',p.vans[0]*p.vans[1]-p.vans[2],{type:'number_y4_model',rows:[['Vans',String(p.vans[0])],['Seats in each van',String(p.vans[1])],['Empty seats',String(p.vans[2])]]}),
 numeric('After buying meals and passes, how many dollars remain?',p.event[0]-p.event[1]*p.event[2]-p.event[3]*p.event[4],{type:'number_y4_budget',budget:p.event[0],items:[{label:'Meals',quantity:p.event[1],price:p.event[2]},{label:'Passes',quantity:p.event[3],price:p.event[4]}]}),
 numeric('Continue the pattern. Enter the missing number.',p.algorithm*4,{type:'number_y4_algorithm',start:p.algorithm,rule:'Multiply by 2',outputs:[p.algorithm,p.algorithm*2,null]}),
 {prompt:'Put the four instructions in order to generate the sequence.',type:'number_order',correctAnswer:sequenceAnswer.join('||'),options:[sequenceAnswer[3],sequenceAnswer[2],sequenceAnswer[1],sequenceAnswer[0]],visual:{type:'number_y4_sequence',values:[start,start+step,start+step*2,start+step*3]}},
 ];
 return examples.map((e,i)=>{
  const base=benchmark[i];const id=`y4-number-review-${form}-${String(i+1).padStart(2,'0')}-v3`;
  const options=e.options?.length&&e.type==='mcq'?[...e.options.slice((f+i)%3),...e.options.slice(0,(f+i)%3)]:e.options;
  const difficulty=[3,17].includes(i)?'challenging':[5,13].includes(i)?'moderate':base.difficulty;
  const cognitiveCategory=i===3?'reasoning':i===17?'transfer':[5,13].includes(i)?'application':base.cognitiveCategory;
  const skillLabel=i===5?'Convert a fraction to a decimal':i===3?'Apply odd-number multiplication properties':i===13?'Estimate a financial total':i===17?'Solve a two-item budget':base.skillLabel;
  return {...base,...e,visual:{...e.visual,reviewPresentation:true},options,id,version:'3.0.0-review.1',form,sourcePool:'assessment_review',bankId:`number-level4-${form}-review-v3`,answer:e.correctAnswer,
   contextKey:id,skillId:`number-y4-review-slot-${i+1}`,structureKey:`number-level4-slot-${i+1}`,skillLabel,difficulty,statistics:createUncalibratedItemStatistics(difficulty),
   cognitiveCategory,isTransfer:cognitiveCategory==='transfer',requiresReasoning:cognitiveCategory==='reasoning'||cognitiveCategory==='transfer',misconceptionDiagnosis:e.type==='mcq',responseMode:e.type==='mcq'?'selected_response':e.type==='number_order'?'manipulated_response':'constructed_response',
   selectedAnswerPosition:e.type==='mcq'?(options?.indexOf(e.correctAnswer)??-1)+1:undefined,
   scoring:{kind:'exact',correctResponse:e.correctAnswer},renderer:{type:e.type,payload:{prompt:e.prompt,visual:e.visual,options}},
   readAloudText:spoken(e),
  } as NumberLevel4ReviewItem;
 });
}
function spoken(e:Example){
 const v=e.visual;
 const extra=v.type==='number_y4_budget'?`${v.budget==null?'':`Budget ${v.budget} dollars.`} ${(v.items as Array<{label:string;quantity:number;price:number}>).map(i=>`${i.label}: ${i.quantity} at ${i.price} dollars each.`).join(' ')}`
 :Array.isArray(v.rows)?(v.rows as string[][]).map(r=>r.join(': ')).join('. ')
 :v.type==='number_y4_number_line'?`The line runs from ${v.min} to ${v.max}, split into ${v.divisions} equal intervals. The point is at interval ${v.marker} from the left.`
 :v.type==='number_y4_decimal_compare'?`${v.left} and ${v.right}.`
 :v.expression?String(v.expression):v.type==='number_y4_decimal_chart'?String(v.value)
 :v.type==='number_y4_fraction_equivalence'?`${(v.left as number[]).join(' over ')} equals an unknown numerator over ${(v.right as unknown[])[1]}.`
 :v.type==='number_y4_fraction_decimal'?`${v.numerator} over ${v.denominator}.`
 :v.type==='number_y4_vertical_calculation'?`${v.top} plus ${v.bottom}.`
 :v.type==='number_y4_algorithm'?`${v.rule}. ${String(v.outputs).replace(/,$/,', missing number')}`
 :Array.isArray(v.values)?v.values.join(', '):'';
 return `${e.prompt} ${extra}`.trim();
}
export const NUMBER_LEVEL4_FIVE_FORMS=Object.fromEntries(NUMBER_LEVEL4_FORMS.map((f,i)=>[f,make(f,i)])) as Record<NumberLevel4Form,NumberLevel4ReviewItem[]>;
