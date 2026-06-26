const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching visual browser for Checklist...');
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=400,800'],
    defaultViewport: { width: 400, height: 800 }
  });

  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/employer/contracts/new', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    sessionStorage.setItem('force_mock', 'true');
    sessionStorage.setItem('wiz_form', JSON.stringify({
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
        mon: { start: '09:00', end: '18:00', break_start: '12:00', break_end: '12:15' }, // 휴게시간 15분 (부족)
        tue: { start: '09:00', end: '18:00', break_start: '12:00', break_end: '12:15' }
      },
      schedule_mode: 'same',
      weekly_holiday: '', // 주휴일 없음
      paid_leave_clause: false, // 연차 없음
      health_insurance: false,
      pension: false,
      employment_insurance: false,
      accident_insurance: false,
      severance_clause: false
    }));
  });

  console.log('Navigating to finalChecklist step...');
  await page.goto('http://localhost:5173/employer/contracts/new?contract-form-wizard=finalChecklist', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000)); // wait for rendering

  await page.screenshot({ path: 'checklist-screenshot.png', fullPage: true });
  console.log('📸 스크린샷 캡처 완료 (checklist-screenshot.png)');

  // 사용자가 화면을 볼 수 있도록 10초 대기
  console.log('화면을 감상하세요! (10초 뒤 닫힙니다)');
  await new Promise(r => setTimeout(r, 10000));

  await browser.close();
})();
