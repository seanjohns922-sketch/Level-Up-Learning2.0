import fs from 'node:fs';
import path from 'node:path';
export const localDir = path.resolve('.local-archive/scale-local');
export function localConfig() {
  const values = Object.fromEntries(fs.readFileSync(path.join(localDir, 'status.env'), 'utf8').split('\n')
    .filter(line => /^[A-Z_]+=/.test(line))
    .map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1).replace(/^"|"$/g, '')]; }));
  const url = new URL(values.API_URL);
  if (!['127.0.0.1', 'localhost'].includes(url.hostname) || url.port !== '56521') {
    throw new Error('This fixture runner only permits the isolated local API on port 56521.');
  }
  if (!values.ANON_KEY || !values.SERVICE_ROLE_KEY) throw new Error('Local API keys are missing.');
  return values;
}
