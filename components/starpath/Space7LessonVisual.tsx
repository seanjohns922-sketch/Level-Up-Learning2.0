'use client';
import ReadAloudBtn from '@/components/ReadAloudBtn';
import {CubeNet} from './Level5StarpathAssessmentCard';
import {Polygon,Plans,Plane} from './Level7StarpathAssessmentCard';
import Level7Flowchart from './Level7Flowchart';
import {narrateFlow7,type Task7} from '@/data/assessments/revisions/level7StarpathFiveForms';
import {getRealmTheme} from '@/lib/useRealmTheme';
const theme=getRealmTheme('space');
export function space7VisualSpeech(v:Task7){
 const details=v.diagram==='net'?`Six labelled squares. ${v.cells?.map((p,i)=>`${String.fromCharCode(65+i)} at row ${p.r+1}, column ${p.c+1}`).join('. ')}. ${v.marked!==undefined?`Marked face ${String.fromCharCode(65+v.marked)}.`:''}`:v.diagram==='plans'?`Height plan, back row: ${v.heights?.slice(0,3).join(', ')}. Front row: ${v.heights?.slice(3).join(', ')}. Zero is an empty position. The isometric view shows the same cube stacks.`:v.diagram==='plane'?`Both axes run from minus six to six. Original points: ${v.shape?.map(p=>`(${p.x}, ${p.y})`).join('; ')}. ${v.image?`Image B points: ${v.image.map(p=>`(${p.x}, ${p.y})`).join('; ')}.`:''} ${v.centre?`Centre C is (${v.centre.x}, ${v.centre.y}).`:''} ${v.mirrorX?`Vertical mirror lines: ${v.mirrorX.map(x=>'x = '+x).join(', ')}.`:''}`:[...(v.polygons??[]).map(p=>`${p.caption} ${p.sideLabels?'Side labels: '+p.sideLabels.join(', '):''} ${p.angles?'Angle labels: '+p.angles.filter(Boolean).join(', '):''}`),...(v.trees??[]).map(t=>`${t.title}. ${narrateFlow7(t.root)}`)].join(' ');
 return `${v.instruction} ${details}`;
}
export default function Space7LessonVisual({visual:v}:{visual:Task7}){
 return <div className="my-4 rounded-xl border p-4 [&_svg]:mx-auto [&_svg]:max-h-72 [&_svg]:max-w-full" style={{background:theme.surfaceTint,borderColor:theme.borderRing}}>
  <div className="mb-3 flex items-start justify-between gap-3"><p className="text-sm font-semibold" style={{color:theme.ctaFrom}}>{v.instruction}</p><ReadAloudBtn text={space7VisualSpeech(v)} label="Read diagram"/></div>
  {v.diagram==='net'&&<CubeNet cells={v.cells!} marked={v.marked} labels/>}
  {v.diagram==='plans'&&<Plans t={v}/>}
  {v.diagram==='plane'&&<div className="[&_svg]:!max-h-80"><Plane t={{...v,mode:'choice'}} a={{selected:[],value:"",pair:{x:"",y:""},points:[],commands:[],assignments:{},decisions:[]}} onChange={()=>{}}/></div>}
  {v.polygons?.map((p,i)=><Polygon key={i} spec={p}/>)}
  {v.trees?.map((t,i)=><section key={i}><h3 className="text-center font-bold">{t.title}</h3><Level7Flowchart tree={t.root}/></section>)}
 </div>;
}
