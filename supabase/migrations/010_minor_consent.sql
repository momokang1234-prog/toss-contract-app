-- 010_minor_consent.sql
-- 미성년자 친권자 동의 + 서류 수령 추적 기능
-- 근로기준법 제66조(만 18세 미만), 민법(만 19세 미만 미성년자)

ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS
  worker_birth_date DATE;

ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS
  is_minor BOOLEAN DEFAULT false;          -- 만 19세 미만 (친권자 동의 트리거)

ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS
  is_young_worker BOOLEAN DEFAULT false;   -- 만 18세 미만 (연소근로자 보호규정)

ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS
  parent_consent_data JSONB;               -- { signer, relation, phone, signature, hash, signedAt }

-- 서류 수령 추적 (비차단: not_required / required / received)
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS
  doc_parent_consent_status TEXT DEFAULT 'not_required';

ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS
  doc_family_cert_status TEXT DEFAULT 'not_required';

ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS
  doc_employment_permit_status TEXT DEFAULT 'not_required';

ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS
  doc_received_at TIMESTAMPTZ;

-- 서류 수령 상태 업데이트 (RLS: 사업장 소유자만)
CREATE OR REPLACE FUNCTION public.mark_document_received(
  p_contract_id TEXT,
  p_doc_type TEXT  -- 'family_cert' | 'employment_permit'
) RETURNS public.contracts AS $$
DECLARE
  updated public.contracts;
BEGIN
  UPDATE public.contracts
  SET
    doc_received_at = CASE WHEN p_doc_type = 'family_cert' THEN now() ELSE doc_received_at END,
    doc_family_cert_status = CASE WHEN p_doc_type = 'family_cert' THEN 'received' ELSE doc_family_cert_status END,
    doc_employment_permit_status = CASE WHEN p_doc_type = 'employment_permit' THEN 'received' ELSE doc_employment_permit_status END,
    updated_at = now()
  WHERE id = p_contract_id
  RETURNING * INTO updated;
  RETURN updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
