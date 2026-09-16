"use client";

import {formatMeasurelandsReviewAnswer,type MeasurelandsAnswerFormat} from "@/data/assessments/measurelandsPresentation";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AssessmentShell from "@/components/assessment/AssessmentShell";
import AssessmentQuestionCard from "@/components/assessment/AssessmentQuestionCard";
import ReadAloudBtn, { ReadAloudRateProvider } from "@/components/ReadAloudBtn";
import { getRealmTheme } from "@/lib/useRealmTheme";
import { isAssessmentAnswerCorrect } from "@/data/assessments/analysis";
import { MeasurelandsAssessmentTask } from "@/components/assessment/MeasurelandsAssessmentTask";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type CardQuestion = Parameters<typeof AssessmentQuestionCard>[0]["question"];
type ScoredQuestion = Parameters<typeof isAssessmentAnswerCorrect>[0];

export type FiveFormReviewItem = {
  id: string;
  prompt: string;
  readAloudText?: string;
  correctAnswer: string;
  answerFormat?: MeasurelandsAnswerFormat;
  skillLabel?: string;
  primaryDescriptorCode?: string;
  difficulty?: string;
  practiceTask?: PracticeTask;
};

const buttonClass = "min-h-11 rounded-lg border px-4 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 ";

/** Protected author review of matched forms: component state only; no learner writes or progression calls. */
export default function FiveFormAssessmentReview<Form extends string>({
  title,
  subtitle,
  year,
  realmId,
  basePath,
  exitHref,
  formOrder,
  labels,
  forms,
  defaultForm,
}: {
  title: string;
  subtitle: string;
  year: string;
  realmId: string;
  basePath: string;
  exitHref: string;
  formOrder: readonly Form[];
  labels: Record<Form, string>;
  forms: Record<Form, readonly FiveFormReviewItem[]>;
  defaultForm: Form;
}) {
  const theme = getRealmTheme(realmId);
  const panelStyle = { background: theme.cardSurface, color: theme.chipText, borderColor: theme.chipBorder };
  const buttonStyle = { ...panelStyle, outlineColor: theme.accentText };
  const router = useRouter();
  const params = useSearchParams();
  const requestedForm = params.get("form");
  const form: Form = formOrder.find((candidate) => candidate === requestedForm) ?? defaultForm;
  const questions = forms[form];
  const last = questions.length - 1;
  const requestedQuestion = Number(params.get("question") ?? 1);
  const index = Number.isInteger(requestedQuestion) ? Math.max(0, Math.min(last, requestedQuestion - 1)) : 0;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [finished, setFinished] = useState<Partial<Record<Form, boolean>>>({});
  const question = questions[index]!;
  const value = answers[question.id] ?? "";
  const scored = (item: FiveFormReviewItem) => isAssessmentAnswerCorrect(item as unknown as ScoredQuestion, answers[item.id]);
  const correct = questions.filter(scored).length;
  const answered = questions.filter((item) => Boolean(answers[item.id])).length;

  function select(nextForm: Form, nextIndex: number) {
    setShowAnswer(false);
    router.replace(`${basePath}?form=${nextForm}&question=${nextIndex + 1}`, { scroll: false });
  }

  return (
    <ReadAloudRateProvider>
      <div className="px-4 pb-4 pt-20 text-white md:pt-4" style={panelStyle}>
        <section className="mx-auto max-w-6xl space-y-3" aria-label="Five-form review controls">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-black">{title}</h1>
            <span className="text-sm" style={{color:theme.chipText}}>Review only · Student results are not saved</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {formOrder.map((candidate) => (
              <button key={candidate} type="button" aria-pressed={form === candidate} onClick={() => select(candidate, index)} className={buttonClass} style={form === candidate ? {...buttonStyle,background:theme.accentText,color:"#171208"} : buttonStyle}>
                {labels[candidate]}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-2 text-sm font-bold">Question
              <select aria-label="Review question" value={index} onChange={(event) => select(form, Number(event.target.value))} className="min-h-11 rounded-lg border px-3" style={{...buttonStyle, background: theme.isMeasurement ? "#241706" : "#10202a"}}>
                {questions.map((item, position) => <option key={item.id} value={position}>{position + 1} — {item.skillLabel}</option>)}
              </select>
            </label>
          </div>
          <p className="text-sm" style={{color:theme.accentTextSoft}}>Switch forms to compare the same skill. You can move freely between all {questions.length} questions.</p>
        </section>
      </div>
      <AssessmentShell
        testType={labels[form]}
        year={year}
        realmId={realmId}
        currentIndex={index}
        totalQuestions={questions.length}
        subtitle={subtitle}
        questionPrompt={question.prompt}
        promptAction={<ReadAloudBtn text={question.readAloudText ?? question.prompt} />}
        questionContent={<>
          {question.practiceTask ? (
            <MeasurelandsAssessmentTask
              key={question.id}
              questionId={question.id}
              task={question.practiceTask}
              value={value === "idk" ? "" : value}
              correctToken={question.correctAnswer}
              onRecord={(answer) => setAnswers((previous) => ({ ...previous, [question.id]: answer }))}
              onClear={() => setAnswers((previous) => ({ ...previous, [question.id]: "" }))}
            />
          ) : (
            <AssessmentQuestionCard key={question.id} question={question as unknown as CardQuestion} value={value === "idk" ? "" : value} onChange={(answer) => setAnswers((previous) => ({ ...previous, [question.id]: answer }))} realmId={realmId} />
          )}
          {value === "idk" ? <p role="status" className="mt-3" style={{color:theme.chipText}}>Marked “I don’t know”. You can still answer this question.</p> : null}
          <details className="mt-5 rounded-lg border p-4" style={panelStyle}>
            <summary className="cursor-pointer font-bold">Review details</summary>
            <p className="mt-3 text-sm">{question.primaryDescriptorCode} · {question.skillLabel} · Intended difficulty: {question.difficulty}</p>
            <button type="button" className={`${buttonClass} mt-3`} style={buttonStyle} onClick={() => setShowAnswer((previous) => !previous)}>{showAnswer ? "Hide answer" : "Show answer"}</button>
            {showAnswer ? <p className="mt-3 font-bold">{question.practiceTask ? "Expected response: complete the interactive task correctly." : `Answer: ${formatMeasurelandsReviewAnswer(question.correctAnswer,question.answerFormat)}`}{value ? ` · Your answer: ${scored(question) ? "correct" : "incorrect"}` : ""}</p> : null}
          </details>
          {finished[form] ? (
            <div role="status" className="mt-5 rounded-lg border p-4" style={panelStyle}>
              <p className="font-bold">{labels[form]} review: {correct}/{questions.length} ({Math.round((correct / questions.length) * 100)}%)</p>
              <p className="mt-1 text-sm">{answered}/{questions.length} answered. Nothing was saved to a student record. Select another form above to continue.</p>
            </div>
          ) : null}
        </>}
        answeredFlags={questions.map((item) => Boolean(answers[item.id]))}
        onJump={(position) => select(form, position)}
        reviewNavigation
        hasAnswer={true}
        isLast={index === last}
        onBack={() => select(form, Math.max(0, index - 1))}
        onNext={() => select(form, Math.min(last, index + 1))}
        onSubmit={() => setFinished((previous) => ({ ...previous, [form]: true }))}
        onIdk={() => { setAnswers(previous => ({...previous,[question.id]:"idk"})); if(index < last) select(form,index+1); else setFinished(previous=>({...previous,[form]:true})); }}
        onExit={() => router.push(exitHref)}
      />
    </ReadAloudRateProvider>
  );
}
