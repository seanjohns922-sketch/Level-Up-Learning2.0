'use client';
import type {Flow7} from '@/data/assessments/revisions/level7StarpathFiveForms';
import styles from './Level7StarpathAssessmentCard.module.css';

type Props={tree:Flow7;choices?:string[];answers?:string[];onDecision?:(slot:number,value:string)=>void};
/** Branches keep their labels and connectors when they stack on small screens. */
export default function Level7Flowchart({tree,choices,answers,onDecision}:Props){
 if(typeof tree==='string')return <div className={styles.flowOutput}>{tree}</div>;
 const editable=tree.slot!==undefined&&onDecision;
 return <div className={styles.flowTree}>
  <div className={styles.flowDecision}>
   {editable?<label>{tree.question}<select aria-label={tree.question} value={answers?.[tree.slot!]??''} onChange={e=>onDecision(tree.slot!,e.target.value)}><option value="">Choose question</option>{choices?.map(choice=><option key={choice}>{choice}</option>)}</select></label>:tree.question}
  </div>
  <div className={styles.flowBranches}>{(['yes','no'] as const).map(branch=><div className={styles.flowBranch} key={branch}>
   <span className={styles.flowArrow}>{branch==='yes'?'Yes':'No'} <span aria-hidden="true">↓</span></span>
   <Level7Flowchart tree={tree[branch]} choices={choices} answers={answers} onDecision={onDecision}/>
  </div>)}</div>
 </div>;
}
