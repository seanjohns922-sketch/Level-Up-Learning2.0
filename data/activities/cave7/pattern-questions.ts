import {cave7Guide} from './curriculum';
import {makeQuestion,numericWrong,random,round,type Cave7Role,type Cave7Visual} from './shared';

// Level 7 Algebra. Fluency, reasoning and application are separate tasks. Students type
// most answers (numbers, expressions, formulas, points); multiple choice is kept only where
// the answer is an interpretation or a choice of method.
type GraphContext={title:string;x:string;y:string;unit:string;noun:string;time:string;step:number;start:[number,number];max:number};
const GRAPHS:GraphContext[]=[
 {title:'Walk from home',x:'Time (minutes)',y:'Distance from home (km)',unit:'km',noun:'distance from home',time:'minutes',step:1,start:[0,2],max:10},
 {title:'Water in a tank',x:'Time (minutes)',y:'Water in tank (L)',unit:'L',noun:'amount of water in the tank',time:'minutes',step:10,start:[1,4],max:9},
 {title:'Temperature during a day',x:'Hours after 6 am',y:'Temperature (°C)',unit:'°C',noun:'temperature',time:'hours',step:2,start:[3,6],max:12},
 {title:'Phone battery',x:'Time (hours)',y:'Battery charge (%)',unit:'%',noun:'battery charge',time:'hours',step:10,start:[6,9],max:10},
];
const MOVES=['increases','stays the same','decreases'] as const;
const SHAPES:[string,number,number][]=[['squares',4,3],['triangles',3,2],['hexagons',6,5],['pentagons',5,4]];
const signed=(n:number)=>n<0?`−${-n}`:String(n);

