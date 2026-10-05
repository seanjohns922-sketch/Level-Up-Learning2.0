/** Input and marking contract shared by Level 7 practice and weekly quizzes. */
export type Level7Answer = {kind:'number'|'fraction'|'ratio'|'coordinates'|'list'|'expression'|'text'|'points'|'set'|'build'|'place'|'sorter';expected:string;prompt:string;unit?:string;format?:'decimal'|'fraction'|'simplest'|'integer';labels?:string[];build?:Level7Build;place?:Level7Plane;sorter?:Level7Sorter};
type P={x:number;y:number};
/** A lettered shape on the −6 to 6 coordinate grid, with an optional mirror, centre and worked image. */
export type Level7Plane={shape:P[];labels:string[];mirror?:'x'|'y';mirrorX?:number[];centre?:P;image?:P[];solution?:P[];turn?:{centre:P;clockwise:boolean;degrees:90|180|270}};
/** A cube model the student builds on a 2 by 3 height plan (back row first, left to right, 0 to 4 cubes per stack). */
export type Level7Build = {mode:'plan'|'views'|'fewest'|'exact';plan?:number[];front?:number[];side?:number[];cubes?:number};
export const BUILD_MAX_HEIGHT = 4;
/** Front view = tallest stack in each column; side view = tallest stack in each row, back row first. */
export function buildViews(h:number[]){return {front:[0,1,2].map(i=>Math.max(h[i],h[i+3])),side:[Math.max(h[0],h[1],h[2]),Math.max(h[3],h[4],h[5])]};}
const sameList=(x:number[],y:number[])=>x.length===y.length&&x.every((v,i)=>v===y[i]);
/** The least number of cubes in any model with these front and side views (searches every model). */
export function fewestCubes(front:number[],side:number[]){
 let best=Infinity;
 for(let code=0;code<(BUILD_MAX_HEIGHT+1)**6;code++){const h=Array.from({length:6},(_,i)=>Math.floor(code/(BUILD_MAX_HEIGHT+1)**i)%(BUILD_MAX_HEIGHT+1)),v=buildViews(h);if(sameList(v.front,front)&&sameList(v.side,side))best=Math.min(best,h.reduce((t,n)=>t+n,0));}
 return best;
}
/** Whether a built model meets the instructions. View tasks accept any model with the right views. */
export function buildMeets(b:Level7Build,h:number[]){
 if(h.length!==6||h.some(n=>!Number.isInteger(n)||n<0||n>BUILD_MAX_HEIGHT))return false;
 if(b.mode==='plan')return sameList(h,b.plan!);
 const v=buildViews(h);if(!sameList(v.front,b.front!)||!sameList(v.side,b.side!))return false;
 const total=h.reduce((t,n)=>t+n,0);
 return b.mode==='views'||(b.mode==='fewest'?total===fewestCubes(b.front!,b.side!):total===b.cubes);
}
// answerUnit lets a generator state the answer's unit instead of relying on prompt wording.
type Question={prompt:string;answer:string;lessonId?:string;options?:string[];answerUnit?:string;answerLabels?:string[];build?:Level7Build;place?:Level7Plane;sorter?:Level7Sorter};
const clean=(s:string)=>s.trim().replaceAll('−','-').replaceAll('–','-').replaceAll('×','*').replaceAll('÷','/');
export function scalarAnswer(s:string):number|null{
 s=clean(s);if(s.includes(',')&&!/^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(s))return null;s=s.replace(/,/g,'');
 const mixed=s.match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/);if(mixed){const d=Number(mixed[4]);return d?((Number(mixed[2])+Number(mixed[3])/d)*(mixed[1]?-1:1)):null;}
 if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*\/\s*\d+(?:\.\d+)?)?$/.test(s))return null;
 const [n,d]=s.split('/').map(Number),v=d===undefined?n:n/d;return Number.isFinite(v)?v:null;
}
export function level7Answer(q:Question):Level7Answer|null{
 if(!q.lessonId?.startsWith('y7-'))return null;
 if(q.build)return {kind:'build',expected:q.answer,prompt:q.prompt,build:q.build};
 if(q.place)return {kind:'place',expected:q.answer,prompt:q.prompt,place:q.place};
 if(q.sorter)return {kind:'sorter',expected:q.answer,prompt:q.prompt,sorter:q.sorter};
 const expected=clean(q.answer);
 // Older saved integer questions stored their givens only in the answer choices.
 // Keep those values visible when restoring a question as a typed response.
 const legacyIntegers=q.lessonId==='y7-w9-l1'&&q.prompt==='Which integer is smallest?';
 if(legacyIntegers&&(!q.options||q.options.length<2||q.options.some(value=>!/^[-−]?\d+$/.test(value))))return null;
 const p=legacyIntegers?`Which integer is smallest: ${q.options!.join(', ')}?`:q.prompt;
 const prompt=p.replace(/Which list is the complete sample space\?/,'List every outcome in the sample space.').replace(/Which fraction is at P\?/,'What fraction is at P?').replace(/Which expression matches\?/,'Write an expression.').replace(/Which expression gives/g,'Write an expression for').replace(/Which ordered pair/g,'What ordered pair');
 // An empty answerUnit means the generator has declared the answer unitless.
 const unit=q.answerUnit!==undefined?(q.answerUnit==='dollars'?'$':q.answerUnit||undefined):/percentage|percent(?!age)/i.test(p)&&!p.includes('decimal')?'%':/in cm³/.test(p)?'cm³':/in m³/.test(p)?'m³':/in cm²/.test(p)?'cm²':/in m²/.test(p)?'m²':/in degrees/.test(p)?'°':/in dollars/.test(p)?'$':/in mL/.test(p)?'mL':/in g\/cm³/.test(p)?'g/cm³':/\bin (?:litres|L)\b|How many litres/.test(p)?'L':/\bin km\b/.test(p)?'km':/\bin kg\b/.test(p)?'kg':/\bin cm\b(?![²³])/.test(p)?'cm':/\bin (?:metres|m)\b(?![²³])/.test(p)?'m':undefined;
 const base={expected,prompt,unit};
 if(/prime factorisation|expanded form/i.test(p))return null;
 if(expected.includes('=')&&!/^[a-zA-Z]\s*=/.test(expected))return null;

 if(/sample space/.test(p)&&/^\d+(?:,\s*\d+)+$/.test(expected))return {...base,kind:'set'};
 if(/^\(-?[\d.]+,\s*-?[\d.]+\)(?:;\s*\(-?[\d.]+,\s*-?[\d.]+\)){1,3}$/.test(expected)){const names=q.answerLabels?.length===expected.split(';').length?q.answerLabels:expected.split(';').map((_,i)=>String.fromCharCode(65+i));return {...base,kind:'points',labels:names.flatMap(n=>[`${n}: x`,`${n}: y`])};}
 if(q.lessonId.startsWith('y7-chance-')){
  // One-word judgements (colour, player, group) and word sample spaces are typed.
  if(/^(Red|Blue|Green|Yellow|A|B|C|D|E|Equal)$/.test(expected))return {...base,unit:undefined,kind:'text'};
  if(/sample space/i.test(p)&&/^[A-Za-z]+(?:,\s*[A-Za-z]+)+$/.test(expected))return {...base,unit:undefined,kind:'set'};
  const missing=expected.match(/^Add the missing outcome (\d+)\.$/);
  if(missing)return {...base,kind:'number',expected:missing[1],prompt:p.replace('What needs changing?','Which outcome is missing?')};
  if(/probability of tails next/.test(p)&&expected.startsWith('1/2,'))return {...base,kind:'fraction',expected:'1/2'};
  if(/relative frequency closer/.test(p)&&expected.startsWith('B:'))return {...base,kind:'text',expected:'B',prompt:p+' Write A or B.'};
 }
 if(q.lessonId.startsWith('y7-space-')){
  const family=expected.match(/^(Rhombus|Parallelogram|Isosceles) \(.*\)$/);
  if(family)return {...base,kind:'text',expected:family[1]};
 }
 if(q.lessonId.startsWith('y7-statistics-')){
  if(/^(Discrete|Continuous):/.test(expected))return {...base,unit:undefined,kind:'text',expected:expected.split(':')[0],prompt:p+' Write discrete or continuous.'};
  if(/^(Mean|Median|Mode|Range), because/.test(expected))return {...base,unit:undefined,kind:'text',expected:expected.split(',')[0]};
  // One-word statistical judgements (shape, centre, group) are recalled rather than chosen.
  if(/^(Discrete|Continuous|Positive|Negative|Symmetric|Bimodal|Mean|Median|Mode|Equal|A|B)$/.test(expected))return {...base,unit:undefined,kind:'text'};
  if(/\bmodes?\b/i.test(p)&&/^-?[\d.]+(?:,\s*-?[\d.]+)+$/.test(expected))return {...base,kind:'set'};
 }
 if(q.lessonId.startsWith('y7-space-')&&/^[A-F]$/.test(expected))return {...base,kind:'text'};
 if(q.lessonId.startsWith('y7-space-')&&/^(Regular|Irregular|Concave) (pentagon|hexagon)$|^Quadrilateral$/.test(expected))return {...base,kind:'text'};

 if(/^\(?\s*-?[\d.]+\s*,\s*-?[\d.]+\s*\)?$/.test(expected)&&/point|coordinate|pair|image|P =/i.test(p))return {...base,kind:'coordinates',labels:['x','y']};
 if(/^\d+(?:\.\d+)?(?:\s*:\s*\d+(?:\.\d+)?){1,2}$/.test(expected))return {...base,kind:'ratio',format:/simplif/i.test(p)?'simplest':undefined,labels:['First amount','Second amount','Third amount'].slice(0,expected.split(':').length)};
 if(scalarAnswer(expected)!==null){const format=/simplest/.test(p)?'simplest':/decimal/.test(p)?'decimal':/fraction/.test(p)?'fraction':undefined;return {...base,kind:format==='fraction'||format==='simplest'||expected.includes('/')?'fraction':'number',format};}
 if(/^-?[\d./]+(?:,\s*-?[\d./]+){1,5}$/.test(expected))return {...base,kind:'list',labels:q.answerLabels??expected.split(',').map((_,i)=>`Value ${i+1}`)};
 if(/^[\d\s.nxpyThVClw+*/()=−²³⁴⁵⁶⁷⁸⁹⁰¹-]+$/.test(expected)&&/[a-zA-Z+*()/=²³⁴⁵⁶⁷⁸⁹-]/.test(expected)&&!expected.includes(';'))return {...base,kind:'expression'};
 // Short shape names are recalled; explanatory and yes/no judgements remain choices.
 if(q.lessonId.startsWith('y7-space-')&&/^(Acute|Obtuse|Right-angled|Equilateral|Isosceles|Scalene|Square|Rectangle|Rhombus|Parallelogram|Trapezium|Kite|Concave|Convex|Regular convex|Irregular convex|Non-square rectangle|Non-square rhombus|Other quadrilateral|Cube|Square pyramid|Triangular pyramid|Triangular prism|Rectangular prism|Pentagonal prism|Net|Height plan|Isometric drawing)$/i.test(expected))return {...base,kind:'text'};
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
 if(spec.kind==='build')return buildMeets(spec.build!,response.split(',').map(Number));
 if(spec.kind==='sorter')return sorterMeets(spec.sorter!,response.split('|'));
 const a=clean(stripAnswerUnit(spec,response)),b=clean(spec.expected);if(!a)return false;
 const near=(x:number|null,y:number|null)=>x!==null&&y!==null&&Math.abs(x-y)<=1e-8*Math.max(1,Math.abs(y));
 if(spec.kind==='number'||spec.kind==='fraction'){
  if(spec.format==='decimal'&&a.includes('/'))return false;
  // Fractions may also be written as mixed numbers, such as 4 5/12.
  if((spec.format==='fraction'||spec.format==='simplest')&&!/^-?(?:\d+\s+)?\d+(?:\s*\/\s*\d+)?$/.test(a))return false;
  if(spec.format==='simplest'){const m=a.match(/^-?(?:(\d+)\s+)?(\d+)(?:\s*\/\s*(\d+))?$/)!,n=Number(m[2]),d=Number(m[3]??1);let x=n,y=d;if(y<=0||(m[1]&&n>=d))return false;while(y){[x,y]=[y,x%y];}if(x!==1&&n!==0)return false;}
  return near(scalarAnswer(a),scalarAnswer(b));
 }
 // Two- or three-part ratios: every part must scale by the same factor.
 if(spec.kind==='ratio'){const x=a.split(':').map(scalarAnswer),y=b.split(':').map(scalarAnswer);if(x.length!==y.length||x.some(v=>v===null)||!x[0])return false;if(spec.format==='simplest'&&x.some((v,i)=>v!==y[i]))return false;return x.every((v,i)=>near(v!/x[0]!,y[i]!/y[0]!));}
 if(spec.kind==='set'){
  // Word outcomes (colours, letters) compare as case-insensitive sets; numbers compare by value.
  if(b.split(',').some(t=>scalarAnswer(t)===null)){const tok=(t:string)=>t.split(',').map(w=>w.trim().toLowerCase()).filter(Boolean),x=tok(a),y=tok(b);return new Set(x).size===x.length&&x.length===y.length&&x.every(v=>y.includes(v));}
  const x=a.split(',').map(scalarAnswer),y=b.split(',').map(scalarAnswer);return x.every(v=>v!==null)&&new Set(x).size===x.length&&x.length===y.length&&x.every(v=>y.includes(v));}
 if(spec.kind==='points'||spec.kind==='place'){const x=a.replace(/[()]/g,'').split(/[;,]/).map(scalarAnswer),y=b.replace(/[()]/g,'').split(/[;,]/).map(scalarAnswer);return x.length===y.length&&x.every((v,i)=>near(v,y[i]));}
 if(spec.kind==='coordinates'||spec.kind==='list'){const parts=(s:string)=>s.replace(/[()]/g,'').split(',').map(scalarAnswer),x=parts(a),y=parts(b);return x.length===y.length&&x.every((v,i)=>near(v,y[i]));}
 if(spec.kind==='expression'){
  if(/model|expression|calculation/i.test(spec.prompt)&&!/[a-zA-Z+*/()^=-]/.test(a))return false;
  const variables=[...new Set(b.replace(/^[a-zA-Z]\s*=/,'').match(/[a-zA-Z]/g)??[])];if((a.replace(/^[a-zA-Z]\s*=/,'').match(/[a-zA-Z]/g)??[]).some(v=>!variables.includes(v)))return false;
  return [0,1,2,3,5,7,11,13,17].every(n=>{const vals=Object.fromEntries(variables.map((v,i)=>[v,((n+1)**(i+1))%19-7]));return near(expressionValue(a,vals),expressionValue(b,vals));});
 }
 const norm=(s:string)=>s.toLowerCase().replace(/[ .-]/g,''),x=norm(a),y=norm(b);if(x===y)return true;
 // Shape names forgive a small slip (sqaure, rectagle) but never accept a different shape name.
 if(SHAPE_WORDS.has(y)&&!SHAPE_WORDS.has(x))return typoDistance(x,y)<=(y.length>=8?2:y.length>=5?1:0);
 return false;
}
const SHAPE_WORDS=new Set(['acute','obtuse','rightangled','equilateral','isosceles','scalene','square','rectangle','rhombus','parallelogram','trapezium','kite','quadrilateral','concave','convex','regularconvex','irregularconvex','nonsquarerectangle','nonsquarerhombus','otherquadrilateral','triangle','pentagon','hexagon','octagon','cube','squarepyramid','triangularpyramid','triangularprism','rectangularprism','pentagonalprism','regularpentagon','regularhexagon','irregularpentagon','irregularhexagon','concavepentagon','concavehexagon']);
/** Edit distance where swapping two neighbouring letters counts as one slip. */
function typoDistance(s:string,t:string){const d=Array.from({length:s.length+1},(_,i)=>Array.from({length:t.length+1},(_,j)=>i||j?(i?(j?0:i):j):0));
 for(let i=1;i<=s.length;i++)for(let j=1;j<=t.length;j++){d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(s[i-1]===t[j-1]?0:1));if(i>1&&j>1&&s[i-1]===t[j-2]&&s[i-2]===t[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);}
 return d[s.length][t.length];}

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

