// Vite yerine esbuild + Tailwind v4 derleyici API'si ile derler (ağsız ortam için).
// Çıktı: dist/app.js, dist/app.css, dist/index.html (tek dosyaya gömülmüş: dist/single.html)
import { build } from '/opt/npm-tools/node_modules/esbuild/lib/main.js';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const require = createRequire('/opt/npm-tools/node_modules/');
const root = process.cwd();
const dist = path.join(root, 'dist');
mkdirSync(dist, { recursive: true });

// 1) JS
await build({
  entryPoints: [path.join(root, 'src/main.tsx')],
  bundle: true,
  format: 'esm',
  outfile: path.join(dist, 'app.js'),
  minify: true,
  target: 'es2020',
  jsx: 'automatic',
  nodePaths: ['/opt/npm-tools/node_modules'],
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'error',
});

// 2) CSS (Tailwind v4 compile API, aday sınıflar kaynaklardan regex ile çıkarılır)
const twDir = '/opt/npm-tools/node_modules/tailwindcss';
const { compile } = await import(path.join(twDir, 'dist/lib.mjs'));
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = path.join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const sources = [...walk(path.join(root, 'src')), path.join(root, 'index.html')].filter((f) => /\.(tsx?|html|css)$/.test(f));
const candidates = new Set();
for (const f of sources) {
  for (const m of readFileSync(f, 'utf8').matchAll(/[^\s"'`<>{}=;]+/g)) candidates.add(m[0]);
}
const input = readFileSync(path.join(root, 'src/styles.css'), 'utf8');
const compiler = await compile(input, {
  base: root,
  loadStylesheet: async (id, base) => {
    const file = id === 'tailwindcss' ? path.join(twDir, 'index.css') : path.resolve(id.startsWith('.') ? base : twDir, id);
    return { path: file, base: path.dirname(file), content: readFileSync(file, 'utf8') };
  },
});
const css = compiler.build([...candidates]);
writeFileSync(path.join(dist, 'app.css'), css);

// 3) tek dosya sürümü
const html = readFileSync(path.join(root, 'index.html'), 'utf8')
  .replace('<link rel="stylesheet" href="./dist/app.css" />', `<style>${css}</style>`)
  .replace('<script type="module" src="./dist/app.js"></script>', '');
const js = readFileSync(path.join(dist, 'app.js'), 'utf8').replace(/<\/script/g, '<\\/script');
writeFileSync(path.join(dist, 'single.html'), html.replace('</body>', `<script type="module">${js}</script></body>`));

console.log(`derlendi: app.js ${(js.length / 1024).toFixed(0)} KB, app.css ${(css.length / 1024).toFixed(0)} KB, single.html ${(statSync(path.join(dist, 'single.html')).size / 1024).toFixed(0)} KB`);
