import {GROUND_STARPATH_FORMS,type GroundStarpathForm} from './groundStarpathFiveForms';
import type {GroundTask,ShapeSpec} from './groundStarpathRedesignedForms';
import {L2_SHAPES,l2ShapeInner,type L2ShapeId} from '@/data/activities/starpath/level2/l2-shapes';
import {routeCells,type Cell,type Direction} from './level1StarpathFiveForms';
export type MapIcon='gate'|'book'|'building'|'tree'|'water'|'ball';
export type Landmark={id:string;label:string;icon:MapIcon;cell:Cell};
export type Level2MapTask={
 mode:'locate'|'choice'|'route';prompt:string;instruction:string;title:string;
 landmarks:Landmark[];start?:Cell;goal?:Cell;checkpoint?:Cell;blocked:Cell[];
 target?:Cell;given?:Direction[];shown?:Direction[];example?:Direction[];
 options?:{id:string;label:string}[];correctId?:string;keyOnly?:boolean;
};
export type EdgeTask={mode:'edge';prompt:string;instruction:string;vertices:[number,number][];reference:number;correct:number;property:'opposite'|'parallel'};
export type Level2Item={id:string;version:'5.0.0';form:GroundStarpathForm;prompt:string;readAloudText:string;primaryDescriptorCode:'AC9M2SP01'|'AC9M2SP02';skillLabel:string;difficulty:'easy'|'moderate'|'challenging';linkedWeeks:number[]}&({kind:'shape';task:GroundTask}|{kind:'edge';task:EdgeTask}|{kind:'map';task:Level2MapTask});
export const LEVEL2_STARPATH_BLUEPRINT=[
 'Classify curved and straight edges','Count sides after turning','Sort by a side count','Classify four-sided shapes',
 'Identify an opposite side','Identify a parallel side','Recognise a parallel pair','Compare shape properties',
 'Explain an odd shape','Classify by parallel sides','Read a map key','Describe relative map positions',
 'Use two map clues','Follow a map pathway','Find a new position','Record a pictured pathway',
 'Choose directions to a landmark','Correct a pathway instruction','Plan around a closed square','Visit a landmark and avoid a closure',
] as const;
export const rotate=<T,>(a:T[],n:number)=>[...a.slice(n%a.length),...a.slice(0,n%a.length)];
const options=(labels:string[],f:number)=>rotate(labels.map((label,i)=>({id:`o${i}`,label})),f);
// Reuse the exact Level 2 lesson geometry, without the lesson's shape-name labels.
export function shapeSpec(id:L2ShapeId,rotation=0,colour='#a78bfa',scale=.85):ShapeSpec{
 const base={shape:(['circle','oval','triangle','square','rectangle'].includes(id)?id:'square') as ShapeSpec['shape'],rotation,colour,scale};
 if(['pentagon','hexagon','trapezoid'].includes(id)){
  const points=l2ShapeInner(L2_SHAPES[id]).match(/points="([^"]+)"/)![1];
  return {...base,vertices:points.split(' ').map(p=>p.split(',').map(v=>Number(v)*100/48) as [number,number])};
 }
 return base;
}
const irregular=(f:number):ShapeSpec=>({...shapeSpec('square',f*13),vertices:[[15,15],[85,25],[65,88],[32,68]]});
const parallelogram=(f:number):ShapeSpec=>({...shapeSpec('square',f*13),vertices:[[30,18],[88,18],[70,80],[12,80]]});
const shapeOptions=(ss:ShapeSpec[],f:number)=>rotate(ss.map((shape,i)=>({id:`o${i}`,shape})),f);
function shapeTasks(f:number):(GroundTask|EdgeTask)[]{
 const n=([5,6,5,6,5] as const)[f],named=n===5?'pentagon':'hexagon';
 const shape=(id:L2ShapeId,offset=0)=>shapeSpec(id,17+f*23+offset);
 const four=[shape('square'),shape('triangle'),shape('trapezoid'),shape('circle'),irregular(f),shape('hexagon')];
 const family=f%2?'triangle':'rectangle',odd=f%2?'pentagon':'triangle';
 const groupReason=f%2?'It has five sides. The others have three.':'It has three sides. The others have four.';
 const visual=(shapes:ShapeSpec[])=>({kind:'shapes' as const,shapes});
 const words=(prompt:string,labels:string[],shapes:ShapeSpec[],shift:number):GroundTask=>({mode:'choice',prompt,options:options(labels,f+shift),correctIds:['o0'],visual:visual(shapes)});
 const edge=(property:'opposite'|'parallel'):EdgeTask=>{
  const points:[number,number][]=property==='opposite'?[[65,55],[235,55],[235,190],[65,190]]:[[98,55],[202,55],[242,190],[58,190]];
  const angle=(f*37+(property==='parallel'?12:0))*Math.PI/180;
  const vertices=points.map(([x,y])=>[150+(x-150)*Math.cos(angle)-(y-125)*Math.sin(angle),150+(x-150)*Math.sin(angle)+(y-125)*Math.cos(angle)] as [number,number]);
  const reference=property==='parallel'?(f%2?2:0):f%4;
  return {mode:'edge',property,prompt:`Tap the side ${property} to the highlighted side.`,instruction:`The highlighted side is side ${'ABCD'[reference]}. Choose one of the other sides.`,vertices,reference,correct:(reference+2)%4};
 };
 return [
  {mode:'multi',prompt:'Choose every shape with a curved edge.',instruction:'Choose all that belong. Tap again to remove a choice.',options:shapeOptions([shape('circle'),shape('triangle'),shape('oval'),shape('rectangle'),shape('pentagon'),shape('hexagon')],f),correctIds:['o0','o2']},
  words('How many straight sides does this shape have?',[`${n}`,`${n-1}`,`${n+1}`],[shape(named)],1),
  {mode:'multi',prompt:`Choose every shape with ${n} straight sides.`,instruction:'The shapes can be different sizes or turned.',options:shapeOptions([shape(named),shape(n===5?'hexagon':'pentagon'),shapeSpec(named,85+f*19,'#67e8f9',.65),shape('triangle'),shape('rectangle'),shapeSpec(named,135-f*11,'#fbbf24')],f+2),correctIds:['o0','o2','o5']},
  {mode:'multi',prompt:'Choose every four-sided shape.',instruction:'Count the straight sides, even when the shape looks unusual.',options:shapeOptions(four,f+1),correctIds:['o0','o2','o4']},
  edge('opposite'),edge('parallel'),
  {mode:'choice',prompt:'Which shape has exactly one pair of parallel sides?',options:shapeOptions([shape('trapezoid'),shape('rectangle'),shape('triangle')],f+2),correctIds:['o0']},
  words('What is true about both shapes?',['Both have four straight sides.','Both have all four sides equal.','Both have a curved edge.'],[shape('rectangle'),irregular(f)],2),
  {mode:'choice',prompt:'Which shape does not belong with the others?',options:shapeOptions([shape(family),shape(family,40),shape(odd,75),shape(family,110)],f),correctIds:['o2'],reasons:options([groupReason,'It is the only purple shape.','It has the same number of sides as the others.'],f+1),correctReason:'o0'},
  {mode:'multi',prompt:'Choose every shape with two pairs of parallel sides.',instruction:'Choose all that belong, then choose a reason.',options:shapeOptions([shape('square'),shape('triangle'),parallelogram(f),shape('trapezoid'),shape('rectangle'),shape('hexagon')],f+2),correctIds:['o0','o2','o4'],reasons:options(['Both pairs of opposite sides stay the same distance apart.','Every chosen shape has five sides.','Their colours make their sides parallel.'],f),correctReason:'o0'},
 ];
}
const scenes=[
 {title:'School grounds',labels:['Gate','Library','Classroom','Garden','Pool','Court']},
 {title:'Riverside park',labels:['Entrance','Reading hut','Shelter','Trees','Pond','Play area']},
 {title:'Campground',labels:['Flagpole','Notice hut','Cabin','Woods','Lake','Games area']},
 {title:'Sports centre',labels:['Entry','Club library','Clubhouse','Garden','Pool','Ball court']},
 {title:'Community park',labels:['Gate','Book swap','Picnic shelter','Trees','Fountain','Playground']},
];
const icons:MapIcon[]=['gate','book','building','tree','water','ball'];
export function transformCell(p:Cell,f:number):Cell{if(f===4)return {r:p.r,c:3-p.c};let q={...p};for(let i=0;i<f;i++)q={r:q.c,c:3-q.r};return q;}
export function transformDirection(d:Direction,f:number):Direction{if(f===4)return d==='left'?'right':d==='right'?'left':d;const order:Direction[]=['up','right','down','left'];return order[(order.indexOf(d)+f)%4];}
export const ARROWS:Record<Direction,string>={up:'↑',right:'→',down:'↓',left:'←'};
export const directionsText=(ds:Direction[])=>ds.map(d=>`${ARROWS[d]} ${d}`).join(' · ');
function mapTasks(f:number):Level2MapTask[]{
 const scene=scenes[f],cell=(p:Cell)=>transformCell(p,f),dir=(d:Direction)=>transformDirection(d,f),moves=(ds:Direction[])=>ds.map(dir);
 const positions=[{r:3,c:0},{r:0,c:0},{r:0,c:3},{r:1,c:1},{r:3,c:3},{r:2,c:2}];
 const landmarks=positions.map((p,i)=>({id:`l${i}`,label:scene.labels[i],icon:icons[i],cell:cell(p)}));
 const common={title:scene.title,landmarks,blocked:[],instruction:'This map is a view from above. Up means towards the top of the map.'};
 const relation=dir('right'),relative=relation==='up'?'above':relation==='down'?'below':`to the ${relation} of`;
 const targetLabel=scene.labels[2],refLabel=scene.labels[1];
 const twoClues=dir('down'),otherClue=dir('left');
 const phrase=(d:Direction)=>d==='up'?'above':d==='down'?'below':`to the ${d} of`;
 const fourMoves=moves(['up','right','right','up']);
 const shown=moves(['up','up','right','right','right','up']);
 const wrongStep=[1,3,0,4,2][f],opposite:Record<Direction,Direction>={up:'down',down:'up',left:'right',right:'left'};
 const goal=cell(positions[2]),start=cell(positions[0]),checkpoint=cell(positions[3]);
 return [
  {...common,mode:'locate',prompt:`Use the map key. Tap ${scene.labels[(f+1)%6]}.`,instruction:'Match the map symbol to the place in the key.',keyOnly:true,target:landmarks[(f+1)%6].cell},
  {...common,mode:'choice',prompt:`Where is ${targetLabel} compared with ${refLabel}?`,options:options([`${relative[0].toUpperCase()+relative.slice(1)} ${refLabel}`,`${phrase(dir('left'))} ${refLabel}`,`${phrase(dir('down'))} ${refLabel}`],f),correctId:'o0'},
  {...common,mode:'locate',prompt:`Tap the place directly ${phrase(twoClues)} ${scene.labels[1]} and directly ${phrase(otherClue)} ${scene.labels[4]}.`,target:start},
  {...common,mode:'locate',prompt:'Follow the arrows from Start. Tap the finishing square.',instruction:'Each arrow moves one square. Follow them in order.',start,given:fourMoves,target:routeCells(start,fourMoves).at(-1)},
  {...common,mode:'locate',prompt:`Start at ${scene.labels[3]}. Move two squares ${dir('right')}, then one square ${dir('down')}. Tap your new position.`,instruction:'Use the map to follow both parts of the instruction.',target:cell({r:2,c:3})},
  {...common,mode:'route',prompt:`Give the directions along the purple pathway to ${scene.labels[2]}.`,instruction:'Start at the square marked Start. Add one arrow for each square, in order.',start,goal,shown,example:shown},
  {...common,mode:'choice',prompt:`Which directions take you from ${scene.labels[0]} to ${scene.labels[3]}?`,start,options:options([moves(['up','up','right']),moves(['right','right','up']),moves(['up','right','down'])].map(directionsText),f+1),correctId:'o0',goal:checkpoint},
  {...common,mode:'choice',prompt:'Which step needs changing to follow the purple pathway?',instruction:'Compare the numbered directions with the pathway from Start.',start,goal,shown,given:shown.map((d,i)=>i===wrongStep?opposite[d]:d),options:options([wrongStep,...[0,1,2,3,4,5].filter(n=>n!==wrongStep).slice(0,2)].map(n=>`Step ${n+1}`),f+2),correctId:'o0'},
  {...common,mode:'route',prompt:`Give a route from ${scene.labels[0]} to ${scene.labels[2]}, avoiding the closed square.`,instruction:'Add arrows for your route. Stay inside the map. You may pass through open landmark squares.',start,goal,blocked:[cell({r:2,c:0})],example:moves(['right','up','up','right','right','up'])},
  {...common,mode:'route',prompt:`Visit ${scene.labels[3]}, then reach ${scene.labels[2]}. Avoid the closed square.`,instruction:`Start at ${scene.labels[0]}. More than one route can work.`,start,goal,checkpoint,blocked:[cell({r:2,c:0})],example:moves(['right','up','up','right','right','up'])},
 ];
}
export const LEVEL2_STARPATH_FORMS=Object.fromEntries(GROUND_STARPATH_FORMS.map((form,f)=>[form,[...shapeTasks(f).map(task=>task.mode==='edge'?{kind:'edge' as const,task}:{kind:'shape' as const,task}),...mapTasks(f).map(task=>({kind:'map' as const,task}))].map((entry,i):Level2Item=>({...entry,id:`y2-starpath-${form}-${String(i+1).padStart(2,'0')}-v5`,version:'5.0.0',form,prompt:entry.task.prompt,readAloudText:[entry.task.prompt,entry.task.instruction].filter(Boolean).join(' '),primaryDescriptorCode:i<10?'AC9M2SP01':'AC9M2SP02',skillLabel:LEVEL2_STARPATH_BLUEPRINT[i],difficulty:[0,1,10,11].includes(i)?'easy':[8,9,12,17,19].includes(i)?'challenging':'moderate',linkedWeeks:[i<1?1:i<4?2:i<7?3:i<10?4:i<12?5:i<15?6:i<19?7:8]}))])) as Record<GroundStarpathForm,Level2Item[]>;
