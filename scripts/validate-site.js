import {access, readdir, readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const site = resolve('site');
const requiredFiles = [
  'index.html',
  'glass-wrap/index.html',
  'glass-wrap/arrow-app.js',
  'sticker-counter/index.html',
  'sticker-counter/arrow-app.js',
  'shared/header.js',
  'shared/header.css',
  'shared/analytics.js',
];

for (const file of requiredFiles) await access(resolve(site, file));

const htmlFiles = [];
async function findHtml(directory) {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await findHtml(path);
    else if (entry.name.endsWith('.html')) htmlFiles.push(path);
  }
}

await findHtml(site);
for (const file of htmlFiles) {
  const source = await readFile(file, 'utf8');
  if (!source.includes('<!doctype html>')) throw new Error(`${file} is missing its HTML doctype`);
  if (!source.includes('type="module"')) throw new Error(`${file} is missing a module entrypoint`);
  if (!source.includes('analytics.js')) throw new Error(`${file} is missing the shared analytics loader`);
}

console.log(`Static GitHub Pages artifact validated: ${htmlFiles.length} HTML pages and ${requiredFiles.length} required files.`);
