import {STATISTICA_FORMS,type StatisticaForm,type StatsItem} from './level1StatisticaFiveForms';
const contexts=[
 {title:'Favourite fruit',question:'Which fruit do you like best?',names:['Apple','Banana','Orange','Pear'],colors:['#d34c43','#edbd2c','#e17c21','#76a746']},
 {title:'Favourite pets',question:'Which pet do you like best?',names:['Dog','Cat','Fish','Rabbit'],colors:['#b97d45','#a373c3','#3488af','#c4a18c']},
 {title:'Favourite toys',question:'Which toy do you like best?',names:['Ball','Kite','Teddy','Blocks'],colors:['#478dba','#b66ca2','#b97d45','#c95a46']},
 {title:'Getting to school',question:'How do you get to school?',names:['Car','Bus','Walk','Bike'],colors:['#d34c43','#d5a425','#398564','#3e83b4']},
 {title:'Favourite colours',question:'Which colour do you like best?',names:['Red','Blue','Green','Yellow'],colors:['#cf4545','#3279bd','#398564','#e5b62b']},
];
const labels=['Check survey categories','Record a class survey','Record observations','Record experiment results','Use a digital list','Sort collected data','Make a response list','Complete a frequency table','Check a recording category','Repair a frequency table','Build a picture graph','Represent a table in pictures','Build a column graph','Read two displays','Compare graph features','Compare group counts','Explain a graph feature','Repair a column graph','Match data in a different order','Explain a shared finding'];
const weeks=[1,1,1,6,2,1,2,2,1,2,3,4,3,4,4,5,4,6,4,6];
const rotate=<T,>(a:T[],n:number)=>[...a.slice(n%a.length),...a.slice(0,n%a.length)];
function raw(counts:number[],seed:number){const left=[...counts],result:number[]=[];while(left.some(n=>n>0)){for(const i of rotate([0,1,2,3],seed++))if(left[i]){result.push(i);left[i]--;}}return result;}
function make(form:StatisticaForm,f:number,slot:number):StatsItem{
 const c=contexts[slot===4?4:(f+slot-1)%5];
 const categories=c.names.map((name,i)=>({name,color:c.colors[i]}));
 const readTask=slot>=14&&slot!==18;
 const counts=rotate(readTask?[12,8,15,5]:[12,13,18].includes(slot)?[8,6,10,4]:[6,4,3,2],(f+slot)%4);
 const observations=raw(counts,f+slot);
 const q:StatsItem={id:`statistics-l2-v1-${form}-${String(slot).padStart(2,'0')}`,slot,skillLabel:labels[slot-1],code:slot<=10?'AC9M2ST01':'AC9M2ST02',week:weeks[slot-1],difficulty:[1,2,3,6,14].includes(slot)?'easy':[9,10,17,18,19,20].includes(slot)?'challenging':'moderate',context:c.title,categories,counts,observations,mode:'choice',source:'graph',display:'pictures',options:[],answer:'',prompt:'',instruction:'',sourceLabel:'Child',graphMax:readTask?16:12};
 const name=(i:number)=>categories[i].name;
 const choose=(options:string[],correct=0)=>{q.options=rotate(options.map((label,i)=>({label,id:`option-${i}`})),(f+slot)%4);q.answer=`option-${correct}`;};
 const record=(display:StatsItem['display'],source:StatsItem['source']='responses')=>{q.mode='counts';q.source=source;q.display=display;q.answer=[...counts];q.instruction='Record every result once in its group.';};
 const dual=()=>{q.source='dual';q.graphKind='pictures';q.secondaryKind='columns';q.instruction='Both graphs show the same survey. One picture stands for one answer.';};
 const most=counts.indexOf(Math.max(...counts)),least=counts.indexOf(Math.min(...counts));
 switch(slot){
 case 1:{q.source='categories';q.prompt='Which answer does not fit this survey?';q.instruction=`Survey question: ${c.question}`;q.categories=categories.map((v,i)=>i===3?{name:f===4?'Dog':'Yellow',color:f===4?'#b97d45':'#e5b62b'}:v);choose(q.categories.map(v=>v.name),3);break;}
 case 2:case 5:case 7:q.mode='list';q.source='responses';q.observations=observations.slice(0,8);q.answer=[...q.observations];q.prompt=slot===2?'Record each child’s answer.':slot===5?'Save these answers in the digital list.':'Make a list of the survey answers.';q.instruction='Choose the answer beside each child’s number.';break;
 case 3:record('frequency','objects');q.sourceLabel='Sighting';q.context=`Observed collection · ${c.title.replace('Favourite ','')}`;q.prompt='Count the pictures in each group.';q.instruction='These are the pictures seen during an observation. Record each one once.';break;
 case 4:record('tally');q.sourceLabel='Draw';q.context='Counter experiment';q.prompt='Record the results with tally marks.';q.instruction='A counter was drawn and put back each time. Record the fifteen results shown.';break;
 case 6:q.mode='sort';q.source='objects';q.sourceLabel='Picture';q.context='Collected pictures';q.prompt='Sort the collected pictures.';q.instruction='Tap a picture. Then tap its group. You can move a picture again.';q.answer=[...observations];break;
 case 8:record('frequency');q.prompt='Complete the frequency table.';q.instruction='Frequency means how many. Count the answers in each group.';break;
 case 9:{q.source='categories';q.prompt='Why should “Age” not be a group here?';q.instruction=`Survey question: ${c.question}`;choose(['Age answers a different question.','Age needs more answers first.','Age must go at the end of the table.','Age should always be the biggest group.']);break;}
 case 10:record('frequency');q.initial=counts.map((n,i)=>n+(i===most?1:0));q.prompt='Fix the frequency table.';q.instruction='One count is wrong. Check the children’s answers and fix it.';break;
 case 11:record('pictures');q.prompt='Build a picture graph of these answers.';q.instruction='Add one picture for each answer. Keep each answer in its group.';break;
 case 12:record('pictures','table');q.prompt='Turn the table into a picture graph.';q.instruction='One picture stands for one answer.';break;
 case 13:record('columns','table');q.prompt='Build the column graph.';q.instruction='Set each column height to match the table. Each step is one answer.';break;
 case 14:dual();q.prompt='Which group has the most answers in both graphs?';choose(categories.map(v=>v.name),most);break;
 case 15:dual();q.prompt='How are graph A and graph B different?';choose(['A uses pictures. B uses columns.','A has more answers than B.','B has an extra group.','The most popular answer has changed.']);break;
 case 16:{q.graphKind='columns';const high=counts.indexOf(15),low=counts.indexOf(8);q.prompt=`How many more chose ${name(high)} than ${name(low)}?`;q.instruction='Read the column heights.';choose(['7','23','15','8']);break;}
 case 17:dual();q.prompt='What helps us compare the columns in graph B?';choose(['They start at zero and use the same scale.','Every column is the same height.','The group names are all the same.','One column counts answers twice.']);break;
 case 18:record('columns','table');q.initial=counts.map((n,i)=>n-(i===most?1:0));q.prompt='Fix the column graph.';q.instruction='One column does not match the table. Change its height.';break;
 case 19:dual();q.secondaryOrder=[2,0,3,1];q.prompt='Do these graphs show the same data?';q.instruction='Match the group names. One picture stands for one answer.';choose(['Yes. Every group has the same count in both.','No. The groups are in a different order.','No. Pictures and columns cannot show the same data.','Yes. Matching colours always mean matching counts.']);break;
 case 20:dual();q.prompt='Which finding matches both graphs?';choose([`${name(most)} had ${counts[most]-counts[least]} more answers than ${name(least)}.`,`${name(least)} had ${counts[most]-counts[least]} more answers than ${name(most)}.`,`${name(most)} had ${counts[most]+counts[least]} more answers than ${name(least)}.`,`${name(most)} and ${name(least)} had equal counts.`]);break;
 }
 return q;
}
export const LEVEL2_STATISTICA_FORMS=Object.fromEntries(STATISTICA_FORMS.map((form,f)=>[form,Array.from({length:20},(_,i)=>make(form,f,i+1))])) as Record<StatisticaForm,StatsItem[]>;
