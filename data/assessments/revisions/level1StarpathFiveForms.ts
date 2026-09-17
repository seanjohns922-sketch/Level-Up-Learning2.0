import type { GroundTask, ShapeSpec } from './groundStarpathRedesignedForms';
import { GROUND_STARPATH_FORMS, type GroundStarpathForm } from './groundStarpathFiveForms';
export type Direction = 'up'|'right'|'down'|'left';
export type Cell = {r:number;c:number};
export type RouteTask = {
  mode:'destination'|'record'|'build'|'choice'; prompt:string; instruction:string;
  start:Cell; goal?:Cell; goalObject:string; landmarks:{cell:Cell;object:string}[];
  blocked:Cell[]; checkpoint?:Cell; given?:Direction[]; shown?:Direction[];
  options?:{id:string;label:string}[]; correctId?:string;
  facing?:Direction; turn?:'left'|'right'; example:Direction[];
};
export type Level1Item = {
  id:string; version:'5.0.0'; form:GroundStarpathForm; prompt:string; readAloudText:string;
  primaryDescriptorCode:'AC9M1SP01'|'AC9M1SP02'; skillLabel:string;
  difficulty:'easy'|'moderate'|'challenging'; linkedWeeks:number[];
} & ({kind:'shape';task:GroundTask}|{kind:'route';task:RouteTask});
export const LEVEL1_STARPATH_BLUEPRINT = [
  'Recognise a shape after turning','Classify straight-sided shapes','Compare circles and ovals',
  'Explain a shape group','Sort using two features','Recognise shapes in everyday objects',
  'Explain an odd shape','Make a triangle','Make a four-sided shape','Compare familiar shapes',
  'Follow two instructions','Follow an ordered route','Turn from a given facing',
  'Record a pictured route','Give directions to a destination','Find an incorrect instruction',
  'Choose directions in order','Plan around an obstacle','Visit a landmark on the way','Plan a route with two conditions',
] as const;
export const DIRECTION_DELTA:Record<Direction,Cell>={up:{r:-1,c:0},right:{r:0,c:1},down:{r:1,c:0},left:{r:0,c:-1}};
export const routeCells=(start:Cell,moves:Direction[])=>moves.reduce<Cell[]>((path,d)=>{const last=path[path.length-1],v=DIRECTION_DELTA[d];return [...path,{r:last.r+v.r,c:last.c+v.c}];},[start]);
const rotate=<T,>(a:T[],n:number)=>[...a.slice(n%a.length),...a.slice(0,n%a.length)];
const colours=['#a78bfa','#67e8f9','#fbbf24','#86efac','#f9a8d4'];
const s=(shape:ShapeSpec['shape'],rotation=0,colour='#a78bfa',scale=.85):ShapeSpec=>({shape,rotation,colour,scale});
const irregular=(f:number):ShapeSpec=>({...s('square',f*11),vertices:[[20,20],[89,30],[72,86],[14,70]]});
const wordOptions=(labels:string[])=>labels.map((label,i)=>({id:`o${i}`,label}));
function shapeTasks(f:number):GroundTask[]{
 let n=f;
 const choice=(prompt:string,labels:string[],visual?:GroundTask['visual']):GroundTask=>({mode:'choice',prompt,options:rotate(wordOptions(labels),n++),correctIds:['o0'],visual});
 const target=(['triangle','rectangle','square','triangle','rectangle'] as const)[f];
 const targets=[target,target==='triangle'?'circle':'triangle','oval'] as const;
 const round=f%2===0;
 const named=(['triangle','rectangle','square','triangle','square'] as const)[f];
 const object=(['flag','door','window','flag','crate'] as const)[f];
 const part=['cloth on the flag','front of the door','window frame','cloth on the flag','front of the crate'][f];
 const family=f%2===0?'triangle':'square';
 const oddFamily=(['triangle','square','circle','triangle','rectangle'] as const)[f];
 const odd=(['oval','triangle','triangle','square','oval'] as const)[f];
 const oddReason=['It has no corners. The others have straight sides and corners.','It has three sides. The others have four.','It has straight sides and corners. The others have no corners.','It has four sides. The others have three.','It has no corners. The others have straight sides and corners.'][f];
 return [
  {mode:'choice',prompt:`Which is a ${target}, even though it is turned?`,options:rotate(targets.map((x,i)=>({id:`o${i}`,shape:s(x,32+f*13+i*9)})),f),correctIds:['o0']},
  {mode:'multi',prompt:'Choose every shape that has four straight sides.',instruction:'Choose all that belong. Tap again to remove a choice.',options:rotate([s('square',15+f*9),s('circle'),irregular(f),s('triangle',40+f*7),s('rectangle',75-f*6),s('oval')].map((shape,i)=>({id:`o${i}`,shape})),f),correctIds:['o0','o2','o4']},
  choice('How are these two shapes different?',['The oval is longer in one direction. The circle is equally wide and tall.','The circle has corners. The oval has none.','The oval has straight sides. The circle has none.'],{kind:'shapes',shapes:rotate([s('circle',0,colours[f]),s('oval',f*23,colours[f])],f)}),
  choice('Why do these shapes belong together?',[round?'They all have no corners.':'They all have three straight sides.','They are all the same size.','They are all the same colour.'],{kind:'shapes',shapes:(round?['circle','oval','circle']:['triangle','triangle','triangle']).map((x,i)=>s(x as ShapeSpec['shape'],f*17+i*22,colours[(f+i)%5],.55+i*.17))}),
  {mode:'multi',prompt:`Choose every yellow ${family}.`,instruction:'Each chosen shape must have both features.',options:rotate([s(family,15,'#fbbf24'),s(family,45,'#67e8f9'),s('circle',0,'#fbbf24'),s(family,85,'#fbbf24'),s('oval',30,'#fbbf24'),s('rectangle',10,'#67e8f9')].map((shape,i)=>({id:`o${i}`,shape})),f+1),correctIds:['o0','o3']},
  choice(`Which description fits the ${part}?`,[named==='triangle'?'Three straight sides and three corners.':named==='square'?'Four equal straight sides and four square corners.':'Four straight sides, with two longer than the other two.',named==='triangle'?'Four equal sides and four corners.':'Three sides and three corners.','A curved edge with no corners.'],{kind:'object',object}),
  {mode:'choice',prompt:'Which shape does not belong with the others?',options:rotate([s(oddFamily,0),s(oddFamily,40),s(odd,f*19),s(oddFamily,95)].map((shape,i)=>({id:`o${i}`,shape})),f),correctIds:['o2'],reasons:rotate(wordOptions([oddReason,'It is the only purple shape.','It has the same number of sides as every other shape.']),f+1),correctReason:'o0'},
  {mode:'draw',prompt:`Make a triangle for ${['a sail','a pennant','a roof','a sign','a flag'][f]}.`,instruction:'Tap the dots to choose the corners in order. Choose Next when you have finished.',drawShape:'triangle'},
  {mode:'draw',prompt:`Make a ${f%2?'rectangle':'square'} for ${['a tile','a book cover','a window','a door','a picture frame'][f]}.`,instruction:'Tap the dots to choose the corners in order. Choose Next when you have finished.',drawShape:f%2?'rectangle':'square'},
  choice('What is the same about these shapes?',['Both have four straight sides and four corners.','Both have all four sides equal.','Both have curved edges.'],{kind:'shapes',shapes:rotate([s('rectangle',12+f*9,colours[f]),irregular(f)],f)}),
 ];
}
// Rotate or reflect the whole scene, including instructions, so every form has
// equivalent route demand without repeating the same map orientation.
function transformCell(p:Cell,f:number):Cell{
 if(f===4)return {r:p.r,c:3-p.c};
 let q={...p};for(let i=0;i<f;i++)q={r:q.c,c:3-q.r};return q;
}
function transformDirection(d:Direction,f:number):Direction{
 const order:Direction[]=['up','right','down','left'];
 if(f===4)return d==='left'?'right':d==='right'?'left':d;
 return order[(order.indexOf(d)+f)%4];
}
const arrows:Record<Direction,string>={up:'↑',right:'→',down:'↓',left:'←'};
function routeTasks(f:number):RouteTask[]{
 const goalObject=['star','flag','planet','satellite','moon'][f];
 const otherObject=['crystal','moon','flag','star','crystal'][f];
 const start={r:3,c:0};
 const common={start,goalObject,landmarks:[],blocked:[],instruction:'Each arrow moves one square. Up means towards the top of the map.'};
 const basic:RouteTask[]=[
  {...common,mode:'destination',prompt:'Follow the arrows. Where does the explorer finish?',given:['up','right'],example:['up','right']},
  {...common,start:{r:3,c:1},mode:'destination',prompt:'Follow these instructions in order. Tap the finishing square.',given:['up','right','up'],example:['up','right','up']},
  {...common,mode:'choice',prompt:'The explorer turns left. Which way are they facing now?',instruction:'Turn on the spot. Do not move to another square.',facing:'up',turn:'left',example:[],options:[],correctId:'o0'},
  {...common,mode:'record',prompt:'Give the directions for the purple route.',instruction:'Start at the explorer. Add one arrow for each square of the purple route, in order.',shown:['up','right','right','up'],example:['up','right','right','up'],goal:{r:1,c:2}},
  {...common,mode:'build',prompt:`Give directions from the explorer to the ${goalObject}.`,instruction:'Add one arrow for each move. More than one route can work.',goal:{r:1,c:2},example:['right','up','right','up']},
  {...common,mode:'choice',prompt:'Which instruction needs changing to follow the purple route?',instruction:'Compare the numbered instructions with the purple route, starting at the explorer.',shown:['up','right','up','right'],given:['up','left','up','right'],goal:{r:1,c:2},example:['up','right','up','right'],options:wordOptions(['Step 2','Step 1','Step 4']),correctId:'o0'},
  {...common,mode:'choice',prompt:`Which directions take the explorer to the ${goalObject}?`,goal:{r:1,c:1},example:['up','up','right'],options:[],correctId:'o0'},
  {...common,mode:'build',prompt:`Reach the ${goalObject} without crossing the rock.`,instruction:'Add your directions. Keep every move inside the map and away from the rock.',goal:{r:1,c:2},blocked:[{r:2,c:0}],example:['right','up','up','right']},
  {...common,mode:'build',prompt:`Visit the ${otherObject}, then reach the ${goalObject}.`,instruction:'Give a route that visits both places in that order.',goal:{r:0,c:3},checkpoint:{r:2,c:1},landmarks:[{cell:{r:2,c:1},object:otherObject}],example:['right','up','up','right','up','right']},
  {...common,mode:'build',prompt:`Visit the ${otherObject}, avoid the rock, then reach the ${goalObject}.`,instruction:'Give directions that meet both rules. More than one route can work.',goal:{r:0,c:3},checkpoint:{r:2,c:1},landmarks:[{cell:{r:2,c:1},object:otherObject}],blocked:[{r:2,c:0}],example:['right','up','right','up','right','up']},
 ];
 return basic.map((t,i)=>{
  const dir=(d:Direction)=>transformDirection(d,f),cell=(c:Cell)=>transformCell(c,f);
  const task:RouteTask={...t,start:cell(t.start),goal:t.goal?cell(t.goal):undefined,checkpoint:t.checkpoint?cell(t.checkpoint):undefined,landmarks:t.landmarks.map(l=>({...l,cell:cell(l.cell)})),blocked:t.blocked.map(cell),given:t.given?.map(dir),shown:t.shown?.map(dir),example:t.example.map(dir),facing:t.facing?dir(t.facing):undefined};
  if(i===2){const turn=f===4?'right':'left';task.turn=turn;task.prompt=`The explorer is facing ${task.facing}. They turn ${turn}. Which way are they facing now?`;task.options=wordOptions([dir('left'),dir('right'),dir('down')].map(d=>`${arrows[d]} ${d[0].toUpperCase()+d.slice(1)}`));}
  if(i===5){const wrongStep=[1,2,0,3,1][f];const opposite:Record<Direction,Direction>={up:'down',down:'up',left:'right',right:'left'};task.given=task.shown!.map((d,n)=>n===wrongStep?opposite[d]:d);task.options=wordOptions([wrongStep,...[0,1,2,3].filter(n=>n!==wrongStep).slice(0,2)].map(n=>`Step ${n+1}`));}
  if(i===6)task.options=wordOptions([['up','up','right'],['right','right','up'],['right','up','down']].map(ds=>(ds as Direction[]).map(dir).map(d=>`${arrows[d]} ${d}`).join(' · ')));
  if(task.options)task.options=rotate(task.options,(f+i)%3);
  return task;
 });
}
export const LEVEL1_STARPATH_FORMS=Object.fromEntries(GROUND_STARPATH_FORMS.map((form,f)=>[form,[...shapeTasks(f).map(task=>({kind:'shape' as const,task})),...routeTasks(f).map(task=>({kind:'route' as const,task}))].map((entry,i):Level1Item=>({
 ...entry,id:`y1-starpath-${form}-${String(i+1).padStart(2,'0')}-v5`,version:'5.0.0',form,prompt:entry.task.prompt,readAloudText:[entry.task.prompt,entry.task.instruction].filter(Boolean).join(' '),primaryDescriptorCode:i<10?'AC9M1SP01':'AC9M1SP02',skillLabel:LEVEL1_STARPATH_BLUEPRINT[i],difficulty:[0,2,5,10].includes(i)?'easy':[4,6,15,18,19].includes(i)?'challenging':'moderate',linkedWeeks:[i<3?1:i<5?2:i<7?4:i<10?5:i<15?6:i<18?7:8],
}))])) as Record<GroundStarpathForm,Level1Item[]>;
