-- =========================================
-- 1. 사용자 테이블
-- =========================================
CREATE TABLE public.users (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_key      TEXT UNIQUE NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('employer', 'worker')),
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  ci            TEXT,
  email         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_user_key ON public.users(user_key);
CREATE INDEX idx_users_phone ON public.users(phone);

-- =========================================
-- 2. 사업장 테이블
-- =========================================
CREATE TABLE public.businesses (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_key    TEXT NOT NULL REFERENCES public.users(user_key),
  business_number   TEXT NOT NULL,
  business_name     TEXT NOT NULL,
  representative    TEXT NOT NULL,
  address           TEXT NOT NULL,
  phone             TEXT,
  is_verified       BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_businesses_owner ON public.businesses(owner_user_key);

-- =========================================
-- 3. 근로계약 테이블
-- =========================================
CREATE TABLE public.contracts (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id       UUID NOT NULL REFERENCES public.businesses(id),
  employer_user_key TEXT NOT NULL REFERENCES public.users(user_key),
  worker_name       TEXT NOT NULL,
  worker_phone      TEXT NOT NULL,
  worker_user_key   TEXT REFERENCES public.users(user_key),
  worker_address    TEXT,
  contract_type     TEXT NOT NULL CHECK (contract_type IN ('fullTime', 'partTime', 'fixedTerm')),
  status            TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','sent','viewed','signed','completed','cancelled','expired')),
  template_version  TEXT DEFAULT '1.0.0',
  start_date        DATE NOT NULL,
  end_date          DATE,
  workplace         TEXT NOT NULL,
  job_description   TEXT NOT NULL,
  wage_type         TEXT NOT NULL CHECK (wage_type IN ('hourly','daily','weekly','monthly')),
  base_wage         INTEGER NOT NULL CHECK (base_wage > 0),
  wage_payment_date TEXT NOT NULL,
  wage_payment_method TEXT NOT NULL CHECK (wage_payment_method IN ('bankTransfer','cash','mixed')),
  work_days         TEXT[] NOT NULL,
  start_time        TEXT NOT NULL,
  end_time          TEXT NOT NULL,
  break_minutes     INTEGER NOT NULL DEFAULT 0,
  weekly_holiday    TEXT,
  paid_leave_clause     BOOLEAN DEFAULT true,
  social_insurance_clause BOOLEAN DEFAULT true,
  severance_clause      BOOLEAN DEFAULT true,
  employer_signed_at    TIMESTAMPTZ,
  worker_signed_at      TIMESTAMPTZ,
  worker_signature_data TEXT,
  contract_html         TEXT,
  contract_pdf_url      TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contracts_business ON public.contracts(business_id);
CREATE INDEX idx_contracts_employer ON public.contracts(employer_user_key);
CREATE INDEX idx_contracts_worker_key ON public.contracts(worker_user_key);
CREATE INDEX idx_contracts_worker_phone ON public.contracts(worker_phone);
CREATE INDEX idx_contracts_status ON public.contracts(status);

-- =========================================
-- 4. 계약 이력 테이블
-- =========================================
CREATE TABLE public.contract_history (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id   UUID NOT NULL REFERENCES public.contracts(id),
  action        TEXT NOT NULL,
  actor_role    TEXT NOT NULL,
  actor_user_key TEXT,
  details       JSONB,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contract_history_contract ON public.contract_history(contract_id);

-- =========================================
-- 5. 전달 이력 테이블
-- =========================================
CREATE TABLE public.deliveries (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id     UUID NOT NULL REFERENCES public.contracts(id),
  method          TEXT NOT NULL CHECK (method IN ('sms','push','inbox','share','link')),
  recipient_phone TEXT NOT NULL,
  recipient_user_key TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','sent','delivered','failed')),
  sent_at         TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_deliveries_contract ON public.deliveries(contract_id);

-- =========================================
-- 6. updated_at 트리거
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