export function pattern7Question(week:number,lesson:number,seed:number,role:Cave7Role='fast_thinking'){
 const g=cave7Guide('pattern',week,lesson);if(!g)throw Error('Unknown Algebra lesson');
 const int=random(seed),pick=<T,>(xs:readonly T[])=>xs[int(0,xs.length-1)];
 const a=int(2,7),rawB=int(2,9),b=rawB===a?rawB+1:rawB,x=int(2,10),c=int(2,5),key=(week-1)*3+lesson,F=role==='fast_thinking',R=role==='reasoning';
 let prompt='',answer:string|number='',wrong:(string|number)[]=[],explanation='',visual:Cave7Visual|undefined;
 const choose=(p:string,n:string|number,ws:(string|number)[],e:string)=>{prompt=p;answer=n;wrong=ws;explanation=e;};
 // Wrong values come from real errors first; numericWrong only fills any gap.
 const num=(p:string,n:number,e:string,errors:number[]=[])=>choose(p,round(n),[...errors.map(round),...numericWrong(n)],e);
 const formula=(f:string,m:string)=>{visual={kind:'formula',title:'Given formula',formula:f,meaning:m};};
 const balance=(left:string,right:string)=>{visual={kind:'balance',title:'Balance model',left,right};};
 const table=(title:string,headers:string[],rows:(string|number)[][])=>{visual={kind:'table',title,headers,rows:rows.map(r=>r.map(String))};};
 // A graph over time with readable whole-number gridlines and unlabelled points.
 const graph=(needRise=false)=>{
  const ctx=pick(GRAPHS);let k:number[]=[],moves:number[]=[];
  // Random rises, flats and falls; regenerate until a rise exists when the task needs one.
  for(let attempt=0;attempt<30;attempt++){
   k=[int(ctx.start[0],ctx.start[1])];moves=[];const floor=ctx.start[0]===0?0:1;
   for(let i=0;i<4;i++){const move=int(0,2),size=int(1,2),next=move===0?Math.min(ctx.max,k[i]+size):move===1?k[i]:Math.max(floor,k[i]-size);moves.push(next>k[i]?0:next===k[i]?1:2);k.push(next);}
   if(!needRise||moves.includes(0))break;
  }
  if(needRise&&!moves.includes(0)){k=[2,4,4,3,5];moves=[0,1,2,0];}
  const points:[number,number][]=k.map((v,i)=>[i*2,v*ctx.step]);
  visual={kind:'plot',title:ctx.title,xLabel:ctx.x,yLabel:ctx.y,points,connect:true,yStep:ctx.step};
  return {ctx,points,moves};
 };
 switch(key){
 // ── Week 1: variables and formulas (AC9M7A01)
 case 1:{
  const ctx=pick([['C','n','ticket','number of tickets','Each ticket costs ${A}; booking costs ${B}.'],['P','h','hour','number of hours worked','Pay is ${A} per hour plus a ${B} bonus.'],['S','g','goal','number of goals','Each goal scores {A} points; the team also has {B} other points.'],['C','k','kilometre','number of kilometres travelled','A taxi charges ${A} per kilometre plus a ${B} flag fall.'],['C','d','gigabyte','number of gigabytes of data','Data costs ${A} per gigabyte plus a ${B} monthly fee.']] as const);
  const [T,v,item,meaning,story]=ctx;formula(`${T} = ${a}${v} + ${b}`,story.replace('{A}',String(a)).replace('{B}',String(b)));
  if(F){const fixed=seed%2===0;num(fixed?'What is the fixed amount in this formula?':`By how much does ${T} increase when ${v} increases by 1?`,fixed?b:a,fixed?`In ${T} = ${a}${v} + ${b}, the ${b} is not multiplied by ${v}. It is added once, whatever the value of ${v}.`:`In ${T} = ${a}${v} + ${b}, ${v} is multiplied by ${a}. Each extra ${item} adds another ${a} to ${T}; the ${b} stays the same.`,fixed?[a,a+b]:[b,a+b]);}
  else if(R)choose(`In this situation, what does ${v} represent?`,`the ${meaning}`,['the total amount','the fixed amount',`the amount for each ${item}`],`The variable ${v} counts the ${meaning}; ${a} and ${b} stay fixed.`);
  else{visual=undefined;choose(`Rides cost $${a} each and entry costs $${b}. Write a formula for the total cost C of n rides.`,`C = ${a}n + ${b}`,[`C = ${b}n + ${a}`,`C = ${a+b}n`,`C = ${a}(n + ${b})`],`Multiply the number of rides by $${a}, then add the $${b} entry once.`);}
  break;}
 case 2:{
  if(F){formula(`T = ${a}n + ${b}`,'n is the number of items; T is the total.');num(`Find T when n = ${x}.`,a*x+b,`Substitute n = ${x}: ${a} × ${x} + ${b} = ${a*x+b}.`,[a+x+b,a*(x+b),Number(`${a}${x}`)+b]);}
  else if(R){const d=int(2,9);formula(`T = ${a}n + ${b}`,'n is the number of items; T is the total.');num(`A student substituted n = ${d} and wrote T = ${a}${d} + ${b} = ${Number(`${a}${d}`)+b}. What is the correct value of T?`,a*d+b,`${a}n means ${a} × n, so T = ${a} × ${d} + ${b} = ${a*d+b}. Writing the digits side by side is not multiplication.`,[Number(`${a}${d}`)+b,a+d+b]);}
  else{const rate=pick([1.5,2.5,3.2]),flag=b;formula(`F = ${rate}d + ${flag}`,'F is the taxi fare in dollars; d is the distance in km.');num(`Find the fare in dollars for a ${x} km trip.`,rate*x+flag,`F = ${rate} × ${x} + ${flag} = ${round(rate*x+flag)}.`,[rate+x+flag,rate*(x+flag),rate*x]);}
  break;}
 case 3:{
  if(F){formula('P = rh + b','r is dollars per hour, h is hours worked, b is a one-off bonus.');num(`r = ${a+10}, h = ${x}, b = ${b}. Find the total pay P in dollars.`,(a+10)*x+b,`Multiply the hourly rate by ${x} hours, then add the bonus once: ${(a+10)*x+b}.`,[(a+10)*(x+b),b*x+a+10,(a+10)+x+b]);}
  else if(R){formula('P = rh + b','r is dollars per hour, h is hours worked, b is a one-off bonus.');num(`r = ${a+10}, h = ${x}, b = ${b}. A student calculated ${b} × ${x} + ${a+10}. What is the correct pay P in dollars?`,(a+10)*x+b,`The student swapped the rate and the bonus. P = ${a+10} × ${x} + ${b} = ${(a+10)*x+b}.`,[b*x+a+10]);}
  else if(seed%2===0){const density=pick([2,3,5,8]),volume=x;formula('d = m ÷ v','d is density in g/cm³, m is mass in g, v is volume in cm³.');num(`A block has mass ${density*volume} g and volume ${volume} cm³. Find its density in g/cm³.`,density,`d = ${density*volume} ÷ ${volume} = ${density}.`,[density*volume*volume,density*volume-volume]);}
  else{const base=a*100,hours=c,rate=b*5;formula('W = b + 1.5 × h × r','W is weekly wage, b is base wage, h is overtime hours, r is the normal hourly rate (all in dollars).');num(`b = ${base}, h = ${hours}, r = ${rate}. Find the weekly wage W in dollars.`,base+1.5*hours*rate,`Overtime pays 1.5 times the rate: 1.5 × ${hours} × ${rate} = ${1.5*hours*rate}. Add the base wage: ${base+1.5*hours*rate}.`,[base+hours*rate,(base+1.5*hours)*rate,1.5*(base+hours*rate)]);}
  break;}
 // ── Weeks 2–3: writing expressions (AC9M7A02)
 case 4:{
  if(F&&seed%2===0){const k=int(3,6);choose(`7 + 7 + 7 = 3 × 7. Write ${Array(k).fill('n').join(' + ')} as a product.`,`${k}n`,[`n${k}`,`${k}+n`,`${k+1}n`],`There are ${k} equal terms of n, so the sum is ${k} × n = ${k}n.`);}
  else if(F)choose(`Start with n, multiply by ${a}, then add ${b}. Write an expression for the result.`,`${a}n + ${b}`,[`${a}(n + ${b})`,`${b}n + ${a}`,`n + ${a*b}`],`Follow the order in the words. Multiply n by ${a} first: ${a}n. Then add ${b}: ${a}n + ${b}.`);
  else if(R)choose(`Write an expression for: ${b} less than ${a} times a number n.`,`${a}n − ${b}`,[`${b} − ${a}n`,`${a}(n − ${b})`,`${b}n − ${a}`],`"${b} less than" something means start with that thing and take ${b} away: ${a}n − ${b}.`);
  else choose(`Think of a number n. Double it, add ${b}, then multiply the result by ${a}. Write an expression for the final answer.`,`${a}(2n + ${b})`,[`${a} × 2n + ${b}`,`2n + ${a*b}`,`${2*a}n + ${b}`],`Doubling gives 2n; adding gives 2n + ${b}; the whole result is multiplied, so use brackets: ${a}(2n + ${b}).`);
  break;}
 case 5:{
  if(F)choose(`A trip costs $${b} to book plus $${a} per kilometre. Write an expression for the cost of n kilometres.`,`${a}n + ${b}`,[`${a}(n + ${b})`,`${b}n + ${a}`,`${a+b}n`],'Multiply the distance by the price per kilometre, then add the booking fee once.');
  else if(R)num(`A trip costs $${b} to book plus $${a} per kilometre. A student wrote ${a}(n + ${b}) for the cost. For n = ${x}, how many dollars too much does that expression give?`,a*b-b,`The bracket multiplies the $${b} booking fee by ${a}: ${a*(x+b)} instead of ${a*x+b}, which is $${a*b-b} too much.`,[a*b,b,a]);
  else choose(`A gym charges a $${b*10} joining fee plus $${a} per week. Write a formula for the total cost C after w weeks.`,`C = ${a}w + ${b*10}`,[`C = ${b*10}w + ${a}`,`C = ${a+b*10}w`,`C = ${a}(w + ${b*10})`],`Multiply the weeks by $${a}, then add the joining fee once.`);
  break;}
 case 6:{
  if(F)choose(`A rectangle has length n cm and width ${b} cm. Write an expression for its perimeter in cm.`,`2n + ${2*b}`,[`n + ${b}`,`${b}n`,`2n + ${b}`],`Add two lengths and two widths: n + n + ${b} + ${b} = 2n + ${2*b}.`);
  else if(R)num(`A rectangle has length n cm and width ${b} cm. A student says its perimeter is n + ${b}. When n = ${x}, how many cm short is that?`,x+b,`The perimeter is 2 × ${x} + 2 × ${b} = ${2*x+2*b}; the student's ${x+b} misses one length and one width: ${x+b} cm.`,[x,b,2*x+2*b]);
  else if(seed%2===0)choose(`An isosceles triangle has two equal sides of n cm and a base of ${b} cm. Write an expression for its perimeter in cm.`,`2n + ${b}`,[`n + ${b}`,`2n + ${2*b}`,`3n`],`Two equal sides give 2n; add the base once.`);
  else choose(`A square has sides of (n + ${b}) cm. Write an expression for its perimeter in cm.`,`4n + ${4*b}`,[`4n + ${b}`,`n + ${4*b}`,`4n`],`Four sides of n + ${b}: 4(n + ${b}) = 4n + ${4*b}.`);
  break;}
 case 7:{
  if(F)choose(`Add ${b} to n, then multiply the whole result by ${a}. Write an expression.`,`${a}(n + ${b})`,[`${a}n + ${b}`,`n + ${a*b}`,`${b}(n + ${a})`],`The addition happens first, so n + ${b} goes in brackets. Then the whole bracket is multiplied by ${a}: ${a}(n + ${b}).`);
  else if(R)num(`Evaluate ${a}(n + ${b}) and ${a}n + ${b} when n = ${x}. How much larger is ${a}(n + ${b})?`,(a-1)*b,`${a}(${x} + ${b}) = ${a*(x+b)} and ${a} × ${x} + ${b} = ${a*x+b}. The bracket multiplies the ${b} as well: difference ${(a-1)*b}.`,[a*b,b,a*(x+b)]);
  else choose(`Each of ${a} teams has n players and ${b} coaches. Write an expression for the total number of people.`,`${a}(n + ${b})`,[`${a}n + ${b}`,`n + ${a*b}`,`${a+b}n`],`Each team has n + ${b} people, and there are ${a} teams: ${a}(n + ${b}).`);
  break;}
 case 8:{
  if(F){formula(`A = ${a}(n + ${b}); B = ${a}n + ${b}`,'Compare both expressions at the same n.');num(`When n = ${x}, how much larger is A than B?`,(a-1)*b,`A = ${a*(x+b)} and B = ${a*x+b}; A multiplies the ${b} by ${a}. Difference ${(a-1)*b}.`,[a*b,b,0]);}
  else if(R){const equal=seed%2===0,other=equal?`${a}n + ${a*b}`:`${a}n + ${b}`;choose(`Are ${a}(n + ${b}) and ${other} always equal?`,equal?`Yes, because the ${a} multiplies both n and ${b}.`:`No, because in ${other} the ${b} is not multiplied by ${a}.`,equal?[`No, because brackets always change the value.`,`No, because only n is multiplied by ${a}.`,'Yes, but only when n = 0.']:[`Yes, because they use the same numbers.`,'Yes, because brackets can be ignored.',`No, because brackets always double the value.`],`Expand ${a}(n + ${b}) = ${a}n + ${a*b}, then compare with ${other}.`);}
  else num(`${a}(n + ${b}) = ${a}n + □. What number goes in the box?`,a*b,`The ${a} multiplies both terms in the bracket: ${a} × ${b} = ${a*b}.`,[b,a+b,a]);
  break;}
 case 9:{
  if(F)choose(`Each item costs p dollars before a $${b} discount on EVERY item. Write an expression for the total cost of n items.`,`n(p − ${b})`,[`np − ${b}`,`p(n − ${b})`,`n(p + ${b})`],'Subtract the discount from one item first, then multiply by the number of items.');
  else if(R)num(`${x} items cost $20 each. How many dollars more do you save with $${b} off EVERY item than with $${b} off the total?`,(x-1)*b,`$${b} off every item saves ${x} × ${b} = $${x*b}; $${b} off the total saves $${b}. Difference $${(x-1)*b}.`,[x*b,b,x]);
  else choose(`Each item costs p dollars and gets a $${b} discount. You buy two more than n items. Write an expression for the total cost.`,`(n + 2)(p − ${b})`,[`n + 2(p − ${b})`,`(n + 2)p − ${b}`,`n(p − ${b}) + 2`],`There are n + 2 items, each costing p − ${b}: (n + 2)(p − ${b}).`);
  break;}
 // ── Weeks 4–6: solving equations (AC9M7A03)
 case 10:{
  if(F){balance(`x + ${b}`,String(x+b));num('The scale is balanced. Find x.',x,`The pans balance, so x + ${b} = ${x+b}. Remove ${b} from both pans to keep them balanced: x = ${x+b} − ${b} = ${x}.`,[x+2*b,x+b,b]);}
  else if(R)num(`A student solved x + ${b} = ${x+b} by adding ${b} to both sides and wrote x = ${x+2*b}. What is the correct value of x?`,x,`Adding ${b} gives x + ${2*b} = ${x+2*b}, not x. Subtract ${b} instead: x = ${x}.`,[x+2*b,x+b]);
  else num(`A box of pencils plus ${b} loose pencils makes ${x+b} pencils altogether. How many pencils are in the box?`,x,`Write x + ${b} = ${x+b}, then subtract ${b}: x = ${x}.`,[x+2*b,x+b]);
  break;}
 case 11:{
  if(F){balance(`${a}x`,String(a*x));num('The scale is balanced. Find x.',x,`The pans balance, so ${a}x = ${a*x}. Share both pans into ${a} equal groups to keep them balanced: x = ${a*x} ÷ ${a} = ${x}.`,[a*x*a,a*x-a,a*x]);}
  else if(R)num(`A student solved ${a}x = ${a*x} by multiplying both sides by ${a} and wrote x = ${a*a*x}. What is the correct value of x?`,x,`${a}x means ${a} × x, so undo it by dividing: x = ${x}.`,[a*a*x,a*x-a]);
  else num(`A ribbon is cut into ${a} equal pieces, each ${x} cm long. How long was the ribbon in cm?`,a*x,`If L is the length, L ÷ ${a} = ${x}, so L = ${a} × ${x} = ${a*x}.`,[x,a+x,x-a>0?x-a:x+a+1]);
  break;}
 case 12:{
  const k=x+(seed%3===0?0:pick([-1,1,2]));
  if(F){formula(`${a}x + ${b} = ${a*x+b}`,`Test the value x = ${k}.`);num(`Substitute x = ${k} into the left side, ${a}x + ${b}. What does it equal?`,a*k+b,`Replace x with ${k}: ${a} × ${k} + ${b}. Multiply first: ${a*k}. Then add ${b}: ${a*k+b}.`,[a*(k+b),a+k+b,Number(`${a}${k}`)+b]);}
  else if(R){const yes=k===x;choose(`Is x = ${k} a solution of ${a}x + ${b} = ${a*x+b}?`,yes?`Yes, because ${a} × ${k} + ${b} = ${a*x+b}.`:`No, because ${a} × ${k} + ${b} = ${a*k+b}, not ${a*x+b}.`,yes?[`No, because ${a} × ${k} + ${b} = ${a*k+b+1}.`,`No, because x must be smaller than ${b}.`,'Yes, because any whole number works.']:[`Yes, because ${a} × ${k} + ${b} = ${a*x+b}.`,'Yes, because it is close to the answer.','No, because equations have no solutions.'],'Substitute the value and compare both sides.');}
  else num(`Test whole numbers to find the value of x that makes ${a}x + ${b} = ${a*x+b} true.`,x,`Try values: ${a} × ${x} + ${b} = ${a*x+b}, so x = ${x}.`,[(a*x+b)/a,a*x+b-b*a,x+b]);
  break;}
 case 13:{
  const total=a*x+b;
  if(F){balance(`${a}x + ${b}`,String(total));num('The scale is balanced. Find x.',x,`Remove ${b} from both pans to get ${a}x = ${a*x}, then divide by ${a}: x = ${x}.`,[total/a-b,(total+b)/a,a*x]);}
  else if(R)num(`To solve ${a}x + ${b} = ${total}, a student calculated ${total} ÷ ${a} − ${b}. What is the correct value of x?`,x,`Undo the last operation first: subtract ${b}, then divide by ${a}. x = (${total} − ${b}) ÷ ${a} = ${x}.`,[total/a-b,(total+b)/a]);
  else num(`${a} equally priced tickets and a $${b} booking fee cost $${total}. What is one ticket's price in dollars?`,x,`If p is the price, ${a}p + ${b} = ${total}. Subtract ${b}, then divide by ${a}: p = ${x}.`,[total/a-b,(total+b)/a,total-b]);
  break;}
 case 14:{
  const total=a*(x+b);
  if(F){formula(`${a}(x + ${b}) = ${total}`,'The multiplier acts on the whole bracket.');num('Find x.',x,`Divide both sides by ${a} to get x + ${b} = ${x+b}, then subtract ${b}: x = ${x}.`,[(total-b)/a,total/a+b,total-b]);}
  else if(R)num(`To solve ${a}(x + ${b}) = ${total}, a student rewrote it as ${a}x + ${b} = ${total}. What is the correct value of x?`,x,`The ${a} multiplies the ${b} too. Divide by ${a} first: x + ${b} = ${x+b}, so x = ${x}.`,[(total-b)/a,total/a+b]);
  else num(`${a} friends each buy a meal costing $x and a $${b} drink. Together they spend $${total}. How much does one meal cost in dollars?`,x,`${a}(x + ${b}) = ${total}. Divide by ${a}: x + ${b} = ${x+b}, so x = ${x}.`,[(total-b)/a,total/a+b,total/a]);
  break;}
 case 15:{
  if(F){formula(`x ÷ ${a} + ${b} = ${x+b}`,'The addition happens after the division.');num('Find x.',a*x,`Subtract ${b}: x ÷ ${a} = ${x}. Multiply by ${a}: x = ${a*x}.`,[a*(x+b),x,(x+b)/a]);}
  else if(R)num(`To solve x ÷ ${a} + ${b} = ${x+b}, a student multiplied by ${a} first and wrote x = ${(x+b)*a} − ${b}. What is the correct value of x?`,a*x,`Undo the addition first: x ÷ ${a} = ${x}, then multiply: x = ${a*x}.`,[(x+b)*a-b,a*(x+b)]);
  else num(`A pizza is shared equally by ${a} people. Each person also pays $${b} for a drink and pays $${x+b} in total. How much did the pizza cost in dollars?`,a*x,`Each share of the pizza is $${x+b} − $${b} = $${x}; ${a} shares cost $${a*x}.`,[a*(x+b),x,(x+b)*a-b]);
  break;}
 case 16:{
  const width=F||R?b:Math.min(b,2*x-1),P=2*x+2*width;
  if(F)num(`A rectangle has length x cm, width ${width} cm and perimeter ${P} cm. Find the length x in cm.`,x,`2x + ${2*width} = ${P}. Subtract ${2*width}, then divide by 2: x = ${x}.`,[(P-width)/2,P/2,P-2*width]);
  else if(R)choose(`A rectangle has length x cm, width ${width} cm and perimeter ${P} cm. Which equation matches?`,`2x + ${2*width} = ${P}`,[`x + ${width} = ${P}`,`2x + ${width} = ${P}`,`x + ${2*width} = ${P}`],`Two lengths and two widths: 2x + 2 × ${width} = ${P}.`);
  else num(`An isosceles triangle has two equal sides of x cm and a base of ${width} cm. Its perimeter is ${2*x+width} cm. Find x in cm.`,x,`2x + ${width} = ${2*x+width}. Subtract ${width}, then divide by 2: x = ${x}.`,[(2*x+width)/2,x+width,(x*2+width)-width]);
  visual={kind:'perimeter',title:'Perimeter model',shape:F||R?'rectangle':'triangle',sideLabels:F||R?['x cm',`${width} cm`,'x cm',`${width} cm`]:['x cm','x cm',`${width} cm`],perimeter:F||R?P:2*x+width,unit:'cm'};
  break;}
 case 17:{
  const total=x*a+b;
  if(F)num(`${x} equally priced tickets and a $${b} booking fee cost $${total}. What is one ticket's price in dollars?`,a,`If p is the price, ${x}p + ${b} = ${total}. Subtract ${b}, then divide by ${x}: p = ${a}.`,[total/x-b,(total+b)/x,total-b]);
  else if(R)choose(`${x} equally priced tickets (p dollars each) and a $${b} booking fee cost $${total}. Which equation matches the story?`,`${x}p + ${b} = ${total}`,[`${x}(p + ${b}) = ${total}`,`p + ${x*b} = ${total}`,`${b}p + ${x} = ${total}`,`${x}p − ${b} = ${total}`],'The ticket price is multiplied by the number of tickets; the booking fee is added once.');
  else num(`Sam has $${b} and saves $${a} each week. After how many weeks will Sam have $${b+a*x}?`,x,`${b} + ${a}w = ${b+a*x}. Subtract ${b}, then divide by ${a}: w = ${x}.`,[(b+a*x)/a,x+1,b+x]);
  break;}
 case 18:{
  const total=a*x+b,d=int(1,3);formula(`${a}x + ${b} = ${total}`,`A learner wrote x = ${total} ÷ ${a} − ${b}.`);
  if(F)num('What is the correct value of x?',x,`Undo the addition first: ${total} − ${b} = ${a*x}; then divide by ${a}: x = ${x}.`,[total/a-b,(total+b)/a]);
  else if(R)choose('Which correction gives the right method?',`Subtract ${b} from ${total} first, then divide by ${a}.`,[`Divide ${total} by ${b}, then subtract ${a}.`,`Add ${b} to ${total}, then divide by ${a}.`,`Multiply ${total} by ${a}, then subtract ${b}.`],'Undo addition before multiplication: the learner divided before removing the added constant.');
  else{visual=undefined;num(`A learner claims x = ${x+d} solves ${a}x + ${b} = ${total}. Substitute it: how much too large is the left side?`,a*d,`${a} × ${x+d} + ${b} = ${a*(x+d)+b}, which is ${a*d} more than ${total}. The correct solution is x = ${x}.`,[d,a*(x+d)+b,a+d]);}
  break;}
 // ── Week 7: graphs from authentic data (AC9M7A04)
 case 19:{
  const {ctx,points}=graph();
  if(F){const p=pick(points);num(`What was the ${ctx.noun} at ${ctx.x.toLowerCase().includes('hours after')?`${p[0]} hours after 6 am`:`${p[0]} ${ctx.time}`}? Answer in ${ctx.unit}.`,p[1],'Find the time on the horizontal axis, go up to the line, then read across to the vertical axis.',[p[1]+ctx.step,p[0],p[1]-ctx.step>0?p[1]-ctx.step:p[1]+2*ctx.step]);}
  else if(R){const target=pick(points),first=points.find(p=>p[1]===target[1])!;num(`At what time (in ${ctx.time}) was the ${ctx.noun} first exactly ${target[1]} ${ctx.unit}?`,first[0],'Find the value on the vertical axis, read across to the line, then down to the earliest time.',[first[0]+2,target[1],first[0]+1]);}
  else{const i=int(0,2),j=int(i+1,4),change=points[j][1]-points[i][1];num(`By how much did the ${ctx.noun} change from ${points[i][0]} to ${points[j][0]} ${ctx.time}? Give a decrease as a negative number, in ${ctx.unit}.`,change,`Subtract the earlier value from the later value: ${points[j][1]} − ${points[i][1]} = ${signed(change)}.`,[-change,points[j][1],points[i][1]+points[j][1]]);}
  break;}
 case 20:{
  const {ctx,points,moves}=graph();
  if(F){const i=int(0,3);choose(`What happens to the ${ctx.noun} between ${points[i][0]} and ${points[i+1][0]} ${ctx.time}?`,`It ${MOVES[moves[i]]}.`,[...MOVES.filter((_,j)=>j!==moves[i]).map(m=>`It ${m}.`),'It cannot be told from the graph.'],`Find the line between ${points[i][0]} and ${points[i+1][0]} ${ctx.time}. A rising line means increasing, a flat line means staying the same, and a falling line means decreasing. Here it ${MOVES[moves[i]]}.`);}
  else if(R){const story=(ms:number[])=>ms.map((m,i)=>(i?'then ':'')+MOVES[m]).join(', ').replace(/^./,s=>s.toUpperCase())+'.';const right=story(moves),others=new Set<string>();while(others.size<3){const s=story(Array.from({length:4},()=>int(0,2)));if(s!==right)others.add(s);}choose(`Which description matches the ${ctx.noun} over the four time intervals?`,right,[...others],'Read each segment in order: rising, horizontal or falling.');}
  else{const flat=moves.filter(m=>m===1).length*2;num(`For how many ${ctx.time} altogether did the ${ctx.noun} stay the same?`,flat,'Add the lengths of the horizontal segments.',[flat+2,moves.filter(m=>m===1).length,8-flat]);}
  break;}
 case 21:{
  const {ctx,points}=graph(true);
  if(F){const rise=Math.max(...points.slice(1).map((p,i)=>p[1]-points[i][1]));num(`What was the greatest increase in the ${ctx.noun} during one 2-${ctx.time.replace(/s$/,'')} interval? Answer in ${ctx.unit}.`,rise,`Every interval is 2 ${ctx.time} long, so compare how much the line rises in each one. The biggest rise is ${rise} ${ctx.unit}.`,[rise+ctx.step,rise/2,Math.max(...points.map(p=>p[1]))]);}
  else if(R){const i=int(0,3),mid=points[i][0]+1;choose(`Measurements were recorded every 2 ${ctx.time}. What can the line tell you about the ${ctx.noun} at ${mid} ${ctx.time}?`,'Only an estimate, because nothing was recorded at that time.',['The exact value, because the line passes through that time.','Nothing at all, because only points can be read.','The exact value, because graphs are always accurate.'],'Joining lines connect recorded points; values between them are estimates.');}
  else{const i=int(0,2),j=i+2,rate=(points[j][1]-points[i][1])/(points[j][0]-points[i][0]);num(`What was the average rate of change of the ${ctx.noun} from ${points[i][0]} to ${points[j][0]} ${ctx.time}, in ${ctx.unit} per ${ctx.time.replace(/s$/,'')}? Give a decrease as a negative number.`,rate,`Change ÷ time = (${points[j][1]} − ${points[i][1]}) ÷ ${points[j][0]-points[i][0]} = ${signed(round(rate))}.`,[points[j][1]-points[i][1],-rate,rate*2]);}
  break;}
 // ── Week 8: visual growing patterns (AC9M7A05)
 case 22:{
  const group=int(2,5),fixed=int(1,6),stage=int(4,10);
  if(F){visual={kind:'pattern',title:'Growing tile pattern',group,fixed,stages:3,unit:'tiles'};num(`The pattern keeps growing in the same way. How many tiles are in stage ${stage}?`,group*stage+fixed,`Each stage adds ${group} tiles to the ${fixed} fixed tiles: ${group} × ${stage} + ${fixed} = ${group*stage+fixed}.`,[group*stage,(group+fixed)*stage,group*stage+fixed+group]);}
  else if(R){visual={kind:'pattern',title:'Growing tile pattern',group,fixed,stages:3,unit:'tiles'};num(`Stage 1 has ${group+fixed} tiles. A student says stage ${stage} must have ${stage} × ${group+fixed} = ${(group+fixed)*stage} tiles. How many tiles does stage ${stage} really have?`,group*stage+fixed,`Only the ${group} added tiles repeat each stage; the ${fixed} fixed tiles appear once: ${group*stage+fixed}.`,[(group+fixed)*stage,group*stage]);}
  else{const [shape,first,add]=pick(SHAPES);num(`A row of ${shape} is made from matchsticks. 1 shape needs ${first} matchsticks and each extra shape adds ${add}. How many matchsticks are needed for ${stage} ${shape}?`,first+add*(stage-1),`The first shape uses ${first}; ${stage-1} more add ${add} each: ${first} + ${add} × ${stage-1} = ${first+add*(stage-1)}.`,[first*stage,add*stage,first+add*stage]);}
  break;}
 case 23:{
  const group=int(2,5),fixed=int(1,6);
  if(F){visual={kind:'pattern',title:'Growing tile pattern',group,fixed,stages:3,unit:'tiles'};choose('Write a rule for the number of tiles T at stage n.',`T = ${group}n + ${fixed}`,[`T = ${fixed}n + ${group}`,`T = ${group+fixed}n`,`T = n + ${group+fixed}`,`T = ${group+1}n + ${fixed}`],`Each stage adds ${group} tiles and ${fixed} tiles stay fixed: T = ${group}n + ${fixed}.`);}
  else if(R){visual={kind:'pattern',title:'Growing tile pattern',group,fixed,stages:3,unit:'tiles'};choose(`The rule for this pattern is T = ${group}n + ${fixed}. What does the ${fixed} represent in the picture?`,'The tiles in the separate column, which stay the same each stage.',['The tiles added at each new stage.','The stage number.','The total number of tiles at stage 1.'],`The ${fixed} is added once at every stage, so it is the fixed part.`);}
  else{const [shape,first,add]=pick(SHAPES);choose(`1 shape in a row of ${shape} needs ${first} matchsticks and each extra shape adds ${add}. Write a rule for the number of matchsticks T for n ${shape}.`,`T = ${add}n + ${first-add}`,[`T = ${first}n`,`T = ${first}n + ${add}`,`T = ${add}n + ${first}`],`Each shape adds ${add}; check n = 1: ${add} + ${first-add} = ${first}. So T = ${add}n + ${first-add}.`);}
  break;}
 case 24:{
  const group=int(2,5),fixed=int(1,6),stage=int(4,12);
  if(F){formula(`T = ${group}n + ${fixed}`,'T counts tiles; n is the whole-number stage.');num(`Which stage has ${group*stage+fixed} tiles?`,stage,`Remove the ${fixed} fixed tiles and divide the remaining ${group*stage} by ${group}: stage ${stage}.`,[(group*stage+fixed)/group,stage+fixed,group*stage]);}
  else if(R){formula(`T = ${group}n + ${fixed}`,'T counts tiles; n is the whole-number stage.');const fits=seed%2===0,total=group*stage+fixed+(fits?0:1);choose(`Can a stage of this pattern have exactly ${total} tiles?`,fits?`Yes, stage ${stage}, because ${group} × ${stage} + ${fixed} = ${total}.`:`No, because ${total} − ${fixed} = ${total-fixed} is not a multiple of ${group}.`,fits?[`No, because ${total} is not a multiple of ${group}.`,`Yes, stage ${stage+1}, because there is always a stage.`,`No, because ${total} is too large.`]:[`Yes, stage ${stage}, because it is close.`,`Yes, because every number is a stage.`,`No, because ${total} is odd.`],'Remove the fixed tiles and check whether the rest divides exactly by the group size.');}
  else{const have=group*stage+fixed+int(1,group-1);formula(`T = ${group}n + ${fixed}`,'T counts tiles; n is the whole-number stage.');num(`A builder has ${have} tiles. What is the largest complete stage they can make?`,stage,`(${have} − ${fixed}) ÷ ${group} = ${round((have-fixed)/group)}, so only stage ${stage} is complete.`,[stage+1,(have-fixed)/group,have/group]);}
  break;}
 // ── Week 9: function tables (AC9M7A05)
 case 25:{
  if(F){formula(`y = ${a}x + ${b}`,'Apply the rule to each input.');num(`Find y when x = ${x}.`,a*x+b,`Substitute x = ${x} into y = ${a}x + ${b}. Multiply first: ${a} × ${x} = ${a*x}. Then add ${b}: y = ${a*x+b}.`,[a*(x+b),a+x+b,a*x]);}
  else if(R){formula(`y = ${a}x + ${b}`,'Apply the rule to each input.');num(`For x = 2, a student put the x = 1 output (${a+b}) back into the rule and got ${a*(a+b)+b}. What is the correct output for x = 2?`,2*a+b,`Each input goes into the rule on its own: ${a} × 2 + ${b} = ${2*a+b}.`,[a*(a+b)+b,a+b+a+b]);}
  else{formula(`y = ${a}x + ${b}`,'Apply the rule to each input.');num(`Find y when x = −${x}.`,-a*x+b,`${a} × (−${x}) + ${b} = ${signed(-a*x+b)}.`,[a*x+b,-a*x-b,a*x-b]);}
  break;}
 case 26:{
  const y=a*x+b;
  if(F){formula(`y = ${a}x + ${b}`,'Find the input from the output.');num(`Which input x gives y = ${y}?`,x,`Subtract ${b}, then divide by ${a}: x = ${x}.`,[y/a-b,(y+b)/a,y-b]);}
  else if(R){formula(`y = ${a}x + ${b}`,'Find the input from the output.');num(`To find the input for y = ${y}, a student calculated ${y} ÷ ${a} − ${b}. What is the correct input?`,x,`Undo the operations in reverse order: subtract ${b} first, then divide by ${a}. x = ${x}.`,[y/a-b,(y+b)/a]);}
  else num(`A taxi charges $${b} plus $${a} per kilometre. A fare was $${y}. How many kilometres was the trip?`,x,`${a}k + ${b} = ${y}. Subtract ${b}, then divide by ${a}: ${x} km.`,[y/a-b,(y+b)/a,y-b]);
  break;}
 case 27:{
  if(F){table('Function table',['x','y'],[0,1,2,3].map(n=>[n,a*n+b]));choose('Write a rule for y in terms of x that matches every pair.',`y = ${a}x + ${b}`,[`y = ${b}x + ${a}`,`y = ${a+b}x`,`y = x + ${a+b}`],`At x = 0, y = ${b}; each extra 1 in x adds ${a}: y = ${a}x + ${b}.`);}
  else if(R){table('Function table',['x','y'],[1,2,3,4].map(n=>[n,a*n+b]));num('Without extending the table step by step, what is y when x = 10?',10*a+b,`The rule is y = ${a}x + ${b}, so y = ${a} × 10 + ${b} = ${10*a+b}.`,[(a+b)*10,a*10,10*a+b+a]);}
  else{const inputs=[0,2,5,7];table('Function table',['x','y'],inputs.map(n=>[n,a*n+b]));choose('The inputs jump unevenly. Write a rule for y in terms of x that matches every pair.',`y = ${a}x + ${b}`,[`y = ${2*a}x + ${b}`,`y = ${a}x + ${b+a}`,`y = ${3*a}x + ${b}`],`From x = 0 to x = 2, y rises by ${2*a}, which is ${a} per 1 in x. Check x = 5: ${a} × 5 + ${b} = ${5*a+b}.`);}
  break;}
 // ── Week 10: plotting relationships (AC9M7A05)
 case 28:{
  if(F){formula(`y = ${a}x + ${b}`,'Write points as (x, y).');choose(`Write the point on the graph of y = ${a}x + ${b} where x = ${x}.`,`(${x}, ${a*x+b})`,[`(${a*x+b}, ${x})`,`(${x}, ${a*x})`,`(${x}, ${x+a+b})`,`(${x}, ${a*x+b+a})`],`y = ${a} × ${x} + ${b} = ${a*x+b}, so the point is (${x}, ${a*x+b}).`);}
  else if(R){formula(`y = ${a}x + ${b}`,'Write points as (x, y).');choose(`A student plotted the point for x = ${x} on y = ${a}x + ${b} as (${a*x+b}, ${x}). Write the correct point.`,`(${x}, ${a*x+b})`,[`(${a*x+b}, ${x})`,`(${x}, ${a*x})`,`(${x+1}, ${a*x+b})`],'The horizontal coordinate comes first: (x, y).');}
  else{formula(`y = ${a}x + ${b}`,'Write points as (x, y).');choose(`Which point on the graph of y = ${a}x + ${b} has y = ${a*x+b}? Write it as (x, y).`,`(${x}, ${a*x+b})`,[`(${a*x+b}, ${x})`,`(${x+1}, ${a*x+b})`,`(${(a*x+b)/a}, ${a*x+b})`],`Solve ${a}x + ${b} = ${a*x+b}: x = ${x}.`);}
  break;}
 case 29:{
  const slope=int(2,4),start=int(1,6),pts:[number,number][]=[0,1,2,3].map(n=>[n,slope*n+start]);
  visual={kind:'plot',title:'Function values',xLabel:'x',yLabel:'y',points:pts,connect:false,showValues:true,yStep:2};
  if(F)choose('Write a rule for y in terms of x that matches all the plotted points.',`y = ${slope}x + ${start}`,[`y = ${slope+start}x`,`y = ${start}x + ${slope}`,`y = x + ${slope+start}`,`y = ${slope}x + ${start+1}`],`Where x = 0, y = ${start}, so the rule ends with + ${start}. Each extra 1 in x adds ${slope} to y, so x is multiplied by ${slope}. The rule is y = ${slope}x + ${start}.`);
  else if(R){const px=int(4,8),on=seed%2===0,py=slope*px+start+(on?0:pick([-1,1,2]));choose(`The plotted points follow one rule. Does the point (${px}, ${py}) follow the same rule?`,on?`Yes, because ${slope} × ${px} + ${start} = ${py}.`:`No, because ${slope} × ${px} + ${start} = ${slope*px+start}, not ${py}.`,on?[`No, because ${px} is not plotted.`,`No, because ${slope} × ${px} = ${slope*px}.`,'Yes, because every point lies on a line.']:[`Yes, because it is close to the line.`,`Yes, because ${py} is larger than ${start}.`,'No, because points must have x below 4.'],`Find the rule y = ${slope}x + ${start}, then substitute x = ${px}.`);}
  else num('Using the pattern in the plotted points, what is y when x = 10?',slope*10+start,`The rule is y = ${slope}x + ${start}: ${slope} × 10 + ${start} = ${slope*10+start}.`,[(slope+start)*10,slope*10,slope*10+start+slope]);
  break;}
 case 30:{
  formula(`C = ${a}n + ${b}`,'C is a modelled cost in dollars for n notebooks.');
  if(F)num(`Using this model, what cost is predicted for ${x+c} notebooks?`,a*(x+c)+b,`Substitute n = ${x+c} into C = ${a}n + ${b}. Multiply first: ${a} × ${x+c} = ${a*(x+c)}. Then add ${b}: ${a*(x+c)+b} dollars.`,[a*(x+c),(a+b)*(x+c),a+x+c+b]);
  else if(R)choose(`The model predicts $${a*1000+b} for 1000 notebooks. Which is a reason the real cost might be different?`,'A shop may give a bulk discount, so the price per notebook could change.',['The formula cannot be used for numbers larger than 100.','1000 is too large to substitute into a formula.','The fixed amount would be multiplied by 1000.'],'A model only predicts well while its pricing rule still applies.');
  else{const budget=a*x+b+int(1,a-1);num(`You have $${budget}. Using this model, what is the greatest number of notebooks you can buy?`,x,`${a}n + ${b} ≤ ${budget}: (${budget} − ${b}) ÷ ${a} = ${round((budget-b)/a)}, so ${x} notebooks.`,[x+1,(budget-b)/a,budget/a]);}
  break;}
 // ── Week 11: investigating formulas with a spreadsheet (AC9M7A06)
 case 31:{
  const v=a*10,dt=pick([1,2]),times=[1,2,3,4].map(n=>n*dt);
  table('Spreadsheet: d = v × t',['Time t (h)','Distance d (km)'],times.map(t=>[t,v*t]));
  if(F)num('By how many kilometres does d increase from one row to the next?',v*dt,`Each row adds ${dt} hour${dt>1?'s':''} at the same speed: ${v} × ${dt} = ${v*dt} km.`,[v,dt,v*dt*2]);
  else if(R)num('One input is held fixed in this spreadsheet. What is the fixed speed v in km/h?',v,`d ÷ t is the same in every row: ${v*times[0]} ÷ ${times[0]} = ${v}.`,[v*dt,times[0],v*times[0]]);
  else{const t=int(10,20);num(`Predict d when t = ${t} hours.`,v*t,`The speed stays ${v} km/h: d = ${v} × ${t} = ${v*t}.`,[v*dt*t,v+t,v*(t-1)]);}
  break;}
 case 32:{
  formula('V = lwh',`Original dimensions: l = ${a}, w = ${b}, h = ${c} cm.`);
  if(F){const f1=pick([2,3,4]),f2=pick([2,3,5]);num(`Length is multiplied by ${f1} and width by ${f2}. Height stays fixed. By what factor does volume change?`,f1*f2,`Volume is length × width × height. Multiplying the length by ${f1} and the width by ${f2} multiplies the volume by both: ${f1} × ${f2} = ${f1*f2}.`,[f1+f2,Math.max(f1,f2),f1*f2*2]);}
  else if(R){const f=pick([2,3]);choose(`Length and width are both multiplied by ${f}. Height stays fixed. Which statement is correct?`,`The volume is multiplied by ${f*f}.`,[`The volume is multiplied by ${2*f}.`,`The volume is multiplied by ${f}.`,'The volume is unchanged.',`The volume is multiplied by ${f*f*f}.`],`Each multiplied dimension multiplies the volume: ${f} × ${f} = ${f*f}.`);}
  else{const f1=pick([2,3]),f2=pick([2,4]);num(`Length is multiplied by ${f1} and width by ${f2}. Height stays fixed. What is the new volume in cm³?`,a*b*c*f1*f2,`Original volume ${a*b*c} cm³, multiplied by ${f1} × ${f2} = ${f1*f2}: ${a*b*c*f1*f2} cm³.`,[a*b*c*(f1+f2),a*b*c,(a*f1)*(b+f2)*c]);}
  break;}
 case 33:{
  if(F){formula('V = lwh',`Original dimensions: l = ${a}, w = ${b*c}, h = ${x} cm.`);num(`Length is multiplied by ${c}. Height stays fixed. What width in cm keeps V unchanged?`,b,`The length is ${c} times bigger, so the width must be ${c} times smaller to keep V the same. ${b*c} ÷ ${c} = ${b} cm.`,[b*c*c,b*c-c,b*c]);}
  else if(R){formula('V = lwh','The height stays fixed.');choose(`Length is multiplied by ${c}. By what fraction must the width be multiplied to keep V the same?`,`1/${c}`,[String(c),`1/${c*c}`,`${c-1}/${c}`,`${c}/${c+1}`],`The two changes must cancel: ${c} × 1/${c} = 1.`);}
  else{const L=a,W=b*c;num(`A rectangle is ${L} cm long and ${W} cm wide. Its length changes to ${L*c} cm. What new width in cm keeps the area the same?`,b,`Area = ${L*W} cm². ${L*W} ÷ ${L*c} = ${b} cm.`,[W*c,W-c,W]);}
  break;}
 // ── Week 12: apply and justify (AC9M7A01, AC9M7A06)
 case 34:{
  const k=int(1,3),meet=int(4,9),e=b,fixedA=e+k*meet,at=x===meet?x+1:x;
  formula(`A = ${a}n + ${fixedA}; B = ${a+k}n + ${e}`,'Two plans quote total prices in dollars for n items.');
  if(F)num(`At n = ${at}, how many dollars more does the more expensive plan cost?`,Math.abs(k*at-k*meet),`Substitute n = ${at} into each plan. Plan A costs ${a*at+fixedA} dollars and plan B costs ${(a+k)*at+e} dollars. The difference is ${Math.abs(k*at-k*meet)} dollars.`,[a*at+fixedA,(a+k)*at+e,k*at]);
  else if(R)num('For what number of items n do both plans cost the same?',meet,`${a}n + ${fixedA} = ${a+k}n + ${e}. Subtract ${a}n and ${e}: ${fixedA-e} = ${k}n, so n = ${meet}.`,[meet+1,fixedA-e,(fixedA+e)/k]);
  else num('What is the smallest whole number of items for which plan A is cheaper?',meet+1,`The plans cost the same at n = ${meet}. Plan B adds ${k} more per item, so A is cheaper from n = ${meet+1}.`,[meet,meet-1,fixedA-e]);
  break;}
 case 35:{
  if(F){formula('V = lwh',`Length l = ${a} cm; width w = ${b} cm.`);num(`What height in cm gives volume ${a*b*x} cm³?`,x,`The base area is ${a} × ${b} = ${a*b} cm². Volume = base area × height, so divide: ${a*b*x} ÷ ${a*b} = ${x} cm.`,[a*b*x/a,a*b*x/b,a*b*x-a*b]);}
  else if(R){formula('V = lwh',`Length l = ${a} cm; width w = ${b} cm.`);num(`To find the height for volume ${a*b*x} cm³, a student divided ${a*b*x} by ${a} only. What is the correct height in cm?`,x,`Divide by the whole base area, ${a} × ${b} = ${a*b}: ${a*b*x} ÷ ${a*b} = ${x}.`,[a*b*x/a,a*b*x/b]);}
  else{const rate=pick([2.5,1.5,3.5]),budget=round(rate*x+b+rate/2);formula(`C = ${rate}n + ${b}`,'C is the monthly phone cost in dollars for n gigabytes of data.');num(`Your budget is $${budget}. What is the greatest whole number of gigabytes you can afford?`,x,`(${budget} − ${b}) ÷ ${rate} = ${round((budget-b)/rate)}, so ${x} GB.`,[x+1,(budget-b)/rate,budget/rate]);}
  break;}
 case 36:{
  formula(`C = ${a}n + ${b}`,'n changes; both coefficients stay fixed.');
  if(F)num(`If n increases by ${c}, by how much does C increase?`,a*c,`The fixed ${b} cancels in the comparison; the variable part increases by ${a} × ${c} = ${a*c}.`,[a*c+b,a+c,c]);
  else if(R)choose(`Why does the ${b} in C = ${a}n + ${b} not affect how much C increases when n increases?`,`It is added once whatever n is, so it cancels when you compare two values of C.`,[`Because ${b} is smaller than ${a}.`,`Because ${b} is multiplied by n.`,'Because constants are always zero.'],'Compare C at two values of n: the constant appears in both and subtracts away.');
  else num(`If n doubles from ${x} to ${2*x}, by how much does C increase?`,a*x,`C rises from ${a*x+b} to ${2*a*x+b}: an increase of ${a} × ${x} = ${a*x}.`,[a*x+b,2*(a*x+b),2*a*x]);
  break;}
 }
 // Second application forms: half of the application questions ask a structurally different
 // question about the same skill, so a quiz's two application questions are not twins.
 if(role==='apply_create'&&int(0,1)===1){
  const before=visual;visual=undefined;
  switch(key){
  case 1:choose(`Plan A: C = ${a}n + ${b}. Plan B charges $${a+1} per ride with no entry fee. Write a formula for the cost C of n rides on Plan B.`,`C = ${a+1}n`,[`C = ${a+1}n + ${b}`,`C = n + ${a+1}`,`C = ${a}n`],`With no entry fee there is no added amount: C = ${a+1}n.`);break;
  case 2:{const rate=pick([1.5,2.5,3.2]);formula(`F = ${rate}d + ${b}`,'F is the taxi fare in dollars; d is the distance in km.');num(`How much more does a ${x+2} km trip cost than a ${x} km trip, in dollars?`,2*rate,`The flag fall is paid on both trips, so only the 2 extra km count: 2 × ${rate} = ${round(2*rate)}.`,[2*rate+b,rate,rate*(x+2)+b]);break;}
  case 4:choose(`A baker makes n trays of ${a} muffins and then gives away ${b} muffins. Write an expression for the number of muffins left.`,`${a}n − ${b}`,[`${a}(n − ${b})`,`${b} − ${a}n`,`${a}n + ${b}`],`n trays of ${a} make ${a}n muffins; giving away ${b} leaves ${a}n − ${b}.`);break;
  case 5:choose(`A water tank holds ${b*10} L and loses ${a} L each hour. Write a formula for the water left, V litres, after h hours.`,`V = ${b*10} − ${a}h`,[`V = ${a}h − ${b*10}`,`V = ${b*10}h − ${a}`,`V = ${b*10} + ${a}h`],`Start with ${b*10} L and take away ${a} L for every hour: V = ${b*10} − ${a}h.`);break;
  case 7:choose(`A rectangle has width ${a} cm and length (n + ${b}) cm. Write an expression for its area in cm².`,`${a}(n + ${b})`,[`${a}n + ${b}`,`n + ${a*b}`,`${a+b}n`],`Area = width × length = ${a}(n + ${b}), which expands to ${a}n + ${a*b}.`);break;
  case 8:num(`${a}n + ${a*b} = ${a}(n + □). What number goes in the box?`,b,`Factorise: ${a*b} ÷ ${a} = ${b}, so ${a}n + ${a*b} = ${a}(n + ${b}).`,[a*b,a*b-a,a+b]);break;
  case 9:choose(`An adult ticket costs p dollars. A family buys n adult tickets and 2 child tickets that are $${b} cheaper each. Write an expression for the total cost.`,`np + 2(p − ${b})`,[`np + 2p − ${b}`,`(n + 2)p`,`n(p − ${b}) + 2p`],`Adults cost np. Each child ticket costs p − ${b}, and there are 2: np + 2(p − ${b}).`);break;
  case 10:num(`After spending $${b}, Mia has $${x} left. How much money did she start with?`,x+b,`If she started with m dollars, m − ${b} = ${x}. Add ${b}: m = ${x+b}.`,[x-b>0?x-b:x+2*b,x,b]);break;
  case 11:num(`${a} identical boxes weigh ${a*x} kg altogether. How much does one box weigh in kg?`,x,`${a}m = ${a*x}. Divide both sides by ${a}: m = ${x}.`,[a*x-a,a*x+a,a]);break;
  case 12:num(`Test whole numbers to find the value of n that makes ${a}(n + ${b}) = ${a*(x+b)} true.`,x,`Try n = ${x}: ${a} × (${x} + ${b}) = ${a*(x+b)}.`,[x+b,a*(x+b)/a,x-1]);break;
  case 13:num(`A plumber charges a $${b*10} call-out fee plus $${a*10} per hour. A job cost $${b*10+a*10*x}. How many hours did the job take?`,x,`${a*10}h + ${b*10} = ${b*10+a*10*x}. Subtract ${b*10}, then divide by ${a*10}: h = ${x}.`,[(b*10+a*10*x)/(a*10),x+1,x+b]);break;
  case 14:num(`A rectangle has width ${a} cm and length (x + ${b}) cm. Its area is ${a*(x+b)} cm². Find x.`,x,`${a}(x + ${b}) = ${a*(x+b)}. Divide by ${a}: x + ${b} = ${x+b}, so x = ${x}.`,[x+b,a*(x+b)/a-b+1,(a*(x+b)-b)/a]);break;
  case 15:num(`Think of a number, add ${b}, then multiply by ${a}. The result is ${a*(x+b)}. What was the number?`,x,`Undo the last step first: ${a*(x+b)} ÷ ${a} = ${x+b}. Then subtract ${b}: ${x}.`,[a*(x+b)/a,(a*(x+b)-b)/a,x+b]);break;
  case 17:num(`A candle is ${b+a*x} cm tall and burns down ${a} cm each hour. After how many hours is it ${b} cm tall?`,x,`${b+a*x} − ${a}h = ${b}. The candle must lose ${a*x} cm: ${a*x} ÷ ${a} = ${x} hours.`,[(b+a*x)/a,b,x+1]);break;
  case 18:num(`Check x = ${x} in ${a+c}x + ${b} = ${c}x + ${a*x+b}. What does each side equal?`,(a+c)*x+b,`Left: ${a+c} × ${x} + ${b} = ${(a+c)*x+b}. Right: ${c} × ${x} + ${a*x+b} = ${c*x+a*x+b}. Both sides match, so x = ${x} is a solution.`,[(a+c)*x,c*x,a*x+b]);break;
  case 24:{const group=int(2,4),fixed=int(1,5);formula(`T = ${group}n + ${fixed}`,'T counts tiles; n is the whole-number stage.');num('Stages 1, 2 and 3 are each built separately. How many tiles are needed altogether?',6*group+3*fixed,`T(1) + T(2) + T(3) = ${group+fixed} + ${2*group+fixed} + ${3*group+fixed} = ${6*group+3*fixed}.`,[3*group+fixed,6*group+fixed,9*group+3*fixed]);break;}
  case 25:formula(`y = ${a}x + ${b}`,'Apply the rule, or work backwards from y.');num(`Work backwards: which input x gives the output y = ${signed(b-a*x)}?`,-x,`${a}x + ${b} = ${signed(b-a*x)}. Subtract ${b}: ${a}x = ${signed(-a*x)}. Divide by ${a}: x = ${signed(-x)}.`,[x,(b-a*x)/a,-x-b]);break;
  case 26:num(`A function machine multiplies by ${a}, then subtracts ${b}. The output is ${a*x-b}. What was the input?`,x,`Work backwards: add ${b} to get ${a*x}, then divide by ${a}: ${x}.`,[(a*x-b)/a,(a*x-b+b)/a+1,a*x]);break;
  case 27:{const top=b+a*5,inputs=[1,2,3,4];table('Function table',['x','y'],inputs.map(n=>[n,top-a*n]));choose('The outputs go down as x goes up. Write a rule for y in terms of x that matches every pair.',`y = ${top} − ${a}x`,[`y = ${a}x + ${top}`,`y = ${top-a} − ${a}x`,`y = ${top} − x`],`Each step in x lowers y by ${a}, and at x = 0 the value would be ${top}: y = ${top} − ${a}x.`);break;}
  case 28:formula(`y = ${a}x + ${b}`,'Write points as (x, y).');num(`The point (${x}, k) lies on the graph of y = ${a}x + ${b}. What is k?`,a*x+b,`Substitute x = ${x}: ${a} × ${x} + ${b} = ${a*x+b}.`,[a+x+b,a*(x+b),a*x]);break;
  case 29:num(`A straight line passes through (0, ${b}) and (2, ${b+2*a}). What is y when x = 5?`,b+5*a,`y rises ${2*a} over 2, which is ${a} per 1. From (0, ${b}): y = ${b} + 5 × ${a} = ${b+5*a}.`,[b+10*a,b+2*a+5,5*a]);break;
  case 30:formula(`C = ${a}n + ${b}`,'C is the cost in dollars of n notebooks, including delivery.');num(`Notebooks now cost $1 more each and delivery stays the same. How much do ${x} notebooks cost now, in dollars?`,(a+1)*x+b,`The new model is C = ${a+1}n + ${b}: ${a+1} × ${x} + ${b} = ${(a+1)*x+b}.`,[a*x+b+1,(a+1)*(x+b),a*x+b]);break;
  case 31:{const v=pick([60,70,80,90]);num(`A car travels at a constant ${v} km/h. How many hours does it take to travel ${v*x} km?`,x,`d = ${v}t, so ${v*x} = ${v}t and t = ${v*x} ÷ ${v} = ${x}.`,[v*x-v,x+1,v]);break;}
  case 32:num(`A box is ${a} cm by ${b} cm by ${c} cm. Every edge is doubled. What is the new volume in cm³?`,8*a*b*c,`Each of the three lengths doubles, so the volume is multiplied by 2 × 2 × 2 = 8: ${a*b*c} × 8 = ${8*a*b*c}.`,[2*a*b*c,4*a*b*c,a*b*c+8]);break;
  case 33:num(`A box has length ${2*a} cm, width ${b} cm and height ${c} cm. Its height is doubled. What length in cm keeps the volume the same?`,a,`Doubling the height doubles the volume, so halve the length: ${2*a} ÷ 2 = ${a} cm.`,[4*a,2*a,a+c]);break;
  default:visual=before;
  }
 }
 return makeQuestion({realm:'pattern',week,lesson,seed,role,prompt,answer,wrong,explanation,idea:g.idea,visual});
}
