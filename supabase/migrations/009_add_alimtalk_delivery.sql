-- 근로자 알림톡 자동 발송 지원:
-- 1) deliveries.method 에 'alimtalk' 추가 (기존 제약조건은 이름 미지정이라 자동 생성됨 → 동적 조회 후 교체)
-- 2) Solapi 발송 메시지 ID 추적용 provider_message_id 컬럼 추가
DO $$
DECLARE
  v_constraint text;
BEGIN
  SELECT conname INTO v_constraint
  FROM pg_constraint
  WHERE conrelid = 'public.deliveries'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%method%IN%';
  IF v_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.deliveries DROP CONSTRAINT %I', v_constraint);
  END IF;
END $$;

ALTER TABLE public.deliveries
  ADD CONSTRAINT deliveries_method_check
  CHECK (method IN ('sms','push','inbox','share','link','alimtalk'));

ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS provider_message_id TEXT;
-- 클라이언트(getTossShareLink)에서 생성한 https 공유 URL.
-- 서버는 이 URL을 알림톡/SMS 본문에 삽입 — getTossShareLink가 WebView 전용이라
-- 서버에서 자체 조립할 수 없기 때문(Phase 4 조사 결론).
ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS share_url TEXT;
