import React, { useState } from 'react';
import { BottomSheet, Button, TextField, TextButton } from '@toss/tds-mobile';
import { ContractFormData } from '../types';
import { calcDailyWorkMinutes, calcEffectiveWorkMinutes, calcWeeklyWorkHours } from '../../../../domain/contract/validation';
import { MINIMUM_HOURLY_WAGE_2026 } from '../../../../domain/contract/laborRules';
import { CommentBoundary } from '../../../dev/CommentBoundary';

interface FinalChecklistStepProps {
  form: ContractFormData;
  onChange?: (field: string, value: any) => void;
  toggleDay?: (day: string) => void;
  onNavigate?: (step: any) => void;
}

export function FinalChecklistStep({ form, onChange, toggleDay, onNavigate }: FinalChecklistStepProps) {
  const [editTarget, setEditTarget] = useState<string | null>(null);
  // 1. Calculate hours
  const dailyMinutes = calcDailyWorkMinutes(form.start_time, form.end_time);
  const dailyHours = dailyMinutes / 60;
  const breakMinutes = calcDailyWorkMinutes(form.break_start || '00:00', form.break_end || '00:00');
  const effectiveMinutes = calcEffectiveWorkMinutes(form.start_time, form.end_time, breakMinutes);
  const weeklyHours = calcWeeklyWorkHours(effectiveMinutes, form.work_days.length);

  // 2. Calculate duration
  const start = new Date(form.start_date);
  let monthsDuration = 999; // indefinitely
  if (form.end_date) {
    const end = new Date(form.end_date);
    monthsDuration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  }

  // 3. Calculate hourly wage equivalent
  let hourlyEquivalent = 0;
  const baseWage = Number(form.base_wage) || 0;
  if (baseWage > 0) {
    switch (form.wage_type) {
      case 'hourly': hourlyEquivalent = baseWage; break;
      case 'daily': hourlyEquivalent = dailyHours > 0 ? baseWage / dailyHours : 0; break;
      case 'weekly': hourlyEquivalent = (dailyHours > 0 && form.work_days.length > 0) ? baseWage / (dailyHours * form.work_days.length) : 0; break;
      case 'monthly': hourlyEquivalent = weeklyHours > 0 ? baseWage / (weeklyHours * 4.345) : 0; break;
    }
  }

  // 4. Build guide items dynamically
  const guideItems: { title: string; desc: string; editStep?: string }[] = [];

  // 최저임금 체크
  if (hourlyEquivalent > 0 && hourlyEquivalent < MINIMUM_HOURLY_WAGE_2026) {
    guideItems.push({
      title: "최저임금 확인",
      desc: "올해 최저시급(10,030원)에 맞게 잘 책정되었는지 한 번 더 확인 해보세요.",
      editStep: 'wageTypeAmount'
    });
  }

  // 주휴수당 체크
  if (weeklyHours >= 15) {
    guideItems.push({
      title: "주휴수당 확인",
      desc: "[주휴수당 안내] 주 15시간 이상 일하는 직원은 일주일을 개근하면 주휴수당이 발생해요.",
      editStep: 'workTimeNav'
    });
  }

  // 휴게시간 체크
  if ((dailyHours >= 4 && breakMinutes < 30) || (dailyHours >= 8 && breakMinutes < 60)) {
    guideItems.push({
      title: "휴게시간 확인",
      desc: "4시간 일하면 30분, 8시간 일하면 1시간의 휴게 시간이 필요해요.",
      editStep: 'workTime'
    });
  }

  return (
    <div>
      <CommentBoundary name="최종검증-체크리스트">
      <div style={{ padding: '40px 0 24px 0' }}>
        <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#333D4B', marginBottom: '12px', lineHeight: 1.4 }}>서명 전,<br/>이런 부분들을 챙겨보세요</div>
        <div style={{ fontSize: '15px', color: '#8B95A1', wordBreak: 'keep-all', lineHeight: 1.5 }}>
          작성하신 계약 내용에 따라 사장님이 꼭 체크해보면 좋은 기준들을 정리했어요.
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {guideItems.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', backgroundColor: '#F2F4F6', borderRadius: '12px' }}>
            <div style={{ fontSize: '18px', lineHeight: 1, marginTop: '2px' }}>💡</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', color: '#333D4B', fontWeight: 600, marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{item.title}</span>
                {item.editStep && (
                  <TextButton 
                    size="small"
                    onClick={() => {
                      if (item.editStep === 'workTimeNav') {
                        onNavigate?.('workTime');
                      } else {
                        setEditTarget(item.editStep!);
                      }
                    }}
                  >
                    수정하기
                  </TextButton>
                )}
              </div>
              <div style={{ fontSize: '14px', color: '#505967', lineHeight: 1.5 }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
      </CommentBoundary>

      {onChange && (
        <BottomSheet 
          open={editTarget !== null} 
          onClose={() => setEditTarget(null)}
          header={<BottomSheet.Header>내용 수정</BottomSheet.Header>}
        >
          <div style={{ padding: '0 24px 24px 24px' }}>
            {editTarget === 'wageTypeAmount' && (
              <TextField
                variant="line"
                label="금액"
                type="tel"
                value={form.base_wage}
                onChange={(e) => onChange('base_wage', e.target.value)}
                suffix="원"
              />
            )}
            {editTarget === 'workTime' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <TextField variant="line" label="시작 시간" type="time" value={form.start_time} onChange={(e) => onChange('start_time', e.target.value)} />
                <TextField variant="line" label="종료 시간" type="time" value={form.end_time} onChange={(e) => onChange('end_time', e.target.value)} />
              </div>
            )}
            {editTarget === 'workDays' && (
              <div>
                <div style={{ fontSize: '15px', marginBottom: '8px' }}>근무 요일</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => {
                    const isSelected = form.work_days.includes(day);
                    const label = { mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일' }[day];
                    return (
                      <button 
                        key={day}
                        onClick={() => toggleDay?.(day)}
                        style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: isSelected ? '#3182F6' : '#F2F4F6', color: isSelected ? 'white' : '#505967', fontWeight: 600 }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          <BottomSheet.CTA>
            <Button size="xlarge" onClick={() => setEditTarget(null)}>완료</Button>
          </BottomSheet.CTA>
        </BottomSheet>
      )}
    </div>
  );
}
