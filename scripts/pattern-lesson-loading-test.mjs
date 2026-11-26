import assert from 'node:assert/strict';
import React from 'react';
import { domHarness } from './test-support/react-dom-harness.mjs';
let releaseEngine, imports = 0, mounts = 0, engineProps;
const ready = new Promise(resolve => { releaseEngine = resolve; });
const h = domHarness({
  'next/dynamic': { __esModule: true, default: (loader, options) => {
    const Lazy = React.lazy(async () => { imports++; await ready; return { default: await loader() }; });
    return props => React.createElement(React.Suspense, { fallback: React.createElement(options.loading) }, React.createElement(Lazy, props));
  } },
  'next/navigation': { useRouter: () => ({ push() {} }) },
  '@/lib/demo-mode': { useDemoPreviewMode: () => true },
  '@/lib/student-progress-sync': { saveRealmLessonAttempt() { throw Error('No save before completion'); } },
  '@/lib/world3d/return-context': { getWorld3DReturnPathForLesson: () => null, preserveWorld3DReturnContextForLesson() {} },
  '@/components/lesson/NarratedLessonGuide': { __esModule: true, default: ({ children }) => children },
  '@/components/lesson/RealmActiveLessonShell': { RealmActiveLessonShell: ({ children }) => children },
  '@/components/lesson/RealmLessonHome': {
    RealmLessonHome: ({ onStart }) => React.createElement('button', { onClick: onStart }, 'Learn the skill'),
    LessonConceptIntro: () => React.createElement('p', null, 'Concept explanation'),
  },
  '@/data/programs/patternPeaks': { getPatternPeaksLessonConceptIntro: () => ({}) },
  '@/data/activities/patternPeaks/generator': { generatePatternPeaksQuestion: () => 'same-generator', isPatternPeaksQuestion: () => true },
  '@/components/lesson/Year2LessonEngine': { Year2LessonEngine: props => {
    engineProps = props;
    React.useEffect(() => { mounts++; }, []);
    return React.createElement('div', { 'data-engine': true }, props.lesson.title);
  } },
});
try {
  const Shell = h.load('components/pattern-peaks/PatternPeaksLessonShell.tsx').default;
  const lesson = { id: 'pattern-3-1-1', title: 'Patterns', focus: 'Find the rule', week: 1, lesson: 1 };
  await h.render(Shell, { level: 'Year 3', levelNumber: 3, week: 1, lesson });
  assert.equal(imports, 0, 'Home does not request the engine');
  await h.click([...h.document.querySelectorAll('button')].find(b => b.textContent === 'Learn the skill'));
  assert(h.document.body.textContent.includes('Concept explanation'));
  assert.equal(imports, 0, 'Guide does not request the engine');
  await h.click([...h.document.querySelectorAll('button')].find(b => b.textContent.includes('Start the Challenge')));
  assert.equal(imports, 1, 'Starting the challenge requests the engine once');
  assert(h.document.querySelector('[role="status"]')?.textContent.includes('Preparing your lesson'));
  assert.equal(mounts, 0, 'Engine timers cannot mount while its module is loading');
  await h.act(async () => { releaseEngine(); });
  assert(h.document.querySelector('[data-engine]'));
  assert(!h.document.querySelector('[role="status"]'));
  assert.strictEqual(engineProps.lesson, lesson);
  assert.equal(engineProps.realmId, 'pattern');
  assert.equal(engineProps.levelNumber, 3);
  assert.equal(engineProps.questionGenerator(), 'same-generator');
  assert.equal(engineProps.isQuestionCompatible(), true);
  assert.equal(typeof engineProps.onTimedComplete, 'function');
  assert.strictEqual(engineProps.onTimedComplete, engineProps.onExit);
  console.log('PASS Pattern lesson home/guide defer engine, loading precedes engine mount, and question/completion props are preserved.');
} finally { await h.close(); }
