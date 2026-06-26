import React, { useState, useEffect } from 'react';
import { Spacing } from '@toss/tds-mobile';
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

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: '12px 20px',
    borderRadius: 24,
    fontSize: 16,
    fontWeight: 600,
    color: active ? '#fff' : '#333D4B',
    backgroundColor: active ? '#3182F6' : '#F2F4F6',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flex: '1 1 calc(33.333% - 8px)',
    minWidth: '60px',
    textAlign: 'center',
  };
}

function nextBtnStyle(): React.CSSProperties {
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
          title={<>무슨 요일에<br />출근하시나요?</>}
          subtitle="출근하는 모든 요일을 선택해주세요"
          isActive={activeField === 'days'}
          onEnter={() => setActiveField('days')}
          summary={form.work_days.length > 0 ? `출근일: ${form.work_days.map((d) => DAY_LABELS[d]).join(', ')}` : undefined}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DAYS.map((day) => (
              <button key={day} onClick={() => toggleDay(day)} style={pillStyle(form.work_days.includes(day))}>
                {DAY_LABELS[day]}
              </button>
            ))}
          </div>
          {errors.work_days && <div style={{ color: '#FF5252', fontSize: 13, marginTop: 8 }}>{errors.work_days}</div>}
          {activeField === 'days' && form.work_days.length > 0 && (
            <button style={nextBtnStyle()} onClick={() => setActiveField('mode')}>선택 완료</button>
          )}
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
              <button style={pillStyle(isSame)} onClick={() => { setScheduleMode('same'); setActiveField('time'); }}>모든 요일 같게</button>
              <button style={pillStyle(!isSame)} onClick={() => { setScheduleMode('perDay'); setActiveField('time'); }}>요일마다 다르게</button>
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
          {activeField === 'time' && timeFilled && (
            <button style={nextBtnStyle()} onClick={() => setActiveField('holiday')}>다음</button>
          )}
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
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DAYS.map((day) => (
                <button key={day} onClick={() => selectWeeklyHoliday(day)} style={pillStyle(form.weekly_holiday === day)}>
                  {DAY_LABELS[day]}
                </button>
              ))}
            </div>
            {errors.weekly_holiday && <div style={{ color: '#FF5252', fontSize: 13, marginTop: 8 }}>{errors.weekly_holiday}</div>}
          </FunnelQuestion>
        </CommentBoundary>
      )}
    </div>
  );
}
