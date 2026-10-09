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
