import styles from '@/components/demo/StatisticaFiveForms.module.css';

/** One observed tray, not an aggregate frequency or an answer hint. */
export default function StatisticaSeedlingTray({count}:{count:number}){
 return <div className={styles.seedlingTray} data-observed-seedlings={count}>
  <svg viewBox="0 0 112 58" aria-hidden="true">
   <path d="M7 36h98l-7 17H14Z" fill="#bc7950" stroke="#704a32" strokeWidth="2"/>
   <path d="M9 36h94v6H9Z" fill="#68452e"/>
   {Array.from({length:count},(_,i)=><g key={i} data-seedling transform={`translate(${20+i*24},0)`}>
    <path d="M0 37V17" fill="none" stroke="#367a42" strokeWidth="3"/>
    <path d="M0 26C-12 26-13 17-12 12 0 12 3 18 0 26Z" fill="#64a957" stroke="#367a42"/>
    <path d="M0 20C11 20 13 11 11 7 1 7-2 13 0 20Z" fill="#83bb65" stroke="#367a42"/>
   </g>)}
  </svg>
  <strong>{count===0?'0 seedlings · empty':`${count} seedling${count===1?'':'s'}`}</strong>
 </div>;
}
