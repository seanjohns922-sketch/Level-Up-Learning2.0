import assert from 'node:assert/strict';
import { domHarness } from './test-support/react-dom-harness.mjs';
const h = domHarness();
try {
  const { MeasurelandsBalanceScaleCard: Card } = h.load('components/measurelands/MeasurelandsBalanceScaleCard.tsx');
  let correct = 0, wrong = 0;
  const props = { onCorrect: () => correct++, onWrong: () => wrong++ };
  const item = (id, weight) => ({ id, label: id, icon: '●', weight });
  const task = { kind: 'balanceScale', prompt: 'Balance the scale', target: 'right', leftItems: [item('rock', 2)], rightItems: [], supply: { mode: 'pile', items: [item('cube', 1)] } };
  await h.render(Card, { ...props, task: { ...task, demo: true } });
  await h.render(Card, { ...props, task }); // Switching modes must not change hook order.
  const add = [...h.document.querySelectorAll('button')].find(b => b.textContent.includes('Add a cube'));
  add.focus(); await h.click(add);
  assert.equal(h.document.activeElement, add, 'Adding a unit must preserve focus');
  assert.equal(correct, 0);
  await h.click(add);
  assert(add.disabled, 'Solved pile must lock immediately');
  await h.flushTimers(); assert.equal(correct, 1, 'Strict Mode must award exactly once');
  await h.render(Card, { ...props, task: { ...task, judge: true } });
  await h.render(Card, { ...props, task });
  const freshAdd = [...h.document.querySelectorAll('button')].find(b => b.textContent.includes('Add a cube'));
  assert(!freshAdd.disabled, 'Re-entering pile scene must start fresh');
  await h.click(freshAdd); await h.click(freshAdd);
  await h.render(Card, { ...props, task: { ...task, demo: true } });
  await h.flushTimers(); assert.equal(correct, 1, 'Leaving a solved scene cancels its pending completion');
  await h.render(Card, { ...props, task: { ...task, supply: { mode: 'shelf', items: [item('wrong', 1), item('right', 2)] } } });
  await h.click([...h.document.querySelectorAll('button')].find(b => b.textContent.includes('wrong')));
  await h.flushTimers(); assert.equal(wrong, 1); assert.equal(correct, 1);
  console.log('PASS: balance mode transitions, focus, one-shot completion, timer cleanup and wrong-answer scoring');
} finally { await h.close(); }

for (const [file, name, unit, otherUnit, binLabel, otherLabel] of [
  ['MeasurelandsCapacityCard', 'MeasurelandsCapacityCard', 'mL', 'L', 'Millilitres', 'Litres'],
  ['MeasurelandsDurationCard', 'MeasurelandsDurationCard', 's', 'hr', 'Seconds', 'Hours'],
  ['MeasurelandsMassUnitCard', 'MeasurelandsMassUnitCard', 'g', 'kg', 'Grams', 'Kilograms'],
  ['MeasurelandsRulerCard', 'MeasurelandsMetreCard', 'cm', 'm', 'Centimetres', 'Metres'],
]) {
  const dom = domHarness();
  try {
    const Card = dom.load(`components/measurelands/${file}.tsx`)[name];
    let correct = 0, wrong = 0;
    const task = { scene: 'sort', prompt: 'Sort', items: [{ label: 'Small object', unit, emoji: '●', icon: '●' }, { label: 'Large object', unit: otherUnit, emoji: '●', icon: '●' }] };
    await dom.render(Card, { task, onCorrect: () => correct++, onWrong: () => wrong++ });
    const find = label => [...dom.document.querySelectorAll('button')].find(b => new RegExp('\\b' + label + '\\b', 'i').test(b.textContent));
    const bin = find(binLabel), other = find(otherLabel);
    await dom.click(find('Small object'));
    bin.focus(); await dom.click(bin);
    assert.equal(find(binLabel), bin, `${file}: sorting must not remount bins`);
    assert.equal(dom.document.activeElement, bin, `${file}: focus must survive sorting`);
    assert.equal(correct, 0);
    await dom.click(find('Large object')); await dom.click(bin); assert.equal(wrong, 1);
    await dom.click(find('Large object')); await dom.click(other); assert.equal(correct, 1);
    console.log(`PASS: ${file} sorting, focus and correct/wrong callbacks`);
  } finally { await dom.close(); }
}

