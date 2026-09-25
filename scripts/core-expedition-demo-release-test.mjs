import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// Execute the destination route with both session outcomes: a saved URL must
// never mount the earned student experience while the programmes are unfinished.
const source = fs.readFileSync('app/world/expedition/page.tsx', 'utf8');
for (const allowed of [false, true]) {
  const module = { exports: {} };
  const redirected = [];
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function('require', 'module', 'exports', code)((name) => {
    if (name === 'next/navigation') return { redirect: (url) => redirected.push(url) };
    if (name === '@/lib/demo-session-server') return { getServerStarpathAccess: async () => ({ allowed }) };
    throw new Error(`Unexpected route dependency: ${name}`);
  }, module, module.exports);
  await module.exports.default();
  assert.deepEqual(redirected, [allowed ? '/demo-review/number-adventure/3d' : '/world/tower']);
}
const tower = fs.readFileSync('components/world3d/TowerRealmChamber.tsx', 'utf8');
assert.match(tower, /expeditionUnlocked=\{preview\}/);
assert.match(tower, /const atExpedition=preview &&/);
assert.doesNotMatch(tower, /fetchExpeditionAccess/);
const preview = fs.readFileSync('app/demo-review/number-adventure/3d/page.tsx', 'utf8');
assert.match(preview, /if \(!access.allowed\) redirect\('\/login'\)/);
console.log('PASS expedition demo-only route redirects, tower guard and authenticated preview boundary');
