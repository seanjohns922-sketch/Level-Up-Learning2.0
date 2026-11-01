import ReadAloudBtn from '@/components/ReadAloudBtn';
import type {QuestionDraft} from '@/data/activities/level8/shared';
type Scene=NonNullable<NonNullable<QuestionDraft['spaceVisual']>['coordinate']>;
export default function CoordinateDiagram({scene}:{scene:Scene}) {
  const dims=scene.dimensions, values=scene.points.flatMap(p=>p.values),lo=Math.min(0,...values)-1,hi=Math.max(4,...values)+1;
  const step=Math.max(1,Math.ceil((hi-lo)/(dims===3?6:10))),min=Math.floor(lo/step)*step,max=Math.ceil(hi/step)*step;
  const ticks=Array.from({length:Math.round((max-min)/step)+1},(_,i)=>min+i*step);
  const project=(p:number[])=>dims===2?{x:p[0],y:-p[1]}:{x:(p[0]-p[1])*.8,y:(p[0]+p[1])*.3-(p[2]??0)};
  const corners=Array.from({length:2**dims},(_,i)=>project(Array.from({length:dims},(_,d)=>i&(1<<d)?max:min)));
  const xs=corners.map(p=>p.x),ys=corners.map(p=>p.y),left=Math.min(...xs),top=Math.min(...ys),scale=Math.min(410/(Math.max(...xs)-left),300/(Math.max(...ys)-top));
  const pos=(p:number[])=>{const q=project(p);return {x:65+(q.x-left)*scale,y:45+(q.y-top)*scale};};
  const line=(a:number[],b:number[],colour='#ddd0f6',dash?:string)=>{const p=pos(a),q=pos(b);return <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={colour} strokeDasharray={dash}/>;};
  const origin=Array(dims).fill(0),axisPoint=(axis:number,n:number)=>origin.map((_,i)=>i===axis?n:0);
  const speech=scene.caption+` Axes ${dims===2?'x and y':'x, y and z'} run from ${min} to ${max} in steps of ${step}. `+scene.points.map(p=>scene.showCoordinates===false?`Marker ${p.label}.`:p.label+': ('+p.values.join(', ')+').').join(' ');
  return <div className="text-slate-900"><svg viewBox="0 0 560 400" role="img" aria-label={speech} className="mx-auto w-full max-w-xl">
    {ticks.map(t=><g key={t}>{line([min,t,0],[max,t,0])}{line([t,min,0],[t,max,0])}</g>)}
    {Array.from({length:dims},(_,axis)=><g key={axis}>{line(axisPoint(axis,min),axisPoint(axis,max),'#67419a')}{ticks.map(t=>{const p=pos(axisPoint(axis,t));return <g key={t}><circle cx={p.x} cy={p.y} r="2" fill="#67419a"/><text x={p.x+(axis===2?-15:0)} y={p.y+(axis===2?4:17)} textAnchor="middle" fontSize="18">{t===0&&axis>0?"":t}</text></g>;})}{(()=>{const p=pos(axisPoint(axis,max));return <text x={p.x+15} y={p.y-10} fill="#67419a" fontWeight="bold">{'xyz'[axis]}</text>;})()}</g>)}
    {scene.edges?.map(([a,b],i)=><g key={`edge-${i}`}>{line(scene.points[a].values,scene.points[b].values,"#67419a")}</g>)}
    {scene.points.map((p,i)=>{const q=pos(p.values);return <g key={i}>{dims===3&&line(p.values,[p.values[0],p.values[1],0],'#a36a1b','5 4')}<circle cx={q.x} cy={q.y} r="5" fill="#a36a1b"/><text x={q.x+8} y={q.y-8} fontSize="18" fill="#583714">{p.label}</text></g>;})}
  </svg><p className="mt-2">{scene.caption}</p><div className="mt-2 flex flex-wrap gap-3">{scene.showCoordinates!==false&&scene.points.map((p,i)=><p key={i}>{p.label}: ({p.values.join(', ')})</p>)}</div><ReadAloudBtn text={speech} label="Read coordinate diagram"/></div>;
}
