import {STATISTICA_FORMS,type StatisticaForm,type StatsItem} from './level1StatisticaFiveForms';
const contexts=[
 {title:'Books read last week',question:'How many books did each child finish last week?',unit:'Books finished',object:'Books'},
 {title:'Pets at home',question:'How many pets live in each child’s home?',unit:'Number of pets',object:'Dog'},
 {title:'Goals in a game',question:'How many goals did each player score in one game?',unit:'Goals scored',object:'Ball'},
 {title:'Plants at home',question:'How many pot plants does each child have at home?',unit:'Number of plants',object:'Green'},
 {title:'Bike rides last week',question:'How many bike rides did each child take last week?',unit:'Number of rides',object:'Bike'},
];
const catContexts=[
 {title:'Favourite fruit',names:['Apple','Banana','Orange','Pear']},
 {title:'Favourite pets',names:['Dog','Cat','Fish','Rabbit']},
 {title:'Favourite toys',names:['Ball','Kite','Teddy','Blocks']},
 {title:'Favourite ways to travel to school',names:['Car','Bus','Walk','Bike']},
 {title:'Favourite colours',names:['Red','Blue','Green','Yellow']},
];
const colors=['#cf4545','#3279bd','#398564','#d3a326','#885db0'];
const labels=['Identify numerical data','Record categorical observations','Record numerical observations','Use a supplied dataset','Build a frequency table','Record a digital list','Find a recording error','Choose an investigation question','Plan numerical data collection','Record investigation answers','Graph investigation results','Interpret investigation results','Check the data collected','Report a supported conclusion','Build a categorical graph','Build a numerical graph','Compare two displays','Read a scaled frequency difference','Describe a numerical pattern','Check a contextual claim'];
const weeks=[1,2,2,2,3,3,3,6,6,6,6,6,6,6,4,4,4,5,5,6];
const rotate=<T,>(a:T[],n:number)=>[...a.slice(n%a.length),...a.slice(0,n%a.length)];
const observations=(counts:number[],seed:number)=>{const left=[...counts],result:number[]=[];while(left.some(n=>n>0))for(const i of rotate(counts.map((_,i)=>i),seed++))if(left[i]){result.push(i);left[i]--;}return result;};
function make(form:StatisticaForm,f:number,slot:number):StatsItem{
 const c=contexts[f],cat=catContexts[(f+slot)%5];
 const numeric=![1,2,8,10,11,12,14,15,18,20].includes(slot);
 const readTask=[4,12,14,19,20].includes(slot);
 const counts=rotate(readTask?(numeric?[10,15,25,5,20]:[20,10,25,15]):[11,15].includes(slot)?[10,6,12,8]:slot===17?[4,6,10,2,8]:numeric?[3,4,5,2,4]:[6,4,3,5],f);
 const categories=(numeric?['0','1','2','3','4']:cat.names).map((name,i)=>({name,color:numeric?'#3279bd':colors[i]}));
 const q:StatsItem={id:`statistics-l3-v1-${form}-${String(slot).padStart(2,'0')}`,slot,skillLabel:labels[slot-1],code:slot<=7?'AC9M3ST01':slot<=14?'AC9M3ST03':'AC9M3ST02',week:weeks[slot-1],difficulty:[1,2,8,15].includes(slot)?'easy':[7,13,14,17,19,20].includes(slot)?'challenging':'moderate',context:numeric?c.title:cat.title,categories,counts,observations:observations(counts,f+slot),mode:'choice',source:'table',display:'frequency',options:[],answer:'',prompt:'',instruction:'',numerical:numeric,valueLabel:numeric?c.unit:'Group',axisLabel:'Children',sourceLabel:'Child',graphMax:readTask?30:12,graphStep:readTask?5:1};
 const choose=(options:string[],correct=0)=>{q.options=rotate(options.map((label,i)=>({id:`option-${i}`,label})),f+slot);q.answer=`option-${correct}`;};
 const brief=(text:string)=>{q.source='brief';q.sourceText=text;};
 const list=()=>{q.mode='list';q.source='responses';q.observations=q.observations.slice(0,8);q.answer=[...q.observations];};
 const build=(display:StatsItem['display'],source:StatsItem['source'])=>{q.mode='counts';q.display=display;q.source=source;q.answer=[...q.counts];};
 const most=counts.indexOf(Math.max(...counts)),least=counts.indexOf(Math.min(...counts));
 switch(slot){
 case 1:q.context='Questions for our class';brief('Numerical data records numbers we count. Categorical data records named groups.');q.prompt='Which question collects numerical data?';q.instruction='Choose the question whose answers are counts.';choose([c.question,'Which fruit do you like best?','Which pet do you like best?','How do you travel to school?']);break;
 case 2:list();q.prompt='Record the observed choices.';q.instruction='Each child chose one picture. Save each choice beside that child’s number.';break;
 case 3:list();q.prompt='Record these numerical answers.';q.instruction=`Survey question: ${c.question}`;break;
 case 4:q.prompt='How many children gave the answer 2?';q.instruction=`Dataset: ${c.question} Frequency means the number of children.`;choose([String(counts[2]),String(counts.reduce((a,b)=>a+b,0)),'2',String(counts[2]+5)].map((v,i,a)=>i>0&&a.indexOf(v)!==i?String(8+i):v));break;
 case 5:build('frequency','responses');q.prompt='Make a frequency table.';q.instruction=`${c.question} Count how often each answer occurs, including zero.`;break;
 case 6:list();q.prompt='Complete the digital records.';q.instruction=`${c.question} Keep each answer with the correct child.`;break;
 case 7:build('frequency','responses');q.initial=counts.map((n,i)=>n+(i===2?1:0));q.prompt='Fix the duplicated record.';q.instruction='One child’s answer was counted twice in the table. Check the source answers and correct the frequency.';break;
 case 8:q.context='Planning a class investigation';brief(`We want to find out about our class’s ${cat.title.toLowerCase()}. We can ask every child in this class.`);q.prompt='Which question fits this investigation?';q.instruction='Choose a question we can answer with this class survey.';choose([`Which choice is most popular in our class?`,`Which choice is most popular in every school?`,'How many children are absent today?','What will every child choose next year?']);break;
 case 9:brief(`Investigation question: ${c.question}`);q.prompt='What should we record for each child?';q.instruction='Choose the data that answers the question.';choose([`Their answer as a whole-number count.`,`Their favourite ${c.object.toLowerCase()} colour.`,'Whether their first name is long or short.','Only the largest answer in the class.']);break;
 case 10:list();q.prompt='Record the investigation answers.';q.instruction=`We are investigating ${cat.title.toLowerCase()} in this group. Record one answer for each child.`;break;
 case 11:build('columns','table');q.prompt='Graph the investigation results.';q.instruction='Use the frequency table. Each step on the graph is one child.';break;
 case 12:q.source='graph';q.graphKind='columns';q.prompt='What did this investigation find?';q.instruction='Use the results for this group of children.';choose([`${categories[most].name} had the most votes.`,`${categories[least].name} had the most votes.`,'All four choices had the same votes.',`${categories[most].name} had no votes.`]);break;
 case 13:brief(`Question: ${c.question}\nThe records contain each child’s favourite colour.`);q.prompt='Why can’t these records answer the question?';q.instruction='Check what was asked and what was recorded.';choose(['They record colours instead of the counts asked for.','There are too many possible colours.','The children’s answers are not in alphabetical order.','A graph would change colours into counts.']);break;
 case 14:q.source='graph';q.graphKind='columns';q.prompt='Which report is supported by the results?';q.instruction='Each child in this group gave one answer.';choose([`${categories[most].name} was the top choice in this group.`,`${categories[most].name} is the top choice in every class.`,`${categories[most].name} will be the top choice next year.`,`Everyone in this group chose ${categories[most].name}.`]);break;
 case 15:build('columns','table');q.prompt='Build a graph of these categories.';q.instruction='Set every column to match its frequency.';break;
 case 16:q.counts=rotate([6,0,9,7,4],f);q.observations=observations(q.counts,f);build('columns','table');q.prompt='Build a graph of these numerical answers.';q.instruction='Keep all values from 0 to 4 on the bottom axis, even when no child gave that answer.';break;
 case 17:q.source='dual';q.graphKind='pictures';q.secondaryKind='columns';q.prompt='What is the same in both displays?';q.instruction='Each dot stands for one child. The bottom numbers are the children’s answers.';choose(['The frequency of every answer.','The height of every column.','The number of dots and columns.','The shape used to show each child.']);break;
 case 18:q.counts=rotate([10,25,15,20],f);q.graphMax=30;q.graphStep=5;q.source='graph';q.graphKind='columns';{const a=q.counts.indexOf(25),b=q.counts.indexOf(10);q.prompt=`How many more children chose ${categories[a].name} than ${categories[b].name}?`;q.instruction='The scale goes up in fives.';choose(['15','3','35','25']);}break;
 case 19:q.source='graph';q.graphKind='columns';q.prompt='Which description matches the graph?';q.instruction='Compare the frequencies of the numerical answers.';choose([`The answer ${categories[most].name} was most common.`,`Every child gave the answer ${categories[most].name}.`,'No child gave the answer 0.','Every answer was equally common.']);break;
 case 20:q.source='graph';q.graphKind='columns';q.prompt='Which claim can we make from this graph?';q.instruction='These children each chose one answer. Use only what the results show.';choose([`${categories[most].name} received ${counts[most]-counts[least]} more votes than ${categories[least].name}.`,`${categories[least].name} received ${counts[most]-counts[least]} more votes than ${categories[most].name}.`,'The tallest column shows what everyone chose.','The shortest column shows a choice nobody likes.']);break;
 }
 return q;
}
export const LEVEL3_STATISTICA_FORMS=Object.fromEntries(STATISTICA_FORMS.map((form,f)=>[form,Array.from({length:20},(_,i)=>make(form,f,i+1))])) as Record<StatisticaForm,StatsItem[]>;
