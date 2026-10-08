import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const read = file => fs.readFileSync(file, 'utf8');
const recorder = read('lib/screen-recorder.ts');
const component = read('components/StudentScreenRecorder.tsx');
const viewer = read('components/teacher/StudentScreenViewer.tsx');
const layout = read('app/layout.tsx');
assert(!layout.includes('StudentScreenRecorder'), 'Global layout must not start capture');
for (const source of [recorder, component, viewer]) {
  assert(!/rrweb|\.channel\(|screen_events|setInterval\(/.test(source), 'Suspended screen paths must neither capture nor subscribe');
}
assert(viewer.includes('Live screen view temporarily unavailable'));
const compiled = ts.transpileModule(recorder, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exports = {};
vm.runInNewContext(compiled, { exports });
for (const ids of [['', ''], ['synthetic-student', 'synthetic-class']]) {
  const stop = exports.startScreenRecording(...ids);
  assert.equal(typeof stop, 'function');
  assert.doesNotThrow(stop);
  assert.doesNotThrow(stop);
}
console.log('PASS: capture entry point is inert, root capture removed, viewer does not subscribe. Reintroduction requires replacing these suspension checks with authorised transport and privacy tests.');
