"use client";
import {getRealmTheme} from '@/lib/useRealmTheme';
import {useEffect,useState} from 'react';
import {fetchSpaceExtensionAssessments,type NormalizedAssessmentAttempt} from '@/lib/realm-progress-compat';
import {comparableAssessmentGrowth} from '@/lib/assessment-growth';
import AssessmentReplay from './AssessmentReplay';
const theme=getRealmTheme('space');
export default function SpaceExtensionReport(props:{studentId:string;studentName:string}){return <div className="space-y-4"><ExtensionLevelReport {...props} level={7}/><ExtensionLevelReport {...props} level={8}/></div>;}
function ExtensionLevelReport({studentId,studentName,level}:{studentId:string;studentName:string;level:7|8}){
 const [attempts,setAttempts]=useState<NormalizedAssessmentAttempt[]>([]),[selected,setSelected]=useState<NormalizedAssessmentAttempt|null>(null),[error,setError]=useState('');
 useEffect(()=>{let cancelled=false;void fetchSpaceExtensionAssessments(studentId,level).then(rows=>{if(!cancelled)setAttempts(rows);}).catch(e=>{if(!cancelled)setError(e.message);});return()=>{cancelled=true;};},[studentId,level]);
 if(error)return <p role="alert">Level {level} assessment history could not load: {error}</p>;
 if(!attempts.length)return null;
 const growth=comparableAssessmentGrowth(attempts,'space',`Year ${level}`);
 return <section style={{borderColor:theme.borderRing}} className="rounded-2xl border  bg-white p-4"><h3 className="font-bold text-slate-900">Level {level} Space · Assessment growth</h3><p className="mt-2 text-sm text-slate-700">Pre-test: {growth.baseline?`${growth.baseline.scorePercent}%`:'—'} · Post-test: {growth.post?`${growth.post.scorePercent}%`:'—'} · Growth: {growth.change==null?'Awaiting a matched pair':`${growth.change>0?'+':''}${growth.change} percentage points`}</p>{selected?<AssessmentReplay attempt={selected} studentName={studentName} backLabel={`Back to Level ${level} attempts`} onBack={()=>setSelected(null)}/>:<div className="mt-3 flex flex-wrap gap-2">{attempts.map(a=><button key={a.id} onClick={()=>setSelected(a)} className="rounded-lg border  px-3 py-2 text-sm font-bold text-stone-900">{a.assessmentType==='pretest'?'Pre-Test':'Post-Test'} · {a.correctCount}/{a.totalQuestions} · {new Date(a.completedAt).toLocaleDateString('en-AU')}</button>)}</div>}</section>;
}
