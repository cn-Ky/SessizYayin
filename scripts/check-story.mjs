// Hikâye grafiğini doğrular: kırık bağlantı, ulaşılamayan sahne, çıkışsız sahne, ulaşılabilir sonlar.
import { build } from '/opt/npm-tools/node_modules/esbuild/lib/main.js';
import { pathToFileURL } from 'node:url';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const out = path.join(mkdtempSync(path.join(tmpdir(), 'story-')), 'story.mjs');
await build({ entryPoints: ['src/story/index.ts'], bundle: true, format: 'esm', outfile: out, logLevel: 'error' });
const { SCENES, START_SCENE } = await import(pathToFileURL(out).href);

let errors = 0;
const fail = (m) => { console.log('HATA:', m); errors++; };

for (const s of Object.values(SCENES)) {
  for (const c of s.choices ?? []) if (!SCENES[c.to]) fail(`${s.id} → ${c.to} yok`);
  if (s.timer && !SCENES[s.timer.to]) fail(`${s.id} timer → ${s.timer.to} yok`);
  if (!s.ending && !(s.choices?.length)) fail(`${s.id} çıkışsız`);
}

// bayrak duyarlı gezinme: (sahne, bayraklar) durumlarını dolaş
const key = (id, f) => id + '|' + [...f].sort().join(',');
const seen = new Set();
const reached = new Set();
const endings = new Set();
const stack = [[START_SCENE, new Set()]];
while (stack.length) {
  const [id, flags] = stack.pop();
  const k = key(id, flags);
  if (seen.has(k)) continue;
  seen.add(k);
  reached.add(id);
  const s = SCENES[id];
  if (!s) continue;
  if (s.ending) { endings.add(s.ending); continue; }
  const next = [];
  for (const c of s.choices ?? []) {
    if (c.requires && !c.requires.every((r) => flags.has(r))) continue;
    if (c.hidden && c.hidden.some((h) => flags.has(h))) continue;
    next.push([c.to, new Set([...flags, ...(c.set ?? [])])]);
  }
  if (s.timer) next.push([s.timer.to, new Set(flags)]);
  if (!next.length) fail(`${id}: bayraklarla seçeneksiz kalıyor (${[...flags]})`);
  stack.push(...next);
}

for (const id of Object.keys(SCENES)) if (!reached.has(id)) fail(`${id} ulaşılamıyor`);
for (const e of ['kacis', 'yanki', 'sessizlik', 'dongu', 'gercek']) if (!endings.has(e)) fail(`son ulaşılamıyor: ${e}`);

console.log(`sahne: ${Object.keys(SCENES).length}, durum: ${seen.size}, sonlar: ${[...endings].join(', ')}`);
console.log(errors ? `${errors} sorun var` : 'Hikâye grafiği temiz');
process.exit(errors ? 1 : 0);
