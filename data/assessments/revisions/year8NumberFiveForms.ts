import { createUncalibratedItemStatistics } from '../assessmentItemStandard';
export const NUMBER_LEVEL8_FORMS=['pretest','posttest','start','mid','end'] as const;
export type NumberLevel8Form=typeof NUMBER_LEVEL8_FORMS[number];
export const NUMBER_LEVEL8_FORM_LABELS={pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
type Visual={type:'number_y8_panel';kind:string;[key:string]:unknown};
type Example={prompt:string;correctAnswer:string;type:'numeric'|'mcq';visual:Visual;options?:string[];readAloudText:string};
const v=(kind:string,data:Record<string,unknown>):Visual=>({type:'number_y8_panel',kind,...data});
const expression=(text:string)=>v('expression',{expression:text});
const num=(prompt:string,answer:number,visual:Visual,spoken:string):Example=>({prompt,correctAnswer:String(Number(answer.toFixed(8))),type:'numeric',visual,readAloudText:`${prompt} ${spoken}`});
const mc=(prompt:string,answer:string,options:string[],visual:Visual,spoken:string):Example=>({prompt,correctAnswer:answer,type:'mcq',options,visual,readAloudText:`${prompt} ${spoken}`});
const context=(art:string,cards:Array<[string,string]>,note?:string)=>v('context',{art,cards,note});
const gcd=(a:number,b:number):number=>b?gcd(b,a%b):Math.abs(a);
const fraction=(a:number,b:number)=>{const d=gcd(a,b);return `${a/d}/${b/d}`;};
const power=(base:number,exponent:number)=>`${base}${String(exponent).split('').map(x=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(x)]).join('')}`;
export const NUMBER_LEVEL8_BLUEPRINT=[
 ['AC9M8N01','Represent an irrational square side exactly','moderate'],
 ['AC9M8N01','Locate an irrational square root','moderate'],
 ['AC9M8N01','Recognise pi as an exact circle ratio','easy'],
 ['AC9M8N01','Distinguish irrational and rational numbers','moderate'],
 ['AC9M8N02','Multiply powers with the same base','moderate'],
 ['AC9M8N02','Divide powers with the same base','moderate'],
 ['AC9M8N02','Apply a power to a power','moderate'],
 ['AC9M8N02','Evaluate a nonzero base to power zero','easy'],
 ['AC9M8N02','Combine exponent laws','challenging'],
 ['AC9M8N02','Evaluate powers with different bases','moderate'],
 ['AC9M8N03','Recognise a terminating fraction','moderate'],
 ['AC9M8N03','Recognise a recurring fraction','moderate'],
 ['AC9M8N03','Interpret a recurring decimal pattern','easy'],
 ['AC9M8N03','Represent a fraction as a recurring decimal','moderate'],
 ['AC9M8N04','Multiply two negative integers','moderate'],
 ['AC9M8N04','Divide integers with unlike signs','moderate'],
 ['AC9M8N04','Apply order of operations with integers','moderate'],
 ['AC9M8N04','Add unlike signed fractions','moderate'],
 ['AC9M8N04','Subtract a negative fraction','moderate'],
 ['AC9M8N04','Multiply signed fractions','moderate'],
 ['AC9M8N04','Divide signed fractions','moderate'],
 ['AC9M8N04','Combine operations with signed decimals','challenging'],
 ['AC9M8N05','Model a percentage markup','moderate'],
 ['AC9M8N05','Include GST in a quoted price','moderate'],
 ['AC9M8N05','Apply successive percentage changes','challenging'],
 ['AC9M8N05','Compare discounted offers including delivery','challenging'],
 ['AC9M8N05','Calculate a percentage increase','moderate'],
 ['AC9M8N05','Review equal percentage losses and gains','challenging'],
 ['AC9M8N05','Apply a supplied tiered tax model','challenging'],
 ['AC9M8N05','Model water use and a percentage loss','challenging'],
] as const;
function make(form:NumberLevel8Form,f:number){
 const area=[18,32,50,72,98][f],rootFloor=[4,5,7,8,9][f];
 const base=2+f,a=3+f,b=2+f,den=[8,20,25,40,50][f];
 const repeated=['27','36','45','54','63'][f],digitPosition=15+2*f;
 const recurring=['1/6','5/6','7/12','11/12','1/12'][f];
 const recurringValue=['0.1666…','0.8333…','0.5833…','0.9166…','0.0833…'][f];
 const recurringWrong=[['0.16','0.166','0.1616…'],['0.83','0.833','0.8383…'],['0.58','0.583','0.5858…'],['0.91','0.916','0.9191…'],['0.08','0.083','0.0808…']][f];
 const n=f+1,price=160+40*f,delivery=8+f,changeBase=200+40*f,taxIncome=26000+2000*f,tank=800+100*f;
 const fractionItem=(prompt:string,left:string,op:string,right:string,numerator:number,denominator:number)=>{
  const answer=fraction(numerator,denominator);
  const options=[...new Set([answer,fraction(-numerator,denominator),fraction(numerator+2,denominator),fraction(numerator-2,denominator),fraction(numerator+4,denominator)])].slice(0,4);
  return mc(prompt,answer,options,expression(`${left} ${op} ${right}`),`${left} ${op==='+'?'plus':op==='−'?'minus':op==='×'?'times':'divided by'} ${right}.`);
 };
 const items:Example[]=[
  mc('What is the exact side length, in metres?',`√${area}`,[`√${area}`,String(area/2),String(rootFloor),String(rootFloor+1)],v('square',{area}),`A square has area ${area} square metres.`),
  num('Between which whole numbers does this root lie? Enter the smaller number.',rootFloor,expression(`√${area+1}`),`Square root of ${area+1}.`),
  mc('Divide the circumference by the diameter. Which value is exact?','π',['π','3.14','22/7','3.1416'],v('circle',{diameter:12+2*f}),`A circle has diameter ${12+2*f} centimetres. Use its exact circumference, not a rounded measurement.`),
  mc('Which number is irrational?',`√${[7,11,13,19,23][f]}`,[`√${[7,11,13,19,23][f]}`,`√${(f+4)**2}`,`${f+2}/9`,`${f+1}.25`],v('classification',{}),'Choose one number. A square root symbol means the exact value.'),
  num('Enter the missing exponent.',a+b,v('exponent',{left:`${power(base,a)} × ${power(base,b)}`,base}),`${base} to power ${a} times ${base} to power ${b}. Write as one power of ${base}.`),
  num('Enter the missing exponent.',a,v('exponent',{left:`${power(base,a+b)} ÷ ${power(base,b)}`,base}),`${base} to power ${a+b} divided by ${base} to power ${b}. Write as one power of ${base}.`),
  num('Enter the missing exponent.',a*b,v('exponent',{left:`(${power(base,a)})${power(1,b).slice(1)}`,base}),`${base} to power ${a}, all raised to power ${b}.`),
  num('Calculate the value.',1,expression(power(11+f*2,0)),`${11+f*2} to the power zero.`),
  num('Enter the missing exponent.',a*2+b-1,v('exponent',{left:`(${power(base,a)})² × ${power(base,b)} ÷ ${base}`,base}),`${base} to power ${a}, squared, times ${base} to power ${b}, divided by ${base}.`),
  num('Calculate the value.',2**(f+2)*3**2,expression(`${power(2,f+2)} × 3²`),`Two to power ${f+2}, times three squared.`),
  mc('Which fraction has a terminating decimal?',`1/${den}`,[`1/${den}`,`1/${3+6*f}`,`1/${[7,13,19,31,37][f]}`,`1/${11+6*f}`],v('classification',{}),'Terminating means the decimal ends.'),
  mc('Which fraction has a recurring decimal?',`1/${7+2*f}`,[`1/${7+2*f}`,`1/${2**(f+2)}`,`1/${5**(f+1)}`,`1/${20*(f+1===3?4:f+1)}`],v('classification',{}),'Recurring means a block of digits repeats forever.'),
  num(`What is the ${digitPosition}th digit after the decimal point?`,Number(repeated[0]),v('recurring',{digits:repeated}),`Zero point ${repeated.split('').join(' ')}, with the block ${repeated} repeating forever.`),
  mc('Choose the decimal that equals this fraction.',recurringValue,[recurringValue,...recurringWrong],expression(recurring),'The displayed repeating digit or block continues forever.'),
  num('Calculate the product.',(12+f)*(7+f),expression(`(−${12+f}) × (−${7+f})`),`Negative ${12+f} times negative ${7+f}.`),
  num('Calculate the quotient.',-(13+f),expression(`${(13+f)*(6+f)} ÷ (−${6+f})`),`${(13+f)*(6+f)} divided by negative ${6+f}.`),
  num('Calculate the result.',-(4+f)*(5+f)+3+f,expression(`(−${4+f}) × ${5+f} + ${3+f}`),`Negative ${4+f} times ${5+f}, plus ${3+f}.`),
  fractionItem('Add the fractions.',`-${n}/7`,'+','1/3',7-3*n,21),
  fractionItem('Subtract the fractions.',`-${n}/7`,'−','-2/3',14-3*n,21),
  fractionItem('Multiply the fractions.',`-${n}/7`,'×','2/3',-2*n,21),
  fractionItem('Divide the fractions.',`-${n}/7`,'÷','-2/3',3*n,14),
  num('Calculate the result.',-(2.4+f)*1.5+0.6,expression(`(−${(2.4+f).toFixed(1)}) × 1.5 + 0.6`),`Negative ${(2.4+f).toFixed(1)} times one point five, plus zero point six.`),
  num('What is the selling price in dollars?',price*1.25,context('backpack',[['Shop pays',`$${price}`],['Markup','25% of the shop’s cost']]),`The shop pays ${price} dollars for one backpack and adds 25 percent of this cost.`),
  num('What is the price including GST, in dollars?',price*1.1,context('wallet',[['Quoted price',`$${price} excluding GST`],['GST to add','10% of the quoted price']]),`Quoted price ${price} dollars excluding GST. Add ten percent GST.`),
  num('What is the final price in dollars?',price*.8*1.1,context('backpack',[['Original price',`$${price}`],['First change','20% discount'],['Then','Add 10% of the discounted price']]),`Start at ${price} dollars. Reduce by 20 percent, then increase the new price by 10 percent.`),
  mc('Which offer costs less, including delivery?','Offer B',['Offer A','Offer B','Same total cost'],context('backpack',[['Offer A',`$${price}, then 20% off. Delivery $${delivery}.`],['Offer B',`$${price*.8+delivery-3}. Delivery included.`]]),`Offer A: ${price} dollars with 20 percent off, then ${delivery} dollars delivery. Offer B: ${price*.8+delivery-3} dollars including delivery.`),
  num('What is the percentage increase?',25,context('pack',[['Last month',`${changeBase} kg recycled`],['This month',`${changeBase*1.25} kg recycled`]]),`Recycling rose from ${changeBase} to ${changeBase*1.25} kilograms. Enter the percentage increase.`),
  num('After both changes, how many dollars less than the start remain?',price*.04,context('wallet',[['Starting balance',`$${price}`],['First','Balance falls by 20%'],['Then','New balance rises by 20%']]),`A ${price} dollar balance falls by 20 percent, then the new balance rises by 20 percent. Find the loss compared with the start.`),
  num('Using this example tax table, how much tax is paid in dollars?',(taxIncome-20000)*.2,v('tax',{income:taxIncome}),`Example tax table only. First 20,000 dollars: no tax. Income above 20,000 dollars: 20 cents for each extra dollar. Income is ${taxIncome} dollars. No other charges.`),
  num('How many litres remain after both steps?',(tank-120)*.9,context('drink',[['Water at start',`${tank} L`],['First','Use 120 L'],['Then','Lose 10% of the remaining water']]),`Start with ${tank} litres. Use 120 litres, then lose ten percent of what remains.`),
 ];
 return items.map((e,i)=>{
  const [code,skillLabel,difficulty]=NUMBER_LEVEL8_BLUEPRINT[i];
  const shift=(f+i)%(e.options?.length??1),options=e.options?[...e.options.slice(shift),...e.options.slice(0,shift)]:undefined;
  const id=`y8-number-review-${form}-${String(i+1).padStart(2,'0')}-v1`;
  return {...e,visual:{...e.visual,topic:skillLabel},options,id,inputMode:i>=14&&i<=21?'text' as const:'decimal' as const,answer:e.correctAnswer,version:'1.0.0-review.1',form,sourcePool:'assessment_review',bankId:`number-level8-${form}-review-v1`,yearLevel:8,realmId:'number',strand:'Number',primaryDescriptorCode:code,curriculumCodes:[code],skillId:`number-y8-slot-${i+1}`,skillLabel,structureKey:`number-y8-slot-${i+1}`,contextKey:id,difficulty,statistics:createUncalibratedItemStatistics(difficulty),showFractionModels:false,responseMode:e.type==='mcq'?'selected_response':'constructed_response',scoring:{kind:'exact',correctResponse:e.correctAnswer},renderer:{type:e.type,payload:{...e.visual}}};
 });
}
export const NUMBER_LEVEL8_FIVE_FORMS=Object.fromEntries(NUMBER_LEVEL8_FORMS.map((form,f)=>[form,make(form,f)])) as Record<NumberLevel8Form,ReturnType<typeof make>>;
