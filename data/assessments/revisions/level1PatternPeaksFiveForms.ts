import type { Year1PatternToken } from '@/data/activities/year1/practice-task';
export const PP_FORMS = ['pretest','posttest','start','mid','end'] as const;
export type PPForm = typeof PP_FORMS[number];
export const PP_LABELS: Record<PPForm,string> = {pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
export type PPValue = Year1PatternToken | number | '?';
export type PPOption = {values: PPValue[]; label?: string};
export type PPItem = {
 id:string; slot:number; code:'AC9M1A01'|'AC9M1A02'; skill:string; week:number;
 prompt:string; instruction:string; sequence:PPValue[]; mode:'choice'|'build'|'create';
 options:PPOption[]; correct:number; expected:PPValue[]; palette:PPValue[];
 groups?:{count:number;size:number}; createStep?:number; difficulty:'accessible'|'moderate'|'challenging';
};
const tokens:Year1PatternToken[]=['amber-star','cyan-gem','rose-robot','blue-circle','green-square','violet-triangle'];
export const ppSay = (values:readonly PPValue[]) => values.map(v=>v==='?'?'blank':String(v).replaceAll('-',' ')).join(', ');
const repeat=(unit:PPValue[],n:number)=>Array.from({length:n},()=>unit).flat();
function make(form:PPForm,f:number):PPItem[]{
 const result:PPItem[]=[];
 const add=(q:Partial<PPItem>&Pick<PPItem,'prompt'|'sequence'|'skill'>)=>{
  const slot=result.length+1;
  const item:PPItem={id:`pp-l1-${form}-${slot}`,slot,code:slot<=12?'AC9M1A02':'AC9M1A01',week:slot<=12?11:4,mode:'choice',instruction:'',options:[],correct:0,expected:[],palette:[],difficulty:slot<=3?'accessible':slot===10||slot===12||slot===20?'challenging':'moderate',...q};
  if(item.options.length){const shift=(slot+f)%4; item.options=[...item.options.slice(shift),...item.options.slice(0,shift)];item.correct=(4-shift)%4;}
  result.push(item);
 };
 const [a,b,c,d]=[0,1,2,3].map(i=>tokens[(f+i)%tokens.length]);
 const opts=(...values:PPValue[][])=>values.map(values=>({values}));
 add({skill:'Continue an AB pattern',prompt:'What comes next?',sequence:[a,b,a,b,a,'?'],options:opts([b],[a],[c],[d])});
 add({skill:'Continue an AAB pattern',prompt:'What comes next?',sequence:[a,a,b,a,a,b,a,'?'],options:opts([a],[b],[c],[d])});
 add({skill:'Continue an ABC pattern',prompt:'What comes next?',sequence:[a,b,c,a,b,c,'?'],options:opts([a],[b],[c],[d])});
 add({skill:'Find a missing part',prompt:'Which picture fills the gap?',sequence:[a,b,b,a,'?',b,a,b,b],options:opts([b],[a],[c],[d])});
 add({skill:'Identify an AB unit',prompt:'Which is the smallest part that repeats?',instruction:'Start at the first picture.',sequence:repeat([a,b],3),options:opts([a,b],[a],[b,a],[a,b,a,b])});
 add({skill:'Identify an AAB unit',prompt:'Which is the smallest part that repeats?',instruction:'Start at the first picture.',sequence:repeat([a,a,b],3),options:opts([a,a,b],[a,b],[a,a],[a,a,b,a])});
 add({skill:'Identify an ABC unit',prompt:'Which is the smallest part that repeats?',instruction:'Start at the first picture.',sequence:repeat([a,b,c],3),options:opts([a,b,c],[a,b],[a,c,b],[a,b,c,a])});
 add({skill:'Continue an ABB pattern',prompt:'Add the next three pictures.',sequence:[a,b,b,a,b,b],mode:'build',expected:[a,b,b],palette:[a,b,c,d],instruction:'Tap pictures in order. Use Undo to change your answer.'});
 add({skill:'Copy a repeating pattern',prompt:'Make a copy of this pattern.',sequence:repeat([a,b,c],2),mode:'build',expected:repeat([a,b,c],2),palette:[a,b,c,d],instruction:'Tap pictures in order to fill all six spaces.'});
 add({skill:'Create a repeating pattern',prompt:'Make your own repeating pattern.',sequence:[],mode:'create',expected:repeat([a,b],3),palette:[a,b,c,d],instruction:'Choose two different pictures. Repeat your pair three times to fill six spaces.'});
 add({skill:'Repair a repeating pattern',prompt:'Replace the wrong number.',sequence:[f+1,f+3,f+1,f+5,f+1,f+3],mode:'build',expected:[f+3],palette:[f+1,f+3,f+5,f+7],instruction:'The fourth number breaks the pattern. Choose its replacement.'});
 add({skill:'Transfer a repeating structure',prompt:'Which pattern follows the same rule?',sequence:repeat([a,a,b],2),options:opts([c,c,d,c,c,d],[c,d,d,c,d,d],[c,d,c,d,c,d],[c,c,d,c,d,d])});
 const start=f*2;
 add({skill:'Skip count by twos',prompt:'Count on in twos. What comes next?',sequence:[start,start+2,start+4,start+6,'?'],options:opts([start+8],[start+7],[start+10],[start+6])});
 const five=f*5;
 add({skill:'Skip count by fives',prompt:'Count on in fives. Fill the two spaces.',sequence:[five,five+5,five+10,'?','?'],mode:'build',expected:[five+15,five+20],palette:[five+10,five+15,five+20,five+25],instruction:'Tap the two numbers in order.'});
 const ten=f*10;
 add({skill:'Skip count by tens',prompt:'Count on in tens. What comes next?',sequence:[ten,ten+10,ten+20,'?'],options:opts([ten+30],[ten+21],[ten+25],[ten+40])});
 const step=[2,5,10,2,5][f];
 add({skill:'Create a skip-count sequence',prompt:`Make a counting pattern in ${step===2?'twos':step===5?'fives':'tens'}.`,sequence:[],mode:'create',createStep:step,expected:[0,step,step*2,step*3],palette:Array.from({length:8},(_,i)=>i*step),instruction:'Choose a starting number. Then add three more numbers to your pattern.'});
 for(const size of [2,5,10]){const count=3+(f+size)%3;const total=count*size;add({skill:`Count equal groups of ${size}`,prompt:'How many counters altogether?',sequence:[],groups:{count,size},options:opts([total],[total-size],[total+size],[count]),instruction:`Each group has ${size} counters. Count in ${size===2?'twos':size===5?'fives':'tens'}.`});}
 const size=[2,5,10,2,5][f];
 add({skill:'Connect groups to skip counting',prompt:'Which count matches these groups?',sequence:[],groups:{count:4,size},options:opts([size,size*2,size*3,size*4],[1,2,3,4],[size,size+1,size+2,size+3],[size,size*2,size*3,size*5])});
 return result;
}
export const LEVEL1_PP_FORMS=Object.fromEntries(PP_FORMS.map((f,i)=>[f,make(f,i)])) as Record<PPForm,PPItem[]>;
export type PPResponse={choice?:number;built:PPValue[];skipped?:boolean};
export function ppReady(q:PPItem,r:PPResponse){return r.skipped || (q.mode==='choice'?Number.isInteger(r.choice)&&r.choice!>=0&&r.choice!<q.options.length:r.built.length===q.expected.length);}
export function ppScore(q:PPItem,r:PPResponse){
 if(r.skipped||!ppReady(q,r))return false;
 if(q.mode==='choice')return r.choice===q.correct;
 if(q.createStep)return r.built.every((v,i)=>typeof v==='number'&&q.palette.includes(v)&&(i===0||v===Number(r.built[i-1])+q.createStep!));
 if(q.mode==='create')return r.built[0]!==r.built[1]&&r.built.every((v,i)=>q.palette.includes(v)&&v===r.built[i%2]);
 return r.built.every((v,i)=>v===q.expected[i]);
}
