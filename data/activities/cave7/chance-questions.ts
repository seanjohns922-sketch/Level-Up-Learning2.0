import {cave7Guide} from './curriculum';
import {makeQuestion,numericWrong,random,round,type Cave7Role,type Cave7Visual} from './shared';

// Level 7 Probability. Fluency, reasoning and application are separate tasks: fluency
// calculates, reasoning corrects a real misconception on the question's own numbers, and
// application has two forms per lesson so a quiz's two application questions differ.
// Students type most answers; multiple choice is kept for judgements about plans and reports.
const COLOURS={red:'#e5484d',blue:'#3b82f6',green:'#22a06b',yellow:'#f5b301'} as const;
type Colour=keyof typeof COLOURS;
const gcd=(x:number,y:number):number=>y?gcd(y,x%y):Math.abs(x);
const frac=(n:number,d:number)=>{const g=gcd(n,d)||1;return d/g===1?String(n/g):`${n/g}/${d/g}`;};
const join=(xs:(string|number)[])=>xs.join(', ');
const range=(n:number)=>Array.from({length:n},(_,i)=>i+1);
const list=(counts:Partial<Record<Colour,number>>)=>(Object.keys(COLOURS) as Colour[]).filter(c=>(counts[c]??0)>0).map(c=>`${counts[c]} ${c}`);
const sayList=(xs:string[])=>xs.length<2?xs.join(''):`${xs.slice(0,-1).join(', ')} and ${xs.at(-1)}`;

