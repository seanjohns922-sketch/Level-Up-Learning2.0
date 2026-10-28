import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { localConfig, localDir } from './local-config.mjs';

const config = localConfig();
const source = process.cwd();
const appDir = path.join(localDir, 'app');
fs.mkdirSync(appDir, { recursive: true });
// A separate source/build directory avoids changing the working app's .env,
// generated route types or production build. Public artwork is shared read-only.
for (const directory of ['app', 'components', 'data', 'lib', 'hooks', 'types', 'src', 'styles', 'config', 'content']) {
  const from = path.join(source, directory);
  if (fs.existsSync(from)) fs.cpSync(from, path.join(appDir, directory), { recursive: true });
}
for (const file of fs.readdirSync(source)) {
  if (/\.(?:[cm]?js|tsx?|json)$/.test(file) && fs.statSync(path.join(source, file)).isFile()) {
    fs.copyFileSync(path.join(source, file), path.join(appDir, file));
  }
}
for (const directory of ['public', 'node_modules']) {
  const target = path.join(appDir, directory);
  if (!fs.existsSync(target)) fs.symlinkSync(path.join(source, directory), target, 'dir');
}
const env = { ...process.env,
  NEXT_PUBLIC_APP_ENV: 'staging',
  NEXT_PUBLIC_SUPABASE_URL: config.API_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: config.ANON_KEY,
  NEXT_PUBLIC_VOICE_CLIP_BASE: `${config.API_URL}/storage/v1/object/public/voice/miranda`,
};
// Keep provisioning credentials out of the application process.
delete env.SUPABASE_SERVICE_ROLE_KEY;
console.log('Starting isolated synthetic-data app at http://127.0.0.1:3100');
const child = spawn(process.execPath, [path.join(source, 'node_modules/next/dist/bin/next'), 'dev', '--webpack', '--hostname', '127.0.0.1', '--port', '3100'], { cwd: appDir, env, stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', code => { process.exitCode = code ?? 1; });