// ── Shape sorters (Space Weeks 9–10) ─────────────────────────────────────────────
// Shapes are real drawn polygons; their properties come from the geometry, so a sorter is
// marked by running every test shape through it. Any design that sorts every shape works.
export type Sorter7Shape={id:string;points:P[];show:'sides'|'angles'|'all'};
export type Sorter7Question='all3'|'exactly2'|'atLeast2'|'rightTri'|'obtuseTri'|'acuteTri'|'fourRight'|'fourEqual'|'twoParallel'|'oneParallel'|'kite'|'concave'|'regular'|'equalSides'|'fiveSides';
export const SORTER7_QUESTIONS:Record<Sorter7Question,string>={all3:'All 3 sides equal?',exactly2:'Exactly 2 sides equal?',atLeast2:'At least 2 sides equal?',rightTri:'Any angle equal to 90°?',obtuseTri:'Any angle greater than 90°?',acuteTri:'All angles less than 90°?',fourRight:'Four right angles?',fourEqual:'Four equal sides?',twoParallel:'Two pairs of parallel sides?',oneParallel:'Exactly one pair of parallel sides?',kite:'Two pairs of equal adjacent sides?',concave:'Any interior angle greater than 180°?',regular:'All sides and all angles equal?',equalSides:'All sides equal?',fiveSides:'Exactly 5 sides?'};
export type Sorter7Node={slot:number;yes?:Sorter7Node;no?:Sorter7Node};
export const SORTER7_TEMPLATES:Record<'single'|'chain'|'full',Sorter7Node>={
 single:{slot:0,yes:{slot:1},no:{slot:2}},
 chain:{slot:0,yes:{slot:1},no:{slot:2,yes:{slot:3},no:{slot:4}}},
 full:{slot:0,yes:{slot:1,yes:{slot:2},no:{slot:3}},no:{slot:4,yes:{slot:5},no:{slot:6}}},
};
/** Quadrilateral family tree boxes, left to right and top to bottom. A rhombus is also a kite. */
export const FAMILY7_SLOTS=['Trapezium','Parallelogram','Kite','Rectangle','Rhombus','Square'];
export type Level7Sorter={
 mode:'sort'|'flow'|'tree';shapes:Sorter7Shape[];
 /** The correct group for each shape (sort, flow) or the name in each box (tree). */
 target:string[];
 bins?:string[];template?:'single'|'chain'|'full';questions?:Sorter7Question[];outputs?:string[];
 /** Starting values for each box; locked boxes cannot be changed. Empty string means blank. */
 start?:string[];locked?:boolean[];
 /** The sorter to follow, drawn above the shapes in a sort task. */
 flow?:{title:string;template:'single'|'chain'|'full';values:string[]};
};
export function sorterSlots(t:Sorter7Node){const qs:number[]=[],outs:number[]=[];const walk=(n:Sorter7Node)=>{if(n.yes&&n.no){qs.push(n.slot);walk(n.yes);walk(n.no);}else outs.push(n.slot);};walk(t);return {questions:qs,outputs:outs,count:qs.length+outs.length};}
export function shapeFacts(ps:P[]){
 const n=ps.length,area=ps.reduce((s,p,i)=>{const q=ps[(i+1)%n];return s+p.x*q.y-q.x*p.y;},0),dir=area<0?-1:1;
 const near=(a:number,b:number,tol=1e-6)=>Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b));
 const sides=ps.map((p,i)=>Math.hypot(ps[(i+1)%n].x-p.x,ps[(i+1)%n].y-p.y));
 const angles=ps.map((p,i)=>{const a=ps[(i+n-1)%n],b=ps[(i+1)%n],u={x:a.x-p.x,y:a.y-p.y},v={x:b.x-p.x,y:b.y-p.y};let t=Math.atan2(dir*(v.x*u.y-v.y*u.x),v.x*u.x+v.y*u.y)*180/Math.PI;if(t<0)t+=360;return t;});
 let equalPairs=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(near(sides[i],sides[j]))equalPairs++;
 const dirs=ps.map((p,i)=>({x:ps[(i+1)%n].x-p.x,y:ps[(i+1)%n].y-p.y})),parallel=(i:number,j:number)=>Math.abs(dirs[i].x*dirs[j].y-dirs[i].y*dirs[j].x)<=1e-6*sides[i]*sides[j];
 const parallelPairs=n===4?[parallel(0,2),parallel(1,3)].filter(Boolean).length:0;
 const allSides=sides.every(x=>near(x,sides[0])),allAngles=angles.every(x=>Math.abs(x-angles[0])<1e-4);
 return {n,sides,angles,equalPairs,allSides,allAngles,rightAngles:angles.filter(x=>Math.abs(x-90)<1e-4).length,maxAngle:Math.max(...angles),parallelPairs,
  kite:n===4&&((near(sides[0],sides[1])&&near(sides[2],sides[3]))||(near(sides[1],sides[2])&&near(sides[3],sides[0]))),concave:angles.some(x=>x>180+1e-4)};
}
export function sorterYes(q:Sorter7Question,ps:P[]){const f=shapeFacts(ps);switch(q){
 case 'all3':return f.n===3&&f.allSides;case 'exactly2':return f.n===3&&f.equalPairs===1;case 'atLeast2':return f.n===3&&f.equalPairs>=1;
 case 'rightTri':return f.rightAngles>0;case 'obtuseTri':return f.maxAngle>90+1e-4&&f.maxAngle<180;case 'acuteTri':return f.maxAngle<90-1e-4;
 case 'fourRight':return f.n===4&&f.rightAngles===4;case 'fourEqual':return f.n===4&&f.allSides;case 'twoParallel':return f.parallelPairs===2;case 'oneParallel':return f.parallelPairs===1;case 'kite':return f.kite;
 case 'concave':return f.concave;case 'regular':return f.allSides&&f.allAngles;case 'equalSides':return f.allSides;case 'fiveSides':return f.n===5;}}
