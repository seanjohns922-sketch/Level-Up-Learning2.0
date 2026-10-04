/** Input and marking contract shared by Level 7 practice and weekly quizzes. */
export type Level7Answer = {kind:'number'|'fraction'|'ratio'|'coordinates'|'list'|'expression'|'text'|'points'|'set';expected:string;prompt:string;unit?:string;format?:'decimal'|'fraction'|'simplest'|'integer';labels?:string[]};
// answerUnit lets a generator state the answer's unit instead of relying on prompt wording.
type Question={prompt:string;answer:string;lessonId?:string;options?:string[];answerUnit?:string;answerLabels?:string[]};
const clean=(s:string)=>s.trim().replaceAll('−','-').replaceAll('–','-').replaceAll('×','*').replaceAll('÷','/');
export function scalarAnswer(s:string):number|null{
 s=clean(s);if(s.includes(',')&&!/^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(s))return null;s=s.replace(/,/g,'');
 const mixed=s.match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/);if(mixed){const d=Number(mixed[4]);return d?((Number(mixed[2])+Number(mixed[3])/d)*(mixed[1]?-1:1)):null;}
 if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*\/\s*\d+(?:\.\d+)?)?$/.test(s))return null;
 const [n,d]=s.split('/').map(Number),v=d===undefined?n:n/d;return Number.isFinite(v)?v:null;
}
export function level7Answer(q:Question):Level7Answer|null{
 if(!q.lessonId?.startsWith('y7-'))return null;
 const expected=clean(q.answer);
 // Older saved integer questions stored their givens only in the answer choices.
 // Keep those values visible when restoring a question as a typed response.
 const legacyIntegers=q.lessonId==='y7-w9-l1'&&q.prompt==='Which integer is smallest?';
 if(legacyIntegers&&(!q.options||q.options.length<2||q.options.some(value=>!/^[-−]?\d+$/.test(value))))return null;
 const p=legacyIntegers?`Which integer is smallest: ${q.options!.join(', ')}?`:q.prompt;
 const prompt=p.replace(/Which list is the complete sample space\?/,'List every outcome in the sample space.').replace(/Which fraction is at P\?/,'What fraction is at P?').replace(/Which expression matches\?/,'Write an expression.').replace(/Which expression gives/g,'Write an expression for').replace(/Which ordered pair/g,'What ordered pair');
 const unit=q.answerUnit?(q.answerUnit==='dollars'?'$':q.answerUnit):/percentage|percent(?!age)/i.test(p)&&!p.includes('decimal')?'%':/in cm³/.test(p)?'cm³':/in m³/.test(p)?'m³':/in cm²/.test(p)?'cm²':/in m²/.test(p)?'m²':/in degrees/.test(p)?'°':/in dollars/.test(p)?'$':/in mL/.test(p)?'mL':/in g\/cm³/.test(p)?'g/cm³':/\bin (?:litres|L)\b|How many litres/.test(p)?'L':/\bin km\b/.test(p)?'km':/\bin kg\b/.test(p)?'kg':/\bin cm\b(?![²³])/.test(p)?'cm':/\bin (?:metres|m)\b(?![²³])/.test(p)?'m':undefined;
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
 if(/^\d+(?:\.\d+)?(?:\s*:\s*\d+(?:\.\d+)?){1,2}$/.test(expected))return {...base,kind:'ratio',format:/simplif/i.test(p)?'simplest':undefined,labels:['First amount','Second amount','Third amount'].slice(0,expected.split(':').length)};
 if(scalarAnswer(expected)!==null){const format=/simplest/.test(p)?'simplest':/decimal/.test(p)?'decimal':/fraction/.test(p)?'fraction':undefined;return {...base,kind:format==='fraction'||format==='simplest'||expected.includes('/')?'fraction':'number',format};}
 if(/^-?[\d./]+(?:,\s*-?[\d./]+){1,5}$/.test(expected))return {...base,kind:'list',labels:q.answerLabels??expected.split(',').map((_,i)=>`Value ${i+1}`)};
 if(/^[\d\s.nxpyThVClw+*/()=−²³⁴⁵⁶⁷⁸⁹⁰¹-]+$/.test(expected)&&/[a-zA-Z+*()/=²³⁴⁵⁶⁷⁸⁹-]/.test(expected)&&!expected.includes(';'))return {...base,kind:'expression'};
 // Short shape names are recalled; explanatory and yes/no judgements remain choices.
 if(q.lessonId.startsWith('y7-space-')&&/^(Acute|Obtuse|Right-angled|Equilateral|Isosceles|Scalene|Square|Rectangle|Rhombus|Parallelogram|Trapezium|Kite|Concave|Convex|Regular convex|Irregular convex|Non-square rectangle|Non-square rhombus|Other quadrilateral|Cube|Square pyramid|Triangular pyramid|Triangular prism|Rectangular prism|Pentagonal prism)$/i.test(expected))return {...base,kind:'text'};
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
 // Two- or three-part ratios: every part must scale by the same factor.
 if(spec.kind==='ratio'){const x=a.split(':').map(scalarAnswer),y=b.split(':').map(scalarAnswer);if(x.length!==y.length||x.some(v=>v===null)||!x[0])return false;if(spec.format==='simplest'&&x.some((v,i)=>v!==y[i]))return false;return x.every((v,i)=>near(v!/x[0]!,y[i]!/y[0]!));}
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

export type SimplificationTip = {original:string;simplified:string;divisor:number;instruction:string;required:boolean};
/** Offer a hint only when the value is right and a common whole-number factor exists. */
export function level7SimplificationTip(spec:Level7Answer,response:string):SimplificationTip|null{
 const original=clean(stripAnswerUnit(spec,response));
 const ratio=spec.kind==='ratio';
 if(!ratio&&spec.kind!=='fraction'&&spec.kind!=='number')return null;
 const ratioParts=ratio&&/^\d+(?:\s*:\s*\d+){2}$/.test(original)?original.split(':').map(Number):null;
 if(ratioParts){
  let x=0;for(const v of ratioParts){let p=x,q=v;while(q){[p,q]=[q,p%q];}x=p;}if(x<=1)return null;
  const required=spec.format==='simplest';
  if(!markLevel7Answer(required?{...spec,format:undefined}:spec,response))return null;
  const reduced=ratioParts.map(v=>v/x);
  return {original,simplified:reduced.join(':'),divisor:x,required,instruction:`Divide every amount by ${x}: ${ratioParts.map((v,i)=>`${v} ÷ ${x} = ${reduced[i]}`).join(', ')}.`};
 }
 const parts=original.match(ratio?/^(\d+)\s*:\s*(\d+)$/:/^(-?\d+)\s*\/\s*(\d+)$/);
 if(!parts)return null;
 const n=Number(parts[1]),d=Number(parts[2]);
 if(!Number.isSafeInteger(n)||!Number.isSafeInteger(d)||d<=0)return null;
 let x=Math.abs(n),y=d;while(y){[x,y]=[y,x%y];}if(x<=1)return null;
 const required=spec.format==='simplest';
 if(!markLevel7Answer(required?{...spec,format:undefined}:spec,response))return null;
 const top=n/x,bottom=d/x,simplified=ratio?`${top}:${bottom}`:bottom===1?String(top):`${top}/${bottom}`;
 return {original,simplified,divisor:x,required,instruction:ratio?`Divide both amounts by ${x}: ${n} ÷ ${x} = ${top} and ${d} ÷ ${x} = ${bottom}.`:`Divide the top and bottom by ${x}: ${n} ÷ ${x} = ${top} and ${d} ÷ ${x} = ${bottom}.`};
}
