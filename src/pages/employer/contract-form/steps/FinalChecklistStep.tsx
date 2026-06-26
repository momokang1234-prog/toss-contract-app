import React, { useState } from 'react';
import { BottomSheet, Button, TextField, TextButton, Switch, Paragraph } from '@toss/tds-mobile';
import { ContractFormData, type DaySchedule } from '../types';
import { validateLaborContract } from '../../../../domain/contract/validation';
import { buildContractData } from '../../../../domain/contract/buildContractData';
import { CommentBoundary } from '../../../dev/CommentBoundary';

interface FinalChecklistStepProps {
  form: ContractFormData;
  onChange?: (field: string, value: any) => void;
  toggleDay?: (day: string) => void;
  onNavigate?: (step: any) => void;
}

const SUGGESTION_MESSAGES: Record<string, { title: string; desc: string; editStep?: string }> = {
  BELOW_MINIMUM_WAGE: {
    title: "최저임금 확인",
    desc: "올해 최저시급(10,030원) 기준에 맞게 책정되었는지 한 번 더 확인해보세요.",
    editStep: 'wageTypeAmount'
  },
  NEAR_MINIMUM_WAGE: {
    title: "최저임금 근접",
    desc: "입력된 시급이 2026년 고시 최저시급(10,030원)과 가깝습니다. 정확히 책정되었는지 챙겨보세요.",
    editStep: 'wageTypeAmount'
  },
  INSUFFICIENT_BREAK: {
    title: "휴게시간 확인",
    desc: "4시간 일하면 30분, 8시간 일하면 1시간 이상의 휴게시간이 잘 포함되어 있는지 챙겨보세요.",
    editStep: 'workTimeNav'
  },
  MISSING_WEEKLY_HOLIDAY: {
    title: "주휴일 확인",
    desc: "주 15시간 이상 일하는 직원은 개근 시 주휴일(주휴수당)이 발생해요. 설정된 주휴일이 적절한지 챙겨보세요.",
    editStep: 'workTimeNav'
  },
  HOLIDAY_OVERLAP_WORKDAY: {
    title: "근무일과 주휴일 겹침",
    desc: "쉬기로 한 주휴일이 일하는 요일에 포함되어 있지 않은지 확인해보세요.",
    editStep: 'workDays'
  },
  SHORT_TIME_WORKER: {
    title: "단시간 근로자 안내",
    desc: "주 15시간 미만 일하는 단시간 근로자는 주휴수당 대상에서 제외될 수 있어요.",
  },
  MISSING_PAID_LEAVE: {
    title: "연차 유급휴가 조항",
    desc: "연차 유급휴가 조항이 누락되지 않았는지 점검해보세요.",
    editStep: 'wageInsuranceNav'
  },
  MISSING_SOCIAL_INSURANCE: {
    title: "4대보험 조항",
    desc: "4대보험(국민연금, 건강보험, 고용보험, 산재보험) 조항이 누락되지 않았는지 챙겨보세요.",
    editStep: 'wageInsuranceNav'
  },
  MISSING_SEVERANCE: {
    title: "퇴직금 조항",
    desc: "퇴직금 관련 조항이 누락되지 않았는지 점검해보세요.",
    editStep: 'wageInsuranceNav'
  }
};

export function FinalChecklistStep({ form, onChange, toggleDay, onNavigate }: FinalChecklistStepProps) {
  const [editTarget, setEditTarget] = useState<string | null>(null);

  const laborContractInput = buildContractData(form);

  const validationRes = validateLaborContract(laborContractInput);
  console.log("form.base_wage:", form.base_wage, "parsed:", Number(form.base_wage) || 0);
  console.log("Validation Result:", JSON.stringify(validationRes, null, 2));

  const guideItems: { title: string; desc: string; editStep?: string }[] = [];
  const addGuide = (code: string) => {
    if (SUGGESTION_MESSAGES[code]) {
      // Prevent duplicates if multiple errors return same nuance code
      if (!guideItems.find(g => g.title === SUGGESTION_MESSAGES[code].title)) {
        guideItems.push(SUGGESTION_MESSAGES[code]);
      }
    }
  };

  validationRes.errors.forEach(err => addGuide(err.code));
  validationRes.warnings.forEach(warn => addGuide(warn.code));

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
                        onNavigate?.('workSchedule');
                      } else if (item.editStep === 'wageInsuranceNav') {
                        onNavigate?.('wageInsurance');
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
        {guideItems.length === 0 && (
          <div style={{ padding: '16px', textAlign: 'center', color: '#8B95A1', fontSize: '14px' }}>
            아주 좋습니다! 법정 기준에 잘 맞게 작성되었어요.
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#F9FAFB', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '14px', marginTop: '1px' }}>⚠️</div>
        <div style={{ fontSize: '13px', color: '#505967', lineHeight: 1.5 }}>
          사장님이 '기타 조건'에 직접 작성하신 특약 내용은 시스템이 자동으로 검증하지 않습니다. 법에 위배되는 내용이 없는지 직접 확인해주세요.
        </div>
      </div>

      {/* 확인 동의 — checklist_agreed (서명 진행 전 필수) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0 0', borderTop: '1px solid #f2f4f6', marginTop: 24, gap: 16 }}>
        <div>
          <Paragraph typography="st6" fontWeight="bold">체크리스트를 모두 확인했어요</Paragraph>
          <Paragraph typography="st8" color="grey-500">서명하기 전 위 내용을 점검했는지 확인해주세요</Paragraph>
        </div>
        <Switch
          checked={form.checklist_agreed}
          onChange={(e) => onChange?.('checklist_agreed', (e.target as HTMLInputElement).checked)}
          aria-label="체크리스트 확인 동의"
        />
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
            {editTarget === 'workDays' && (
              <div>
                <div style={{ fontSize: '15px', marginBottom: '8px' }}>근무 요일</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => {
                    const isSelected = form.work_days.includes(day);
                    const labels: Record<string, string> = { mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일' };
                    const label = labels[day];
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
