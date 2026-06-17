-- Drop insecure legacy RPC functions
DROP FUNCTION IF EXISTS public.view_contract(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.reject_contract(TEXT, TEXT, TEXT, TEXT);

-- view_contract: internal auth claims validation
CREATE OR REPLACE FUNCTION public.view_contract(
  p_contract_id TEXT
) RETURNS VOID AS $$
DECLARE
  v_user_key TEXT;
  v_phone TEXT;
BEGIN
  v_user_key := auth.jwt()->>'user_key';
  v_phone := auth.jwt()->>'phone';

  IF v_user_key IS NULL AND v_phone IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: user_key or phone claim is missing';
  END IF;

  UPDATE public.contracts
  SET status = 'viewed',
      updated_at = now()
  WHERE id = p_contract_id
    AND status = 'sent'
    AND (
      (v_user_key IS NOT NULL AND worker_user_key = v_user_key)
      OR (v_phone IS NOT NULL AND worker_phone = v_phone)
    );

  IF FOUND THEN
    INSERT INTO public.contract_history (contract_id, action, actor_role, actor_user_key)
    VALUES (p_contract_id, 'viewed', 'worker', v_user_key);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- reject_contract: internal auth claims validation
CREATE OR REPLACE FUNCTION public.reject_contract(
  p_contract_id TEXT,
  p_reason TEXT
) RETURNS VOID AS $$
DECLARE
  v_user_key TEXT;
  v_phone TEXT;
BEGIN
  v_user_key := auth.jwt()->>'user_key';
  v_phone := auth.jwt()->>'phone';

  IF v_user_key IS NULL AND v_phone IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: user_key or phone claim is missing';
  END IF;

  UPDATE public.contracts
  SET status = 'rejected',
      rejection_reason = p_reason,
      updated_at = now()
  WHERE id = p_contract_id
    AND status IN ('sent', 'viewed')
    AND (
      (v_user_key IS NOT NULL AND worker_user_key = v_user_key)
      OR (v_phone IS NOT NULL AND worker_phone = v_phone)
    );

  IF FOUND THEN
    INSERT INTO public.contract_history (contract_id, action, actor_role, actor_user_key)
    VALUES (p_contract_id, 'rejected', 'worker', v_user_key);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
