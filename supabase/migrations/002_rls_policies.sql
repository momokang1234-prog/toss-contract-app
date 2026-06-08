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
