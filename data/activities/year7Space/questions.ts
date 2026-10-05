import type {Lesson} from '@/data/programs/year1';
import type {LessonActivity} from '@/data/programs/types';
import type {MultipleChoiceQuestion} from '@/data/activities/year2/lessonEngine';
import type {Task7,P7,Polygon7,Flow7} from '@/data/assessments/revisions/level7StarpathFiveForms';
import {HEXOMINOES,VALID_NET_IDS,foldNet,relationBetween} from '@/data/activities/starpath/level5/nets';
import {space7Guide,space7SourceGuide,SPACE7_SKILL_GROUPS,SPACE7_READABILITY_REVISION} from './curriculum';
import {pickLevel7LessonQuiz} from '@/lib/level7-quiz';
import {buildViews,fewestCubes,BUILD_MAX_HEIGHT,runSorter,sorterSlots,shapeFacts,SORTER7_TEMPLATES,SORTER7_QUESTIONS,type Level7Build,type Level7Plane,type Level7Sorter,type Sorter7Question,type Sorter7Shape,type Sorter7Node} from '@/lib/level7-answer';
export type Space7Role='fast_thinking'|'reasoning'|'apply_create';
export type Space7Question=MultipleChoiceQuestion & {lessonId:string;version:2;skillKey:number;tier:Space7Role;steps:string[];answerLabels?:string[];build?:Level7Build;place?:Level7Plane;sorter?:Level7Sorter};
const pair=(p:P7)=>`(${p.x}, ${p.y})`;
const pts=(ps:P7[])=>ps.map(pair).join('; ');
const units=(n:number)=>`${n} unit${Math.abs(n)===1?'':'s'}`;
const regular=(n:number):Polygon7=>({points:Array.from({length:n},(_,i)=>({x:3*Math.cos(2*Math.PI*i/n),y:3*Math.sin(2*Math.PI*i/n)})),caption:`A regular ${n}-sided polygon: all sides and all interior angles are equal.`});
const POLYGON_NAMES:Record<number,string>={5:'pentagon',6:'hexagon',8:'octagon'};

