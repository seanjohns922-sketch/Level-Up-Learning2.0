// Build metadata only: this is not a browser transfer or latency measurement.
import fs from 'node:fs';
import vm from 'node:vm';

const route = '/pattern-peaks/lesson/[level]/[week]/[lesson]/page';
const context = {};
vm.runInNewContext(fs.readFileSync(`.next/server/app${route}_client-reference-manifest.js`, 'utf8'), context);
const manifest = context.__RSC_MANIFEST[route];
const shell = Object.entries(manifest.clientModules).find(([key]) =>
  key.endsWith('/components/pattern-peaks/PatternPeaksLessonShell.tsx'));
if (!shell) throw new Error('Pattern Peaks shell is missing from the build');
const files = [...new Set(shell[1].chunks.filter(file => file.endsWith('.js')))];
const loadable = JSON.parse(fs.readFileSync('.next/react-loadable-manifest.json', 'utf8'));
const engine = loadable['components/pattern-peaks/PatternPeaksLessonShell.tsx -> @/components/lesson/Year2LessonEngine'];
const total = new Set([...files, ...(engine?.files ?? []).filter(file => file.endsWith('.js'))]);
const size = paths => [...paths].reduce((sum, file) => sum + fs.statSync(`.next/${decodeURIComponent(file)}`).size, 0);
console.log(JSON.stringify({
  shellReferencedBytes: size(files),
  shellAndEngineBytes: size(total),
  files,
  deferredEngineFiles: engine?.files ?? [],
  note: 'Client-reference manifest JS sizes, not measured browser transfers or timings.',
}, null, 2));
