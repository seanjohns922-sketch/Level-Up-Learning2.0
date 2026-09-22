import ObjectArt from './StatisticaObjectArt';
import type {Category} from '@/data/assessments/revisions/level1StatisticaFiveForms';
import styles from '@/components/demo/StatisticaFiveForms.module.css';
export function pictographSpeech(categories:Category[],values:number[],keyUnits:number){return `Key: one picture represents ${keyUnits}. ${categories.map((c,i)=>`${c.name}: ${Math.floor(values[i]/keyUnits)} whole pictures${values[i]%keyUnits?' and one half picture':''}`).join('. ')}.`;}
export default function StatisticaReviewPictograph({categories,values,keyUnits,symbolName,unitNoun,allowHalf=false}:{categories:Category[];values:number[];keyUnits:number;symbolName:string;unitNoun?:string;allowHalf?:boolean}){
 const picture=(half=false)=><span className={styles.picClip} style={{width:half?18:36}}><ObjectArt name={symbolName} color={symbolName==='Apple'?'#cf4545':symbolName==='Teddy'?'#b97d45':symbolName==='Kite'?'#b66ca2':'#3279bd'} size={36}/></span>;
 return <div className={styles.pictograph} role="img" aria-label={pictographSpeech(categories,values,keyUnits)}>
  <div className={styles.pictographKey}>{picture()}<span>= {keyUnits} {unitNoun}</span>{allowHalf&&<>{picture(true)}<span>= {keyUnits/2} {unitNoun}</span></>}</div>
  {categories.map((c,i)=><div className={styles.pictographRow} key={c.name} data-pictograph-category={c.name} data-symbol-count={values[i]/keyUnits}><strong>{c.name}</strong><div>{Array.from({length:Math.floor(values[i]/keyUnits)},(_,n)=><span key={n}>{picture()}</span>)}{values[i]%keyUnits!==0&&picture(true)}{values[i]===0&&<span>0 pictures</span>}</div></div>)}
 </div>;
}
