import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { advanceWorldJump, createWorldJump, startWorldJump, resetWorldJump, WORLD_JUMP_DURATION, WORLD_JUMP_HEIGHT } from '../lib/world3d/avatar-jump.ts';

// Same landing/height at different frame rates, no airborne double-jump or queue.
for (const fps of [20, 30, 60, 120]) {
  const state = createWorldJump();
  assert.equal(advanceWorldJump(state, 1 / fps), 0);
  assert.equal(startWorldJump(state), true);
  let peak = 0;
  for (let frame = 0; frame < Math.ceil(WORLD_JUMP_DURATION * fps); frame++) {
    assert.equal(startWorldJump(state), false);
    const height = advanceWorldJump(state, 1 / fps);
    assert.ok(height >= 0 && height <= WORLD_JUMP_HEIGHT);
    peak = Math.max(height, peak);
  }
  assert.equal(advanceWorldJump(state, 1 / fps), 0);
  assert.ok(Math.abs(peak - WORLD_JUMP_HEIGHT) < .01);
  assert.equal(startWorldJump(state), true);
  resetWorldJump(state);
  assert.equal(advanceWorldJump(state, 1 / fps), 0);
}

// Execute actual jump component handlers with shallow controlled hooks.
const slots = [], effects = [];
let cursor = 0, frame, modal = false;
const listeners = new Map();
const events = {
  addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
  removeEventListener(name, fn) { listeners.get(name)?.delete(fn); },
};
class Element { constructor(interactive = false) { this.interactive = interactive; } closest() { return this.interactive; } }
const hooks = {
  useRef(value) { const i = cursor++; return slots[i] ??= { current: value }; },
  useEffect(fn, deps) {
    const i = cursor++, old = slots[i];
    if (!old || deps.some((d, j) => d !== old.deps[j])) {
      effects.push(() => { old?.cleanup?.(); slots[i] = { deps, cleanup: fn() }; });
    }
  },
};
const code = ts.transpileModule(fs.readFileSync('components/world3d/WorldAvatarJump.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
}).outputText;
const module = { exports: {} };
new Function('require', 'module', 'exports', 'window', 'document', 'HTMLElement', code)(name => {
  if (name === 'react') return hooks;
  if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }) };
  if (name === '@react-three/fiber') return { useFrame: fn => { frame = fn; } };
  if (name === '@/lib/world3d/avatar-jump') return { advanceWorldJump, createWorldJump, startWorldJump, resetWorldJump };
  throw Error(`Unexpected import: ${name}`);
}, module, module.exports, events, { ...events, querySelector: () => modal }, Element);
const group = { position: { y: 0 } };
let props = { request: 0, enabled: true, resetKey: 0, children: null };
function render(update = {}) {
  props = { ...props, ...update }; cursor = 0;
  const tree = module.exports.default(props);
  tree.props.ref.current = group;
  effects.splice(0).forEach(fn => fn());
}
function key(overrides = {}) {
  const e = { code: 'Space', repeat: false, defaultPrevented: false, target: new Element(), preventDefault() { this.defaultPrevented = true; }, ...overrides };
  listeners.get('keydown').forEach(fn => fn(e));
  frame(null, 1 / 60);
  return e;
}
function settle() { for (let i = 0; i < 60; i++) frame(null, 1 / 60); assert.equal(group.position.y, 0); }
render();
assert.equal(key().defaultPrevented, true); assert.ok(group.position.y > 0); settle();
for (const overrides of [{ repeat: true }, { code: 'Enter' }, { target: new Element(true) }, { defaultPrevented: true }, { isComposing: true }, { ctrlKey: true }, { altKey: true }, { metaKey: true }]) {
  key(overrides); assert.equal(group.position.y, 0);
}
modal = true; key(); assert.equal(group.position.y, 0); modal = false;
render({ request: 1 }); frame(null, 1 / 60); assert.ok(group.position.y > 0);
render({ enabled: false }); assert.equal(group.position.y, 0); key(); assert.equal(group.position.y, 0);
render({ request: 2 }); render({ enabled: true }); frame(null, 1 / 60); assert.equal(group.position.y, 0, 'Do not queue requests made while paused');
key(); assert.ok(group.position.y > 0); render({ resetKey: 1 }); assert.equal(group.position.y, 0);
for (const name of ['blur', 'visibilitychange']) {
  key(); assert.ok(group.position.y > 0); listeners.get(name).forEach(fn => fn()); assert.equal(group.position.y, 0);
}
console.log('PASS avatar jump: frame-rate-independent hop, exact landing, no double-jump/queue, Space, touch requests, UI focus, dialogs, pause, respawn and background reset.');