export function chance7Question(week:number,lesson:number,seed:number,role:Cave7Role='fast_thinking'){
 const g=cave7Guide('chance',week,lesson);if(!g)throw Error('Unknown Probability lesson');
 const int=random(seed),key=(week-1)*3+lesson,F=role==='fast_thinking',R=role==='reasoning';
 const alt=((Math.imul(seed>>>0,2654435761)>>>15)&1)===1;
 const pick=<T,>(xs:readonly T[])=>xs[int(0,xs.length-1)];
 const shuffle=<T,>(xs:T[])=>{const r=[...xs];for(let i=r.length-1;i>0;i--){const j=int(0,i);[r[i],r[j]]=[r[j],r[i]];}return r;};
 // Spinner: a red and b blue equal sections, never equal so "1/2 because two colours" is always wrong.
 const a=int(2,6),b=a+int(1,4),n=a+b,trials=n*int(5,20);
 let prompt='',answer:string|number='',wrong:(string|number)[]=[],explanation='',visual:Cave7Visual|undefined;
 const choose=(p:string,v:string|number,ws:readonly (string|number)[],e:string)=>{prompt=p;answer=v;wrong=[...ws];explanation=e;};
 // Typed number; real slips first, then nearby values.
 const num=(p:string,v:number,e:string,slips:number[]=[])=>choose(p,round(v),[...slips.map(round),...numericWrong(round(v))],e);
 // Typed fraction; slips are fractions students commonly write instead.
 const fr=(p:string,top:number,bottom:number,e:string,slips:[number,number][]=[])=>choose(p,frac(top,bottom),[...slips.map(([x,y])=>frac(x,y)),frac(top+1,bottom),frac(bottom-top,bottom),frac(top,bottom+top)],e);
 const apparatus=(title:string,app:Extract<Cave7Visual,{kind:'chance'}>['apparatus'],caption:string)=>{visual={kind:'chance',title,apparatus:app,caption};};
 const spinner=(counts:Partial<Record<Colour,number>>,title='Spinner')=>{const wedges=(Object.keys(COLOURS) as Colour[]).flatMap(c=>Array(counts[c]??0).fill(COLOURS[c]) as string[]);apparatus(title,{type:'spinner',wedges},`${wedges.length} equal sections: ${sayList(list(counts))}.`);};
 const bag=(counts:Partial<Record<Colour,number>>,title='Bag of counters')=>{const counters=shuffle((Object.keys(COLOURS) as Colour[]).flatMap(c=>Array(counts[c]??0).fill(COLOURS[c]) as string[]));apparatus(title,{type:'bag',counters},`The bag holds ${sayList(list(counts))} counters. One counter is picked without looking.`);};
 const die=()=>apparatus('Fair die',{type:'die',face:int(1,6)},'A fair six-sided die numbered 1 to 6. Each number is equally likely.');
 const coin=()=>apparatus('Fair coin',{type:'coin'},'A fair coin: heads and tails are equally likely.');
 const freq=(title:string,labels:string[],counts:number[])=>{const total=counts.reduce((s,c)=>s+c,0);apparatus(title,{type:'frequency',labels,counts,total},`${labels.map((l,i)=>`${l}: ${counts[i]}`).join(', ')}.`);};
 const table=(title:string,headers:string[],rows:(string|number)[][])=>{visual={kind:'table',title,headers,rows:rows.map(r=>r.map(String))};};
 const colourBag=()=>{const pool=shuffle(['red','blue','green','yellow'] as Colour[]).slice(0,int(2,4)),counts:Partial<Record<Colour,number>>={};pool.forEach((c,i)=>counts[c]=i===0?int(2,3):int(1,3));return {pool,counts};};

 switch(key){
 // ── Week 1: outcomes and sample spaces (AC9M7P01)
 case 1:{
  if(F){const d=int(0,2);
   if(d===0){const t=int(4,9);choose(`Tiles numbered 1 to ${t} are in a bag and one is picked. List the sample space.`,join(range(t)),[join(range(t-1)),join(range(t+1)),`${t}`],'The sample space lists every possible outcome once.');}
   else if(d===1){die();choose('A fair die is rolled once. List the sample space.','1, 2, 3, 4, 5, 6',['1, 2, 3, 4, 5','6','0, 1, 2, 3, 4, 5, 6'],'A die can land on any whole number from 1 to 6.');}
   else{const {pool,counts}=colourBag();bag(counts);const order=(Object.keys(COLOURS) as Colour[]).filter(c=>pool.includes(c));choose('One counter is picked from this bag. List the sample space of colours.',join(order),[join(order.slice(1)),join(order.flatMap(c=>Array(counts[c]).fill(c))),order[0]],'Each different colour is one outcome; repeated counters do not add new outcomes.');}}
  else if(R){const {pool,counts}=colourBag();bag(counts);const order=(Object.keys(COLOURS) as Colour[]).filter(c=>pool.includes(c)),listed=order.flatMap(c=>Array(counts[c]).fill(c));choose(`A student listed the sample space for one pick as “${join(listed)}”. Type the correct sample space.`,join(order),[join(listed),join(order.slice(1)),order[0]],'The sample space lists each different outcome once, however many counters share that colour.');}
  else if(!alt){const labels=shuffle([...range(int(3,5)),...range(int(2,3))]);table('Spinner sections',['Numbers on the sections'],[[join(labels)]]);num('One spin of a spinner with these section numbers. How many outcomes are in its sample space?',new Set(labels).size,'Count each different number once.',[labels.length]);}
  else{const word=pick(['BANANA','KANGAROO','CHANCE','COOKIE','PAPAYA','LOLLIPOP']),letters=[...new Set(word)];choose(`One letter card is picked at random from the word ${word}. List the sample space.`,join(letters),[join([...word]),join(letters.slice(1)),letters[0]],'List each different letter once.');}
  break;}
 case 2:{
  const events=[['even',(x:number)=>x%2===0],['odd',(x:number)=>x%2===1],['a multiple of 3',(x:number)=>x%3===0]] as const;
  if(F){const t=pick([6,8,10,12]),k=int(2,t-2);if(int(0,1)){const [name,test]=pick(events);num(`One tile is picked from tiles numbered 1 to ${t}. How many outcomes are ${name}?`,range(t).filter(test).length,`List them: ${join(range(t).filter(test))}.`);}else num(`One tile is picked from tiles numbered 1 to ${t}. How many outcomes are greater than ${k}?`,t-k,`The favourable outcomes are ${k+1} to ${t}.`,[t-k+1]);}
  else if(R){const t=pick([6,8,10,12]),k=int(2,t-2);num(`For tiles numbered 1 to ${t}, a student says “greater than ${k}” has ${t-k+1} favourable outcomes, starting at ${k}. How many are there really?`,t-k,`“Greater than ${k}” does not include ${k}: the outcomes are ${k+1} to ${t}.`,[t-k+1]);}
  else if(!alt){const counts={red:int(1,4),blue:int(1,4),green:int(1,4)};bag(counts);num('Mia wins if she does NOT pick a blue counter. How many counters are favourable for Mia?',counts.red+counts.green,`Every counter except the ${counts.blue} blue ones: ${counts.red} + ${counts.green} = ${counts.red+counts.green}.`,[counts.blue,counts.red]);}
  else{const N=int(20,60),m=pick([3,4,5,6]);num(`Raffle tickets are numbered 1 to ${N}. Every multiple of ${m} wins a prize. How many tickets win?`,Math.floor(N/m),`The winners are ${m}, ${2*m}, … up to ${Math.floor(N/m)*m}: ${Math.floor(N/m)} tickets.`,[Math.ceil(N/m),N-Math.floor(N/m)]);}
  break;}
 case 3:{
  if(F){const t=int(5,9),missing=int(1,t),shown=range(t).filter(x=>x!==missing);num(`A spinner has ${t} sections numbered 1 to ${t}. A proposed sample space is ${join(shown)}. Which outcome is missing?`,missing,`Compare with 1 to ${t}: ${missing} is missing.`,[t+1]);}
  else if(R){const dup=int(1,6),listed=[...range(6).slice(0,dup),dup,...range(6).slice(dup)];die();num(`A student’s sample space for one roll of a die is ${join(listed)}. Which outcome is listed twice?`,dup,`Each outcome should appear once; ${dup} appears twice.`,[6]);}
  else if(!alt){const {pool,counts}=colourBag();bag(counts);num('How many different outcomes are in the sample space for one pick from this bag?',pool.length,`The different colours are ${join((Object.keys(COLOURS) as Colour[]).filter(c=>pool.includes(c)))}.`,[Object.values(counts).reduce((s,c)=>s+(c??0),0)]);}
  else{const t=int(4,8);num(`A spinner’s sample space is 1 to ${t}. Two new sections are added, numbered ${t+1} and ${t}. How many outcomes are in the new sample space?`,t+1,`${t} is already an outcome; only ${t+1} is new, giving ${t+1} outcomes.`,[t+2,t]);}
  break;}
 // ── Week 2: assign probabilities
 case 4:{
  if(F){spinner({red:a,blue:b});fr('What is the probability of red on one spin? Give a fraction.',a,n,`${a} of the ${n} equal sections are red: ${frac(a,n)}.`,[[a,b],[1,2]]);}
  else if(R){spinner({red:a,blue:b});fr(`A student says P(red) = ${a}/${b} because there are ${a} red and ${b} blue sections. What is P(red)? Give a fraction.`,a,n,`Divide by the total number of sections, ${n}, not by the number of blue ones.`,[[a,b]]);}
  else if(!alt){const N=pick([50,100,200,250]),k=int(2,10);fr(`A raffle sells ${N} tickets and you buy ${k}. What is the probability you win the one prize? Give a fraction.`,k,N,`${k} winning chances out of ${N} equally likely tickets.`,[[1,N],[k,N-k]]);}
  else{const N=int(20,30),girls=int(8,N-8);fr(`A class has ${N} students and ${girls} are girls. A captain is chosen at random. What is the probability the captain is a boy? Give a fraction.`,N-girls,N,`There are ${N-girls} boys out of ${N} students.`,[[girls,N],[N-girls,girls]]);}
  break;}
 case 5:{
  const r=int(1,5),bl=r+int(1,4)*(int(0,1)?1:-1);const red=Math.max(1,r),blue=Math.max(1,bl===red?red+1:bl);
  if(F){bag({red,blue});choose('Which colour is more likely to be picked? Type red or blue.',red>blue?'Red':'Blue',[red>blue?'Blue':'Red','Equal','Neither'],`There are ${red} red and ${blue} blue counters; more counters means more likely.`);}
  else if(R){bag({red,blue});fr('A student says red and blue each have probability 1/2 because there are two colours. What is the probability of red? Give a fraction.',red,red+blue,`There are ${red} red counters out of ${red+blue}.`,[[1,2],[red,blue]]);}
  else if(!alt){for(;;){const [r1,n1,r2,n2]=[int(1,5),int(6,10),int(1,5),int(6,10)];if(r1*n2===r2*n1)continue;table('Two bags',['Bag','Red counters','Total counters'],[['A',r1,n1],['B',r2,n2]]);const best=r1/n1>r2/n2?'A':'B';choose('Which bag gives the better chance of picking red? Type A or B.',best,[best==='A'?'B':'A','Equal','Neither'],`Compare probabilities: A = ${frac(r1,n1)}, B = ${frac(r2,n2)}. ${best} is larger.`);break;}}
  else{const rr=Math.min(red,blue),bb=Math.max(red,blue)+1;bag({red:rr,blue:bb});num('How many red counters must be added so that red and blue are equally likely?',bb-rr,`Red needs to match blue: ${bb} − ${rr} = ${bb-rr}.`,[bb,rr]);}
  break;}
 case 6:{
  if(F){const y=int(1,3);spinner({red:a,blue:b,yellow:y});fr('What is the probability of NOT landing on red? Give a fraction.',b+y,n+y,`${b} blue + ${y} yellow = ${b+y} of the ${n+y} sections are not red.`,[[a,n+y],[b,n+y]]);}
  else if(R){const p=int(1,4)/10;num(`The chance of rain tomorrow is ${p}. A student says the chance of no rain is also ${p}. What is it? Give a decimal.`,1-p,`Rain and no rain cover every outcome, so they add to 1: 1 − ${p} = ${round(1-p)}.`,[p,0.5]);}
  else if(!alt){const k=int(1,5);die();fr(`What is the probability of NOT rolling a number greater than ${k}? Give a fraction.`,k,6,`Not greater than ${k} means 1 to ${k}: ${k} of 6 outcomes.`,[[6-k,6],[k-1,6]]);}
  else{const N=int(12,30),gr=int(2,N-3);num(`A bag of ${N} counters gives P(green) = ${gr}/${N}. How many counters are NOT green?`,N-gr,`${gr} of the ${N} counters are green, so ${N-gr} are not.`,[gr,N]);}
  break;}
 // ── Week 3: probability representations and fairness
 case 7:{
  if(F){const d=pick([2,4,5,10,20,25]),w=int(1,d-1);num(`Write the probability ${w}/${d} as a decimal.`,w/d,`${w} ÷ ${d} = ${round(w/d)}.`,[Number(`0.${w}`),d/w]);}
  else if(R){for(;;){const d=pick([4,5,20,25]),w=int(1,d-1),bad=Number(`0.${w}${d}`);if(Math.abs(bad-w/d)<1e-9||bad>=1)continue;num(`A student wrote the probability ${w}/${d} as ${bad}. What is it as a decimal?`,w/d,`Divide the numerator by the denominator: ${w} ÷ ${d} = ${round(w/d)}.`,[bad]);break;}}
  else if(!alt){const pct=pick([5,15,25,35,45,55,65,75,85,95]);fr(`The forecast gives a ${pct}% chance of rain. Write this probability as a fraction in simplest form.`,pct,100,`${pct}% = ${pct}/100 = ${frac(pct,100)}.`,[[pct,10]]);}
  else{for(;;){const x=int(10,90)/100,d=pick([4,5,8,10]),w=int(1,d-1);if(Math.abs(x-w/d)<.02)continue;num(`Which is more likely: a probability of ${x} or a probability of ${w}/${d}? Type the larger probability as a decimal.`,Math.max(x,w/d),`${w}/${d} = ${round(w/d)}, so the larger is ${round(Math.max(x,w/d))}.`,[Math.min(x,w/d)]);break;}}
  break;}
 case 8:{
  const p=int(1,4)/10,q=int(1,3)/10;
  if(F){table('Exactly one of A, B or C happens',['Outcome','Probability'],[['A',p],['B',q],['C','?']]);num('What is the missing probability for C?',1-p-q,`The probabilities add to 1: 1 − ${p} − ${q} = ${round(1-p-q)}.`,[p+q]);}
  else if(R){table('Exactly one of A, B or C happens',['Outcome','Probability'],[['A',p],['B',q],['C','?']]);num(`A student added A and B and wrote P(C) = ${round(p+q)}. What is the correct P(C)?`,1-p-q,`All three must add to 1, so subtract: 1 − ${p} − ${q} = ${round(1-p-q)}.`,[p+q]);}
  else if(!alt){const [d1,d2]=shuffle([3,4,5,6]).slice(0,2),top=d1*d2-d2-d1;fr(`A spinner is red, blue or yellow. P(red) = 1/${d1} and P(blue) = 1/${d2}. What is P(yellow)? Give a fraction.`,top,d1*d2,`Use a common denominator of ${d1*d2}: 1 − ${d2}/${d1*d2} − ${d1}/${d1*d2} = ${frac(top,d1*d2)}.`,[[d1+d2,d1*d2],[1,d1+d2]]);}
  else{const w=int(3,6)*10,d=int(1,3)*10;num(`A team’s model gives P(win) = ${w}% and P(draw) = ${d}%. What is P(lose) as a percentage?`,100-w-d,`Win, draw and lose add to 100%: 100 − ${w} − ${d} = ${100-w-d}.`,[w+d,100-w]);}
  break;}
 case 9:{
  if(F){const ra=int(2,6),rb=int(0,2)===0?ra:ra+pick([-1,1,2,3]);spinner({red:ra,blue:Math.max(1,rb)},'Game spinner');const blue=Math.max(1,rb),ans=ra===blue?'Equal':ra>blue?'A':'B';choose('Player A wins on red and player B wins on blue. Who is more likely to win? Type A, B or equal.',ans,['A','B','Equal','Neither'].filter(x=>x!==ans),ra===blue?'Both colours have the same number of equal sections, so the game is fair.':`Red has ${ra} sections and blue has ${blue}; the player with more sections is more likely to win.`);}
  else if(R){spinner({red:a,blue:b},'Game spinner');fr('Player A wins on red and player B wins on blue. A student says the game is fair because each player has one colour. What is player B’s probability of winning? Give a fraction.',b,n,`Blue has ${b} of the ${n} sections, which is more than half.`,[[1,2],[a,n]]);}
  else if(!alt){const ra=int(1,4),rb=ra+2*int(1,3);spinner({red:ra,blue:rb},'Game spinner');num('Player A wins on red and player B wins on blue. How many blue sections must be recoloured red to make the game fair?',(rb-ra)/2,`The total stays ${ra+rb}; each colour needs ${(ra+rb)/2} sections, so recolour ${(rb-ra)/2}.`,[rb-ra,(ra+rb)/2]);}
  else{const k=int(1,2);die();num(`A die game: player A wins on ${k===1?'a 1':'a 1 or 2'}; player B wins on any other number. How many of B’s numbers must be given to A to make the game fair?`,3-k,`A fair game gives each player 3 numbers. A has ${k}, so A needs ${3-k} more.`,[6-2*k,6-k]);}
  break;}
 // ── Week 4: predict frequencies
 case 10:{
  if(F){spinner({red:a,blue:b});num(`About how many red results would you expect in ${trials} spins?`,trials*a/n,`${trials} × ${a}/${n} = ${trials*a/n}. This is an expectation, not a guarantee.`,[trials/2,trials*b/n]);}
  else if(R){spinner({red:a,blue:b});num(`A student predicts ${trials/2} reds in ${trials} spins because red is one of two colours. How many reds should be predicted?`,trials*a/n,`Use the probability ${a}/${n}, not 1/2: ${trials} × ${a}/${n} = ${trials*a/n}.`,[trials/2]);}
  else if(!alt){const m=int(5,30),face=int(1,6);die();num(`A fair die is rolled ${6*m} times. About how many times would you expect to roll a ${face}?`,m,`P(${face}) = 1/6, so expect ${6*m} × 1/6 = ${m}.`,[6*m/2,face*m]);}
  else{const [p,days]=pick([[0.1,40],[0.15,40],[0.2,40],[0.25,40],[0.05,40],[0.1,60],[0.2,60],[0.15,60]] as const);num(`The probability the school bus is late is ${p}. About how many of the next ${days} school days would you expect it to be late?`,p*days,`${days} × ${p} = ${round(p*days)} days.`,[days/2,p*100]);}
  break;}
 case 11:{
  if(F){spinner({red:a,blue:b});fr('In a very long run of spins, what fraction of spins would you expect to be red? Give a fraction.',a,n,`Over many trials the relative frequency is expected to be close to the probability, ${frac(a,n)}.`,[[1,2],[a,b]]);}
  else if(R){const k=int(1,4);die();fr(`A student predicts the relative frequency of rolling a number greater than ${k} is ${k}/6. What should it be? Give a fraction.`,6-k,6,`Greater than ${k} means ${k+1} to 6: ${6-k} outcomes, so ${frac(6-k,6)}.`,[[k,6]]);}
  else if(!alt){const N=pick([4,5,10]),r=int(1,N-1);bag({red:r,blue:N-r});num('Counters are picked and replaced many times. What percentage of picks would you expect to be red?',r/N*100,`P(red) = ${r}/${N} = ${r/N*100}%.`,[r*10,(N-r)/N*100]);}
  else{const s=pick([4,5,8,10]),r=int(1,s-1);spinner({red:r,blue:s-r});num('Predict the relative frequency of red over 1000 spins. Give a decimal.',r/s,`The relative frequency is expected to be near P(red) = ${r}/${s} = ${round(r/s)}.`,[r/1000,(s-r)/s]);}
  break;}
 case 12:{
  const p=pick([[1,4],[1,5],[2,5],[3,10],[3,8],[1,3]] as const),T=p[1]*int(10,40),E=T*p[0]/p[1];
  if(F){table('Model prediction',['Trials','Expected event count'],[[T,E]]);fr('Which probability was used for this prediction? Give a fraction.',E,T,`Expected count ÷ trials = ${E} ÷ ${T} = ${frac(E,T)}.`,[[T,E]]);}
  else if(R){table('Model prediction',['Trials','Expected event count'],[[T,E]]);fr(`A student divided ${T} by ${E} to find the probability. What is the correct probability? Give a fraction.`,E,T,'Probability is a part of the whole, so divide the expected count by the number of trials.',[[T,E]]);}
  else if(!alt){const N=p[1]*int(1,2),Tq=p[1]*int(10,20)*2,Eq=Tq*p[0]/p[1];num(`A bag holds ${N} counters. In ${Tq} picks (replacing each time), red came up about ${Eq} times, as expected. How many red counters are in the bag?`,N*p[0]/p[1],`P(red) ≈ ${Eq}/${Tq} = ${frac(p[0],p[1])}. ${frac(p[0],p[1])} of ${N} counters is ${N*p[0]/p[1]}.`,[Eq,N-N*p[0]/p[1]]);}
  else{const s=p[1]*int(1,2);num(`A spinner with ${s} equal sections is expected to land on red ${E} times in ${T} spins. How many sections are red?`,s*E/T,`P(red) = ${E}/${T} = ${frac(E,T)}, and ${frac(E,T)} of ${s} sections is ${s*E/T}.`,[E,s-s*E/T]);}
  break;}
 // ── Week 5: record and compare experiments (AC9M7P02)
 case 13:{
  const counts=Array.from({length:6},()=>int(4,15)),total=counts.reduce((s,c)=>s+c,0);
  // The plain bar chart shows each count but not the total, which is what these questions ask for.
  const bars=()=>{visual={kind:'frequency',title:'Die results',values:range(6),counts,unit:'Die result'};};
  if(F){bars();num('How many trials were recorded altogether?',total,`Add every frequency: ${counts.join(' + ')} = ${total}.`,[6,total-counts[0]]);}
  else if(R){bars();num('A student says 6 trials were recorded because there are 6 outcomes. How many trials were recorded?',total,`Each trial adds one to a frequency, so add them: ${total}.`,[6]);}
  else if(!alt){freq('Die results',range(6).map(String),counts);const even=counts[1]+counts[3]+counts[5];num('How many trials gave an even number?',even,`Add the frequencies for 2, 4 and 6: ${counts[1]} + ${counts[3]} + ${counts[5]} = ${even}.`,[3,total-even]);}
  else{const red=int(5,20),green=int(5,20),blue=int(5,20),T=red+green+blue;table('Spinner results',['Colour','Count'],[['Red',red],['Green',green],['Blue','?']]);num(`There were ${T} spins altogether. How many blue results were recorded?`,blue,`${T} − ${red} − ${green} = ${blue}.`,[T-red,red+green]);}
  break;}
 case 14:{
  const total=pick([20,25,40,50]),wins=int(3,total-3);
  if(F){table('Completed trials',['Wins','Trials'],[[wins,total]]);fr('What is the observed relative frequency of a win? Give a fraction.',wins,total,`${wins} wins out of ${total} trials: ${frac(wins,total)}.`,[[wins,total-wins]]);}
  else if(R){table('Completed trials',['Wins','Losses'],[[wins,total-wins]]);fr(`A student wrote the relative frequency of a win as ${wins}/${total-wins}. What is the correct relative frequency? Give a fraction.`,wins,total,`Divide by all ${total} trials (wins + losses), not by the losses.`,[[wins,total-wins]]);}
  else if(!alt){const t=pick([20,25,50]),w=int(3,t-3);table('Completed trials',['Wins','Trials'],[[w,t]]);num('Write the relative frequency of a win as a percentage.',w/t*100,`${w} ÷ ${t} × 100 = ${w/t*100}%.`,[w,(t-w)/t*100]);}
  else{const t1=int(2,5)*10,t2=int(2,5)*10,h1=int(5,t1-5),h2=int(5,t2-5);fr(`Class A tossed a coin ${t1} times and got ${h1} heads. Class B tossed it ${t2} times and got ${h2} heads. What is the combined relative frequency of heads? Give a fraction.`,h1+h2,t1+t2,`Combine counts: (${h1} + ${h2}) ÷ (${t1} + ${t2}) = ${frac(h1+h2,t1+t2)}.`,[[h1+h2,2*(t1+t2)]]);}
  break;}
 case 15:{
  if(F){const expected=trials*a/n,delta=int(2,9),observed=expected+delta;spinner({red:a,blue:b});num(`This spinner was spun ${trials} times and landed on red ${observed} times. How many more red results were there than expected?`,delta,`Expected red = ${trials} × ${a}/${n} = ${expected}. ${observed} − ${expected} = ${delta}. Random variation causes differences like this.`,[observed-trials/2,expected]);}
  else if(R){const m=int(5,20),obs=m+int(2,6);die();num(`A student says a die is unfair because a 6 came up ${obs} times in ${6*m} rolls. How many 6s were expected?`,m,`${6*m} × 1/6 = ${m}. A difference of ${obs-m} can happen by chance in a fair die.`,[obs,6*m/2]);}
  else if(!alt){const T=pick([100,200]),H=T/2+int(-12,12)||T/2+5;coin();num(`In ${T} coin tosses there were ${H} heads. How far is the observed relative frequency from 0.5? Give a decimal.`,Math.abs(H/T-.5),`${H} ÷ ${T} = ${round(H/T)}; the gap from 0.5 is ${round(Math.abs(H/T-.5))}.`,[Math.abs(H-T/2)]);}
  else{const E=pick([20,25,50]),O=E+int(1,10);num(`${E} red results were expected and ${O} were observed. By what percentage of the expected count is the observed count higher?`,(O-E)/E*100,`The difference is ${O-E}. ${O-E} ÷ ${E} × 100 = ${round((O-E)/E*100)}%.`,[O-E,(O-E)/O*100]);}
  break;}
 // ── Week 6: digital simulations
 case 16:{
  if(F){choose(`A simulation needs P(red) = ${a}/${n}. It picks random integers 1 to ${n}, all equally likely. Which assignment works?`,`Assign ${a} integers to red and ${b} to blue.`,[`Assign 1 integer to red and 1 to blue, ignoring the rest.`,`Assign all ${n} integers to red.`,`Assign ${b} integers to red and ${a} to blue.`],'The share of equally likely integers given to an event must match its probability.');}
  else if(R){const m=pick([3,5,6]),h=int(1,m-1);if(2*h===m)break;fr(`A student simulates a fair coin with random integers 1 to ${m}: ${h===1?'1 means':`1 to ${h} mean`} heads and the rest mean tails. What probability of heads does this simulation give? Give a fraction.`,h,m,`${h} of the ${m} integers mean heads: ${frac(h,m)}, not 1/2, so the simulation is not fair.`,[[1,2],[m-h,m]]);}
  else if(!alt){const [pct,N]=pick([[20,50],[30,50],[40,10],[25,20],[35,20],[10,40],[15,20],[60,50]] as const);num(`To simulate a ${pct}% chance of rain with random integers 1 to ${N}, how many integers should mean rain?`,pct*N/100,`${pct}% of ${N} = ${pct*N/100}.`,[pct,N-pct*N/100]);}
  else{const d=pick([4,5,8]),k=int(1,d-1),m=int(2,4);num(`To model a probability of ${k}/${d} with a spinner of ${d*m} equal sections, how many sections should mean a win?`,k*m,`${k}/${d} of ${d*m} = ${k*m} sections.`,[k,d*m-k*m]);}
  break;}
 case 17:{
  if(F){fr(`A program picks an integer from 1 to ${n}, all equally likely, and records a win when it is at most ${a}. What is the probability of a win? Give a fraction.`,a,n,`The winning integers are 1 to ${a}: ${a} of ${n}.`,[[a-1,n],[a,b]]);}
  else if(R){fr(`A program records a win when an integer from 1 to ${n} is less than ${a}. A student says P(win) = ${a}/${n}. What is it really? Give a fraction.`,a-1,n,`“Less than ${a}” means 1 to ${a-1}, which is ${a-1} integers.`,[[a,n]]);}
  else if(!alt){const p=int(5,95)/100;num(`A program picks a decimal between 0 and 1 at random and records a win when it is less than ${p}. What is P(win) as a percentage?`,Math.round(p*100),`Values below ${p} make up ${Math.round(p*100)}% of the interval from 0 to 1.`,[100-Math.round(p*100)]);}
  else{const m=pick([4,5,10,20,25]);num(`A program picks an integer from 1 to 100 and records a win for multiples of ${m}. What is P(win) as a decimal?`,Math.floor(100/m)/100,`There are ${Math.floor(100/m)} multiples of ${m} up to 100: ${Math.floor(100/m)}/100 = ${Math.floor(100/m)/100}.`,[m/100,1/m+.01]);}
  break;}
 case 18:{
  if(F){const total=40+int(0,8)*10,wins=int(5,total-5);table('Saved simulation results',['Wins','Losses'],[[wins,total-wins]]);fr('What is the observed winning share of this simulation? Give a fraction.',wins,total,`${wins} wins out of ${wins} + ${total-wins} = ${total} trials.`,[[wins,total-wins]]);}
  else if(R){const T=6*int(5,15),counts=Array.from({length:6},()=>0);for(let i=0;i<T;i++)counts[int(0,5)]++;const top=counts.indexOf(Math.max(...counts))+1;freq(`Simulated die: ${T} rolls`,range(6).map(String),counts);num(`A student says this die is biased towards ${top} because ${top} came up most often. How many times would each number be expected in ${T} rolls of a fair die?`,T/6,`${T} × 1/6 = ${T/6}. Counts naturally vary around this.`,[Math.max(...counts),T/2]);}
  else if(!alt){const [p,T]=pick([[0.25,500],[0.2,400],[0.4,300],[0.3,600],[0.15,200]] as const);num(`A simulation ran ${T} trials. The predicted probability of a win is ${p}. How many wins were predicted?`,p*T,`${T} × ${p} = ${p*T}.`,[T/2,p*100]);}
  else{const w1=int(15,35),w2=int(15,35);table('Two simulation runs',['Run','Wins','Trials'],[['1',w1,100],['2',w2,100]]);num('Combine the two runs. What is the overall relative frequency of a win? Give a decimal.',(w1+w2)/200,`(${w1} + ${w2}) ÷ 200 = ${round((w1+w2)/200)}.`,[(w1+w2)/100,w1/100]);}
  break;}
 // ── Week 7: variation and larger samples
 case 19:{
  if(F){const rows=[['Two runs use the same fair coin but give different head counts.','Random variation can change counts without changing the coin’s probability.'],['A fair coin gives 28 heads in 50 tosses.','That difference from 25 expected heads can happen by chance.'],['A fair coin gives exactly 25 heads in one run of 50 tosses.','Another 50-toss run does not have to give exactly 25 heads.'],['One run gives more heads than tails.','The next run does not have to cancel that out.'],['An experiment is repeated with the same model and number of trials.','The expected count stays the same, but observed counts can differ.']] as const,row=pick(rows);choose(`${row[0]} What do these results show?`,row[1],['Every fair short run must be exactly balanced.','These results decide the next outcome.','The next run must give the same counts.'],'Expected frequencies describe a model; actual runs vary.');}
  else if(R){const h1=int(18,32),h2=h1+int(2,8);num(`Two runs of 50 tosses of the same coin gave ${h1} and ${h2} heads. What is the difference between their relative frequencies? Give a decimal.`,(h2-h1)/50,`${h2}/50 − ${h1}/50 = ${h2-h1}/50 = ${round((h2-h1)/50)}. Runs vary even when the coin does not change.`,[h2-h1,(h2-h1)/100]);}
  else{const groups=['A','B','C','D','E'],heads=groups.map(()=>int(6,14));let far=heads.map(h=>Math.abs(h-10));if(far.filter(x=>x===Math.max(...far)).length>1){heads[int(0,4)]=pick([4,16]);far=heads.map(h=>Math.abs(h-10));}table('Five groups each toss a coin 20 times',['Group','Heads'],groups.map((x,i)=>[x,heads[i]]));
   if(!alt)num('What is the combined relative frequency of heads for all five groups? Give a decimal.',heads.reduce((s,h)=>s+h,0)/100,`Total heads ${heads.reduce((s,h)=>s+h,0)} out of 100 tosses.`,[heads.reduce((s,h)=>s+h,0)/20]);
   else{const g2=groups[far.indexOf(Math.max(...far))];choose('Which group’s result was furthest from the expected 10 heads? Type the group letter.',g2,groups.filter(x=>x!==g2),`Group ${g2} was ${Math.max(...far)} away from 10, the largest difference.`);}}
  break;}
 case 20:{
  // Counts drift around the probability, with smaller runs drifting further.
  const p=pick([0.5,0.5,0.3,0.4,0.2]),runs=[10,50,100,500,1000],spread=[3,5,6,12,15];
  const counts=runs.map((t,i)=>Math.min(t,Math.max(0,Math.round(t*p)+int(1,spread[i])*(int(0,1)?1:-1))));
  if(R){const gap=(i:number)=>Math.abs(counts[i]/runs[i]-p),best=Math.min(...runs.map((_,i)=>gap(i)));if(runs.filter((_,i)=>Math.abs(gap(i)-best)<1e-9).length>1)counts[4]=Math.round(1000*p);}
  const rf=counts.map((c,i)=>c/runs[i]),event=p===0.5?'heads':'red',Event=event[0].toUpperCase()+event.slice(1);
  table(`Relative frequency of ${event} as trials grow`,['Trials',`${Event} count`],runs.map((t,i)=>[t,counts[i]]));
  if(F){const i=int(1,4);num(`What is the relative frequency of ${event} for the ${runs[i]}-trial run? Give a decimal.`,rf[i],`${counts[i]} ÷ ${runs[i]} = ${round(rf[i])}.`,[counts[i]/100,1-rf[i]]);}
  else if(R){const gaps=rf.map(x=>Math.abs(x-p)),best=runs[gaps.indexOf(Math.min(...gaps))];num(`The probability of ${event} is ${p}. A student says the 10-trial run proves otherwise. Which run has a relative frequency closest to ${p}? Type its number of trials.`,best,`Relative frequencies: ${rf.map((x,i)=>`${runs[i]}: ${round(x)}`).join(', ')}. Larger runs usually, but not always, settle closer.`,[10,best===1000?500:1000]);}
  else if(!alt)num(`As the number of trials grows, the relative frequency settles. Estimate the probability of ${event} to one decimal place.`,p,`The large runs settle near ${p}: ${round(rf[3])} at 500 trials and ${round(rf[4])} at 1000.`,[round(rf[0]),1-p]);
  else num('By how much did the relative frequency change from the 10-trial run to the 1000-trial run? Give a decimal.',Math.abs(rf[4]-rf[0]),`${round(rf[0])} at 10 trials and ${round(rf[4])} at 1000: a change of ${round(Math.abs(rf[4]-rf[0]))}.`,[Math.abs(counts[4]-counts[0])]);
  break;}
 case 21:{
  const k=int(3,7);
  if(F){const d=int(0,2);
   if(d===0){coin();fr(`A fair coin has landed heads ${k} times in a row. What is the probability of tails on the next toss? Give a fraction.`,1,2,'Each toss is independent; the coin has no memory, so P(tails) is still 1/2.',[[k,k+1],[1,k]]);}
   else if(d===1){die();fr(`A fair die has not shown a 6 in the last ${k} rolls. What is the probability of a 6 on the next roll? Give a fraction.`,1,6,'Past rolls do not change the next roll: P(6) is still 1/6.',[[k,6],[1,6-k>0?6-k:2]]);}
   else{spinner({red:a,blue:b});fr(`This spinner has landed on red ${k} times in a row. What is the probability of red on the next spin? Give a fraction.`,a,n,`The spinner has not changed, so P(red) is still ${frac(a,n)}.`,[[a-1,n],[1,2]]);}}
  else if(R){spinner({red:a,blue:b});fr(`Jo says that after ${k} reds in a row red is “used up”, so P(red) is now ${frac(a-1,n)}. What is P(red) on the next spin? Give a fraction.`,a,n,`Spins are independent; the sections have not changed, so P(red) = ${frac(a,n)}.`,[[a-1,n]]);}
  else if(!alt){const N=pick([20,30,40,45,50]),ball=int(1,N);fr(`A lottery draws one ball from ${N} numbered balls each week. Ball ${ball} was drawn last week. What is the probability it is drawn this week? Give a fraction.`,1,N,`Every ball is equally likely each week: 1/${N}.`,[[1,N-1],[0,N]]);}
  else{const m=int(5,20);die();num(`A fair die has not shown a 6 in the last ${k} rolls. How many 6s would you expect in the next ${6*m} rolls?`,m,`P(6) is still 1/6: ${6*m} × 1/6 = ${m}. A 6 is not “due”.`,[m+k,6*m/2]);}
  break;}
 // ── Week 8: investigate and report
 case 22:{
  if(F){const rows=[['A chance investigation needs an observed probability for a spinner event.','Define the event and record every trial under the same procedure.'],['A simulation stops as soon as its first win occurs.','Set the number of trials in advance and record wins and losses.'],['A learner changes the spinner after every loss.','Keep the probability model fixed while investigating it.'],['Two people count “success” differently in one investigation.','Agree on one event definition before combining records.'],['Only favourable results were saved from a run.','Record the total number of trials as well as the event count.']] as const,row=pick(rows);choose(`${row[0]} What is the best next step?`,row[1],['Keep only results that match the prediction.','Assume the next trial must repair earlier results.','Replace every observed count with its expected value.'],'A consistent event, procedure and complete record make the comparison meaningful.');}
  else if(R){const rows=[['tosses a coin 10 times and gets 7 heads','Ten tosses is too few; repeat many more trials before judging.'],['records only the spins that land on red','Record every spin, so the total number of trials is known.'],['uses a different spinner for each group of trials','Use the same spinner for every trial.'],['stops the experiment as soon as the results look right','Decide the number of trials before starting.']] as const,row=pick(rows);choose(`To test whether a coin or spinner is fair, a student ${row[0]}. What is the main problem?`,row[1],[...rows.filter(r=>r!==row).map(r=>r[1] as string).slice(0,2),'There is no problem; one run proves the result.'],'Fair tests use one consistent device, a planned number of trials and a complete record.');}
  else if(!alt){const kk=int(10,50);die();num(`To test a die, you want each number to be expected ${kk} times. How many rolls do you need?`,6*kk,`Each number is expected 1/6 of the time, so roll 6 × ${kk} = ${6*kk} times.`,[kk,kk*3]);}
  else{const d=pick([4,5,8,10]),E=int(5,30);num(`A spinner is claimed to have P(win) = 1/${d}. How many spins are needed to expect ${E} wins?`,d*E,`Expected wins = spins ÷ ${d}, so spins = ${E} × ${d} = ${d*E}.`,[E,E+d]);}
  break;}
 case 23:{
  const pA=int(2,6)/10,pB=round(pA+pick([-0.2,-0.1,0.1,0.2])),T=pick([100,200,400]),near=int(0,1)?pA:pB,W=Math.round(T*near)+int(-4,4);
  table('Two models and the recorded results',['Item','Value'],[['Model A: P(win)',pA],['Model B: P(win)',pB],['Observed wins',W],['Trials',T]]);
  if(F){const closer=Math.abs(W/T-pA)<Math.abs(W/T-pB)?'A':'B';choose('Which model is closer to the observed results? Type A or B.',closer,[closer==='A'?'B':'A','Equal','Neither'],`Observed share ${W}/${T} = ${round(W/T)}. It is closer to Model ${closer}.`);}
  else if(R)num('How far is the observed relative frequency from Model A’s probability? Give a decimal.',Math.abs(W/T-pA),`${W} ÷ ${T} = ${round(W/T)}; the gap from ${pA} is ${round(Math.abs(W/T-pA))}.`,[Math.abs(W-pA*T)]);
  else if(!alt)num(`Using Model A, how many wins were expected in ${T} trials?`,pA*T,`${T} × ${pA} = ${round(pA*T)}.`,[W,pB*T]);
  else num('What is the difference between the observed wins and Model B’s predicted wins?',Math.abs(W-pB*T),`Model B predicts ${round(pB*T)} wins; observed ${W}. Difference = ${round(Math.abs(W-pB*T))}.`,[Math.abs(W-pA*T)]);
  break;}
 case 24:{
  const T=100*int(2,8),H=T/2+int(1,12)*(int(0,1)?1:-1);
  if(F){table('Fair-coin simulation',['Heads','Tosses'],[[H,T]]);choose('Which report keeps the observation separate from the prediction?',`Observed heads: ${H}/${T}; predicted probability: 1/2. The difference can be random variation.`,[`The predicted probability was ${H}/${T} because that is what happened.`,`There were exactly ${T/2} heads, whatever the saved results say.`,'The coin is certainly unfair because the count is not exactly half.'],'Report the actual count and trials, then compare with the model without claiming certainty.');}
  else if(R){coin();table('Fair-coin simulation',['Heads','Tosses'],[[H,T]]);num('Write the observed relative frequency of heads as a decimal.',H/T,`${H} ÷ ${T} = ${round(H/T)}, close to the predicted 0.5.`,[0.5,H/100]);}
  else if(!alt){const rf=pick([0.47,0.48,0.52,0.53,0.49,0.51]);num(`A report says the observed relative frequency of heads was ${rf} in ${T} tosses. How many heads were observed?`,Math.round(rf*T),`${rf} × ${T} = ${Math.round(rf*T)}.`,[T/2,rf*100]);}
  else{const HH=T/2+int(2,15);num(`The prediction was 1/2. In ${T} tosses there were ${HH} heads. How many more heads were there than predicted?`,HH-T/2,`Predicted ${T/2}; observed ${HH}. ${HH} − ${T/2} = ${HH-T/2}.`,[HH,T/2]);}
  break;}
 }
 // A coin simulated by an odd number of integers can't be split evenly; fall back to the fluency task's partner.
 if(!prompt){const m=5,h=2;fr(`A student simulates a fair coin with random integers 1 to ${m}: 1 to ${h} mean heads and the rest mean tails. What probability of heads does this simulation give? Give a fraction.`,h,m,`${h} of the ${m} integers mean heads: ${frac(h,m)}, not 1/2.`,[[1,2],[m-h,m]]);}
 return makeQuestion({realm:'chance',week,lesson,seed,role,prompt,answer,wrong,explanation,idea:g.idea,visual});
}
