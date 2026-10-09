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
