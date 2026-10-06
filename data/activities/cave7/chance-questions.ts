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
   if(d===0){const a=int(3,15),b=a+int(11,25);num(`Tiles numbered ${a} to ${b} are in a bag and one is picked. How many outcomes are in the sample space?`,b-a+1,`Count from ${a} to ${b}, including both ends: ${b} − ${a} + 1 = ${b-a+1}. Subtracting alone misses one tile.`,[b-a,b]);}
   else if(d===1){const kinds=shuffle(range(12)).slice(0,int(3,4)).sort((x,y)=>x-y),faces=[...kinds,...Array.from({length:6-kinds.length},()=>pick(kinds))].sort((x,y)=>x-y);table('Faces of a special die',['Faces'],[[join(faces)]]);choose('This special die is rolled once. List the sample space.',join(kinds),[join(faces),join(kinds.slice(1)),'1, 2, 3, 4, 5, 6'],'Each different number on the faces is one outcome; repeated faces do not add new outcomes.');}
   else{const {pool,counts}=colourBag();bag(counts);const order=(Object.keys(COLOURS) as Colour[]).filter(c=>pool.includes(c));choose('One counter is picked from this bag. List the sample space of colours.',join(order),[join(order.slice(1)),join(order.flatMap(c=>Array(counts[c]).fill(c))),order[0]],'Each different colour is one outcome; repeated counters do not add new outcomes.');}}
  else if(R){if(int(0,1)){const a=int(3,15),b=a+int(11,25);num(`Tiles are numbered ${a} to ${b}. A student says there are ${b-a} outcomes because ${b} − ${a} = ${b-a}. How many outcomes are there really?`,b-a+1,`${b} − ${a} counts the gaps between tiles, not the tiles. Both ends count: ${b} − ${a} + 1 = ${b-a+1}.`,[b-a,b]);}
   else{const {pool,counts}=colourBag();bag(counts);const order=(Object.keys(COLOURS) as Colour[]).filter(c=>pool.includes(c)),listed=order.flatMap(c=>Array(counts[c]).fill(c));choose(`A student listed the sample space for one pick as “${join(listed)}”. Type the correct sample space.`,join(order),[join(listed),join(order.slice(1)),order[0]],'The sample space lists each different outcome once, however many counters share that colour.');}}
  else if(!alt){const n=int(7,12),labels=shuffle([...range(n),...Array.from({length:int(3,5)},()=>int(1,n))]);table('Spinner sections',['Numbers on the sections'],[[join(labels)]]);num(`One spin of a spinner with these ${labels.length} section numbers. How many outcomes are in its sample space?`,n,'Count each different number once.',[labels.length]);}
  else{const word=pick(['MISSISSIPPI','BOOKKEEPER','KANGAROO','COMMITTEE','ASSESSMENT','BALLOON','LOLLIPOP','PAPAYA']),letters=[...new Set(word)];choose(`One letter card is picked at random from the word ${word}. List the sample space.`,join(letters),[join([...word]),join(letters.slice(1)),letters[0]],'List each different letter once.');}
  break;}
 case 2:{
  const events=[['even',(x:number)=>x%2===0],['odd',(x:number)=>x%2===1],['a multiple of 3',(x:number)=>x%3===0],['a multiple of 4',(x:number)=>x%4===0],['a multiple of 5',(x:number)=>x%5===0],['a square number',(x:number)=>Number.isInteger(Math.sqrt(x))],['a prime number',(x:number)=>x>1&&range(x-1).slice(1).every(d=>x%d!==0)]] as const;
  if(F){const t=pick([20,24,30,36,40,50]),k=int(5,t-5);if(int(0,2)){const [name,test]=pick(events);num(`One tile is picked from tiles numbered 1 to ${t}. How many outcomes are ${name}?`,range(t).filter(test).length,`List them: ${join(range(t).filter(test))}.`);}else num(`One tile is picked from tiles numbered 1 to ${t}. How many outcomes are greater than ${k}?`,t-k,`The favourable outcomes are ${k+1} to ${t}: ${t} − ${k} = ${t-k}.`,[t-k+1]);}
  else if(R){const t=pick([20,30,40,50]),k=int(5,t-5);num(`For tiles numbered 1 to ${t}, a student says “greater than ${k}” has ${t-k+1} favourable outcomes, starting at ${k}. How many are there really?`,t-k,`“Greater than ${k}” does not include ${k}: the outcomes are ${k+1} to ${t}, which is ${t-k}.`,[t-k+1]);}
  else if(!alt){const counts={red:int(2,6),blue:int(2,6),green:int(2,6)};bag(counts);num('Mia wins if she does NOT pick a blue counter. How many counters are favourable for Mia?',counts.red+counts.green,`Every counter except the ${counts.blue} blue ones: ${counts.red} + ${counts.green} = ${counts.red+counts.green}.`,[counts.blue,counts.red]);}
  else{const N=int(40,120),m=pick([3,4,5,6,7,8]);num(`Raffle tickets are numbered 1 to ${N}. Every multiple of ${m} wins a prize. How many tickets win?`,Math.floor(N/m),`The winners are ${m}, ${2*m}, … up to ${Math.floor(N/m)*m}: ${N} ÷ ${m} = ${round(N/m)}, so ${Math.floor(N/m)} tickets.`,[Math.ceil(N/m),N-Math.floor(N/m)]);}
  break;}
 case 3:{
  if(F){const a=int(1,12),b=a+int(9,15),missing=int(a,b),shown=range(b).filter(x=>x>=a&&x!==missing);num(`A spinner has sections numbered ${a} to ${b}. A proposed sample space is ${join(shown)}. Which outcome is missing?`,missing,`Count up from ${a} to ${b}: ${missing} is missing.`,[b+1]);}
  else if(R){const t=int(10,15),dup=int(1,t),listed=[...range(t).slice(0,dup),dup,...range(t).slice(dup)];num(`One tile is picked from tiles numbered 1 to ${t}. A student’s sample space is ${join(listed)}. Which outcome is listed twice?`,dup,`Each outcome should appear once; ${dup} appears twice.`,[t]);}
  else if(!alt){const {pool,counts}=colourBag();bag(counts);num('How many different outcomes are in the sample space for one pick from this bag?',pool.length,`The different colours are ${join((Object.keys(COLOURS) as Colour[]).filter(c=>pool.includes(c)))}.`,[Object.values(counts).reduce((s,c)=>s+(c??0),0)]);}
  else{const t=int(10,20);num(`A spinner’s sample space is 1 to ${t}. Three new sections are added, numbered ${t+1}, ${t} and ${t+2}. How many outcomes are in the new sample space?`,t+2,`${t} is already an outcome; only ${t+1} and ${t+2} are new, giving ${t+2} outcomes.`,[t+3,t]);}
  break;}
 // ── Week 2: assign probabilities
 case 4:{
  if(F){spinner({red:a,blue:b});fr('What is the probability of red on one spin? Give a fraction.',a,n,`${a} of the ${n} equal sections are red: ${frac(a,n)}.`,[[a,b],[1,2]]);}
  else if(R){spinner({red:a,blue:b});fr(`A student says P(red) = ${a}/${b} because there are ${a} red and ${b} blue sections. What is P(red)? Give a fraction.`,a,n,`Divide by the total number of sections, ${n}, not by the number of blue ones.`,[[a,b]]);}
  else if(!alt){const N=pick([50,100,200,250]),k=int(2,10);fr(`A raffle sells ${N} tickets and you buy ${k}. What is the probability you win the one prize? Give a fraction.`,k,N,`${k} winning chances out of ${N} equally likely tickets.`,[[1,N],[k,N-k]]);}
  else{const N=int(20,30),girls=int(8,N-8);fr(`A class has ${N} students and ${girls} are girls. A captain is chosen at random. What is the probability the captain is a boy? Give a fraction.`,N-girls,N,`There are ${N-girls} boys out of ${N} students.`,[[girls,N],[N-girls,girls]]);}
  break;}
 case 5:{
  const red=int(3,9),blue=pick([-3,-2,-1,1,2,3].map(d=>red+d).filter(x=>x>=2)),green=int(1,4);
  if(F){bag({red,blue,green});choose('Which colour is more likely to be picked? Type red or blue.',red>blue?'Red':'Blue',[red>blue?'Blue':'Red','Equal','Neither'],`There are ${red} red and ${blue} blue counters; the colour with more counters is more likely.`);}
  else if(R){bag({red,blue,green});fr('A student says each colour is equally likely because each colour is one outcome. What is the probability of red? Give a fraction.',red,red+blue+green,`There are ${red} red counters out of ${red+blue+green} altogether.`,[[1,3],[red,blue+green]]);}
  else if(!alt){for(;;){const [r1,n1,r2,n2]=[int(2,9),int(10,20),int(2,9),int(10,20)];if(r1*n2===r2*n1)continue;table('Two bags',['Bag','Red counters','Total counters'],[['A',r1,n1],['B',r2,n2]]);const best=r1/n1>r2/n2?'A':'B';choose('Which bag gives the better chance of picking red? Type A or B.',best,[best==='A'?'B':'A','Equal','Neither'],`Compare probabilities: A = ${frac(r1,n1)}, B = ${frac(r2,n2)}. ${best} is larger.`);break;}}
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
  if(F){const d=pick([8,20,25,40,50]),w=pick(range(d-1).filter(x=>x*2!==d));num(`Write the probability ${w}/${d} as a decimal.`,w/d,`${w} ÷ ${d} = ${round(w/d)}.`,[Number(`0.${w}`),d/w]);}
  else if(R){for(;;){const d=pick([8,20,25,40,50]),w=int(1,d-1),bad=Number(`0.${w}${d}`);if(Math.abs(bad-w/d)<1e-9||bad>=1)continue;num(`A student wrote the probability ${w}/${d} as ${bad}. What is it as a decimal?`,w/d,`Divide the numerator by the denominator: ${w} ÷ ${d} = ${round(w/d)}.`,[bad]);break;}}
  else if(!alt){const pct=pick([5,15,25,35,45,55,65,75,85,95]);fr(`The forecast gives a ${pct}% chance of rain. Write this probability as a fraction in simplest form.`,pct,100,`${pct}% = ${pct}/100 = ${frac(pct,100)}.`,[[pct,10]]);}
  else{for(;;){const x=int(10,90)/100,d=pick([4,5,8,10]),w=int(1,d-1);if(Math.abs(x-w/d)<.02)continue;num(`Which is more likely: a probability of ${x} or a probability of ${w}/${d}? Type the larger probability as a decimal.`,Math.max(x,w/d),`${w}/${d} = ${round(w/d)}, so the larger is ${round(Math.max(x,w/d))}.`,[Math.min(x,w/d)]);break;}}
  break;}
 case 8:{
  const p=int(5,30)/100,q=int(5,30)/100,r3=int(5,25)/100,known=round(p+q+r3),model=()=>table('Exactly one of A, B, C or D happens',['Outcome','Probability'],[['A',p],['B',q],['C',r3],['D','?']]);
  if(F){model();num('What is the missing probability for D?',1-known,`The probabilities add to 1: 1 − ${p} − ${q} − ${r3} = ${round(1-known)}.`,[known]);}
  else if(R){model();num(`A student added A, B and C and wrote P(D) = ${known}. What is the correct P(D)?`,1-known,`All four must add to 1, so subtract: 1 − ${known} = ${round(1-known)}.`,[known]);}
  else if(!alt){const [d1,d2]=shuffle([3,4,5,6,8,10]).slice(0,2),top=d1*d2-d2-d1;fr(`A spinner is red, blue or yellow. P(red) = 1/${d1} and P(blue) = 1/${d2}. What is P(yellow)? Give a fraction.`,top,d1*d2,`Use a common denominator of ${d1*d2}: 1 − ${d2}/${d1*d2} − ${d1}/${d1*d2} = ${frac(top,d1*d2)}.`,[[d1+d2,d1*d2],[1,d1+d2]]);}
  else{const w=int(3,6)*10,d=int(1,3)*10;num(`A team’s model gives P(win) = ${w}% and P(draw) = ${d}%. What is P(lose) as a percentage?`,100-w-d,`Win, draw and lose add to 100%: 100 − ${w} − ${d} = ${100-w-d}.`,[w+d,100-w]);}
  break;}
 case 9:{
  if(F){const ra=int(4,8),rb=int(0,2)===0?ra:ra+pick([-2,-1,1,2,3]);spinner({red:ra,blue:Math.max(1,rb)},'Game spinner');const blue=Math.max(1,rb),ans=ra===blue?'Equal':ra>blue?'A':'B';choose('Player A wins on red and player B wins on blue. Who is more likely to win? Type A, B or equal.',ans,['A','B','Equal','Neither'].filter(x=>x!==ans),ra===blue?'Both colours have the same number of equal sections, so the game is fair.':`Red has ${ra} sections and blue has ${blue}; the player with more sections is more likely to win.`);}
  else if(R){spinner({red:a,blue:b},'Game spinner');fr('Player A wins on red and player B wins on blue. A student says the game is fair because each player has one colour. What is player B’s probability of winning? Give a fraction.',b,n,`Blue has ${b} of the ${n} sections, which is more than half.`,[[1,2],[a,n]]);}
  else if(!alt){const ra=int(2,5),rb=ra+2*int(1,4);spinner({red:ra,blue:rb},'Game spinner');num('Player A wins on red and player B wins on blue. How many blue sections must be recoloured red to make the game fair?',(rb-ra)/2,`The total stays ${ra+rb}; each colour needs ${(ra+rb)/2} sections, so recolour ${(rb-ra)/2}.`,[rb-ra,(ra+rb)/2]);}
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
  else if(!alt){const N=pick([10,16,20]),r=int(2,N-2);bag({red:r,blue:N-r});num('Counters are picked and replaced many times. What percentage of picks would you expect to be red?',r/N*100,`P(red) = ${r}/${N} = ${r/N*100}%.`,[r*10,(N-r)/N*100]);}
  else{const s=pick([8,10,12,16]),r=int(1,s-1);spinner({red:r,blue:s-r});num('Predict the relative frequency of red over 1000 spins. Give a decimal.',r/s,`The relative frequency is expected to be near P(red) = ${r}/${s} = ${round(r/s)}.`,[r/1000,(s-r)/s]);}
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
  if(F){spinner({red:a,blue:b},'Spinner to simulate');choose(`A simulation of this spinner needs P(red) = ${a}/${n}. It picks random integers 1 to ${n}, all equally likely. Which assignment works?`,`Assign ${a} integers to red and ${b} to blue.`,[`Assign 1 integer to red and 1 to blue, ignoring the rest.`,`Assign all ${n} integers to red.`,`Assign ${b} integers to red and ${a} to blue.`],`The spinner has ${a} red sections out of ${n}, so P(red) = ${a}/${n}. There are ${n} equally likely integers, so ${a} of them should mean red and the other ${b} should mean blue. For example, 1 to ${a} means red and ${a+1} to ${n} means blue.`);}
  else if(R){const m=pick([3,5,6]),h=int(1,m-1);if(2*h===m)break;fr(`A student simulates a fair coin with random integers 1 to ${m}: ${h===1?'1 means':`1 to ${h} mean`} heads and the rest mean tails. What probability of heads does this simulation give? Give a fraction.`,h,m,`${h} of the ${m} integers mean heads: ${frac(h,m)}, not 1/2, so the simulation is not fair.`,[[1,2],[m-h,m]]);}
  else if(!alt){const [pct,N]=pick([[20,50],[30,50],[40,10],[25,20],[35,20],[10,40],[15,20],[60,50]] as const);num(`To simulate a ${pct}% chance of rain with random integers 1 to ${N}, how many integers should mean rain?`,pct*N/100,`${pct}% means ${pct} out of every 100. Of ${N} integers, ${pct}% is ${pct}/100 × ${N} = ${pct*N/100}. So ${pct*N/100} integers mean rain and ${N-pct*N/100} mean no rain.`,[pct,N-pct*N/100]);}
  else{const d=pick([4,5,8]),k=int(1,d-1),m=int(2,4);num(`To model a probability of ${k}/${d} with a spinner of ${d*m} equal sections, how many sections should mean a win?`,k*m,`${k}/${d} of the sections should win. ${d*m} ÷ ${d} = ${m}, and ${m} × ${k} = ${k*m} sections.`,[k,d*m-k*m]);}
  break;}
 case 17:{
  if(F||R)visual={kind:'formula',title:'Simulation rule',formula:`Win if the number is ${F?'at most':'less than'} ${a}`,meaning:`The program picks a whole number from 1 to ${n}. Every number is equally likely.`};
  if(F){fr(`A program picks an integer from 1 to ${n}, all equally likely, and records a win when it is at most ${a}. What is the probability of a win? Give a fraction.`,a,n,`“At most ${a}” means ${a} or less, so the winning integers are 1 to ${a}. That is ${a} winning integers out of ${n} equally likely ones, so P(win) = ${frac(a,n)}.`,[[a-1,n],[a,b]]);}
  else if(R){fr(`A program records a win when an integer from 1 to ${n} is less than ${a}. A student says P(win) = ${a}/${n}. What is it really? Give a fraction.`,a-1,n,`“Less than ${a}” does not include ${a}, so the winning integers are 1 to ${a-1}. That is ${a-1} out of ${n}, so P(win) = ${frac(a-1,n)}.`,[[a,n]]);}
  else if(!alt){const p=int(5,95)/100;num(`A program picks a decimal between 0 and 1 at random and records a win when it is less than ${p}. What is P(win) as a percentage?`,Math.round(p*100),`The decimal is equally likely to be anywhere from 0 to 1. Values less than ${p} take up ${p} of that interval, which is ${Math.round(p*100)}%.`,[100-Math.round(p*100)]);}
  else{const m=pick([4,5,10,20,25]);num(`A program picks an integer from 1 to 100 and records a win for multiples of ${m}. What is P(win) as a decimal?`,Math.floor(100/m)/100,`The multiples of ${m} up to 100 are ${m}, ${2*m}, … ${Math.floor(100/m)*m}. There are 100 ÷ ${m} = ${Math.floor(100/m)} of them, so P(win) = ${Math.floor(100/m)}/100 = ${Math.floor(100/m)/100}.`,[m/100,1/m+.01]);}
  break;}
 case 18:{
  if(F){const total=40+int(0,8)*10,wins=int(5,total-5);table('Saved simulation results',['Wins','Losses'],[[wins,total-wins]]);fr('What is the observed winning share of this simulation? Give a fraction.',wins,total,`First find the number of trials: ${wins} wins + ${total-wins} losses = ${total}. The observed share of wins is wins ÷ trials = ${wins}/${total}${frac(wins,total)!==`${wins}/${total}`?` = ${frac(wins,total)}`:''}.`,[[wins,total-wins]]);}
  else if(R){const T=6*int(5,15),counts=Array.from({length:6},()=>0);for(let i=0;i<T;i++)counts[int(0,5)]++;const top=counts.indexOf(Math.max(...counts))+1;freq(`Simulated die: ${T} rolls`,range(6).map(String),counts);num(`A student says this die is biased towards ${top} because ${top} came up most often. How many times would each number be expected in ${T} rolls of a fair die?`,T/6,`${T} × 1/6 = ${T/6}. Counts naturally vary around this.`,[Math.max(...counts),T/2]);}
  else if(!alt){const [p,T]=pick([[0.25,500],[0.2,400],[0.4,300],[0.3,600],[0.15,200]] as const);num(`A simulation ran ${T} trials. The predicted probability of a win is ${p}. How many wins were predicted?`,p*T,`Predicted wins = probability × trials = ${p} × ${T} = ${p*T}. The actual simulation will usually give a few more or a few fewer.`,[T/2,p*100]);}
  else{const w1=int(15,35),w2=int(15,35);table('Two simulation runs',['Run','Wins','Trials'],[['1',w1,100],['2',w2,100]]);num('Combine the two runs. What is the overall relative frequency of a win? Give a decimal.',(w1+w2)/200,`Combine the runs: ${w1} + ${w2} = ${w1+w2} wins in 100 + 100 = 200 trials. Relative frequency = ${w1+w2} ÷ 200 = ${round((w1+w2)/200)}.`,[(w1+w2)/100,w1/100]);}
  break;}
 // ── Week 7: variation and larger samples
 case 19:{
  if(F){const rows=[['Two runs use the same fair coin but give different head counts.','Random variation can change counts without changing the coin’s probability.'],['A fair coin gives 28 heads in 50 tosses.','That difference from 25 expected heads can happen by chance.'],['A fair coin gives exactly 25 heads in one run of 50 tosses.','Another 50-toss run does not have to give exactly 25 heads.'],['One run gives more heads than tails.','The next run does not have to cancel that out.'],['An experiment is repeated with the same model and number of trials.','The expected count stays the same, but observed counts can differ.']] as const,row=pick(rows),runs=Array.from({length:8},()=>25+int(-6,6));visual={kind:'plot',title:'Heads in 8 runs of 50 tosses of the same fair coin',xLabel:'Run',yLabel:'Heads',points:runs.map((h,i)=>[i+1,h] as [number,number]),showValues:true};choose(`${row[0]} What do these results show?`,row[1],['Every fair short run must be exactly balanced.','These results decide the next outcome.','The next run must give the same counts.'],`Look at the chart: the same fair coin gave between ${Math.min(...runs)} and ${Math.max(...runs)} heads in runs of 50 tosses. The chance of heads stayed 1/2 on every toss, so 25 heads is only the average we expect. Different counts are random variation, not a change in the coin.`);}
  else if(R){const h1=int(18,32),h2=h1+int(2,8);num(`Two runs of 50 tosses of the same coin gave ${h1} and ${h2} heads. What is the difference between their relative frequencies? Give a decimal.`,(h2-h1)/50,`${h2}/50 − ${h1}/50 = ${h2-h1}/50 = ${round((h2-h1)/50)}. Runs vary even when the coin does not change.`,[h2-h1,(h2-h1)/100]);}
  else{const groups=['A','B','C','D','E'],heads=groups.map(()=>int(6,14));let far=heads.map(h=>Math.abs(h-10));if(far.filter(x=>x===Math.max(...far)).length>1){heads[int(0,4)]=pick([4,16]);far=heads.map(h=>Math.abs(h-10));}table('Five groups each toss a coin 20 times',['Group','Heads'],groups.map((x,i)=>[x,heads[i]]));
   if(!alt)num('What is the combined relative frequency of heads for all five groups? Give a decimal.',heads.reduce((s,h)=>s+h,0)/100,`Add all the heads: ${heads.join(' + ')} = ${heads.reduce((s,h)=>s+h,0)}. Five groups tossed 20 times each, so there were 100 tosses. Relative frequency = ${heads.reduce((s,h)=>s+h,0)} ÷ 100 = ${heads.reduce((s,h)=>s+h,0)/100}.`,[heads.reduce((s,h)=>s+h,0)/20]);
   else{const g2=groups[far.indexOf(Math.max(...far))];choose('Which group’s result was furthest from the expected 10 heads? Type the group letter.',g2,groups.filter(x=>x!==g2),`Group ${g2} was ${Math.max(...far)} away from 10, the largest difference.`);}}
  break;}
 case 20:{
  // Counts drift around the probability, with smaller runs drifting further.
  const p=pick([0.5,0.5,0.3,0.4,0.2]),runs=[10,50,100,500,1000],spread=[3,5,6,12,15];
  const counts=runs.map((t,i)=>Math.min(t,Math.max(0,Math.round(t*p)+int(1,spread[i])*(int(0,1)?1:-1))));
  if(R){const gap=(i:number)=>Math.abs(counts[i]/runs[i]-p),best=Math.min(...runs.map((_,i)=>gap(i)));if(runs.filter((_,i)=>Math.abs(gap(i)-best)<1e-9).length>1)counts[4]=Math.round(1000*p);}
  const rf=counts.map((c,i)=>c/runs[i]),event=p===0.5?'heads':'red',Event=event[0].toUpperCase()+event.slice(1);
  table(`Relative frequency of ${event} as trials grow`,['Trials',`${Event} count`],runs.map((t,i)=>[t,counts[i]]));
  if(F){const i=int(1,4);num(`What is the relative frequency of ${event} for the ${runs[i]}-trial run? Give a decimal.`,rf[i],`Relative frequency = count ÷ trials, so ${counts[i]} ÷ ${runs[i]} = ${round(rf[i])}. For the 10-trial run, ${counts[0]} ÷ 10 = ${round(rf[0])}, which is further from ${p}. Bigger runs usually settle closer to the probability.`,[counts[i]/100,1-rf[i]]);}
  else if(R){const gaps=rf.map(x=>Math.abs(x-p)),best=runs[gaps.indexOf(Math.min(...gaps))];num(`The probability of ${event} is ${p}. A student says the 10-trial run proves otherwise. Which run has a relative frequency closest to ${p}? Type its number of trials.`,best,`Relative frequencies: ${rf.map((x,i)=>`${runs[i]}: ${round(x)}`).join(', ')}. Larger runs usually, but not always, settle closer.`,[10,best===1000?500:1000]);}
  else if(!alt)num(`As the number of trials grows, the relative frequency settles. Estimate the probability of ${event} to one decimal place.`,p,`The large runs settle near ${p}: ${round(rf[3])} at 500 trials and ${round(rf[4])} at 1000.`,[round(rf[0]),1-p]);
  else num('By how much did the relative frequency change from the 10-trial run to the 1000-trial run? Give a decimal.',Math.abs(rf[4]-rf[0]),`${round(rf[0])} at 10 trials and ${round(rf[4])} at 1000: a change of ${round(Math.abs(rf[4]-rf[0]))}.`,[Math.abs(counts[4]-counts[0])]);
  break;}
 case 21:{
  const k=int(3,7);
  if(F){const d=int(0,2);
   if(d===0){coin();fr(`A fair coin has landed heads ${k} times in a row. What is the probability of tails on the next toss? Give a fraction.`,1,2,`Each toss is independent: the coin does not remember earlier tosses. It still has one heads side and one tails side, so P(tails) = 1/2 on the next toss, even after ${k} heads in a row.`,[[k,k+1],[1,k]]);}
   else if(d===1){die();fr(`A fair die has not shown a 6 in the last ${k} rolls. What is the probability of a 6 on the next roll? Give a fraction.`,1,6,`The die has no memory, so the last ${k} rolls do not matter. It still has six equally likely faces and one of them is a 6, so P(6) = 1/6.`,[[k,6],[1,6-k>0?6-k:2]]);}
   else{spinner({red:a,blue:b});fr(`This spinner has landed on red ${k} times in a row. What is the probability of red on the next spin? Give a fraction.`,a,n,`The spinner has no memory and its sections have not changed: ${a} red out of ${n}. So P(red) on the next spin is still ${frac(a,n)}.`,[[a-1,n],[1,2]]);}}
  else if(R){spinner({red:a,blue:b});fr(`Jo says that after ${k} reds in a row red is “used up”, so P(red) is now ${frac(a-1,n)}. What is P(red) on the next spin? Give a fraction.`,a,n,`Spins are independent; the sections have not changed, so P(red) = ${frac(a,n)}.`,[[a-1,n]]);}
  else if(!alt){const N=pick([20,30,40,45,50]),ball=int(1,N);fr(`A lottery draws one ball from ${N} numbered balls each week. Ball ${ball} was drawn last week. What is the probability it is drawn this week? Give a fraction.`,1,N,`Every week all ${N} balls go back in, so each ball has the same chance: 1 out of ${N}. Last week’s draw does not change that.`,[[1,N-1],[0,N]]);}
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
