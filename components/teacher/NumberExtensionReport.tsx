"use client";
import {useEffect,useState} from 'react';
import {fetchNumberExtensionAssessments,type NormalizedAssessmentAttempt} from '@/lib/realm-progress-compat';
import {comparableAssessmentGrowth} from '@/lib/assessment-growth';
import AssessmentReplay from './AssessmentReplay';
export default function NumberExtensionReport({studentId,studentName}:{studentId:string;studentName:string}){
 const [attempts,setAttempts]=useState<NormalizedAssessmentAttempt[]>([]),[selected,setSelected]=useState<NormalizedAssessmentAttempt|null>(null),[error,setError]=useState('');
 useEffect(()=>{let cancelled=false;void fetchNumberExtensionAssessments(studentId).then(rows=>{if(!cancelled)setAttempts(rows);}).catch(e=>{if(!cancelled)setError(e.message);});return()=>{cancelled=true;};},[studentId]);
 if(error)return <p role="alert">Level 7 assessment history could not load: {error}</p>;
 if(!attempts.length)return null;
 const growth=comparableAssessmentGrowth(attempts,'number','Year 7');
 return <section className="rounded-2xl border border-teal-200 bg-white p-4"><h3 className="font-bold text-slate-900">Level 7 Number · Assessment growth</h3><p className="mt-2 text-sm text-slate-700">Pre-test: {growth.baseline?`${growth.baseline.scorePercent}%`:'—'} · Post-test: {growth.post?`${growth.post.scorePercent}%`:'—'} · Growth: {growth.change==null?'Awaiting a matched pair':`${growth.change>0?'+':''}${growth.change} percentage points`}</p>{selected?<AssessmentReplay attempt={selected} studentName={studentName} backLabel="Back to Level 7 attempts" onBack={()=>setSelected(null)}/>:<div className="mt-3 flex flex-wrap gap-2">{attempts.map(a=><button key={a.id} onClick={()=>setSelected(a)} className="rounded-lg border border-teal-300 px-3 py-2 text-sm font-bold text-teal-900">{a.assessmentType==='pretest'?'Pre-Test':'Post-Test'} · {a.correctCount}/{a.totalQuestions} · {new Date(a.completedAt).toLocaleDateString('en-AU')}</button>)}</div>}</section>;
}
