import { supabase } from './supabase';

export interface SendContractParams {
  contractId: string;
  method: 'sms' | 'push' | 'share';
}

export async function sendContract(params: SendContractParams) {
  const { data, error } = await supabase.functions.invoke('contracts-send', {
    body: { contractId: params.contractId, method: params.method },
  });
  if (error) throw error;
  return data;
}

export async function shareContract(contractId: string) {
  // Toss Share API 사용 (WebView 환경에서만 동작)
  try {
    const { getTossShareLink, share } = await import('@apps-in-toss/web-framework');
    const deepLink = await getTossShareLink(
      `intoss://bossimclockedin/contract/${contractId}`,
      'https://your-app.com/og/contract.png'
    );
    await share({ message: `근로계약서가 도착했습니다. 확인하기: ${deepLink}` });

    // fallback: 클립보드 복사
    const url = `intoss://bossimclockedin/contract/${contractId}`;
    await navigator.clipboard.writeText(url);
    alert('링크가 클립보드에 복사되었습니다.');
  }
}
