// Regenerates public/og.png from og.html. Dev-only; run with:
//   node scripts/og/capture.mjs
// Requires Playwright with a local Chromium (set PLAYWRIGHT_EXECUTABLE
// to override the default lookup path) — install it temporarily with
// `npm install --no-save playwright` if it's not already resolvable.
import { chromium } from 'playwright';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'og.html');
const outPath = path.join(__dirname, '../../public/og.png');

const executablePath = process.env.PLAYWRIGHT_EXECUTABLE || '/opt/pw-browsers/chromium';

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`file://${htmlPath}`);
await page.waitForTimeout(200); // let @font-face settle
const shot = await page.screenshot();
await browser.close();

// Palette-quantize to stay well under the 150 KB OG image budget.
await sharp(shot).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(outPath);
console.log(`Wrote ${outPath}`);
