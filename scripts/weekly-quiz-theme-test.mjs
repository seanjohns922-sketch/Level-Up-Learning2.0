import assert from 'node:assert/strict';
import { URLSearchParams } from 'node:url';
import fs from 'node:fs';
import React from 'react';
import { domHarness } from './test-support/react-dom-harness.mjs';
import { LEVEL8_WEEK_COUNTS } from '../lib/level8-config.ts';
import { LEVEL8_PROGRAMS } from '../data/activities/level8/program.ts';
import { getRealmTheme } from '../lib/useRealmTheme.ts';
const noWrite = () => { throw Error('Presentation review must not write student progress'); };
const h = domHarness({
 'next/navigation': { useRouter: () => ({ push() {} }), useSearchParams: () => new URLSearchParams('review=1') },
 '@/lib/demo-mode': { useDemoPreviewMode: () => true },
 '@/lib/program-progress': { markQuizComplete: noWrite },
 '@/lib/studentIdentity': { getActiveStudentIdentity: () => ({ studentId: null }) },
 '@/lib/student-progress-sync': { restoreStudentStateFromServer: noWrite, saveNumberWeeklyQuizAttempt: noWrite },
 '@/lib/starpath-demo-state': { writeStarpathDemoJourney: noWrite },
 '@/lib/world3d/return-context': { getWorld3DReturnPathForQuiz: () => null },
 '@/components/lesson/RealmLessonHome': { getRealmLessonArtwork: () => '' },
 '@/components/TaskRenderer': { TaskRenderer: ({ callbacks }) => React.createElement('div', null, React.createElement('button', { onClick: () => callbacks.recordAssessmentAnswer(false, 'B') }, 'Choose B'), React.createElement('button', { onClick: () => callbacks.recordAssessmentAnswer(true, 'A') }, 'Choose A')) },
});
const storage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: h.document.defaultView.localStorage });
try {
 const Quiz = h.load('components/starpath/StarpathVoyageQuiz.tsx').default;
 const button = text => [...h.document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith(text));
 function verify(realm) {
  const root = h.document.querySelector('main[data-quiz-realm]');
  assert.equal(root.dataset.quizRealm, realm);
  assert.equal(root.style.getPropertyValue('--quiz-hero'), getRealmTheme(realm).cardSurface);
  assert(root.style.getPropertyValue('--quiz-action').includes(getRealmTheme(realm).ctaFrom));
  // A literal Starpath class in this shared shell was the original leak.
  for (const el of root.querySelectorAll('[class]')) assert(!/(?:violet|indigo|cyan)-\d/.test(el.className?.baseVal ?? el.className), `Foreign shell colour in ${realm}: ${el.className}`);
 }
 let count = 0;
 for (const [realm, weeks] of Object.entries(LEVEL8_WEEK_COUNTS)) {
  for (let week=1; week<weeks; week++) {
   const plan=LEVEL8_PROGRAMS[realm][week-1];
   const tasks=Array.from({length:15},()=>({kind:'level8Question',realm,prompt:'Choose a number.',answer:'A',options:[{id:'A',label:'A'},{id:'B',label:'B'}],feedback:{wrong:'Try A.'}}));
   await h.render(Quiz,{key:`${realm}-${week}`,realm,tasks,quiz:{level:'Year 8',levelLabel:'Level 8',week,title:plan.topic,coverage:'Weekly review',lessonTitles:plan.lessons.map(l=>l.title),lessonSkillIds:[['a'],['b'],['c']],lessonCurriculumCodes:[[],[],[]],weekHref:'/week'}});
   verify(realm); count++;
   if(week!==1) continue;
   await h.click(button('Begin Quiz'));
   assert(button('Next').disabled, 'Next is disabled until an answer is recorded');
   assert([...h.document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Back').disabled, 'First question cannot go backwards');
   for(let i=0;i<15;i++){
    await h.click(button('Choose B')); verify(realm);
    if(i<14) await h.click(button('Next'));
   }
   await h.click(button('Finish Quiz')); verify(realm);
   assert(h.document.body.textContent.includes('Keep exploring!'));
   await h.click(button('Review Answers')); verify(realm);
   assert(h.document.body.textContent.includes('Questions to revisit'));
   await h.click(button('Back to Results'));
   await h.click(button('Retry Quiz')); verify(realm);
   for(let i=0;i<15;i++){await h.click(button('Choose A'));if(i<14)await h.click(button('Next'));}
   await h.click(button('Finish Quiz')); verify(realm);
   assert(h.document.body.textContent.includes('15/15 correctly'));
   assert(h.document.querySelector('.bg-\\[image\\:var\\(--quiz-action\\)\\]'), 'Passed score uses realm action colour');
  }
 }
 const choice=fs.readFileSync('components/starpath/Space7ChoiceCard.tsx','utf8');
 assert(choice.includes('getRealmTheme(realm)') && choice.includes('selected===option?theme.ctaFrom'));
 const shell=fs.readFileSync('components/starpath/StarpathVoyageQuiz.tsx','utf8');
 assert(!/className=\{[^\n]*(isStatistica|isPattern|isChance)\s*\?/.test(shell),'No per-realm style fallback ladders');
 console.log(`PASS: ${count} Level 8 weekly quiz intros across six realms; answer, navigation, retry, results and review retain their realm theme without progress writes.`);
} finally {
 if(storage)Object.defineProperty(globalThis,'localStorage',storage);else delete globalThis.localStorage;
 await h.close();
}
