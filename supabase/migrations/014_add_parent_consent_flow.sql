-- 014_add_parent_consent_flow.sql
-- 미성년자 동의(Option B) 플로우 추가

ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS parent_phone TEXT;

ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_status_check;
ALTER TABLE public.contracts ADD CONSTRAINT contracts_status_check CHECK (
  status IN ('draft','sent','viewed','signed','completed','cancelled','expired','rejected','change_requested','pending_parent_consent')
);

-- Database Webhook trigger (호출용 뼈대)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.trigger_parent_consent_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- 상태가 pending_parent_consent로 진입했을 때만 트리거
  IF NEW.status = 'pending_parent_consent' AND OLD.status != 'pending_parent_consent' THEN
    PERFORM net.http_post(
        url := current_setting('app.settings.supabase_url', true) || '/functions/v1/contracts-parent-consent',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key', true)
        ),
        body := jsonb_build_object(
          'type', 'UPDATE',
          'table', 'contracts',
          'schema', 'public',
          'record', row_to_json(NEW),
          'old_record', row_to_json(OLD)
        )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_contract_pending_parent_consent ON public.contracts;
CREATE TRIGGER on_contract_pending_parent_consent
  AFTER UPDATE OF status ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_parent_consent_webhook();
