const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  
  console.log("Navigating to home page to set mock session storage...");
  await page.goto('http://localhost:5173/');
  await page.evaluate(() => {
    sessionStorage.setItem('mock_role', 'employer');
    sessionStorage.setItem('force_mock', 'true');
  });

  const contracts = [
    { id: 'mock-1', name: 'draft' },
    { id: 'mock-2', name: 'sent' }
  ];

  for (const contract of contracts) {
    console.log(`Navigating to ${contract.id} (${contract.name})...`);
    await page.goto(`http://localhost:5173/employer/contracts/${contract.id}`, { waitUntil: 'networkidle0' });
    
    console.log("Waiting for animations and content to settle...");
    await new Promise(r => setTimeout(r, 2000));
    
    const artifactPath = `/root/.gemini/antigravity-cli/brain/219ddb3e-f941-430b-897c-e544920f6a48/contract_detail_${contract.name}.png`;
    console.log("Saving screenshot to:", artifactPath);
    await page.screenshot({ path: artifactPath, fullPage: true });
  }
  
  console.log("Done!");
  await browser.close();
})();
