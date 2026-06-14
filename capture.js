import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = '/Users/ganghyeon-ug/.gemini/antigravity-ide/brain/0fe8927d-67f5-4154-b9da-d2b9e0bc7a54/artifacts';

const PAGES = [
  { url: '/login', name: 'login', role: null },
  { url: '/employer/dashboard', name: 'employer_dashboard', role: 'employer' },
  { url: '/employer/business/manage', name: 'employer_business_manage', role: 'employer' },
  { url: '/employer/contracts', name: 'employer_contract_list', role: 'employer' },
  { url: '/employer/contracts/new', name: 'employer_contract_form_step1', role: 'employer', wait: 2000 },
  { url: '/worker/contracts', name: 'worker_contract_list', role: 'worker' }
];

async function capture() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });

  for (const p of PAGES) {
    console.log(`Navigating to ${p.name}...`);
    await page.goto('http://localhost:5173');
    
    // Inject mock auth state if needed
    if (p.role) {
      await page.evaluate((role) => {
        sessionStorage.setItem('mock_role', role);
      }, p.role);
    } else {
      await page.evaluate(() => {
        sessionStorage.removeItem('mock_role');
      });
    }

    await page.goto(`http://localhost:5173${p.url}`, { waitUntil: 'networkidle0' });
    
    // Wait for any React animations or final renders
    await new Promise(r => setTimeout(r, p.wait || 2000));
    
    const outPath = path.join(ARTIFACT_DIR, `${p.name}.png`);
    await page.screenshot({ path: outPath });
    console.log(`Saved ${outPath}`);
  }

  await browser.close();
}

capture().catch(console.error);
