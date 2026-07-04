import { useState, useEffect, type CSSProperties } from 'react';
import { Spacing, BottomSheet } from '@toss/tds-mobile';
import type { ContractFormData, DaySchedule } from '../types';
import { DAYS, DAY_LABELS, DEFAULT_DAY_SCHEDULE } from '../types';
import { CommentBoundary } from '../../../dev/CommentBoundary';
import { FunnelQuestion } from '../../../../components/funnel/FunnelQuestion';

interface Step3WorkScheduleProps {
  form: ContractFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string | boolean | string[]) => void;
  toggleDay: (day: string) => void;
  selectWeeklyHoliday: (day: string) => void;
  updateDaySchedule: (day: string, field: keyof DaySchedule, value: string) => void;
  setScheduleMode: (mode: ContractFormData['schedule_mode']) => void;
}

function dayButtonStyle(active: boolean): CSSProperties {
  return {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    fontSize: '16px',
    fontWeight: 600,
    color: active ? '#fff' : '#4E5968',
    backgroundColor: active ? '#3182F6' : '#F2F4F6',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };
}

function nextBtnStyle(): CSSProperties {
  return {
    width: '100%', padding: 16, borderRadius: 16, backgroundColor: '#333D4B',
    color: 'white', marginTop: 24, fontSize: 16, fontWeight: 'bold', border: 'none',
  };
}