for (const [file, task, wrongLabel, rightLabel] of [
  ['MeasurelandsMetricConvertCard', { scene: 'compare', pairA: { value: 2, unit: 'm' }, pairB: { value: 150, unit: 'cm' } }, '150', '2 m'],
  ['MeasurelandsVolumeCard', { scene: 'compare', dims: { l: 3, w: 2, h: 2 }, dimsB: { l: 2, w: 2, h: 2 } }, 'Box B', 'Box A'],
]) {
  const dom = domHarness();
  try {
    const Card = dom.load(`components/measurelands/${file}.tsx`)[file];
    let correct = 0, wrong = 0;
    await dom.render(Card, { task: { ...task, prompt: 'Compare' }, onCorrect: () => correct++, onWrong: () => wrong++ });
    const find = label => [...dom.document.querySelectorAll('button')].find(b => b.textContent.includes(label));
    const button = find(wrongLabel); button.focus(); await dom.click(button);
    assert.equal(wrong, 1); assert.equal(dom.document.activeElement, button);
    await dom.flushTimers(); assert.equal(find(wrongLabel), button);
    await dom.click(find(rightLabel)); assert.equal(correct, 1);
    console.log(`PASS: ${file} feedback preserves controls and scoring`);
  } finally { await dom.close(); }
}

{
  const dom = domHarness();
  try {
    const { StarpathRouteBuildCard: Card } = dom.load('components/starpath/StarpathLevelOnePathCards.tsx');
    let wrong = 0;
    const task = { prompt: 'Build a route', speakText: 'Build a route', start: { r: 0, c: 0 }, goal: { r: 1, c: 1 }, rows: 2, cols: 2, palette: ['right'], maxSteps: 2, singleAttempt: true, feedback: { wrong: 'Try again', correct: 'Done' } };
    await dom.render(Card, { task, onComplete: () => assert.fail('Wrong route must not score'), onWrong: () => wrong++ });
    const find = label => [...dom.document.querySelectorAll('button')].find(b => b.textContent.includes(label));
    await dom.click(find('Right')); await dom.click(find('Run route'));
    await dom.flushTimers(); await dom.flushTimers();
    assert.equal(wrong, 1);
    for (const label of ['Right', 'Undo', 'Reset', 'Run route']) assert(find(label).disabled, `Single attempt must lock ${label}`);
    await dom.click(find('Run route')); await dom.flushTimers(); assert.equal(wrong, 1);
    console.log('PASS: route single-attempt lock updates controls and prevents repeat scoring');
  } finally { await dom.close(); }
}

{
  const dom = domHarness();
  try {
    const { MeasurelandsPathTaskCard: Card } = dom.load('components/measurelands/MeasurelandsPathTaskCard.tsx');
    let correct = 0, wrong = 0;
    const props = { onCorrect: () => correct++, onWrong: () => wrong++ };
    const first = { scene: 'estimateGuess', prompt: 'Estimate', correctAnswer: 3, options: [2, 3, 4], objectLabel: 'Rope' };
    await dom.render(Card, { ...props, task: first });
    const answer = () => [...dom.document.querySelectorAll('button')].find(b => b.textContent.trim() === '3');
    await dom.click(answer()); assert.equal(correct, 1); assert(answer().disabled);
    await dom.render(Card, { ...props, task: first }); assert(answer().disabled, 'Same question must keep its answer');
    await dom.render(Card, { ...props, task: { ...first, correctAnswer: 4 } }); assert(!answer().disabled);
    await dom.click(answer()); assert.equal(wrong, 1);
    await dom.render(Card, { ...props, task: { ...first, scene: 'estimateSlider', estimateStart: 3 } });
    await dom.click([...dom.document.querySelectorAll('button')].find(b => b.textContent.includes('Check it')));
    await dom.render(Card, { ...props, task: { ...first, scene: 'estimateSlider', correctAnswer: 5 } });
    await dom.flushTimers(); assert.equal(correct, 1, 'Old question completion must be cancelled');
    assert.equal(dom.document.querySelector('input').value, '5');
    console.log('PASS: estimation answers reset only for a new task; pending completion is cancelled');
  } finally { await dom.close(); }
}

