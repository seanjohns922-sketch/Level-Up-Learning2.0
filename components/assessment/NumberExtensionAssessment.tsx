"use client";
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import AssessmentShell from './AssessmentShell';
import AssessmentQuestionCard from './AssessmentQuestionCard';
import ReadAloudBtn,{ReadAloudRateProvider} from '../ReadAloudBtn';
import {YEAR7_NUMBER_RELEASED_FORMS} from '@/data/assessments/revisions/year7NumberReleasedForms';
import {isAssessmentAnswerCorrect} from '@/data/assessments/analysis';
import {buildAssessmentQuestionSnapshots} from '@/lib/assessment-replay';
import {assessmentSpokenPrompt} from '@/lib/assessment-spoken-prompt';
import {ACTIVE_STUDENT_KEY} from '@/data/progress';
import {isDemoPreviewMode} from '@/lib/demo-mode';
import {supabase} from '@/lib/supabase';
import {restoreStudentStateFromServer} from '@/lib/student-progress-sync';

type Draft={answers:Record<string,string>;index:number;completionId:string;startedAt:string};
export default function NumberExtensionAssessment({form}:{form:'pretest'|'posttest'}){
 const router=useRouter();const questions=YEAR7_NUMBER_RELEASED_FORMS[form];
 const [studentId,setStudentId]=useState<string|null>(null),[draft,setDraft]=useState<Draft|null>(null),[error,setError]=useState(''),[saving,setSaving]=useState(false),[done,setDone]=useState(false);
 const key=studentId?`number-extension-v1:${studentId}:${form}`:null;
 useEffect(()=>{let cancelled=false;async function load(){
  const id=localStorage.getItem(ACTIVE_STUDENT_KEY);
  if(isDemoPreviewMode()){router.replace(`/demo-review/number-level-7?form=${form}`);return;}
  if(!id){router.replace('/login');return;}
  const restored=await restoreStudentStateFromServer(id,'number');
  if(!['Year 6','Year 7'].includes(restored.progress?.year??''))throw new Error('Level 7 extension assessments are available from Level 6 Number.');
  if(form==='posttest'){
   const {data,error}=await supabase.rpc('get_student_realm_assessments_secure',{p_student_id:id,p_realm_id:'number',p_working_level:'Year 7'});
   if(error)throw error;if(!data?.some((a:{assessment_type:string})=>a.assessment_type==='pretest'))throw new Error('Complete the Level 7 pre-test before its post-test.');
  }
  let saved:Draft|null=null;try{saved=JSON.parse(localStorage.getItem(`number-extension-v1:${id}:${form}`)??'null');}catch{/* Start a fresh draft if browser storage is invalid. */}
  const valid=saved&&typeof saved.answers==='object'&&saved.answers!==null&&typeof saved.completionId==='string'&&typeof saved.startedAt==='string'&&Number.isInteger(saved.index)&&saved.index>=0&&saved.index<30;
  if(!cancelled){setStudentId(id);setDraft(valid?saved:{answers:{},index:0,completionId:crypto.randomUUID(),startedAt:new Date().toISOString()});}
 }void load().catch(e=>{if(!cancelled)setError(e.message??'Could not load your assessment.');});return()=>{cancelled=true;};},[form,router]);
 useEffect(()=>{if(key&&draft&&!done)localStorage.setItem(key,JSON.stringify(draft));},[key,draft,done]);
 async function finish(next:Draft){
  if(saving||!studentId||questions.some(q=>!next.answers[q.id]))return;
  setSaving(true);setError('');
  const completedAt=new Date().toISOString();
  const snapshots=buildAssessmentQuestionSnapshots(questions,q=>next.answers[q.id],(q,a)=>isAssessmentAnswerCorrect({...q,correctAnswer:String(q.correctAnswer)},String(a)),completedAt);
  try{
   const {error}=await supabase.rpc('complete_number_extension_assessment',{p_student_id:studentId,p_assessment_type:form,p_completion_key:next.completionId,p_attempt:{correct_count:snapshots.filter(q=>q.correct).length,total_questions:questions.length,question_results:snapshots,placement_result:{replay_metadata:{started_at:next.startedAt,completed_at:completedAt}}}});
   if(error)throw error;if(key)localStorage.removeItem(key);setDone(true);
  }catch(e){setError(e instanceof Error?e.message:'Your answers could not be saved. Please retry.');}finally{setSaving(false);}
 }
 if(done)return <main className="grid min-h-screen place-items-center bg-[#001b18] p-6 text-white"><div className="max-w-lg text-center"><h1 className="text-3xl font-black">Level 7 {form==='pretest'?'pre-test':'post-test'} saved</h1><p className="my-5">Your teacher can review your answers and progress.</p><button className="rounded-xl bg-teal-400 px-5 py-3 font-bold text-teal-950" onClick={()=>router.push('/world')}>Back to my world</button></div></main>;
 if(!draft)return <main className="grid min-h-screen place-items-center bg-[#001b18] p-6 text-white"><div>{error||'Loading your assessment…'}{error?<button className="ml-4 underline" onClick={()=>router.push('/world')}>Back</button>:null}</div></main>;
 const q=questions[draft.index],answered=questions.map(q=>Boolean(draft.answers[q.id]));
 function answer(value:string){setDraft(d=>d?{...d,answers:{...d.answers,[q.id]:value}}:d);}
 return <ReadAloudRateProvider><AssessmentShell testType={form==='pretest'?'Pre-Test':'Post-Test'} year="Year 7" realmId="number" currentIndex={draft.index} totalQuestions={30} subtitle="Number Nexus · Level 7 extension" questionPrompt={q.prompt} promptAction={<ReadAloudBtn text={assessmentSpokenPrompt(q)}/>} questionContent={<><AssessmentQuestionCard question={q} value={draft.answers[q.id]??null} onChange={answer} realmId="number"/>{error?<p role="alert" className="mt-4 rounded-lg bg-red-950 p-4 text-white">{error}</p>:null}{saving?<p role="status">Saving your assessment…</p>:null}</>} hasAnswer={answered[draft.index]&&!saving} isLast={draft.index===29} onBack={()=>{if(!saving)setDraft({...draft,index:Math.max(0,draft.index-1)});}} onNext={()=>{if(!saving&&answered[draft.index])setDraft({...draft,index:Math.min(29,draft.index+1)});}} onSubmit={()=>void finish(draft)} onExit={()=>router.push('/world')} onIdk={()=>{if(saving)return;const next={...draft,answers:{...draft.answers,[q.id]:'__i_dont_know__'}};setDraft(next);if(draft.index===29)void finish(next);else setDraft({...next,index:draft.index+1});}} answeredFlags={answered} onJump={index=>{if(!saving&&index>=0&&index<30&&(index===0||answered.slice(0,index).every(Boolean)))setDraft({...draft,index});}}/></ReadAloudRateProvider>;
}
