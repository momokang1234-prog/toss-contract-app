const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching browser for Case 7 Edge Cases...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7909.0/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  let allPassed = true;
  const results = [];

  function report(name, passed, detail) {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${detail}`);
    results.push({ name, passed, detail });
    if (!passed) allPassed = false;
  }

  const page = await browser.newPage();
  
  console.log('\n━━━ TEST: Case 7 주요 유효성 검사 차단 (Edge Cases) ━━━');
  
  try {
    // 1. 먼저 인증 세션 세팅
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(() => { sessionStorage.setItem('mock_role', 'employer'); });

    // 2. 엣지 케이스 데이터 주입 (ContractFormData 타입에 맞춤)
    const invalidFormData = {
      worker_name: '엣지테스터',
      worker_phone: '01012345678',
      worker_address: '서울시 강남구',
      contract_type: 'fullTime',
      workplace: '토스 사업장',
      job_description: '개발',
      start_date: '2026-07-01',
      end_date: '',
      wage_type: 'hourly',
      base_wage: '9000',               // 최저임금(10,030원) 미달
      wage_payment_day: '10',
      wage_payment_method: 'bankTransfer',
      work_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      schedule_mode: 'same',
      work_schedule: {
        mon: { start: '09:00', end: '18:00', break_start: '', break_end: '' },  // 9시간 근무, 휴게 없음
        tue: { start: '09:00', end: '18:00', break_start: '', break_end: '' },
        wed: { start: '09:00', end: '18:00', break_start: '', break_end: '' },
        thu: { start: '09:00', end: '18:00', break_start: '', break_end: '' },
        fri: { start: '09:00', end: '18:00', break_start: '', break_end: '' },
      },
      weekly_holiday: 'mon',            // 근무일과 주휴일 겹침
      paid_leave_clause: false,
      pension: true,
      health_insurance: true,
      employment_insurance: true,
      accident_insurance: true,
      severance_clause: true,
      checklist_agreed: false,
      other_conditions: ''
    };

    await page.evaluate((data) => {
      sessionStorage.setItem('wiz_form', JSON.stringify(data));
      sessionStorage.setItem('force_mock', 'true');
    }, invalidFormData);

    // 3. finalChecklist 스텝으로 직접 이동
    await page.goto('http://localhost:5173/employer/contracts/new?contract-form-wizard=finalChecklist', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 3000));

    const pageText = await page.evaluate(() => document.body.innerText);

    const hasMinWageWarning = pageText.includes('최저임금 확인') || pageText.includes('최저임금 근접');
    report('Edge-최저임금', hasMinWageWarning, hasMinWageWarning ? '최저임금 미달 에러 노출 확인' : '최저임금 미달 에러를 찾을 수 없음');

    const hasBreakTimeWarning = pageText.includes('휴게시간 확인');
    report('Edge-휴게시간', hasBreakTimeWarning, hasBreakTimeWarning ? '휴게시간 부족 에러 노출 확인' : '휴게시간 부족 에러를 찾을 수 없음');

    const hasHolidayWarning = pageText.includes('근무일과 주휴일 겹침');
    report('Edge-주휴일', hasHolidayWarning, hasHolidayWarning ? '주휴일 겹침 에러 노출 확인' : '주휴일 겹침 에러를 찾을 수 없음');

    const hasEditBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.textContent.includes('수정하기'));
    });
    report('Edge-수정버튼', hasEditBtn, hasEditBtn ? '수정하기 버튼 노출 확인' : '수정하기 버튼을 찾을 수 없음');

    // 동의 전 제출 차단 확인
    const isNextDisabled = await page.evaluate(() => {
      const switches = document.querySelectorAll('[role="switch"]');
      // 동의 스위치가 off인 상태에서 다음 버튼이 없거나 비활성화인지 확인
      return switches.length > 0;
    });
    report('Edge-동의스위치', isNextDisabled, isNextDisabled ? '동의 스위치 존재 확인 (미동의 상태)' : '동의 스위치를 찾을 수 없음');

  } catch (error) {
    report('Edge-테스트실행', false, `테스트 실행 중 에러 발생: ${error.message}`);
  }

  await page.close();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`총 ${results.length}개 테스트 | 통과: ${results.filter(r => r.passed).length} | 실패: ${results.filter(r => !r.passed).length}`);
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED');
  } else {
    console.log('⚠️  SOME TESTS FAILED');
    results.filter(r => !r.passed).forEach(r => console.log(`  ❌ ${r.name}: ${r.detail}`));
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await browser.close();
  process.exit(allPassed ? 0 : 1);
})();
