import {GROUND_STARPATH_FORMS,type GroundStarpathForm} from './groundStarpathFiveForms';
import {rotate as order} from './level2StarpathFiveForms';
import {HEXOMINOES,VALID_NET_IDS,INVALID_NET_IDS,normalise,foldNet,relationBetween,type Cell} from '@/data/activities/starpath/level5/nets';
import {translate,reflect,rotate,type Shape,type MirrorLine} from '@/data/activities/starpath/level5/transforms';
import type {Point,MoveDir} from '@/data/activities/starpath/level5/coordinates';
import type {SolidKind} from '@/data/activities/starpath/level5/solids';
export type Option={id:string;label:string;cells?:Cell[]};
export type NetTask={mode:'choice'|'complete'|'build';foldRequired?:boolean;prompt:string;instruction:string;cells?:Cell[];solid?:SolidKind;secondSolid?:SolidKind;angle?:number;options?:Option[];correctId?:string;marked?:number;seeds?:Cell[];example?:Cell[]};
export type PlotTask={plainDiagram?:boolean;mode:'choice'|'point'|'pair'|'axes'|'route'|'shape';prompt:string;instruction:string;points?:{label:string;point:Point}[];shape?:Shape;image?:Shape;answer?:Point;expected?:Shape;options?:Option[];correctId?:string;start?:Point;goal?:Point;via?:Point;blocked?:Point[];example?:MoveDir[];maxMoves?:number;mirror?:MirrorLine;centre?:Point;dx?:number;dy?:number;operation?:'translate'|'reflect'|'rotate'|'combine';axisValues?:number[]};
export type Level5Item={id:string;version:'5.0.0';form:GroundStarpathForm;prompt:string;readAloudText:string;primaryDescriptorCode:'AC9M5SP01'|'AC9M5SP02'|'AC9M5SP03';skillLabel:string;difficulty:'easy'|'moderate'|'challenging';linkedWeeks:number[]}&({kind:'net';task:NetTask}|{kind:'plot';task:PlotTask});
export const LEVEL5_STARPATH_BLUEPRINT=['Connect a solid to its net','Choose a working cube net','Track opposite faces','Explain why a net fails','Complete and fold a cube net','Construct a cube net','Compare prism and pyramid nets','Read a coordinate point','Plot an ordered pair','Construct numbered axes','Correct reversed coordinates','Follow directional movements','Plan a coordinate route','Translate a whole shape','Describe a translation','Reflect a whole shape','Rotate a whole shape','Explain what transformations preserve','Identify a shape’s symmetry','Combine two transformations'] as const;
const opts=(labels:string[],f:number):Option[]=>order(labels.map((label,i)=>({id:`o${i}`,label})),f);
export const pointLabel=(p:Point)=>`(${p.x}, ${p.y})`;
export const cellKey=(p:Cell)=>`${p.r},${p.c}`;
export const pointKey=(p:Point)=>`${p.x},${p.y}`;
function orient(cells:Cell[],f:number){let out=cells;for(let n=0;n<f%4;n++)out=out.map(p=>({r:p.c,c:-p.r}));return normalise(out);}
function nets(f:number):NetTask[]{
 const valid=orient(HEXOMINOES[VALID_NET_IDS[f%VALID_NET_IDS.length]],f);
 const invalid=orient(HEXOMINOES[INVALID_NET_IDS[f%INVALID_NET_IDS.length]],f);
 const marked=f%6,fold=foldNet(valid),opposite=valid.findIndex(p=>relationBetween(fold,valid[marked],p)==='opposite');
 const netOptions=order([valid,invalid,orient(HEXOMINOES.ell,f+1)].map((cells,i)=>({id:`o${i}`,label:`Net ${String.fromCharCode(65+i)}`,cells})),f);
 const example=valid.map(p=>({r:p.r,c:p.c}));const missing=(f+2)%6;
 const solid:SolidKind=(['triPrism','pyramid','cuboid','triPrism','pyramid'] as const)[f];
 const name={triPrism:'Triangular prism',pyramid:'Square-based pyramid',cuboid:'Rectangular prism',cube:'Cube'};
 const first=f%2?'pyramid':'triPrism',second=f%2?'triPrism':'pyramid';
 return [
  {mode:'choice',prompt:'Which object can be folded from this net?',instruction:'Imagine joining the outside edges. Ignore glue tabs.',solid,angle:f*90,options:opts([name[solid],...(['triPrism','pyramid','cuboid'] as const).filter(k=>k!==solid).map(k=>name[k])],f),correctId:'o0'},
  {mode:'choice',prompt:'Which net folds into a cube without overlapping faces?',instruction:'Each diagram has six equal squares. Think about where each square lands.',options:netOptions,correctId:'o0'},
  {mode:'choice',prompt:`Which face will be opposite face ${String.fromCharCode(65+marked)} when this net folds?`,instruction:'Opposite faces do not share an edge on the cube.',cells:valid,marked,options:order(valid.map((_,i)=>({id:`o${i}`,label:`Face ${String.fromCharCode(65+i)}`})).filter(o=>o.id!==`o${marked}`),f),correctId:`o${opposite}`},
  {mode:'choice',prompt:'Why can this arrangement not make a closed cube?',instruction:'All six squares are the same size. Imagine folding along their shared edges.',cells:invalid,options:opts(['Some faces would overlap, leaving part of the cube uncovered.','A cube needs eight square faces, so two squares are missing.','The squares must be different sizes to meet when folded.'],f+1),correctId:'o0'},
  {mode:'complete',foldRequired:true,prompt:'Complete the net, then fold it into a cube.',instruction:'Keep the five given faces. Add one square, then choose Fold my net. Inspect the result. You may unfold and revise it before moving on.',seeds:example.filter((_,i)=>i!==missing),example},
  {mode:'build',prompt:'Design a different cube net using six squares.',instruction:'Include the marked square. Join faces along full edges. Choose six squares that fold into a cube. Your net must differ from the example shown, even after turning or flipping.',cells:example,seeds:[{r:1+f%3,c:2}],example:[]},
  {mode:'choice',prompt:'Which statement correctly compares nets A and B?',instruction:'Compare the shapes and number of faces in each net.',solid:first,secondSolid:second,angle:f*90,options:opts([`Both have five faces. Net ${f%2?'B':'A'} has two triangles and three rectangles; net ${f%2?'A':'B'} has four triangles and one square.`,`Both have five faces, so they fold into the same object.`,`Net ${f%2?'B':'A'} has three triangles and two rectangles; net ${f%2?'A':'B'} has one triangle and four squares.`],f),correctId:'o0'},
 ];
}
const gridInstruction='Coordinates name points where lines cross. The first number is horizontal; the second is vertical.';
function plots(f:number):PlotTask[]{
 const p={x:1+f,y:6-f},target={x:6-f,y:2+f%3};
 const start={x:1,y:1+f%3},via={x:3,y:3+f%3},goal={x:6,y:5+f%2};
 const commands:MoveDir[]=['right','right','up','up',...Array<MoveDir>(goal.x-via.x).fill('right'),...Array<MoveDir>(goal.y-via.y).fill('up')];
 const shift=f%2?{dx:-2,dy:3}:{dx:3,dy:-2},moving={x:f%2?5:1+f%3,y:f%2?1+Math.floor(f/2):5};
 const shape:Shape=[{x:1,y:1},{x:3,y:1},{x:4,y:2},{x:2,y:2}].map(p=>({x:p.x,y:p.y+f%3}));
 const dx=2,dy=2;const image=translate(shape,dx,dy);
 const triangle:Shape=[{x:1,y:1+f%3},{x:3,y:1+f%3},{x:1,y:2+f%3}];
 const mirror:MirrorLine={axis:f%2?'horizontal':'vertical',at:4};
 const turnShape:Shape=[{x:4,y:5},{x:4,y:7},{x:5+Math.floor(f/2),y:5}].map(p=>f%2?{x:8-p.x,y:8-p.y}:p);
 const centre={x:4,y:4},turned=rotate(turnShape,centre,90);
 const symmetricShape:Shape=([[[2,2],[6,2],[5,6],[2,6]],[[2,2],[6,2],[6,6],[2,6]],[[2,2],[5,2],[6,6],[3,6]],[[2,2],[6,2],[4,6]],[[3,1],[5,1],[5,7],[3,7]]][f]).map(([x,y])=>({x,y}));
 const combinedSource:Shape=[{x:1,y:1+f%3},{x:2,y:1+f%3},{x:1,y:3+f%3}];
 return [
  {mode:'pair',prompt:'What are the coordinates of point P?',instruction:gridInstruction,points:[{label:'P',point:p}],answer:p},
  {mode:'point',prompt:`Plot point Q at ${pointLabel(target)}.`,instruction:gridInstruction,answer:target},
  {mode:'axes',prompt:'Finish numbering the coordinate axes.',instruction:'The axes run from 0 to 8. Every small grid interval is one unit. Fill in the missing labels on both axes.',axisValues:[0,1+f%3,4,6,8]},
  {mode:'choice',prompt:`A student writes P as ${pointLabel({x:p.y,y:p.x})}. Which correction explains the mistake?`,instruction:'Use the plotted point as evidence.',points:[{label:'P',point:p}],options:opts([`${pointLabel(p)}: read the horizontal number first, then the vertical number.`,`${pointLabel({x:p.y,y:p.x})}: read the vertical number first.`,`${pointLabel({x:p.x+1,y:p.y+1})}: count the starting line as one.`],f),correctId:'o0'},
  {mode:'pair',prompt:`Start at ${pointLabel(moving)}. Move ${Math.abs(shift.dx)} units ${shift.dx>0?'right':'left'}, then ${Math.abs(shift.dy)} units ${shift.dy>0?'up':'down'}. Where do you finish?`,instruction:'Give the final coordinates. Each move follows the grid lines.',points:[{label:'Start',point:moving}],answer:{x:moving.x+shift.dx,y:moving.y+shift.dy}},
  {mode:'route',prompt:`Plan a route from ${pointLabel(start)} through ${pointLabel(via)} to ${pointLabel(goal)}.`,instruction:`Use exactly ${commands.length} one-unit moves. Avoid the blocked point. Visit the checkpoint before reaching the finish.`,start,via,goal,blocked:[{x:2,y:start.y+1}],example:commands,maxMoves:commands.length},
  {mode:'shape',prompt:'Translate the whole shape 2 units right and 2 units up.',instruction:'Tap every vertex of the image. Tap a selected point again to remove it. The original shape stays visible.',shape,expected:image,operation:'translate',dx,dy},
  {mode:'choice',plainDiagram:true,prompt:'Which description explains the move from A to B?',instruction:'Compare the position, size and facing of the two shapes.',shape,image,options:opts(['A slides up and right, keeping its size and facing.','A flips over a mirror line, reversing its facing.','A grows larger as it moves up and right.'],f),correctId:'o0'},
  {mode:'shape',prompt:'Reflect the whole triangle across the dashed line.',instruction:'Tap the three vertices of its reflected image. Each vertex must be the same distance from the line on the other side.',shape:triangle,mirror,expected:reflect(triangle,mirror),operation:'reflect'},
  {mode:'shape',prompt:'Rotate the triangle a quarter turn clockwise around C.',instruction:'Tap all three vertices of the turned image. The centre C stays fixed.',shape:turnShape,centre,expected:turned,operation:'rotate'},
  {mode:'choice',plainDiagram:true,prompt:'Which statement explains what this quarter turn preserves?',instruction:'Shape A has turned clockwise around C to make image B.',shape:turnShape,image:turned,centre,options:opts(['Corresponding side lengths and angles stay equal; the orientation changes.','Side lengths stay equal, but the angles become larger.','Angles stay equal, but sides farther from C become longer.'],f+1),correctId:'o0'},
  {mode:'choice',plainDiagram:true,prompt:'Which symmetries does this shape have?',instruction:'Test reflection in the dashed line and a half turn around C. Each test must put the whole outline exactly on itself.',shape:symmetricShape,mirror:{axis:'vertical',at:4},centre:{x:4,y:4},options:opts(['Both the shown reflection and the half turn.','The shown reflection only.','The half turn only.','Neither of these symmetries.'],f),correctId:['o3','o0','o2','o1','o0'][f]},
  {mode:'shape',prompt:'Reflect the triangle in the dashed line, then translate it 1 unit up.',instruction:'Tap the three vertices of the final image after both steps. Leave the original triangle where it is.',shape:combinedSource,mirror:{axis:'vertical',at:4},expected:translate(reflect(combinedSource,{axis:'vertical',at:4}),0,1),operation:'combine',dx:0,dy:1},
 ];
}
export const LEVEL5_STARPATH_FORMS=Object.fromEntries(GROUND_STARPATH_FORMS.map((form,f)=>[form,[...nets(f).map(task=>({kind:'net' as const,task})),...plots(f).map(task=>({kind:'plot' as const,task}))].map((entry,i)=>({...entry,id:`y5-starpath-${form}-${String(i+1).padStart(2,'0')}-v5`,version:'5.0.0',form,prompt:entry.task.prompt,readAloudText:`${entry.task.prompt} ${entry.task.instruction}`,primaryDescriptorCode:i<7?'AC9M5SP01':i<13?'AC9M5SP02':'AC9M5SP03',skillLabel:LEVEL5_STARPATH_BLUEPRINT[i],difficulty:[0,7,8].includes(i)?'easy':[2,4,5,12,16,19].includes(i)?'challenging':'moderate',linkedWeeks:[i<2?1:i<4?2:i<7?3:i<11?4:i<13?5:i<15?6:i<19?7:8]}))])) as Record<GroundStarpathForm,Level5Item[]>;
