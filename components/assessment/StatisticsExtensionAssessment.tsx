"use client";

import {getRealmTheme} from '@/lib/useRealmTheme';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import AssessmentShell from './AssessmentShell';
import AssessmentQuestionCard from './AssessmentQuestionCard';
import {ReadAloudRateProvider} from '../ReadAloudBtn';
import {releasedStatisticaQuestions} from '@/data/assessments/releases/statistica';
import {readyReleasedStatistica} from '@/lib/statistica-release-response';
import {isAssessmentAnswerCorrect} from '@/data/assessments/analysis';
import {buildAssessmentQuestionSnapshots} from '@/lib/assessment-replay';
import {ACTIVE_STUDENT_KEY} from '@/data/progress';
import {isDemoPreviewMode} from '@/lib/demo-mode';
import {supabase} from '@/lib/supabase';
import {restoreStudentStateFromServer} from '@/lib/student-progress-sync';

const draftKey=(id:string,form:string,level:7|8)=>level===7?`statistics-extension-v3:${id}:${form}`:`statistics-extension-v3:${id}:8:${form}`;
type Draft={answers:Record<string,string>;index:number;completionId:string;startedAt:string};
const theme=getRealmTheme('statistics');
export default function StatisticsExtensionAssessment({form,level=7}:{form:'pretest'|'posttest';level:7|8}){
 const router=useRouter();const year=`Year ${level}`;const questions=releasedStatisticaQuestions(year,form);

 const [studentId,setStudentId]=useState<string|null>(null),[draft,setDraft]=useState<Draft|null>(null),[error,setError]=useState(''),[saving,setSaving]=useState(false),[done,setDone]=useState(false);
 const key=studentId?draftKey(studentId,form,level):null;
 useEffect(()=>{let cancelled=false;async function load(){
  const id=localStorage.getItem(ACTIVE_STUDENT_KEY);
  if(isDemoPreviewMode()){router.replace(`/demo-review/statistica-level${level}?form=${form}`);return;}
  if(!id){router.replace('/login');return;}
  const restored=await restoreStudentStateFromServer(id,'statistics');
  if(!['Year 6','Year 7','Year 8'].includes(restored.progress?.year??''))throw new Error('Extension assessments are available from Level 6 Statistics.');
  if(form==='posttest'){
   const {data,error}=await supabase.rpc('get_student_realm_assessments_secure',{p_student_id:id,p_realm_id:'statistics',p_working_level:year});
   if(error)throw error;if(!data?.some((a:{assessment_type:string})=>a.assessment_type==='pretest'))throw new Error('Complete this level’s pre-test before its post-test.');
  }
  let saved:Draft|null=null;try{saved=JSON.parse(localStorage.getItem(draftKey(id,form,level))??'null');}catch{/* Start a fresh draft if browser storage is invalid. */}
  const valid=saved&&typeof saved.answers==='object'&&saved.answers!==null&&typeof saved.completionId==='string'&&typeof saved.startedAt==='string'&&Number.isInteger(saved.index)&&saved.index>=0&&saved.index<30;
  if(!cancelled){setStudentId(id);setDraft(valid?saved:{answers:{},index:0,completionId:crypto.randomUUID(),startedAt:new Date().toISOString()});}
 }void load().catch(e=>{if(!cancelled)setError(e.message??'Could not load your assessment.');});return()=>{cancelled=true;};},[form,router,level,year]);
 useEffect(()=>{if(key&&draft&&!done)localStorage.setItem(key,JSON.stringify(draft));},[key,draft,done]);
 async function finish(next:Draft){
  if(saving||!studentId||questions.some(q=>!readyReleasedStatistica(q,next.answers[q.id])))return;
  setSaving(true);setError('');
  const completedAt=new Date().toISOString();
  const snapshots=buildAssessmentQuestionSnapshots(questions,q=>next.answers[q.id],(q,a)=>isAssessmentAnswerCorrect({...q,correctAnswer:String(q.correctAnswer)},String(a)),completedAt);
  try{
   const {error}=await supabase.rpc('complete_statistics_extension_assessment',{p_student_id:studentId,p_assessment_type:form,p_completion_key:next.completionId,p_attempt:{working_level:year,correct_count:snapshots.filter(q=>q.correct).length,total_questions:questions.length,question_results:snapshots,placement_result:{replay_metadata:{started_at:next.startedAt,completed_at:completedAt}}}});
   if(error)throw error;if(key)localStorage.removeItem(key);setDone(true);
  }catch(e){setError(e instanceof Error?e.message:'Your answers could not be saved. Please retry.');}finally{setSaving(false);}
 }
 if(done)return <main style={{background:theme.cardSurface,color:theme.accentTextSoft}} className="grid min-h-screen place-items-center  p-6 text-white"><div className="max-w-lg text-center"><h1 className="text-3xl font-black">Level {level} {form==='pretest'?'pre-test':'post-test'} saved</h1><p className="my-5">Your teacher can review your answers and progress.</p><button style={{background:theme.ctaGradientCss}} className="rounded-xl  px-5 py-3 font-bold text-stone-950" onClick={()=>router.push('/world')}>Back to my world</button></div></main>;
 if(!draft)return <main style={{background:theme.cardSurface,color:theme.accentTextSoft}} className="grid min-h-screen place-items-center  p-6 text-white"><div>{error||'Loading your assessment…'}{error?<button style={{background:theme.ctaGradientCss}} className="ml-4 underline" onClick={()=>router.push('/world')}>Back</button>:null}</div></main>;
 const q=questions[draft.index],answered=questions.map(q=>readyReleasedStatistica(q,draft.answers[q.id]));
 function answer(value:string){if(saving)return;setDraft(d=>d?{...d,answers:{...d.answers,[q.id]:value}}:d);}
 return <ReadAloudRateProvider rate={0.85}><AssessmentShell testType={form==='pretest'?'Pre-Test':'Post-Test'} year={year} realmId="statistics" currentIndex={draft.index} totalQuestions={30} subtitle={`Statistica · Level ${level} extension`} hidePrompt wideContent questionPrompt={q.prompt} questionContent={<><AssessmentQuestionCard question={q} value={draft.answers[q.id]==='idk'?null:draft.answers[q.id]??null} onChange={answer} realmId="statistics"/>{draft.answers[q.id]==='idk'?<p className="mt-3 ">Marked “I don’t know”. You can still answer this question.</p>:null}{error?<p role="alert" className="mt-4 rounded-lg bg-red-950 p-4 text-white">{error}</p>:null}{saving?<p role="status">Saving your assessment…</p>:null}</>} hasAnswer={answered[draft.index]&&!saving} isLast={draft.index===29} onBack={()=>{if(!saving)setDraft({...draft,index:Math.max(0,draft.index-1)});}} onNext={()=>{if(!saving&&answered[draft.index])setDraft({...draft,index:Math.min(29,draft.index+1)});}} onSubmit={()=>void finish(draft)} onExit={()=>router.push('/world')} onIdk={()=>{if(saving)return;const next={...draft,answers:{...draft.answers,[q.id]:'idk'}};setDraft(next);if(draft.index===29)void finish(next);else setDraft({...next,index:draft.index+1});}} answeredFlags={answered} onJump={index=>{if(!saving&&index>=0&&index<30&&(index===0||answered.slice(0,index).every(Boolean)))setDraft({...draft,index});}}/></ReadAloudRateProvider>;
}
