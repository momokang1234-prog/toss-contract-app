import React, { useState } from 'react';
import { Spacing } from '@toss/tds-mobile';
import type { ContractFormData } from '../types';
import { DAYS, DAY_LABELS } from '../types';
import { CommentBoundary } from '../../../dev/CommentBoundary';
import { FunnelQuestion } from '../../../../components/funnel/FunnelQuestion';

interface Step3WorkScheduleProps {
  form: ContractFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string | boolean | string[]) => void;
  toggleDay: (day: string) => void;
  selectWeeklyHoliday: (day: string) => void;
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
    textAlign: 'center'
  };
}

export default function Step3WorkSchedule({ form, errors, handleChange, toggleDay, selectWeeklyHoliday }: Step3WorkScheduleProps) {
  const [activeField, setActiveField] = useState<'days' | 'holiday' | 'workTime' | 'breakTime'>('days');

  return (
    <div>
      <CommentBoundary name="근무일정-요일선택">
      <FunnelQuestion
        title={<>무슨 요일에<br/>출근하시나요?</>}
        subtitle="출근하는 모든 요일을 선택해주세요"
        isActive={activeField === 'days'}
        onEnter={() => setActiveField('days')}
        summary={form.work_days.length > 0 ? `출근일: ${form.work_days.map(d => DAY_LABELS[d]).join(', ')}` : undefined}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DAYS.map(day => (
            <button key={day} onClick={() => toggleDay(day)} style={pillStyle(form.work_days.includes(day))}>
              {DAY_LABELS[day]}
            </button>
          ))}
        </div>
        {errors.work_days && <div style={{ color: '#FF5252', fontSize: 13, marginTop: 8 }}>{errors.work_days}</div>}
        
        {/* Next button for multiple selection */}
        {activeField === 'days' && form.work_days.length > 0 && (
          <button 
            style={{ width: '100%', padding: 16, borderRadius: 16, backgroundColor: '#333D4B', color: 'white', marginTop: 24, fontSize: 16, fontWeight: 'bold', border: 'none' }}
            onClick={() => setActiveField('holiday')}
          >
            선택 완료
          </button>
        )}
      </FunnelQuestion>
      </CommentBoundary>

      {/* Show holiday if days are selected */}
      {(form.work_days.length > 0 || activeField === 'holiday' || activeField === 'workTime' || activeField === 'breakTime') && (
        <CommentBoundary name="근무일정-휴일선택">
        <FunnelQuestion
          title={<>주휴일은<br/>무슨 요일인가요?</>}
          subtitle="일주일 만근 시 유급휴일을 주는 요일"
          isActive={activeField === 'holiday'}
          onEnter={() => setActiveField('holiday')}
          summary={form.weekly_holiday ? `주휴일: ${DAY_LABELS[form.weekly_holiday]}` : undefined}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DAYS.map(day => (
              <button 
                key={day} 
                onClick={() => {
                  selectWeeklyHoliday(day);
                  setActiveField('workTime');
                }} 
                style={pillStyle(form.weekly_holiday === day)}
              >
                {DAY_LABELS[day]}
              </button>
            ))}
          </div>
          {errors.weekly_holiday && <div style={{ color: '#FF5252', fontSize: 13, marginTop: 8 }}>{errors.weekly_holiday}</div>}
        </FunnelQuestion>
        </CommentBoundary>
      )}

      {/* Show work time if holiday is selected */}
      {(form.weekly_holiday || activeField === 'workTime' || activeField === 'breakTime') && (
        <CommentBoundary name="근무일정-시간설정">
        <FunnelQuestion
          title={<>출퇴근 시간은<br/>언제인가요?</>}
          subtitle="업무 시작과 종료 시간을 선택해주세요"
          isActive={activeField === 'workTime'}
          onEnter={() => setActiveField('workTime')}
          summary={(form.start_time && form.end_time) ? `근무시간: ${form.start_time} ~ ${form.end_time}` : undefined}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label className="funnel-label">출근 시간</label>
              <input
                type="time"
                className="funnel-huge-input"
                value={form.start_time}
                onChange={e => handleChange('start_time', e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="funnel-label">퇴근 시간</label>
              <input
                type="time"
                className="funnel-huge-input"
                value={form.end_time}
                onChange={e => {
                  handleChange('end_time', e.target.value);
                  if (form.start_time && e.target.value) {
                    setActiveField('breakTime');
                  }
                }}
              />
            </div>
          </div>
          {(errors.start_time || errors.end_time) && (
            <div style={{ color: '#FF5252', fontSize: 13, marginTop: 8 }}>{errors.start_time || errors.end_time}</div>
          )}
        </FunnelQuestion>
        </CommentBoundary>
      )}

      {/* Show break time if work time is selected */}
      {(form.start_time && form.end_time) && (
        <CommentBoundary name="근무일정-휴게시간">
        <FunnelQuestion
          title={<>쉬는 시간은<br/>언제인가요?</>}
          subtitle="점심시간 등 휴게시간을 입력해주세요"
          isActive={activeField === 'breakTime'}
          onEnter={() => setActiveField('breakTime')}
          summary={(form.break_start && form.break_end) ? `휴게시간: ${form.break_start} ~ ${form.break_end}` : undefined}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label className="funnel-label">휴게 시작</label>
              <input
                type="time"
                className="funnel-huge-input"
                value={form.break_start}
                onChange={e => handleChange('break_start', e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="funnel-label">휴게 종료</label>
              <input
                type="time"
                className="funnel-huge-input"
                value={form.break_end}
                onChange={e => handleChange('break_end', e.target.value)}
              />
            </div>
          </div>
        </FunnelQuestion>
        </CommentBoundary>
      )}
    </div>
  );
}
