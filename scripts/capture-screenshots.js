#!/usr/bin/env node
/**
 * Capture screenshots of all toss-contract-app pages for workspace.html
 * Usage: node scripts/capture-screenshots.js
 * 
 * Prerequisites:
 * - Vite dev server running on http://toss-contract-app.private-apps.tossmini.com:5173
 * - TDS /etc/hosts entry: 127.0.0.1 toss-contract-app.private-apps.tossmini.com
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://toss-contract-app.private-apps.tossmini.com:5173';
const OUTDIR = path.join(__dirname, '..', 'public', 'screenshots');

if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

const pages = [
  { id: 'login', route: '/login' },
  { id: 'role-select', route: '/role-select' },
  { id: 'deeplink', route: '/contract/mock-contract-001' },
  { id: 'root', route: '/' },
  { id: 'dashboard', route: '/employer/dashboard' },
  { id: 'business-new', route: '/employer/business/new' },
  { id: 'contracts-list', route: '/employer/contracts' },
  { id: 'contracts-new', route: '/employer/contracts/new' },
  { id: 'contract-detail', route: '/employer/contracts/mock-contract-001' },
  { id: 'contract-history', route: '/employer/contracts/mock-contract-001/history' },
  { id: 'worker-list', route: '/worker/contracts' },
  { id: 'worker-detail', route: '/worker/contracts/mock-contract-001' },
  { id: 'worker-sign', route: '/worker/contracts/mock-contract-001/sign' },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: [
      '--no-sandbox', '--disable-gpu', '--disable-extensions',
      '--host-resolver-rules=MAP toss-contract-app.private-apps.tossmini.com 127.0.0.1'
    ]
  });

  let success = 0;
  let fail = 0;

  for (const { id, route } of pages) {
    const url = `${BASE_URL}${route}`;
    const outfile = path.join(OUTDIR, `${id}.png`);
    
    try {
      console.log(`[${success + fail + 1}/${pages.length}] Capturing: ${id} -> ${url}`);
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844 });
      
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
      await new Promise(r => setTimeout(r, 2000));
      
      await page.screenshot({ path: outfile, fullPage: false });
      const stats = fs.statSync(outfile);
      console.log(`  ✅ OK: ${outfile} (${(stats.size / 1024).toFixed(1)} KB)`);
      success++;
      await page.close();
    } catch (err) {
      console.error(`  ❌ FAIL: ${err.message}`);
      fail++;
      try { await page.close(); } catch(e) {}
    }
  }
  
  await browser.close();
  console.log(`\nDone: ${success} succeeded, ${fail} failed`);
  console.log(`Screenshots saved to: ${OUTDIR}`);
})().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
