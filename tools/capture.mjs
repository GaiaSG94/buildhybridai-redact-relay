// Review captures: product (?capture=<mode>) and boards (file://), 1440x900.
// Usage: npm run build && node tools/capture.mjs
import puppeteer from 'puppeteer-core';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { createServer } from 'node:http';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, 'G-DESIGN/revue');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
const PORT = 4173;

const server = createServer(async (req, res) => {
  const path = req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0];
  try {
    const data = await readFile(join(ROOT, 'dist', decodeURIComponent(path)));
    res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('404');
  }
});
await new Promise((ok) => server.listen(PORT, '127.0.0.1', ok));
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--enable-unsafe-swiftshader', '--window-size=1450,910', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

const shoot = async (url, png, settleMs) => {
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await new Promise((ok) => setTimeout(ok, settleMs));
  await page.screenshot({ path: png });
  console.log(`ok ${resolve(OUT, png) === resolve(png) ? png.split(/[\\/]/).pop() : png}`);
};

const BOARDS = [
  ['planche-01-app', 'G-DESIGN/planches/v5/page-01-app.html'],
  ['planche-02-non-configure', 'G-DESIGN/planches/v5/page-02-non-configure.html'],
  ['planche-03-historique', 'G-DESIGN/planches/v5/page-03-historique.html'],
  ['planche-04-mode-avion', 'G-DESIGN/planches/v5/page-04-mode-avion.html'],
];
for (const [name, file] of BOARDS) {
  await shoot(`file:///${resolve(ROOT, file).replace(/\\/g, '/')}`, join(OUT, `${name}.png`), 6000);
}

const MODES = ['app', 'unconfigured', 'history', 'offline'];
for (const mode of MODES) {
  await shoot(`http://127.0.0.1:${PORT}/?capture=${mode}`, join(OUT, `produit-${mode}.png`), 8000);
}

await browser.close();
server.close();
