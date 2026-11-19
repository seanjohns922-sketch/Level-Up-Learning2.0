// Inspect the scripts referenced by production HTML, not a browser timing test.
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const build = path.resolve(process.argv[2] ?? '.next');
const routes = ['home-base', 'program', 'lesson'];
const loadable = JSON.parse(fs.readFileSync(path.join(build, 'react-loadable-manifest.json'), 'utf8'));
const visited = new Set();
const result = { buildId: fs.readFileSync(path.join(build, 'BUILD_ID'), 'utf8').trim(),
  caveats: ['Production HTML references only; later dynamic imports and media are excluded.',
    'Gzip sizes are estimates, not observed HTTP transfer sizes.',
    'Modern browsers skip nomodule scripts. Cache reuse assumes unchanged chunk URLs.',
    'This does not measure hydration, rendering, gameplay frame rate or network latency.'], routes: [] };
for (const route of routes) {
  const html = fs.readFileSync(path.join(build, 'server/app', `${route}.html`), 'utf8');
  const scripts = new Map();
  for (const match of html.matchAll(/<script\b([^>]*)>/g)) {
    const attrs = match[1];
    const src = attrs.match(/\bsrc="([^"?]+)(?:\?[^"]*)?"/);
    if (!src?.[1].startsWith('/_next/')) continue;
    const relative = src[1].slice('/_next/'.length);
    const file = path.resolve(build, relative);
    if (!file.startsWith(build + path.sep)) throw new Error('Script path leaves the build directory');
    const bytes = fs.readFileSync(file);
    scripts.set(relative, { file: relative, bytes: bytes.length, gzipBytes: gzipSync(bytes).length, legacyOnly: /\bnomodule\b/i.test(attrs) });
  }
  const modern = [...scripts.values()].filter(s => !s.legacyOnly);
  if (!modern.length) throw new Error(`No modern scripts found for ${route}`);
  const sum = (files, field) => files.reduce((n, s) => n + s[field], 0);
  const uncached = modern.filter(s => !visited.has(s.file));
  result.routes.push({ route: `/${route}`, modernScripts: modern.length,
    bytes: sum(modern, 'bytes'), gzipBytes: sum(modern, 'gzipBytes'),
    newJourneyBytes: sum(uncached, 'bytes'), newJourneyGzipBytes: sum(uncached, 'gzipBytes'),
    legacyOnlyBytes: sum([...scripts.values()].filter(s => s.legacyOnly), 'bytes'),
    scripts: modern.sort((a, b) => b.bytes - a.bytes) });
  if (route === 'lesson') {
    result.lessonEngineScenarios = [];
    for (const component of ['@/components/PracticeRunner', '@/components/lesson/Year2LessonEngine']) {
      const entry = loadable[`app/lesson/page.tsx -> ${component}`];
      if (!entry) continue;
      const total = new Map(modern.map(s => [s.file, s]));
      for (const file of entry.files.filter(f => f.endsWith('.js'))) {
        const bytes = fs.readFileSync(path.join(build, file));
        total.set(file, { file, bytes: bytes.length, gzipBytes: gzipSync(bytes).length });
      }
      result.lessonEngineScenarios.push({ component, bytes: sum([...total.values()], 'bytes'),
        gzipBytes: sum([...total.values()], 'gzipBytes'),
        note: 'Initial HTML scripts plus the selected engine manifest chunks; not an observed browser trace.' });
    }
  }
  modern.forEach(s => visited.add(s.file));
}
console.log(JSON.stringify(result, null, 2));
