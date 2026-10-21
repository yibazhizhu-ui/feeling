import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(root, 'dist');
if (path.dirname(output) !== root || path.basename(output) !== 'dist') {
  throw new Error('Build output must remain in this project/dist');
}
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
// Explicit allowlist: never deploy repository metadata, credentials or user exports.
const publicFiles = [
  'index.html',
  'assets/shore.svg',
  'assets/icon.svg',
  'src/app.js',
  'src/styles.css',
  'src/mood.js',
  'src/scene.js',
  'src/storage.js',
];
for (const relative of publicFiles) {
  const target = path.join(output, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await cp(path.join(root, relative), target);
}
await writeFile(path.join(output, '.nojekyll'), '');
console.log('Built static app in dist/ (no credentials or user records included).');