{
  const dom = domHarness({ '@/lib/brain-break-xp': { BRAIN_BREAK_XP_CAP: 10, awardBrainBreakXp: () => assert.fail('Sequence test must not call the XP transport') } });
  const random = Math.random;
  try {
    Math.random = () => 0;
    const { CopyMeGame } = dom.load('components/lesson/BrainBreak.tsx', ['CopyMeGame']);
    let wins = 0;
    await dom.render(CopyMeGame, { villain: { glow: '#fff' }, onWin: () => wins++ });
    const pads = dom.document.querySelectorAll('button');
    await dom.pointerDown(pads[0]); assert.equal(wins, 0);
    await dom.flushTimers();
    await dom.pointerDown(pads[1]);
    assert(dom.document.body.textContent.includes('Watch the pattern'));
    await dom.flushTimers();
    for (const length of [2, 3, 4]) {
      for (let i = 0; i < length; i++) await dom.pointerDown(pads[0]);
      if (length < 4) {
        assert(dom.document.body.textContent.includes('Watch the pattern'));
        await dom.flushTimers();
      }
    }
    assert.equal(wins, 1);
    await dom.pointerDown(pads[0]); assert.equal(wins, 1);
    console.log('PASS: memory game replays mistakes, advances three rounds and completes once');
  } finally { Math.random = random; await dom.close(); }
}

{
  const dom = domHarness();
  try {
    const { FullscreenToggle } = dom.load('components/FullscreenToggle.tsx');
    await dom.render(FullscreenToggle, {});
    assert.equal(dom.document.querySelector('button'), null, 'Unsupported fullscreen stays hidden');
    dom.document.documentElement.requestFullscreen = async () => {
      dom.document.fullscreenElement = dom.document.documentElement;
      dom.document.dispatchEvent(new dom.document.defaultView.Event('fullscreenchange'));
    };
    dom.document.exitFullscreen = async () => {
      dom.document.fullscreenElement = null;
      dom.document.dispatchEvent(new dom.document.defaultView.Event('fullscreenchange'));
    };
    await dom.render(FullscreenToggle, {});
    await dom.click(dom.document.querySelector('button'));
    assert.equal(dom.document.querySelector('button').getAttribute('aria-label'), 'Exit full screen');
    await dom.click(dom.document.querySelector('button'));
    assert.equal(dom.document.querySelector('button').getAttribute('aria-label'), 'Enter full screen');
    console.log('PASS: fullscreen capability, browser events and enter/exit labels');
  } finally { await dom.close(); }
}

{
  const dom = domHarness({ '@/lib/demo-mode': { isDemoPreviewMode: () => false } });
  try {
    const { default: Modal } = dom.load('components/legends/LegendDetailModal.tsx');
    const card = { id: 'test-a', name: 'Test A', images: { cardFront: '/front.webp', cardBack: '/back.webp' }, yearLabel: 'Year 1', realmId: 'number', stars: 1, stats: { calculation: 5, speed: 5, accuracy: 5 }, showcaseVideoUrl: '/test.mp4' };
    const props = { legend: card, onClose: () => {} };
    const find = text => [...dom.document.querySelectorAll('button')].find(b => b.textContent.includes(text));
    await dom.render(Modal, props);
    await dom.click(find('Flip RELIQ card'));
    assert(dom.document.querySelector('[alt="Test A RELIQ card back"]'));
    await dom.render(Modal, props);
    assert(dom.document.querySelector('[alt="Test A RELIQ card back"]'), 'Same card keeps its side');
    await dom.click(dom.document.querySelector('[aria-label="Enlarge RELIQ card"]'));
    assert(dom.document.querySelector('[aria-label="Close enlarged RELIQ card"]'));
    await dom.render(Modal, { ...props, legend: { ...card, id: 'test-b', name: 'Test B' } });
    assert(!dom.document.querySelector('[aria-label="Close enlarged RELIQ card"]'));
    assert(dom.document.querySelector('[alt="Test B RELIQ card front"]'));
    await dom.click(find('Watch Video')); assert(dom.document.querySelector('video'));
    await dom.render(Modal, props); assert(!dom.document.querySelector('video'));
    console.log('PASS: changing RELIQ cards resets side, enlargement and video without resetting the same card');
  } finally { await dom.close(); }
}
