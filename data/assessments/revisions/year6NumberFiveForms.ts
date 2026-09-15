import { YEAR6_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS as benchmark } from '../year6NumberNexusIndependentBanks';
import { createUncalibratedItemStatistics } from '../assessmentItemStandard';
export const NUMBER_LEVEL6_FORMS = ['pretest','posttest','start','mid','end'] as const;
export type NumberLevel6Form = typeof NUMBER_LEVEL6_FORMS[number];
export const NUMBER_LEVEL6_FORM_LABELS = {pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
type Base = typeof benchmark[number];
export type NumberLevel6ReviewItem = Omit<Base,'form'|'sourcePool'> & {form:NumberLevel6Form;sourcePool:'assessment_review';readAloudText:string;showFractionModels:boolean};
type Example = {prompt:string;correctAnswer:string;visual:Record<string,unknown>;type:string;options?:string[]};
const numeric = (prompt:string,answer:number,visual:Record<string,unknown>):Example => ({prompt,correctAnswer:String(Number(answer.toFixed(8))),visual,type:'numeric'});
const calculation = (expression:string) => ({type:'number_y6_calculation',expression});
const profiles = [
 {temperatures:[7,-5,0,-12],point:[4,-3],prime:43,composites:[49,51],divisor:8,square:16,fractions:['5/12','2/5','3/8'],targetFraction:'1/4',tick:3,addTop:16.58,subtractTop:14.3,fractionAdd:[3,1],fractionSubtract:['5/6','1/4',7],scale:3.086,divide:47.2,quantity:156,price:180,tank:840,estimate:[39.6,504],discountEstimate:198,budget:[1250,460,24,24.5],rates:[18,12],kits:[720,42]},
 {temperatures:[9,-6,0,-14],point:[-3,-4],prime:47,composites:[49,57],divisor:12,square:36,fractions:['5/8','7/12','3/5'],targetFraction:'3/4',tick:9,addTop:26.58,subtractTop:15.3,fractionAdd:[1,3],fractionSubtract:['2/3','1/4',5],scale:4.073,divide:62.8,quantity:188,price:240,tank:680,estimate:[39.8,746],discountEstimate:398,budget:[1500,520,32,23.5],rates:[16,10],kits:[900,44]},
 {temperatures:[8,-7,0,-16],point:[-4,2],prime:53,composites:[49,63],divisor:18,square:36,fractions:['11/12','4/5','7/8'],targetFraction:'1/3',tick:4,addTop:36.58,subtractTop:16.3,fractionAdd:[3,3],fractionSubtract:['5/6','3/4',1],scale:5.064,divide:78.4,quantity:236,price:260,tank:760,estimate:[39.7,654],discountEstimate:598,budget:[1550,560,28,26.5],rates:[20,13],kits:[1000,46]},
 {temperatures:[6,-8,0,-18],point:[2,4],prime:59,composites:[81,69],divisor:20,square:100,fractions:['5/12','2/5','5/8'],targetFraction:'2/3',tick:8,addTop:46.58,subtractTop:17.3,fractionAdd:[1,7],fractionSubtract:['3/4','1/6',7],scale:6.047,divide:83.6,quantity:268,price:320,tank:920,estimate:[39.9,854],discountEstimate:798,budget:[1700,580,36,22.5],rates:[22,14],kits:[1100,48]},
 {temperatures:[5,-9,0,-17],point:[3,-2],prime:61,composites:[49,87],divisor:28,square:196,fractions:['4/5','7/12','5/8'],targetFraction:'5/6',tick:10,addTop:56.58,subtractTop:18.3,fractionAdd:[1,1],fractionSubtract:['3/4','1/3',5],scale:7.038,divide:96.4,quantity:316,price:360,tank:880,estimate:[39.8,954],discountEstimate:998,budget:[1750,620,40,21.5],rates:[24,15],kits:[1200,52]},
] as const;
const labels=['Order integers','Read Cartesian coordinates','Identify a prime','Combine square and multiple properties','Order unlike fractions','Represent equivalent fractions on a line','Add decimals','Subtract decimals','Add unlike fractions','Subtract unlike fractions','Multiply a decimal by a multiple of ten','Divide a decimal by a power of ten','Find a quarter of a quantity','Calculate a sale price','Find unfilled capacity','Estimate a percentage amount','Estimate a discount','Solve a decimal budget','Compare whole-pack costs','Maximise a discounted purchase'];
const difficulties=['easy','moderate','easy','challenging','challenging','moderate','moderate','moderate','moderate','moderate','moderate','moderate','easy','moderate','challenging','moderate','moderate','challenging','challenging','challenging'] as const;
function make(form:NumberLevel6Form,f:number):NumberLevel6ReviewItem[] {
 const p=profiles[f];const [x,y]=p.point;
 const coords=[`(${x}, ${y})`,`(${-x}, ${y})`,`(${x}, ${-y})`,`(${-x}, ${-y})`];
 const value=(fraction:string)=>{const [n,d]=fraction.split('/').map(Number);return n/d;};
 const examples:Example[]=[
  {prompt:'Order the temperatures from coldest to warmest.',type:'number_order',options:p.temperatures.map(String),correctAnswer:[...p.temperatures].sort((a,b)=>a-b).join('||'),visual:{type:'number_y6_integer_set',values:p.temperatures.map(t=>`${t}°C`)}},
  {prompt:'What are the coordinates of point P?',type:'mcq',options:coords,correctAnswer:coords[0],visual:{type:'number_y6_coordinate',points:[{x,y,label:'P'}]}},
  {prompt:'Which number is prime?',type:'mcq',options:[String(p.prime),...p.composites.map(String)],correctAnswer:String(p.prime),visual:{type:'number_y6_prime_choice'}},
  numeric(`What is the smallest positive square number divisible by ${p.divisor}?`,p.square,{type:'number_y6_constraint',rules:['Positive square number',`Divisible by ${p.divisor}`]}),
  {prompt:'Order the fractions from smallest to largest.',type:'fraction_order',options:[...p.fractions],correctAnswer:[...p.fractions].sort((a,b)=>value(a)-value(b)).join(','),visual:{type:'number_y6_fraction_set',values:[...p.fractions]}},
  {prompt:`Tap the point that represents ${p.targetFraction}.`,type:'fraction_number_line',correctAnswer:`${p.tick}/12`,visual:{type:'number_y6_fraction_placement',targetFraction:p.targetFraction,divisions:12}},
  numeric('Calculate the sum.',p.addTop+7.437,calculation(`${p.addTop} + 7.437`)),
  numeric('Calculate the difference.',p.subtractTop-7.875,calculation(`${p.subtractTop} − 7.875`)),
  numeric('Add. Enter the missing numerator.',p.fractionAdd[0]*5+p.fractionAdd[1]*2,{type:'number_y6_fraction_equation',expression:`${p.fractionAdd[0]}/4 + ${p.fractionAdd[1]}/10 = ?/20`}),
  numeric('Subtract. Enter the missing numerator.',p.fractionSubtract[2],{type:'number_y6_fraction_equation',expression:`${p.fractionSubtract[0]} − ${p.fractionSubtract[1]} = ?/12`}),
  numeric('Calculate the product.',p.scale*20,calculation(`${p.scale} × 20`)),
  numeric('Calculate the result.',p.divide/1000,calculation(`${p.divide} ÷ 1000`)),
  numeric('What is one quarter of the quantity?',p.quantity/4,{type:'number_y6_quantity',whole:p.quantity,part:'1/4'}),
  numeric('What is the sale price in dollars?',p.price*0.8,{type:'number_y6_discount',price:p.price,discount:20}),
  numeric('How many litres of the tank are empty?',p.tank*0.35,{type:'number_y6_tank',capacity:p.tank,percentFull:65}),
  numeric('Round as shown, then estimate the amount.',Math.round(p.estimate[0])*Math.round(p.estimate[1]/10)*10/100,{type:'number_y6_round_estimate',percent:p.estimate[0],quantity:p.estimate[1]}),
  numeric('Round the price to the nearest hundred. Estimate the discount in dollars.',Math.round(p.discountEstimate/100)*25,{type:'number_y6_discount',price:p.discountEstimate,discount:25}),
  numeric('After paying for hall hire and meals, how many dollars remain?',p.budget[0]-p.budget[1]-p.budget[2]*p.budget[3],{type:'number_y6_budget',budget:p.budget[0],purchases:[{label:'Hall hire',quantity:1,price:p.budget[1]},{label:'Meals',quantity:p.budget[2],price:p.budget[3]}]}),
  numeric('How many dollars are saved buying exactly 12 kg with the cheaper option?',Math.abs(p.rates[0]*3-p.rates[1]*4),{type:'number_y6_rates',packs:[{label:'Pack A',kg:4,price:p.rates[0]},{label:'Pack B',kg:3,price:p.rates[1]}]}),
  numeric('What is the greatest number of whole kits the club can buy?',Math.floor(p.kits[0]/(p.kits[1]*0.9)),{type:'number_y6_kit_budget',budget:p.kits[0],price:p.kits[1],discount:10}),
 ];
 return examples.map((e,i)=>{
  const id=`y6-number-review-${form}-${String(i+1).padStart(2,'0')}-v3`;
  const options=e.type==='mcq'?e.options!.slice((f+i)%e.options!.length).concat(e.options!.slice(0,(f+i)%e.options!.length)):e.options;
  const visual={...e.visual,reviewPresentation:true};const cognitiveCategory=[14,17,18,19].includes(i)?'transfer':[3,4,5].includes(i)?'reasoning':'application';
  return {...benchmark[i],...e,visual,options,id,version:'3.0.0-review.1',form,sourcePool:'assessment_review',bankId:`number-level6-${form}-review-v3`,answer:e.correctAnswer,skillId:`number-y6-review-slot-${i+1}`,skillLabel:labels[i],contextKey:id,structureKey:`number-level6-slot-${i+1}`,difficulty:difficulties[i],statistics:createUncalibratedItemStatistics(difficulties[i]),cognitiveCategory,
   requiresReasoning:cognitiveCategory==='reasoning'||cognitiveCategory==='transfer',isTransfer:cognitiveCategory==='transfer',misconceptionDiagnosis:e.type==='mcq',responseMode:e.type==='mcq'?'selected_response':e.type==='number_order'||e.type==='fraction_order'||e.type==='fraction_number_line'?'manipulated_response':'constructed_response',selectedAnswerPosition:e.type==='mcq'?options!.indexOf(e.correctAnswer)+1:undefined,
   scoring:{kind:'exact',correctResponse:e.correctAnswer},renderer:{type:e.type,payload:{prompt:e.prompt,visual,options}},showFractionModels:false,readAloudText:spoken(e),
  } as NumberLevel6ReviewItem;
 });
}
function spoken(e:Example):string {
 const v=e.visual;
 const extra=v.type==='number_y6_coordinate'?'Use the marked point on the Cartesian grid.'
 :v.type==='number_y6_tank'?`Total capacity ${v.capacity} litres. The tank is ${v.percentFull} percent full.`
 :v.type==='number_y6_round_estimate'?`${v.percent} percent: round to a whole percent. Quantity ${v.quantity}: round to the nearest ten.`
 :v.type==='number_y6_kit_budget'?`Money available ${v.budget} dollars. Original price for one kit: ${v.price} dollars. Ten percent off each kit. No extra fees.`
 :v.type==='number_y6_budget'?`Money available ${v.budget} dollars. ${(v.purchases as Array<{label:string;quantity:number;price:number}>).map(p=>`${p.label}: ${p.quantity} at ${p.price} dollars each.`).join(' ')}`
 :v.type==='number_y6_rates'?(v.packs as Array<{label:string;kg:number;price:number}>).map(p=>`${p.label}: ${p.kg} kilograms for ${p.price} dollars per pack.`).join(' ')
 :v.type==='number_y6_discount'?`Original price ${v.price} dollars. Discount ${v.discount} percent.`
 :v.type==='number_y6_quantity'?`Quantity ${v.whole}.`
 :v.type==='number_y6_fraction_placement'?`The line runs from zero to one, with twelve equal parts. Choose a tick on the line.`
 :v.expression?String(v.expression):Array.isArray(v.values)?v.values.join(', '):Array.isArray(v.rules)?v.rules.join(', '):'';
 return `${e.prompt} ${extra}`.trim();
}
export const NUMBER_LEVEL6_FIVE_FORMS=Object.fromEntries(NUMBER_LEVEL6_FORMS.map((form,f)=>[form,make(form,f)])) as Record<NumberLevel6Form,NumberLevel6ReviewItem[]>;
