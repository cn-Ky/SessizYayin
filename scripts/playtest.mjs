// Gerçek tarayıcıda oyunu başlatır, seçimlerle sona kadar oynar, farklı ekran boyutlarında görüntü alır.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire('/opt/npm-tools/node_modules/');
const { chromium } = require('playwright');

const url = 'file://' + process.argv[2];
const outDir = process.argv[3];
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});

const sizes = [
  ['desktop', 1280, 720],
  ['mobil-dikey', 390, 844],
  ['mobil-yatay', 844, 390],
  ['tablet', 820, 1180],
];
let failed = false;

for (const [name, w, h] of sizes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: name !== 'desktop' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${outDir}/${name}-1-baslik.png` });

  await page.getByRole('button', { name: /BAŞLA/ }).click();
  await page.waitForTimeout(600);
  // metni atla
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/${name}-2-ilk-sahne.png` });

  // 1. seçeneği seçerek sona kadar ilerle (en fazla 40 adım)
  let ended = false;
  for (let i = 0; i < 40 && !ended; i++) {
    await page.keyboard.press('Space');
    await page.waitForTimeout(250);
    const ending = await page.getByText(/SON BULUNDU/).count();
    if (ending) { ended = true; break; }
    const btns = page.locator('button:has(span.font-mono-ui)');
    if (await btns.count()) {
      if (i === 6) await page.screenshot({ path: `${outDir}/${name}-3-secimler.png` });
      await btns.first().click();
      await page.waitForTimeout(350);
    }
  }
  await page.waitForTimeout(6500);
  await page.screenshot({ path: `${outDir}/${name}-4-son.png` });

  // yatay kaydırma (taşma) kontrolü
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  console.log(`${name} (${w}x${h}): son=${ended ? 'evet' : 'HAYIR'}, yatay taşma=${overflow ? 'VAR' : 'yok'}, hata=${errors.length}`);
  if (errors.length) console.log(errors.join('\n'));
  if (!ended || overflow || errors.length) failed = true;
  await ctx.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
