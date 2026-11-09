// Her ortamı headless Chrome ile çizip PNG olarak kaydeder (shader derleme + görsel kontrol).
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
const require = createRequire('/opt/npm-tools/node_modules/');
const { chromium } = require('playwright');

const outDir = process.argv[2];
const bundle = readFileSync(process.argv[3], 'utf8');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
await page.setContent('<body style="margin:0;background:#000"><canvas id="c" style="width:100vw;height:100vh;display:block"></canvas></body>');
await page.addScriptTag({ content: bundle });
const names = ['shore', 'lobby', 'radio', 'archive', 'stairs', 'lamp', 'cellar', 'mirror'];
for (const n of names) {
  await page.evaluate((env) => {
    window.__r.setEnv(env);
    window.__r.setParams({ figure: env === 'lobby' || env === 'stairs' || env === 'cellar' ? 0.7 : 0, danger: 0.3, sanity: 0.8 });
  }, n);
  await page.waitForTimeout(2200);
  const buf = await page.screenshot();
  writeFileSync(`${outDir}/${n}.png`, buf);
}
console.log(errors.length ? 'HATALAR:\n' + errors.join('\n') : 'Çizim hatasız');
await browser.close();
process.exit(errors.length ? 1 : 0);
