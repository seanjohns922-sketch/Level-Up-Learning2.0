import ReadAloudBtn from '@/components/ReadAloudBtn';
import type {QuestionDraft} from '@/data/activities/level8/shared';
type Scene=NonNullable<NonNullable<QuestionDraft['spaceVisual']>['coordinate']>;
export default function CoordinateDiagram({scene}:{scene:Scene}) {
  const dims=scene.dimensions, values=scene.points.flatMap(p=>p.values),lo=Math.min(0,...values)-1,hi=Math.max(4,...values)+1;
  const step=Math.max(1,Math.ceil((hi-lo)/(dims===3?6:10))),min=Math.floor(lo/step)*step,max=Math.ceil(hi/step)*step;
  const ticks=Array.from({length:Math.round((max-min)/step)+1},(_,i)=>min+i*step);
  const project=(p:number[])=>dims===2?{x:p[0],y:-p[1]}:{x:(p[0]-p[1])*.95,y:(p[0]+p[1])*.34-(p[2]??0)};
  const corners=Array.from({length:2**dims},(_,i)=>project(Array.from({length:dims},(_,d)=>i&(1<<d)?max:min)));
  const xs=corners.map(p=>p.x),ys=corners.map(p=>p.y),left=Math.min(...xs),top=Math.min(...ys),scale=Math.min(440/(Math.max(...xs)-left),316/(Math.max(...ys)-top));
  const pos=(p:number[])=>{const q=project(p);return {x:65+(q.x-left)*scale,y:45+(q.y-top)*scale};};
  const line=(a:number[],b:number[],colour='#ddd0f6',dash?:string)=>{const p=pos(a),q=pos(b);return <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={colour} strokeDasharray={dash}/>;};
  const origin=Array(dims).fill(0),axisPoint=(axis:number,n:number)=>origin.map((_,i)=>i===axis?n:0);
  const speech=scene.caption+` Axes ${dims===2?'x and y':'x, y and z'} run from ${min} to ${max} in steps of ${step}. `+scene.points.map(p=>scene.showCoordinates===false?`Marker ${p.label}.`:p.label+': ('+p.values.join(', ')+').').join(' ');
  const ink='#3c2a63',chip=(x:number,y:number,t:string)=>{const w=t.length*11+16;return <g><rect x={x-w/2} y={y-15} width={w} height={30} rx="7" fill="#fff"/><text x={x} y={y+7} textAnchor="middle" fontSize="20" fontWeight="700" fill={ink}>{t}</text></g>;};
  const every=ticks.length>7?2:1;
  return <div className="text-slate-900"><svg viewBox="0 0 560 400" role="img" aria-label={speech} className="mx-auto w-full max-w-xl">
    {dims===3&&<polygon points={[[min,min,0],[max,min,0],[max,max,0],[min,max,0]].map(c=>{const q=pos(c);return `${q.x},${q.y}`;}).join(' ')} fill="#e7e0f5"/>}
    {ticks.map(t=><g key={t}>{line([min,t,0],[max,t,0],'#cdbff0')}{line([t,min,0],[t,max,0],'#cdbff0')}</g>)}
    {Array.from({length:dims},(_,axis)=><g key={axis}>{line(axisPoint(axis,min),axisPoint(axis,max),ink)}{ticks.map((t,i)=>{const p=pos(axisPoint(axis,t)),show=t!==0&&(dims===2||t>0)&&(axis===2||dims===2||i%every===0);if(!show)return null;const dx=dims===2?(axis===1?-16:0):axis===2?-20:axis===0?12:-12,dy=dims===2?(axis===1?6:22):axis===2?6:24;return <g key={t}><circle cx={p.x} cy={p.y} r="3" fill={ink}/><text x={p.x+dx} y={p.y+dy} textAnchor="middle" fontSize="18" fontWeight="600" fill={ink}>{t}</text></g>;})}{(()=>{const p=pos(axisPoint(axis,max));return <text x={p.x+(axis===1&&dims===3?-18:16)} y={p.y-8} fontSize="22" fill="#6d3bd1" fontWeight="800">{'xyz'[axis]}</text>;})()}</g>)}
    {scene.edges?.map(([a,b],i)=><g key={`edge-${i}`}>{line(scene.points[a].values,scene.points[b].values,'#6d3bd1')}</g>)}
    {scene.points.map((p,i)=>{const q=pos(p.values);return <g key={i}>{dims===3&&line(p.values,[p.values[0],p.values[1],0],'#c76f00','6 5')}<circle cx={q.x} cy={q.y} r="8" fill="#6d3bd1" stroke="#fff" strokeWidth="2.5"/>{chip(q.x+(q.x>440?-34:34),q.y-20,p.label)}</g>;})}
  </svg><p className="mt-1 text-center text-sm font-semibold" style={{color:ink}}>{scene.caption}</p>{scene.showCoordinates!==false&&<div className="mt-2 flex flex-wrap justify-center gap-2">{scene.points.map((p,i)=><span key={i} className="rounded-lg px-3 py-1 text-base font-bold" style={{background:'#e7e0f5',color:ink}}>{p.label}: ({p.values.join(', ')})</span>)}</div>}<ReadAloudBtn text={speech} label="Read coordinate diagram"/></div>;
}