/** 하루치 시간 입력 (시작/종료/휴게) */
function TimeInputs({
  day,
  sched,
  updateDaySchedule,
}: {
  day: string;
  sched: DaySchedule;
  updateDaySchedule: (day: string, field: keyof DaySchedule, value: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label className="funnel-label">출근 시간</label>
          <input
            type="time"
            className="funnel-huge-input"
            value={sched.start}
            onChange={(e) => updateDaySchedule(day, 'start', e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label className="funnel-label">퇴근 시간</label>
          <input
            type="time"
            className="funnel-huge-input"
            value={sched.end}
            onChange={(e) => updateDaySchedule(day, 'end', e.target.value)}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label className="funnel-label">휴게 시작</label>
          <input
            type="time"
            className="funnel-huge-input"
            value={sched.break_start}
            onChange={(e) => updateDaySchedule(day, 'break_start', e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label className="funnel-label">휴게 종료</label>
          <input
            type="time"
            className="funnel-huge-input"
            value={sched.break_end}
            onChange={(e) => updateDaySchedule(day, 'break_end', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default function Step3WorkSchedule({
  form, errors, toggleDay, selectWeeklyHoliday, updateDaySchedule, setScheduleMode,
}: Step3WorkScheduleProps) {
  const [activeField, setActiveField] = useState<'days' | 'mode' | 'time' | 'holiday'>('days');
  const [holidaySheetOpen, setHolidaySheetOpen] = useState(false);

  // "다음" 검증 실패 시 첫 미입력 필드를 자동으로 펼쳐 에러가 보이게 해요.
  useEffect(() => {
    if (errors.work_days) setActiveField('days');
    else if (errors.workSchedule) setActiveField('time');
    else if (errors.weekly_holiday) setActiveField('holiday');
  }, [errors.work_days, errors.workSchedule, errors.weekly_holiday]);
  const sched = (day: string): DaySchedule => form.work_schedule[day] ?? DEFAULT_DAY_SCHEDULE;
  const repDay = form.work_days[0] ?? DAYS[0];
  const isSame = form.schedule_mode === 'same';

  // 시간이 입력됐는지(주휴일로 넘어갈 조건)
  const timeFilled = form.work_days.length > 0 && form.work_days.every((d) => {
    const s = form.work_schedule[d];
    return s && s.start && s.end;
  });

  return (
    <div>
      {/* 1. 요일 선택 */}
      <CommentBoundary name="근무일정-요일선택">
        <FunnelQuestion
          title={<>근무하는 요일은<br />어떻게 되나요?</>}
          subtitle="출근하는 모든 요일을 선택해주세요"
          isActive={activeField === 'days'}
          onEnter={() => setActiveField('days')}
          summary={form.work_days.length > 0 ? `출근일: ${form.work_days.map((d) => DAY_LABELS[d]).join(', ')}` : undefined}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
            {DAYS.map((day) => (
              <button 
                type="button" 
                key={day} 
                onClick={(e) => { e.preventDefault(); toggleDay(day); }} 
                style={dayButtonStyle(form.work_days.includes(day))}
              >
                {DAY_LABELS[day]}
              </button>
            ))}
          </div>
          {errors.work_days && <div style={{ color: '#FF5252', fontSize: 13, marginTop: 8 }}>{errors.work_days}</div>}
        </FunnelQuestion>
      </CommentBoundary>

      {/* 2. 시간 입력 방식 (모드) */}
      {(form.work_days.length > 0 || activeField === 'mode' || activeField === 'time' || activeField === 'holiday') && (
        <CommentBoundary name="근무일정-시간방식">
          <FunnelQuestion
            title={<>근무시간이<br />매일 같나요?</>}
            subtitle="요일마다 다르면 요일별로 입력할 수 있어요"
            isActive={activeField === 'mode'}
            onEnter={() => setActiveField('mode')}
            summary={isSame ? '모든 요일 같게' : '요일마다 다르게'}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" style={{ ...dayButtonStyle(isSame), width: 'auto', padding: '0 20px', borderRadius: 24, flex: 1 }} onClick={(e) => { e.preventDefault(); setScheduleMode('same'); setActiveField('time'); }}>모든 요일 같게</button>
              <button type="button" style={{ ...dayButtonStyle(!isSame), width: 'auto', padding: '0 20px', borderRadius: 24, flex: 1 }} onClick={(e) => { e.preventDefault(); setScheduleMode('perDay'); setActiveField('time'); }}>요일마다 다르게</button>
            </div>
          </FunnelQuestion>
        </CommentBoundary>
      )}

      {/* 3. 시간 입력 */}
      {(form.schedule_mode || activeField === 'time' || activeField === 'holiday') && (
        <CommentBoundary name="근무일정-시간설정">
          {isSame ? (
            <FunnelQuestion
              title={<>출퇴근 시간은<br />언제인가요?</>}
              subtitle="모든 근무요일에 동일하게 적용돼요"
              isActive={activeField === 'time'}
              onEnter={() => setActiveField('time')}
              summary={sched(repDay).start && sched(repDay).end ? `근무시간: ${sched(repDay).start} ~ ${sched(repDay).end}` : undefined}
            >
              <TimeInputs day={repDay} sched={sched(repDay)} updateDaySchedule={updateDaySchedule} />
            </FunnelQuestion>
          ) : (
            <FunnelQuestion
              title={<>요일별<br />출퇴근 시간</>}
              subtitle="각 요일의 시간을 입력해주세요"
              isActive={activeField === 'time'}
              onEnter={() => setActiveField('time')}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {form.work_days.map((d) => (
                  <div key={d}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#333D4B', marginBottom: 8 }}>{DAY_LABELS[d]}요일</div>
                    <TimeInputs day={d} sched={sched(d)} updateDaySchedule={updateDaySchedule} />
                  </div>
                ))}
              </div>
            </FunnelQuestion>
          )}
          {errors.workSchedule && <div style={{ color: '#FF5252', fontSize: 13, marginTop: 8 }}>{errors.workSchedule}</div>}
        </CommentBoundary>
      )}

      {/* 4. 주휴일 */}
      {(activeField === 'holiday' || form.weekly_holiday) && (
        <CommentBoundary name="근무일정-휴일선택">
          <FunnelQuestion
            title={<>주휴일은<br />무슨 요일인가요?</>}
            subtitle="일주일 만근 시 유급휴일을 주는 요일"
            isActive={activeField === 'holiday'}
            onEnter={() => setActiveField('holiday')}
            summary={form.weekly_holiday ? `주휴일: ${DAY_LABELS[form.weekly_holiday]}` : undefined}
          >
            <button
              type="button"
              className="funnel-huge-input"
              style={{ textAlign: 'left', cursor: 'pointer', paddingBottom: '8px', color: form.weekly_holiday ? '#333D4B' : '#d1d6db' }}
              onClick={(e) => { e.preventDefault(); setHolidaySheetOpen(true); }}
            >
              {form.weekly_holiday ? `${DAY_LABELS[form.weekly_holiday]}요일` : '선택해주세요'}
            </button>
            <BottomSheet
              open={holidaySheetOpen}
              onClose={() => setHolidaySheetOpen(false)}
              header={<BottomSheet.Header>주휴일 선택</BottomSheet.Header>}
            >
              <div style={{ display: 'flex', flexDirection: 'column', padding: '0 24px 24px', gap: '8px', maxHeight: '60vh', overflowY: 'auto' }}>
                {DAYS.map((day) => {
                  const isSelected = form.weekly_holiday === day;
                  return (
                    <button
                      type="button"
                      key={day}
                      style={{ padding: '16px', background: isSelected ? '#F2F4F6' : 'transparent', border: 'none', borderRadius: '12px', textAlign: 'left', fontSize: '16px', fontWeight: 600, color: isSelected ? '#3182F6' : '#333D4B' }}
                      onClick={(e) => { e.preventDefault(); selectWeeklyHoliday(day); setHolidaySheetOpen(false); }}
                    >
                      {DAY_LABELS[day]}요일
                    </button>
                  );
                })}
              </div>
            </BottomSheet>
            {errors.weekly_holiday && <div style={{ color: '#FF5252', fontSize: 13, marginTop: 8 }}>{errors.weekly_holiday}</div>}
          </FunnelQuestion>
        </CommentBoundary>
      )}
    </div>
  );
}
