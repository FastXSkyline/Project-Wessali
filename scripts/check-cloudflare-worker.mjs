import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workerPath = resolve(root, 'apps/cloudflare/worker/index.js');
const dashboardPath = resolve(root, 'apps/cloudflare/worker/admin.html');
const workerSource = readFileSync(workerPath, 'utf8');
const dashboardHtml = readFileSync(dashboardPath, 'utf8');

const workerCheck = spawnSync(
  process.execPath,
  ['--check', '--input-type=module'],
  { input: workerSource, encoding: 'utf8' },
);
if (workerCheck.status !== 0) {
  process.stderr.write(workerCheck.stderr || workerCheck.stdout);
  process.exit(workerCheck.status || 1);
}

const inlineScripts = [...dashboardHtml.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map((match) => match[1].trim())
  .filter(Boolean);

if (inlineScripts.length === 0) {
  throw new Error('No inline dashboard JavaScript was found.');
}

for (const [index, script] of inlineScripts.entries()) {
  try {
    new Script(script, { filename: 'admin-inline-' + (index + 1) + '.js' });
  } catch (error) {
    throw new Error('Dashboard inline script ' + (index + 1) + ' failed syntax validation: ' + error.message);
  }
}

const marker = 'const ADMIN_HTML = ';
const markerIndex = workerSource.indexOf(marker);
const valueStart = markerIndex < 0 ? -1 : workerSource.indexOf('"', markerIndex + marker.length);
if (markerIndex < 0 || valueStart < 0) {
  throw new Error('The Worker does not contain the embedded dashboard HTML.');
}

let valueEnd = valueStart + 1;
let escaped = false;
for (; valueEnd < workerSource.length; valueEnd += 1) {
  const character = workerSource[valueEnd];
  if (escaped) {
    escaped = false;
  } else if (character === '\\') {
    escaped = true;
  } else if (character === '"') {
    break;
  }
}
if (valueEnd >= workerSource.length || workerSource[valueEnd + 1] !== ';') {
  throw new Error('The embedded dashboard string is not a valid JavaScript literal.');
}
const embeddedHtml = JSON.parse(workerSource.slice(valueStart, valueEnd + 1));
if (embeddedHtml !== dashboardHtml) {
  throw new Error('The Worker embedded dashboard and admin.html source are out of sync.');
}

process.stdout.write('Cloudflare Worker and dashboard syntax checks passed.\n');
