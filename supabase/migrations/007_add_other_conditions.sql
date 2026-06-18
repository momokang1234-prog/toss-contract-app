-- 기타 조건 필드 추가 (선택 사항)
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS other_conditions TEXT;
