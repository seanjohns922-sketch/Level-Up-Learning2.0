/** Year 1 AC v9: ST01 acquire/record; ST02 represent/compare/discuss.
 * Review bank only. Never replaces an in-progress student bank.
 */
export const STATISTICA_FORMS = ['pretest', 'posttest', 'start', 'mid', 'end'] as const;
export type StatisticaForm = typeof STATISTICA_FORMS[number];
export const STATISTICA_FORM_LABELS: Record<StatisticaForm,string> = {pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
export type Category = {name:string;color:string};
export type StatsOption = {id:string;label:string};
export type StatsItem = {
 id:string;slot:number;skillLabel:string;code:'AC9M1ST01'|'AC9M1ST02';week:number;difficulty:'easy'|'moderate'|'challenging';
 prompt:string;instruction:string;context:string;categories:Category[];counts:number[];observations:number[];
 mode:'choice'|'counts'|'list';source:'categories'|'objects'|'responses'|'graph'|'missing'|'duplicate';
 display:'objects'|'pictures'|'symbols'|'tally';options:StatsOption[];answer:string|number[];
 initial?:number[];target?:number;recorded?:number[];
};
const CONTEXTS = [
 {title:'Favourite fruit',question:'Which fruit do you like best?',names:['Apple','Banana','Orange'],colors:['#d34c43','#edbd2c','#e17c21']},
 {title:'Favourite pets',question:'Which pet do you like best?',names:['Dog','Cat','Fish'],colors:['#b97d45','#a373c3','#3488af']},
 {title:'Favourite toys',question:'Which toy do you like best?',names:['Ball','Kite','Teddy'],colors:['#478dba','#b66ca2','#b97d45']},
 {title:'Getting to school',question:'How do you get to school?',names:['Car','Bus','Walk'],colors:['#d34c43','#d5a425','#398564']},
 {title:'Favourite colours',question:'Which colour do you like best?',names:['Red','Blue','Green'],colors:['#cf4545','#3279bd','#398564']},
];
const SKILLS = ['Choose a survey question','Record with objects','Record with pictures','Make a response list','Record tally marks','Record with symbols','Sort observed data','Find a missing response','Spot a duplicate record','Use a digital recording list','Build an object display','Build a picture display','Find the most','Find the fewest','Read a frequency','Compare two groups','Find equal groups','Repair a display','Read a finding','Explain a finding'];
const WEEKS = [1,1,2,2,2,2,1,2,2,6,3,3,3,3,5,4,4,6,5,6];
function rotate<T>(a:T[],n:number):T[]{return [...a.slice(n%a.length),...a.slice(0,n%a.length)];}
function observations(counts:number[],seed:number):number[]{
 const result:number[]=[]; const left=[...counts];
 while(left.some(n=>n>0))for(const i of rotate([0,1,2],seed++))if(left[i]>0){result.push(i);left[i]--;}
 return result;
}
function make(form:StatisticaForm,f:number,slot:number):StatsItem {
 const c=CONTEXTS[(f+slot-1)%CONTEXTS.length];
 const categories=c.names.map((name,i)=>({name,color:c.colors[i]}));
 const permutation=rotate([0,1,2],(f+slot)%3);
 let base = slot===5?[6,2,1]:slot===14?[0,3,5]:slot===15?[9,11,7]:slot===16?[7,4,2]:slot===17?[4,4,2]:[4,2,3];
 // Same size/difficulty per slot across all forms; category roles vary.
 base=permutation.map(i=>base[i]);
 const obs=observations(base,f+slot), name=(i:number)=>categories[i].name;
 const item:StatsItem={id:`statistics-l1-v2-${form}-${String(slot).padStart(2,'0')}`,slot,skillLabel:SKILLS[slot-1],code:slot<=10?'AC9M1ST01':'AC9M1ST02',week:WEEKS[slot-1],difficulty:[1,2,7,13,14,17].includes(slot)?'easy':[8,9,18,19,20].includes(slot)?'challenging':'moderate',prompt:'',instruction:'',context:c.title,categories,counts:base,observations:obs,mode:'choice',source:'graph',display:'pictures',options:[],answer:''};
 const choose=(labels:string[],correct:number)=>{item.options=rotate(labels.map((label,i)=>({id:`option-${i}`,label})),(f+slot)%3);item.answer=`option-${correct}`;};
 const record=(display:StatsItem['display'],source:StatsItem['source']='responses')=>{item.mode='counts';item.source=source;item.display=display;item.answer=[...base];item.instruction=`Use + and − to record each answer once. One ${display==='symbols'?'dot':display==='tally'?'tally mark':display==='objects'?'counter':'picture'} stands for one answer.`;};
 const most=base.indexOf(Math.max(...base)),least=base.indexOf(Math.min(...base));
 switch(slot){
 case 1:item.source='categories';item.prompt='Which question could these answers go with?';choose([c.question,'How old are you?','How many children are here?'],0);break;
 case 2:record('objects');item.prompt='Record the answers with counters.';break;
 case 3:record('pictures');item.prompt='Record the answers with pictures.';break;
 case 4:case 10:item.mode='list';item.source='responses';item.observations=obs.slice(0,6);item.answer=[...item.observations];item.prompt=slot===4?'Make a list of the answers.':'Save each child’s answer in the list.';item.instruction='Choose an answer for each child. You can change your choices.';break;
 case 5:record('tally');item.target=base.indexOf(6);item.answer=[6];item.prompt=`Make a tally of the ${name(item.target)} answers.`;break;
 case 6:record('symbols');item.prompt='Use dots to record the answers.';break;
 case 7:item.mode='list';item.source='objects';item.observations=obs.slice(0,6);item.answer=[...item.observations];item.context='Sort the collection';item.prompt='Put each picture in its group.';item.instruction='Choose the matching group for each numbered picture.';break;
 case 8:item.source='missing';item.observations=obs.slice(0,6);item.recorded=item.observations.slice(0,-1);item.prompt='Which answer is missing from the list?';item.instruction='Each child gave one answer. Check the pictures and the recorded list.';choose(categories.map(x=>x.name),item.observations[5]);break;
 case 9:item.source='duplicate';item.observations=obs.slice(0,5);item.recorded=[0,1,2,3,4,1];item.prompt='What needs fixing in this list?';item.instruction='Each child should appear once.';choose(['Child 2 is recorded twice.','Child 3 is missing.','Child 5 is recorded twice.'],0);break;
 case 11:record('objects');item.prompt='Build a counter display of the answers.';item.instruction='Add one counter for each answer. Keep each answer in its own group.';break;
 case 12:record('pictures');item.prompt='Build a picture display of the answers.';item.instruction='Add one picture for each answer. Keep each answer in its own group.';break;
 case 13:item.prompt='Which answer was chosen the most?';choose(categories.map(x=>x.name),most);break;
 case 14:item.prompt='Which answer was chosen the fewest times?';choose(categories.map(x=>x.name),least);break;
 case 15:item.target=(f+1)%3;item.prompt=`How many children chose ${name(item.target)}?`;choose([String(base[item.target]-1),String(base[item.target]),String(base[item.target]+1)],1);break;
 case 16:{const hi=base.indexOf(7),lo=base.indexOf(4);item.prompt=`How many more children chose ${name(hi)} than ${name(lo)}?`;choose(['3','4','7'],0);break;}
 case 17:{item.prompt='Which two groups have the same number?';const pairs=[[0,1],[0,2],[1,2]];choose(pairs.map(([a,b])=>`${name(a)} and ${name(b)}`),pairs.findIndex(([a,b])=>base[a]===base[b]));break;}
 case 18:record('pictures');item.initial=base.map((n,i)=>n-(i===most?1:0));item.prompt='Fix the picture display.';item.instruction='The display has one mistake. Use the answers to fix it.';break;
 case 19:item.prompt='Which sentence matches this display?';choose([`${name(most)} has the most answers.`,`${name(least)} has the most answers.`,'All three groups have the same number.'],0);break;
 case 20:item.prompt='What do these answers tell us?';item.instruction='These children each chose one answer.';choose([`More of these children chose ${name(most)} than ${name(least)}.`,`More of these children chose ${name(least)} than ${name(most)}.`,`Every child in the school would choose ${name(most)}.`],0);break;
 }
 if(item.source==='graph')item.instruction ||= 'One picture stands for one child’s answer.';
 return item;
}
export const LEVEL1_STATISTICA_FORMS = Object.fromEntries(STATISTICA_FORMS.map((form,f)=>[form,Array.from({length:20},(_,i)=>make(form,f,i+1))])) as Record<StatisticaForm,StatsItem[]>;
