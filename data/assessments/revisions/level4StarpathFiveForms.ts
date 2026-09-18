import {GROUND_STARPATH_FORMS,type GroundStarpathForm} from './groundStarpathFiveForms';
import {rotate,transformCell,transformDirection,type Landmark} from './level2StarpathFiveForms';
import {LEVEL2_STARPATH_FORMS} from './level2StarpathFiveForms';
import {routeCells,type Cell,type Direction} from './level1StarpathFiveForms';
import {L4_FIGURES,type CompositeFigure,type FigureShape} from '@/data/activities/starpath/level4/composite-figures';
import {L4_OBJECTS} from '@/data/activities/starpath/level4/composite-objects';
import {gridReferenceForCell} from '@/lib/starpath-grid-reference';
export type Option={id:string;label:string};
export type CompositeTask={mode:'choice'|'multi'|'blocks';prompt:string;instruction:string;figure?:CompositeFigure;hiddenPart?:string;options?:Option[];correctIds?:string[];reasons?:Option[];correctReason?:string;model?:{cols:number;rows:number;heights:number[];name:string}};
export type GridTask={mode:'reference'|'locate'|'place'|'labels'|'route'|'choice';prompt:string;instruction:string;landmarks:Landmark[];title:string;rows:4;cols:4;columnLabels:string[];rowLabels:string[];target?:Cell;start?:Cell;goal?:Cell;checkpoint?:Cell;blocked:Cell[];given?:Direction[];example?:Direction[];placements?:Record<string,Cell>;options?:Option[];correctId?:string};
export type SymCell=Cell&{colour:string};
export type SymTask={mode:'choice'|'complete'|'create';prompt:string;instruction:string;size:5;line?:'vertical'|'horizontal'|'diagonal';turn?:90|180;seeds:SymCell[];expected:SymCell[];options?:Option[];correctId?:string;minCells?:number};
export type Level4Item={id:string;version:'5.0.0';form:GroundStarpathForm;prompt:string;readAloudText:string;primaryDescriptorCode:'AC9M4SP01'|'AC9M4SP02'|'AC9M4SP03';skillLabel:string;difficulty:'easy'|'moderate'|'challenging';linkedWeeks:number[]}&({kind:'composite';task:CompositeTask}|{kind:'grid';task:GridTask}|{kind:'symmetry';task:SymTask});
export const LEVEL4_STARPATH_BLUEPRINT=['Identify component shapes','Count shapes in a composite picture','Choose a missing component','Build a cube approximation','Identify solids in a model','Compare ways to represent a figure','Explain an approximation','Read a landmark’s grid reference','Locate a given reference','Create a referenced map','Label a grid reference system','Follow directions between references','Write a route via a reference','Interpret a route log','Test line symmetry','Complete a reflection','Complete a diagonal reflection','Test rotational symmetry','Complete a turning pattern','Create a symmetrical design'] as const;
const options=(labels:string[],f:number)=>rotate(labels.map((label,i)=>({id:`o${i}`,label})),f);
export const shapeName=(shape:FigureShape)=>({prism:'rectangular prism',cube:'cube',sphere:'sphere',cylinder:'cylinder',cone:'cone',triangle:'triangle',square:'square',rectangle:'rectangle',circle:'circle'}[shape]);
function composites(f:number):CompositeTask[]{
 const figure=L4_FIGURES.find(x=>x.id===['rocket','sailboat','tree','car','butterfly'][f])!;
 const counted=L4_FIGURES.find(x=>x.id===['rocket','sailboat','tree','butterfly','person'][f])!;
 const shapes=[...new Set(figure.parts.map(p=>p.shape))];const count=counted.parts.filter(p=>p.shape==='triangle').length;
 const part=figure.parts.find(p=>p.id===['window','sail','trunk','wheel-left','body'][f])!;
 const object=L4_OBJECTS.find(x=>x.id===['crane','satellite','lander','robotArm','drill'][f])!;
 const solidSet=[...new Set(object.parts.map(p=>p.shape))];
 const models=[{cols:3,rows:1,heights:[1,2,3],name:'three steps'},{cols:3,rows:2,heights:[2,2,2,1,1,1],name:'a bench with a high back'},{cols:3,rows:1,heights:[3,2,1],name:'three steps'},{cols:2,rows:2,heights:[3,3,1,1],name:'a chair with a high back'},{cols:3,rows:2,heights:[3,2,1,3,2,1],name:'wide steps'}];
 const approximation=[
  ['The body is a rectangle and the fins and nose are triangles.','Every part is a circle.','The rocket can only be drawn with one shape.'],
  ['The hull is a rectangle and the sail is a triangle.','The sail is a circle and the hull is a triangle.','No familiar shapes can represent a boat.'],
  ['Triangles represent the leaves and a rectangle represents the trunk.','A circle represents the trunk in this picture.','Every part must be exactly the same shape.'],
  ['Rectangles represent the body and cabin; circles represent the wheels.','Triangles are the only shapes needed to match these wheels.','Only the colour matters when representing the car.'],
  ['Triangles represent the wings and a rectangle represents the body.','All the wings are circles.','An approximation must show every tiny detail.'],
 ][f];
 return [
  {mode:'multi',prompt:`Which shape types make up this ${figure.name.toLowerCase()}?`,instruction:'Choose every type used in the coloured pieces. Ignore outline thickness.',figure,options:options(['triangle','rectangle','circle','square'],f),correctIds:shapes.map(s=>`o${['triangle','rectangle','circle','square'].indexOf(s)}`)},
  {mode:'choice',prompt:`How many triangular pieces are used in this ${counted.name.toLowerCase()}?`,instruction:'Count the coloured pieces, including a piece partly covered by another.',figure:counted,options:options([`${count}`,`${count+1}`,`${Math.max(0,count-1)}`],f+1),correctIds:['o0']},
  {mode:'choice',prompt:`Which shape completes the ${part.label.toLowerCase()}?`,instruction:'Look at the dashed outline of the missing piece.',figure,hiddenPart:part.id,options:options([shapeName(part.shape),...(['triangle','rectangle','circle'] as FigureShape[]).filter(s=>s!==part.shape).slice(0,2).map(shapeName)],f+2),correctIds:['o0']},
  {mode:'blocks',prompt:`Use cubes to copy this model of ${models[f].name}.`,instruction:'Use the numbered base squares. Add or remove cubes until your model matches. The model has no gaps inside its columns.',model:models[f]},
  {mode:'multi',prompt:`Which familiar solids are combined in this model ${object.name.toLowerCase()}?`,instruction:'Choose every type of solid used. Count each type once.',figure:object,options:options(['cube','cylinder','cone','sphere','rectangular prism'],f+1),correctIds:solidSet.map(s=>`o${['cube','cylinder','cone','sphere','prism'].indexOf(s)}`)},
  {mode:'choice',prompt:`Which description matches this ${figure.name.toLowerCase()} approximation?`,instruction:'Think about how the familiar shapes represent the parts.',figure,options:options(approximation,f+2),correctIds:['o0']},
  {mode:'choice',prompt:'Why is this a useful simplified model?',instruction:'Choose the explanation that connects its shapes to the real object.',figure,options:options(['It keeps the main parts and their arrangement using familiar shapes.','It must include every detail to be useful.','Its colour alone tells us whether the parts fit.'],f),correctIds:['o0']},
 ];
}
export const gridRef=(t:Pick<GridTask,'rows'|'cols'|'rowLabels'|'columnLabels'>,cell:Cell)=>gridReferenceForCell(t,cell)!;
function grids(f:number):GridTask[]{
 const scene=LEVEL2_STARPATH_FORMS[GROUND_STARPATH_FORMS[f]].find(x=>x.kind==='map')!;if(scene.kind!=='map')throw Error('Map missing');
 const common={rows:4 as const,cols:4 as const,columnLabels:['A','B','C','D'],rowLabels:['4','3','2','1'],title:scene.task.title,landmarks:scene.task.landmarks,blocked:[],instruction:'References name a square: column letter first, then row number. Read the labels on this map.'};
 const cell=(c:Cell)=>transformCell(c,f),moves=(ds:Direction[])=>ds.map(d=>transformDirection(d,f));const ref=(c:Cell)=>gridRef(common,c);
 const target=common.landmarks[(f+1)%6],start=cell({r:3,c:0}),goal=cell({r:0,c:3}),checkpoint=cell({r:1,c:1}),route=moves(['right','up','up','right','right','up']),given=moves(['up','right','right','up']);
 const final=routeCells(start,given).at(-1)!;const places=common.landmarks.slice(0,3),placements=Object.fromEntries(places.map(l=>[l.id,l.cell]));
 return [
  {...common,mode:'reference',prompt:`What is the grid reference for ${target.label}?`,target:target.cell},
  {...common,mode:'locate',prompt:`Tap the square ${ref(cell({r:2,c:1}))}.`,target:cell({r:2,c:1})},
  {...common,mode:'place',prompt:'Create the map using these grid references.',instruction:places.map(l=>`${l.label}: ${ref(l.cell)}.`).join(' ')+' Choose a place, then tap its square.',landmarks:places,placements},
  {...common,mode:'labels',prompt:'Finish labelling this grid reference system.',instruction:'Columns go A to D from left to right. Rows go 1 to 4 from bottom to top. Enter each missing label.'},
  {...common,mode:'reference',prompt:`Start at ${ref(start)}. Follow the arrows. What is the finishing reference?`,instruction:'Each arrow moves one square. Follow them in order.',start,given,target:final},
  {...common,mode:'route',prompt:`Write a route from ${ref(start)} via ${ref(checkpoint)} to ${ref(goal)}.`,instruction:'Avoid the closed square. Add one arrow per square. Visit the checkpoint before finishing.',start,goal,checkpoint,blocked:[cell({r:2,c:0})],example:route},
  {...common,mode:'choice',prompt:`Which route log takes you from ${ref(start)} to ${ref(checkpoint)}?`,instruction:'Each reference in a route log must be in the next neighbouring square. Follow the logs on the map.',start,goal:checkpoint,options:options([moves(['up','up','right']),moves(['right','right','up']),moves(['up','right','down'])].map(ds=>routeCells(start,ds).map(ref).join(' → ')),f),correctId:'o0'},
 ];
}
export const symKey=(c:Cell)=>`${c.r},${c.c}`;
export function symTransform(t:Pick<SymTask,'line'|'turn'>,c:Cell):Cell{if(t.line==='vertical')return {r:c.r,c:4-c.c};if(t.line==='horizontal')return {r:4-c.r,c:c.c};if(t.line==='diagonal')return {r:c.c,c:c.r};return t.turn===90?{r:c.c,c:4-c.r}:{r:4-c.r,c:4-c.c};}
export function symClosure(t:Pick<SymTask,'line'|'turn'>,seeds:SymCell[]){const cells=new Map(seeds.map(c=>[symKey(c),c]));for(let n=0;n<4;n++)for(const c of [...cells.values()]){const p={...symTransform(t,c),colour:c.colour};cells.set(symKey(p),p);}return [...cells.values()];}
function symmetry(f:number):SymTask[]{
 const colour=['#7c3aed','#0891b2','#c2410c','#2563eb','#9333ea'][f],second=['#c2410c','#7c3aed','#0891b2','#9333ea','#2563eb'][f];
 const line:NonNullable<SymTask['line']>=f%2?'horizontal':'vertical';
 const seeds=[{r:0,c:1,colour},{r:1,c:0,colour:second}];const spec={line},full=symClosure(spec,seeds),valid=f%2===0;
 const reflection={line:line as SymTask['line']};const reflectSeeds=line==='vertical'?[{r:f%4,c:0,colour},{r:(f+2)%5,c:1,colour:second}]:[{r:0,c:f%4,colour},{r:1,c:(f+2)%5,colour:second}];
 const diagonalSeeds=[{r:0,c:2+f%3,colour},{r:1,c:3+f%2,colour:second}];
 const turn=f%2?90:180,turnSeeds=[{r:0,c:1+f%2,colour},{r:1,c:1,colour:second}],turnSpec={turn:turn as 90|180},turned=symClosure(turnSpec,turnSeeds),turnValid=f%2!==0;
 const common={size:5 as const,instruction:'Colours are part of the pattern. Every tile must match its reflected or turned partner.'};
 return [
  {...common,mode:'choice',prompt:'Does this pattern have symmetry across the dashed line?',line,seeds:valid?full:full.slice(0,-1),expected:full,options:options(['Yes, every tile and colour matches.','No, at least one matching tile is missing.'],f),correctId:valid?'o0':'o1'},
  {...common,mode:'complete',prompt:'Complete the reflection across the dashed line.',instruction:'Keep the given tiles. Choose a colour, then tap empty squares. Tap a tile you added again to remove it.',...reflection,seeds:reflectSeeds,expected:symClosure(reflection,reflectSeeds)},
  {...common,mode:'complete',prompt:'Complete the reflection across the diagonal line.',instruction:'Match each given tile on the other side of the line. Colours must match too.',line:'diagonal',seeds:diagonalSeeds,expected:symClosure({line:'diagonal'},diagonalSeeds)},
  {...common,mode:'choice',prompt:`Does this design match after a ${turn===90?'quarter':'half'} turn about the centre?`,turn,seeds:turnValid?turned:turned.slice(0,-1),expected:turned,options:options(['Yes, every tile and colour matches.','No, a tile does not match after the turn.'],f+1),correctId:turnValid?'o0':'o1'},
  {...common,mode:'complete',prompt:`Complete a pattern with ${turn===90?'quarter':'half'}-turn symmetry.`,instruction:'Keep the given tiles. Add all the matching tiles around the marked centre. Colours must match.',turn,seeds:turnSeeds,expected:turned},
  {...common,mode:'create',prompt:`Create your own design with ${f%2?'half-turn':'vertical line'} symmetry.`,instruction:'Use at least 6 coloured squares. Use both colours. Keep the symmetry shown; many designs can work.',...(f%2?{turn:180 as const}:{line:'vertical' as const}),seeds:[],expected:symClosure(f%2?{turn:180}:{line:'vertical'},[{r:0,c:0,colour},{r:0,c:1,colour:second},{r:1,c:0,colour}]),minCells:6},
 ];
}
export const LEVEL4_STARPATH_FORMS=Object.fromEntries(GROUND_STARPATH_FORMS.map((form,f)=>[form,[...composites(f).map(task=>({kind:'composite' as const,task})),...grids(f).map(task=>({kind:'grid' as const,task})),...symmetry(f).map(task=>({kind:'symmetry' as const,task}))].map((entry,i)=>({...entry,id:`y4-starpath-${form}-${String(i+1).padStart(2,'0')}-v5`,version:'5.0.0',form,prompt:entry.task.prompt,readAloudText:`${entry.task.prompt} ${entry.task.instruction}`,primaryDescriptorCode:i<7?'AC9M4SP01':i<14?'AC9M4SP02':'AC9M4SP03',skillLabel:LEVEL4_STARPATH_BLUEPRINT[i],difficulty:[0,1,7,8,14].includes(i)?'easy':[3,9,12,16,18,19].includes(i)?'challenging':'moderate',linkedWeeks:[i<3?1:i<5?2:i<7?3:i<11?4:i<14?5:i<17?6:i<19?7:8]}))])) as Record<GroundStarpathForm,Level4Item[]>;
