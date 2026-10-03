import type { MultipleChoiceQuestion } from '@/data/activities/year2/lessonEngine';
import type { Lesson } from '@/data/programs/year1';
import type { LessonActivity } from '@/data/programs/types';
import { number7Guide } from './curriculum';
import { number7Challenge, type Number7Role } from './challenges';
export type Number7Question = MultipleChoiceQuestion & { skill:string; seed:number; lessonId:string; version:2; tier:Number7Role; diagramSpeech?:string; expectedValue?:number };
export const gcd=(a:number,b:number):number=>b?gcd(b,a%b):Math.abs(a);
export const fraction=(n:number,d:number)=>{const f=gcd(n,d);return d/f===1?String(n/f):`${n/f}/${d/f}`;};
const value=(s:string)=>{const f=s.match(/^(-?\d+)\/(\d+)$/);return f?Number(f[1])/Number(f[2]):Number(s);};
const decimal=(n:number)=>String(Math.round(n*1000000)/1000000);
const pow=(n:number,e:number)=>`${n}${String(e).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('')}`;
export function number7Question(week:number,lesson:number,seed:number,role='fast_thinking'):Number7Question {
 const guide=number7Guide(week,lesson);if(!guide)throw new Error('Unknown Level 7 Number lesson');
 if(role==='reasoning'||role==='apply_create')return number7Challenge(week,lesson,seed,role);
 let state=(seed>>>0)||1;
 const rnd=(min:number,max:number)=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return min+state%(max-min+1);};
 const pick=<T,>(a:T[])=>a[rnd(0,a.length-1)];
 const n=rnd(3,20), a=rnd(2,8),b=rnd(2,7),c=rnd(2,6);
 const key=(week-1)*3+lesson;
 let prompt='',answer='',wrong:string[]=[],explanation='';
 let expectedValue:number|undefined;
 let paintContext:MultipleChoiceQuestion["paintContext"];
 let visual:MultipleChoiceQuestion["visual"],diagramSpeech:string|undefined;
 const line=(min:number,max:number,subdivisions:number,points:Array<[string,number]>,speech:string)=>{visual={type:"fraction_number_line",title:"Read the marked points",leftLabel:"",rightLabel:"",leftPosition:min,rightPosition:max,min,max,subdivisions,markers:points.map(([label,position])=>({label,position}))};diagramSpeech=`Number line from ${min} to ${max}. Each whole is divided into ${subdivisions} equal intervals. ${speech}`;};
 const num=(p:string,v:number,e:string,d:number[]=[] )=>{prompt=p;answer=decimal(v);expectedValue=v;explanation=e;wrong=d.map(decimal);};
 const choose=(p:string,v:string,d:string[],e:string)=>{prompt=p;answer=v;wrong=d;explanation=e;const x=value(v);if(Number.isFinite(x))expectedValue=x;};
 switch(key){
 case 1:num(role==='apply_create'?`A square crystal display has ${n} rows of ${n}. How many crystals?`:`What is ${pow(n,2)}?`,n*n,`${pow(n,2)} = ${n} × ${n} = ${n*n}.`,[n*2,n*n+n,n*n-n]);break;
 case 2:num(role==='apply_create'?`A square floor has area ${n*n} m². What is its side length in metres?`:`What is √${n*n}?`,n,`${n} × ${n} = ${n*n}, so √${n*n} = ${n}.`,[n*n/2,n+1,n-1]);break;
 case 3:if(role==='apply_create')num(`A square chamber has area ${n*n} m². Find its perimeter in metres.`,n*4,`Side = √${n*n} = ${n} m. Perimeter = 4 × ${n} = ${n*4} m.`,[n,n*n*4,n*2]);else {const x=n*n+rnd(1,2*n);num(`Which whole number is immediately below √${x}?`,n,`${n*n} < ${x} < ${(n+1)**2}, so ${n} < √${x} < ${n+1}.`,[n-1,n+1,n+2]);}break;
 case 4:{const bases=[2,3,5,7],first=pick(bases),second=pick(bases.filter(v=>v!==first)),p=rnd(1,3),q=rnd(1,2),v=first**p*second**q;const term=(x:number,e:number)=>e===1?String(x):pow(x,e);choose(`Which is the prime factorisation of ${v}?`,`${term(first,p)} × ${term(second,q)}`,[`${term(first,p+1)} × ${term(second,q)}`,`${term(first,p)} × ${term(second,q+1)}`,`${term(first,p+1)} × ${term(second,q+1)}`],`${v} = ${Array(p).fill(String(first)).concat(Array(q).fill(String(second))).join(' × ')}. Group identical prime factors into powers.`);break;}
 case 5:{const base=pick([2,3,5]),ex=rnd(2,5);num(`Evaluate ${pow(base,ex)}.`,base**ex,`${pow(base,ex)} means ${ex} factors of ${base}: ${Array(ex).fill(base).join(' × ')} = ${base**ex}.`,[base*ex,base**(ex-1),base**ex+base]);break;}
 case 6:{const x=a*b,y=a*c, h=gcd(x,y), l=x*y/h;const isLcm=seed%2===0;num(`Find the ${isLcm?'lowest common multiple':'highest common factor'} of ${x} and ${y}.`,isLcm?l:h,`${x} and ${y} have HCF ${h}; their LCM is ${x} × ${y} ÷ ${h} = ${l}.`,[isLcm?h:l,x+y,Math.max(x,y)+1]);break;}
 case 7:{const e=rnd(2,7);num(`What is ${pow(10,e)}?`,10**e,`${pow(10,e)} is 1 followed by ${e} zeros.`,[10*e,10**(e-1),10**(e+1)]);break;}
 case 8:{const v=a*10000+b*100+c;choose(`Which expanded form equals ${v.toLocaleString('en-AU')}?`,`${a} × 10⁴ + ${b} × 10² + ${c}`,[`${a} × 10³ + ${b} × 10² + ${c}`,`${a} × 10⁴ + ${b} × 10³ + ${c}`,`${a} × 10⁴ + ${b} × 10² + ${c} × 10`],`The ${a} is in the ten-thousands place and ${b} is in the hundreds place. ${a*10000} + ${b*100} + ${c} = ${v}.`);break;}
 case 9:num(`Rebuild this number: ${a} × 10⁵ + ${b} × 10³ + ${c} × 10.`,a*100000+b*1000+c*10,`Evaluate the parts: ${a*100000} + ${b*1000} + ${c*10} = ${a*100000+b*1000+c*10}.`,[a*10000+b*100+c,a*100000+b*100+c*10,a*100000+b*1000+c]);break;
 case 10:{const d=pick([8,10,12,15,18,20]),u=rnd(1,d-1),k=rnd(2,6);choose(`Write ${u*k}/${d*k} in simplest form.`,fraction(u,d),[fraction(u+1,d),fraction(u,d+1),fraction(u+2,d)],`Divide numerator and denominator by their highest common factor, ${gcd(u*k,d*k)}. The simplest form is ${fraction(u,d)}.`);break;}
 case 11:{const d=pick([4,5,8,10,20,25]),u=rnd(1,d-1);num(`Write ${u}/${d} as a decimal.`,u/d,`${u} ÷ ${d} = ${decimal(u/d)}.`,[u/d*10,u/d/10,(u+1)/d]);break;}
 case 12:{const d=pick([4,5,8,10,20,25]),u=rnd(1,d-1);num(`What percentage is equivalent to ${u}/${d}?`,100*u/d,`${u}/${d} = ${decimal(u/d)}. Multiply by 100 to get ${decimal(100*u/d)}%.`,[u/d,u*10,100*(u+1)/d]);break;}
 case 13:{const d=pick([2,4,5]),u=rnd(d+1,d*4-1);line(0,Math.ceil(u/d)+1,d,[['P',u/d]],`P is ${u} small intervals right of zero.`);num('What decimal is at P?',u/d,`${u} equal steps of 1/${d} give ${u}/${d} = ${decimal(u/d)}.`,[u*d,u/d+1,u/d-1]);break;}
 case 14:{const d=pick([2,4,5]),u=rnd(1,d*3);line(Math.floor(-u/d)-1,1,d,[['P',-u/d]],`P is ${u} small intervals left of zero.`);num('What decimal is at P?',-u/d,`Left of zero is negative. The point is −${u}/${d} = ${decimal(-u/d)}.`,[u/d,-u*d,-u/d-1]);break;}
 case 15:{const x=-a/4,y=-(a+1)/4,z=b/4;line(Math.floor(y)-1,Math.ceil(z)+1,4,[['P',y],['Q',x],['R',z]],`P is ${a+1} quarter-unit intervals left of zero. Q is ${a} quarter-unit intervals left of zero. R is ${b} quarter-unit intervals right of zero.`);choose('Which list is in ascending order?',[decimal(y),decimal(x),decimal(z)].join(', '),[[decimal(x),decimal(y),decimal(z)],[decimal(z),decimal(x),decimal(y)],[decimal(y),decimal(z),decimal(x)]].map(v=>v.join(', ')),`Ascending means smallest to largest. ${decimal(y)} is furthest left, then ${decimal(x)}, then ${decimal(z)}.`);break;}
 case 16:{const t=rnd(1201,9989),places=pick([1,2]),v=t/1000,unit=10**places,res=Math.floor((t+10**(3-places)/2)/10**(3-places))/unit;num(`Round ${v.toFixed(3)} to ${places} decimal ${places===1?'place':'places'}.`,res,`Look at the digit after the ${places===1?'tenths':'hundredths'} place. The rounded value is ${res.toFixed(places)}.`,[Math.floor(v*unit)/unit,res+1/unit,res-1/unit]);answer=res.toFixed(places);wrong=wrong.map(x=>Number(x).toFixed(places));break;}
 case 17:{const capacity=pick([1,2,5]),need=rnd(21,99)/10,ans=Math.ceil(need/capacity);paintContext={need,capacity};num(`How many whole tins are needed?`,ans,`${need} ÷ ${capacity} = ${decimal(need/capacity)}. Round up to ${ans} tins to have enough.`,[Math.floor(need/capacity),ans+1,ans+2]);break;}
 case 18:{const x=rnd(2,8)*10-0.2,y=rnd(2,8)+0.1,X=Math.round(x/10)*10,Y=Math.round(y);num(`Round ${x} to the nearest ten and ${y} to the nearest whole number. Estimate their product.`,X*Y,`${x} rounds to ${X}; ${y} rounds to ${Y}. Estimated product = ${X} × ${Y} = ${X*Y}.`,[X*Y*10,X*Y/10,X+Y]);break;}
 case 19:{const d=pick([3,4,5,6]),e=d+1,u=rnd(1,d-1),v=rnd(1,e-1),sub=seed%2===0;let numerator=sub?u*e-v*d:u*e+v*d;let first=`${u}/${d}`,second=`${v}/${e}`;if(sub&&numerator<0){[first,second]=[second,first];numerator=-numerator;}choose(`Calculate ${first} ${sub?'−':'+'} ${second}.`,fraction(numerator,d*e),[fraction(u+v,d+e),fraction(numerator+1,d*e),fraction(numerator+d,d*e)],`Use common denominator ${d*e}, then ${sub?'subtract':'add'} the numerators. Simplify to ${fraction(numerator,d*e)}.`);break;}
 case 20:{const d=a+1,e=b+2;choose(`Calculate ${a}/${d} × ${b}/${e}.`,fraction(a*b,d*e),[fraction(a+b,d+e),fraction(a*b,d+e),fraction(a*e,d*b)],`Multiply numerators and denominators: ${a*b}/${d*e}. Simplify to ${fraction(a*b,d*e)}.`);break;}
 case 21:{const d=a+1,e=b+2;choose(`Calculate ${a}/${d} ÷ ${b}/${e}.`,fraction(a*e,d*b),[fraction(a*b,d*e),fraction(d*b,a*e),fraction(a+b,d+e)],`Multiply by the reciprocal: ${a}/${d} × ${e}/${b} = ${fraction(a*e,d*b)}.`);break;}
 case 22:{const x=rnd(210,950),y=rnd(11,199),sub=seed%2===0;num(`Calculate ${(x/100).toFixed(2)} ${sub?'−':'+'} ${(y/100).toFixed(2)}.`,(sub?x-y:x+y)/100,`Align decimal places. Work in hundredths: ${x} ${sub?'−':'+'} ${y} = ${sub?x-y:x+y} hundredths.`,[(sub?x-y:x+y)/10,(sub?x-y:x+y)/100+0.1,(sub?x-y:x+y)/100+1]);break;}
 case 23:if(seed%2===0)num(`Calculate ${decimal(a*b/10)} ÷ ${decimal(b/10)}.`,a,`Scale both numbers by 10: ${a*b} ÷ ${b} = ${a}.`,[a/10,a*10,a*b]);else num(`Calculate ${decimal(a/10)} × ${decimal(b/10)}.`,a*b/100,`${a} × ${b} = ${a*b}. Both factors were divided by 10, so divide the product by 100.`,[a*b/10,a*b,a*b/100+0.01]);break;
 case 24:{const [percent,den]=pick([[50,2],[25,4],[20,5],[12.5,8]]),total=den*n;num(`Find ${percent}% of ${total}.`,n,`${percent}% = 1/${den}. ${total} ÷ ${den} = ${n}.`,[n*10,total-n,total*percent]);break;}
 case 25:{const vals=[-n,-a,0,b];choose('Which integer is smallest?',String(Math.min(...vals)),[String(Math.max(-n,-a)),String(b),'0'],`The smallest integer is furthest left on a number line: ${Math.min(...vals)}.`);break;}
 case 26:{const x=-n,y=a+b;num(role==='apply_create'?`The temperature is ${x}°C and rises ${y}°C. What is the new temperature in °C?`:`Calculate ${x} + ${y}.`,x+y,`Start at ${x} and move ${y} places right to ${x+y}.`,[x-y,-x+y,-x-y]);break;}
 case 27:{const x=seed%2===0?-n:n,y=-a;num(`Calculate ${x} − (${y}).`,x-y,`Subtracting ${y} means adding its opposite: ${x} + ${-y} = ${x-y}.`,[x+y,-x+y,-x-y]);break;}
 case 28:{const h=gcd(a,b),k=c;choose(`Simplify the ratio ${a*k} : ${b*k}.`,`${a/h}:${b/h}`,[`${a/h+1}:${b/h}`,`${a/h}:${b/h+1}`,`${a/h+1}:${b/h+1}`],`Divide both quantities by their HCF, ${k*h}. The ratio is ${a/h}:${b/h}.`);break;}
 case 29:{const total=(a+b)*c;num(`Share $${total} in the ratio ${a}:${b}. How many dollars are in the first share?`,a*c,`There are ${a+b} parts. Each is $${c}. The first share is ${a} × $${c} = $${a*c}.`,[b*c,total/a,total-b]);break;}
 case 30:{const total=(a+b)*50;num(`Concentrate:water = ${a}:${b}. A mixture totals ${total} mL. How many mL are concentrate?`,a*50,`There are ${a+b} parts. Each is ${total} ÷ ${a+b} = 50 mL. Concentrate is ${a} × 50 = ${a*50} mL.`,[b*50,total/a,total-b]);break;}
 case 31:{const price=n*20,percent=pick([10,20,25,30]),delivery=c;num(`A $${price} bag is ${percent}% off. Delivery adds $${delivery}. What is the final cost in dollars?`,price*(1-percent/100)+delivery,`Discount = $${price*percent/100}. Subtract it from $${price}, then add $${delivery} delivery.`,[price*percent/100+delivery,(price+delivery)*(1-percent/100),price+delivery]);break;}
 case 32:{const cost=n*10,rate=pick([10,20,30,40]),loss=seed%2===0,revenue=cost*(1+(loss?-rate:rate)/100);num(`An event costs $${cost} and earns $${decimal(revenue)}. What is the percentage ${loss?'loss':'profit'}?`,rate,`${loss?'Loss':'Profit'} = $${decimal(Math.abs(revenue-cost))}. Divide by cost $${cost}, then multiply by 100: ${rate}%.`,[100-rate,rate/10,rate+10]);break;}
 case 33:{const size=a,price=a*(b+0.5);num(`A pack of ${size} notebooks costs $${price.toFixed(2)}. What is the cost per notebook in dollars?`,b+0.5,`Unit price = $${price.toFixed(2)} ÷ ${size} = $${(b+0.5).toFixed(2)} each.`,[price*size,price-size,b+0.05]);break;}
 case 34:{const price=a+0.5,delivery=c,budget=b*price+delivery+n;num(`Buy ${b} supplies at $${price.toFixed(2)} each, plus $${delivery} delivery. How much remains from $${budget.toFixed(2)}?`,n,`Total cost = ${b} × $${price.toFixed(2)} + $${delivery} = $${(b*price+delivery).toFixed(2)}. Subtract this from the budget to leave $${n}.`,[n+delivery,n-delivery,budget-price-delivery]);break;}
 case 35:num(`A lift starts at floor −${a}, rises ${n} floors, then descends ${b}. On which floor does it finish?`,-a+n-b,`Model: −${a} + ${n} − ${b} = ${-a+n-b}. This is the final floor, not the distance travelled.`,[a+n+b,-a-n-b,a+n-b]);break;
 case 36:{const price=n*10,rate=pick([10,20,25,50]),delivery=c,factor=1-rate/100;choose(`A $${price} bag is ${rate}% off, then $${delivery} delivery is added. Which model gives the final cost?`,`${price} × ${factor} + ${delivery}`,[`(${price} − ${delivery}) × ${factor}`,`(${price} + ${delivery}) × ${factor}`,`${price} + ${price} × ${rate/100} + ${delivery}`],`Pay ${100-rate}% of the original price, then add delivery: ${price} × ${factor} + ${delivery} = $${decimal(price*factor+delivery)}.`);break;}
 }
 // Reject equivalent numeric distractors (including fractions), not only duplicate text.
 const equivalent=(x:string,y:string)=>x===y||(Number.isFinite(value(x))&&Number.isFinite(value(y))&&Math.abs(value(x)-value(y))<1e-9);
 const options=[answer];for(const w of wrong)if(!options.some(x=>equivalent(x,w)))options.push(w);
 let offset=1;while(options.length<4){const candidate=Number.isFinite(value(answer))?decimal(value(answer)+offset):`None of these ${offset===1?'':`(${offset})`}`;if(!options.some(x=>equivalent(x,candidate)))options.push(candidate);offset++;}
 for(let i=options.length-1;i>0;i--){const j=rnd(0,i);[options[i],options[j]]=[options[j],options[i]];}
 return {readabilityRevision:key===16||key===17?2:(key===13||key===14)?3:1,kind:'multiple_choice',prompt,answer,options:options.slice(0,4),explanation,helper:'Choose one answer. Use the skill guide if you need help.',skill:guide.code,seed,lessonId:`y7-w${week}-l${lesson}`,version:2,tier:'fast_thinking',visual,paintContext,diagramSpeech,expectedValue};
}
export function generateNumber7Question(_level:unknown,lesson:Lesson,activity:LessonActivity):Number7Question {
 if(!/^y7-w(?:[1-9]|1[0-2])-l[1-3]$/.test(lesson.id))throw new Error('Unsupported Level 7 lesson');
 return number7Question(lesson.week,lesson.lesson,Math.floor(Math.random()*0x7fffffff),String(activity.config.rotationRole));
}
export function number7Quiz(week:number) {
 if(!Number.isInteger(week)||week<1||week>11)throw new Error('Unknown Level 7 quiz');
 return [1,2,3].flatMap(lesson=>{
  const questions:Array<Number7Question & {lessonTag:1|2|3;id:string}>=[],seen=new Set<string>();
  for(let i=0;questions.length<5&&i<300;i++){
   const q=number7Question(week,lesson,700001+week*10007+lesson*101+i*7919,(['fast_thinking','reasoning','apply_create','fast_thinking','apply_create'] as const)[questions.length]);
   const fingerprint=q.prompt+q.options.slice().sort().join("|");if(seen.has(fingerprint))continue;seen.add(fingerprint);
   questions.push({...q,lessonTag:lesson as 1|2|3,id:`y7-w${week}-quiz-l${lesson}-${questions.length+1}`});
  }
  if(questions.length!==5)throw new Error('Insufficient unique quiz questions');return questions;
 });
}
