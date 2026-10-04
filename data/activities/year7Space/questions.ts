import type {Lesson} from '@/data/programs/year1';
import type {LessonActivity} from '@/data/programs/types';
import type {MultipleChoiceQuestion} from '@/data/activities/year2/lessonEngine';
import type {Task7,P7,Polygon7,Flow7} from '@/data/assessments/revisions/level7StarpathFiveForms';
import {HEXOMINOES,VALID_NET_IDS,foldNet,relationBetween} from '@/data/activities/starpath/level5/nets';
import {space7Guide,space7SourceGuide,SPACE7_SKILL_GROUPS,SPACE7_READABILITY_REVISION} from './curriculum';
export type Space7Role='fast_thinking'|'reasoning'|'apply_create';
export type Space7Question=MultipleChoiceQuestion & {lessonId:string;version:2;skillKey:number;tier:Space7Role;steps:string[];answerLabels?:string[]};
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
 const a=int(3,8),b=int(2,5),k=int(2,4),x=int(-4,-1),y=int(1,4),dx=int(1,3),dy=-int(1,3),A=role==='apply_create',R=role==='reasoning',F=!A&&!R,variant=int(0,5);
 let prompt='',answer='',wrong:string[]=[],explanation='',visual:Task7|undefined,answerLabels:string[]|undefined;
 const choose=(p:string,right:string,wrongs:string[],e:string)=>{prompt=p;answer=right;wrong=wrongs;explanation=e;};
 // Wrong choices come from real errors first; simple shifts only fill gaps.
 const numeric=(p:string,n:number,e:string,errors:number[]=[])=>choose(p,String(n),[...errors,n+1,n-1,n+2,n*2,n+3].filter(v=>v!==n&&v>=0).map(String),e);
 const point=(p:string,q:P7,e:string,errors:P7[]=[])=>choose(p,pair(q),[...errors,{x:q.y,y:q.x},{x:-q.x,y:q.y},{x:q.x,y:-q.y},{x:q.x+1,y:q.y},{x:q.x,y:q.y+1}].map(pair).filter(s=>s!==pair(q)),e);
 const list=(p:string,values:number[],e:string,errors:number[][]=[])=>{answerLabels=values.length===3?['Left','Middle','Right']:['Back row','Front row'];choose(p,values.join(', '),[...errors,values.map(n=>n+1),values.slice().reverse(),values.map(n=>n+2),values.map(n=>n+3),values.map(n=>Math.max(0,n-1))].map(v=>v.join(', ')).filter(s=>s!==values.join(', ')),e);};
 const plane=(shape:P7[],extra:Partial<Task7>={})=>{visual={mode:'choice',diagram:'plane',instruction:'Use the labelled coordinates.',shape,...extra};};
 const polygon=(p:Polygon7)=>{visual={mode:'choice',diagram:'polygons',instruction:'Use the stated side and angle properties.',polygons:[p]};};
 const flow=(root:Flow7)=>{visual={mode:'choice',diagram:'flow',instruction:'Follow each decision in order.',trees:[{title:'Shape classifier',root}]};};
 const heights=Array.from({length:6},()=>int(0,3));if(heights.filter(Boolean).length<3){for(const i of [0,2,4])heights[i]=int(1,3);}if(Math.max(...heights)<2)heights[2]=2;
 // At least one column has stacks in both rows, so hidden cubes matter in every view question.
 if(![0,1,2].some(i=>heights[i]>0&&heights[i+3]>0)){heights[1]=int(1,3);heights[4]=int(1,3);}
 const plan=()=>{visual={mode:'choice',diagram:'plans',instruction:'Back row is first. Front view looks from the marked front; side profile is listed back row first.',cols:3,rows:2,heights,showModel:true};};
 const planText=`Height plan, back row [${heights.slice(0,3).join(', ')}], front row [${heights.slice(3).join(', ')}]. `;
 const front=[0,1,2].map(i=>Math.max(heights[i],heights[i+3])),sums=[0,1,2].map(i=>heights[i]+heights[i+3]),side=[Math.max(...heights.slice(0,3)),Math.max(...heights.slice(3))],total=heights.reduce((s,n)=>s+n,0),occupied=heights.filter(Boolean).length;
 const sideTriangle=(lengths:number[])=>{const [base,left,right]=lengths,apexX=(base*base+left*left-right*right)/(2*base);polygon({points:[{x:0,y:0},{x:base,y:0},{x:apexX,y:Math.sqrt(left*left-apexX*apexX)}],sideLabels:[String(base)+' cm',String(right)+' cm',String(left)+' cm'],caption:'Triangle with the stated side lengths.'});};
 const triangleSorter:Flow7={question:'All 3 sides equal?',yes:'Equilateral',no:{question:'Exactly 2 sides equal?',yes:'Isosceles',no:'Scalene'}};
 const letter=(i:number)=>String.fromCharCode(65+i);
 switch(key){
 // ── Nets (AC9M7SP01)
 case 1:{
  if(A){const [solid,faces]=pick([['Square pyramid','one square and four triangles'],['Triangular prism','two triangles and three rectangles'],['Rectangular prism','six rectangles in three matching pairs'],['Triangular pyramid','four triangles'],['Pentagonal prism','two pentagons and five rectangles']] as const);choose(`A net is made from ${faces}. What solid does it fold into?`,solid,['Cube','Square pyramid','Triangular prism','Rectangular prism','Triangular pyramid'].filter(s=>s!==solid),`Match the faces: ${faces} fold into a ${solid.toLowerCase()}.`);break;}
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
  const sides=b+3;
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
  if(F)numeric(`A footprint has ${a} occupied positions. Each occupied stack is at least 1 cube tall. What is the least possible cube total?`,a,'Use 1 cube at every occupied position.',[a+1,a*2]);
  else if(R)numeric(`A footprint has ${a} occupied positions and each stack is 1 to ${k} cubes tall. How many different cube totals are possible?`,a*k-a+1,`Totals run from ${a} to ${a*k}, every whole number in between: ${a*k} − ${a} + 1 = ${a*k-a+1}. One view does not fix the object.`,[a*k,a*k-a,k]);
  else numeric(`A footprint has ${a} occupied positions. Each stack is at least 1 and at most ${k} cubes tall. What is the greatest possible cube total?`,a*k,'Use the upper height limit at every occupied position.',[a+k,a*(k-1),k]);
  break;}
 case 9:{const context=int(0,2),requests=['cut connected faces from one sheet for a box','find exact stack heights and occupied floor positions','show the overall three-dimensional appearance'],answers=['A labelled net','A height plan','An isometric drawing'];
  if(R){const q=pick([['What can a height plan show that an isometric drawing might hide?','Cubes hidden behind taller stacks.',['The colour of every cube.','The total area of the floor only.','Nothing; they always show the same information.']],['What does a footprint NOT tell you?','How tall each stack is.',['Which ground positions are used.','How many ground positions are used.','The shape of the base.']],['Why might an isometric drawing be less useful than a height plan for counting cubes?','Some cubes can be hidden from view.',['Isometric drawings never show cubes.','Height plans show colour.','Isometric drawings are always too small.']]] as const);choose(q[0],q[1],[...q[2]],guide.idea);}
  else choose(`${A?'A design team needs to':'Choose a representation to'} ${requests[context]}. Which representation is best?`,answers[context],answers.filter((_,i)=>i!==context).concat('An unlabelled shadow'),context===0?'A net lays out faces and shared folding edges.':context===1?'A height plan records every ground position and its stack height.':'An isometric drawing communicates overall form but can hide cubes behind others.');
  break;}
 // ── Triangles and quadrilaterals (AC9M7SP02)
 case 10:{const v=int(0,2),lengths=v===0?[a,a,a]:v===1?[a,a,a+1]:[a,a+1,a+2],label=['Equilateral','Isosceles','Scalene'][v];
  if(F){sideTriangle(lengths);choose(`A triangle has side lengths ${lengths.join(', ')} cm. Type its classification by sides.`,label,['Equilateral','Isosceles','Scalene','Right-angled'].filter(s=>s!==label),'Count the equal side lengths. Here isosceles means exactly two equal sides.');}
  else if(R){const iso=[a,a+1,a];sideTriangle(iso);choose(`A student says a triangle with sides ${iso.join(', ')} cm is scalene because the equal sides are not next to each other in the list. Type the correct classification by sides.`,'Isosceles',['Scalene','Equilateral','Obtuse'],'Order in a list does not matter: two sides are equal, so it is isosceles.');}
  else{const drawn=int(2,2*a-1),third=drawn===a?a+1:drawn;numeric(`An isosceles triangle has two equal sides of ${a} cm and a perimeter of ${2*a+third} cm. How long is the third side in cm?`,third,`Perimeter − two equal sides: ${2*a+third} − ${2*a} = ${third}.`,[2*a+third-a,a]);}
  break;}
 case 11:{const sets=[[50,60,70],[30,60,90],[25,45,110],[40,65,75],[20,70,90],[35,40,105]],angles=pick(sets),name=Math.max(...angles)>90?'Obtuse':angles.includes(90)?'Right-angled':'Acute';
  const draw=(ang:number[])=>{const base=5,left=base*Math.sin(ang[1]*Math.PI/180)/Math.sin(ang[2]*Math.PI/180);polygon({points:[{x:0,y:0},{x:base,y:0},{x:left*Math.cos(ang[0]*Math.PI/180),y:left*Math.sin(ang[0]*Math.PI/180)}],angles:ang.map(n=>String(n)+'°'),caption:'Triangle with the stated interior angles.'});};
  if(F){draw(angles);choose(`A triangle has angles ${angles.join('°, ')}°. Type its classification by angles.`,name,['Acute','Right-angled','Obtuse','Equilateral'].filter(s=>s!==name),`The greatest angle is ${Math.max(...angles)}°.`);}
  else if(R){const t=pick(sets.filter(s=>Math.max(...s)>=90)),n2=Math.max(...t)>90?'Obtuse':'Right-angled';draw(t);choose(`A student says a triangle with angles ${t.join('°, ')}° is acute because two of its angles are acute. Type the correct classification by angles.`,n2,['Acute','Equilateral',n2==='Obtuse'?'Right-angled':'Obtuse'],`Classify by the largest angle: ${Math.max(...t)}°. Every triangle has at least two acute angles.`);}
  else{choose(`A triangle has two angles of ${angles[0]}° and ${angles[1]}°. Type its classification by angles.`,name,['Acute','Right-angled','Obtuse','Equilateral'].filter(s=>s!==name),`The third angle is 180 − ${angles[0]} − ${angles[1]} = ${angles[2]}°, so the triangle is ${name.toLowerCase()}.`);}
  break;}
 case 12:{
  if(R){const longest=a+b+(int(0,1)?0:-1);choose(`Can side lengths ${a}, ${b} and ${longest} cm enclose a triangle?`,a+b>longest?'Yes; the two shorter lengths add to more than the longest.':'No; the two shorter lengths only equal the longest.',a+b>longest?['No; all sides must be equal.','Yes; adding any two positive numbers is sufficient.','No; the longest must exceed the other two combined.']:['Yes; equality is sufficient.','Yes; every three lengths make a triangle.','No; a triangle must have a right angle.'],'The two shorter sides must add to more than the longest.');}
  else numeric(`Two sides of a triangle are ${a} cm and ${b} cm. What is the ${A?'least':'greatest'} possible whole-number third side in cm?`,A?Math.abs(a-b)+1:a+b-1,'The third side must be strictly between the difference and the sum of the other two lengths.',A?[Math.abs(a-b),1]:[a+b,Math.max(a,b)]);
  break;}
 case 13:{const v=int(0,2),facts=['two pairs of parallel opposite sides, but no right angles and not all sides equal',`four right angles and adjacent side lengths ${2*a} and ${a}`,`four equal sides of ${a} cm with angles 60°, 120°, 60°, 120°`],names=['Parallelogram','Rectangle','Rhombus'];
  if(F)choose(`A quadrilateral has ${facts[v]}. Type its most specific family name.`,names[v],names.filter((_,i)=>i!==v).concat('Square'),'Check parallel sides, then right angles and equal sides.');
  else if(R)choose(`A student says a quadrilateral with four equal sides of ${a} cm and angles 60°, 120°, 60°, 120° is a square. Type its correct most specific family name.`,'Rhombus',['Square','Rectangle','Kite'],'A square needs four right angles as well as four equal sides.');
  else{const shape=pick([['rhombus',4],['square',4],['equilateral triangle',3]] as const);numeric(`A ${shape[0]} has a perimeter of ${shape[1]*a} cm. How long is each side in cm?`,a,`All ${shape[1]} sides are equal: ${shape[1]*a} ÷ ${shape[1]} = ${a}.`,[shape[1]*a/2,shape[1]*a-shape[1]]);}
  break;}
 case 14:{
  if(F){const [desc,count]=pick([['A square',4],['A rhombus that is not a square',3],['A rectangle that is not a square',2],['A parallelogram with no right angles and unequal adjacent sides',1]] as const);numeric(`${desc}: how many of these families does it belong to — parallelogram, rectangle, rhombus, kite? (A kite has two pairs of equal adjacent sides.)`,count,count===4?'A square meets every definition.':count===3?'A rhombus is a parallelogram and a kite, but has no right angles.':count===2?'A rectangle is a parallelogram with right angles; its adjacent sides are unequal, so it is not a rhombus or kite.':'It is only a parallelogram.',[4,3,2,1].filter(n=>n!==count));}
  else if(R){const fam=pick([['rectangle','it has four right angles'],['rhombus','all four sides are equal'],['parallelogram','both pairs of opposite sides are parallel']] as const);choose(`Why is every square also a ${fam[0]}?`,`Because ${fam[1]}.`,['Because it is drawn with horizontal sides.','Because a shape can only have one family name.','Because all four of its angles are acute.'],`A square has every property of a ${fam[0]}.`);}
  else{const [desc,name]=pick([['is both a rectangle and a rhombus','Square'],[`has four right angles and adjacent sides of ${a} cm and ${2*a} cm`,'Rectangle'],[`is a parallelogram with four equal sides of ${a} cm but no right angles`,'Rhombus']] as const);choose(`A quadrilateral ${desc}. Type its most specific family name.`,name,['Square','Rectangle','Rhombus','Parallelogram'].filter(s=>s!==name),'Combine the properties to find the most specific family.');}
  break;}
 case 15:{
  if(F){const isKite=int(0,1)===1;choose(`${isKite?`A quadrilateral has adjacent side lengths ${a}, ${a}, ${b}, ${b} cm and no parallel sides.`:'A quadrilateral has exactly one pair of parallel sides.'} Type the family name. Here a trapezium has exactly one pair of parallel sides.`,isKite?'Kite':'Trapezium',['Kite','Trapezium','Parallelogram','Square'].filter(s=>s!==(isKite?'Kite':'Trapezium')),isKite?'Two pairs of equal adjacent sides meet the kite definition.':'Exactly one pair of parallel sides meets the trapezium definition.');}
  else if(R)choose('Why must a trapezium definition say whether it means exactly one pair of parallel sides?','The definition decides whether parallelograms belong to the trapezium family.',['Parallel sides must always be equal in length.','Every quadrilateral has parallel sides.','A reflection changes the number of parallel pairs.'],'Using exactly one pair excludes parallelograms, which have two parallel pairs.');
  else{const kite=int(0,1)===1;numeric(`A ${kite?'kite has two pairs of equal adjacent sides':'trapezium is defined here to have exactly one pair of parallel sides'}. How many ${kite?'equal-side pairs':'parallel-side pairs'} does this property specify?`,kite?2:1,'Count pairs, not the individual sides in those pairs.',kite?[4,1]:[2,4]);}
  break;}
 // ── Polygons (AC9M7SP02)
 case 16:{const n=pick([5,6,8]),name=POLYGON_NAMES[n];
  if(F){const reg=int(0,1)===1;polygon(reg?regular(n):{points:[{x:-3,y:-1},{x:3,y:-1},{x:3,y:1},{x:-3,y:1}],caption:'A rectangle with side lengths 6, 2, 6, 2 and four right angles.'});choose('Is the displayed polygon regular?',reg?'Yes; all sides and all angles are equal.':'No; the side lengths are not all equal.',reg?['No; regularity depends on orientation.','No; a regular polygon must have four sides.','Yes, but only because the angles are equal.']:['Yes; four right angles guarantee regularity.','Yes; every rectangle is regular.','No; the angles are not equal.'],guide.idea);}
  else if(R){const [shape,fails]=pick([['A rhombus with angles 60°, 120°, 60°, 120°','its angles are not all equal'],['A rectangle with sides 6, 2, 6, 2 cm','its sides are not all equal'],['A hexagon with all angles 120° but sides 2, 3, 2, 3, 2, 3 cm','its sides are not all equal']] as const);choose(`${shape}. Why is it not regular?`,`Because ${fails}.`,['Because it is not drawn upright.',`Because ${fails.includes('angles')?'its sides are not all equal':'its angles are not all equal'}.`,'Because regular shapes must have four sides.'],'A regular polygon needs all sides equal AND all angles equal.');}
  else{const side=a;numeric(`A regular ${name} has a perimeter of ${n*side} cm. How long is each side in cm?`,side,`All ${n} sides are equal: ${n*side} ÷ ${n} = ${side}.`,[n*side/2,n*side-n]);}
  break;}
 case 17:{const concave=int(0,1)===1;polygon(concave?{points:[{x:-3,y:-2},{x:3,y:-2},{x:0,y:0},{x:3,y:2},{x:-3,y:2}],caption:'A simple pentagon with an inward dent and an interior angle greater than 180°.'}:regular(5));
  if(F)choose('Is the displayed polygon convex or concave? Type your answer.',concave?'Concave':'Convex',concave?['Convex','Regular convex','Irregular convex']:['Concave','Irregular convex','Regular convex'],concave?'One interior angle exceeds 180°.':'Every interior angle is less than 180°.');
  else if(R)choose(`${concave?'A student says this pentagon is convex because it has five sides.':'A student says this pentagon is concave because all pentagons have a dent.'} Which statement is correct?`,concave?'It is concave; one interior angle exceeds 180°.':'It is convex; every interior angle is less than 180°.',concave?['It is convex; five sides always make a convex polygon.','It is regular; the dent gives equal angles.','It is not a polygon.']:['It is concave; all pentagons have a dent.','It is concave; translation changes the angles.','It is not a polygon.'],guide.idea);
  else{const reflex=int(19,28)*10;visual=undefined;choose(`A hexagon has interior angles of 100°, ${reflex}°, 90°, 100°, ${300-reflex}° and 130° (they add to 720°). Type whether it is convex or concave.`,'Concave',['Convex','Regular convex','Irregular convex'],`One angle, ${reflex}°, is greater than 180°, so the hexagon is concave.`);}
  break;}
 case 18:{const v=int(0,2),claims=['every rectangle is a square','every rhombus is a square','every parallelogram is a rectangle'],examples=[`A rectangle with sides ${a*2}, ${a}, ${a*2}, ${a} cm.`,`A rhombus with side ${a} cm and angles 60°, 120°, 60°, 120°.`,`A parallelogram with sides ${a*2}, ${a}, ${a*2}, ${a} cm and angles 60°, 120°, 60°, 120°.`];
  if(A)choose(`A classifier assumes that ${claims[v]}. Which shape would make it give a wrong answer?`,examples[v],[`A square with side ${a} cm.`,'An equilateral triangle.','A circle with radius 3 cm.'],'A counterexample belongs to the first family but lacks the extra property the claim needs.');
  else choose(`${R?'A student checks “'+claims[v]+'” with three squares and says it is always true. ':''}Which counterexample disproves “${claims[v]}”?`,examples[v],[`A square with side ${a} cm.`,'An equilateral triangle.','A circle with radius 3 cm.'],'One valid counterexample disproves an "always" claim; supporting examples do not prove it.');
  break;}
 // ── Translations (AC9M7SP03)
 case 19:{const p={x,y},q={x:x+dx,y:y+dy};plane([p]);
  if(F)point(`P = ${pair(p)}. Translate it ${units(dx)} right and ${units(-dy)} down. Type the image of P.`,q,'Add the horizontal change to x and the vertical change to y.',[{x:x-dx,y:y-dy},{x:x+dx,y:y-dy}]);
  else if(R)point(`P = ${pair(p)} is translated ${units(dx)} right and ${units(-dy)} down. A student wrote ${pair({x:x-dx,y:y-dy})}. Type the correct image of P.`,q,'Right adds to x; down subtracts from y. The student moved in the opposite directions.',[{x:x-dx,y:y-dy}]);
  else point(`P = ${pair(p)}. Translate it ${units(dx)} right and ${units(-dy)} down, then repeat the same translation. Type the final position of P.`,{x:x+2*dx,y:y+2*dy},'Apply the same changes to the current point each time.',[q,{x:x+dx,y:y+2*dy}]);
  break;}
 case 20:{const shape=[{x,y:1},{x:x+2,y:1},{x,y:3}],q=shape.map(p=>({x:p.x+dx,y:p.y-2}));plane(shape);
  if(F)choose(`Triangle vertices are ${pts(shape)}. Translate ${units(dx)} right and 2 units down. Type the image vertices in the same order, as points (x, y).`,pts(q),[pts(shape),pts(q.map(p=>({x:p.x+1,y:p.y+1}))),pts(shape.map(p=>({x:p.x-dx,y:p.y+2})))],'Add the full translation to every vertex, keeping the listed order.');
  else if(R){const vi=int(0,2);point(`Triangle vertices are ${pts(shape)}. A student translated only one vertex ${units(dx)} right and 2 units down. Type the correct image of vertex ${pair(shape[vi])} as a point.`,q[vi],'Every vertex moves by the same vector, so the shape keeps its side lengths and angles.',[shape[vi]]);}
  else choose(`Triangle vertices are ${pts(shape)}. Translate ${units(dx)} right and 2 units down, then 1 unit left. Type the image vertices in the same order, as points (x, y).`,pts(q.map(p=>({x:p.x-1,y:p.y}))),[pts(q),pts(shape),pts(q.map(p=>({x:p.x+1,y:p.y})))],`Combine the moves: ${dx-1} right and 2 down in total.`);
  break;}
 case 21:{const p={x,y},q={x:x+dx,y:y+dy};plane([p],{image:[q]});
  if(F)point(`P = ${pair(p)} maps to B = ${pair(q)}. Type the translation vector from P to B as a pair (right, up).`,{x:dx,y:dy},'Subtract the start coordinates from the end coordinates.',[{x:-dx,y:-dy}]);
  else if(R)point(`P = ${pair(p)} maps to B = ${pair(q)}. A student subtracted the image from the original and wrote ${pair({x:-dx,y:-dy})}. Type the correct translation vector from P to B as a pair.`,{x:dx,y:dy},'Image minus original gives the vector from the original to the image.',[{x:-dx,y:-dy}]);
  else point(`P = ${pair(p)} maps to B = ${pair(q)}. Type the translation vector that takes B back to P as a pair.`,{x:-dx,y:-dy},'Going back reverses both components.',[{x:dx,y:dy}]);
  break;}
 // ── Reflections (AC9M7SP03)
 case 22:case 23:{const reflectX=key===22,p={x,y};plane([p]);
  if(F)point(`P = ${pair(p)} is reflected in the ${reflectX?'x':'y'}-axis. Type the image of P.`,reflectX?{x,y:-y}:{x:-x,y},'The reflection keeps the distance from the mirror line.',[reflectX?{x:-x,y}:{x,y:-y}]);
  else if(R)point(`P = ${pair(p)} is reflected in the ${reflectX?'x':'y'}-axis. A student wrote ${pair(reflectX?{x:-x,y}:{x,y:-y})}. Type the correct image of P.`,reflectX?{x,y:-y}:{x:-x,y},`Reflecting in the ${reflectX?'x':'y'}-axis changes the sign of ${reflectX?'y':'x'}, not ${reflectX?'x':'y'}.`,[reflectX?{x:-x,y}:{x,y:-y}]);
  else point(`P = ${pair(p)} is reflected in the ${reflectX?'x':'y'}-axis, then in the other axis. Type the final image of P.`,{x:-x,y:-y},'Reflecting in both axes reverses both signs.',[reflectX?{x,y:-y}:{x:-x,y}]);
  break;}
 case 24:{const first=int(-2,0),second=first+int(1,3);plane([{x,y}],{mirrorX:[first,second]});
  if(F)point(`P = ${pair({x,y})}. Reflect first in x = ${first}, then in x = ${second}. Type the final image of P.`,{x:2*second-(2*first-x),y},'For a mirror x = a, replace x by 2a − x. Repeat with the second mirror.',[{x:2*first-x,y},{x:2*first-(2*second-x),y}]);
  else if(R)numeric(`Reflecting in x = ${first} and then in x = ${second} is the same as one translation. How many units right is that translation? (Use a negative number for left.)`,2*(second-first),`Two reflections in parallel lines translate by twice the gap: 2 × (${second} − (${first})) = ${2*(second-first)}.`,[second-first,-2*(second-first)]);
  else point(`P = ${pair({x,y})}. Reflect first in x = ${second}, then in x = ${first}. Type the final image of P.`,{x:2*first-(2*second-x),y},'Reversing the order reverses the direction of the overall translation.',[{x:2*second-(2*first-x),y}]);
  break;}
 // ── Rotations and combinations (AC9M7SP03)
 case 25:{plane([{x,y}]);
  if(F)point(`P = ${pair({x,y})}. Rotate it 90° clockwise about the origin. Type the image of P.`,{x:y,y:-x},'A clockwise quarter-turn maps (x, y) to (y, −x).',[{x:-y,y:x},{x:-x,y:-y}]);
  else if(R)point(`P = ${pair({x,y})} is rotated 90° clockwise about the origin. A student used (−y, x) and wrote ${pair({x:-y,y:x})}. Type the correct image of P.`,{x:y,y:-x},'(−y, x) is the anticlockwise rule. Clockwise uses (y, −x).',[{x:-y,y:x}]);
  else point(`P = ${pair({x,y})}. Rotate it 180° about the origin. Type the image of P.`,{x:-x,y:-y},'A half-turn reverses both coordinates.',[{x:y,y:-x},{x:-x,y}]);
  break;}
 case 26:{const centre={x:int(-1,1),y:int(-1,1)},p={x:centre.x+2,y:centre.y+1};plane([p],{centre});
  if(F)point(`P = ${pair(p)}, centre C = ${pair(centre)}. Rotate P 90° clockwise about C. Type the image of P.`,{x:centre.x+1,y:centre.y-2},'Relative to C, P is (2, 1). Rotate that to (1, −2), then add C back.',[{x:p.y,y:-p.x}]);
  else if(R)point(`P = ${pair(p)} is rotated 90° clockwise about C = ${pair(centre)}. A student rotated about the origin instead and wrote ${pair({x:p.y,y:-p.x})}. Type the correct image of P.`,{x:centre.x+1,y:centre.y-2},'Subtract C, rotate the relative coordinates, then add C back.',[{x:p.y,y:-p.x}]);
  else point(`P = ${pair(p)}, centre C = ${pair(centre)}. Rotate P 90° anticlockwise about C. Type the image of P.`,{x:centre.x-1,y:centre.y+2},'Relative to C, P is (2, 1); anticlockwise gives (−1, 2); add C back.',[{x:centre.x+1,y:centre.y-2}]);
  break;}
 case 27:{plane([{x,y}]);
  if(F)point(`Start P = ${pair({x,y})}. Translate ${units(dx)} right, then reflect in the y-axis. Type the final image of P.`,{x:-(x+dx),y},'Work in order: translate first, then reflect the new point.',[{x:-x+dx,y}]);
  else if(R)numeric(`P = ${pair({x,y})}. Route 1: translate ${units(dx)} right, then reflect in the y-axis. Route 2: reflect in the y-axis, then translate ${units(dx)} right. How many units apart are the two final points?`,2*dx,`Route 1 ends at ${pair({x:-(x+dx),y})}; route 2 at ${pair({x:-x+dx,y})}. They are ${2*dx} units apart, so order matters.`,[dx,0]);
  else point(`Start P = ${pair({x,y})}. Reflect in the y-axis, then translate ${units(dx)} right. Type the final image of P.`,{x:-x+dx,y},'Apply the second move to the first image.',[{x:-(x+dx),y}]);
  break;}
 // ── Classifiers (AC9M7SP04)
 case 28:{const v=int(0,2),lengths=v===0?[a,a,a]:v===1?[a,a,a+1]:[a,a+1,a+2],out=['Equilateral','Isosceles','Scalene'][v];flow(triangleSorter);
  if(F)choose(`Trace the classifier for side lengths ${lengths.join(', ')} cm. Type the output.`,out,['Equilateral','Isosceles','Scalene'].filter(s=>s!==out).concat('No output'),'Check all-three-equal first, then exactly-two-equal.');
  else if(R)choose(`A student skipped the first question for side lengths ${a}, ${a}, ${a} cm and went straight to “Exactly 2 sides equal?”. Type the output the classifier should give.`,'Equilateral',['Isosceles','Scalene','No output'],'Every decision is checked in order; the first question already sends this triangle to Equilateral.');
  else{const ang=pick([[30,60,90],[25,45,110],[50,60,70]]),name=Math.max(...ang)>90?'Obtuse':ang.includes(90)?'Right-angled':'Acute';flow({question:'Any angle equal to 90°?',yes:'Right-angled',no:{question:'Any angle greater than 90°?',yes:'Obtuse',no:'Acute'}});choose(`Trace this angle classifier for a triangle with angles ${ang.join('°, ')}°. Type the output.`,name,['Acute','Right-angled','Obtuse','No output'].filter(s=>s!==name),'Follow each decision in order.');}
  break;}
 case 29:{const v=int(0,2),out=['Equilateral','Right-angled triangle','Obtuse triangle'][v],condition=['Are all three sides equal?','Does one interior angle equal 90°?','Does one interior angle exceed 90°?'][v];flow({question:'?',yes:out,no:'Another triangle group'});
  choose(`${A?'A programmer is checking the Yes branch. ':R?'Choose the defining property. ':''}Only ${out.toLowerCase()}s should follow Yes. Which decision belongs in the empty box?`,condition,['Does at least one angle measure less than 90°?','Does the shape have three sides?','Are all side lengths positive?'],`Test the defining property: ${condition}`);break;}
 case 30:{flow({question:'Four right angles?',yes:{question:'Four equal sides?',yes:'Square',no:'Non-square rectangle'},no:{question:'Four equal sides?',yes:'Non-square rhombus',no:'Other quadrilateral'}});
  const v=int(0,3),facts=[`four right angles and four sides of ${a} cm`,`four right angles and side lengths ${2*a}, ${a}, ${2*a}, ${a} cm`,`four sides of ${a} cm and angles 60°, 120°, 60°, 120°`,`side lengths ${2*a}, ${a}, ${2*a}, ${a} cm and angles 60°, 120°, 60°, 120°`],names=['Square','Non-square rectangle','Non-square rhombus','Other quadrilateral'];
  if(R)choose(`A shorter classifier asks only “Four right angles?” and outputs “Rectangle” on Yes. Which group can it not tell apart from rectangles?`,'Squares',['Rhombuses','Kites','Triangles'],'Squares and non-square rectangles both have four right angles; a second test of equal sides separates them.');
  else choose(`Trace this classifier for a quadrilateral with ${facts[v]}. Type the output.`,names[v],names.filter((_,i)=>i!==v),'Answer both questions: right angles, then equal sides.');
  break;}
 case 31:{const v=int(0,2);flow({question:'Any interior angle greater than 180°?',yes:'Concave',no:{question:'All sides and all angles equal?',yes:'Regular convex',no:'Irregular convex'}});const facts=['one interior angle greater than 180°','all sides and angles equal','four right angles and unequal adjacent side lengths'],labels=['Concave','Regular convex','Irregular convex'];
  if(R)choose('A student moves “All sides and all angles equal?” to the top of this classifier. Which shape would now be labelled wrongly?','A concave polygon with all sides equal and angles that look equal in pairs.',['A regular pentagon.','A rectangle with unequal sides.','A square.'],'Concavity must be checked first, or a dented shape could reach a convex label.');
  else choose(`A simple polygon has ${facts[v]}. Type the label the classifier gives.`,labels[v],labels.filter((_,i)=>i!==v).concat('No output'),guide.idea);
  break;}
 case 32:{const v=int(0,2),rules=['All sides equal?','Four right angles?','At least two sides equal?'],outputs=['Regular polygon','Square','Equilateral triangle'],counter=[`A rhombus with side ${a} cm and angles 60°, 120°, 60°, 120°.`,`A rectangle with side lengths ${a*2}, ${a}, ${a*2}, ${a} cm.`,`A triangle with side lengths ${a}, ${a}, ${a+1} cm.`];flow({question:rules[v],yes:outputs[v],no:'Other'});
  choose(`${A?'You are testing this classifier before it is used. ':R?'Find the faulty branch. ':''}Which input wrongly reaches “${outputs[v]}”?`,counter[v],v===2?[`A triangle with all sides ${a} cm.`,`A triangle with sides ${a}, ${a+1}, ${a+2} cm.`,'A scalene right triangle.']:[`A square with side ${a} cm.`,'A circle.','A scalene triangle.'],'The counterexample passes the displayed test but does not satisfy every property of the output category.');break;}
 case 33:{const angleMode=int(0,1)===1;flow(angleMode?{question:'Any angle equal to 90°?',yes:'Right-angled',no:{question:'?',yes:'Obtuse',no:'Acute'}}:{question:'All 3 sides equal?',yes:'Equilateral',no:{question:'?',yes:'Isosceles',no:'Scalene'}});
  choose(`${A?'An unfinished program needs to cover every triangle. ':R?'Use the first No branch. ':''}Complete this ${angleMode?'angle':'side'} classifier for valid triangles. Which question belongs in the second box?`,angleMode?'Does one angle exceed 90°?':'Are exactly two sides equal?',angleMode?['Are all angles less than 90°?','Does one angle equal 90°?','Does the triangle have three angles?']:['Are all three sides equal?','Does one angle measure less than 90°?','Does the triangle have three sides?'],'Use the first No branch to exclude the first category, then test the defining property of the remaining Yes category.');break;}
 case 34:{const n=pick([5,6,8]),name=POLYGON_NAMES[n],angle=(n-2)*180/n;polygon(regular(n));
  if(F)numeric(`A regular ${name} has interior angles of ${angle}°. It is rotated 90°. What is each interior angle now, in degrees?`,angle,'Rotations preserve angle sizes and side lengths, so the shape stays regular.',[angle+90,angle-90,90]);
  else if(R){const move=pick(['translation','reflection','rotation'] as const),right={translation:'Its position changes; its orientation, side lengths and angles stay the same.',reflection:'It is flipped; its side lengths and angles stay the same.',rotation:'Its orientation changes; its side lengths and angles stay the same.'}[move];choose(`A regular ${name} undergoes a ${move}. Which statement is correct?`,right,['Its side lengths change, so it is no longer regular.','Its angles change, so it becomes concave.',...Object.values({translation:'Its position changes; its orientation, side lengths and angles stay the same.',reflection:'It is flipped; its side lengths and angles stay the same.',rotation:'Its orientation changes; its side lengths and angles stay the same.'}).filter(s=>s!==right)],'Translations, reflections and rotations preserve side lengths, angle sizes and regularity.');}
  else{visual=undefined;const [shape,name2]=pick([[`a quadrilateral with four sides of ${a} cm and angles 60°, 120°, 60°, 120°`,'Rhombus'],[`a quadrilateral with adjacent sides ${a}, ${a}, ${b+a}, ${b+a} cm and no parallel sides`,'Kite'],[`a quadrilateral with four right angles and sides ${2*a}, ${a}, ${2*a}, ${a} cm`,'Rectangle']] as const);choose(`${shape[0].toUpperCase()+shape.slice(1)} is reflected and then rotated. Type its family name after the moves.`,name2,['Rhombus','Kite','Rectangle','Square'].filter(s=>s!==name2),'The moves preserve side lengths and angles, so the family name does not change.');}
  break;}
 case 35:{const v=int(0,3),facts=[`four sides of ${a} cm and four right angles`,`side lengths ${a*2}, ${a}, ${a*2}, ${a} cm and four right angles`,`four sides of ${a} cm and angles 60°, 120°, 60°, 120°`,`side lengths ${a*2}, ${a}, ${a*2}, ${a} cm and angles 60°, 120°, 60°, 120°`],names=['Square','Non-square rectangle','Non-square rhombus','Other quadrilateral'];
  if(R)choose('One tree tests right angles then equal sides; another tests equal sides then right angles. Can both distinguish squares, non-square rectangles, non-square rhombuses and other quadrilaterals?','Yes, if both trees keep both tests where needed and label all four outcomes correctly.',['No; only one decision order can ever work.','Yes, even if both trees stop after the first Yes.','No; squares do not share properties with other families.'],'Test the four combinations of equal sides and right angles. Both complete trees can reach the same four categories.');
  else choose(`Two complete trees test equal sides and right angles in opposite orders. For a shape with ${facts[v]}, type the output both should give.`,names[v],names.filter((_,i)=>i!==v),'Evaluate both properties; their truth values determine the same category in either order.');
  break;}
 case 36:{const names=['Square','Non-square rectangle','Non-square rhombus','Other quadrilateral'],missing=int(0,3);
  if(R)choose('Which test set gives evidence that a four-way quadrilateral classifier covers squares, non-square rectangles, non-square rhombuses and other quadrilaterals?','One valid example from each of the four groups, including a square.',['Four differently rotated squares.','Four different-sized non-square rectangles.','One triangle and three circles.'],'Each intended output needs a test, including the overlap case.');
  else choose(`A test set already covers ${names.filter((_,i)=>i!==missing).join(', ')}. Type the group still needed to test all four outputs.`,names[missing],names.filter((_,i)=>i!==missing),'Every intended output needs a valid test example.');
  break;}
 default:throw Error('Unknown Space lesson');
 }
 const options=[...new Set([answer,...wrong])].slice(0,4);if(!prompt||options.length!==4)throw Error(`Invalid options ${key}/${role}: ${prompt}`);
 for(let i=3;i>0;i--){const j=int(0,i);[options[i],options[j]]=[options[j],options[i]];}
 return {readabilityRevision:SPACE7_READABILITY_REVISION,kind:'multiple_choice',prompt,answer,options,explanation,spaceVisual:visual,lessonId:`y7-space-w${week}-l${lesson}`,version:2,skillKey:key,tier:role,answerLabels,steps:[guide.idea,explanation,`Answer: ${answer}. Check against the stated properties and direction.`]};
}
export function generateSpace7Question(_level:unknown,lesson:Lesson,activity:LessonActivity){return space7Question(lesson.week,lesson.lesson,Math.floor(Math.random()*0x7fffffff),activity.config.rotationRole as Space7Role);}
export function space7Quiz(week:number){
 if(!Number.isInteger(week)||week<1||week>9)throw Error('Unknown Space Level 7 quiz');
 return [1,2,3].flatMap(lesson=>{const seen=new Set<string>();return (['fast_thinking','reasoning','apply_create','fast_thinking','apply_create'] as const).map((role,i)=>{
  for(let attempt=0;attempt<200;attempt++){const q=space7Question(week,lesson,970001+week*10007+lesson*101+i*7919+attempt*104729,role);const fingerprint=q.prompt+JSON.stringify(q.spaceVisual)+q.options.slice().sort().join('|');if(seen.has(fingerprint))continue;seen.add(fingerprint);return {...q,id:`y7-space-w${week}-quiz-l${lesson}-${i+1}`,lessonTag:lesson as 1|2|3};}
  throw Error(`Insufficient Space quiz variations: ${week}/${lesson}/${role}`);
 });});
}
