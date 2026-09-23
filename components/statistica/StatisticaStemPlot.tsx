import styles from '@/components/demo/StatisticaFiveForms.module.css';
export default function StatisticaStemPlot({values}:{values:number[]}){
 const stems=Array.from(new Set(values.map(v=>Math.floor(v/10)))).sort((a,b)=>a-b);
 return <table className={styles.frequencyTable} aria-label="Ordered stem-and-leaf plot"><thead><tr><th scope="col">Stem</th><th scope="col">Leaves</th></tr></thead><tbody>{stems.map(stem=><tr key={stem} data-stem={stem}><th scope="row">{stem}</th><td style={{fontFamily:'monospace',letterSpacing:'.15em'}}>{values.filter(v=>Math.floor(v/10)===stem).map(v=>v%10).sort((a,b)=>a-b).join(' ')}</td></tr>)}</tbody></table>;
}
