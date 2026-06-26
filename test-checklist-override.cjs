const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching browser with override...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    const data = {
      worker_name: '테스터',
      worker_phone: '01012345678',
      contract_type: 'fullTime',
      workplace: '테스트 근무지',
      job_description: '개발자',
      start_date: '2026-01-01',
      wage_type: 'hourly',
      base_wage: '9000', // 시급 미달
      wage_payment_day: '15',
      wage_payment_method: 'bankTransfer',
      work_days: ['mon', 'tue'],
      work_schedule: {
        mon: { start: '09:00', end: '18:00', break_start: '12:00', break_end: '12:15' }, // 휴게시간 15분
        tue: { start: '09:00', end: '18:00', break_start: '12:00', break_end: '12:15' }
      },
      schedule_mode: 'same',
      weekly_holiday: '',
      paid_leave_clause: false,
      health_insurance: false,
      pension: false,
      employment_insurance: false,
      accident_insurance: false,
      severance_clause: false
    };
    
    const origGet = sessionStorage.getItem.bind(sessionStorage);
    sessionStorage.getItem = function(key) {
      if (key === 'wiz_form') return JSON.stringify(data);
      if (key === 'force_mock') return 'true';
      return origGet(key);
    };
    const origSet = sessionStorage.setItem.bind(sessionStorage);
    sessionStorage.setItem = function(key, val) {
      if (key === 'wiz_form' || key === 'force_mock') return;
      origSet(key, val);
    };
  });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  console.log('Navigating to finalChecklist step...');
  await page.goto('http://localhost:5173/employer/contracts/new?contract-form-wizard=finalChecklist', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  const pageText = await page.evaluate(() => document.body.innerText);

  console.log('\n--- 렌더링된 화면 텍스트 일부 ---');
  console.log(pageText.substring(0, 800) + '\n...\n');

  const tests = [
    { name: '최저임금 안내 문구', condition: pageText.includes('최저시급(10,030원)') || pageText.includes('최저임금') },
    { name: '휴게시간 안내 문구', condition: pageText.includes('휴게시간') },
    { name: '4대보험 안내 문구', condition: pageText.includes('4대보험') },
    { name: '수정하기 버튼 유무', condition: pageText.includes('수정하기') }
  ];

  let passed = true;
  for (const t of tests) {
    if (t.condition) {
      console.log(`✅ ${t.name} 확인 완료`);
    } else {
      console.log(`❌ ${t.name} 찾을 수 없음!`);
      passed = false;
    }
  }

  await browser.close();
  process.exit(passed ? 0 : 1);
})();