// Level 7 Space. Students type most answers (face letters, counts, view heights, coordinates,
// shape and solid names); multiple choice is kept for judgements and choosing a decision.
export function space7Question(week:number,lesson:number,seed:number,role:Space7Role='fast_thinking'):Space7Question {
 const groups=SPACE7_SKILL_GROUPS[week-1]?.[lesson-1];if(!groups||!space7Guide(week,lesson))throw Error('Unknown Space Level 7 lesson');
 const key=groups[(seed>>>0)%groups.length],guide=space7SourceGuide(key);
 let state=(seed>>>0)||1;const int=(lo:number,hi:number)=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return lo+Math.floor(state/4294967296*(hi-lo+1));};
 const pick=<T,>(xs:readonly T[])=>xs[int(0,xs.length-1)];
 const a=int(3,8),b=int(2,5),k=int(2,4),dx=int(1,3),dy=-int(1,3),A=role==='apply_create',R=role==='reasoning',F=!A&&!R,variant=int(0,5);
 let prompt='',answer='',wrong:string[]=[],explanation='',visual:Task7|undefined,answerLabels:string[]|undefined;
 const choose=(p:string,right:string,wrongs:string[],e:string)=>{prompt=p;answer=right;wrong=wrongs;explanation=e;};
 // Wrong choices come from real errors first; simple shifts only fill gaps.
 const numeric=(p:string,n:number,e:string,errors:number[]=[])=>choose(p,String(n),[...errors,n+1,n-1,n+2,n*2,n+3].filter(v=>v!==n&&v>=0).map(String),e);
 const point=(p:string,q:P7,e:string,errors:P7[]=[])=>choose(p,pair(q),[...errors,{x:q.y,y:q.x},{x:-q.x,y:q.y},{x:q.x,y:-q.y},{x:q.x+1,y:q.y},{x:q.x,y:q.y+1}].map(pair).filter(s=>s!==pair(q)),e);
 const list=(p:string,values:number[],e:string,errors:number[][]=[])=>{answerLabels=values.length===3?['Left','Middle','Right']:['Back row','Front row'];choose(p,values.join(', '),[...errors,values.map(n=>n+1),values.slice().reverse(),values.map(n=>n+2),values.map(n=>n+3),values.map(n=>Math.max(0,n-1))].map(v=>v.join(', ')).filter(s=>s!==values.join(', ')),e);};
 const polygon=(p:Polygon7)=>{visual={mode:'choice',diagram:'polygons',instruction:'Use the stated side and angle properties.',polygons:[p]};};
 const heights=Array.from({length:6},()=>int(0,3));if(heights.filter(Boolean).length<3){for(const i of [0,2,4])heights[i]=int(1,3);}if(Math.max(...heights)<2)heights[2]=2;
 // At least one column has stacks in both rows, so hidden cubes matter in every view question.
 if(![0,1,2].some(i=>heights[i]>0&&heights[i+3]>0)){heights[1]=int(1,3);heights[4]=int(1,3);}
 const plan=()=>{visual={mode:'choice',diagram:'plans',instruction:'Back row is first. Front view looks from the marked front; side profile is listed back row first.',cols:3,rows:2,heights,showModel:true};};
 const planText=`Height plan, back row [${heights.slice(0,3).join(', ')}], front row [${heights.slice(3).join(', ')}]. `;
 const front=[0,1,2].map(i=>Math.max(heights[i],heights[i+3])),sums=[0,1,2].map(i=>heights[i]+heights[i+3]),side=[Math.max(...heights.slice(0,3)),Math.max(...heights.slice(3))],total=heights.reduce((s,n)=>s+n,0),occupied=heights.filter(Boolean).length;
 // Labelled drawings for the triangle and quadrilateral questions; "?" marks the unknown.
 const tri=(lengths:number[],labels:string[])=>{const [base,left,right]=lengths,apexX=(base*base+left*left-right*right)/(2*base);polygon({points:[{x:0,y:0},{x:base,y:0},{x:apexX,y:Math.sqrt(Math.max(0.01,left*left-apexX*apexX))}],sideLabels:labels,caption:'Triangle with the stated side lengths. Not to scale.'});};
 const quad=(kind:'parallelogram'|'rectangle'|'rhombus'|'square'|'kite'|'trapezium',s1:number,s2=s1,unknown=false)=>{const L=(n:number)=>unknown?'?':`${n} cm`,h=Math.sqrt(3)/2;
  const shapes={parallelogram:{points:[{x:0,y:0},{x:s1,y:0},{x:s1+s2*0.4,y:s2*0.9},{x:s2*0.4,y:s2*0.9}],sideLabels:[L(s1),L(s2),L(s1),L(s2)],angles:['66°','114°','66°','114°']},rectangle:{points:[{x:0,y:0},{x:s1,y:0},{x:s1,y:s2},{x:0,y:s2}],sideLabels:[L(s1),L(s2),L(s1),L(s2)],angles:['90°','90°','90°','90°']},rhombus:{points:[{x:0,y:0},{x:s1,y:0},{x:s1*1.5,y:s1*h},{x:s1/2,y:s1*h}],sideLabels:[L(s1),L(s1),L(s1),L(s1)],angles:['60°','120°','60°','120°']},square:{points:[{x:0,y:0},{x:s1,y:0},{x:s1,y:s1},{x:0,y:s1}],sideLabels:[L(s1),L(s1),L(s1),L(s1)],angles:['90°','90°','90°','90°']},kite:(()=>{const w=Math.min(s1,s2)*0.7;return {points:[{x:0,y:Math.sqrt(s1*s1-w*w)},{x:w,y:0},{x:0,y:-Math.sqrt(s2*s2-w*w)},{x:-w,y:0}],sideLabels:[L(s1),L(s2),L(s2),L(s1)]};})(),trapezium:{points:[{x:0,y:0},{x:6,y:0},{x:4.5,y:3},{x:1.5,y:3}]}} as const;
  polygon({...shapes[kind],caption:`A ${kind}. Not to scale.`} as Polygon7);};
 // A 3 by 3 footprint with n shaded positions in random places.
 const footprint=(n:number)=>{const cells=Array.from({length:9},(_,i)=>i);for(let i=8;i>0;i--){const j=int(0,i);[cells[i],cells[j]]=[cells[j],cells[i]];}visual={mode:'choice',diagram:'none',instruction:'Footprint (top view): shaded squares are occupied positions. Stack heights are not shown.',footprint:{cols:3,rows:3,occupied:cells.slice(0,n)}};};
 const sideTriangle=(lengths:number[])=>{const [base,left,right]=lengths,apexX=(base*base+left*left-right*right)/(2*base);polygon({points:[{x:0,y:0},{x:base,y:0},{x:apexX,y:Math.sqrt(left*left-apexX*apexX)}],sideLabels:[String(base)+' cm',String(right)+' cm',String(left)+' cm'],caption:'Triangle with the stated side lengths.'});};
 // ── Transformations use a lettered, lopsided triangle (a set of points): a single dot cannot
 // show a turn or a flip. Every shape and image stays on the −5 to 5 part of the grid.
 const TRI=['P','Q','R'];
 const vtx=(ps:P7[],names=TRI)=>ps.map((p,i)=>`${names[i]}${pair(p)}`).join(', ');
 const onGrid=(ps:P7[])=>ps.every(p=>Math.abs(p.x)<=5&&Math.abs(p.y)<=5);
 const triangle=(...moves:((ps:P7[])=>P7[])[])=>{const base=pick([[{x:0,y:0},{x:2,y:0},{x:0,y:3}],[{x:0,y:0},{x:3,y:0},{x:0,y:2}],[{x:0,y:0},{x:3,y:0},{x:1,y:2}],[{x:0,y:0},{x:2,y:0},{x:2,y:3}]]);
  for(let t=0;t<200;t++){const ox=int(-5,4),oy=int(-5,4),sh=base.map(p=>({x:p.x+ox,y:p.y+oy}));if(!sh.some(p=>p.x===0||p.y===0)&&onGrid(sh)&&moves.every(m=>onGrid(m(sh))))return sh;}
  throw Error('No triangle fits the grid');};
 const z=(n:number)=>n===0?0:n;
 const shift=(a:number,b:number)=>(ps:P7[])=>ps.map(p=>({x:p.x+a,y:p.y+b}));
 const flipX=(ps:P7[])=>ps.map(p=>({x:p.x,y:z(-p.y)})),flipY=(ps:P7[])=>ps.map(p=>({x:z(-p.x),y:p.y})),flipAt=(m:number)=>(ps:P7[])=>ps.map(p=>({x:2*m-p.x,y:p.y}));
 const turn=(c:P7,deg:90|180|270,cw:boolean)=>(ps:P7[])=>ps.map(p=>{let rx=p.x-c.x,ry=p.y-c.y;for(let i=0;i<((cw?deg:360-deg)/90)%4;i++)[rx,ry]=[ry,-rx];return {x:z(c.x+rx),y:z(c.y+ry)};});
 const O={x:0,y:0};
 const grid=(shape:P7[],extra:Partial<Level7Plane>={})=>{visual={mode:'choice',diagram:'none',instruction:'Triangle PQR on the coordinate grid.',plane7:{shape,labels:TRI,...extra}};};
 let placeSpec:Level7Plane|undefined;
 // The student places every corner of the image; the grid is drawn in the answer box.
 const place=(p:string,shape:P7[],image:P7[],e:string,extra:Partial<Level7Plane>={})=>{placeSpec={shape,labels:TRI,solution:image,...extra};visual=undefined;choose(p,pts(image),[pts(shape),pts(shift(1,0)(image)),pts(shift(0,1)(image)),pts(shift(-1,-1)(image))],e);};
 // Identify the single move from a triangle and its dashed image (interpretation, so choices).
 const identify=(shape:P7[],image:P7[],right:string,wrongs:string[],e:string)=>{grid(shape,{image});choose(`Triangle ${vtx(shape)} is mapped to the dashed triangle ${vtx(image,TRI.map(l=>l+'′'))}. Which single move does this?`,right,wrongs,e);};
 const moveText=(a:number,b:number)=>[a?`${units(Math.abs(a))} ${a>0?'right':'left'}`:'',b?`${units(Math.abs(b))} ${b>0?'up':'down'}`:''].filter(Boolean).join(' and ');
 // ── Shape sorters (Weeks 9–10): real drawn shapes sorted by yes/no questions. Every shape is
 // checked against its intended group before it is used.
 const RAD=Math.PI/180;
 const turnPts=(ps:P7[],deg:number)=>ps.map(p=>({x:p.x*Math.cos(deg*RAD)-p.y*Math.sin(deg*RAD),y:p.x*Math.sin(deg*RAD)+p.y*Math.cos(deg*RAD)}));
 const triAngles=(A:number,B:number):P7[]=>{const b=4*Math.sin(B*RAD)/Math.sin((180-A-B)*RAD);return [{x:0,y:0},{x:4,y:0},{x:b*Math.cos(A*RAD),y:b*Math.sin(A*RAD)}];};
 const triSides=(base:number,left:number,right:number):P7[]=>{const ax=(base*base+left*left-right*right)/(2*base);return [{x:0,y:0},{x:base,y:0},{x:ax,y:Math.sqrt(left*left-ax*ax)}];};
 const para=(a:number,b:number,deg:number):P7[]=>[{x:0,y:0},{x:a,y:0},{x:a+b*Math.cos(deg*RAD),y:b*Math.sin(deg*RAD)},{x:b*Math.cos(deg*RAD),y:b*Math.sin(deg*RAD)}];
 const ring=(rs:number[],offsets:number[]=rs.map(()=>0)):P7[]=>rs.map((r,i)=>({x:r*Math.cos((360*i/rs.length+offsets[i])*RAD),y:r*Math.sin((360*i/rs.length+offsets[i])*RAD)}));
 const MAKE:Record<string,()=>P7[]>={
  Equilateral:()=>{const n=int(3,6);return triSides(n,n,n);},
  Isosceles:()=>{const l=int(4,6),b=pick([2,3,5,7].filter(v=>v!==l));return triSides(b,l,l);},
  Scalene:()=>{const n=int(3,5);return triSides(n+1,n,n+2);},
  'Right-angled':()=>triAngles(90,pick([30,35,40,50,55,60])),
  Obtuse:()=>triAngles(pick([100,110,120,130]),pick([20,25,30])),
  Acute:()=>{const [p1,p2]=pick([[50,60],[55,65],[60,70],[45,75],[50,70],[65,65],[60,60]]);return triAngles(p1,p2);},
  Square:()=>{const n=int(2,4);return [{x:0,y:0},{x:n,y:0},{x:n,y:n},{x:0,y:n}];},
  Rectangle:()=>{const w=int(3,5),h=w-int(1,2);return [{x:0,y:0},{x:w,y:0},{x:w,y:h},{x:0,y:h}];},
  Rhombus:()=>{const n=int(3,4);return para(n,n,pick([55,60,65,70]));},
  Parallelogram:()=>para(int(4,5),int(2,3),pick([55,60,65,70])),
  Trapezium:()=>{const l=pick([0.5,1,1.5]),top=int(2,3),h=int(2,3);return [{x:0,y:0},{x:6,y:0},{x:l+top,y:h},{x:l,y:h}];},
  Kite:()=>{const s1=int(2,3),s2=s1+int(2,3),w=s1*0.7;return [{x:0,y:Math.sqrt(s1*s1-w*w)},{x:-w,y:0},{x:0,y:-Math.sqrt(s2*s2-w*w)},{x:w,y:0}];},
  Irregular:()=>{const k=int(0,2);return [{x:0,y:0},{x:5+k*0.5,y:0},{x:4,y:3},{x:0.5,y:2}];},
  'Regular pentagon':()=>ring([3,3,3,3,3]),'Regular hexagon':()=>ring([3,3,3,3,3,3]),
  'Irregular pentagon':()=>ring([3,2.4,3.3,2.7,3.1].map(r=>r+int(0,2)*0.1),[0,8,-6,10,-4]),
  'Irregular hexagon':()=>int(0,1)?ring([3,2.5,3.2,2.6,3.4,2.8],[0,6,-5,8,-6,4]):(()=>{const pts:P7[]=[];let px=0,py=0,dir=0;for(let i=0;i<6;i++){pts.push({x:px,y:py});px+=2.5*Math.cos(dir*RAD);py+=2.5*Math.sin(dir*RAD);dir+=i%2?70:50;}return pts;})(),
  // Concave shapes have a clear V-shaped notch so the reflex angle is easy to see.
  'Concave pentagon':()=>{const w=4+int(0,1),h=3+int(0,1)*0.5,d=1+int(0,1)*0.5;return [{x:0,y:0},{x:w,y:0},{x:w,y:h},{x:w/2,y:d},{x:0,y:h}];},
  'Concave hexagon':()=>{const w=4+int(0,1),h=3+int(0,1)*0.5;return pick([[{x:0,y:0},{x:w,y:0},{x:w,y:h},{x:w*0.65,y:h},{x:w*0.45,y:1},{x:0,y:h}],[{x:0,y:0},{x:w,y:0},{x:w,y:h},{x:w*0.4,y:h},{x:w*0.4,y:1.2},{x:0,y:1.2}]]);},
 };
 type Scn={questions:Sorter7Question[];outputs:string[];template:'chain'|'full';canonical:string[];pool:Record<string,()=>P7[]>;show:'sides'|'angles'|'all';noun:string};
 const polyPool=(kind:string)=>()=>MAKE[`${kind} ${pick(['pentagon','hexagon'])}`]();
 const SCN:Record<'sides'|'angles'|'quad4'|'quadFam'|'poly',Scn>={
  sides:{questions:['all3','exactly2','atLeast2','rightTri'],outputs:['Equilateral','Isosceles','Scalene'],template:'chain',canonical:['all3','Equilateral','exactly2','Isosceles','Scalene'],pool:{Equilateral:MAKE.Equilateral,Isosceles:MAKE.Isosceles,Scalene:MAKE.Scalene},show:'sides',noun:'triangle'},
  angles:{questions:['rightTri','obtuseTri','acuteTri','all3'],outputs:['Right-angled','Obtuse','Acute'],template:'chain',canonical:['rightTri','Right-angled','obtuseTri','Obtuse','Acute'],pool:{'Right-angled':MAKE['Right-angled'],Obtuse:MAKE.Obtuse,Acute:MAKE.Acute},show:'angles',noun:'triangle'},
  quad4:{questions:['fourRight','fourEqual','twoParallel','oneParallel'],outputs:['Square','Non-square rectangle','Non-square rhombus','Other quadrilateral'],template:'full',canonical:['fourRight','fourEqual','Square','Non-square rectangle','fourEqual','Non-square rhombus','Other quadrilateral'],pool:{Square:MAKE.Square,'Non-square rectangle':MAKE.Rectangle,'Non-square rhombus':MAKE.Rhombus,'Other quadrilateral':()=>MAKE[pick(['Parallelogram','Trapezium','Kite','Irregular'])]()},show:'all',noun:'quadrilateral'},
  quadFam:{questions:['twoParallel','oneParallel','kite','fourRight'],outputs:['Parallelogram','Trapezium','Kite'],template:'chain',canonical:['twoParallel','Parallelogram','oneParallel','Trapezium','Kite'],pool:{Parallelogram:()=>MAKE[pick(['Parallelogram','Rectangle'])](),Trapezium:MAKE.Trapezium,Kite:MAKE.Kite},show:'all',noun:'quadrilateral'},
  poly:{questions:['concave','regular','equalSides','fiveSides'],outputs:['Concave','Regular convex','Irregular convex'],template:'chain',canonical:['concave','Concave','regular','Regular convex','Irregular convex'],pool:{Concave:polyPool('Concave'),'Regular convex':polyPool('Regular'),'Irregular convex':polyPool('Irregular')},show:'all',noun:'polygon'},
 };
 const LETTERS='ABCDEF';
 const canon=(sc:Scn,ps:P7[])=>runSorter(SORTER7_TEMPLATES[sc.template],sc.canonical,ps);
 const makeShape=(sc:Scn,group:string,id:string):Sorter7Shape=>{for(let t=0;t<40;t++){const ps=turnPts(sc.pool[group](),int(0,23)*15);if(canon(sc,ps)===group)return {id,points:ps,show:sc.show};}throw Error(`No ${group} shape`);};
 /** A set covering every group at least once, in random order. */
 const sampleSet=(sc:Scn,count:number)=>{const groups=[...sc.outputs];while(groups.length<count)groups.push(pick(sc.outputs));for(let i=groups.length-1;i>0;i--){const j=int(0,i);[groups[i],groups[j]]=[groups[j],groups[i]];}const g=groups.slice(0,count);return {shapes:g.map((x,i)=>makeShape(sc,x,LETTERS[i])),target:g};};
 const toFlow=(node:Sorter7Node,values:string[]):Flow7=>node.yes&&node.no?{question:SORTER7_QUESTIONS[values[node.slot] as Sorter7Question],yes:toFlow(node.yes,values),no:toFlow(node.no,values)}:values[node.slot];
 const route=(sc:Scn,sh:Sorter7Shape,values=sc.canonical)=>{let node=SORTER7_TEMPLATES[sc.template];const steps:string[]=[];while(node.yes&&node.no){const q=values[node.slot] as Sorter7Question,yes=runSorter({slot:0,yes:{slot:1},no:{slot:2}},[q,'Y','N'],sh.points)==='Y';steps.push(`${yes?'Yes':'No'} to “${SORTER7_QUESTIONS[q]}”`);node=yes?node.yes:node.no;}return `Shape ${sh.id} answers ${steps.join(' and ')}, so it reaches ${values[node.slot]}.`;};
 const designText=(sc:Scn)=>{const t=SORTER7_TEMPLATES[sc.template],v=sc.canonical;return t.yes!.yes?`One sorter that works: ask “${SORTER7_QUESTIONS[v[0] as Sorter7Question]}” first. On both branches ask “${SORTER7_QUESTIONS[v[1] as Sorter7Question]}”.`:`One sorter that works: ask “${SORTER7_QUESTIONS[v[0] as Sorter7Question]}” (Yes → ${v[1]}), then “${SORTER7_QUESTIONS[v[2] as Sorter7Question]}” (Yes → ${v[3]}, No → ${v[4]}).`;};
 let sorterSpec:Level7Sorter|undefined;
 const variants=(target:string[],choices:string[])=>{const out:string[]=[];for(let i=0;i<target.length&&out.length<3;i++){const c=choices.find(x=>x!==target[i]);if(c)out.push(target.map((x,j)=>j===i?c:x).join('|'));}return out;};
 /** Sort drawn shapes into groups (clicked); the sorter is shown beside them when given. */
 const sortTask=(p:string,shapes:Sorter7Shape[],target:string[],bins:string[],e:string,flow?:Level7Sorter['flow'])=>{sorterSpec={mode:'sort',shapes,target,bins,flow};visual=undefined;choose(p,target.join('|'),variants(target,bins),e);};
 /** Build or fix a sorter; it is marked by running every test shape through it. */
 const flowTask=(p:string,sc:Scn,set:{shapes:Sorter7Shape[];target:string[]},start:string[],locked:boolean[],e:string)=>{sorterSpec={mode:'flow',shapes:set.shapes,target:set.target,template:sc.template,questions:sc.questions,outputs:sc.outputs,start,locked};visual=undefined;const right=sc.canonical.join('|'),cands=[start.map(v=>v||'?').join('|'),[...sc.canonical].reverse().join('|'),...sc.questions.map(q=>[q,...sc.canonical.slice(1)].join('|')),...variants(sc.canonical,sc.outputs)];choose(p,right,[...new Set(cands)].filter(x=>x!==right).slice(0,3),e);};
 const letter=(i:number)=>String.fromCharCode(65+i);
 switch(key){
 // ── Nets (AC9M7SP01)
 case 1:{
  if(A){const [solid,faces]=pick([['Square pyramid','one square and four triangles'],['Triangular prism','two triangles and three rectangles'],['Rectangular prism','six rectangles in three matching pairs'],['Triangular pyramid','four triangles'],['Pentagonal prism','two pentagons and five rectangles']] as const);visual={mode:'choice',diagram:'none',instruction:'The net drawn flat. Faces are not to scale.',solidNet:({'Square pyramid':'squarePyramid','Triangular prism':'triangularPrism','Rectangular prism':'rectangularPrism','Triangular pyramid':'triangularPyramid','Pentagonal prism':'pentagonalPrism'} as const)[solid]};choose(`A net is made from ${faces}. What solid does it fold into?`,solid,['Cube','Square pyramid','Triangular prism','Rectangular prism','Triangular pyramid'].filter(s=>s!==solid),`Match the faces: ${faces} fold into a ${solid.toLowerCase()}.`);break;}
  const valid=R?variant%2===0:int(0,1)===1,invalid=Object.keys(HEXOMINOES).filter(i=>!VALID_NET_IDS.includes(i)),id=valid?VALID_NET_IDS[int(0,VALID_NET_IDS.length-1)]:invalid[int(0,invalid.length-1)];
  visual={mode:'choice',diagram:'net',instruction:'Fold along shared square edges.',cells:HEXOMINOES[id]};
  if(F)choose('Can this arrangement fold into a cube without overlap?',valid?'Yes; the folds give six distinct faces.':'No; at least two squares fold onto the same face.',valid?['No; every cube net must look like a cross.','No; cubes need eight faces.','Yes, but only if it is cut differently.']:['Yes; six squares are always sufficient.','Yes; overlapping faces are allowed.','No; a cube has five faces.'],valid?'Tracking each fold places one square on each of the six faces.':'Tracking the folds creates overlapping faces, so the box will not close.');
  else if(valid)choose('A student says this is not a cube net because it is not shaped like a cross. Is the student right?','No; it still folds to six different faces.',['Yes; only the cross shape folds into a cube.','Yes; a cube net must be a 2 by 3 rectangle.','No; any six connected squares make a cube.'],'There are 11 different cube nets. Trace the folds rather than relying on the cross shape.');
  else choose('A student says this arrangement must fold into a cube because it has six connected squares. Is the student right?','No; two squares fold onto the same face, leaving a face open.',['Yes; six connected squares always make a cube.','Yes, if the squares are the same size.','No; a cube net needs eight squares.'],'Six squares are needed, but the arrangement also has to put one square on each face.');
  break;}
 case 2:{
  const cells=HEXOMINOES[VALID_NET_IDS[int(0,VALID_NET_IDS.length-1)]],marked=int(0,5),fold=foldNet(cells),target=cells.findIndex(c=>relationBetween(fold,cells[marked],c)==='opposite');
  visual={mode:'choice',diagram:'net',instruction:'Letters identify the faces. Trace the folds.',cells,marked};
  const others=cells.map((_,i)=>letter(i)).filter(s=>s!==letter(target));
  if(F)choose(`Face ${letter(marked)} is marked. Which face is opposite it when the net is folded? Type the letter.`,letter(target),others,`Follow the folds: ${letter(marked)} and ${letter(target)} end on opposite sides with no shared edge.`);
  else if(R){const dist=(i:number)=>Math.abs(cells[i].r-cells[marked].r)+Math.abs(cells[i].c-cells[marked].c),far=cells.map((_,i)=>i).filter(i=>i!==marked&&i!==target).sort((p,q)=>dist(q)-dist(p))[0];choose(`A student says face ${letter(far)} is opposite ${letter(marked)} because it is far away in the flat net. Which face is really opposite ${letter(marked)}? Type the letter.`,letter(target),others,`Distance in the flat net does not decide opposite faces; folding does. ${letter(target)} is opposite ${letter(marked)}.`);}
  else choose(`Face ${letter(marked)} is the bottom of a cube-shaped box. Which face will be its lid? Type the letter.`,letter(target),others,`The lid is the face opposite the bottom: ${letter(target)}.`);
  break;}
 case 3:{
  const sides=b+3;visual={mode:'choice',diagram:'none',instruction:'Back edges are dashed. Every corner is marked with a dot.',prism:sides};
  if(F)numeric(`A right prism has ${sides}-sided polygon ends. How many rectangular side faces does its net need?`,sides,`One rectangular side face for each of the ${sides} edges of an end.`,[sides+2,sides*2]);
  else if(R)numeric(`A student says a prism with ${sides}-sided ends has ${sides+1} faces. How many faces does it really have?`,sides+2,`${sides} rectangular sides plus two matching ends: ${sides+2} faces. The student forgot one end.`,[sides+1,sides,sides*2]);
  else{const ask=pick(['faces','edges','vertices'] as const),value=ask==='faces'?sides+2:ask==='edges'?3*sides:2*sides;numeric(`A designer makes a box shaped like a prism with ${sides}-sided ends. How many ${ask} does the box have?`,value,ask==='faces'?`${sides} sides plus 2 ends.`:ask==='edges'?`${sides} edges on each end plus ${sides} edges joining them: ${3*sides}.`:`${sides} corners on each of the two ends: ${2*sides}.`,[sides+2,3*sides,2*sides,sides]);}
  break;}
 // ── Plans and views (AC9M7SP01)
 case 4:{plan();
  if(F)numeric(planText+'How many ground positions are occupied?',occupied,'Count the nonzero entries in the plan.',[total,6]);
  else if(R)numeric(planText+'Model B has the same footprint, but every stack is 1 cube tall. How many more cubes does this model have than Model B?',total-occupied,`This model has ${total} cubes; Model B has one per occupied position, ${occupied}. Same footprint, different heights.`,[total,occupied]);
  else numeric(planText+'One cube is added on top of every occupied stack. How many ground positions are occupied now?',occupied,'Adding height above occupied positions does not change the footprint.',[occupied*2,total+occupied,total]);
  break;}
 case 5:{plan();
  if(F)list(planText+'Type the front-view heights from left to right.',front,'Compare the back and front entries in each column and use the greater height.',[sums,heights.slice(3),heights.slice(0,3)]);
  else if(R)list(planText+`A student added the stacks in each column and wrote ${sums.join(', ')}. Type the correct front-view heights, left to right.`,front,'Stacks behind are hidden by taller or equal stacks in front, so take the tallest in each column, not the sum.',[sums,heights.slice(3)]);
  else list(planText+'Type the heights seen from the BACK, listed left to right as you look from the back.',front.slice().reverse(),'The back view shows the same column heights as the front view, in reverse order.',[front,sums.slice().reverse()]);
  break;}
 case 6:{plan();
  if(F)list(planText+'Type the side-profile heights for the back row and the front row.',side,'The tallest stack in each row gives that row’s side-view height.',[[heights[0],heights[3]],[heights.slice(0,3).reduce((s,n)=>s+n,0),heights.slice(3).reduce((s,n)=>s+n,0)]]);
  else if(R){
   // Use a mistake that really gives a different answer for this plan.
   const rowSum=[heights.slice(0,3).reduce((s,n)=>s+n,0),heights.slice(3).reduce((s,n)=>s+n,0)],mistakes:[string,number[]][]=[['used only the leftmost stack in each row',[heights[0],heights[3]]],['added the stacks in each row',rowSum],['used only the rightmost stack in each row',[heights[2],heights[5]]]],m=mistakes.find(([,v])=>v.join()!==side.join())??mistakes[1];
   list(planText+`A student ${m[0]} and wrote ${m[1].join(', ')}. Type the correct side profile, back row first.`,side,'A side view shows the tallest stack across each whole row.',[m[1]]);
  }
  else{const next=heights.slice();next[3]+=1;list(planText+'One cube is added to the front-left stack. Type the new side profile, back row first.',[Math.max(...next.slice(0,3)),Math.max(...next.slice(3))],'Recalculate the tallest stack in each row after the change.',[side,[side[0],side[1]+1]]);}
  break;}
 case 7:{plan();const max=Math.max(...heights);
  if(F)numeric(planText+'How many unit cubes build this model?',total,'Add every stack height, including hidden cubes.',[occupied,max,front.reduce((s,n)=>s+n,0)]);
  else if(R)numeric(planText+`A student counted only the visible top faces and got ${occupied}. How many cubes are there really?`,total,`Each entry is a whole stack: ${heights.join(' + ')} = ${total}.`,[occupied,front.reduce((s,n)=>s+n,0)]);
  else numeric(planText+`How many more cubes are needed to fill the model into a solid 3 by 2 by ${max} block?`,6*max-total,`A full block has 3 × 2 × ${max} = ${6*max} cubes; ${6*max} − ${total} = ${6*max-total}.`,[6*max,total,6-occupied]);
  break;}
 case 8:{
  footprint(a);
  if(F)numeric(`A footprint has ${a} occupied positions. Each occupied stack is at least 1 cube tall. What is the least possible cube total?`,a,'Use 1 cube at every occupied position.',[a+1,a*2]);
  else if(R)numeric(`A footprint has ${a} occupied positions and each stack is 1 to ${k} cubes tall. How many different cube totals are possible?`,a*k-a+1,`Totals run from ${a} to ${a*k}, every whole number in between: ${a*k} − ${a} + 1 = ${a*k-a+1}. One view does not fix the object.`,[a*k,a*k-a,k]);
  else numeric(`A footprint has ${a} occupied positions. Each stack is at least 1 and at most ${k} cubes tall. What is the greatest possible cube total?`,a*k,'Use the upper height limit at every occupied position.',[a+k,a*(k-1),k]);
  break;}
 case 9:{visual={mode:'choice',diagram:'plans',instruction:'Three representations: a height plan, an isometric drawing and a net.',heights,cols:3,rows:2,showModel:true,solidNet:'rectangularPrism'};const context=int(0,2),requests=['cut connected faces from one sheet for a box','find exact stack heights and occupied floor positions','show the overall three-dimensional appearance'];
  if(R){const q=pick([['What can a height plan show that an isometric drawing might hide?','Cubes hidden behind taller stacks.',['The colour of every cube.','The total area of the floor only.','Nothing; they always show the same information.']],['What does a footprint NOT tell you?','How tall each stack is.',['Which ground positions are used.','How many ground positions are used.','The shape of the base.']],['Why might an isometric drawing be less useful than a height plan for counting cubes?','Some cubes can be hidden from view.',['Isometric drawings never show cubes.','Height plans show colour.','Isometric drawings are always too small.']]] as const);choose(q[0],q[1],[...q[2]],`${q[1]} Each representation shows some information and can hide other information.`);}
  else{const why={Net:'A net lays out every face and the shared folding edges.','Height plan':'A height plan records every ground position and its exact stack height.','Isometric drawing':'An isometric drawing shows the overall three-dimensional form, though it can hide cubes.'},names=Object.keys(why) as (keyof typeof why)[];
   // Fluency names the representation for a stated purpose; application reads a real job.
   const [job,best]=A?pick([['A packaging company will cut a cereal box from one sheet of cardboard.','Net'],['A builder must order exactly the right number of blocks for a stepped wall.','Height plan'],['An architect wants to show a client what the finished building will look like.','Isometric drawing'],['A gift shop prints a design that customers fold into a box.','Net'],['A teacher wants students to rebuild a cube model exactly from a worksheet.','Height plan'],['A museum poster shows what a block sculpture looks like.','Isometric drawing']] as const):[`You need to ${requests[context]}.`,(['Net','Height plan','Isometric drawing'] as const)[context]];
   choose(`${job} Which representation is best? Type net, height plan or isometric drawing.`,best,[...names.filter(n=>n!==best),'Footprint'],why[best]);}
  break;}
 // ── Triangles and quadrilaterals (AC9M7SP02)
 case 10:{const v=int(0,2),lengths=v===0?[a,a,a]:v===1?[a,a,a+1]:[a,a+1,a+2],label=['Equilateral','Isosceles','Scalene'][v];
  if(F){sideTriangle(lengths);choose(`A triangle has side lengths ${lengths.join(', ')} cm. Type its classification by sides.`,label,['Equilateral','Isosceles','Scalene','Right-angled'].filter(s=>s!==label),'Count the equal side lengths. Here isosceles means exactly two equal sides.');}
  else if(R){const iso=[a,a+1,a];sideTriangle(iso);choose(`A student says a triangle with sides ${iso.join(', ')} cm is scalene because the equal sides are not next to each other in the list. Type the correct classification by sides.`,'Isosceles',['Scalene','Equilateral','Obtuse'],'Order in a list does not matter: two sides are equal, so it is isosceles.');}
  else{const drawn=int(2,2*a-1),third=drawn===a?a+1:drawn;tri([third,a,a],['?',`${a} cm`,`${a} cm`]);numeric(`An isosceles triangle has two equal sides of ${a} cm and a perimeter of ${2*a+third} cm. How long is the third side in cm?`,third,`Perimeter − two equal sides: ${2*a+third} − ${2*a} = ${third}.`,[2*a+third-a,a]);}
  break;}
 case 11:{const sets=[[50,60,70],[30,60,90],[25,45,110],[40,65,75],[20,70,90],[35,40,105]],angles=pick(sets),name=Math.max(...angles)>90?'Obtuse':angles.includes(90)?'Right-angled':'Acute';
  const draw=(ang:number[],hideThird=false)=>{const base=5,left=base*Math.sin(ang[1]*Math.PI/180)/Math.sin(ang[2]*Math.PI/180);polygon({points:[{x:0,y:0},{x:base,y:0},{x:left*Math.cos(ang[0]*Math.PI/180),y:left*Math.sin(ang[0]*Math.PI/180)}],angles:ang.map((n,i)=>hideThird&&i===2?'?':String(n)+'°'),caption:'Triangle with the stated interior angles.'});};
  if(F){draw(angles);choose(`A triangle has angles ${angles.join('°, ')}°. Type its classification by angles.`,name,['Acute','Right-angled','Obtuse','Equilateral'].filter(s=>s!==name),`The greatest angle is ${Math.max(...angles)}°.`);}
  else if(R){const t=pick(sets.filter(s=>Math.max(...s)>=90)),n2=Math.max(...t)>90?'Obtuse':'Right-angled';draw(t);choose(`A student says a triangle with angles ${t.join('°, ')}° is acute because two of its angles are acute. Type the correct classification by angles.`,n2,['Acute','Equilateral',n2==='Obtuse'?'Right-angled':'Obtuse'],`Classify by the largest angle: ${Math.max(...t)}°. Every triangle has at least two acute angles.`);}
  else{draw(angles,true);choose(`A triangle has two angles of ${angles[0]}° and ${angles[1]}°. Type its classification by angles.`,name,['Acute','Right-angled','Obtuse','Equilateral'].filter(s=>s!==name),`The third angle is 180 − ${angles[0]} − ${angles[1]} = ${angles[2]}°, so the triangle is ${name.toLowerCase()}.`);}
  break;}
 case 12:{
  if(R&&int(0,1)===1)choose('A gate frame is four rods joined by hinges at the corners, so it can lean into a parallelogram. A diagonal brace stops it moving. What shape does the brace create? Type the shape name.','Triangle',['Square','Rectangle','Parallelogram'],'Three rods with fixed lengths can only be joined one way, so a triangle cannot change shape. The brace splits the frame into two rigid triangles.');
  else if(A&&int(0,1)===1){const sides=int(4,8),name={4:'square',5:'pentagon',6:'hexagon',7:'heptagon',8:'octagon'}[sides];numeric(`A ${name} frame is made of ${sides} rods hinged at the corners, so it can change shape. Braces from one corner split it into triangles, which makes it rigid. How many braces are needed?`,sides-3,`Braces from one corner to every corner that is not next to it make ${sides-2} triangles. That takes ${sides} − 3 = ${sides-3} braces.`,[sides-2,sides,sides-1]);}
  else if(R){const longest=a+b+(int(0,1)?0:-1);choose(`Can side lengths ${a}, ${b} and ${longest} cm enclose a triangle?`,a+b>longest?'Yes; the two shorter lengths add to more than the longest.':'No; the two shorter lengths only equal the longest.',a+b>longest?['No; all sides must be equal.','Yes; adding any two positive numbers is sufficient.','No; the longest must exceed the other two combined.']:['Yes; equality is sufficient.','Yes; every three lengths make a triangle.','No; a triangle must have a right angle.'],'The two shorter sides must add to more than the longest.');}
  else{tri([a,b,(Math.abs(a-b)+a+b)/2],[`${a} cm`,'?',`${b} cm`]);numeric(`Two sides of a triangle are ${a} cm and ${b} cm. What is the ${A?'least':'greatest'} possible whole-number third side in cm?`,A?Math.abs(a-b)+1:a+b-1,'The third side must be strictly between the difference and the sum of the other two lengths.',A?[Math.abs(a-b),1]:[a+b,Math.max(a,b)]);}
  break;}
 case 13:{const v=int(0,2),facts=['two pairs of parallel opposite sides, but no right angles and not all sides equal',`four right angles and adjacent side lengths ${2*a} and ${a}`,`four equal sides of ${a} cm with angles 60°, 120°, 60°, 120°`],names=['Parallelogram','Rectangle','Rhombus'];
  if(F){quad((['parallelogram','rectangle','rhombus'] as const)[v],v===1?2*a:a,v===0?a-1:a);choose(`A quadrilateral has ${facts[v]}. Type its most specific family name.`,names[v],names.filter((_,i)=>i!==v).concat('Square'),'Check parallel sides, then right angles and equal sides.');}
  else if(R){quad('rhombus',a);choose(`A student says a quadrilateral with four equal sides of ${a} cm and angles 60°, 120°, 60°, 120° is a square. Type its correct most specific family name.`,'Rhombus',['Square','Rectangle','Kite'],'A square needs four right angles as well as four equal sides.');}
  else{const shape=pick([['rhombus',4],['square',4],['equilateral triangle',3]] as const);if(shape[0]==='equilateral triangle')tri([a,a,a],['?','?','?']);else quad(shape[0],a,a,true);numeric(`A ${shape[0]} has a perimeter of ${shape[1]*a} cm. How long is each side in cm?`,a,`All ${shape[1]} sides are equal: ${shape[1]*a} ÷ ${shape[1]} = ${a}.`,[shape[1]*a/2,shape[1]*a-shape[1]]);}
  break;}
 case 14:{
  if(F){const [desc,count]=pick([['A square',4],['A rhombus that is not a square',3],['A rectangle that is not a square',2],['A parallelogram with no right angles and unequal adjacent sides',1]] as const);if(count===4)quad('square',a);else if(count===3)quad('rhombus',a);else if(count===2)quad('rectangle',2*a,a);else quad('parallelogram',a,a-1);numeric(`${desc}: how many of these families does it belong to — parallelogram, rectangle, rhombus, kite? (A kite has two pairs of equal adjacent sides.)`,count,count===4?'A square meets every definition.':count===3?'A rhombus is a parallelogram and a kite, but has no right angles.':count===2?'A rectangle is a parallelogram with right angles; its adjacent sides are unequal, so it is not a rhombus or kite.':'It is only a parallelogram.',[4,3,2,1].filter(n=>n!==count));}
  else if(R){const fam=pick([['rectangle','it has four right angles'],['rhombus','all four sides are equal'],['parallelogram','both pairs of opposite sides are parallel']] as const);choose(`Why is every square also a ${fam[0]}?`,`Because ${fam[1]}.`,['Because it is drawn with horizontal sides.','Because a shape can only have one family name.','Because all four of its angles are acute.'],`A square has every property of a ${fam[0]}.`);}
  else{const [desc,name]=pick([['is both a rectangle and a rhombus','Square'],[`has four right angles and adjacent sides of ${a} cm and ${2*a} cm`,'Rectangle'],[`is a parallelogram with four equal sides of ${a} cm but no right angles`,'Rhombus']] as const);if(name==='Rectangle')quad('rectangle',2*a,a);else if(name==='Rhombus')quad('rhombus',a);choose(`A quadrilateral ${desc}. Type its most specific family name.`,name,['Square','Rectangle','Rhombus','Parallelogram'].filter(s=>s!==name),'Combine the properties to find the most specific family.');}
  break;}
 case 15:{const v=int(0,2);
  if(F){const names=['Kite','Trapezium','Parallelogram'],facts=[`adjacent side lengths ${a}, ${a+b}, ${a+b}, ${a} cm and no parallel sides`,'exactly one pair of parallel sides','two pairs of parallel sides'];if(v===0)quad('kite',a,a+b);else if(v===1)quad('trapezium',1);else quad('parallelogram',a+1,a);choose(`A quadrilateral has ${facts[v]}. Type its family name. Here a trapezium has exactly one pair of parallel sides.`,names[v],[...names.filter((_,i)=>i!==v),'Rhombus'],[`Two pairs of equal adjacent sides (${a} and ${a}, ${a+b} and ${a+b}) make a kite.`,'Exactly one pair of parallel sides makes a trapezium.','Two pairs of parallel sides make a parallelogram, which is not a trapezium under this definition.'][v]);}
  else if(R&&v===0)choose('Why must a trapezium definition say whether it means exactly one pair of parallel sides?','The definition decides whether parallelograms belong to the trapezium family.',['Parallel sides must always be equal in length.','Every quadrilateral has parallel sides.','A reflection changes the number of parallel pairs.'],'Using exactly one pair excludes parallelograms, which have two parallel pairs.');
  else if(R){quad('kite',a,a+b);choose('A student says this shape is a parallelogram because it has two pairs of equal sides. Type its correct family name.','Kite',['Parallelogram','Rhombus','Trapezium'],`Its equal sides are next to each other (${a} and ${a}, ${a+b} and ${a+b}), not opposite, and no sides are parallel, so it is a kite.`);}
  else if(v===0){const P=pick([100,110,120,130,140]),Q=pick([40,50,60,70,80]),e=(360-P-Q)/2,w=3;polygon({points:[{x:0,y:w/Math.tan(P*Math.PI/360)},{x:w,y:0},{x:0,y:-w/Math.tan(Q*Math.PI/360)},{x:-w,y:0}],angles:[`${P}°`,'?',`${Q}°`,'?'],caption:'A kite. Not to scale.'});numeric(`This kite has a top angle of ${P}° and a bottom angle of ${Q}°. Its other two angles are equal. What size is each of them, in degrees?`,e,`The angles of a quadrilateral add to 360°: 360 − ${P} − ${Q} = ${360-P-Q}, and ${360-P-Q} ÷ 2 = ${e}.`,[360-P-Q,180-P,180-Q]);}
  else if(v===1){const al=pick([55,60,65,70,75,80]),be=pick([60,70]),h=3;polygon({points:[{x:0,y:0},{x:8,y:0},{x:8-h/Math.tan(be*Math.PI/180),y:h},{x:h/Math.tan(al*Math.PI/180),y:h}],angles:[`${al}°`,'','','?'],caption:'A trapezium with parallel top and bottom sides. Not to scale.'});numeric(`In this trapezium the top and bottom sides are parallel. The bottom-left angle is ${al}°. What size is the top-left angle, in degrees?`,180-al,`The two angles along a slanted side between parallel lines add to 180°: 180 − ${al} = ${180-al}.`,[al,360-al,90+al]);}
  else{const L=a+b,P=2*a+2*L,w=a*0.7;polygon({points:[{x:0,y:Math.sqrt(a*a-w*w)},{x:w,y:0},{x:0,y:-Math.sqrt(L*L-w*w)},{x:-w,y:0}],sideLabels:[`${a} cm`,'?','?',`${a} cm`],caption:'A kite. Not to scale.'});numeric(`This kite has a perimeter of ${P} cm. Its two short sides are ${a} cm each. How long is each long side, in cm?`,L,`The long sides make ${P} − ${2*a} = ${2*L} cm, so each is ${2*L} ÷ 2 = ${L} cm.`,[P-2*a,P-a,2*L]);}
  break;}
 // ── Polygons (AC9M7SP02)
 case 16:{const n=pick([5,6,8]),name=POLYGON_NAMES[n];
  if(F){const reg=int(0,1)===1;polygon(reg?regular(n):{points:[{x:-3,y:-1},{x:3,y:-1},{x:3,y:1},{x:-3,y:1}],caption:'A rectangle with side lengths 6, 2, 6, 2 and four right angles.'});choose('Is the displayed polygon regular?',reg?'Yes; all sides and all angles are equal.':'No; the side lengths are not all equal.',reg?['No; regularity depends on orientation.','No; a regular polygon must have four sides.','Yes, but only because the angles are equal.']:['Yes; four right angles guarantee regularity.','Yes; every rectangle is regular.','No; the angles are not equal.'],reg?`Check the sides: all ${n} are the same length. Check the angles: all ${n} are the same size. Both are equal, so it is regular.`:'Check the sides: they are 6, 2, 6 and 2 cm, so they are not all equal. The angles are all 90°, but both conditions are needed, so it is not regular.');}
  else if(R){const [shape,fails]=pick([['A rhombus with angles 60°, 120°, 60°, 120°','its angles are not all equal'],['A rectangle with sides 6, 2, 6, 2 cm','its sides are not all equal'],['A hexagon with all angles 120° but sides 2, 3, 2, 3, 2, 3 cm','its sides are not all equal']] as const);if(shape.startsWith('A rhombus'))quad('rhombus',a);else if(shape.startsWith('A rectangle'))quad('rectangle',6,2);else{const pts:P7[]=[];let x=0,y=0;[2,3,2,3,2,3].forEach((len,i)=>{pts.push({x,y});x+=len*Math.cos(i*Math.PI/3);y+=len*Math.sin(i*Math.PI/3);});polygon({points:pts,sideLabels:['2 cm','3 cm','2 cm','3 cm','2 cm','3 cm'],angles:Array(6).fill('120°'),caption:'Hexagon with all angles 120° and sides 2, 3, 2, 3, 2, 3 cm.'});}choose(`${shape}. Why is it not regular?`,`Because ${fails}.`,['Because it is not drawn upright.',`Because ${fails.includes('angles')?'its sides are not all equal':'its angles are not all equal'}.`,'Because regular shapes must have four sides.'],'A regular polygon needs all sides equal AND all angles equal.');}
  else{const side=a;polygon({...regular(n),sideLabels:Array(n).fill('?')});numeric(`A regular ${name} has a perimeter of ${n*side} cm. How long is each side in cm?`,side,`All ${n} sides are equal: ${n*side} ÷ ${n} = ${side}.`,[n*side/2,n*side-n]);}
  break;}
 // ── Translations (AC9M7SP03)
 case 19:{const T=shift(dx,dy),sh=triangle(T,ps=>T(T(ps))),img=T(sh),vi=int(0,2),L=TRI[vi],move=moveText(dx,dy);
  if(A)place(`Translate triangle ${vtx(sh)} ${move}, then repeat the same translation. Place the final image.`,sh,T(img),`Two translations of ${move} move every corner ${moveText(2*dx,2*dy)}.`);
  else{grid(sh,{solution:img});
   if(F)point(`Triangle ${vtx(sh)} is translated ${move}. Type the image of ${L}.`,img[vi],'Add the horizontal change to x and the vertical change to y.',[{x:sh[vi].x-dx,y:sh[vi].y-dy},{x:sh[vi].x+dx,y:sh[vi].y-dy}]);
   else point(`Triangle ${vtx(sh)} is translated ${move}. A student says ${L} moves to ${pair({x:sh[vi].x-dx,y:sh[vi].y-dy})}. Type the correct image of ${L}.`,img[vi],'Right adds to x; down subtracts from y. The student moved in the opposite directions.',[{x:sh[vi].x-dx,y:sh[vi].y-dy}]);}
  break;}
 case 20:{const T=shift(dx,-2),back=shift(-1,0),sh=triangle(T,ps=>back(T(ps))),img=T(sh),vi=1+int(0,1);
  if(A)place(`Translate triangle ${vtx(sh)} ${units(dx)} right and 2 units down, then 1 unit left. Place the final image.`,sh,back(img),`Altogether every corner moves ${moveText(dx-1,-2)}.`);
  else{grid(sh,{solution:img});
   if(F){answerLabels=['P′','Q′','R′'];choose(`Translate triangle ${vtx(sh)} ${units(dx)} right and 2 units down. Type the image of each corner.`,pts(img),[pts(sh),pts(shift(1,1)(img)),pts(shift(-dx,2)(sh))],`Every corner moves the same way: add ${dx} to x and subtract 2 from y.`);}
   else point(`Triangle ${vtx(sh)} is translated ${units(dx)} right and 2 units down. A student moved only P and left Q and R where they were. Type the correct image of ${TRI[vi]}.`,img[vi],'Every corner moves by the same amount, or the shape changes.',[sh[vi]]);}
  break;}
 case 21:{const T=shift(dx,dy),sh=triangle(T,ps=>T(T(ps))),img=T(sh),both=`Triangle ${vtx(sh)} is translated to the dashed triangle ${vtx(img,TRI.map(l=>l+'′'))}.`;grid(sh,{image:img});
  if(F)point(`${both} Type the translation vector as a pair (right, up).`,{x:dx,y:dy},'Image minus original for any corner: subtract P from P′.',[{x:-dx,y:-dy}]);
  else if(R)point(`${both} A student subtracted the image from the original and wrote ${pair({x:-dx,y:-dy})}. Type the correct translation vector as a pair (right, up).`,{x:dx,y:dy},'Image minus original gives the vector from the original to the image.',[{x:-dx,y:-dy}]);
  else point(`${both} Type the translation vector that takes the image back to the original, as a pair (right, up).`,{x:-dx,y:-dy},'Going back reverses both components.',[{x:dx,y:dy}]);
  break;}
 // ── Reflections (AC9M7SP03)
 case 22:case 23:{const rx=key===22,M=rx?flipX:flipY,axis=rx?'x':'y',sh=triangle(M),img=M(sh),vi=int(0,2),L=TRI[vi],keep=rx?'x':'y',change=rx?'y':'x';
  if(A)place(`Reflect triangle ${vtx(sh)} in the ${axis}-axis. Place the image.`,sh,img,`Each corner keeps its ${keep}-coordinate and its ${change}-coordinate changes sign, so the image is the same distance from the mirror on the other side.`,{mirror:axis});
  else if(R&&int(0,1)===1)identify(sh,img,`Reflection in the ${axis}-axis`,[`Reflection in the ${rx?'y':'x'}-axis`,'Rotation of 180° about the origin','Rotation of 90° clockwise about the origin'],`Each corner and its image are the same distance from the ${axis}-axis on opposite sides, and the triangle is flipped over.`);
  else{grid(sh,{mirror:axis,solution:img});
   if(F)point(`Reflect triangle ${vtx(sh)} in the ${axis}-axis. Type the image of ${L}.`,img[vi],`Reflecting in the ${axis}-axis keeps the ${keep}-coordinate and changes the sign of the ${change}-coordinate.`,[(rx?flipY:flipX)(sh)[vi]]);
   else point(`Triangle ${vtx(sh)} is reflected in the ${axis}-axis. A student says ${L} moves to ${pair((rx?flipY:flipX)(sh)[vi])}. Type the correct image of ${L}.`,img[vi],`Reflecting in the ${axis}-axis changes the sign of the ${change}-coordinate, not the ${keep}-coordinate.`,[(rx?flipY:flipX)(sh)[vi]]);}
  break;}
 case 24:{const first=int(-2,0),second=first+int(1,3),M1=flipAt(first),M2=flipAt(second),fwd=(ps:P7[])=>M2(M1(ps)),rev=(ps:P7[])=>M1(M2(ps)),sh=A?triangle(M2,rev):triangle(M1,fwd),vi=int(0,2),L=TRI[vi],gap=second-first;
  if(A)place(`Reflect triangle ${vtx(sh)} in x = ${second} first, then reflect that image in x = ${first}. Place the final image.`,sh,rev(sh),`Reversing the order reverses the direction: every corner ends ${units(2*gap)} to the left.`,{mirrorX:[first,second]});
  else if(R){grid(sh,{mirrorX:[first,second]});numeric(`Triangle ${vtx(sh)} is reflected in x = ${first}, then in x = ${second}. The two reflections are the same as one translation. How many units right is that translation? (Use a negative number for left.)`,2*gap,`Two reflections in parallel lines translate by twice the gap between them: 2 × ${gap} = ${2*gap}.`,[gap,second+first,4*gap]);}
  else{grid(sh,{mirrorX:[first,second],solution:fwd(sh)});point(`Reflect triangle ${vtx(sh)} in x = ${first}, then reflect that image in x = ${second}. Type the final image of ${L}.`,fwd(sh)[vi],'For a mirror x = a, replace x by 2a − x. Repeat with the second mirror.',[M1(sh)[vi],rev(sh)[vi]]);}
  break;}
 // ── Rotations and combinations (AC9M7SP03)
 case 25:{const cw=turn(O,90,true),acw=turn(O,90,false),half=turn(O,180,true),sh=triangle(),vi=int(0,2),L=TRI[vi];
  if(A){const h=int(0,1)===1;place(`Rotate triangle ${vtx(sh)} ${h?'180°':'90° anticlockwise'} about the origin. Place the image.`,sh,(h?half:acw)(sh),h?'A half-turn about the origin maps (x, y) to (−x, −y).':'A quarter-turn anticlockwise about the origin maps (x, y) to (−y, x).',{turn:{centre:O,clockwise:false,degrees:h?180:90}});}
  else if(R&&int(0,1)===1)identify(sh,cw(sh),'Rotation of 90° clockwise about the origin',['Rotation of 90° anticlockwise about the origin','Rotation of 180° about the origin','Reflection in the y-axis'],'The triangle has turned a quarter-turn the way clock hands move, and it is not flipped: (x, y) → (y, −x).');
  else{grid(sh,{solution:cw(sh),turn:{centre:O,clockwise:true,degrees:90}});
   if(F)point(`Rotate triangle ${vtx(sh)} 90° clockwise about the origin. Type the image of ${L}.`,cw(sh)[vi],'A clockwise quarter-turn about the origin maps (x, y) to (y, −x).',[acw(sh)[vi],half(sh)[vi]]);
   else point(`Triangle ${vtx(sh)} is rotated 90° clockwise about the origin. A student used (−y, x) and says ${L} moves to ${pair(acw(sh)[vi])}. Type the correct image of ${L}.`,cw(sh)[vi],'(−y, x) is the anticlockwise rule. Clockwise uses (y, −x).',[acw(sh)[vi]]);}
  break;}
 case 26:{const c={x:pick([-1,1]),y:int(-1,1)},cw=turn(c,90,true),acw=turn(c,90,false),sh=triangle(cw,acw),vi=int(0,2),L=TRI[vi],rel={x:sh[vi].x-c.x,y:sh[vi].y-c.y};
  if(A)place(`Rotate triangle ${vtx(sh)} 90° anticlockwise about C${pair(c)}. Place the image.`,sh,acw(sh),'For each corner: subtract C, turn (x, y) to (−y, x), then add C back.',{centre:c,turn:{centre:c,clockwise:false,degrees:90}});
  else{grid(sh,{centre:c,solution:cw(sh),turn:{centre:c,clockwise:true,degrees:90}});
   if(F)point(`Rotate triangle ${vtx(sh)} 90° clockwise about C${pair(c)}. Type the image of ${L}.`,cw(sh)[vi],`Relative to C, ${L} is ${pair(rel)}. Turn that to ${pair({x:rel.y,y:z(-rel.x)})}, then add C back.`,[turn(O,90,true)(sh)[vi],acw(sh)[vi]]);
   else point(`Triangle ${vtx(sh)} is rotated 90° clockwise about C${pair(c)}. A student rotated about the origin instead and says ${L} moves to ${pair(turn(O,90,true)(sh)[vi])}. Type the correct image of ${L}.`,cw(sh)[vi],'Subtract C, rotate the relative coordinates, then add C back.',[turn(O,90,true)(sh)[vi]]);}
  break;}
 case 27:{const T=shift(dx,0),r1=(ps:P7[])=>flipY(T(ps)),r2=(ps:P7[])=>T(flipY(ps)),sh=triangle(T,r1,flipY,r2),vi=int(0,2),L=TRI[vi];
  if(A)place(`Reflect triangle ${vtx(sh)} in the y-axis, then translate it ${units(dx)} right. Place the final image.`,sh,r2(sh),'Apply the second move to the first image, not to the original triangle.',{mirror:'y'});
  else if(R){grid(sh,{mirror:'y'});numeric(`Route 1: translate triangle ${vtx(sh)} ${units(dx)} right, then reflect it in the y-axis. Route 2: reflect it in the y-axis, then translate it ${units(dx)} right. How many units apart are the two final images of ${L}?`,2*dx,`Route 1 sends ${L} to ${pair(r1(sh)[vi])}; route 2 sends it to ${pair(r2(sh)[vi])}. They are ${2*dx} units apart, so order matters.`,[dx,0,4*dx]);}
  else{grid(sh,{mirror:'y',solution:r1(sh)});point(`Translate triangle ${vtx(sh)} ${units(dx)} right, then reflect it in the y-axis. Type the final image of ${L}.`,r1(sh)[vi],'Work in order: translate first, then reflect the new triangle.',[r2(sh)[vi]]);}
  break;}
 // ── Classifiers (AC9M7SP04)
 // ── Week 9: classify shapes and give the property that decides (no flowcharts).
 case 28:{const triples:[number,number,number][]=[[70,70,40],[65,65,50],[75,75,30],[50,50,80],[45,45,90],[30,30,120],[25,25,130],[35,35,110],[50,60,70],[45,65,70],[55,60,65],[30,60,90],[35,55,90],[40,50,90],[25,65,90],[20,40,120],[30,50,100],[25,45,110],[15,55,110]];
  const nameOf=(t:number[])=>`${new Set(t).size===2?'Isosceles':'Scalene'} ${Math.max(...t)>90?'obtuse':Math.max(...t)===90?'right-angled':'acute'}`,draw=(t:number[],labels:string[],sides?:string[])=>polygon({points:triAngles(t[0],t[1]),angles:labels,sideLabels:sides,caption:'Triangle with the stated angles. Not to scale.'});
  if(F){const t=pick(triples).slice();for(let k=2;k>0;k--){const j=int(0,k);[t[k],t[j]]=[t[j],t[k]];}const hide=int(0,2),shown=t.filter((_,k)=>k!==hide),ans=nameOf(t);draw(t,t.map((v,k)=>k===hide?'?':`${v}°`));
   const all=['Isosceles acute','Isosceles right-angled','Isosceles obtuse','Scalene acute','Scalene right-angled','Scalene obtuse'];
   choose(`Two angles of this triangle are ${shown[0]}° and ${shown[1]}°. Type its full name: sides, then angles (for example, Scalene acute).`,ans,all.filter(x=>x!==ans).slice(0,3),`The third angle is 180 − ${shown[0]} − ${shown[1]} = ${t[hide]}°. ${new Set(t).size===2?'Two angles are equal, so two sides are equal: isosceles.':'All three angles are different, so all sides are different: scalene.'} The largest angle is ${Math.max(...t)}°, so it is ${ans.split(' ')[1]}.`);}
  else if(R){const [kind,t,right,wrongs]=pick([
    ['isosceles',[70,70,40],'Two angles are equal, so the two sides opposite them are equal.',['All three angles add to 180°.','It has an acute angle.','Its largest angle is less than 90°.']],
    ['right-angled',[35,55,90],'One angle is exactly 90°.',['Two of its angles are acute.','Its angles add to 180°.','Two of its sides are equal.']],
    ['obtuse',[25,45,110],'One angle is greater than 90°.',['Two of its angles are acute.','One angle is less than 90°.','Its angles add to 180°.']],
    ['scalene',[50,60,70],'All three angles are different, so all three sides are different lengths.',['One angle is greater than 60°.','Its angles add to 180°.','Two of its angles are acute.']],
    ['acute',[55,60,65],'All three angles are less than 90°.',['Two of its angles are less than 90°.','Its angles add to 180°.','One angle is 60°.']]] as [string,number[],string,string[]][]);
   draw(t,t.map(v=>`${v}°`));choose(`This triangle has angles of ${t.join('°, ')}°. Which reason shows it is ${kind}?`,right,wrongs,`${right} Every triangle has angles adding to 180° and at least two acute angles, so those facts do not decide the type.`);}
  else if(int(0,1)===1){const X=pick([20,30,40,50,70,80,100,110,120]),B=(180-X)/2;draw([B,B,X],['?','?',`${X}°`],['','6 cm','6 cm']);numeric(`An isosceles triangle has an angle of ${X}° between its two equal sides. What size is each of the other two angles, in degrees?`,B,`The other two angles are equal and share 180 − ${X} = ${180-X}°, so each is ${180-X} ÷ 2 = ${B}°.`,[180-X,X,90-X/2+10]);}
  else{const Y=pick([35,40,50,55,65,70,75,80]),X=180-2*Y;draw([Y,Y,X],[`${Y}°`,`${Y}°`,'?'],['','6 cm','6 cm']);numeric(`Each base angle of this isosceles triangle is ${Y}°. What is the angle between its two equal sides, in degrees?`,X,`The angles add to 180°: 180 − ${Y} − ${Y} = ${X}°.`,[Y,180-Y,90-Y]);}
  break;}
 case 29:{const names=['Square','Rectangle','Rhombus','Parallelogram','Kite','Trapezium'],marks:Record<string,string>={Square:'four right angles and four equal sides',Rectangle:'four right angles but unequal neighbouring sides',Rhombus:'four equal sides but no right angles',Parallelogram:'two pairs of parallel sides, no right angles and unequal neighbouring sides',Kite:'two pairs of equal neighbouring sides and no parallel sides',Trapezium:'exactly one pair of parallel sides'};
  const card=(name:string)=>{visual={mode:'choice',diagram:'none',instruction:'Read the markings on the quadrilateral.',shapes7:[{id:'A',points:turnPts(MAKE[name](),int(0,23)*15),show:'all'}]};};
  if(F){const name=pick(names);card(name);choose('Type the most exact name for quadrilateral A (for example, Square rather than Rectangle).',name,names.filter(x=>x!==name).slice(0,3),`The markings show ${marks[name]}, so the most exact name is ${name.toLowerCase()}.`);}
  else if(R){const [name,not,right,wrongs]=pick([
    ['Rhombus','square','It has four equal sides but no right angles.',['It has two pairs of parallel sides.','It has four equal sides.','Its opposite angles are equal.']],
    ['Rectangle','square','It has four right angles but its neighbouring sides are not equal.',['It has four right angles.','It has two pairs of parallel sides.','Its opposite sides are equal.']],
    ['Parallelogram','rectangle','It has two pairs of parallel sides but no right angles.',['It has two pairs of parallel sides.','Its opposite sides are equal.','It has four sides.']],
    ['Kite','rhombus','Its equal sides are next to each other, and not all four sides are equal.',['It has two pairs of equal sides.','It has four sides.','One pair of its angles is equal.']],
    ['Trapezium','parallelogram','Only one pair of its sides is parallel.',['It has parallel sides.','It has four angles.','Its sides are different lengths.']]] as [string,string,string,string[]][]);
   card(name);choose(`Quadrilateral A is a ${name.toLowerCase()}, not a ${not}. Which reason shows this?`,right,wrongs,`${right} The other statements are also true of a ${not}, so they do not tell the two apart.`);}
  else{const kind=pick(['parallelogram','rhombus']),X=pick([55,60,65,70,75,80,100,110,115,120,125]),pts=para(kind==='rhombus'?4:6,4,X);polygon({points:pts,angles:[`${X}°`,'?','?','?'],sideLabels:kind==='rhombus'?['5 cm','5 cm','5 cm','5 cm']:['7 cm','4 cm','7 cm','4 cm'],caption:`A ${kind}. Not to scale.`});
   list(`This ${kind} has one angle of ${X}°. Going around from that angle, type the other three angles.`,[180-X,X,180-X],`Neighbouring angles in a ${kind} add to 180°, so the next angle is 180 − ${X} = ${180-X}°. Opposite angles are equal, so the angles go ${X}°, ${180-X}°, ${X}°, ${180-X}°.`,[[X,180-X,X],[90,90,90]]);answerLabels=['Next angle (°)','Opposite angle (°)','Last angle (°)'];}
  break;}
 case 30:{
  if(F||R){const kind=pick(['Regular pentagon','Regular hexagon','Irregular pentagon','Irregular hexagon','Concave pentagon','Concave hexagon']),pts=turnPts(MAKE[kind](),int(0,23)*15),f=shapeFacts(pts);visual={mode:'choice',diagram:'none',instruction:'Read the markings on the polygon.',shapes7:[{id:'A',points:pts,show:'all'}]};
   const why=f.concave?'one interior angle is greater than 180°':f.allSides&&f.allAngles?'all its sides and all its angles are equal':f.allSides?'its sides are equal but its angles are not all equal':'its sides are not all equal';
   if(F)choose('Type the full name for polygon A: regular, irregular or concave, then its name from its number of sides (for example, Regular pentagon).',kind,['Regular','Irregular','Concave'].flatMap(w=>[`${w} pentagon`,`${w} hexagon`]).filter(x=>x!==kind).slice(0,3),`It is ${kind.split(' ')[0].toLowerCase()} because ${why}. It has ${f.n} sides, so it is a ${kind.toLowerCase()}.`);
   else if(f.concave)choose('Why is polygon A concave?','One interior angle is greater than 180°.',['Its sides are not all equal.','It has more than four sides.','It is not regular.'],'A concave polygon has an inward dent, which makes one interior angle greater than 180°.');
   else if(f.allSides&&f.allAngles)choose('Why is polygon A regular?','All its sides are equal and all its angles are equal.',['All its sides are equal.','It has no angle greater than 180°.','It has five or more sides.'],'Regular needs both: every side equal and every angle equal.');
   else choose('Why is polygon A not regular?',f.allSides?'Its sides are equal but its angles are not all equal.':'Its sides are not all equal.',f.allSides?['It has six sides.','One angle is greater than 180°.','Its sides are not all equal.']:['It has an angle greater than 180°.','Its sides are all equal.','It has more than four sides.'],`A regular polygon needs every side equal and every angle equal. Here ${why}.`);}
  else if(int(0,1)===1){const n=pick([5,6,8,10]),name={5:'pentagon',6:'hexagon',8:'octagon',10:'decagon'}[n],each=(n-2)*180/n;polygon({...regular(n),angles:['?',...Array(n-1).fill('')]});numeric(`What is each interior angle of a regular ${name}, in degrees?`,each,`The angles add to (${n} − 2) × 180 = ${(n-2)*180}°. All ${n} are equal: ${(n-2)*180} ÷ ${n} = ${each}°.`,[(n-2)*180,360/n,180-each+each/2]);}
  else{const concave=int(0,1)===1,four=Array.from({length:4},()=>concave?5*int(10,18):5*int(19,25)),miss=540-four.reduce((t,v)=>t+v,0);visual=undefined;numeric(`A pentagon has interior angles of ${four.join('°, ')}° and one unknown angle. What is the unknown angle, in degrees?`,miss,`The angles of a pentagon add to (5 − 2) × 180 = 540°: 540 − ${four.reduce((t,v)=>t+v,0)} = ${miss}°. ${miss>180?'It is greater than 180°, so this pentagon is concave.':'Every angle is less than 180°, so this pentagon is convex.'}`,[360-four.reduce((t,v)=>t+v,0)<=0?miss+10:Math.abs(360-four.reduce((t,v)=>t+v,0)),miss+180,180]);}
  break;}
 case 31:{const sc=SCN.poly,word:Record<string,string>={Concave:'Concave','Regular convex':'Regular','Irregular convex':'Irregular'},label=(sh:Sorter7Shape,g:string)=>`${word[g]} ${sh.points.length===5?'pentagon':'hexagon'}`,bins=['Regular','Irregular','Concave'].flatMap(w=>[`${w} pentagon`,`${w} hexagon`]);
  const vis=(shapes:Sorter7Shape[])=>{visual={mode:'choice',diagram:'flow',instruction:'Follow the decisions, then name the polygon by its number of sides.',trees:[{title:'Polygon sorter',root:{question:SORTER7_QUESTIONS.concave,yes:'Concave',no:{question:SORTER7_QUESTIONS.regular,yes:'Regular',no:'Irregular'}}}],shapes7:shapes};};
  if(F){const set=sampleSet(sc,1),sh=set.shapes[0],ans=label(sh,set.target[0]);vis([sh]);choose(`Type the group for polygon ${sh.id}: the sorter's output and its name, for example Regular pentagon.`,ans,bins.filter(b=>b!==ans).slice(0,3),`${route(sc,sh).replace('Regular convex','Regular').replace('Irregular convex','Irregular')} It has ${sh.points.length} sides, so it is a ${ans.toLowerCase()}.`);}
  else if(R){const set=sampleSet(sc,6),[what,test]=pick([['concave',(g:string)=>g==='Concave'],['regular',(g:string)=>g==='Regular convex'],['hexagons',(_g:string,sh:Sorter7Shape)=>sh.points.length===6]] as const),n=set.target.filter((g,i)=>test(g,set.shapes[i])).length;vis(set.shapes);numeric(`How many of these six polygons are ${what}?`,n,`${set.shapes.filter((x,i)=>test(set.target[i],x)).map(x=>x.id).join(', ')||'None'}.`,[6-n,n+1,Math.max(0,n-1)]);}
  else{const set=sampleSet(sc,6);sortTask('Sort each polygon into its group: the sorter\'s output, then its name from its number of sides.',set.shapes,set.shapes.map((x,i)=>label(x,set.target[i])),bins,set.shapes.map((x,i)=>`${x.id}: ${label(x,set.target[i])}.`).join(' '),{title:'Polygon sorter',template:'chain',values:['concave','Concave','regular','Regular','Irregular']});}
  break;}
 case 32:{const sc=pick([SCN.sides,SCN.angles,SCN.quadFam,SCN.poly]),slots=sorterSlots(SORTER7_TEMPLATES[sc.template]);let broken:string[]=[],set=sampleSet(sc,5),wrongIdx:number[]=[];
  for(let t=0;t<200;t++){const b=[...sc.canonical];if(int(0,1)){const [o1,o2]=[pick(slots.outputs),pick(slots.outputs)];[b[o1],b[o2]]=[b[o2],b[o1]];}else{const qs=pick(slots.questions);b[qs]=pick(sc.questions.filter(q=>q!==b[qs]));}
   const cand=sampleSet(sc,5),mis=cand.shapes.map((sh,i)=>runSorter(SORTER7_TEMPLATES[sc.template],b,sh.points)!==cand.target[i]?i:-1).filter(i=>i>=0);if(F?mis.length===1:mis.length>=1&&mis.length<5){broken=b;set=cand;wrongIdx=mis;break;}}
  if(!broken.length)throw Error('No broken sorter');
  const show=()=>{visual={mode:'choice',diagram:'flow',instruction:'This sorter has a mistake. The shapes should reach their correct groups.',trees:[{title:'Broken sorter',root:toFlow(SORTER7_TEMPLATES[sc.template],broken)}],shapes7:set.shapes};};
  if(F){show();const w=set.shapes[wrongIdx[0]];choose(`Run each ${sc.noun} through this sorter. One lands in the wrong group. Type its letter.`,w.id,set.shapes.filter(x=>x.id!==w.id).map(x=>x.id).slice(0,3),`${route(sc,w,broken)} But shape ${w.id} is ${set.target[wrongIdx[0]].toLowerCase()}, so the sorter puts it in the wrong group.`);}
  else if(R){show();numeric(`Run each ${sc.noun} through this sorter. How many land in the wrong group?`,wrongIdx.length,`${wrongIdx.map(i=>set.shapes[i].id).join(', ')} land in the wrong group.`,[wrongIdx.length+1,Math.max(0,wrongIdx.length-1),5]);}
  else flowTask(`This ${sc.noun} sorter puts some shapes in the wrong group. Change boxes so every test shape reaches its group. Run it, then check.`,sc,set,broken,broken.map(()=>false),`${designText(sc)} Run every shape again after each change.`);
  break;}
 case 34:{const n=pick([5,6,8]),name=POLYGON_NAMES[n],angle=(n-2)*180/n;polygon(regular(n));
  if(F)numeric(`A regular ${name} has interior angles of ${angle}°. It is rotated 90°. What is each interior angle now, in degrees?`,angle,'Rotations preserve angle sizes and side lengths, so the shape stays regular.',[angle+90,angle-90,90]);
  else if(R){const move=pick(['translation','reflection','rotation'] as const),right={translation:'Its position changes; its orientation, side lengths and angles stay the same.',reflection:'It is flipped; its side lengths and angles stay the same.',rotation:'Its orientation changes; its side lengths and angles stay the same.'}[move];choose(`A regular ${name} undergoes a ${move}. Which statement is correct?`,right,['Its side lengths change, so it is no longer regular.','Its angles change, so it becomes concave.',...Object.values({translation:'Its position changes; its orientation, side lengths and angles stay the same.',reflection:'It is flipped; its side lengths and angles stay the same.',rotation:'Its orientation changes; its side lengths and angles stay the same.'}).filter(s=>s!==right)],'Translations, reflections and rotations preserve side lengths, angle sizes and regularity.');}
  else{const [shape,name2]=pick([[`a quadrilateral with four sides of ${a} cm and angles 60°, 120°, 60°, 120°`,'Rhombus'],[`a quadrilateral with adjacent sides ${a}, ${a}, ${b+a}, ${b+a} cm and no parallel sides`,'Kite'],[`a quadrilateral with four right angles and sides ${2*a}, ${a}, ${2*a}, ${a} cm`,'Rectangle']] as const);if(name2==='Rhombus')quad('rhombus',a);else if(name2==='Kite')quad('kite',a,b+a);else quad('rectangle',2*a,a);choose(`${shape[0].toUpperCase()+shape.slice(1)} is reflected and then rotated. Type its family name after the moves.`,name2,['Rhombus','Kite','Rectangle','Square'].filter(s=>s!==name2),'The moves preserve side lengths and angles, so the family name does not change.');}
  break;}
 case 35:{
  if(F){const n=int(4,6);visual={mode:'choice',diagram:'flow',instruction:'Example: a sorter for 3 groups uses 2 questions.',trees:[{title:'3-group sorter',root:toFlow(SORTER7_TEMPLATES.chain,SCN.sides.canonical)}]};numeric(`A sorter must separate ${n} groups using yes/no questions. How many questions does it need?`,n-1,`Each yes/no question splits one branch into two, adding one group. Starting from 1 group, ${n} groups need ${n} − 1 = ${n-1} questions.`,[n,n+1,2*n]);}
  else if(R){const sc=SCN.quad4,set=sampleSet(sc,1),sh=set.shapes[0];visual={mode:'choice',diagram:'flow',instruction:'Two sorters ask the same questions in opposite orders.',trees:[{title:'Sorter 1',root:toFlow(SORTER7_TEMPLATES.full,sc.canonical)},{title:'Sorter 2',root:toFlow(SORTER7_TEMPLATES.full,['fourEqual','fourRight','Square','Non-square rhombus','fourRight','Non-square rectangle','Other quadrilateral'])}],shapes7:[sh]};choose(`Both sorters use the same two questions in opposite orders. Type the group both give for quadrilateral ${sh.id}.`,set.target[0],sc.outputs.filter(o=>o!==set.target[0]),`${route(sc,sh)} Both questions are asked on every route, so the order does not change the group.`);}
  else{const sc=pick([SCN.quad4,SCN.quadFam,SCN.poly]),set=sampleSet(sc,sc.template==='full'?5:5);flowTask(`Design a ${sc.noun} sorter: choose a question or group for every box so each test shape reaches its group. Run it, then check.`,sc,set,SORTER7_TEMPLATES[sc.template]===SORTER7_TEMPLATES.full?Array(7).fill(''):Array(5).fill(''),sc.template==='full'?Array(7).fill(false):Array(5).fill(false),designText(sc));}
  break;}
 default:throw Error('Unknown Space lesson');
 }
 // Second application forms: half of the application questions ask a structurally different
 // question about the same skill, so a quiz's two application questions are not twins.
 if(A&&int(0,1)===1){
  const before={visual,answerLabels,place:placeSpec,sorter:sorterSpec};answerLabels=undefined;placeSpec=undefined;sorterSpec=undefined;
  switch(key){
  case 4:plan();numeric(planText+'Every cube costs $2. How much does it cost to build this model, in dollars?',2*total,`There are ${heights.join(' + ')} = ${total} cubes: ${total} × $2 = $${2*total}.`,[total,2*occupied]);break;
  case 5:{const next=heights.slice();next[3]=0;const view=[0,1,2].map(i=>Math.max(next[i],next[i+3]));plan();list(planText+'The front-left stack is removed completely. Type the new front-view heights, left to right.',view,'A stack behind can now be seen in that column; take the tallest remaining stack in each column.',[front,[0,front[1],front[2]]]);break;}
  case 6:plan();list(planText+'The back row is moved to stand in front of the front row. Type the new side profile, back row first.',[side[1],side[0]],'The rows swap places, so the side profile is listed the other way round.',[side]);break;
  case 7:plan();numeric(planText+'How many cubes must be removed so that no stack is taller than 1 cube?',total-occupied,`Keep one cube on each of the ${occupied} occupied positions: ${total} − ${occupied} = ${total-occupied}.`,[total,occupied]);break;
  case 8:footprint(a);numeric(`A footprint has ${a} occupied positions and the model uses exactly ${a+k} cubes. Every stack is at least 1 cube tall. What is the tallest any single stack could be?`,k+1,`Put 1 cube on ${a-1} positions; the last stack gets ${a+k} − ${a-1} = ${k+1}.`,[k,a+k,a]);break;
  case 12:tri([a,b,(Math.abs(a-b)+a+b)/2],[`${a} cm`,'?',`${b} cm`]);numeric(`A triangle has sides of ${a} cm and ${b} cm. How many different whole-number lengths could the third side be?`,2*Math.min(a,b)-1,`The third side is strictly between ${Math.abs(a-b)} and ${a+b}: from ${Math.abs(a-b)+1} to ${a+b-1}, which is ${2*Math.min(a,b)-1} lengths.`,[2*Math.min(a,b),a+b-1,Math.abs(a-b)]);break;
  case 14:{const [what,n,which]=pick([['always parallelograms',4,'square, rectangle, rhombus and parallelogram'],['always have four right angles',2,'square and rectangle'],['always have four equal sides',2,'square and rhombus'],['always have at least one pair of parallel sides',5,'every family except the kite']] as const);visual=undefined;numeric(`Of these six families (square, rectangle, rhombus, parallelogram, kite, trapezium), how many are ${what}? Here a trapezium has exactly one pair of parallel sides.`,n,`Check each definition: ${which}.`,[6,3,1]);break;}
  case 16:{const n2=pick([5,6,8]);visual=undefined;numeric(`A regular polygon has a perimeter of ${n2*a} cm and each side is ${a} cm. How many sides does it have?`,n2,`All sides are equal: ${n2*a} ÷ ${a} = ${n2} sides.`,[n2+1,n2-1,n2*a-a]);break;}
  case 21:{const T=shift(dx,dy),sh=triangle(T,ps=>T(T(ps))),vi=int(0,2);grid(sh,{solution:T(T(sh))});point(`Triangle ${vtx(sh)} is translated by the vector (${dx}, ${dy}) twice in a row. Type the final image of ${TRI[vi]}.`,T(T(sh))[vi],`Two translations add up to (${2*dx}, ${2*dy}).`,[T(sh)[vi]]);break;}
  case 22:case 23:{const rx=key===22,M=rx?flipX:flipY,sh=triangle(M),vi=int(0,2),L=TRI[vi],q=sh[vi];grid(sh,{mirror:rx?'x':'y',solution:M(sh)});point(`Triangle ${vtx(sh)} is reflected in the ${rx?'x':'y'}-axis. Type the point halfway between ${L} and its image ${L}′.`,rx?{x:q.x,y:0}:{x:0,y:q.y},`${L} and ${L}′ are the same distance either side of the mirror, so the halfway point lies on the ${rx?'x':'y'}-axis.`,[rx?{x:0,y:q.y}:{x:q.x,y:0}]);break;}
  case 24:{const line=int(1,3),M=flipAt(line),sh=triangle(M),vi=int(0,2),L=TRI[vi];grid(sh,{mirrorX:[line],solution:M(sh)});point(`Reflect triangle ${vtx(sh)} in the vertical line x = ${line}. Type the image of ${L}.`,M(sh)[vi],`${L} is ${Math.abs(line-sh[vi].x)} units from x = ${line}, so its image is the same distance on the other side: x = ${2*line-sh[vi].x}.`,[flipY(sh)[vi],{x:line-sh[vi].x,y:sh[vi].y}]);break;}
  case 25:{const r=turn(O,270,true),sh=triangle(),vi=int(0,2);grid(sh,{solution:r(sh),turn:{centre:O,clockwise:true,degrees:270}});point(`Rotate triangle ${vtx(sh)} 270° clockwise about the origin. Type the image of ${TRI[vi]}.`,r(sh)[vi],'270° clockwise is the same as 90° anticlockwise: (x, y) → (−y, x).',[turn(O,90,true)(sh)[vi]]);break;}
  case 26:{const c={x:pick([-1,1]),y:int(-1,1)},r=turn(c,180,true),sh=triangle(r),vi=int(0,2);grid(sh,{centre:c,solution:r(sh),turn:{centre:c,clockwise:true,degrees:180}});point(`Rotate triangle ${vtx(sh)} 180° about C${pair(c)}. Type the image of ${TRI[vi]}.`,r(sh)[vi],'A half-turn about C puts each image the same distance from C on the opposite side.',[turn(O,180,true)(sh)[vi]]);break;}
  default:visual=before.visual;answerLabels=before.answerLabels;placeSpec=before.place;sorterSpec=before.sorter;
  }
 }
 // Build tasks (Weeks 2–3): in about a third of these slots the student builds the model from
 // instructions. The target is not drawn; view tasks accept any model with the right views.
 let build:Level7Build|undefined;
 const buildMode=key===4&&F?'plan':(key===5||key===6)&&A?'views':key===7&&R?'fewest':key===7&&A?'exact':null;
 if(buildMode&&((Math.imul(seed>>>0,40503)>>>13)%3)===0){
  const v=buildViews(heights),total=heights.reduce((t,n)=>t+n,0),views=`front view ${v.front.join(', ')} (left to right) and side view ${v.side.join(', ')} (back row first)`;
  let target=heights;
  if(buildMode==='fewest'){const least=fewestCubes(v.front,v.side);for(let code=0;code<(BUILD_MAX_HEIGHT+1)**6;code++){const h=Array.from({length:6},(_,i)=>Math.floor(code/(BUILD_MAX_HEIGHT+1)**i)%(BUILD_MAX_HEIGHT+1)),w=buildViews(h);if(h.reduce((t,n)=>t+n,0)===least&&w.front.join()===v.front.join()&&w.side.join()===v.side.join()){target=h;break;}}}
  build=buildMode==='plan'?{mode:'plan',plan:heights}:buildMode==='views'?{mode:'views',front:v.front,side:v.side}:buildMode==='fewest'?{mode:'fewest',front:v.front,side:v.side}:{mode:'exact',front:v.front,side:v.side,cubes:total};
  visual=undefined;answerLabels=undefined;
  prompt=buildMode==='plan'?`Build this model. Back row: ${heights.slice(0,3).join(', ')}. Front row: ${heights.slice(3).join(', ')}. Each number is the cubes in that stack.`:`Build a model with ${views}.${buildMode==='fewest'?' Use the fewest cubes possible.':buildMode==='exact'?` Use exactly ${total} cubes.`:''}`;
  answer=target.join(',');
  wrong=[heights.map(n=>Math.min(BUILD_MAX_HEIGHT,n+1)).join(','),[...heights.slice(3),...heights.slice(0,3)].join(','),heights.map(()=>1).join(','),heights.map(n=>n?0:1).join(',')];
  explanation=buildMode==='plan'?'Set each stack to the number in the plan, back row first, left to right.':buildMode==='views'?'The front view is the tallest stack in each column; the side view is the tallest stack in each row. Many models can match.':buildMode==='fewest'?`Put each tallest stack where its column and row maxima meet and reuse stacks where you can. The fewest is ${target.reduce((t,n)=>t+n,0)} cubes.`:`Match both views first, then add or remove hidden cubes until there are ${total}.`;
 }
 const options=[...new Set([answer,...wrong])].slice(0,4);if(!prompt||options.length!==4)throw Error(`Invalid options ${key}/${role}: ${prompt}`);
 for(let i=3;i>0;i--){const j=int(0,i);[options[i],options[j]]=[options[j],options[i]];}
 return {readabilityRevision:SPACE7_READABILITY_REVISION,kind:'multiple_choice',prompt,answer,options,explanation,spaceVisual:visual,lessonId:`y7-space-w${week}-l${lesson}`,version:2,skillKey:key,tier:role,answerLabels,build,place:placeSpec,sorter:sorterSpec,steps:[guide.idea,explanation,`Answer: ${answer}. Check against the stated properties and direction.`]};
}
export function generateSpace7Question(_level:unknown,lesson:Lesson,activity:LessonActivity){return space7Question(lesson.week,lesson.lesson,Math.floor(Math.random()*0x7fffffff),activity.config.rotationRole as Space7Role);}
export function space7Quiz(week:number,attempt=0){
 if(!Number.isInteger(week)||week<1||week>9)throw Error('Unknown Space Level 7 quiz');
 const taken=new Set<string>();
 return [1,2,3].flatMap(lesson=>pickLevel7LessonQuiz((role,seed)=>space7Question(week,lesson,seed,role),970001+week*10007+lesson*101+attempt*1000003,q=>q.prompt+JSON.stringify(q.spaceVisual)+q.options.slice().sort().join('|'),`Space ${week}/${lesson}`,taken)
  .map((q,i)=>({...q,id:`y7-space-w${week}-quiz-l${lesson}-${i+1}`,lessonTag:lesson as 1|2|3})));
}