/** Runs one shape through a built sorter; null if a box on its route is blank or invalid. */
export function runSorter(t:Sorter7Node,values:string[],ps:P[]):string|null{let node=t;while(node.yes&&node.no){const q=values[node.slot] as Sorter7Question;if(!(q in SORTER7_QUESTIONS))return null;node=sorterYes(q,ps)?node.yes:node.no;}return values[node.slot]||null;}
export function sorterMeets(s:Level7Sorter,values:string[]){
 if(s.mode==='sort'||s.mode==='tree')return values.length===s.target.length&&values.every((v,i)=>v.trim().toLowerCase()===s.target[i].toLowerCase());
 const t=SORTER7_TEMPLATES[s.template!],slots=sorterSlots(t);if(values.length!==slots.count)return false;
 if(slots.questions.some(i=>!s.questions!.includes(values[i] as Sorter7Question))||slots.outputs.some(i=>!s.outputs!.includes(values[i])))return false;
 return s.shapes.every((sh,i)=>runSorter(t,values,sh.points)===s.target[i]);
}
/** Plain-language description of a drawn shape's markings, for read-aloud. */
export function sorterShapeSpeech(sh:Sorter7Shape){const f=shapeFacts(sh.points),name=f.n===3?'triangle':f.n===4?'quadrilateral':f.n===5?'pentagon':'hexagon';
 if(sh.show==='angles')return `Shape ${sh.id}: a triangle with angles ${f.angles.map(a=>Math.round(a)+'°').join(', ')}.`;
 const parts=[f.allSides?'all sides equal':f.equalPairs?`${f.equalPairs===1?'two sides':'some sides'} marked equal`:'no equal sides'];
 if(sh.show==='all'){if(f.rightAngles)parts.push(`${f.rightAngles} right angle${f.rightAngles>1?'s':''}`);if(f.allAngles&&!f.rightAngles)parts.push('all angles marked equal');if(f.n===4)parts.push(f.parallelPairs===2?'two pairs of parallel sides':f.parallelPairs===1?'one pair of parallel sides':'no parallel sides');if(f.concave)parts.push('one angle greater than 180°');}
 return `Shape ${sh.id}: a ${name} with ${parts.join(', ')}.`;}
