export const PP_FORMS=['pretest','posttest','start','mid','end'] as const;
export type PPForm=typeof PP_FORMS[number];
export const PP_LABELS:Record<PPForm,string>={pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
export type PPOperation='Double'|'Halve'|'Add the starting number'|'Add 5';
export const PP_OPERATIONS:PPOperation[]=['Halve','Add the starting number','Add 5','Double'];
export type PPVisual=
 |{kind:'sequence';terms:(number|string)[];rule?:string}
 |{kind:'cards';cards:{label:string;text:string}[]}
 |{kind:'array';rows:number;columns:number;splitAfter?:number}
 |{kind:'graph';points:[number,number][];xTicks:number[];yTicks:number[];xLabel:string;yLabel:string;caption:string;source?:string}
 |{kind:'growing';rows:number}
 |{kind:'family';product:number;factors:number[]}
 |{kind:'area';rows:number;left:number;right:number}
 |{kind:'filter';divisor:number}
 |{kind:'balance';left:string;right:string}
 |{kind:'parts';whole:number;parts:(number|string)[]}
 |{kind:'decision';input:number;yes:string;no:string}
 |{kind:'table';inputs:number[];outputs:number[]};
export type PPItem={id:string;slot:number;code:'AC9M3A01'|'AC9M3A02'|'AC9M3A03'|'AC9M3N07'|'AC9M4A01'|'AC9M4A02'|'AC9M5A01'|'AC9M5A02'|'AC9M5N10'|'AC9M6A01'|'AC9M6A02'|'AC9M6A03'|'AC9M7A01'|'AC9M7A02'|'AC9M7A03'|'AC9M7A04'|'AC9M7A05'|'AC9M7A06'|'AC9M8A01'|'AC9M8A02'|'AC9M8A03'|'AC9M8A04';skill:string;week:number;prompt:string;instruction:string;visual:PPVisual;mode:'number'|'choice'|'partition'|'algorithm'|'equivalent'|'select'|'product'|'testerChoice'|'filterBuilder'|'linearPair'|'plot'|'labChoice'|'labNumber';options:string[];correct:number;answers:number[];labels:string[];lab?:{kind:"volume"|"distance"|"linear";initial:number[];required:number[][]};plotPoints?:[number,number][];signed?:boolean;decimal?:boolean;total?:number;candidates?:number[];testDivisors?:number[];targetMultiple?:number;maxFactor?:number;equivalence?:{left:number;right:number;max:number};multiplier?:number;algorithmOffset?:number;difficulty:'accessible'|'moderate'|'challenging'};
export type PPResponse={choice?:number;values:string[];operations:PPOperation[];tests?:number[];points?:[number,number][];experiments?:number[][];skipped?:boolean};
const cards=(...cards:{label:string;text:string}[]):PPVisual=>({kind:'cards',cards});
const seq=(terms:(number|string)[],rule?:string):PPVisual=>({kind:'sequence',terms,rule});
function make(form:PPForm,f:number):PPItem[]{
 const out:PPItem[]=[];
 const add=(q:Partial<PPItem>&Pick<PPItem,'code'|'skill'|'week'|'prompt'|'visual'>)=>{
  const slot=out.length+1,item:PPItem={id:`pp-l3-${form}-${slot}`,slot,instruction:'',mode:'number',options:[],correct:0,answers:[],labels:['Your answer'],difficulty:slot<=5?'accessible':slot>=16?'challenging':'moderate',...q};
  if(item.options.length){const shift=(slot+f)%4;item.options=[...item.options.slice(shift),...item.options.slice(0,shift)];item.correct=(4-shift)%4;}
  out.push(item);
 };
 const a=3+f;
 add({code:'AC9M3N07',week:1,skill:'Follow repeated doubling',prompt:'Double each number. What comes next?',visual:seq([a,a*2,a*4,'?'],'Double each time'),answers:[a*8]});
 const part=24+f*3,other=17+f*2,whole=part+other;
 add({code:'AC9M3A01',week:4,skill:'Explain inverse operations',prompt:'Why does this subtraction give the missing number?',visual:cards({label:'Missing part',text:`${part} + ? = ${whole}`},{label:'Calculation',text:`${whole} − ${part}`}),mode:'choice',options:['Subtraction undoes adding the known part.','Subtracting always gives the larger part.','Adding and subtracting give the same answer.','The missing part is always the difference between the digits.']});
 const n=6+f,m=7;
 add({code:'AC9M3A02',week:7,skill:'Extend an addition fact',prompt:'Use the known fact to find the sum.',instruction:'Work it out without a calculator.',visual:cards({label:'Known fact',text:`${n} + ${m} = ${n+m}`},{label:'Find the sum',text:`${n*10} + ${m*10} = ?`}),answers:[(n+m)*10]});
 const columns=4+f;
 add({code:'AC9M3A03',week:7,skill:'Use the three times table',prompt:'How many counters are in the array?',visual:{kind:'array',rows:3,columns},answers:[3*columns]});
 const top=(5+f)*8;
 add({code:'AC9M3N07',week:1,skill:'Follow repeated halving',prompt:'Halve each number. What comes next?',visual:seq([top,top/2,top/4,'?'],'Halve each time'),answers:[top/8]});
 const left=28+f*7,missing=35+f*4;
 add({code:'AC9M3A01',week:6,skill:'Find an unknown addend',prompt:'Which number makes this true?',visual:cards({label:'Find the missing part',text:`${left} + ? = ${left+missing}`}),answers:[missing]});
 const small=8+f%3,total=small+6;
 add({code:'AC9M3A02',week:7,skill:'Extend a subtraction fact',prompt:'Use the known fact to find the difference.',instruction:'Work it out without a calculator.',visual:cards({label:'Known fact',text:`${total} − 6 = ${small}`},{label:'Find the difference',text:`${total*10} − 60 = ?`}),answers:[small*10]});
 const quotient=5+f;
 add({code:'AC9M3A03',week:4,skill:'Use related division facts',prompt:'What is the missing number?',visual:cards({label:'Divide into groups of four',text:`${4*quotient} ÷ 4 = ?`}),answers:[quotient]});
 const input=14+f*3;
 add({code:'AC9M3N07',week:2,skill:'Follow a decision algorithm',prompt:'Follow the correct path. What number comes out?',visual:{kind:'decision',input,yes:'Halve the number',no:'Add 5'},answers:[input%2===0?input/2:input+5]});
 const w=83+f*9,remain=36+f*4;
 add({code:'AC9M3A01',week:6,skill:'Find an unknown subtrahend',prompt:'What number was taken away?',visual:cards({label:'Find the missing number',text:`${w} − ? = ${remain}`}),answers:[w-remain]});
 const near=98-f,addend=7+2*f;
 add({code:'AC9M3A02',week:7,skill:'Bridge a hundred mentally',prompt:'Find the sum in your head.',instruction:'You can use 100 as a helpful step.',visual:cards({label:'Find the sum',text:`${near} + ${addend} = ?`}),answers:[near+addend]});
 const factor=4+f;
 add({code:'AC9M3A03',week:6,skill:'Find an unknown factor',prompt:'What number makes this true?',visual:cards({label:'Five times a number',text:`5 × ? = ${5*factor}`}),answers:[factor]});
 const tens=3+f;
 add({code:'AC9M3A03',week:4,skill:'Connect multiplication and division',prompt:'Which division fact matches?',visual:cards({label:'Multiplication fact',text:`10 × ${tens} = ${10*tens}`}),mode:'choice',options:[`${10*tens} ÷ 10 = ${tens}`,`${10*tens} ÷ ${tens} = ${tens}`,`${10*tens} ÷ 10 = ${tens+1}`,`10 ÷ ${tens} = ${10*tens}`]});
 const partitionTotal=64+f*7;
 add({code:'AC9M3A01',week:5,skill:'Partition a number',prompt:'Split this total into two parts.',instruction:'Choose two whole numbers greater than zero. There is more than one correct answer.',visual:cards({label:'Whole',text:String(partitionTotal)},{label:'Your two parts',text:'? + ?'}),mode:'partition',total:partitionTotal,labels:['First part','Second part'],answers:[20,partitionTotal-20]});
 const base=2+f;
 add({code:'AC9M3N07',week:8,skill:'Describe an emerging pattern',prompt:'What happens to the numbers each time?',visual:seq([base,base*2,base*4,base*8]),mode:'choice',options:['Each number is twice the number before.','The same amount is added every time.','Each number is half the number before.','Two is added every time.']});
 const first=38+f*10,second=8;
 add({code:'AC9M3A02',week:7,skill:'Choose an efficient mental strategy',prompt:'Which calculation keeps the same total?',instruction:'Move 2 from the second number to the first.',visual:cards({label:'Original calculation',text:`${first} + ${second}`}),mode:'choice',options:[`${first+2} + ${second-2}`,`${first+2} + ${second}`,`${first+2} + ${second+2}`,`${first-2} + ${second-2}`]});
 const k=4+f,product=4*k;
 add({code:'AC9M3A03',week:6,skill:'Complete related facts',prompt:'Fill both gaps.',visual:cards({label:'First fact',text:`4 × ? = ${product}`},{label:'Second fact',text:`${product} ÷ ? = ${k}`}),answers:[k,4],labels:['First gap','Second gap']});
 const p=38+f*6,q=27+f,r=30+f*3;
 add({code:'AC9M3A01',week:5,skill:'Balance equivalent expressions',prompt:'What number keeps both sides equal?',visual:cards({label:'Equal totals',text:`${p} + ${q} = ${r} + ?`}),answers:[p+q-r]});
 const minuend=152+f*11,sub=9;
 add({code:'AC9M3A02',week:7,skill:'Apply a mental subtraction strategy',prompt:'Subtract 9 in your head.',instruction:'Do not use a calculator.',visual:cards({label:'Find the difference',text:`${minuend} − ${sub} = ?`}),answers:[minuend-sub]});
 const multiplier=f%2===0?3:4,inputs=[2+f,4+f,7+f];
 add({code:'AC9M3N07',week:8,skill:'Create and test an algorithm',prompt:'Build a two-step rule for this machine.',instruction:'Tap two steps in order. Your rule must work for every row. You may use a step twice.',visual:{kind:'table',inputs,outputs:inputs.map(v=>v*multiplier)},mode:'algorithm',multiplier});
 return out;
}
export const LEVEL3_PP_FORMS=Object.fromEntries(PP_FORMS.map((f,i)=>[f,make(f,i)])) as Record<PPForm,PPItem[]>;
export const ppEmpty=():PPResponse=>({values:[],operations:[]});
export function ppReady(q:PPItem,r:PPResponse):boolean{
 if(r.skipped)return true;
 if(q.lab&&!q.lab.required.every(row=>r.experiments?.some(run=>run.length===row.length&&run.every((n,i)=>n===row[i]))))return false;
 if(q.mode==='plot')return r.points?.length===q.plotPoints!.length&&new Set(r.points.map(p=>p.join(','))).size===r.points.length&&r.points.every(([x,y])=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&x<=6&&y>=0&&y<=12);
 if(q.mode==='testerChoice'&&(!r.tests?.length||!r.tests.every(n=>Number.isInteger(n)&&n>=1&&n<=120)))return false;
 if(q.mode==='select')return r.values.length>0&&new Set(r.values).size===r.values.length&&r.values.every(v=>q.candidates!.includes(Number(v)));
 if(q.mode==='filterBuilder')return r.values.length===2&&r.values.every(v=>q.candidates!.includes(Number(v)));
 if(q.mode==='choice'||q.mode==='testerChoice'||q.mode==='labChoice')return Number.isInteger(r.choice)&&r.choice!>=0&&r.choice!<4;
 if(q.mode==='algorithm')return r.operations.length===2&&r.operations.every(v=>PP_OPERATIONS.includes(v));
 if(q.signed)return r.values.length===q.labels.length&&r.values.every(v=>/^-?\d+$/.test(v)&&Number.isFinite(Number(v)));
 if(q.decimal)return r.values.length===q.labels.length&&r.values.every(v=>/^\d+(\.\d+)?$/.test(v)&&Number.isFinite(Number(v)));
 return r.values.length===q.labels.length&&r.values.every(v=>/^\d+$/.test(v)&&Number.isSafeInteger(Number(v)));
}
export function ppRun(input:number,ops:readonly PPOperation[]):number{return ops.reduce((v,op)=>op==='Double'?v*2:op==='Halve'?v/2:op==='Add 5'?v+5:v+input,input);}
export function ppScore(q:PPItem,r:PPResponse):boolean{
 if(r.skipped||!ppReady(q,r))return false;
 if(q.mode==='choice'||q.mode==='testerChoice'||q.mode==='labChoice')return r.choice===q.correct;
 if(q.mode==='plot')return q.plotPoints!.every(([x,y])=>r.points!.some(p=>p[0]===x&&p[1]===y));
 if(q.mode==='select')return r.values.length===q.answers.length&&q.answers.every(n=>r.values.includes(String(n)));
 if(q.mode==='filterBuilder')return ppLcm(Number(r.values[0]),Number(r.values[1]))===q.targetMultiple;
 if(q.mode==='linearPair')return r.values.every(v=>Number(v)>=1&&Number(v)<=20)&&3*Number(r.values[0])+Number(r.values[1])===q.total;
 if(q.mode==='product')return r.values.every(v=>Number(v)>=2&&Number(v)<=q.maxFactor!)&&r.values.reduce((a,b)=>a*Number(b),1)===q.total;
 if(q.mode==='algorithm')return Array.from({length:11},(_,i)=>i).every(v=>ppRun(v,r.operations)===v*q.multiplier!+(q.algorithmOffset??0));
 if(q.mode==='equivalent')return r.values.every(v=>Number(v)>0&&Number(v)<=q.equivalence!.max)&&q.equivalence!.left+Number(r.values[0])===q.equivalence!.right+Number(r.values[1]);
 if(q.mode==='partition')return r.values.every(v=>Number(v)>0)&&r.values.reduce((a,b)=>a+Number(b),0)===q.total;
 return r.values.every((v,i)=>Number(v)===q.answers[i]);
}
export function ppLcm(a:number,b:number):number{let x=a,y=b;while(y){const r=x%y;x=y;y=r;}return a*b/x;}
export function ppVisualSpeech(v:PPVisual):string{
 if(v.kind==='graph')return `${v.caption} Horizontal axis: ${v.xLabel}. Vertical axis: ${v.yLabel}. Points: ${v.points.map(p=>p.join(', ')).join('; ')}.`;
 if(v.kind==='growing')return `Stages 1, 2 and 3. Each has ${v.rows} rows of purple tiles and one green tile. Stage 1 has one purple column, stage 2 has two, stage 3 has three.`;
 if(v.kind==='family')return `Product ${v.product}. Factors ${v.factors.join(' and ')}.`;
 if(v.kind==='area')return `${v.rows} rows. The left part has ${v.left} columns; the right part has ${v.right} columns. Find the missing partial product.`;
 if(v.kind==='filter')return `Test each number. Does it divide exactly by ${v.divisor}? If yes, keep it. If no, leave it out.`;
 if(v.kind==='cards')return v.cards.map(c=>`${c.label}: ${c.text}`).join('. ');
 if(v.kind==='sequence')return `${v.rule??''}. ${v.terms.join(', ')}`;
 if(v.kind==='array')return `${v.rows} rows of ${v.columns} counters.${v.splitAfter?` Split into ${v.splitAfter} columns and ${v.columns-v.splitAfter} columns.`:''}`;
 if(v.kind==='balance')return `Equal sides. Left: ${v.left}. Right: ${v.right}.`;
 if(v.kind==='parts')return `Whole: ${v.whole}. Parts: ${v.parts.join(', ')}. Diagram not to scale.`;
 if(v.kind==='decision')return `Input ${v.input}. Is it even? Yes: ${v.yes}. No: ${v.no}. Output unknown.`;
 return `Input and output table. ${v.inputs.map((n,i)=>`Input ${n}, output ${v.outputs[i]}`).join('. ')}`;
}
