-- 011_add_profile_birthday.sql
-- profiles 테이블에 birthday 컬럼 추가 (Toss 로그인 시 생년월일 정보 수집)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birthday TEXT;
