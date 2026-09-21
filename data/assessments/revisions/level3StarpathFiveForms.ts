import {GROUND_STARPATH_FORMS,type GroundStarpathForm} from './groundStarpathFiveForms';
import {rotate,transformCell,transformDirection,LEVEL2_STARPATH_FORMS,type Landmark,type Level2MapTask} from './level2StarpathFiveForms';
import type {Cell,Direction} from './level1StarpathFiveForms';
import type {L3ObjectId} from '@/data/activities/starpath/level3/l3-objects';
export type Choice={id:string;label?:string;object?:L3ObjectId};
export type BlockModel={cols:number;rows:number;height:number};
export type SolidTask={mode:'choice'|'multi'|'blocks';prompt:string;instruction?:string;objects?:L3ObjectId[];options?:Choice[];correctIds?:string[];reasons?:Choice[];correctReason?:string;models?:BlockModel[];build?:BlockModel};
export type Relation='above'|'below'|'left'|'right';
export type MapConstraint={subject:string;reference:string;relation:Relation};
export type LayoutTask={mode:'build'|'viewpoint'|'views';prompt:string;instruction:string;title:string;landmarks:Landmark[];constraints?:MapConstraint[];example?:Record<string,Cell>;explorer?:{cell:Cell;facing:Direction};relation?:'ahead'|'left'|'right'|'behind';target?:string;options?:Choice[];correctId?:string;viewAnswer?:'plan'|'front'|'both';viewVariant?:number};
export type Level3Item={id:string;version:'5.0.0';form:GroundStarpathForm;prompt:string;readAloudText:string;primaryDescriptorCode:'AC9M3SP01'|'AC9M3SP02';skillLabel:string;difficulty:'easy'|'moderate'|'challenging';linkedWeeks:number[]}&({kind:'solid';task:SolidTask}|{kind:'map';task:Level2MapTask}|{kind:'layout';task:LayoutTask});
export const LEVEL3_STARPATH_BLUEPRINT=['Recognise a geometric object','Count flat faces','Count vertices','Classify curved surfaces','Compare object features','Choose an object for a purpose','Distinguish a pyramid and cone','Count cubes in a model','Build a rectangular prism','Compare two cube models','Interpret a map key','Use an explorer’s viewpoint','Interpret a plan and front view','Compare information in different views','Create a map from two clues','Create a map from three clues','Combine two position clues','Change viewpoint on a map','Plan a journey via a landmark','Create a map with linked constraints'] as const;
const words=(labels:string[],f:number):Choice[]=>rotate(labels.map((label,i)=>({id:`o${i}`,label})),f);
const objects=(ids:L3ObjectId[],f:number):Choice[]=>rotate(ids.map((object,i)=>({id:`o${i}`,object})),f);
function solids(f:number):SolidTask[]{
 const named: L3ObjectId[]=['cylinder','prism','pyramid','cone','sphere'];
 const names:Record<L3ObjectId,string>={cube:'Cube',prism:'Rectangular prism',pyramid:'Square-based pyramid',cylinder:'Cylinder',cone:'Cone',sphere:'Sphere'};
 const nameDistractors:Record<L3ObjectId,L3ObjectId[]>={cube:['prism','pyramid'],prism:['cube','pyramid'],pyramid:['cone','prism'],cylinder:['cone','sphere'],cone:['pyramid','cylinder'],sphere:['cylinder','cone']};
 const faceObject:L3ObjectId=f%2?'pyramid':'prism',faceCount=f%2?5:6;
 const vertexObject:L3ObjectId=f%2?'cube':'pyramid',vertices=f%2?8:5;
 const purposes=[
  {prompt:'Which object would make a wheel that rolls along a straight track?',correct:'cylinder',wrong:['cube','cone'],reason:'Its curved surface rolls, and its circular ends are the same size.'},
  {prompt:'Which object suits the pointed nose of a round model rocket?',correct:'cone',wrong:['pyramid','cylinder'],reason:'It has a circular base and narrows to one point.'},
  {prompt:'Which object suits a long packing box that stacks neatly?',correct:'prism',wrong:['sphere','cone'],reason:'Its flat rectangular faces fit against other boxes.'},
  {prompt:'Which object suits a ball that rolls in any direction?',correct:'sphere',wrong:['cube','cylinder'],reason:'Its surface curves in every direction, with no flat faces.'},
  {prompt:'Which object suits a roof with a square base and four triangular faces?',correct:'pyramid',wrong:['cone','prism'],reason:'Its triangular faces meet at one point above a square base.'},
 ] as const;
 const p=purposes[f];
 const reasonDistractors=[
  ['Its circular ends are different sizes, so it rolls straight.','Its flat ends slide along the track instead of rolling.'],
  ['Its two circular ends make a pointed tip.','Its curved surface means it has no point.'],
  ['Its curved surface leaves no gaps between stacked boxes.','Its triangular faces make a long rectangular space inside.'],
  ['Its circular flat ends let it roll equally in every direction.','Its flat faces let it roll smoothly without stopping.'],
  ['Its curved surface joins a square base to a point.','Its four triangular faces meet above a circular base.'],
 ][f];
 const countModels:BlockModel[]=[{cols:3,rows:2,height:1},{cols:2,rows:2,height:2},{cols:3,rows:1,height:3},{cols:2,rows:3,height:2},{cols:2,rows:2,height:3}];
 const builds:BlockModel[]=[{cols:2,rows:2,height:2},{cols:3,rows:2,height:1},{cols:2,rows:1,height:3},{cols:3,rows:1,height:2},{cols:2,rows:2,height:3}];
 const a={cols:2,rows:1+f%2,height:2},b={cols:3,rows:1+f%2,height:2};const m=countModels[f],n=m.cols*m.rows*m.height,difference=(b.cols-a.cols)*b.rows*b.height;
 return [
  {mode:'choice',prompt:'What is the name of this object?',objects:[named[f]],options:words([names[named[f]],...nameDistractors[named[f]].map(id=>names[id])],f),correctIds:['o0']},
  {mode:'choice',prompt:'How many flat faces does this object have altogether?',instruction:'Include the faces you cannot see.',objects:[faceObject],options:words([`${faceCount}`,`${faceCount-1}`,`${faceCount+1}`],f+1),correctIds:['o0']},
  {mode:'choice',prompt:'How many vertices does this object have altogether?',instruction:'Include the vertices hidden behind the object.',objects:[vertexObject],options:words([`${vertices}`,`${vertices-1}`,`${f%2?6:8}`],f+2),correctIds:['o0']},
  {mode:'multi',prompt:'Choose every object with a curved surface.',instruction:'Choose all that belong.',options:objects(['cube','sphere','cylinder','prism','cone','pyramid'],f),correctIds:['o1','o2','o4']},
  {mode:'choice',prompt:'What is true about both objects?',objects:f%2?['pyramid','cone']:['cube','prism'],options:words(f%2?['Both have at least one vertex.','Both have a curved surface.','Both have five flat faces.']:['Both have six flat faces and eight vertices.','Both have six equal square faces.','Both have eight flat faces and six vertices.'],f),correctIds:['o0']},
  {mode:'choice',prompt:p.prompt,instruction:'Choose the object, then explain why its features suit the job.',options:objects([p.correct,...p.wrong],f+1),correctIds:['o0'],reasons:words([p.reason,...reasonDistractors],f+2),correctReason:'o0'},
  {mode:'choice',prompt:'What is different about these two objects?',objects:f%2?['cone','pyramid']:['pyramid','cone'],options:words(['The pyramid has only flat faces; the cone has a curved surface.','Only the cone has a vertex.','The pyramid has four vertices altogether; the cone has one.'],f+2),correctIds:['o0']},
  {mode:'choice',prompt:'How many equal cubes make this model?',instruction:'The model is solid, with no gaps. Count hidden cubes too.',models:[m],options:words([`${n}`,`${n-m.cols}`,`${n+m.cols}`],f),correctIds:['o0']},
  {mode:'blocks',prompt:'Build a rectangular prism from equal cubes.',instruction:`Fill the ${builds[f].cols} by ${builds[f].rows} base. Make every column ${builds[f].height} cubes high, with no gaps.`,build:builds[f]},
  {mode:'choice',prompt:'How many more cubes are in model B than model A?',instruction:'Both models are solid, with no gaps. Each small cube is the same size.',models:[a,b],options:words([`${difference}`,`${b.cols-a.cols}`,`${a.cols*a.rows*a.height+b.cols*b.rows*b.height}`],f+1),correctIds:['o0']},
 ];
}
const directionRelation:Record<Direction,Relation>={up:'above',down:'below',left:'left',right:'right'};
export function relativeDirection(facing:Direction,rel:NonNullable<LayoutTask['relation']>):Direction{const ds:Direction[]=['up','right','down','left'];return ds[(ds.indexOf(facing)+({ahead:0,right:1,behind:2,left:3}[rel]))%4];}
function layouts(f:number):(Level2MapTask|LayoutTask)[]{
 const base=LEVEL2_STARPATH_FORMS[GROUND_STARPATH_FORMS[f]].filter(i=>i.kind==='map').map(i=>i.task as Level2MapTask);
 const landmarks=base[0].landmarks,title=base[0].title;
 const transform=(p:Cell)=>transformCell(p,f),dir=(d:Direction)=>transformDirection(d,f);
 const view=(second:boolean):LayoutTask=>{
  const relation:NonNullable<LayoutTask['relation']>=second?(['right','behind','left','behind','right'] as const)[f]:(['left','right','ahead','left','right'] as const)[f];
  const facing=dir(second?'left':'up'),desired=relativeDirection(facing,relation);
  const explorer=transform({r:1,c:2});
  const steps={up:{r:-1,c:0},down:{r:1,c:0},left:{r:0,c:-1},right:{r:0,c:1}};
  const near=(d:Direction)=>({r:explorer.r+steps[d].r,c:explorer.c+steps[d].c});
  const visible=landmarks.slice(0,4).map((l,i)=>({...l,cell:near((['up','right','down','left'] as Direction[])[i])}));
  const target=visible.find(l=>l.cell.r===near(desired).r&&l.cell.c===near(desired).c)!;
  return {mode:'viewpoint',prompt:`Which place is ${relation==='ahead'?'straight ahead':relation==='behind'?'directly behind':`on the explorer’s ${relation}`}?`,instruction:'The arrow shows which way the explorer is facing. Use the explorer’s viewpoint.',title,landmarks:visible,explorer:{cell:explorer,facing},relation,target:target.id,options:rotate(visible.map(l=>({id:l.id,label:l.label})),f+1),correctId:target.id};
 };
 const build=(count:number,extra=false):LayoutTask=>{
  const chosen=landmarks.slice(0,count),example=Object.fromEntries(chosen.map((l,i)=>[l.id,transform([{r:2,c:0},{r:0,c:0},{r:0,c:2},{r:2,c:2}][i])])),rel=(d:Direction)=>directionRelation[dir(d)];
  const constraints:MapConstraint[]=[{subject:'l1',reference:'l0',relation:rel('up')},{subject:'l2',reference:'l1',relation:rel('right')}];
  if(count===4)constraints.push({subject:'l3',reference:'l2',relation:rel('down')});
  if(extra)constraints.push({subject:'l3',reference:'l0',relation:rel('right')});
  return {mode:'build',prompt:'Create a map that matches every clue.',instruction:'Choose a landmark, then tap a square. Use a different square for each place. More than one map can work.',title,landmarks:chosen,constraints,example};
 };
 const viewVariant=f,viewAnswer:LayoutTask['viewAnswer']=f%2?'front':'plan';
 return [base[0],view(false),
  {mode:'views',prompt:f%2?'Which view shows the height of the doorway?':'Which view shows where the table is inside the room?',instruction:'Compare the same room shown from above and from the front.',title:'Community room',landmarks:[],options:words(['Plan view','Front view','Both views'],f),correctId:f%2?'o1':'o0',viewAnswer,viewVariant},
  {mode:'views',prompt:f%2?'Which view helps you place furniture without blocking the floor space?':'Which view shows the shape of the roof above the doorway?',instruction:'Choose the representation that gives the information you need.',title:'Community room',landmarks:[],options:words(['Plan view','Front view','Both views'],f+1),correctId:f%2?'o0':'o1',viewAnswer:f%2?'plan':'front',viewVariant},
  build(3),build(4),base[2],view(true),{...base[9],prompt:`Plan a route via ${landmarks[3].label} to ${landmarks[2].label}. Avoid the closed square.`},build(4,true)];
}
export const LEVEL3_STARPATH_FORMS=Object.fromEntries(GROUND_STARPATH_FORMS.map((form,f)=>[form,[...solids(f).map(task=>({kind:'solid' as const,task})),...layouts(f).map(task=>({kind:task.mode==='build'||task.mode==='viewpoint'||task.mode==='views'?'layout' as const:'map' as const,task}))].map((entry,i)=>({...entry,id:`y3-starpath-${form}-${String(i+1).padStart(2,'0')}-v5`,version:'5.0.0',form,prompt:entry.task.prompt,readAloudText:[entry.task.prompt,entry.task.instruction].filter(Boolean).join(' '),primaryDescriptorCode:i<10?'AC9M3SP01':'AC9M3SP02',skillLabel:LEVEL3_STARPATH_BLUEPRINT[i],difficulty:[0,1,10].includes(i)?'easy':[5,8,9,15,18,19].includes(i)?'challenging':'moderate',linkedWeeks:[i<4?1:i<5?2:i<7?3:i<10?8:i<14?4:i<16?5:i<18?6:i<19?7:8]}))])) as Record<GroundStarpathForm,Level3Item[]>;
