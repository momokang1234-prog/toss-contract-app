-- Auto-expire contracts after 30 days
SELECT cron.schedule(
  'expire-contracts',
  '0 0 * * *',
  $$
    UPDATE contracts
    SET status = 'expired', updated_at = NOW()
    WHERE status IN ('sent', 'viewed')
    AND sent_at < NOW() - INTERVAL '30 days'
  $$
);
