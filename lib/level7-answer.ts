/** Input and marking contract shared by Level 7 practice and weekly quizzes. */
export type Level7Answer = {kind:'number'|'fraction'|'ratio'|'coordinates'|'list'|'expression'|'text'|'points'|'set';expected:string;prompt:string;unit?:string;format?:'decimal'|'fraction'|'simplest'|'integer';labels?:string[]};
type Question={prompt:string;answer:string;lessonId?:string};
const clean=(s:string)=>s.trim().replaceAll('−','-').replaceAll('–','-').replaceAll('×','*').replaceAll('÷','/');
export function scalarAnswer(s:string):number|null{
 s=clean(s);if(s.includes(',')&&!/^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(s))return null;s=s.replace(/,/g,'');
 const mixed=s.match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/);if(mixed){const d=Number(mixed[4]);return d?((Number(mixed[2])+Number(mixed[3])/d)*(mixed[1]?-1:1)):null;}
 if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*\/\s*\d+(?:\.\d+)?)?$/.test(s))return null;
 const [n,d]=s.split('/').map(Number),v=d===undefined?n:n/d;return Number.isFinite(v)?v:null;
}
export function level7Answer(q:Question):Level7Answer|null{
 if(!q.lessonId?.startsWith('y7-'))return null;
 const expected=clean(q.answer),p=q.prompt;
 const prompt=p.replace(/Which list is the complete sample space\?/,'List every outcome in the sample space.').replace(/Which fraction is at P\?/,'What fraction is at P?').replace(/Which expression matches\?/,'Write an expression.').replace(/Which expression gives/g,'Write an expression for').replace(/Which ordered pair/g,'What ordered pair');
 const unit=/percentage|percent(?!age)/i.test(p)&&!p.includes('decimal')?'%':/in cm³/.test(p)?'cm³':/in m³/.test(p)?'m³':/in cm²/.test(p)?'cm²':/in m²/.test(p)?'m²':/in degrees/.test(p)?'°':/in dollars/.test(p)?'$':/in mL/.test(p)?'mL':undefined;
 const base={expected,prompt,unit};
 if(/prime factorisation|expanded form/i.test(p))return null;
 if(expected.includes('=')&&!/^[a-zA-Z]\s*=/.test(expected))return null;

 if(/sample space/.test(p)&&/^\d+(?:,\s*\d+)+$/.test(expected))return {...base,kind:'set'};
 if(/^\(-?[\d.]+,\s*-?[\d.]+\)(?:;\s*\(-?[\d.]+,\s*-?[\d.]+\)){1,3}$/.test(expected))return {...base,kind:'points',labels:expected.split(';').flatMap((_,i)=>[`${String.fromCharCode(65+i)}: x`,`${String.fromCharCode(65+i)}: y`])};
 if(q.lessonId.startsWith('y7-chance-')){
  const missing=expected.match(/^Add the missing outcome (\d+)\.$/);
  if(missing)return {...base,kind:'number',expected:missing[1],prompt:p.replace('What needs changing?','Which outcome is missing?')};
  if(/probability of tails next/.test(p)&&expected.startsWith('1/2,'))return {...base,kind:'fraction',expected:'1/2'};
  if(/relative frequency closer/.test(p)&&expected.startsWith('B:'))return {...base,kind:'text',expected:'B',prompt:p+' Write A or B.'};
 }
 if(q.lessonId.startsWith('y7-space-')){
  const family=expected.match(/^(Rhombus|Parallelogram|Isosceles) \(.*\)$/);
  if(family)return {...base,kind:'text',expected:family[1]};
 }
 if(q.lessonId.startsWith('y7-statistics-')&&/^(Discrete|Continuous):/.test(expected))return {...base,kind:'text',expected:expected.split(':')[0],prompt:p+' Write discrete or continuous.'};
 if(q.lessonId.startsWith('y7-statistics-')&&/^(Mean|Median|Mode|Range), because/.test(expected))return {...base,kind:'text',expected:expected.split(',')[0]};
 if(q.lessonId.startsWith('y7-space-')&&/^[A-F]$/.test(expected))return {...base,kind:'text'};

 if(/^\(?\s*-?[\d.]+\s*,\s*-?[\d.]+\s*\)?$/.test(expected)&&/point|coordinate|pair|image|P =/i.test(p))return {...base,kind:'coordinates',labels:['x','y']};
 if(/^\d+(?:\.\d+)?\s*:\s*\d+(?:\.\d+)?$/.test(expected))return {...base,kind:'ratio',format:/simplif/i.test(p)?'simplest':undefined};
 if(scalarAnswer(expected)!==null){const format=/simplest/.test(p)?'simplest':/decimal/.test(p)?'decimal':/fraction/.test(p)?'fraction':undefined;return {...base,kind:format==='fraction'||format==='simplest'||expected.includes('/')?'fraction':'number',format};}
 if(/^-?[\d./]+(?:,\s*-?[\d./]+){1,5}$/.test(expected))return {...base,kind:'list',labels:expected.split(',').map((_,i)=>`Value ${i+1}`)};
 if(/^[\d\s.nxpyThVClw+*/()=−²³⁴⁵⁶⁷⁸⁹⁰¹-]+$/.test(expected)&&/[a-zA-Z+*()/=²³⁴⁵⁶⁷⁸⁹-]/.test(expected)&&!expected.includes(';'))return {...base,kind:'expression'};
 // Short shape names are recalled; explanatory and yes/no judgements remain choices.
 if(q.lessonId.startsWith('y7-space-')&&/^(Acute|Obtuse|Right-angled|Equilateral|Isosceles|Scalene|Square|Rectangle|Rhombus|Parallelogram|Trapezium|Kite|Concave|Convex|Regular convex|Irregular convex|Non-square rectangle|Non-square rhombus)$/i.test(expected))return {...base,kind:'text'};
 return null;
}
// Restricted arithmetic parser: no eval, function calls or arbitrary identifiers.
function expressionValue(source:string,variables:Record<string,number>):number|null{
 source=clean(source).replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,s=>'^'+[...s].map(c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join('')).replace(/\s+/g,'');
 if(source.length>120||!/^[\d.a-zA-Z+*/()^=-]+$/.test(source))return null;
 if(source.includes('=')){const parts=source.split('=');if(parts.length!==2||! /^[a-zA-Z]$/.test(parts[0]))return null;source=parts[1];}
 source=source.replace(/(\d|\)|[a-zA-Z])(?=[a-zA-Z(])/g,'$1*');
 const tokens=source.match(/\d+(?:\.\d*)?|\.\d+|[a-zA-Z]|[+*/()^-]/g)??[];let i=0;
 function atom():number{const t=tokens[i++];if(t==='('){const n=sum();if(tokens[i++]!==')')throw Error();return n;}if(t in variables)return variables[t];if(!t||!/^\d|^\./.test(t))throw Error();return Number(t);}
 function power():number{const n=atom();if(tokens[i]==='^'){i++;const exponent=signed();if(!Number.isInteger(exponent)||Math.abs(exponent)>6)throw Error();return n**exponent;}return n;}
 function signed():number{if(tokens[i]==='+'){i++;return signed();}if(tokens[i]==='-'){i++;return -signed();}return power();}
 function product():number{let n=signed();while(tokens[i]==='*'||tokens[i]==='/'){const op=tokens[i++],v=signed();n=op==='*'?n*v:n/v;}return n;}
 function sum():number{let n=product();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++],v=product();n=op==='+'?n+v:n-v;}return n;}
 try{const n=sum();return i===tokens.length&&Number.isFinite(n)?n:null;}catch{return null;}
}
export function stripAnswerUnit(spec:Level7Answer,value:string){const s=value.trim();return spec.unit==='$'?s.replace(/^\$\s*/,''):spec.unit&&s.endsWith(spec.unit)?s.slice(0,-spec.unit.length).trim():s;}
export function markLevel7Answer(spec:Level7Answer,response:string):boolean{
 const a=clean(stripAnswerUnit(spec,response)),b=clean(spec.expected);if(!a)return false;
 const near=(x:number|null,y:number|null)=>x!==null&&y!==null&&Math.abs(x-y)<=1e-8*Math.max(1,Math.abs(y));
 if(spec.kind==='number'||spec.kind==='fraction'){
  if(spec.format==='decimal'&&a.includes('/'))return false;
  if((spec.format==='fraction'||spec.format==='simplest')&&!/^-?\d+(?:\s*\/\s*\d+)?$/.test(a))return false;
  if(spec.format==='simplest'){const [n,d=1]=a.split('/').map(Number);let x=Math.abs(n),y=d;if(y<=0)return false;while(y){[x,y]=[y,x%y];}if(x!==1)return false;}
  return near(scalarAnswer(a),scalarAnswer(b));
 }
 if(spec.kind==='ratio'){const x=a.split(':').map(scalarAnswer),y=b.split(':').map(scalarAnswer);if(x.length!==2||x.some(v=>v===null)||!x[1])return false;if(spec.format==='simplest'&&(x[0]!==y[0]||x[1]!==y[1]))return false;return near(x[0]!/x[1]!,y[0]!/y[1]!);}
 if(spec.kind==='set'){const x=a.split(',').map(scalarAnswer),y=b.split(',').map(scalarAnswer);return x.every(v=>v!==null)&&new Set(x).size===x.length&&x.length===y.length&&x.every(v=>y.includes(v));}
 if(spec.kind==='points'){const x=a.replace(/[()]/g,'').split(/[;,]/).map(scalarAnswer),y=b.replace(/[()]/g,'').split(/[;,]/).map(scalarAnswer);return x.length===y.length&&x.every((v,i)=>near(v,y[i]));}
 if(spec.kind==='coordinates'||spec.kind==='list'){const parts=(s:string)=>s.replace(/[()]/g,'').split(',').map(scalarAnswer),x=parts(a),y=parts(b);return x.length===y.length&&x.every((v,i)=>near(v,y[i]));}
 if(spec.kind==='expression'){
  if(/model|expression|calculation/i.test(spec.prompt)&&!/[a-zA-Z+*/()^=-]/.test(a))return false;
  const variables=[...new Set(b.replace(/^[a-zA-Z]\s*=/,'').match(/[a-zA-Z]/g)??[])];if((a.replace(/^[a-zA-Z]\s*=/,'').match(/[a-zA-Z]/g)??[]).some(v=>!variables.includes(v)))return false;
  return [0,1,2,3,5,7,11,13,17].every(n=>{const vals=Object.fromEntries(variables.map((v,i)=>[v,((n+1)**(i+1))%19-7]));return near(expressionValue(a,vals),expressionValue(b,vals));});
 }
 return a.toLowerCase().replace(/[ .-]/g,'')===b.toLowerCase().replace(/[ .-]/g,'');
}
