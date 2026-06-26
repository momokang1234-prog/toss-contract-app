const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  console.log("Mock 데이터 주입...");
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('force_mock', 'true');
    const origSet = sessionStorage.setItem.bind(sessionStorage);
    sessionStorage.setItem = function(key, val) {
      if (key === 'force_mock') return;
      origSet(key, val);
    };
  });

  // 먼저 딥링크로 접속해서 거절을 수행하자.
  // Wait, is it easier to just use the MockContractService directly?
  // We can just open /employer/contracts/test-reject-id
});
