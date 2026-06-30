CREATE OR REPLACE FUNCTION request_change_contract(p_contract_id TEXT, p_reason TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_contract RECORD;
  v_result JSONB;
BEGIN
  SELECT * INTO v_contract FROM public.contracts WHERE id = p_contract_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION '계약서를 찾을 수 없습니다.';
  END IF;

  IF v_contract.status NOT IN ('sent', 'viewed') THEN
    RAISE EXCEPTION '이 상태에서는 수정 요청할 수 없습니다.';
  END IF;

  UPDATE public.contracts
  SET status = 'change_requested',
      rejection_reason = p_reason,
      updated_at = now()
  WHERE id = p_contract_id
  RETURNING * INTO v_contract;

  INSERT INTO public.contract_history (id, contract_id, action, actor_role, details)
  VALUES (gen_random_uuid()::text, p_contract_id, 'change_requested', 'worker', jsonb_build_object('reason', p_reason));

  v_result := row_to_json(v_contract)::jsonb;
  RETURN v_result;
END;
$$;
