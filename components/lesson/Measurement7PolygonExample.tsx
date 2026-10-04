import ReadAloudBtn from '@/components/ReadAloudBtn';

// Fan triangles share one original vertex, so no extra interior angles are added.
export default function Measurement7PolygonExample(){
 const colours=['#f6d58a','#c5dca7','#cdb8df','#a9d8de'];
 return <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
  <div className="mb-2 flex items-center justify-between gap-2"><span className="font-bold text-amber-900">Split each shape into triangles</span><ReadAloudBtn label="Read diagram" text="Split each shape into triangles. Dashed diagonals start at one corner. Pentagon: 5 sides, 3 triangles. Each triangle has an angle sum of 180 degrees. 3 times 180 equals 540 degrees. Hexagon: 6 sides, 4 triangles. 4 times 180 equals 720 degrees."/></div>
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{[5,6].map(n=>{
   const points=Array.from({length:n},(_,i)=>{const angle=-Math.PI/2+i*2*Math.PI/n;return [120+90*Math.cos(angle),110+90*Math.sin(angle)];});
   return <figure key={n} className="min-w-0 text-center">
    <figcaption className="font-bold">{n===5?'Pentagon':'Hexagon'} · {n} sides</figcaption>
    <svg viewBox="0 0 240 220" className="mx-auto w-full max-w-64" role="img" aria-label={`${n}-sided polygon divided into ${n-2} triangles`}>
     {Array.from({length:n-2},(_,i)=>{const tri=[points[0],points[i+1],points[i+2]];return <g key={i}><polygon points={tri.map(p=>p.join(',')).join(' ')} fill={colours[i]}/><text x={tri.reduce((sum,p)=>sum+p[0],0)/3} y={tri.reduce((sum,p)=>sum+p[1],0)/3+5} textAnchor="middle" fill="#422e15" fontSize="15" fontWeight="bold">180°</text></g>;})}
     {points.slice(2,-1).map((p,i)=><path key={i} d={`M${points[0].join(' ')}L${p.join(' ')}`} stroke="#755130" strokeWidth="2" strokeDasharray="5 4"/>)}
     <polygon points={points.map(p=>p.join(',')).join(' ')} fill="none" stroke="#755130" strokeWidth="3"/>
    </svg>
    <p className="font-semibold">{n-2} triangles</p><p className="font-bold text-amber-900">{n-2} × 180° = {(n-2)*180}°</p>
   </figure>;
  })}</div>
 </div>;
}
