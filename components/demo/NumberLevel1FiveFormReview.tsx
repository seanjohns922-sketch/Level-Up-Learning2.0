"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AssessmentShell from "@/components/assessment/AssessmentShell";
import AssessmentQuestionCard from "@/components/assessment/AssessmentQuestionCard";
import ReadAloudBtn, { ReadAloudRateProvider } from "@/components/ReadAloudBtn";
import { isAssessmentAnswerCorrect } from "@/data/assessments/analysis";
import { NUMBER_LEVEL1_FIVE_FORMS, NUMBER_LEVEL1_FORMS, NUMBER_LEVEL1_FORM_LABELS, type NumberLevel1Form } from "@/data/assessments/revisions/year1NumberFiveForms";

const buttonClass = "min-h-11 rounded-lg border border-teal-700 px-4 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300";

/** Protected author review: component state only; no learner writes or progression calls. */
export default function NumberLevel1FiveFormReview() {
  const router = useRouter();
  const params = useSearchParams();
  const requestedForm = params.get("form");
  const form: NumberLevel1Form = NUMBER_LEVEL1_FORMS.find(f => f === requestedForm) ?? "posttest";
  const requestedQuestion = Number(params.get("question") ?? 1);
  const index = Number.isInteger(requestedQuestion) ? Math.max(0,Math.min(19,requestedQuestion-1)) : 0;
  const [answers,setAnswers] = useState<Record<string,string>>({});
  const [showAnswer,setShowAnswer] = useState(false);
  const [finished,setFinished] = useState<Partial<Record<NumberLevel1Form,boolean>>>({});
  const questions = NUMBER_LEVEL1_FIVE_FORMS[form];
  const question = questions[index];
  const value = answers[question.id] ?? "";
  const correct = questions.filter(q => isAssessmentAnswerCorrect(q,answers[q.id])).length;
  const answered = questions.filter(q => Boolean(answers[q.id])).length;
  function select(nextForm: NumberLevel1Form, nextIndex: number) {
    setShowAnswer(false);
    router.replace(`/demo-review/number-level-1?form=${nextForm}&question=${nextIndex+1}`, {scroll:false});
  }
  return <ReadAloudRateProvider>
    <div className="bg-[#001b18] px-4 pb-4 pt-20 text-white md:pt-4">
      <section className="mx-auto max-w-6xl space-y-3" aria-label="Five-form review controls">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-black">Number Nexus · Level 1 · Five-form review</h1>
          <span className="text-sm text-teal-100">Review only · Student results are not saved</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {NUMBER_LEVEL1_FORMS.map(f => <button key={f} type="button" aria-pressed={form===f} onClick={()=>select(f,index)} className={`${buttonClass} ${form===f ? "bg-teal-200 text-teal-950" : "bg-teal-950 text-teal-50"}`}>{NUMBER_LEVEL1_FORM_LABELS[f]}</button>)}
          <label className="ml-auto flex items-center gap-2 text-sm font-bold">Question
            <select aria-label="Review question" value={index} onChange={event=>select(form,Number(event.target.value))} className="min-h-11 rounded-lg border border-teal-700 bg-teal-950 px-3 text-white">
              {questions.map((q,i)=><option key={q.id} value={i}>{i+1} — {q.skillLabel}</option>)}
            </select>
          </label>
        </div>
        <p className="text-sm text-teal-100/80">Switch forms to compare the same skill. You can move freely between all 20 questions.</p>
      </section>
    </div>
    <AssessmentShell
      testType={NUMBER_LEVEL1_FORM_LABELS[form]}
      year="Year 1" realmId="number" currentIndex={index} totalQuestions={questions.length}
      subtitle="Matched Level 1 forms · Manual review"
      questionPrompt={question.prompt}
      promptAction={<ReadAloudBtn text={question.prompt}/>}
      questionContent={<>
        <AssessmentQuestionCard key={question.id} question={question} value={value} onChange={answer=>setAnswers(previous=>({...previous,[question.id]:answer}))} realmId="number"/>
        <details className="mt-5 rounded-lg border border-teal-700 p-4 text-teal-50">
          <summary className="cursor-pointer font-bold">Review details</summary>
          <p className="mt-3 text-sm">{question.primaryDescriptorCode} · {question.skillLabel} · Intended difficulty: {question.difficulty}</p>
          <button type="button" className={`${buttonClass} mt-3 bg-teal-950`} onClick={()=>setShowAnswer(previous=>!previous)}>{showAnswer ? "Hide answer" : "Show answer"}</button>
          {showAnswer ? <p className="mt-3 font-bold">Answer: {question.correctAnswer}{value ? ` · Your answer: ${isAssessmentAnswerCorrect(question,value) ? "correct" : "incorrect"}` : ""}</p> : null}
        </details>
        {finished[form] ? <div role="status" className="mt-5 rounded-lg border border-teal-500 bg-teal-950 p-4 text-teal-50">
          <p className="font-bold">{NUMBER_LEVEL1_FORM_LABELS[form]} review: {correct}/20 ({correct*5}%)</p>
          <p className="mt-1 text-sm">{answered}/20 answered. Nothing was saved to a student record. Select another form above to continue.</p>
        </div> : null}
      </>}
      answeredFlags={questions.map(q=>Boolean(answers[q.id]))}
      onJump={i=>select(form,i)} reviewNavigation
      hasAnswer={true} isLast={index===19}
      onBack={()=>select(form,Math.max(0,index-1))} onNext={()=>select(form,Math.min(19,index+1))}
      onSubmit={()=>setFinished(previous=>({...previous,[form]:true}))}
      onExit={()=>router.push("/demo-review?realm=number&year=Year%201")}
    />
  </ReadAloudRateProvider>;
}
