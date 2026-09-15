import { createUncalibratedItemStatistics } from '../assessmentItemStandard';

export const NUMBER_LEVEL7_FORMS = ['pretest','posttest','start','mid','end'] as const;
export type NumberLevel7Form = typeof NUMBER_LEVEL7_FORMS[number];
export const NUMBER_LEVEL7_FORM_LABELS = {pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
type Visual = {type:'number_y7_panel';kind:string;[key:string]:unknown};
type Example = {prompt:string;correctAnswer:string;type:'numeric'|'mcq'|'number_order';visual:Visual;options?:string[];readAloudText:string};
const visual=(kind:string,data:Record<string,unknown>):Visual=>({type:'number_y7_panel',kind,...data});
const numeric=(prompt:string,answer:number,v:Visual,spoken:string):Example=>({prompt,correctAnswer:String(Number(answer.toFixed(8))),type:'numeric',visual:v,readAloudText:`${prompt} ${spoken}`});
const choice=(prompt:string,answer:string,options:string[],v:Visual,spoken:string):Example=>({prompt,correctAnswer:answer,type:'mcq',options,visual:v,readAloudText:`${prompt} ${spoken}`});
const calc=(expression:string)=>visual('expression',{expression});
const profiles=[
 {root:12,side:13,factors:['72','2³ × 3²','2² × 3³','2³ × 9²','2 × 3 × 12'],expanded:[4,6,8],line:-1.25,percent:3,round:18.276,paint:7.4,add:['3/7','3/4','33/28'],subtract:['6/7','1/4','17/28'],multiply:['3/4','1/7','3/28'],divide:['1/7','3/4','4/21'],decimal:[3.6,2.4,7.56,1.8],integers:[8,15,9,14],ratio:[2,3],share:150,sale:[80,8],fundraiser:[240,40,9]},
 {root:14,side:15,factors:['108','2² × 3³','2³ × 3²','4² × 3³','2 × 3 × 18'],expanded:[5,7,9],line:-1.75,percent:7,round:23.486,paint:9.4,add:['4/7','3/4','37/28'],subtract:['5/7','1/4','13/28'],multiply:['3/4','2/7','6/28'],divide:['2/7','3/4','8/21'],decimal:[4.8,2.6,8.64,2.4],integers:[9,17,12,18],ratio:[3,4],share:210,sale:[120,9],fundraiser:[200,35,8]},
 {root:16,side:17,factors:['200','2³ × 5²','2² × 5³','2³ × 25²','2 × 5 × 20'],expanded:[6,8,3],line:-0.75,percent:9,round:34.657,paint:11.4,add:['5/7','3/4','41/28'],subtract:['4/7','1/4','9/28'],multiply:['3/4','3/7','9/28'],divide:['3/7','3/4','12/21'],decimal:[5.6,2.8,9.24,2.2],integers:[12,19,15,23],ratio:[2,5],share:280,sale:[160,7],fundraiser:[320,50,8]},
 {root:18,side:19,factors:['288','2⁵ × 3²','2² × 3⁵','2⁵ × 9²','2 × 3 × 48'],expanded:[7,9,4],line:-0.25,percent:13,round:45.738,paint:13.4,add:['6/7','3/4','45/28'],subtract:['3/7','1/4','5/28'],multiply:['3/4','4/7','12/28'],divide:['4/7','3/4','16/21'],decimal:[6.4,2.7,10.08,2.8],integers:[14,23,17,26],ratio:[3,5],share:320,sale:[180,6],fundraiser:[300,60,8]},
 {root:15,side:16,factors:['392','2³ × 7²','2² × 7³','2³ × 49²','2 × 7 × 28'],expanded:[8,3,6],line:-2.25,percent:17,round:56.849,paint:15.4,add:['6/7','1/4','31/28'],subtract:['2/7','1/4','1/28'],multiply:['3/4','5/7','15/28'],divide:['5/7','3/4','20/21'],decimal:[7.2,2.3,11.52,3.2],integers:[16,25,19,28],ratio:[4,5],share:360,sale:[240,8],fundraiser:[240,60,7]},
] as const;
export const NUMBER_LEVEL7_BLUEPRINT=[
 ['AC9M7N01','Find a perfect-square root','easy'],['AC9M7N01','Use square area to find perimeter','moderate'],
 ['AC9M7N02','Express prime factors using powers','moderate'],['AC9M7N03','Expand place value using powers of ten','moderate'],
 ['AC9M7N04','Read a negative fraction on a number line','moderate'],['AC9M7N04','Convert a fraction to a percentage','easy'],
 ['AC9M7N05','Round a decimal to a specified accuracy','easy'],['AC9M7N05','Round a purchase up for its purpose','moderate'],
 ['AC9M7N06','Add unlike fractions','moderate'],['AC9M7N06','Subtract unlike fractions','moderate'],
 ['AC9M7N06','Multiply positive fractions','moderate'],['AC9M7N06','Divide positive fractions','moderate'],
 ['AC9M7N06','Multiply decimals','moderate'],['AC9M7N06','Divide by a decimal','moderate'],
 ['AC9M7N07','Add integers across zero','moderate'],['AC9M7N07','Subtract a negative integer','moderate'],
 ['AC9M7N08','Simplify a part-to-part ratio','moderate'],['AC9M7N08','Share a quantity in a ratio','moderate'],
 ['AC9M7N09','Model a discount and delivery cost','challenging'],['AC9M7N09','Model profit as a percentage of cost','challenging'],
 ['AC9M7N01','Locate a non-square root between integers','moderate'],['AC9M7N02','Find the highest common factor','moderate'],
 ['AC9M7N03','Identify a place-value exponent','moderate'],['AC9M7N04','Simplify a positive fraction','moderate'],
 ['AC9M7N05','Estimate a contextual decimal product','moderate'],['AC9M7N06','Combine decimal operations','challenging'],
 ['AC9M7N07','Order negative and positive integers','easy'],['AC9M7N08','Find one component of a mixture','moderate'],
 ['AC9M7N09','Compare unit prices','challenging'],['AC9M7N09','Choose a profit model','moderate'],
] as const;
function make(form:NumberLevel7Form,f:number){
 const p=profiles[f], [a,b,c]=p.expanded;
 const expanded=`${a} × 10⁵ + ${b} × 10³ + ${c} × 10`;
 const target=a*100000+b*1000+c*10;
 const frac=(pair:readonly [string,string,string],op:string,prompt:string)=>{
  const [a,b]=pair[0].split('/').map(Number),[c,d]=pair[1].split('/').map(Number);
  const [n,den]=pair[2].split('/').map(Number);
  // Distractors represent operations on numerators/denominators and incorrect reciprocals.
  const wrong=op==='+'?[[a+c,b+d],[a+c,b*d],[Math.abs(a*d-c*b),b*d]]
    :op==='−'?[[a-c,b*d],[a*d+c*b,b*d],[Math.abs(a-c),Math.abs(b-d)]]
    :op==='×'?[[a*d+c*b,b*d],[a*d,b*c],[a*c,b+d]]
    :[[a*c,b*d],[b*c,a*d],[a,b*c*d]];
  const options=[pair[2]],seen=[n/den];
  for(const [num,div] of [...wrong,[n+1,den],[n+2,den]]){
   if(div>0&&!seen.some(v=>Math.abs(v-num/div)<1e-12)){options.push(`${num}/${div}`);seen.push(num/div);}
   if(options.length===4)break;
  }
  return choice(prompt,pair[2],options,calc(`${pair[0]} ${op} ${pair[1]}`),`${pair[0]} ${op==='×'?'times':op==='÷'?'divided by':op==='+'?'plus':'minus'} ${pair[1]}.`);
 };
 const ratio=`${p.ratio[0]}:${p.ratio[1]}`;
 const fractionLabel=`${p.line*4}/4`;
 const extra={bound:7+f,hcf:36+f*6,exponent:[5,6,7,4,8][f],simpleNumerator:2+f,estimate:[12.48+f*2,7.65+f],mixParts:[2+f,3+f],mixUnit:60+f*10};
 const packData=[{label:'Pack A',kg:3,price:24+6*f},{label:'Pack B',kg:5,price:35+10*f},{label:'Pack C',kg:4,price:32+8*f},{label:'Pack D',kg:2,price:18+4*f}];
 const temperatures=[-12-f*2,-7-f,0,5+f];
 const extras:Example[]=[
  numeric('Which whole number is immediately below this square root?',extra.bound,calc(`√${extra.bound**2+extra.bound}`),`Square root of ${extra.bound**2+extra.bound}.`),
  numeric('What is the highest common factor of these numbers?',extra.hcf,visual('factors',{values:[extra.hcf*2,extra.hcf*3]}),`${extra.hcf*2} and ${extra.hcf*3}.`),
  numeric('Enter the missing exponent.',extra.exponent,visual('power',{digit:a,number:a*10**extra.exponent}),`${a*10**extra.exponent} equals ${a} times ten to the power of a missing number.`),
  choice('Choose the fraction in simplest form.',`${extra.simpleNumerator}/7`,[`${extra.simpleNumerator}/7`,`${extra.simpleNumerator*2}/14`,`${extra.simpleNumerator}/21`,`${extra.simpleNumerator+1}/7`],calc(`${extra.simpleNumerator*3}/21`),`${extra.simpleNumerator*3} over twenty-one.`),
  numeric('Round both values to whole numbers. Estimate the cost in dollars.',Math.round(extra.estimate[0])*Math.round(extra.estimate[1]),visual('estimate',{metres:extra.estimate[0],price:extra.estimate[1]}),`${extra.estimate[0]} metres at ${extra.estimate[1]} dollars per metre.`),
  numeric('Calculate the result.',(3.6+f*1.2+1.8)/.6,calc(`(${Number((3.6+f*1.2).toFixed(1))} + 1.8) ÷ 0.6`),`${Number((3.6+f*1.2).toFixed(1))} plus 1.8, then divide the sum by 0.6.`),
  {prompt:'Order the temperatures from coldest to warmest.',type:'number_order',correctAnswer:temperatures.join('||'),options:[String(temperatures[3]),String(temperatures[0]),'0',String(temperatures[1])],visual:visual('ordering',{}),readAloudText:`Order these temperatures from coldest to warmest: ${temperatures.join(', ')} degrees.`},
  numeric('How many millilitres of water are needed?',extra.mixParts[1]*extra.mixUnit,visual('mixture',{total:(extra.mixParts[0]+extra.mixParts[1])*extra.mixUnit,ratio:extra.mixParts.join(':')}),`Make ${(extra.mixParts[0]+extra.mixParts[1])*extra.mixUnit} millilitres. Concentrate to water is ${extra.mixParts.join(' to ')}.`),
  choice('Which pack has the lowest price per kilogram?','Pack B',packData.map(p=>p.label),visual('packs',{packs:packData}),packData.map(p=>`${p.label}: ${p.kg} kilograms for ${p.price} dollars.`).join(' ')),
  choice('Which calculation finds the profit?',`${(p.fundraiser[1]+10)} × ${(p.fundraiser[2]+1)} − ${(p.fundraiser[0]+40)}`,[`${(p.fundraiser[1]+10)} × ${(p.fundraiser[2]+1)} − ${(p.fundraiser[0]+40)}`,`${(p.fundraiser[0]+40)} − ${(p.fundraiser[1]+10)} × ${(p.fundraiser[2]+1)}`,`${(p.fundraiser[1]+10)} × (${(p.fundraiser[2]+1)} − ${(p.fundraiser[0]+40)})`,`${(p.fundraiser[1]+10)} × ${(p.fundraiser[2]+1)} + ${(p.fundraiser[0]+40)}`],visual('fundraiser',{cost:(p.fundraiser[0]+40),tickets:(p.fundraiser[1]+10),price:(p.fundraiser[2]+1)}),`Total cost ${(p.fundraiser[0]+40)} dollars. ${(p.fundraiser[1]+10)} tickets at ${(p.fundraiser[2]+1)} dollars each.`),
 ];
 const items:Example[]=[
  numeric('Find the square root.',p.root,calc(`√${p.root*p.root}`),`Square root of ${p.root*p.root}.`),
  numeric('What is the perimeter of this square, in metres?',4*p.side,visual('square',{area:p.side*p.side}),`A square has area ${p.side*p.side} square metres.`),
  choice('Which expression uses powers of prime factors?',p.factors[1],p.factors.slice(1),calc(p.factors[0]),`Represent ${p.factors[0]} as powers of prime factors.`),
  choice('Choose the correct expanded form.',expanded,[expanded,`${a} × 10⁵ + ${b} × 10² + ${c} × 10`,`${a} × 10⁴ + ${b} × 10³ + ${c} × 10`,`${a} × 10⁵ + ${b} × 10³ + ${c}`],calc(String(target)),`The number is ${target}.`),
  choice('Which fraction is marked on the number line?',fractionLabel,[fractionLabel,`${-p.line*4}/4`,`${p.line*4-2}/4`,`${p.line*4-4}/4`],visual('number-line',{marker:p.line}), 'The line runs from negative three to one. Each unit has four equal parts.'),
  numeric('Write this fraction as a percentage.',p.percent*5,calc(`${p.percent}/20`),`${p.percent} twentieths. Enter the percentage number.`),
  numeric('Round to two decimal places.',Math.round(p.round*100)/100,calc(String(p.round)),String(p.round)),
  numeric('What is the fewest number of tins needed?',Math.ceil(p.paint/2),visual('paint',{litres:p.paint,tin:2}),`The job needs ${p.paint} litres. Each full tin holds two litres. Buy whole tins.`),
  frac(p.add,'+','Add the fractions.'),frac(p.subtract,'−','Subtract the fractions.'),frac(p.multiply,'×','Multiply the fractions.'),frac(p.divide,'÷','Divide the fractions.'),
  numeric('Calculate the product.',p.decimal[0]*p.decimal[1],calc(`${p.decimal[0]} × ${p.decimal[1]}`),`${p.decimal[0]} times ${p.decimal[1]}.`),
  numeric('Calculate the quotient.',p.decimal[2]/p.decimal[3],calc(`${p.decimal[2]} ÷ ${p.decimal[3]}`),`${p.decimal[2]} divided by ${p.decimal[3]}.`),
  numeric('Calculate the result.',p.integers[0]-p.integers[1],calc(`${p.integers[0]} + (−${p.integers[1]})`),`${p.integers[0]} plus negative ${p.integers[1]}.`),
  numeric('Calculate the result.',-p.integers[2]+p.integers[3],calc(`(−${p.integers[2]}) − (−${p.integers[3]})`),`Negative ${p.integers[2]} minus negative ${p.integers[3]}.`),
  choice('Simplify the ratio of blue counters to orange counters.',ratio,[ratio,`${p.ratio[1]}:${p.ratio[0]}`,`${p.ratio[0]}:${p.ratio[0]+p.ratio[1]}`,`${p.ratio[0]+p.ratio[1]}:${p.ratio[1]}`],visual('ratio',{blue:p.ratio[0]*3,orange:p.ratio[1]*3}),`${p.ratio[0]*3} blue counters and ${p.ratio[1]*3} orange counters.`),
  numeric('How many dollars does Alex receive?',p.share*p.ratio[0]/(p.ratio[0]+p.ratio[1]),visual('share',{total:p.share,ratio}),`Share ${p.share} dollars between Alex and Sam. Alex to Sam is ${ratio}.`),
  numeric('What is the total cost in dollars, including delivery?',p.sale[0]*.85+p.sale[1],visual('delivery',{price:p.sale[0],delivery:p.sale[1],discount:15}),`One backpack costs ${p.sale[0]} dollars before a 15 percent discount. Add ${p.sale[1]} dollars delivery after the discount.`),
  numeric('What is the profit as a percentage of the total cost?',(p.fundraiser[1]*p.fundraiser[2]-p.fundraiser[0])/p.fundraiser[0]*100,visual('fundraiser',{cost:p.fundraiser[0],tickets:p.fundraiser[1],price:p.fundraiser[2]}),`Total event cost ${p.fundraiser[0]} dollars. ${p.fundraiser[1]} tickets sold at ${p.fundraiser[2]} dollars each. No other income or costs.`),
 ];
 return [...items,...extras].map((e,i)=>{
  const [code,skillLabel,difficulty]=NUMBER_LEVEL7_BLUEPRINT[i];
  const shift=(f+i)%4;
  const options=e.options?[...e.options.slice(shift),...e.options.slice(0,shift)]:undefined;
  const id=`y7-number-review-${form}-${String(i+1).padStart(2,'0')}-v1`;
  const presentedVisual:Visual & {topic:string}={...e.visual,topic:['Squares and roots','Squares and roots','Prime factors','Place value','Rational numbers','Fraction to percentage','Decimal accuracy','Paint project','Fraction addition','Fraction subtraction','Fraction multiplication','Fraction division','Decimal multiplication','Decimal division','Signed numbers','Signed numbers','Counter ratios','Sharing in a ratio','Backpack purchase','Fundraiser','Root bounds','Common factors','Powers of ten','Equivalent fractions','Fabric estimate','Decimal operations','Temperatures','Mixing a drink','Compare packs','Profit model'][i]};
  return {...e,visual:presentedVisual,options,id,inputMode:i===14?'text' as const:'decimal' as const,answer:e.correctAnswer,version:'1.0.0-review.2',form,sourcePool:'assessment_review',bankId:`number-level7-${form}-review-v1`,yearLevel:7,realmId:'number',strand:'Number',primaryDescriptorCode:code,curriculumCodes:[code],skillId:`number-y7-slot-${i+1}`,skillLabel,structureKey:`number-y7-slot-${i+1}`,contextKey:id,difficulty,statistics:createUncalibratedItemStatistics(difficulty),showFractionModels:false,responseMode:e.type==='mcq'?'selected_response':e.type==='number_order'?'manipulated_response':'constructed_response',scoring:{kind:'exact',correctResponse:e.correctAnswer},renderer:{type:e.type,payload:{prompt:e.prompt,visual:presentedVisual,options}}};
 });
}
export const NUMBER_LEVEL7_FIVE_FORMS=Object.fromEntries(NUMBER_LEVEL7_FORMS.map((form,f)=>[form,make(form,f)])) as Record<NumberLevel7Form,ReturnType<typeof make>>;
