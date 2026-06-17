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

export async function shareContract(contractId: string): Promise<{ shared: boolean; copied: boolean }> {
  // Toss Share API 사용 (WebView 환경에서만 동작)
  const url = `intoss://bossimclockedin/contract/${contractId}`;
  let shared = false;
  let copied = false;

  try {
    const { getTossShareLink, share } = await import('@apps-in-toss/web-framework');
    const deepLink = await getTossShareLink(
      url,
      import.meta.env.VITE_OG_IMAGE_URL || '/og-contract.png'
    );
    await share({ message: `근로계약서가 도착했습니다. 확인하기: ${deepLink}` });
    shared = true;
  } catch {
    // Share API unavailable — fall through to clipboard
  }

  try {
    await navigator.clipboard.writeText(url);
    copied = true;
  } catch {
    // Clipboard also unavailable — nothing we can do
  }

  return { shared, copied };
}
