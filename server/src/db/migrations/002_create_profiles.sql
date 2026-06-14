-- 1. profiles 테이블 생성
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- JWT의 sub와 일치
    toss_user_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    ci TEXT,
    role TEXT CHECK (role IN ('employer', 'worker')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책 설정: 자신의 프로필만 조회 가능
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 4. RLS 정책 설정: 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Service Role(백엔드)는 모든 권한 허용 (Upsert 용도)
CREATE POLICY "Service role has full access"
ON public.profiles
FOR ALL
USING (true)
WITH CHECK (true);
