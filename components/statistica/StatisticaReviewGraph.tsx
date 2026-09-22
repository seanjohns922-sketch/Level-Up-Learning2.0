import type {Category} from '@/data/assessments/revisions/level1StatisticaFiveForms';
import ObjectArt from './StatisticaObjectArt';
import styles from '@/components/demo/StatisticaFiveForms.module.css';

/** Unit scale is fixed, independent of the correct answer or student's edits. */
export default function StatisticaReviewGraph({categories,values,kind,order=[0,1,2,3]}:{categories:Category[];values:number[];kind:'pictures'|'columns';order?:number[]}){
 const baseline=234,unit=17;
 return <svg className={styles.reviewGraph} viewBox="0 0 360 270" role="img" aria-label={`${kind==='pictures'?'Picture':'Column'} graph. ${order.map(i=>`${categories[i].name}: ${values[i]}`).join('. ')}`}>
  <text x="12" y="15" fill="currentColor" fontSize="12">Answers</text>
  {Array.from({length:13},(_,n)=><g key={n}><line x1="35" x2="350" y1={baseline-n*unit} y2={baseline-n*unit} stroke="currentColor" opacity={n===0?.65:.13}/><text x="28" y={baseline-n*unit+4} textAnchor="end" fill="currentColor" fontSize="12">{n}</text></g>)}
  {order.map((i,k)=>{const c=categories[i],x=73+k*78;return <g key={c.name} data-graph-category={c.name} data-graph-value={values[i]}>
   {kind==='columns'?<rect x={x-20} y={baseline-values[i]*unit} width="40" height={values[i]*unit} rx="2" fill={c.color} stroke="currentColor" strokeWidth="1"/>:Array.from({length:values[i]},(_,j)=><foreignObject key={j} x={x-11} y={baseline-(j+1)*unit} width="22" height={unit}><span className={styles.graphPicture}><ObjectArt name={c.name} color={c.color} size={unit}/></span></foreignObject>)}
   <text x={x} y="253" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="600">{c.name}</text>
  </g>;})}
 </svg>;
}
