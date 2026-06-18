/**
 * 근무 스케줄 표시용 변환 (공유 헬퍼)
 * - work_schedule(요일별)이 있으면: 'same'(또는 전부 동일)이면 한 줄, 아니면 요일별 행.
 * - 없으면(레거시 단일 컬럼) start_time/end_time/break_* 로 한 줄.
 * 미리보기·체크리스트·근로자 화면·PDF 가 공유.
 */
import { DAY_LABELS, type DaySchedule } from './types';

export interface ScheduleDisplayEntry {
  label: string;
  workTime: string; // "09:00 ~ 18:00"
  breakTime: string; // "12:00 ~ 13:00" or ""
}

export interface ScheduleSource {
  work_days?: string[] | null;
  work_schedule?: Record<string, DaySchedule> | null;
  schedule_mode?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  break_start_time?: string | null;
  break_end_time?: string | null;
}

function dayLabel(d: string): string {
  return DAY_LABELS[d] ?? d;
}

function workTimeStr(s: DaySchedule): string {
  return `${s.start} ~ ${s.end}`;
}

function breakTimeStr(s: DaySchedule): string {
  return s.break_start && s.break_end ? `${s.break_start} ~ ${s.break_end}` : '';
}

function allIdentical(entries: DaySchedule[]): boolean {
  if (entries.length <= 1) return true;
  const first = JSON.stringify(entries[0]);
  return entries.every((e) => JSON.stringify(e) === first);
}

export function formatWorkScheduleForDisplay(src: ScheduleSource): ScheduleDisplayEntry[] {
  const schedule = src.work_schedule ?? {};
  const keys = Object.keys(schedule);

  // 레거시: work_schedule 없으면 단일 컬럼으로 한 줄
  if (keys.length === 0) {
    const workTime = src.start_time && src.end_time ? `${src.start_time} ~ ${src.end_time}` : '';
    const breakTime = src.break_start_time && src.break_end_time ? `${src.break_start_time} ~ ${src.break_end_time}` : '';
    return [{ label: '', workTime, breakTime }];
  }

  const ordered = (src.work_days ?? keys).filter((d) => schedule[d]);
  const entries = ordered.map((d) => schedule[d]);

  // 'same' 모드이거나 모든 요일 동일 → 한 줄 축약
  if (src.schedule_mode === 'same' || allIdentical(entries)) {
    const s = entries[0];
    return [{
      label: ordered.map(dayLabel).join(', '),
      workTime: workTimeStr(s),
      breakTime: breakTimeStr(s),
    }];
  }

  // 요일별
  return ordered.map((d) => ({
    label: `${dayLabel(d)}요일`,
    workTime: workTimeStr(schedule[d]),
    breakTime: breakTimeStr(schedule[d]),
  }));
}
