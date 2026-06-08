import { useState } from 'react';
import { sendContract, shareContract } from '../api/smart-messenger';
import { IS_MOCK } from '../api/supabase';

export function useDelivery() {
  const [sending, setSending] = useState(false);

  const send = async (contractId: string, method: 'sms' | 'push' | 'share') => {
    setSending(true);
    try {
      if (IS_MOCK) {
        await new Promise(r => setTimeout(r, 800));
        console.log(`[Mock] 계약 ${contractId} 전송: ${method}`);
        return;
      }
      if (method === 'share') {
        await shareContract(contractId);
      } else {
        await sendContract({ contractId, method });
      }
    } finally {
      setSending(false);
    }
  };

  return { send, sending };
}
