-- 1. 기존 테이블 및 관련 정책 삭제
DROP TABLE IF EXISTS public.contracts CASCADE;

-- 2. 완벽하게 프론트엔드 인터페이스와 일치하는 contracts 테이블 생성
CREATE TABLE public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    employer_user_key TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    worker_phone TEXT NOT NULL,
    worker_user_key TEXT,
    worker_address TEXT,
    worker_account TEXT,
    worker_ci TEXT,
    contract_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    start_date TEXT NOT NULL,
    end_date TEXT,
    workplace TEXT NOT NULL,
    job_description TEXT NOT NULL,
    wage_type TEXT NOT NULL,
    base_wage INTEGER NOT NULL,
    wage_payment_date TEXT NOT NULL,
    wage_payment_method TEXT NOT NULL,
    work_days TEXT[] NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    break_start_time TEXT NOT NULL,
    break_end_time TEXT NOT NULL,
    weekly_holiday TEXT,
    paid_leave_clause BOOLEAN NOT NULL,
    pension BOOLEAN NOT NULL,
    health_insurance BOOLEAN NOT NULL,
    employment_insurance BOOLEAN NOT NULL,
    accident_insurance BOOLEAN NOT NULL,
    social_insurance_clause BOOLEAN NOT NULL,
    severance_clause BOOLEAN NOT NULL,
    employer_signed_at TIMESTAMPTZ,
    employer_signature_data TEXT,
    worker_signed_at TIMESTAMPTZ,
    worker_signature_data TEXT,
    contract_html TEXT,
    rejection_reason TEXT,
    contract_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- 4. contracts RLS 정책 (다시 생성)
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
