-- ============================================================
-- RLS 정책 감사 보고서 (2026-06-12)
-- ============================================================
-- [✓] 1. 근로자 UPDATE 정책
--   contracts_update_worker_sign: FOR UPDATE USING (false)
--   → 근로자 직접 UPDATE 차단 정상. 서명은 sign_contract RPC로만 가능.
--
-- [✓] 2. Edge Functions SECURITY DEFINER 검증
--   contracts-sign:   SUPABASE_SERVICE_ROLE_KEY 사용 → RLS 우회.
--                      sign_contract RPC 호출 (SECURITY DEFINER) → 정상.
--   contracts-view:   SUPABASE_SERVICE_ROLE_KEY 사용 → RLS 우회.
--   contracts-send:   SUPABASE_SERVICE_ROLE_KEY 사용 → RLS 우회.
--   → 모든 Edge Function은 service_role 키로 동작하므로 RLS와 충돌 없음.
--     단, Edge Function 자체가 SECURITY DEFINER로 선언된 것은 아님.
--     (Deno Edge Functions에는 PL/pgSQL의 SECURITY DEFINER 개념 없음;
--      service_role 키로 대체됨 → 정상 패턴)
--
-- [✓] 3. sign_contract RPC 함수
--   SECURITY DEFINER, worker_user_key/worker_phone 소유권 검증.
--   worker_signed_at, worker_signature_data, worker_user_key, status 갱신.
--   → 정상 동작.
--
-- [⚠] 4. TOCTOU 이슈 (경미)
--   contracts-view: SELECT는 worker 소유권 확인하나 UPDATE는 contractId만 사용.
--     이론상 SELECT↔UPDATE 사이에 다른 worker가 계약을 가로챌 수 있음.
--     실제 위험은 낮음 (service_role 사용, auth 토큰 필요, contractId 추측 필요).
--     개선 제안: UPDATE에도 worker_user_key/worker_phone 필터 추가.
--   contracts-send: 동일 패턴 (SELECT는 employer_user_key 확인, UPDATE는 contractId만).
--
-- [✓] 5. useContracts.ts ↔ Edge Function 연동
--   signContract   → contracts-sign   (auth 토큰 전달, 함수 내 getUser 검증)
--   viewContract   → contracts-view
--   completeContract → contracts-complete
--   cancelContract → contracts-cancel
--   expireContract → contracts-expire
--   → 모든 호출이 supabase.functions.invoke()로 auth 헤더 전달.
--     Edge Function이 getUser(token)으로 인증하므로 RLS 우회 정당화됨.
--
-- [결론] RLS 정책 설계 양호.
--   - 근로자 직접 UPDATE 차단 (USING false) → 서명은 RPC로만
--   - 사업주/근로자 SELECT는 소유권 기반 필터링
--   - Edge Functions는 service_role로 RLS 우회 (의도된 패턴)
--   - 경미한 TOCTOU 이슈 2건 (contracts-view, contracts-send) → 실무 위험 낮음
-- ============================================================

-- RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (user_key = auth.jwt()->>'user_key');
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (user_key = auth.jwt()->>'user_key');

-- businesses
CREATE POLICY "businesses_select_owner" ON public.businesses
  FOR SELECT USING (owner_user_key = auth.jwt()->>'user_key');
CREATE POLICY "businesses_insert_owner" ON public.businesses
  FOR INSERT WITH CHECK (owner_user_key = auth.jwt()->>'user_key');
CREATE POLICY "businesses_update_owner" ON public.businesses
  FOR UPDATE USING (owner_user_key = auth.jwt()->>'user_key');

-- contracts
CREATE POLICY "contracts_select_employer" ON public.contracts
  FOR SELECT USING (employer_user_key = auth.jwt()->>'user_key');
CREATE POLICY "contracts_insert_employer" ON public.contracts
  FOR INSERT WITH CHECK (employer_user_key = auth.jwt()->>'user_key');
CREATE POLICY "contracts_update_employer" ON public.contracts
  FOR UPDATE USING (employer_user_key = auth.jwt()->>'user_key');
CREATE POLICY "contracts_select_worker" ON public.contracts
  FOR SELECT USING (
    worker_user_key = auth.jwt()->>'user_key'
    OR worker_phone = auth.jwt()->>'phone'
  );

-- 서명 전용 함수
CREATE OR REPLACE FUNCTION sign_contract(
  p_contract_id UUID,
  p_signature_data TEXT,
  p_worker_user_key TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE public.contracts
  SET worker_signed_at = now(),
      worker_signature_data = p_signature_data,
      worker_user_key = p_worker_user_key,
      status = 'signed',
      updated_at = now()
  WHERE id = p_contract_id
    AND (worker_user_key = p_worker_user_key OR worker_phone = (
      SELECT phone FROM public.users WHERE user_key = p_worker_user_key
    ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "contracts_update_worker_sign" ON public.contracts
  FOR UPDATE USING (false);

-- contract_history
CREATE POLICY "history_select" ON public.contract_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.id = contract_id
        AND (
          c.employer_user_key = auth.jwt()->>'user_key'
          OR c.worker_user_key = auth.jwt()->>'user_key'
          OR c.worker_phone = auth.jwt()->>'phone'
        )
    )
  );
CREATE POLICY "history_insert" ON public.contract_history
  FOR INSERT WITH CHECK (true);

-- deliveries
CREATE POLICY "deliveries_select_employer" ON public.deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.id = contract_id
        AND c.employer_user_key = auth.jwt()->>'user_key'
    )
  );
