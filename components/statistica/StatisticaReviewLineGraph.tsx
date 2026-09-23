import styles from '@/components/demo/StatisticaFiveForms.module.css';
export default function ReviewLineGraph({points,max,step,unit}:{points:{label:string;value:number}[];max:number;step:number;unit:string}){
 const x=(i:number)=>58+i*320/(points.length-1),y=(v:number)=>246-v*200/max;
 return <svg className={styles.reviewGraph} viewBox="0 0 420 300" role="img" aria-label={`${unit} over time. ${points.map(p=>`${p.label}: ${p.value}`).join('. ')}`}>
  <text x="58" y="20" fontSize="13" fill="currentColor">{unit}</text>
  {Array.from({length:max/(step/2)+1},(_,i)=>i*step/2).map(v=><g key={v}><line x1="58" x2="378" y1={y(v)} y2={y(v)} stroke="currentColor" opacity={v%step===0?.22:.09}/>{v%step===0&&<text x="48" y={y(v)+4} textAnchor="end" fontSize="12" fill="currentColor">{v}</text>}</g>)}
  <path d="M58 46V246H378" fill="none" stroke="currentColor"/>
  <polyline points={points.map((p,i)=>`${x(i)},${y(p.value)}`).join(' ')} fill="none" stroke="#3279bd" strokeWidth="3"/>
  {points.map((p,i)=><g key={p.label}><circle data-line-time={p.label} data-line-value={p.value} cx={x(i)} cy={y(p.value)} r="5" fill="#3279bd" stroke="white" strokeWidth="1.5"/><text x={x(i)} y="266" textAnchor="middle" fontSize="12" fill="currentColor">{p.label}</text></g>)}
  <text x="218" y="291" textAnchor="middle" fontSize="13" fill="currentColor">Time</text>
 </svg>;
}
