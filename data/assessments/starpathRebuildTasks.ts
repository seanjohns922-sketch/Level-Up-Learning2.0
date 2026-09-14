import type {PracticeTask} from "@/data/activities/year1/practice-task";
import type {IndependentConstructionTask, GridPoint} from "@/lib/starpath-independent-construction";
import {getL3Object, l3ObjectSvg, type L3ObjectId} from "@/data/activities/starpath/level3/l3-objects";
import {nameSolidTask, solidPartsTask} from "@/data/activities/starpath/level5/solidTasks";
import {buildTask} from "@/data/activities/starpath/level5/netTasks";
import {getCrossObject} from "@/data/activities/starpath/level6/crossSections";

const feedback = {correct: "Answer recorded.", wrong: "Answer recorded."};
const base = (prompt: string) => ({kind: "starpathIndependentConstruction" as const, prompt, speakText: prompt, target: 1, feedback});
const rectangle = (width: number, height: number): GridPoint[] => Array.from({length: width * height}, (_, i) => ({x: i % width, y: Math.floor(i / width)}));
const palette = (["sphere", "prism", "cone", "cube", "pyramid", "cylinder"] as L3ObjectId[]).map(id => ({id, label: getL3Object(id).label, svg: l3ObjectSvg(getL3Object(id), {size: 120})}));

function model(post: boolean, second: boolean): IndependentConstructionTask {
  if (!second) return {
    ...base(post ? "Build a lookout: choose a base with six square faces and a pointed roof with a square base. Explain why the pieces suit this design." : "Build a tower: choose a body with two circular ends and a curved surface, then a pointed roof with a circular base. Explain why the pieces suit this design."),
    mode: "model", palette, slots: ["Body", "Roof"], accepted: [post ? ["cube", "pyramid"] : ["cylinder", "cone"]],
    reasons: post ? [{id:"roll",label:"Curved faces help both pieces roll."},{id:"fit",label:"The flat square faces can meet, and the roof narrows to a point."},{id:"round",label:"The two circular faces meet."}] : [{id:"flat",label:"Both objects have only rectangular faces."},{id:"roll",label:"Both objects have no flat faces."},{id:"fit",label:"The circular base of the roof can meet the body's flat circular top."}], correctReason: "fit",
  };
  return {
    ...base(post ? "Make a stackable parcel: choose a lower block with rectangular faces and an upper block with six square faces. Explain why these objects stack." : "Build a two-block stand: use a block with six square faces below a block with rectangular faces. Explain why the stand can support another object."),
    mode:"model", palette, slots:["Lower block","Upper block"], accepted:[post?["prism","cube"]:["cube","prism"]],
    reasons:[{id:"fit",label:"Their flat faces provide surfaces that can rest on each other."},{id:"point",label:"Pointed ends provide a wide support."},{id:"curve",label:"Curved surfaces stop objects rolling."}],correctReason:"fit",
  };
}
function imageTask(level: number, post: boolean, index: number): IndependentConstructionTask {
  const original = post ? [{x:2,y:1},{x:4,y:1},{x:2,y:4}] : [{x:1,y:1},{x:4,y:1},{x:1,y:3}];
  const min = level === 6 ? -6 : 0, max = level === 6 ? 6 : 8;
  if (index === 16) {const dx = post?2:3,dy=post?3:2;return {...base(`Translate the whole triangle ${dx} units right and ${dy} units up. Plot every vertex of its image.`),mode:"image",min,max,original,expected:original.map(p=>({x:p.x+dx,y:p.y+dy}))};}
  if(index===17) {const at=post?4:3;return {...base(`Reflect the whole triangle in the line x = ${at}. Plot every vertex of its image.`),mode:"image",min,max,original,line:{axis:"x",at},expected:original.map(p=>({x:2*at-p.x,y:p.y}))};}
  const centre={x:4,y:4};
  return {...base(`Rotate the whole triangle 90° ${post?"anticlockwise":"clockwise"} about (4, 4). Plot every vertex of its image.`),mode:"image",min,max,original,centre,expected:original.map(p=>post?{x:8-p.y,y:p.x}:{x:p.y,y:8-p.x})};
}
function crossTask(post: boolean, index: number): PracticeTask {
  // Both forms cover triangular and rectangular prisms, a pyramid and a cylinder.
  const ids=post?["hexPrism","rectPrism","triPrism","cylinder","sqPyramid","cone"]:["triPrism","hexPrism","rectPrism","sqPyramid","cylinder","cone"];
  const object=getCrossObject(ids[index]!);
  let prompt: string, labels: string[], correct: number;
  if(index<3){prompt=`Predict the shape of a cut through this ${object.name.toLowerCase()}, parallel to its base. Select the shape and the reason.`;labels=[`${object.sectionName}: parallel cuts follow the shape of its base.`,"Rectangle: every flat side face gives a rectangular section.","Triangle: every cut through a solid narrows to a point.","Circle: all cuts through solids have a curved boundary."];correct=0;}
  else if(index===3){prompt="Which claim about the object and its parallel cross-sections is correct?";labels=object.isPrism?["It is a right prism: the polygonal sections stay congruent.","It is a pyramid: the sections shrink.","It is a cylinder: each section is a circle."]:object.constantSection?["It is a right prism because its sections stay the same size.","It is a cylinder: its sections are circles, not polygons.","It is a cone because the sections shrink."]:["It is a right prism because its base is a polygon.","It is a cylinder because each section is curved.","It is a pyramid: the sections shrink towards the apex."];correct=object.isPrism?0:object.constantSection?1:2;}
  else {prompt=post?"Compare parallel cuts one-quarter and three-quarters of the way up this object. Which statement explains their relationship?":"Compare a parallel cut near the base with one near the top. Which statement explains their relationship?";labels=["Same shape and size, because the object has a uniform cross-section.","Same shape but different sizes, because the object narrows towards its apex.","Different shapes, because moving a parallel cut changes the number of sides."];correct=object.constantSection?0:1;}
  if (post && index < 2) {
    const sides = index === 0 ? 6 : 4;
    prompt = `A slice is made parallel to the base of this ${object.name.toLowerCase()}. Which description of the slice is correct?`;
    labels = [`It has ${sides} straight sides, matching the base boundary.`, `It has ${sides + 2} straight sides, because the prism has extra side faces.`, "It has a curved boundary because the cutting plane is flat."];
    correct = 0;
  }
  const ordered=labels.map((label,i)=>({id:`o${i}`,label}));const shift=(index+(post?1:0))%ordered.length;
  return {kind:"starpathCrossSection",mode:index<3?"predict":"explain",target:1,objectId:object.id,prompt,speakText:prompt,options:[...ordered.slice(shift),...ordered.slice(0,shift)],correctOptionIds:[`o${correct}`],feedback};
}

