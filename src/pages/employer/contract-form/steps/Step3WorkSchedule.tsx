import React from 'react';
import { TextField, Paragraph } from '@toss/tds-mobile';
import type { ContractFormData } from '../types';
import { DAYS, DAY_LABELS } from '../types';
import { FieldLabel } from './FieldLabel';

interface Step3WorkScheduleProps {
  form: ContractFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string | boolean | string[]) => void;
  toggleDay: (day: string) => void;
  selectWeeklyHoliday: (day: string) => void;
}

function pillStyle(active: boolean): React.CSSProperties {
  return {
    width: 44, height: 44, borderRadius: 22, fontSize: 13, fontWeight: 600,
    color: active ? '#fff' : '#333D4B',
    backgroundColor: active ? '#3182F6' : '#F5F6F8',
    border: 'none', cursor: 'pointer',
  };
}

export default function Step3WorkSchedule({ form, errors, handleChange, toggleDay, selectWeeklyHoliday }: Step3WorkScheduleProps) {
  return (
    <div>
      <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 12 }}>근무 시간</Paragraph>
      <FieldLabel>근무 요일</FieldLabel>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {DAYS.map(day => (
          <button key={day} onClick={() => toggleDay(day)} style={pillStyle(form.work_days.includes(day))}>
            {DAY_LABELS[day]}
          </button>
        ))}
        {errors.work_days && <span style={{ color: '#FF5252', fontSize: 12, width: '100%' }}>{errors.work_days}</span>}
      </div>
      <FieldLabel>주휴일</FieldLabel>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {DAYS.map(day => (
          <button key={day} onClick={() => selectWeeklyHoliday(day)} style={pillStyle(form.weekly_holiday === day)}>
            {DAY_LABELS[day]}
          </button>
        ))}
        {errors.weekly_holiday && <span style={{ color: '#FF5252', fontSize: 12, width: '100%' }}>{errors.weekly_holiday}</span>}
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>시작</FieldLabel>
          <TextField variant="box" type="time" value={form.start_time}
            onChange={e => handleChange('start_time', e.target.value)}
            hasError={!!errors.start_time} help={errors.start_time} aria-label="시작 시간" />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>종료</FieldLabel>
          <TextField variant="box" type="time" value={form.end_time}
            onChange={e => handleChange('end_time', e.target.value)}
            hasError={!!errors.end_time} help={errors.end_time} aria-label="종료 시간" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>휴게 시작</FieldLabel>
          <TextField variant="box" type="time" value={form.break_start}
            onChange={e => handleChange('break_start', e.target.value)} aria-label="휴게 시작 시간" />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>휴게 종료</FieldLabel>
          <TextField variant="box" type="time" value={form.break_end}
            onChange={e => handleChange('break_end', e.target.value)} aria-label="휴게 종료 시간" />
        </div>
      </div>
    </div>
  );
}
