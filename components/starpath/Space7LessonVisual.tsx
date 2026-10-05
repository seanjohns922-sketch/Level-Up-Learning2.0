'use client';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {CubeNet} from './Level5StarpathAssessmentCard';
import {Plans,Plane} from './Level7StarpathAssessmentCard';
import Level7Flowchart from './Level7Flowchart';
import {PrismDrawing,SolidNetDrawing,FootprintDrawing,LessonPolygon} from './Space7Solids';
import {LessonPlane,lessonPlaneSpeech} from './Space7Plane';
import {ShapeCard,FamilyTree} from './Space7Sorter';
import {sorterShapeSpeech} from '@/lib/level7-answer';
import {narrateFlow7,type Task7} from '@/data/assessments/revisions/level7StarpathFiveForms';
import {getRealmTheme} from '@/lib/useRealmTheme';
const theme=getRealmTheme('space');
export function space7VisualSpeech(v:Task7,reveal=false){
 if(v.plane7)return `${v.instruction} ${lessonPlaneSpeech(v.plane7,reveal)}`;
 const sorter=[v.shapes7?.map(sorterShapeSpeech).join(' '),v.familyTree7?`Quadrilateral family tree. Under quadrilateral: ${v.familyTree7.slice(0,3).join(', ')}. Under parallelogram: ${v.familyTree7[3]} and ${v.familyTree7[4]}; ${v.familyTree7[4]} is also under ${v.familyTree7[2]}. ${v.familyTree7[5]} is under both ${v.familyTree7[3]} and ${v.familyTree7[4]}.`:''].filter(Boolean).join(' ');
 const details=v.diagram==='net'?`Six labelled squares. ${v.cells?.map((p,i)=>`${String.fromCharCode(65+i)} at row ${p.r+1}, column ${p.c+1}`).join('. ')}. ${v.marked!==undefined?`Marked face ${String.fromCharCode(65+v.marked)}.`:''}`:v.diagram==='plans'?`Height plan, back row: ${v.heights?.slice(0,3).join(', ')}. Front row: ${v.heights?.slice(3).join(', ')}. Zero is an empty position. The isometric view shows the same cube stacks.`:v.diagram==='plane'?`Both axes run from minus six to six. Original points: ${v.shape?.map(p=>`(${p.x}, ${p.y})`).join('; ')}. ${v.image?`Image B points: ${v.image.map(p=>`(${p.x}, ${p.y})`).join('; ')}.`:''} ${v.centre?`Centre C is (${v.centre.x}, ${v.centre.y}).`:''} ${v.mirrorX?`Vertical mirror lines: ${v.mirrorX.map(x=>'x = '+x).join(', ')}.`:''}`:[...(v.polygons??[]).map(p=>`${p.caption} ${p.sideLabels?'Side labels: '+p.sideLabels.join(', '):''} ${p.angles?'Angle labels: '+p.angles.filter(Boolean).join(', '):''}`),...(v.trees??[]).map(t=>`${t.title}. ${narrateFlow7(t.root)}`)].join(' ');
 const extra=v.prism?` A right prism with ${v.prism}-sided ends; back edges are dashed and every corner is dotted.`:v.solidNet?' A flat net of a solid.':v.footprint?` A footprint grid, ${v.footprint.cols} by ${v.footprint.rows}, with ${v.footprint.occupied.length} shaded occupied positions.`:'';
 return `${v.instruction} ${details}${extra}${sorter?` ${sorter}`:''}`;
}
/** reveal draws the worked image (skill guide worked examples). */
export default function Space7LessonVisual({visual:v,reveal=false}:{visual:Task7;reveal?:boolean}){
 return <div className="my-4 rounded-xl border p-4 [&_svg]:mx-auto [&_svg]:max-h-72 [&_svg]:max-w-full" style={{background:theme.surfaceTint,borderColor:theme.borderRing}}>
  <div className="mb-3 flex items-start justify-between gap-3"><p className="text-sm font-semibold" style={{color:theme.ctaFrom}}>{v.instruction}</p><ReadAloudBtn text={space7VisualSpeech(v,reveal)} label="Read diagram"/></div>
  {v.plane7&&<div className="[&_svg]:!max-h-[24rem]"><LessonPlane spec={v.plane7} reveal={reveal}/></div>}
  {v.diagram==='net'&&<CubeNet cells={v.cells!} marked={v.marked} labels/>}
  {v.diagram==='plans'&&(v.solidNet?<div className="flex items-center gap-2"><div className="min-w-0 flex-[2] [&_svg]:!max-h-40"><Plans t={v}/></div><figure className="min-w-0 flex-1 text-center text-sm [&_svg]:!max-h-40"><SolidNetDrawing net={v.solidNet}/><figcaption>Net</figcaption></figure></div>:<Plans t={v}/>)}
  {v.diagram==='plane'&&<div className="[&_svg]:!max-h-80"><Plane t={{...v,mode:'choice'}} a={{selected:[],value:"",pair:{x:"",y:""},points:[],commands:[],assignments:{},decisions:[]}} onChange={()=>{}}/></div>}
  {v.polygons?.map((p,i)=><LessonPolygon key={i} spec={p}/>)}
  {v.prism&&<PrismDrawing sides={v.prism}/>}
  {v.solidNet&&v.diagram!=='plans'&&<SolidNetDrawing net={v.solidNet}/>}
  {v.footprint&&<FootprintDrawing {...v.footprint}/>}
  {v.shapes7&&v.familyTree7?<div className="flex flex-wrap items-center justify-center gap-3"><div className="[&_svg]:!max-h-44"><ShapeCard shape={v.shapes7[0]} size={170}/></div><div className="min-w-[240px] flex-1 [&_svg]:!max-h-72"><FamilyTree values={v.familyTree7}/></div></div>:<>
  {v.shapes7&&<div className={`flex flex-wrap justify-center gap-2 ${v.shapes7.length===1?'[&_svg]:!max-h-64':'[&_svg]:!max-h-44'}`}>{v.shapes7.map(sh=><ShapeCard key={sh.id} shape={sh} size={v.shapes7!.length>3?130:v.shapes7!.length===1?280:170}/>)}</div>}
  {v.familyTree7&&<div className="[&_svg]:!max-h-80"><FamilyTree values={v.familyTree7}/></div>}</>}
  {v.shapes7?.some(sh=>sh.show!=='angles')&&<p className="mt-2 text-center text-xs" data-shape-key>Key: | equal sides · ⌒ equal angles · ∟ right angle · &gt; parallel sides</p>}
  {v.trees?.map((t,i)=><section key={i}><h3 className="text-center font-bold">{t.title}</h3><Level7Flowchart tree={t.root}/></section>)}
 </div>;
}