export function rebuildStarpathTask(level: number, form: "pretest" | "posttest", index: number, original: PracticeTask): PracticeTask {
  const post=form==="posttest";
  let task=original;
  if(level===2 && post && (task.kind === "starpathMapRoute" || task.kind === "starpathMapLocate")) {
    const flip = <T extends {r:number;c:number}>(cell:T):T => ({...cell,c:task.kind === "starpathMapRoute" || task.kind === "starpathMapLocate" ? task.cols - 1 - cell.c : cell.c});
    const direction = (d:"up"|"down"|"left"|"right") => d === "left" ? "right" as const : d === "right" ? "left" as const : d;
    if(task.kind === "starpathMapLocate") task={...task,mapId:`${task.mapId}-west-campus`,landmarks:task.landmarks.map(flip)};
    else task={...task,mapId:`${task.mapId}-west-campus`,landmarks:task.landmarks.map(flip),start:flip(task.start),goal:flip(task.goal),blocked:task.blocked?.map(flip),checkpoints:task.checkpoints?.map(flip),steps:task.steps?.map(step=>({...step,direction:direction(step.direction),instruction:`Move ${direction(step.direction)}.`,speakText:`Move ${direction(step.direction)}.`})),debugSteps:task.debugSteps?.map(step=>({...step,direction:direction(step.direction)}))};
  }
  if (level === 3 && post && task.kind === "starpathMapCreate") {
    const rotation = {above:"rightOf", below:"leftOf", leftOf:"above", rightOf:"below"} as const;
    const wording = {above:"above", below:"below", leftOf:"left of", rightOf:"right of"};
    const labels = new Map(task.landmarks.map(l => [l.id, l.label]));
    task = {...task, cols:task.rows, rows:task.cols, constraints:task.constraints.map(c => ({...c,relation:rotation[c.relation],text:`${labels.get(c.subjectId)} is ${wording[rotation[c.relation]]} ${labels.get(c.referenceId)}.`}))};
  }
  if(level===3 && (index===8 || index===9)) task=model(post,index===9);
  if(level===4 && [1,2,3].includes(index)) {
    const width=index===1?(post?3:4):index===2?5:4, height=index===1?(post?4:3):index===2?4:4;
    const piece=index===1?[{x:0,y:0},{x:1,y:0}]:[{x:0,y:0},{x:1,y:0},{x:0,y:1}];
    // L-shaped composite is two 2x3/3x2 blocks: 12 cells, tileable by four L triominoes.
    const outline=index===1?rectangle(width,height):index===2?rectangle(4,3).map(p=>post?{x:p.y,y:p.x}:p):rectangle(4,4).filter(p=>post?!(p.x<2&&p.y<2):!(p.x>=2&&p.y>=2));
    task={...base(index===1?"Build the shaded rectangle from the small rectangles. Turn and place pieces to cover it exactly.":index===2?"Represent the shaded rectangle using only copies of the L-shaped piece. Cover it with no gaps or overlaps.":"Build this composite outline from L-shaped pieces. Cover every shaded square exactly once."),mode:"tiles",width,height,piece,outline,minimumOrientations:index===1?1:2};
  }
  if(level===5){
    if(index===0 || index===1){const solid=index===0?(post?"pyramid":"triPrism"):(post?"triPrism":"pyramid");task=nameSolidTask(index+(post?3:0),1,solid);task={...task,prompt:"Which solid will this flat net make? Predict without folding.",speakText:"Which solid will this flat net make? Predict without folding.",fold:false};}
    if(index===2){task=solidPartsTask(post?3:0,1,"cuboid");task={...task,prompt:"Which set of faces makes this net?",speakText:"Which set of faces makes this net?",fold:false};}
    if(index===5) {task=buildTask(post?126:98,1);task={...task,prompt:"Construct a net that will fold into a cube without overlapping faces.",speakText:"Construct a net that will fold into a cube without overlapping faces.",fold:false};}
    if(index===8) task={...base(`Complete this first-quadrant coordinate system. Each grid interval represents ${post?3:2} units. Label both axes and the first two ticks, then plot (${post?9:6}, ${post?6:8}).`),mode:"axes",size:5,scale:post?3:2,point:post?{x:9,y:6}:{x:6,y:8}};
    if(index>=16&&index<=18)task=imageTask(level,post,index);
    if(index===15 || index===19){const shape=post?[{x:1,y:1},{x:2,y:1},{x:1,y:3}]:[{x:1,y:1},{x:3,y:1},{x:1,y:2}]; const reflection=index===15;task={kind:"starpathTransform",mode:"compare",render:"options",target:1,bounds:{x:8,y:8},shape,image:shape.map(p=>reflection?{x:8-p.x,y:p.y}:{x:8-p.x,y:8-p.y}),line:reflection?{axis:"vertical",at:4}:undefined,centre:reflection?undefined:{x:4,y:4},prompt:reflection?"Which single transformation maps the amber figure to the blue figure using the shown mirror line?":"Which single transformation about the marked centre maps the amber figure to the blue figure?",speakText:"",options:[{id:"t",label:"Translation"},{id:"r",label:"Reflection in the shown line"},{id:"h",label:"Half-turn about the marked centre"}],correctOptionIds:[reflection?"r":"h"],feedback};}
  }
  if(level===6){
    if(index<6)task=crossTask(post,index);
    if(index===10 || index===11){const start=post?{x:-2,y:3}:{x:3,y:-2};const dx=index===10?(post?5:-5):(post?3:-4),dy=index===10?(post?-5:5):(post?-4:3);task={...base(`The triangle moves ${Math.abs(dx)} units ${dx>0?"right":"left"} and ${Math.abs(dy)} units ${dy>0?"up":"down"}. Plot all three vertices of the image.`),mode:"image",min:-6,max:6,original:[start,{x:start.x+1,y:start.y},{x:start.x,y:start.y+1}],expected:[start,{x:start.x+1,y:start.y},{x:start.x,y:start.y+1}].map(p=>({x:p.x+dx,y:p.y+dy}))};}
    if(index===12 || index===14){const points=post?[{x:-3,y:1},{x:-1,y:1},{x:-3,y:2}]:[{x:1,y:1},{x:3,y:1},{x:1,y:2}];const reflect=(p:GridPoint)=>({x:-p.x,y:p.y});const shift=(p:GridPoint)=>({x:p.x+2,y:p.y-3});const expected=points.map(p=>post?reflect(shift(p)):shift(reflect(p)));task={...base(post?"Translate the whole triangle 2 right and 3 down, then reflect it in the y-axis. Plot every final vertex.":"Reflect the whole triangle in the y-axis, then translate it 2 right and 3 down. Plot every final vertex."),mode:"image",min:-6,max:6,original:points,expected,line:{axis:"x",at:0}};if(index===14 && task.mode==="image")task={...task,original:task.original.map(p=>({x:p.x,y:-p.y})),expected:task.original.map(p=>({x:p.x,y:-p.y})).map(p=>post?reflect(shift(p)):shift(reflect(p)))};}
    if(index===16 || index===18) task={...base("Create a tessellating patch using copies of this L-shaped tile. Use translations and quarter-turns to cover the whole rectangle with no gaps or overlaps."),mode:"tiles",width:post?4:6,height:post?6:4,piece:index===16?[{x:0,y:0},{x:0,y:1},{x:1,y:1}]:[{x:0,y:0},{x:1,y:0},{x:1,y:1}],outline:rectangle(post?4:6,post?6:4),minimumOrientations:2};
  }
  if (task.kind === "starpathIndependentConstruction" && task.mode === "model") {
    const requirements = task.prompt;
    task = {...task, prompt: index === 8 ? (post ? "Build a lookout and explain your choice." : "Build a tower and explain your choice.") : (post ? "Build a parcel from two objects." : "Build a stand from two objects."), instructions: [requirements]};
  }
  if (task.kind === "starpathIndependentConstruction" && task.mode !== "model") {
    const instructions = task.prompt;
    const prompt = task.mode === "tiles" ? "Build the shaded shape." : task.mode === "axes" ? "Build the coordinate system." : "Plot the transformed triangle.";
    task = {...task, prompt, instructions:[instructions]};
  }
  if (task.kind === "starpathComposite" && task.reasonOptions?.length) {
    const n = (index + (post ? 1 : 0)) % task.reasonOptions.length;
    task = {...task, reasonOptions:[...task.reasonOptions.slice(n), ...task.reasonOptions.slice(0,n)]};
  }
  // Answer order is reproducible for resume, but never always "first".
  const shift=(index+(post?2:1));
  if(task.kind==="starpathObject" && (task.mode==="compare"||task.mode==="name")){const n=shift%task.options.length;task={...task,options:[...task.options.slice(n),...task.options.slice(0,n)]};}
  if(task.kind==="starpathObject" && task.mode==="find"){const n=shift%task.scene.length;task={...task,scene:[...task.scene.slice(n),...task.scene.slice(0,n)]};}
  return {...task, speakText:"prompt" in task?[task.prompt,...(task.kind === "starpathIndependentConstruction" ? task.instructions ?? [] : [])].join(" "):"",feedback} as PracticeTask;
}

export function starpathResponseMode(task: PracticeTask): "selected_response" | "manipulated_response" {
  if(task.kind==="starpathRouteDebug" || task.kind==="starpathMapLocate" || (task.kind==="starpathMapRoute" && task.mode==="debug"))return "selected_response";
  if(task.kind==="starpathComposite" && task.figureOptions?.length)return "selected_response";
  if(task.kind==="starpathIndependentConstruction")return "manipulated_response";
  if(task.kind==="starpathNet")return task.render==="build"?"manipulated_response":"selected_response";
  if(task.kind==="starpathTransform")return task.render==="tap"?"manipulated_response":"selected_response";
  if(task.kind==="starpathCrossSection"||task.kind==="starpathTessellation")return "selected_response";
  if(task.kind==="starpathSymmetry")return task.options?.length?"selected_response":"manipulated_response";
  if(task.kind==="starpathObject")return task.mode==="build"||task.mode==="classify"?"manipulated_response":"selected_response";
  if("options" in task && Array.isArray(task.options) && task.options.length) return "selected_response";
  return "manipulated_response";
}
