// Turns the single-file build (dist/index.html) into a page fragment for hosting inside
// another page: keeps <title>, font <link>s, styles, the root element and the script,
// and drops the document wrapper (<!doctype>, <html>, <head>, <body>).
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');

const pick = (re) => [...html.matchAll(re)].map((m) => m[0]);
const title = pick(/<title>[\s\S]*?<\/title>/g);
const links = pick(/<link\b[^>]*>/g);
const styles = pick(/<style\b[^>]*>[\s\S]*?<\/style>/g);
const scripts = pick(/<script\b[^>]*>[\s\S]*?<\/script>/g);

if (title.length !== 1 || scripts.length === 0 || styles.length === 0) {
  throw new Error(`Unexpected build output: ${title.length} titles, ${styles.length} styles, ${scripts.length} scripts`);
}

const fragment = [...title, ...links, ...styles, '<div id="root"></div>', ...scripts].join('\n');
const out = new URL('../dist/bellpals-prototype.html', import.meta.url);
writeFileSync(out, fragment);
console.log(`Wrote ${out.pathname} (${(fragment.length / 1024).toFixed(0)} KB)`);
