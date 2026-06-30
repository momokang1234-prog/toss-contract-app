ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_status_check;
ALTER TABLE public.contracts ADD CONSTRAINT contracts_status_check CHECK (status IN ('draft','sent','viewed','signed','completed','cancelled','expired','rejected','change_requested'));
