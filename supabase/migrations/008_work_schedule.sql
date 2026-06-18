-- 008: 요일별 근무 스케줄 지원 (범용 per-day 모델)
-- 각 요일의 {start, end, break_start, break_end} 맵을 JSONB로 저장.
-- 기존 start_time/end_time/break_* 단일 컬럼은 NOT NULL 호환용으로 유지
-- (대표 요일값 파생 저장 → 구 데이터/레거시 reader 안전).
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS work_schedule JSONB;
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS schedule_mode TEXT DEFAULT 'same';
