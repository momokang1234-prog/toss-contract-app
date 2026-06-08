import { useState, useCallback } from 'react';
import { IS_MOCK } from '../api/supabase';
import { sendContract as apiSendContract, shareContract } from '../api/smart-messenger';

// Shared mock send function - updates contract status in the mock store
// Imported by useContracts.sendContract as well
export function useDelivery() {
  const [sending, setSending] = useState(false);

  const send = useCallback(async (contractId: string, method: 'sms' | 'push' | 'share') => {
    setSending(true);
    try {
      if (IS_MOCK) {
        await new Promise(r => setTimeout(r, 800));
        console.log(`[Mock] 계약 ${contractId} 전송 완료: ${method}`);
        return { success: true, method };
      }
      if (method === 'share') {
        await shareContract(contractId);
      } else {
        await apiSendContract({ contractId, method });
      }
      return { success: true, method };
    } catch (err) {
      console.error('전송 실패:', err);
      throw err;
    } finally {
      setSending(false);
    }
  }, []);

  return { send, sending };
}
