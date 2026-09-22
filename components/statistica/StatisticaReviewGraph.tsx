import type {Category} from '@/data/assessments/revisions/level1StatisticaFiveForms';
import ObjectArt from './StatisticaObjectArt';
import styles from '@/components/demo/StatisticaFiveForms.module.css';

/** The question fixes the scale; student edits never rescale the graph. */
export default function StatisticaReviewGraph({categories,values,kind,order=categories.map((_,i)=>i),max=12,step=1,axisLabel='Answers',valueLabel,numerical=false}:{categories:Category[];values:number[];kind:'pictures'|'columns';order?:number[];max?:number;step?:number;axisLabel?:string;valueLabel?:string;numerical?:boolean}){
 const baseline=234,unit=204/max;
 return <svg className={styles.reviewGraph} viewBox="0 0 360 290" role="img" aria-label={`${kind==='pictures'?'Picture':'Column'} graph. ${order.map(i=>`${categories[i].name}: ${values[i]}`).join('. ')}`}>
  <text x="12" y="15" fill="currentColor" fontSize="12">{axisLabel}</text>
  {Array.from({length:Math.floor(max/step)+1},(_,n)=><g key={n}><line x1="35" x2="350" y1={baseline-n*step*unit} y2={baseline-n*step*unit} stroke="currentColor" opacity={n===0?.65:.13}/><text x="28" y={baseline-n*step*unit+4} textAnchor="end" fill="currentColor" fontSize="12">{n*step}</text></g>)}
  {order.map((i,k)=>{const c=categories[i],x=35+(k+.5)*315/order.length;return <g key={c.name} data-graph-category={c.name} data-graph-value={values[i]}>
   {kind==='columns'?<rect x={x-20} y={baseline-values[i]*unit} width="40" height={values[i]*unit} rx="2" fill={c.color} stroke="currentColor" strokeWidth="1"/>:numerical?Array.from({length:values[i]},(_,j)=><circle key={j} cx={x} cy={baseline-(j+.5)*unit} r={Math.min(6,unit*.38)} fill={c.color}/>):Array.from({length:values[i]},(_,j)=><foreignObject key={j} x={x-11} y={baseline-(j+1)*unit} width="22" height={unit}><span className={styles.graphPicture}><ObjectArt name={c.name} color={c.color} size={unit}/></span></foreignObject>)}
   <text x={x} y="253" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="600">{c.name}</text>
  </g>;})}
 {valueLabel&&<text x="192" y="279" textAnchor="middle" fill="currentColor" fontSize="12">{valueLabel}</text>}
 </svg>;
}
