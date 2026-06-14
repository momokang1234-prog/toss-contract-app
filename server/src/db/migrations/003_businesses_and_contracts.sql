-- 1. businesses 테이블 생성
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_key TEXT NOT NULL,
    business_number TEXT NOT NULL,
    business_name TEXT NOT NULL,
    representative TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- 2. businesses RLS 정책 (JWT의 user_key 활용)
CREATE POLICY "Users can view their own businesses"
ON public.businesses FOR SELECT
USING (owner_user_key = auth.jwt() ->> 'user_key');

CREATE POLICY "Users can create businesses"
ON public.businesses FOR INSERT
WITH CHECK (owner_user_key = auth.jwt() ->> 'user_key');

CREATE POLICY "Users can update their own businesses"
ON public.businesses FOR UPDATE
USING (owner_user_key = auth.jwt() ->> 'user_key');

CREATE POLICY "Users can delete their own businesses"
ON public.businesses FOR DELETE
USING (owner_user_key = auth.jwt() ->> 'user_key');


-- 3. contracts 테이블 생성
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    worker_user_key TEXT,
    employer_name TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    working_hours TEXT NOT NULL,
    working_days TEXT[] NOT NULL,
    wage_type TEXT NOT NULL,
    wage_amount INTEGER NOT NULL,
    payment_day INTEGER NOT NULL,
    duties TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    employer_signature TEXT,
    worker_signature TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- 4. contracts RLS 정책
-- (사장님) 자신이 소유한 사업장의 계약서 조회
CREATE POLICY "Employers can view their contracts"
ON public.contracts FOR SELECT
USING (
    business_id IN (
        SELECT id FROM public.businesses 
        WHERE owner_user_key = auth.jwt() ->> 'user_key'
    )
    OR worker_user_key = auth.jwt() ->> 'user_key'
);

-- (사장님) 계약서 작성
CREATE POLICY "Employers can create contracts"
ON public.contracts FOR INSERT
WITH CHECK (
    business_id IN (
        SELECT id FROM public.businesses 
        WHERE owner_user_key = auth.jwt() ->> 'user_key'
    )
);

-- (사장님 & 알바생) 계약서 수정
CREATE POLICY "Users can update relevant contracts"
ON public.contracts FOR UPDATE
USING (
    business_id IN (
        SELECT id FROM public.businesses 
        WHERE owner_user_key = auth.jwt() ->> 'user_key'
    )
    OR worker_user_key = auth.jwt() ->> 'user_key'
);

CREATE POLICY "Employers can delete contracts"
ON public.contracts FOR DELETE
USING (
    business_id IN (
        SELECT id FROM public.businesses 
        WHERE owner_user_key = auth.jwt() ->> 'user_key'
    )
);
